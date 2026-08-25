import type { Server } from "socket.io";
import { rooms } from "../state/rooms.js";

// Store arrays of timers per room
const hintTimers = new Map<string, NodeJS.Timeout[]>();

export function startHintTimer(io: Server, roomCode: string) {
  const room = rooms.get(roomCode);
  if (!room || !room.currentWord) return;

  clearHintTimer(roomCode);

  const guessTime = room.settings.guessTime || 60;
  // Interval between hints (e.g., every 20s in a 60s game)
  const intervalMs = Math.floor((guessTime / 3) * 1000);

  const word = room.currentWord;

  // Find all letter indices (excluding spaces)
  const validIndices: number[] = [];
  for (let i = 0; i < word.length; i++) {
    if (word[i] !== " ") validIndices.push(i);
  }

  if (validIndices.length === 0) return;

  // Pick two distinct random indices (or 1 if word is single character)
  const firstIndex = validIndices[Math.floor(Math.random() * validIndices.length)];
  const remainingIndices = validIndices.filter((idx) => idx !== firstIndex);
  const secondIndex =
    remainingIndices.length > 0
      ? remainingIndices[Math.floor(Math.random() * remainingIndices.length)]
      : null;

  // Timer 1: First hint (at 1/3 elapsed time)
  const timer1 = setTimeout(() => {
    const currentRoom = rooms.get(roomCode);
    if (!currentRoom || !currentRoom.currentWord) return;

    const drawerSocketId =
      currentRoom.players[currentRoom.currentDrawerIndex]?.socketId;

    const hint1 = currentRoom.currentWord
      .split("")
      .map((char, idx) => (char === " " ? " " : idx === firstIndex ? char : "_"))
      .join("");

    currentRoom.hint = hint1;

    if (drawerSocketId) {
      io.to(roomCode)
        .except(drawerSocketId)
        .emit("word-hint", { hint: hint1 });
    }
  }, intervalMs);

  // Timer 2: Second hint (at 2/3 elapsed time)
  const timer2 = setTimeout(() => {
    const currentRoom = rooms.get(roomCode);
    if (!currentRoom || !currentRoom.currentWord || secondIndex === null) return;

    const drawerSocketId =
      currentRoom.players[currentRoom.currentDrawerIndex]?.socketId;

    // Combine both revealed letters
    const hint2 = currentRoom.currentWord
      .split("")
      .map((char, idx) =>
        char === " " ? " " : idx === firstIndex || idx === secondIndex ? char : "_"
      )
      .join("");

    currentRoom.hint = hint2;

    if (drawerSocketId) {
      io.to(roomCode)
        .except(drawerSocketId)
        .emit("word-hint", { hint: hint2 });
    }
  }, intervalMs * 2);

  hintTimers.set(roomCode, [timer1, timer2]);
}

export function clearHintTimer(roomCode: string) {
  const timers = hintTimers.get(roomCode);
  if (timers) {
    timers.forEach((t) => clearTimeout(t));
    hintTimers.delete(roomCode);
  }
}