import React, { useEffect, useState } from 'react'
import toast from 'react-hot-toast';
import type { RoomData } from '../types/socket';
import { socket } from '../socket/socket';
import { useNavigate } from 'react-router-dom';

const LobbyCard = ({roomCode, roomData} : {roomCode: string , roomData: RoomData}) => {

    const navigate = useNavigate();

    const [copied , setCopied] = useState(false);

        const isHost = socket.id === roomData.hostSocketId;

        useEffect(() => {

            const handleGameStarted = (data: {round:number , drawer:string}) => {
                navigate(`/game/${roomCode}`);
            }

            const handleGameError = (errorMsg: string) => {
                toast.error(errorMsg);
                };

            socket.on("game-started" , handleGameStarted);
            socket.on("game-started" , handleGameError);

            return () => {
                socket.off("game-started", handleGameStarted);
                socket.off("start-game-error", handleGameError);
            }

        }, [navigate]);

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

        // Emit setting updates instantly to server
        const handleUpdateRounds = (newRounds: number) => {
            if(newRounds < 1 || newRounds > 6) return;

            socket.emit("update-room-settings" , {
                roomCode,
                rounds: newRounds,
                guessTime: roomData.guessTime
            });
        };

        const handleUpdateGuessTime = (newGuessTime: number) => {
            if(newGuessTime < 15 || newGuessTime > 120) return;

             socket.emit("update-room-settings" , {
                roomCode,
                rounds: roomData.rounds,
                guessTime: newGuessTime
            });
        };

        const handleStartGame = () => {
            socket.emit("start-game" , {roomCode});
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
                <span className='font-mono text-sm'>DETECTIVES ON THE CASE ({roomData.players.length}/8)</span>

                <ul className='mt-2'>
                    {
                        roomData.players.map((player) => {
                            
                            return (
                            <li key={player.socketId}
                            className='flex items-center gap-5 border border-amber-900/10 p-4'>

                              <div className='flex items-center gap-5'>  
                                {/* player badge */}
                                <span className="flex h-8 w-8 items-center justify-center rounded-full border border-stone-800 text-xs font-mono  text-stone-800">{getInitials(player.username)}</span>

                                {/* player name */}
                                <span className="font-mono text-stone-900">{player.username}</span>
                               </div> 

                                { player.socketId === roomData.hostSocketId && (
                                    <span className="border border-red-800/80 bg-red-950/10 px-2 py-0.5 text-[10px] font-mono tracking-wider text-red-800 uppercase">
                                        LEAD DETECTIVE
                                    </span>
                                )}

                            </li>
                            );
                        })
                    }
                </ul>
            </div>

            {/* Case Parameters -> Settings */}
            <div>
                <span className='text-sm font-mono'>CASE PARAMETERS</span>

                <div className='flex items-center justify-between py-4 border-t border-t-zinc-900/20'>
                    <span>ROUNDS</span>

                    <div className='flex items-center justify-center gap-3'>

                    {/* Update Rounds */}

                    { isHost && 
                        (<button 
                            disabled={roomData.rounds <=1}
                            className='px-3 py-1 font-mono border border-neutral-800 bg-transparent text-neutral-900 
                   cursor-pointer transition-all duration-150 ease-in-out
                   hover:bg-accent hover:text-[#f0ece1] hover:-translate-y-0.5
                   active:translate-y-0 active:scale-95
                   disabled:opacity-30 disabled:cursor-not-allowed disabled:hover:bg-transparent disabled:hover:text-neutral-900 disabled:hover:translate-y-0 '
                      onClick={() => handleUpdateRounds(roomData.rounds-1)}
                      >-</button>)}

                        <span 
                            className={`w-8 text-center font-bold tabular-nums transition-all duration-150 ${
                                isHost ? 'text-lg' : 'text-xl mr-10'
                            }`}
                            >
                            {roomData.rounds}
                        </span>

                    {isHost && 
                        (<button
                        disabled={roomData.rounds >= 6}
                        className='px-3 py-1 font-mono border border-neutral-800 bg-transparent text-neutral-900 
                   cursor-pointer transition-all duration-150 ease-in-out
                   hover:bg-accent hover:text-[#f0ece1] hover:-translate-y-0.5
                   active:translate-y-0 active:scale-95
                   disabled:opacity-30 disabled:cursor-not-allowed disabled:hover:bg-transparent disabled:hover:text-neutral-900 disabled:hover:translate-y-0'
                       onClick={() => handleUpdateRounds(roomData.rounds+1)}
                       >+</button>)}

                    </div>
                </div>

                {/* Update GuessTime */}
                <div className='flex items-center justify-between py-4 border-t border-b border-t-zinc-900/20 border-b-zinc-900/20'>
                    <span>SECONDS TO GUESS</span>

                    <div className='flex items-center justify-center gap-3'>

                    { isHost &&
                        (<button
                            disabled={roomData.guessTime <= 15}
                            className='px-3 py-1 font-mono border border-neutral-800 bg-transparent text-neutral-900 
                   cursor-pointer transition-all duration-150 ease-in-out
                   hover:bg-accent hover:text-[#f0ece1] hover:-translate-y-0.5
                   active:translate-y-0 active:scale-95
                   disabled:opacity-30 disabled:cursor-not-allowed disabled:hover:bg-transparent disabled:hover:text-neutral-900 disabled:hover:translate-y-0'
                        onClick={() => handleUpdateGuessTime(roomData.guessTime - 15)}
                        >-</button>   )} 

                     <span 
                        className={`w-8 text-center font-bold tabular-nums transition-all duration-150 ${
                            isHost ? 'text-lg' : 'text-xl mr-10'
                        }`}
                        >
                        {roomData.guessTime}
                    </span>

                    { isHost &&
                        (<button
                            disabled={roomData.guessTime >= 120}
                            className='px-3 py-1 font-mono border border-neutral-800 bg-transparent text-neutral-900 
                   cursor-pointer transition-all duration-150 ease-in-out
                   hover:bg-accent hover:text-[#f0ece1] hover:-translate-y-0.5
                   active:translate-y-0 active:scale-95
                   disabled:opacity-30 disabled:cursor-not-allowed disabled:hover:bg-transparent disabled:hover:text-neutral-900 disabled:hover:translate-y-0'
                        onClick={() => handleUpdateGuessTime(roomData.guessTime + 15)}
                            >+</button>)}
                    </div>

                </div>

            </div>
            {/* Case parameters end */}
            
            {/* Action Button */}

            { isHost ? 
            (
                <button className='w-full bg-accent text-paper py-4 font-mono font-bold tracking-widest uppercase text-sm border-2 border-neutral-900 shadow-[3px_3px_0px_0px_rgba(23,23,23,1)] cursor-pointer transition-all duration-150 hover:bg-neutral-900 hover:text-paper hover:shadow-[4px_4px_0px_0px_rgba(178,34,34,1)] hover:-translate-x-0.5 hover:-translate-y-0.5 active:translate-x-0 active:translate-y-0 active:shadow-none'
                onClick={handleStartGame}
                >OPEN THE CASE
                </button>
            ) 
            : (
                <button 
                    disabled
                    className="w-full bg-accent/80 text-paper py-4 px-3 font-mono font-bold tracking-wider uppercase text-xs sm:text-sm 
                                border-2 border-neutral-900/80 shadow-[3px_3px_0px_0px_rgba(23,23,23,0.9)] 
                                cursor-not-allowed select-none
                                flex items-center justify-center gap-1"
                    >
                    <span>WAITING FOR LEAD DETECTIVE TO OPEN THE CASE</span>
                    <span className="inline-flex tracking-tight">
                        <span className="animate-pulse">.</span>
                        <span className="animate-pulse [animation-delay:200ms]">.</span>
                        <span className="animate-pulse [animation-delay:400ms]">.</span>
                    </span>
                </button>
                )
            }

        </section>
        
    
  )
}

export default LobbyCard