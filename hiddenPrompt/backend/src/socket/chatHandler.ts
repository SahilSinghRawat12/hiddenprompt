import { Server , Socket } from "socket.io";
import { rooms } from "../state/rooms.js";

export const registerChatHandler = ( io: Server , socket: Socket) => {

    socket.on("send-message" , ({roomCode , message}: {roomCode:string ; message:string}) => {

        const code = roomCode?.trim().toUpperCase();
        const cleanMessage = message?.trim();

        if (!code || !cleanMessage) return;

        const room = rooms.get(code);

            if (!room) return;
        
        // Make sure socket is actually in this room
        if (!socket.rooms.has(code)) return;

            io.to(code).emit("chat-message", {
                username: socket.data.username,
                message: cleanMessage
            });
    });

};