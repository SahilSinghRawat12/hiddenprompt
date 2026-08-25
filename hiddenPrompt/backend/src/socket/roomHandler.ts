import type {Server, Socket} from "socket.io";
import { rooms } from "../state/rooms.js";
import { broadcastRoomState } from "../utils/broadcastRoomState.js";
import { generateRoomCode } from "../utils/generateRoomCode.js";
       

    export const registerRoomHandler = (io: Server , socket: Socket) => {

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
                        socketId: socket.id,
                        score: 0,
                    }
                ],
                settings: {
                    maxRounds: 3,
                    guessTime: 60,
                },                
                timeLeft: 0,
                gameStarted: false,
                currentRound: 0,
                currentDrawerIndex: 0,
                promptOptions: [],
                currentWord: null,
                currentImageUrl: null,
                guessedPlayers: [],
                turnEnded: false,
                hint: null,
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
                socketId: socket.id,
                score: 0
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
                        score: 0
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
    }
        