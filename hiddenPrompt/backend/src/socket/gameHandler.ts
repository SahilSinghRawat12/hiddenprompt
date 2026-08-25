import type { Server, Socket } from "socket.io";
import { rooms } from "../state/rooms.js";
import { broadcastRoomState } from "../utils/broadcastRoomState.js";
import { generateImage } from "../ai/imageGenerator.js";
import { startTurnTimer } from "../game/turnTimer.js";
import { promptGeneratorAi } from "../ai/promptGenerator.js";
import { startHintTimer } from "../game/hintTimer.js";




const words  = [
    "Rocket",
    "Pizza",
    "Dog",
    "Castle",
    "Laptop",
    "Tiger",
    "Dragon",
    "Guitar"
];

function getRandomPrompts(wordPool: string[] , count: number = 4): string[] {
    //create new copy to avoid mutating original array
    const shuffledArray = [...wordPool];

    //fisher yates shuffle algo
    for(let i=shuffledArray.length-1; i>0; i--)
    {
        const j =Math.floor(Math.random() * (i + 1));
        [shuffledArray[i]! , shuffledArray[j]!] = [shuffledArray[j]! , shuffledArray[i]!];
    }

    return shuffledArray.slice(0, count);
}



      export const registerGameHandler = (io: Server , socket: Socket) => { 

        //START GAME
         socket.on("start-game" , ({roomCode}:{roomCode: string}) => {
            const code = roomCode?.trim().toUpperCase();
            const room = rooms.get(code);

            if (!code) {
            socket.emit("start-game-error", "Invalid room code provided.");
            return;
            }

            if(!room) 
            {
                socket.emit("start-game-error" , "Room does not exist");
                return;
            }

            //check if this scket is actually in the room
            if(!socket.rooms.has(code))
            {
                socket.emit("start-game-error" , "You are not in this room");
                return;
            }

            //check if this socket is the host
            if(socket.id !== room.hostSocketId)
            {
                socket.emit("start-game-error" , "You are not the host");
                return;
            }

            //player count check
            if(room.players.length < 2)
            {
                socket.emit("start-game-error" , "At least 2 players are required to start.");
                return;
            }

            //game status check
            if(room.gameStarted)
            {
                socket.emit("start-game-error" , "Game has already started");
                return;
            }

            const prompts = getRandomPrompts(words, 4);
            room.promptOptions = prompts;

            //start game
            room.gameStarted = true;
            room.currentRound = 1;
            room.currentDrawerIndex = 0;

            const drawer = room.players[room.currentDrawerIndex];

            if(!drawer)
            {
                socket.emit("start-game-error", "Drawer not found.");
                return;
            }

            if (!drawer || !drawer.socketId) {
            console.error("No valid drawer found for room:", code);
            return;
             }
            
            // Broadcast game start to everyone in room
            io.to(code).emit("game-started" , {
                round: room.currentRound,
                totalRounds: room.settings.maxRounds,
                drawer: drawer?.username,
                drawerId: drawer?.socketId,
                guessTime: room.settings.guessTime
            });

            console.log("Sending prompts:", room.promptOptions);
            console.log("Drawer socket:", drawer.socketId);
             // Emit secret prompt options ONLY to the drawer
            io.to(drawer?.socketId).emit("prompt-options" , {
                prompts: room.promptOptions
            });

         });

         //send prompt again
         socket.on("get-prompt-options" , (roomCode: string) => {
            if(!roomCode) return;

            const code = roomCode.trim().toUpperCase();
            const room = rooms.get(code);

            if(!room || !room.gameStarted || !socket.rooms.has(code)) return;

            const currentDrawer = room.players[room.currentDrawerIndex];

            if(currentDrawer?.socketId !== socket.id) return;
            
            console.log("Current drawer:", currentDrawer?.socketId);
            console.log("Request socket:", socket.id);

            // Send back the EXISTING prompts saved in the room
            if(room.promptOptions && room.promptOptions.length>0)
            {
                socket.emit("prompt-options" , { prompts: room.promptOptions });
            }
            
        });

        //SELECT PROMPT
        socket.on("select-prompt" , async ( {roomCode , selectedPrompt} : {roomCode:string , selectedPrompt:string} ) => {

            if(!roomCode || !selectedPrompt) return;
             const code = roomCode.trim().toUpperCase();

             const room = rooms.get(code);
            if(!room || !room.gameStarted || !socket.rooms.has(code)) return;

            //prevent double selection
            if(room.currentWord) return; // Word has already been selected for this round

            const currentDrawer = room.players[room.currentDrawerIndex]?.socketId;

            if(currentDrawer !== socket.id) return;

            // check if the prompt is actually in the offered list
            const isValidPrompt = room.promptOptions?.includes(selectedPrompt);
            if(!isValidPrompt) return;

            // Set current word early to lock double-selection
            room.currentWord = selectedPrompt;
            room.promptOptions = [];

            // Notify EVERYONE in the room that image generation has started
            io.to(code).emit("image-generation-started");

            
        try {
                //Generate image
            const image = await generateImage(selectedPrompt);
            const imageData = `data:image/png;base64,${image.toString("base64")}`;

            //All validation passed: Now apply state , updates and broadcast
            room.currentWord = selectedPrompt;
            room.promptOptions = [];  // clear options after choice
            room.currentImageUrl = imageData;

            room.guessedPlayers = [];
            room.turnEnded = false;


            const drawerSocketId = room.players[room.currentDrawerIndex]?.socketId;

            if(!drawerSocketId) return;
            // Notify drawer with full word
            io.to(drawerSocketId).emit("round-started" , {
                word: room.currentWord,
                image: imageData,
                guessTime: room.settings.guessTime,
                drawerId: drawerSocketId
            });

            // Notify guessers with word structure (e.g. length) (excluding drawer) instead of the actual word
            io.to(code).except(drawerSocketId).emit("round-started" , {
                wordLength: room.currentWord.length,
                image: imageData,
                guessTime: room.settings.guessTime,
                drawerId: drawerSocketId,
            });

            startTurnTimer(io , code);
            startHintTimer(io, code);
        }
            catch (error) {
                    console.error("Image generation failed:", error);

                    room.currentWord = null;
                    room.promptOptions = []; // or restore them if you want

                    // Notify room that generation failed so clients can reset loading state
                    io.to(code).emit("image-generation-failed");
                    socket.emit("game-error", "Failed to generate image.");
                }
 
        });

        //CURRENT GAME STATE
        socket.on("get-current-game-state" , (roomCode: string) => {
            if(!roomCode) return;

            const code = roomCode.trim().toUpperCase();
            const room = rooms.get(code);

            if(!room || !room.gameStarted || !socket.rooms.has(code)) return;

            const currentDrawer = room.players[room.currentDrawerIndex];
            const isDrawer = currentDrawer?.socketId === socket.id;

            // --- PHASE 1: Prompt Selection (Before a word is selected) ---
            if(!room.currentWord) {

                  // Drawer is still choosing a prompt
                  if(isDrawer && room.promptOptions.length > 0)
                  {
                    socket.emit("current-game-state", {
                        phase: "prompt-selection",
                        round: room.currentRound,
                        totalRounds: room.settings.maxRounds,
                        drawerId: currentDrawer?.socketId,
                        drawerUsername: currentDrawer?.username,
                        // guessTime: room.settings.guessTime,
                        prompts: isDrawer ? room.promptOptions : []
                    });
                  }else {
                                // Guesser waiting for drawer to pick
                        socket.emit("current-game-state", {
                            phase: "prompt-selection",
                            drawerId: currentDrawer?.socketId,
                        });
                    }
                    return;
                  }

                  // --- PHASE 2: Active Round (After word & image are generated) ---

                if (isDrawer) {
                        socket.emit("current-game-state", {
                        phase: "round",
                        word: room.currentWord,
                        image: room.currentImageUrl,
                        guessTime: room.settings.guessTime,
                        drawerId: currentDrawer?.socketId,
                        round: room.currentRound,
                        timeLeft: room.timeLeft
                    });
                } else {
                    socket.emit("current-game-state", {
                        phase: "round",
                        wordLength: room.currentWord.length,
                        image: room.currentImageUrl,
                        guessTime: room.settings.guessTime,
                        drawerId: currentDrawer?.socketId,
                        round: room.currentRound
                    });
                }
        } );

        // socket.on("restart-game" , async ({roomCode}) => {
        //     const code = roomCode?.trim().toUpperCase();
        //     const room = rooms.get(code);

        //     if(!room) return;

        //     if(socket.id != room.hostSocketId) return;

        //     if(room.gameStarted) return;

        //     //Reset game
        //     room.gameStarted = true;
        //     room.currentRound = 1;
        //     room.currentDrawerIndex = 0;
        //     room.currentWord = null;
        //     room.currentImageUrl = null;
        //     room.promptOptions = [];
        //     room.guessedPlayers = [];
        //     room.turnEnded = false;
        //     room.timeLeft = 0;

        //     //Reset scores
        //     room.players.forEach((player) => {
        //         player.score = 0;
        //     });

        //     //Generate first prompts 
        //     const prompts = await promptGeneratorAi();

        //     if(!prompts || prompts.length !== 4)
        //     {
        //         room.gameStarted = false;
        //         socket.emit("game-error", "Failed to generate prompts.");
        //         return;
        //     }

        //     room.promptOptions = prompts;

        //     const drawer = room.players[0];

        //     if (!drawer) return;

        //     io.to(roomCode).emit("game-started" , {
        //         round: 1,
        //         totalRounds: room.settings.maxRounds,
        //         drawer: drawer.username,
        //         drawerId: drawer.socketId,
        //     });

        //     io.to(drawer.socketId).emit("prompt-options", {
        //         prompts,
        //     });
            
        // })

      }
        