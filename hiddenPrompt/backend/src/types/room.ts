export type RoomUser = {
    username: string;
    socketId: string;
    score: number;
}

export type Room = {
    hostUsername: string;
    hostSocketId: string;
    players: RoomUser[];

    settings: {
        maxRounds: number;
        guessTime: number;
    }

    timeLeft: number;
    gameStarted: boolean;
    currentRound: number;
    currentDrawerIndex: number;
    promptOptions: string[];
    currentWord: string | null;
    currentImageUrl: string | null;
    guessedPlayers: string[];
    turnEnded: boolean;
    hint: string | null;

}