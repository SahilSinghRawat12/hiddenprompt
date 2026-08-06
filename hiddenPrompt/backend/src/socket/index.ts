import { Server , Socket } from "socket.io";
import { generateRoomCode } from "../utils/generateRoomCode.js";

export const broadcastRoomState = (io: Server , roomCode: string)=> 
    {
    const room = rooms.get(roomCode);

    if(!room) return;

    const currentDrawer = room.players[room.currentDrawerIndex];

    io.to(roomCode).emit( "room-updated", {
        roomCode,
        players: room.players,
        hostSocketId: room.hostSocketId,
        rounds: room.settings.maxRounds,
        guessTime: room.settings.guessTime,
        drawerSocketId: currentDrawer?.socketId || "",
        drawerUsername: currentDrawer?.username || ""
    });
}

type RoomUser = {
    username: string;
    socketId: string;
}

type Room = {
    hostUsername: string;
    hostSocketId: string;
    players: RoomUser[];

    settings: {
        maxRounds: number;
        guessTime: number;
    }
    

    gameStarted: boolean;
    currentRound: number;
    currentDrawerIndex: number;
    promptOptions: string[];
    currentWord: string | null;

}

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

 const rooms = new Map<string , Room>();

export const registerSocketEvents = (io: Server) => {

    io.on("connection" , (socket: Socket) => {
        console.log("Server is connected to Client", socket.id);

        //create room
        socket.on("create-room" , ({username} : {username: string}) => {

            const sanitizedUsername = username?.trim();

            if (!sanitizedUsername) {
                socket.emit("join-error", "Username cannot be empty"); // or "create-error"
                return;
            }
            
            //generating random character 
            let roomCode = generateRoomCode();
            
            // If the roomCode already exists then generate code again
            while(rooms.has(roomCode))
            {
                roomCode = generateRoomCode();
            }

            // create room and set host
            rooms.set(roomCode , {
                hostUsername: sanitizedUsername,
                hostSocketId: socket.id,
                players: [
                    {
                        username: sanitizedUsername,
                        socketId: socket.id
                    }
                ],
                settings: {
                    maxRounds: 3,
                    guessTime: 60,
                },                
                gameStarted: false,
                currentRound: 0,
                currentDrawerIndex: 0,
                promptOptions: [],
                currentWord: null
            });
            
            // join socket room and notify client
            socket.join(roomCode);

            //saving socket information
            socket.data.currentRoom = roomCode;
            socket.data.username = sanitizedUsername;

            socket.emit("room-created" , {roomCode});
            broadcastRoomState(io, roomCode);

        });


        //GET ROOM STATE
        socket.on("get-room-state" , (room: string) => {
            if(!rooms.has(room))
            {
                return;
            }
            
            broadcastRoomState(io , room);
        });

         
        //JOIN ROOM
         socket.on("join-room" , ({username, room}: {username: string , room: string}) => {

            const sanitizedUsername = username?.trim();
            const roomCode = room?.trim().toUpperCase();

            // Validation
            if (!sanitizedUsername) {
                socket.emit("join-success", { success: false, message: "Username cannot be empty"}); // or "create-error"
                return;
            }

            if (!roomCode) {
                socket.emit("join-success", { success: false, message: "Room code is required" });
                return;
            }
            
            //check if target room exists
            const targetRoom = rooms.get(roomCode);

            if(!targetRoom)
            {
                socket.emit("join-success", { success: false, message: "Room not found"});
                return;
            }

            //check if username already exists in the target room
            const userNameExists = targetRoom.players.some(
                (u) => u.username.toLowerCase() === sanitizedUsername.toLowerCase()
            );

            if(userNameExists)
            {
                socket.emit("join-success", { success: false, message: "Username already taken in this room" });
                return;
            }

            // leave previous room (both socket io room and map)
            if(socket.data.currentRoom)
            {
                const oldRoomCode = socket.data.currentRoom;  //if user joined another room then current room becomes old room
                const oldRoomData = rooms.get(oldRoomCode);  // we take the data from oldroom
                
                if(oldRoomData)
                {
                    oldRoomData.players = oldRoomData.players.filter(
                        (u) => u.socketId !== socket.id
                    )

                    if(oldRoomData.players.length === 0)
                    {
                        rooms.delete(oldRoomCode);
                    } else {
                        //transfer host if host has left
                        if (oldRoomData.hostSocketId === socket.id) {
                            oldRoomData.hostSocketId = oldRoomData.players[0]!.socketId;
                        }
                        // Notify old room users that player left
                        socket.to(oldRoomCode).emit("user-left", `${socket.data.username || "A user"} left the room`);
                        broadcastRoomState(io, oldRoomCode);
                    }
                }

                socket.leave(oldRoomCode);                
            }

            //add player to target room
            targetRoom.players.push({
                username: sanitizedUsername,
                socketId: socket.id
            })

            socket.join(roomCode);

            socket.data.currentRoom = roomCode;
            socket.data.username = sanitizedUsername;



            //send data to yourself -> Emit success response to the joining client
            socket.emit("join-success" , {success: true, roomCode})
            //send data to others except yourself
            socket.to(roomCode).emit("user-joined" , `${sanitizedUsername} joined the room`);
            
            broadcastRoomState(io, roomCode);
         });


         //RECONNECT ROOM (Handles Refresh)
         socket.on("reconnect-room", ({ username, roomCode }: { username: string; roomCode: string }) => {
            const sanitizedUsername = username?.trim();
            const code = roomCode?.trim().toUpperCase();

            if (!sanitizedUsername || !code) {
                socket.emit("join-success", { success: false, message: "Invalid reconnect parameters." });
                return;
            }

            const targetRoom = rooms.get(code);

            // If room expired or doesn't exist
            if (!targetRoom) {
                socket.emit("join-success", { success: false, message: "Room no longer exists." });
                return;
            }

            // Check if player was already in room
            const existingPlayer = targetRoom.players.find(
                (p) => p.username.toLowerCase() === sanitizedUsername.toLowerCase()
            ) 

            if(existingPlayer)
            {
                // Update player's socketId to the newly reconnected socket
                existingPlayer.socketId = socket.id;

            } else 
                {
                    // If they weren't in the list (e.g. server restarted or timed out), re-add them
                    targetRoom.players.push({
                        username: sanitizedUsername,
                        socketId: socket.id,
                    });
                }

                // Transfer host socketId if they were the host
                if(targetRoom.hostUsername.toLowerCase() === sanitizedUsername.toLowerCase())
                {
                    targetRoom.hostSocketId = socket.id;
                } 

            // Attach current room and username to socket data
                    socket.join(code);
                    socket.data.currentRoom = code;
                    socket.data.username = sanitizedUsername;

            socket.emit("reconnect-success");

            // Send immediate update to everyone in room including the reconnected client
                broadcastRoomState(io, code);

         });

         // UPDATE ROOM SETTINGS (Host Only)
         socket.on("update-room-settings" , ({ roomCode, rounds, guessTime }: {roomCode: string , rounds: number ; guessTime: number}) => {
            
             const code = roomCode?.trim().toUpperCase();
             const room = rooms.get(code);


             if (!code) {
            socket.emit("error-message", "Invalid room code provided.");
            return;
            }

             if(!room) {
                socket.emit("error-message", "Room does not exist");
                return;
             }

             //verify if the request is actually the host
             if(room.hostSocketId !== socket.id)
             {
                socket.emit("error-message", "Only the host can update room settings.");
                return;
             }

             //validate values
             if( rounds!=undefined )
             {
                //kepp rounds between 1 to 6
                room.settings.maxRounds = Math.max(1, Math.min(6, rounds));
             }

             if (guessTime !== undefined) {
                // Keeps guess time between 15 and 120 seconds
                room.settings.guessTime = Math.max(15, Math.min(120, guessTime));
            }

            // Broadcast updated state to all connected clients in the room
                broadcastRoomState(io, code);
            
         });

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
                totalRound: room.settings.maxRounds,
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

            if(!room || !room.gameStarted) return;

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
        socket.on("select-prompt" , ( {roomCode , selectedPrompt} : {roomCode:string , selectedPrompt:string} ) => {

            if(!roomCode || !selectedPrompt) return;
             const code = roomCode.trim().toUpperCase();

             const room = rooms.get(code);
            if(!room || !room.gameStarted) return;

            //prevent double selection
            if(room.currentWord) return; // Word has already been selected for this round

            const currentDrawer = room.players[room.currentDrawerIndex]?.socketId;

            if(currentDrawer !== socket.id) return;

            // check if the prompt is actually in the offered list
            const isValidPrompt = room.promptOptions?.includes(selectedPrompt);
            if(!isValidPrompt) return;

            //All validation passed: Now apply state , updates and broadcast
            room.currentWord = selectedPrompt;
            room.promptOptions = [];  // clear options after choice

            // Notify drawer with full word
            socket.emit("round-started" , {
                word: room.currentWord,
                guessTime: room.settings.guessTime
            });

            // Notify guessers with word structure (e.g. length) instead of the actual word
            socket.to(code).emit("round-started" , {
                wordLength: room.currentWord.length,
                guessTime: room.settings.guessTime
            });
 
        });

        //DISCONNECT
        socket.on("disconnect" , () => {
           const roomCode = socket.data.currentRoom;
           const username = socket.data.username;

           if(!roomCode) return;

           const roomData = rooms.get(roomCode);

           if(!roomData) return;

           setTimeout(() => {

            // Fetch the freshest room state from the Map inside the timeout
            const room = rooms.get(roomCode);

            if(!room) return;

           // Find this specific player in the room list
           const player = room.players.find(
            (p) => p.username.toLowerCase() === username.toLowerCase()
           );

           // If the player is no longer in the room, stop here
             if (!player) return;

            // Check if the player reconnected during the 2-second period

            // If their room entry now has a NEW socket.id, they reconnected! -> Player has a different socket now
           if(player.socketId !== socket.id)
           {
            return;
           }

           // If socket IDs match, they didn't reconnect — remove them from the player list
           room.players = room.players.filter(
            (p) => p.socketId !== socket.id
           );

           //If no players are left, delete the empty room
           if(room.players.length === 0)
           {
            rooms.delete(roomCode);
            console.log("Deleted empty room:", roomCode);
            console.log(rooms);
           } else {
            // If the host disconnected, pass leadership to the next player in line
            if(room.hostUsername.toLowerCase() === username.toLowerCase())
            {
                room.hostUsername = room.players[0]!.username;
                room.hostSocketId = room.players[0]!.socketId;
            }
              // Notify remaining users and push updated room state
           socket.to(roomCode).emit("user-left" , `${username || "A user"} left the room`);
           broadcastRoomState(io , roomCode);
           }
           
           },2000);
           

        });

      

    });
}

