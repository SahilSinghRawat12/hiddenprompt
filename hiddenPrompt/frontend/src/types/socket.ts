export type RoomUser = {
    username: string;
    socketId: string;
}

export interface RoomData {
  hostSocketId: string;
    players: RoomUser[];
    rounds: number;
    guessTime: number;
}
