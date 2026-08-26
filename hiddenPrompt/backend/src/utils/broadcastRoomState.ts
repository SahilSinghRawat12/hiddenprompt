import type { Server } from "socket.io";
import { rooms } from "../state/rooms.js";
    
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
        currentRound: room.currentRound,
        drawerUsername: currentDrawer?.username || ""
    });
}
