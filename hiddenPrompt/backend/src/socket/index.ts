import { Server , Socket } from "socket.io";

//
export const registerSocketEvents = (io: Server) => {
    io.on("connection" , (socket: Socket) => {
        console.log("Server is connected to Client", socket.id);
        
         socket.on("ping" , (msg)=> {
            console.log(msg);

            socket.emit("pong" , "PONG")
        })
        
        socket.on("disconnect" , () => {
            console.log("client disconnected", socket.id);
        })
    })
}

