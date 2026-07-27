import { Server , Socket } from "socket.io";
import { generateRoomCode } from "../utils/generateRoomCode.js";

export const broadcastRoomState = (io: Server , roomCode: string)=> 
    {
    const room = rooms.get(roomCode);

    if(!room) return;

    io.to(roomCode).emit( "room-updated", {
        roomCode,
        players: room.players,
        hostSocketId: room.hostSocketId,
        rounds: room.rounds,
        guessTime: room.guessTime
    });
}

type RoomUser = {
    username: string;
    socketId: string;
}

type Room = {
    hostSocketId: string;
    players: RoomUser[];
    rounds: number;
    guessTime: number;
}

 const rooms = new Map<string , Room>();

export const registerSocketEvents = (io: Server) => {

    io.on("connection" , (socket: Socket) => {
        console.log("Server is connected to Client", socket.id);

        //create room
        socket.on("create-room" , ({username} : {username: string}) => {

            if (!username?.trim()) {
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
                hostSocketId: socket.id,
                players: [
                    {
                        username,
                        socketId: socket.id
                    }
                ],
                rounds: 6,
                guessTime: 30
            });
            
            // join socket room and notify client
            socket.join(roomCode);

            //saving socket information
            socket.data.currentRoom = roomCode;
            socket.data.username = username;

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
            socket.to(room).emit("user-joined" , `${sanitizedUsername} joined the room`);
            
            broadcastRoomState(io, room);
         });

        //DISCONNECT
        socket.on("disconnect" , () => {
           const roomCode = socket.data.currentRoom;

           if(!roomCode) return;

           const roomData = rooms.get(roomCode);

           if(!roomData) return;

           //Filter out the disconnected player from the players array
           roomData.players = roomData.players.filter(
            (u) => u.socketId !== socket.id
           );

           //If no players are left, delete the room
           if(roomData.players.length === 0)
           {
            rooms.delete(roomCode);
           } else {
            // If the host disconnected, pass leadership to the next player in line
            if(roomData.hostSocketId === socket.id)
            {
                roomData.hostSocketId = roomData.players[0]!.socketId;
            }
              // Notify remaining users and push updated room state
           socket.to(roomCode).emit("user-left" , `${socket.data.username || "A user"} left the room`);
           broadcastRoomState(io , roomCode);
           }

        });

      

    });
}

