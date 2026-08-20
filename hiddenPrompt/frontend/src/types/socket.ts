export type RoomUser = {
    username: string;
    socketId: string;
    score: number;
}

export interface RoomData {
  hostSocketId: string;
    players: RoomUser[];
    rounds: number;
    guessTime: number;
}
