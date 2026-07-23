
export function generateRoomCode():string {

    const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
            let roomCode = "";

            for(let i=0;i<5;i++)
            {
                const randomIndex = Math.floor(Math.random() * chars.length);
                roomCode += chars.charAt(randomIndex);
            };

            return roomCode;
}