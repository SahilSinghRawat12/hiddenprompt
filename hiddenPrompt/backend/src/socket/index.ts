import { Server , Socket } from "socket.io";
import { generateRoomCode } from "../utils/generateRoomCode.js";

export const broadcastRoomState = (io: Server , room: string)=> 
    {
    const players = rooms.get(room);

    if(!players) return;

    io.to(room).emit( "room-updated", {
        roomCode: room,
        players
    });
}

type RoomUser = {
    username: string;
    socketId: string;
}

 const rooms = new Map<string , RoomUser[]>();

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
                generateRoomCode();
            }

            // create room and set host
            rooms.set(roomCode , [{ username , socketId: socket.id }]);
            
            // join socket room and notify client
            socket.join(roomCode);
            socket.emit("room-created" , {roomCode});

        });
         
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
                rooms.set(room , []);
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

