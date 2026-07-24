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

            broadcastRoomState(io, roomCode);

            socket.emit("room-created" , {roomCode});

        });

        //get room-state
        socket.on("get-room-state" , (room: string) => {
            if(!rooms.has(room))
            {
                return;
            }

            broadcastRoomState(io , room)
        })
         
        //join room
         socket.on("join-room" , ({user, room}: {user: string , room: string}) => {

            // leave previous room (both socket io room and map)
            if(socket.data.currentRoom)
            {
                const oldRoom = socket.data.currentRoom;  //if user joined another room then current room becomes old room
                const oldUsers = rooms.get(oldRoom);  // we take the users from oldroom
                
                if(oldUsers)
                {
                    const updatedUsers = oldUsers.filter((u) => u.socketId !== socket.id) ;

                    if(updatedUsers.length === 0)
                    {
                        rooms.delete(oldRoom);
                    } else {
                        rooms.set(oldRoom , updatedUsers)
                    }
                }

                socket.leave(oldRoom);                
            }

            //create room if needed
            if(!rooms.has(room))
            {
                socket.emit("join-error", "Room not found");
                return;
            }

            const users = rooms.get(room)!  ;

            const userNameExists = users.some(
                (u) => u.username === user
            )

            if(userNameExists)
            {
                socket.emit("join-error", "UserName already exists inside the room");
                return;
            }

            users.push({
                username: user,
                socketId: socket.id
            });

            socket.join(room);

            socket.data.currentRoom = room;
            socket.data.username = user;

            //send data to yourself
            socket.emit("user-joined" , `You joined room: ${room}`);
            socket.emit("join-success" , {success: true, room: room})
            //send data to others except yourself
            socket.to(room).emit("user-joined" , `${user} joined the room`);
            
            broadcastRoomState(io, room);
         
         });
        
        socket.on("disconnect" , () => {
           const room = socket.data.currentRoom;

           if(!room) return;

           const users = rooms.get(room);

           if(!users) return;

           const updatedUsers = users.filter(
            (u) => u.socketId !== socket.id
           );

           if(updatedUsers.length === 0)
           {
            rooms.delete(room);
           } else {
             rooms.set(room , updatedUsers);
           }

           socket.to(room).emit("user-left" , `${socket.data.username} left the room`)
           broadcastRoomState(io , room);

        });

    })
}

