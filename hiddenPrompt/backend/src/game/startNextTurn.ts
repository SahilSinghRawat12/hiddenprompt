import { Server } from "socket.io"
import { rooms } from "../state/rooms.js"
import { promptGeneratorAi } from "../ai/promptGenerator.js";
import { restartGame } from "./restartGame.js";




export async function startNextTurn(io: Server , roomCode: string) {

    const room = rooms.get(roomCode);

    if (!room || !room.gameStarted) return;

    // Move to next player
    room.currentDrawerIndex++;

     // Check if everyone has had a turn
    if(room.currentDrawerIndex >= room.players.length)
    {
        room.currentDrawerIndex = 0;
        room.currentRound++;

        if (room.currentRound > room.settings.maxRounds) {
             
            room.gameStarted = false;
            room.timeLeft = 0;
            room.hint = null;

            io.to(roomCode).emit("game-over", {
                scores: room.players.map((player) => ({
                    username: player.username,
                    score: player.score,
                })),
            });

            //5-second restart countdown
            for(let i=5;i>=1;i--)
            {

                //Room may have been deleted during countdown
                if(!rooms.has(roomCode)) return;

                io.to(roomCode).emit("game-restart-countdown", {
                    timeLeft: i,
                });

                await new Promise((resolve) => setTimeout(resolve , 1000));

                
            }

            // Safely restart game
            try {
                    await restartGame(io, roomCode);
                } catch (err) {
                    console.error("Failed to restart game automatically:", err);
                    io.to(roomCode).emit("game-error", "Failed to restart game.");
                }

            return;
            
        }
    }

     const nextDrawer = room.players[room.currentDrawerIndex];

      if (!nextDrawer) return;

      // Reset turn state
        room.currentWord = null;
        room.currentImageUrl = null;
        room.promptOptions = [];
        room.guessedPlayers = [];
        room.turnEnded = false;
        room.timeLeft = 0;
        room.hint = null;

    //Generate new prompt
      const prompts = await promptGeneratorAi();

      if(!prompts || prompts.length !== 4) {
        io.to(roomCode).emit("game-error", "Failed to generate prompts.");
        return;
      }

      room.promptOptions = prompts;

      // Tell everyone who is drawing
      io.to(roomCode).emit("turn-started" , {
        round: room.currentRound,
        drawerId: nextDrawer.socketId,
        drawerUsername: nextDrawer.username,
        // guessTime: room.settings.guessTime
      });

      //GIve prompts only to drawer
      io.to(nextDrawer.socketId).emit("prompt-options", {
        prompts
    });

}