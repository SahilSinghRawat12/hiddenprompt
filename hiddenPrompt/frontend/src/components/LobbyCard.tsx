import React, { useState } from 'react'
import toast from 'react-hot-toast';


interface Players {
    username: string;
    socketId: string;
}

const LobbyCard = ({roomCode, players} : {roomCode: string , players: Players[]}) => {

    const [copied , setCopied] = useState(false);

       const getInitials = (name:string) => {
        if (!name) return "";
        return name
            .split(" ")
            .map((word) => word.replace(/[^a-zA-Z]/g, "")[0])
            .filter(Boolean)
            .join("")
            .slice(0, 2)
            .toUpperCase();
        };

        const handleCopy = async () => {
            // copy text to clipboard
            try {
                await navigator.clipboard.writeText(roomCode);
    
                setCopied(true);
    
                setTimeout(() => {
                    setCopied(false);
                } , 2000);
    
                toast.success("Room Code Copied Successfully" , {
                    duration: 2000,
                    position: 'bottom-right'
                });
            } catch (error) {
                console.error("Failed to copy room code:", error);
                toast.error("Failed to copy room code");
            }
        };

  return (
        
        <section className='min-h-screen w-full max-w-xl flex flex-col gap-8 text-ink bg-[#e9dfc4] p-12 relative '>

            {/* case file stamp */}
            <div className='absolute -top-3 left-8 bg-accent text-paper px-3 py-1 font-mono text-xs tracking-wider uppercase shadow-sm border border-accent -rotate-1'>
                CASE FILE — OPEN
            </div>

            {/* Room Code Header */}
            <div className='flex justify-between items-center'>
                <div className='flex flex-col gap-3 items-center'>
                    <span className='font-mono text-sm'>ROOM CODE</span>
                    <span className='text-5xl font-display tracking-wider'>{roomCode}</span>
                </div>

                <button className='border px-4 py-2 text-sm font-mono cursor-pointer'
                onClick={handleCopy}>{copied ? "COPIED ✓" : "COPY CODE"}</button>
            </div>

            {/* Players */}
            <div>
                <span className='font-mono text-sm'>DETECTIVES ON THE CASE (3/8)</span>

                <ul className='mt-2'>
                    {
                        players.map((player) => (
                            
                            <li key={player.socketId}
                            className='flex items-center gap-5 border border-amber-900/10 p-4'>

                                {/* player badge */}
                                <span className="flex h-8 w-8 items-center justify-center rounded-full border border-stone-800 text-xs font-mono  text-stone-800">{getInitials(player.username)}</span>

                                {/* player name */}
                                <span className="font-mono text-stone-900">{player.username}</span>
                            </li>
                        ))
                    }
                </ul>
            </div>

            {/* Case Parameters -> Settings */}
            <div>
                <span className='text-sm font-mono'>CASE PARAMETERS</span>

                <div className='flex items-center justify-between py-4 border-t border-t-zinc-900/20'>
                    <span>ROUNDS</span>

                    <div className='flex items-center justify-center gap-3'>
                        <button className='cursor-pointer border px-2 '>-</button>
                        <span className='w-8 text-center tabular-nums'>6</span>
                        <button className='cursor-pointer border px-2'>+</button>
                    </div>
                </div>

                <div className='flex items-center justify-between py-4 border-t border-b border-t-zinc-900/20 border-b-zinc-900/20'>
                    <span>SECONDS TO GUESS</span>

                    <div className='flex items-center justify-center gap-3'>
                        <button className='cursor-pointer border px-2 '>-</button>
                        <span className='w-8 text-center tabular-nums'>30</span>
                        <button className='cursor-pointer border px-2'>+</button>
                    </div>

                </div>

            </div>
            {/* Case parameters end */}
            
            <button className='bg-accent text-paper py-4 font-mono cursor-pointer text-sm'>OPEN THE CASE</button>

        </section>
        
    
  )
}

export default LobbyCard