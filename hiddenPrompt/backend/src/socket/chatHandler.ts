import { Server, Socket } from "socket.io";
import { rooms } from "../state/rooms.js";
import { broadcastRoomState } from "../utils/broadcastRoomState.js";
import { endTurn } from "../game/endTurns.js";

export const registerChatHandler = (io: Server, socket: Socket) => {
  
  socket.on("send-message", ({ roomCode, message }: { roomCode: string; message: string }) => {
    const code = roomCode?.trim().toUpperCase();
    const cleanMessage = message?.trim();

    if (!code || !cleanMessage) return;

    const room = rooms.get(code);
    if (!room) return;

    // Verify socket belongs to this room
    if (!socket.rooms.has(code)) return;

    // Determine current drawer's socket ID
    const currentDrawer = room.players[room.currentDrawerIndex];
    const isDrawer = currentDrawer?.socketId === socket.id;

    // Prevent drawer from guessing
    if (isDrawer) return;

    const isCorrect =
      room.currentWord &&
      cleanMessage.toLowerCase() === room.currentWord.toLowerCase();

    if (isCorrect) {
      // Prevent duplicate scoring in the same round
      if (room.guessedPlayers.includes(socket.id)) return;

      room.guessedPlayers.push(socket.id);

      // 1. Award points to Guesser
      const guesser = room.players.find((p) => p.socketId === socket.id);

      // Calculate points based on remaining time
                const maxTime = room.settings.guessTime;
                const timeLeft = room.timeLeft ?? 0;

       const points = Math.max(
                    10,
                    Math.round(
                        (timeLeft / maxTime) * 150
                    )
                );

      if (guesser) {
        guesser.score += points;
      }

      // 2. Award points to Drawer for a successful guess
      if (currentDrawer) {
        currentDrawer.score += 50;
      }

      // Broadcast system notification for correct guess
      io.to(code).emit("chat-message", {
        sender: "System",
        text: `${socket.data.username || "A detective"} guessed the word correctly! +${points} points`,
        isSystem: true,
      });

      // Broadcast updated room state so leaderboards reflect new scores immediately
      broadcastRoomState(io, code);

      // CHECK IF ALL GUESSERS HAVE GUESSED CORRECTLY
      const guessersCount = room.players.length - 1;
      if (room.guessedPlayers.length >= guessersCount) {
        endTurn(io, code);
      }

      return;
    }

    // Regular chat broadcast
    io.to(code).emit("chat-message", {
      sender: socket.data.username,
      text: cleanMessage,
      isSystem: false,
    });
  });
};