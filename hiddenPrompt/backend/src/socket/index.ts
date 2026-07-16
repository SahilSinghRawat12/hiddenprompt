import { Server , Socket } from "socket.io";

type RoomUser = {
    username: string;
    socketId: string;
}

 const rooms = new Map<string , RoomUser[]>();

export const registerSocketEvents = (io: Server) => {

    io.on("connection" , (socket: Socket) => {
        console.log("Server is connected to Client", socket.id);
         
        
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

            const users = rooms.get(room)!;

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

            socket.emit("user-joined", `You joined ${room}`);
            
            socket.to(room).emit(
                "user-joined",
                 `${user} joined ${room}`   
            );
         
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

        });

    })
}

