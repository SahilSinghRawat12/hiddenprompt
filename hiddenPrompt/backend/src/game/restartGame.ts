import { Server } from "socket.io";
import { rooms } from "../state/rooms.js";
import { promptGeneratorAi } from "../ai/promptGenerator.js";

export async function restartGame( io: Server,roomCode: string ) {
    const room = rooms.get(roomCode);

    if (!room) return;

    // Reset scores
    room.players.forEach((player) => {
        player.score = 0;
    });

    room.gameStarted = true;
    room.currentRound = 1;
    room.currentDrawerIndex = 0;

    room.currentWord = null;
    room.currentImageUrl = null;
    room.promptOptions = [];
    room.guessedPlayers = [];
    room.turnEnded = false;
    room.timeLeft = 0;

    

    const prompts = await promptGeneratorAi();

    if (!prompts || prompts.length !== 4) {
        room.gameStarted = false;

        io.to(roomCode).emit(
            "game-error",
            "Failed to generate prompts."
        );

        return;
    }

     room.promptOptions = prompts;

    const drawer = room.players[room.currentDrawerIndex];

    if (!drawer) return;

    // Emit room update so all clients get the reset 0 scores
    io.to(roomCode).emit("room-updated", {
        roomCode,
        players: room.players,
        hostSocketId: room.hostSocketId,
        rounds: room.settings.maxRounds,
        guessTime: room.settings.guessTime,
    });

    io.to(roomCode).emit("game-restarted", {
        round: room.currentRound,
        totalRounds: room.settings.maxRounds,
        drawerId: drawer.socketId,
        drawerUsername: drawer.username,
    });

    io.to(drawer.socketId).emit("prompt-options", {
        prompts,
    });

}