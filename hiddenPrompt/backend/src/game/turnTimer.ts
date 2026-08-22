import type { Server } from "socket.io";
import { rooms } from "../state/rooms.js";
import { endTurn } from "./endTurns.js";

const turnTimers = new Map<string , NodeJS.Timeout>();

export function startTurnTimer(io: Server, roomCode: string) {

    const room = rooms.get(roomCode);

    if(!room) return;

    //Clear any existing timer
    clearTurnTimer(roomCode);

    let timeLeft = room.settings.guessTime;

    io.to(roomCode).emit("timer-update" , {
        timeLeft
    });

    const timer = setInterval(() => {
        
        timeLeft--;

        io.to(roomCode).emit("timer-update" , { timeLeft });

        if(timeLeft <= 0)
        {
            clearTurnTimer(roomCode);
            endTurn(io , roomCode);
        }

    }, 1000);

    turnTimers.set(roomCode, timer);
}

export function clearTurnTimer(roomCode: string) {
    const timer = turnTimers.get(roomCode);

    if(timer)
    {
        clearInterval(timer);
        turnTimers.delete(roomCode);
    }
}