import { Server , Socket } from "socket.io";
import { registerRoomHandler } from "./roomHandler.js";
import { registerGameHandler } from "./gameHandler.js";
import { registerChatHandler } from "./chatHandler.js";

 

export const registerSocketEvents = (io: Server) => {

    io.on("connection" , (socket: Socket) => {

        console.log("Client connected", socket.id);

        registerRoomHandler(io , socket);
        registerGameHandler(io , socket);
        registerChatHandler(io , socket);

      

    });
}

