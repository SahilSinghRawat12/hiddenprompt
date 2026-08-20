import { Server } from "socket.io";
import { rooms } from "../state/rooms.js";
import { startNextTurn } from "./startNextTurn.js";


export function endTurn(io: Server, roomCode: string) {
    const room = rooms.get(roomCode);

    if (!room || !room.gameStarted) return;

     // Prevent this turn from ending twice
    if (room.turnEnded) return;

    room.turnEnded = true;

    // Send scoreboard data to everyone
    io.to(roomCode).emit("turn-ended", {
        scores: room.players.map((player) => ({
            username: player.username,
            score: player.score,
        })),
    });

    setTimeout(() => {
        startNextTurn(io, roomCode);
    }, 4000);
}