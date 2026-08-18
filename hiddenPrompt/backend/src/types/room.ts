export type RoomUser = {
    username: string;
    socketId: string;
}

export type Room = {
    hostUsername: string;
    hostSocketId: string;
    players: RoomUser[];

    settings: {
        maxRounds: number;
        guessTime: number;
    }

    gameStarted: boolean;
    currentRound: number;
    currentDrawerIndex: number;
    promptOptions: string[];
    currentWord: string | null;
    currentImageUrl: string | null;
    guessedPlayers: string[];

}