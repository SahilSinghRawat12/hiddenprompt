import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { socket } from "../socket/socket";
import type { RoomUser } from "../types/socket";

// Type definition for room-updated payload
interface RoomStatePayload {
  roomCode: string;
  players: RoomUser[];
  hostSocketId: string;
  drawerSocketId?: string;
  drawerUsername?: string;
  rounds: number;
  guessTime: number;
}

export const GamePage = () => {

    const { roomCode } = useParams< {roomCode: string }>();
    const navigate = useNavigate();

    // Retrieve username from sessionStorage/ localstorage (saved during room join/creation)
    const username = localStorage.getItem("username") || "";

    const [headerData , setHeaderData] = useState({
        round:1,
        timer:15,
        drawerUsername:""
    });

    const [totalRounds , setTotalRounds ] = useState<number>(0);
    const [gamePhase , setGamePhase] = useState<"prompt-selection" | "round" | null>(null);
    const [currentImage, setCurrentImage] = useState("");
    const [currentWord , setCurrentWord] = useState<string>("");
    const [wordLength , setWordLength] = useState<number>(0);

    const [players , setPlayers] = useState<RoomUser[]>([]);
    const [ prompts , setPrompts ] = useState<string[]>([]);
    const [ drawerSocketId , setDrawerSocketId ] = useState<string>("");
    const [isSelectingPrompt, setIsSelectingPrompt] = useState(false);

    

    const [chatInput, setChatInput] = useState("");

    const [chatMessages, setChatMessages] = useState<
    { sender?: string; text: string; isSystem?: boolean }[] >([]);

    const isDrawer = Boolean(socket.id && socket.id === drawerSocketId);

    // console.log("My Socket ID:", socket.id);
    // console.log("Server Drawer Socket ID:", drawerSocketId);
    // console.log("prompts:", prompts);
    // console.log("Is Drawer?", isDrawer);

  
  const getInitials = (name: string) => {
    if (!name) return "";
    return name
      .split(" ")
      .map((word) => word.replace(/[^a-zA-Z]/g, "")[0])
      .filter(Boolean)
      .join("")
      .slice(0, 2)
      .toUpperCase();
  };

  const handleSelectPrompt = (selectedPrompt: string) => {
    socket.emit("select-prompt" , {
      roomCode,
      selectedPrompt
    });

    setIsSelectingPrompt(false);

  }

  const handleSendChat = (e: React.FormEvent) => {
    e.preventDefault();
    if (!chatInput.trim()) return;
    setChatInput("");
  };

  useEffect(() => {

    if(!roomCode) return;

    //Handlers
    const handleGameStarted = (data: {
        round: number, drawer:string, drawerId:string, guessTime:number,totalRounds:number
    }) => {
        setHeaderData((prev) => ({
            ...prev,
            round: data.round,
            drawerUsername: data.drawer,
            timer: data.guessTime
        }));
        
        if(data.totalRounds !== undefined)
        {
          setTotalRounds(data.totalRounds);
        }

        setDrawerSocketId(data.drawerId);
        setIsSelectingPrompt(true);
    };

    const handleRoomUpdated = (data: RoomStatePayload) => {
      //data -> Checks if data is not null or undefined
      //Array.isArray -> Checks if data.players actually exists and is an Array
    if (data && Array.isArray(data.players)) {
        setPlayers(data.players);
      }

      // Update totalRounds state from server
        if (data?.rounds !== undefined) {
          setTotalRounds(data.rounds);
        }

    if(data?.drawerSocketId)
    {
      setDrawerSocketId(data.drawerSocketId);
    }

    if(data?.drawerUsername)
    {
      setHeaderData((prev) => ({
        ...prev,
        drawerUsername: data.drawerUsername!
      }));
    }
  };

  const handlePromptOptions = (data: { prompts: string[] }) => {
    console.log("Received prompt options on client:", data?.prompts);
    if (data?.prompts && Array.isArray(data.prompts)) {
        setPrompts(data.prompts);
        setIsSelectingPrompt(true);
      }
  };

  const handleRoundStarted = (data: {
    word?: string ; wordLength?:number; image: string ; guessTime:number ; drawerId?: string
  }) => {

    setGamePhase("round");

    if(data.image)
    {
      setCurrentImage(data.image);
    }

    setHeaderData((prev) => ({
      ...prev,
      timer: data.guessTime
    }));

    // Primary check (data.drawerId exists): Checks directly against the drawerId sent fresh inside the event payload from the server.
    // Fallback check (data.drawerId is missing): Falls back to comparing against drawerSocketId stored in React state.
   
    if (data.drawerId) {
      setDrawerSocketId(data.drawerId);
    }
    
    const amIDrawer = Boolean(socket.id && (data.drawerId ? socket.id === data.drawerId : socket.id === drawerSocketId));

    if(amIDrawer && data.word)
    {
      setCurrentWord(data.word);
    }
    
    if(data.wordLength)
    {
      setWordLength(data.wordLength);
    }

    setPrompts([]);
    setIsSelectingPrompt(false);
  };

  //Trigger state/prompt fetches ONLY after successful reconnect
  const handleReconnectSuccess = () => {
    socket.emit("get-room-state" , roomCode);
    socket.emit("get-prompt-options" , roomCode);
    socket.emit("get-current-game-state" , roomCode);
  };

  const handleCurrentGameState = (data: {
    phase: "prompt-selection" | "round";
    prompts?: string[];
    word?: string;
    wordLength?: number;
    image?: string;
    guessTime: number;
    drawerId?: string;
  }) => {

    if(data.drawerId)
    {
      setDrawerSocketId(data.drawerId);
    }

    //prompt selection
    if(data.phase === "prompt-selection")
    {
      setPrompts(data.prompts || []);
      setIsSelectingPrompt(true);

      return;
    }

    // ROUND
    if(data.phase === "round")
    {
      setIsSelectingPrompt(false);
      setPrompts([]);

      if(data.guessTime !== undefined)
      {
            setHeaderData((prev) => ({
          ...prev ,
          timer: data.guessTime,
          }));
      }

      if(data.image)
      {
        setCurrentImage(data.image);
      }

      if(data.word)
    {
      setCurrentWord(data.word);
    }

     if(data.wordLength !== undefined)
    {
      setWordLength(data.wordLength);
    }

    }   

  };

  //Listeners
  socket.on("game-started" , handleGameStarted);
  socket.on("room-updated" , handleRoomUpdated);
  socket.on("prompt-options" , handlePromptOptions);
  socket.on("round-started" , handleRoundStarted);
  socket.on("reconnect-success" , handleReconnectSuccess);
   socket.on("current-game-state" , handleCurrentGameState); 
  

// Attempt reconnection on mount / refresh
  socket.emit("reconnect-room", { username, roomCode });
 


    return () => {
        socket.off("game-started", handleGameStarted);
        socket.off("room-updated", handleRoomUpdated);
        socket.off("prompt-options", handlePromptOptions);
        socket.off("round-started", handleRoundStarted);
        socket.off("reconnect-success", handleReconnectSuccess);
        socket.off("current-game-state" , handleCurrentGameState); 
    }
  }, [roomCode, username]);


  return (
    <div className="min-h-screen bg-[#171717] text-[#171717] flex flex-col font-sans p-3 sm:p-5 md:p-6">
      <div className="max-w-7xl w-full mx-auto flex flex-col flex-1 bg-[#e9dfc4] border-2 border-[#171717] shadow-[6px_6px_0px_0px_rgba(23,23,23,1)] relative overflow-hidden">
        
        {/* CASE FILE TOP BADGE STAMP */}
        <div className="absolute -top-1 left-8 bg-[#b22222] text-[#f0ece1] px-3 py-1 font-mono text-xs tracking-wider uppercase shadow-sm border border-[#171717] -rotate-1 z-20">
          EVIDENCE DASHBOARD — ACTIVE CASE
        </div>

        {/* 1. TOP HEADER BAR */}
        <header className="border-b-2 border-[#171717] p-3 sm:p-4 pt-8 sm:pt-6 flex flex-wrap items-center justify-between gap-3 bg-[#dfd4b7]/50">
          <div className="flex flex-wrap items-center gap-3">
            {/* Round Badge */}
            <div className="border border-[#171717] px-2.5 py-1 font-mono text-xs tracking-wider uppercase bg-[#e9dfc4]">
              ROUND <strong className="text-base text-[#b22222]">{headerData.round}</strong> / {totalRounds || 3}
            </div>

            {/* Timer Badge */}
            <div className="border border-[#171717] px-2.5 py-1 font-mono text-xs tracking-wider uppercase bg-[#e9dfc4]">
              TIME REMAINING: <strong className="text-base text-[#171717]">{headerData.timer}S</strong>
            </div>

            {/* Room Code Badge */}
            <div className="border border-[#171717] px-2.5 py-1 font-mono text-xs tracking-wider uppercase bg-[#171717] text-[#e9dfc4]">
              CASE NO: <strong className="text-[#e9dfc4]">{roomCode}</strong>
            </div>

              {/* Showing the word in the drawer sreen */}
            {
              isDrawer && currentWord.length > 0 && (
                <div className="border border-[#171717] px-2.5 py-1 font-mono text-xs tracking-wider uppercase bg-[#e9dfc4]">
                 WORD SELECTED: <strong className="text-base text-[#171717]">{currentWord}</strong>
            </div>
              ) 
            }

            {
               !isDrawer && wordLength>0 && (
                <div className="flex gap-2 justify-center my-4 font-mono text-xl font-bold">
                    {
                      Array.from({ length: wordLength }).map((_ , index) => (
                        <span key={index} className="border-b-2 border-[#171717] w-6 text-center">
                          _
                        </span>
                      ))
                    }
                </div>
               )
            }

           

          </div>

          {/* Current Drawer Banner */}
          <div className="flex items-center gap-2 border border-[#b22222] bg-[#b22222]/10 px-3 py-1 font-mono text-xs tracking-wider uppercase text-[#b22222]">
            <span>SKETCH ARTIST:</span>
            <strong className="underline">{headerData.drawerUsername}</strong>
          </div>
        </header>

        {/* 2. MAIN CONTENT AREA (Flex-1 layout giving slightly more room to Sidebar) */}
        <main className="flex-1 flex flex-col lg:flex-row divide-y-2 lg:divide-y-0 lg:divide-x-2 divide-[#171717]">
          
          {/* LEFT: CANVAS AREA */}
          <div className="flex-1 flex flex-col p-3 sm:p-4 relative bg-[#f4ebd0]/40 min-w-0">
            
            {/* CANVAS BOARD */}
            <div className="relative flex-1 bg-white border-2 border-[#171717] min-h-[400px] lg:min-h-[460px] flex flex-col items-center justify-center shadow-[3px_3px_0px_0px_rgba(23,23,23,1)]">

          {/* AI GENERATED CLUE IMAGE */}
          {currentImage ? (
            <img
              src={currentImage}
              alt="AI generated clue"
              className="max-h-[320px] max-w-full w-auto h-auto object-contain rounded border border-[#171717]"
            />
          ) : (
            /* PLACEHOLDER CANVAS TEXT (Shown when no image is generated yet) */
            <div className="text-center font-mono select-none">
              <span className="text-4xl block mb-2">🎨</span>
              <p className="text-xs uppercase tracking-widest text-zinc-600">
                Evidence Board / Canvas Area
              </p>
              <p className="text-[10px] text-zinc-400 mt-1">
                (Waiting for prompt selection...)
              </p>
            </div>
          )}
                    

              {/* OVERLAY: PROMPT SELECTION (Shown to Drawer) */}
              {isDrawer && prompts.length > 0 && (
                <div className="absolute inset-0 bg-[#171717]/85 backdrop-blur-xs flex flex-col items-center justify-center p-6 z-30">
                  <div className="bg-[#e9dfc4] border-2 border-[#171717] p-6 max-w-md w-full shadow-[6px_6px_0px_0px_rgba(178,34,34,1)] relative">
                    
                    <div className="absolute -top-3 left-4 bg-[#b22222] text-[#f0ece1] px-2 py-0.5 font-mono text-[10px] tracking-widest uppercase border border-[#171717]">
                      CLASSIFIED INSTRUCTION
                    </div>

                    <h3 className="font-display text-2xl tracking-wide uppercase mb-1 text-[#171717]">
                      SELECT A PROMPT TO SKETCH
                    </h3>
                    <p className="font-mono text-xs text-zinc-700 mb-6">
                      The rest of the detectives will attempt to identify your selection.
                    </p>

                    <div className="grid grid-cols-2 gap-3 font-mono">
                      {prompts.map((prompt) => (
                        <button
                          key={prompt}
                          onClick={() => handleSelectPrompt(prompt)}
                          className="border-2 border-[#171717] bg-[#e9dfc4] py-3 px-4 font-bold text-sm tracking-wider uppercase cursor-pointer shadow-[2px_2px_0px_0px_rgba(23,23,23,1)] transition-all hover:bg-[#171717] hover:text-[#e9dfc4] hover:-translate-y-0.5 active:translate-y-0 active:shadow-none"
                        >
                          {prompt}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* WAITING OVERLAY (Shown to Guessers) */}
              {!isDrawer && isSelectingPrompt && (
                <div className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-[#171717] text-[#e9dfc4] border border-[#171717] px-4 py-2 font-mono text-xs uppercase tracking-wider shadow-[3px_3px_0px_0px_rgba(178,34,34,1)] flex items-center gap-2">
                  <span className="w-2 h-2 bg-[#b22222] animate-ping rounded-full" />
                  WAITING FOR <span className="text-[#f0ece1] font-bold">{headerData.drawerUsername}</span> TO SELECT A CASE PROMPT...
                </div>
              )}
            </div>
          </div>

          {/* RIGHT SIDEBAR: PLAYERS & CHAT (Widened slightly: w-full lg:w-80 xl:w-96) */}
          <div className="w-full lg:w-80 xl:w-96 flex flex-col h-[520px] lg:h-auto divide-y-2 divide-[#171717] shrink-0">
            
            {/* PLAYERS LIST */}
            <div className="p-3.5 flex flex-col h-1/2 bg-[#dfd4b7]/30 min-h-0">
              <div className="flex items-center justify-between mb-2.5 border-b border-[#171717]/20 pb-2">
                <span className="font-mono text-xs font-bold tracking-wider uppercase text-zinc-800">
                  DETECTIVES ON CASE
                </span>
                <span className="font-mono text-[11px] font-bold bg-[#171717] text-[#e9dfc4] px-1.5 py-0.5 border border-[#171717]">
                  {players.length}/8
                </span>
              </div>

              <div className="overflow-y-auto space-y-2 pr-1 font-mono flex-1">
                {players.map((player) => {
                  const isCurrentDrawer = player.socketId === drawerSocketId;
                  const isYou = player.socketId === socket.id;

                  return (
                    <div
                      key={player.socketId}
                      className={`flex items-center justify-between gap-2 px-2.5 py-2 border transition-all text-xs ${
                        isCurrentDrawer
                          ? "bg-[#b22222]/10 border-[#b22222] border-l-4 border-l-[#b22222]"
                          : "bg-[#e9dfc4] border-[#171717]/30 hover:border-[#171717]"
                      }`}
                    >
                      {/* Left Group: Badge + Name + Role Tags */}
                      <div className="flex items-center gap-2 min-w-0 flex-1">
                        {/* Initials Badge */}
                        <span className="flex h-6 w-6 items-center justify-center rounded-full border border-[#171717] text-[10px] font-bold bg-[#e9dfc4] text-[#171717] shrink-0">
                          {getInitials(player.username)}
                        </span>

                        {/* Name + Tags Wrapper */}
                        <div className="flex items-center gap-1.5 min-w-0 flex-1">
                          <span 
                            className="truncate font-bold text-[#171717] block" 
                            title={player.username}
                          >
                            {player.username}
                          </span>

                          {isYou && (
                            <span className="text-[10px] font-bold text-zinc-500 shrink-0">
                              (YOU)
                            </span>
                          )}

                          {isCurrentDrawer && (
                            <span className="border border-[#171717] bg-[#171717] text-[8px] px-1 py-0.5 font-semibold text-[#e9dfc4] uppercase tracking-wider shrink-0">
                              ARTIST
                            </span>
                          )}
                        </div>
                      </div>

                      {/* Right Group: Score */}
                      {/* <span className="font-bold border border-[#171717] px-2 py-0.5 bg-[#e9dfc4] text-[11px] text-[#171717] tabular-nums shrink-0 shadow-[1px_1px_0px_0px_rgba(23,23,23,1)]">
                        {player.score} PTS
                      </span> */}
                    </div>
                  );
                })}
              </div>
            </div>

            {/* CHAT / GUESS BOX */}
            <div className="p-3.5 flex flex-col h-1/2 bg-[#e9dfc4] font-mono min-h-0">
              <span className="text-xs font-bold tracking-wider uppercase mb-2 text-zinc-700">
                EVIDENCE LOG / GUESSES
              </span>

              {/* Message Feed */}
              <div className="flex-1 overflow-y-auto space-y-2 text-xs pr-1 mb-3">
                {chatMessages.map((msg, index) => (
                  <div key={index} className="break-words">
                    {msg.isSystem ? (
                      <div className="border border-[#171717]/20 bg-[#171717]/5 p-1.5 text-[10px] text-zinc-600 uppercase tracking-wider text-center">
                        {msg.text}
                      </div>
                    ) : (
                      <p className="text-[#171717]">
                        <strong className="uppercase font-bold me-1">
                          {msg.sender}:
                        </strong>
                        {msg.text}
                      </p>
                    )}
                  </div>
                ))}
              </div>

              {/* Input Form */}
              <form onSubmit={handleSendChat} className="flex gap-2">
                <input
                  type="text"
                  value={chatInput}
                  onChange={(e) => setChatInput(e.target.value)}
                  placeholder={isDrawer ? "Artist cannot guess..." : "TYPE YOUR GUESS..."}
                  disabled={isDrawer}
                  className="flex-1 bg-white border border-[#171717] px-3 py-2 text-xs font-mono text-[#171717] placeholder-zinc-400 focus:outline-none focus:ring-1 focus:ring-[#171717] disabled:opacity-50 disabled:bg-zinc-200"
                />
                <button
                  type="submit"
                  disabled={isDrawer || !chatInput.trim()}
                  className="bg-[#171717] text-[#e9dfc4] border border-[#171717] px-4 py-2 font-mono text-xs font-bold uppercase tracking-wider cursor-pointer hover:bg-[#b22222] hover:border-[#b22222] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  SUBMIT
                </button>
              </form>
            </div>

          </div>
        </main>
      </div>
    </div>
  );
};