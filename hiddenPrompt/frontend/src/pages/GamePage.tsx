import React, { useEffect, useState, useRef } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { socket } from "../socket/socket";
import type { RoomUser } from "../types/socket";
import toast from "react-hot-toast";

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
  const { roomCode } = useParams<{ roomCode: string }>();
  const navigate = useNavigate();

  // Retrieve username from localStorage (saved during room join/creation)
  const username = localStorage.getItem("username") || "";

  const [headerData, setHeaderData] = useState({
    round: 1,
    timer: 0,
    drawerUsername: ""
  });

  const [totalRounds, setTotalRounds] = useState<number>(0);
  const [gamePhase, setGamePhase] = useState<"prompt-selection" | "round" | null>(null);
  const [currentImage, setCurrentImage] = useState("");
  const [currentWord, setCurrentWord] = useState<string>("");
  const [wordLength, setWordLength] = useState<number>(0);

  // State for Round Start Intro Banner
  const [showRoundBanner, setShowRoundBanner] = useState(false);
  const showRoundBannerRef = useRef(false);

  const updateShowRoundBanner = (value: boolean) => {
  showRoundBannerRef.current = value;
  setShowRoundBanner(value);
  };

  const [players, setPlayers] = useState<RoomUser[]>([]);
  const [prompts, setPrompts] = useState<string[]>([]);
  const [drawerSocketId, setDrawerSocketId] = useState<string>("");
  const [isSelectingPrompt, setIsSelectingPrompt] = useState(false);

  const [chatInput, setChatInput] = useState("");
  const [chatMessages, setChatMessages] = useState<
    { sender?: string; text: string; isSystem?: boolean }[]
  >([]);

  const [showScoreboard, setShowScoreboard] = useState(false);
  const [isGeneratingImage, setIsGeneratingImage] = useState(false);
  const [isGeneratingPrompts, setIsGeneratingPrompts] = useState(false);  

  const [scores, setScores] = useState<
    { username: string; score: number }[]
  >([]);

  const [showGameOver, setShowGameOver] = useState(false);
  const [finalScores , setFinalScores] = useState<
  {
    username: string;
    score: number;
  }[]>([]);


  const isDrawer = Boolean(socket.id && socket.id === drawerSocketId);

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
    socket.emit("select-prompt", {
      roomCode,
      selectedPrompt
    });
    setIsSelectingPrompt(false);
  };

  const handleSendChat = (e: React.SubmitEvent) => {
    e.preventDefault();

    if (!chatInput.trim()) return;

    socket.emit("send-message" , { roomCode , message: chatInput});

    setChatInput(""); 
  };

  useEffect(() => {
    if (!roomCode) return;

    const handleGameStarted = (data: {
      round: number;
      drawer: string;
      drawerId: string;
      guessTime: number;
      totalRounds: number;
    }) => {
      setHeaderData((prev) => ({
        ...prev,
        round: data.round,
        drawerUsername: data.drawer,
        // timer: data.guessTime
      }));

      if (data.totalRounds !== undefined) {
        setTotalRounds(data.totalRounds);
      }

      setDrawerSocketId(data.drawerId);

      updateShowRoundBanner(true);
      setIsSelectingPrompt(false);

      setTimeout(() => {
        updateShowRoundBanner(false);
        setIsSelectingPrompt(true);
      }, 2500);
    };

    const handleRoomUpdated = (data: RoomStatePayload) => {
      if (data && Array.isArray(data.players)) {
        setPlayers(data.players);
      }

      if (data?.rounds !== undefined) {
        setTotalRounds(data.rounds);
      }

      if (data?.drawerSocketId) {
        setDrawerSocketId(data.drawerSocketId);
      }

      if (data?.drawerUsername) {
        setHeaderData((prev) => ({
          ...prev,
          drawerUsername: data.drawerUsername!
        }));
      }
    };

    const handlePromptOptions = (data: { prompts: string[] }) => {

      if (data?.prompts && Array.isArray(data.prompts)) {
        setIsGeneratingPrompts(false);
        setPrompts(data.prompts);
        if (!showRoundBannerRef.current) {
          setIsSelectingPrompt(true);
        }
      }
    };

    const handleRoundStarted = (data: {
      word?: string;
      wordLength?: number;
      image: string;
      guessTime: number;
      drawerId?: string;
    }) => {

      // Image has finished generating
      setIsGeneratingImage(false);

      setGamePhase("round");

      if (data.image) {
        setCurrentImage(data.image);
      }

      setHeaderData((prev) => ({
        ...prev,
        // timer: data.guessTime
      }));

      if (data.drawerId) {
        setDrawerSocketId(data.drawerId);
      }

      const amIDrawer = Boolean(
        socket.id && (data.drawerId ? socket.id === data.drawerId : socket.id === drawerSocketId)
      );

      if (amIDrawer && data.word) {
        setCurrentWord(data.word);
      }

      if (data.wordLength) {
        setWordLength(data.wordLength);
      }

      setPrompts([]);
      setIsSelectingPrompt(false);
      setShowRoundBanner(false);
    };

    const handleReconnectSuccess = () => {
      socket.emit("get-room-state", roomCode);
      socket.emit("get-prompt-options", roomCode);
      socket.emit("get-current-game-state", roomCode);
    };

      const handleCurrentGameState = (data: {
      phase: "prompt-selection" | "round";
      prompts?: string[];
      round: number;
      totalRounds: number;
      drawerUsername: string;
      word?: string;
      wordLength?: number;
      image?: string;
      guessTime: number;
      drawerId?: string;
    }) => {
      const activeDrawerId = data.drawerId || drawerSocketId;
      const amIDrawer = Boolean(socket.id && socket.id === activeDrawerId);

      if (data.drawerId) {
        setDrawerSocketId(data.drawerId);
      }

      if (data.phase === "prompt-selection") {
        setHeaderData((prev) => ({
          ...prev,
          round: data.round ?? prev.round,
          drawerUsername: data.drawerUsername ?? prev.drawerUsername,
          timer: data.guessTime ?? prev.timer
        }));

        if (data.totalRounds !== undefined) {
          setTotalRounds(data.totalRounds);
        }

        // 1. Show round banner first
        updateShowRoundBanner(true);
        setIsSelectingPrompt(false);

        // 2. Hide banner and reveal prompts after delay
        setTimeout(() => {
          updateShowRoundBanner(false);

          // Use fresh amIDrawer variable calculated from data.drawerId
          if (amIDrawer) {
            setPrompts(data.prompts || []);
            setIsSelectingPrompt(true);
          } else {
            setIsSelectingPrompt(true);
          }
        }, 2500);

        return;
      }

      if (data.phase === "round") {
        setShowRoundBanner(false);
        setIsSelectingPrompt(false);
        setPrompts([]);

        if (data.guessTime !== undefined) {
          setHeaderData((prev) => ({
            ...prev,
            timer: data.guessTime
          }));
        }

        if (data.image) {
          setCurrentImage(data.image);
        }

        if (data.word) {
          setCurrentWord(data.word);
        }

        if (data.wordLength !== undefined) {
          setWordLength(data.wordLength);
        }
      }
    };

     const handleChatMessage = (data : {
      sender?: string;
      text: string;
      isSystem?: boolean;
    }) => {
        setChatMessages((prev) => [
          ...prev,
          {
            sender: data.sender,
            text: data.text,
            isSystem: data.isSystem
          }
        ]);
    };

    const handleTurnEnded = (data: {
      scores: { username: string; score: number }[];
    }) => {
      setScores(data.scores);
      setShowScoreboard(true);
    };

    const handleTurnStarted = (data: {
      round: number;
    drawerId: string;
    drawerUsername: string;
    guessTime: number;
    }) => {

      setShowScoreboard(false);

      // Clear previous turn
      setCurrentImage("");
      setCurrentWord("");
      setWordLength(0);
      setPrompts([]);

      setIsGeneratingImage(false);
      setIsSelectingPrompt(false);

       setGamePhase("prompt-selection");

       setIsGeneratingImage(true);

      setDrawerSocketId(data.drawerId);

      setHeaderData((prev) => ({
          ...prev,
          round: data.round,
          drawerUsername: data.drawerUsername,
          timer: 0,
      }));

    };

    const handleImageGenerationStarted = () => {
      // Remove old image immediately
        setCurrentImage("");

        // Remove old word/dashes
        setCurrentWord("");
        setWordLength(0);

        // Show loading
        setIsGeneratingImage(true);

        // Prompt selection is finished
        setIsSelectingPrompt(false);
    };

    const handleImageGenerationFailed = () => {
      setIsGeneratingImage(false);

      setCurrentImage("");
      setCurrentWord("");
      setWordLength(0);

      setIsSelectingPrompt(true);

      toast.error("AI image generation failed");
    };


    const handleTimerUpdate= (data: { timeLeft:number }) => {
      setHeaderData((prev) => ({
          ...prev,
          timer: data.timeLeft
        }));
    };

    const handleGameOver = (data: {
      scores: { username: string; score: number }[];
    }) => {
      setShowScoreboard(false);
      setShowGameOver(true);
      setFinalScores(data.scores);
    };

    const handleRestartGame = () => {
      socket.emit("restart-game" , {
        roomCode
      })
    };


    // Attach Listeners
    socket.on("game-started", handleGameStarted);
    socket.on("room-updated", handleRoomUpdated);
    socket.on("prompt-options", handlePromptOptions);
    socket.on("round-started", handleRoundStarted);
    socket.on("reconnect-success", handleReconnectSuccess);
    socket.on("current-game-state", handleCurrentGameState);
    socket.on("chat-message", handleChatMessage);
    socket.on("turn-ended", handleTurnEnded);
    socket.on("turn-started", handleTurnStarted);
    socket.on("image-generation-started",handleImageGenerationStarted);
    socket.on("image-generation-failed",handleImageGenerationFailed);
    socket.on("timer-update", handleTimerUpdate);
    socket.on("game-over", handleGameOver);

    // Reconnect emission
    socket.emit("reconnect-room", { username, roomCode });
    socket.emit("reconnect-success");

    // Cleanup Listeners on unmount
    return () => {
      socket.off("game-started", handleGameStarted);
      socket.off("room-updated", handleRoomUpdated);
      socket.off("prompt-options", handlePromptOptions);
      socket.off("round-started", handleRoundStarted);
      socket.off("reconnect-success", handleReconnectSuccess);
      socket.off("current-game-state", handleCurrentGameState);
      socket.off("chat-message", handleChatMessage);
      socket.off("turn-ended", handleTurnEnded);
      socket.off("turn-started", handleTurnStarted);
      socket.off("image-generation-started",handleImageGenerationStarted);
      socket.off("image-generation-failed",handleImageGenerationFailed);
      socket.off("timer-update", handleTimerUpdate);
      socket.off("game-over", handleGameOver);
    };
  }, [roomCode, username]);

  return (
    <div className="min-h-screen bg-[#171717] text-[#171717] flex flex-col font-sans p-3 sm:p-5 md:p-6">
      
      {/* FINAL RESULT OVERLAY */}
      {showGameOver && (
        <div className="fixed inset-0 z-[100] bg-[#171717]/90 flex items-center justify-center">
          <div className="bg-[#e9dfc4] border-4 border-[#171717] p-8 w-full max-w-lg">
            <h2 className="font-display text-4xl font-black uppercase">
              CASE CLOSED
            </h2>

            <p className="font-mono text-xs mt-2 mb-6">
              FINAL RESULTS
            </p>

            <div className="space-y-3">
              {finalScores
                .sort((a, b) => b.score - a.score)
                .map((player, index) => (
                  <div
                    key={player.username}
                    className="flex justify-between border border-[#171717] px-4 py-3 font-mono"
                  >
                    <span>
                      {index + 1}. {player.username}
                    </span>

                    <strong>{player.score} PTS</strong>
                  </div>
                ))}
            </div>
          </div>
        </div>
      )}

       {/* SCOREBOARD OVERLAY */}
          {showScoreboard && (
        <div className="fixed inset-0 z-50 bg-[#171717]/90 flex items-center justify-center p-4">
          <div className="bg-[#e9dfc4] border-4 border-[#171717] p-8 w-full max-w-lg shadow-[8px_8px_0px_0px_rgba(178,34,34,1)]">

            <p className="font-mono text-xs uppercase tracking-widest mb-2">
              CASE UPDATE
            </p>

            <h2 className="font-display text-4xl font-black uppercase mb-6">
              TURN COMPLETE
            </h2>

            <div className="space-y-3">
              {scores.map((player, index) => (
                <div
                  key={player.username}
                  className="flex items-center justify-between border border-[#171717] px-4 py-3 font-mono"
                >
                  <div className="flex gap-3">
                    <span>{index + 1}.</span>
                    <strong>{player.username}</strong>
                  </div>

                  <strong>{player.score} PTS</strong>
                </div>
              ))}
            </div>

          </div>
        </div>
      )}

      {/* 1. ROUND INTRO BANNER OVERLAY */}
      {showRoundBanner && (
        <div className="fixed inset-0 bg-[#171717]/90 z-50 flex flex-col items-center justify-center p-4 transition-all duration-500 animate-in fade-in">
          <div className="border-4 border-[#e9dfc4] bg-[#b22222] text-[#f0ece1] p-8 max-w-lg w-full text-center shadow-[10px_10px_0px_0px_rgba(23,23,23,1)] transform transition-transform animate-bounce">
            <span className="font-mono text-sm tracking-widest uppercase block mb-1">
              CASE INITIATED
            </span>
            <h1 className="font-display text-4xl sm:text-5xl font-black uppercase tracking-wider mb-2">
              ROUND {headerData.round}
            </h1>
            <p className="font-mono text-xs uppercase tracking-wider opacity-90">
              SKETCH ARTIST: <strong className="underline">{headerData.drawerUsername}</strong>
            </p>
          </div>
        </div>
      )}

      <div className="max-w-7xl w-full mx-auto flex flex-col flex-1 bg-[#e9dfc4] border-2 border-[#171717] shadow-[6px_6px_0px_0px_rgba(23,23,23,1)] relative overflow-hidden">
        
        {/* CASE FILE TOP BADGE STAMP */}
        <div className="absolute -top-1 left-8 bg-[#b22222] text-[#f0ece1] px-3 py-1 font-mono text-xs tracking-wider uppercase shadow-sm border border-[#171717] -rotate-1 z-20">
          EVIDENCE DASHBOARD — ACTIVE CASE
        </div>

        {/* 2. TOP HEADER BAR */}
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

            {/* Showing selected word to current drawer */}
            {isDrawer && currentWord.length > 0 && (
              <div className="border border-[#171717] px-2.5 py-1 font-mono text-xs tracking-wider uppercase bg-[#e9dfc4]">
                WORD SELECTED: <strong className="text-base text-[#171717]">{currentWord}</strong>
              </div>
            )}

            {/* Guesser word slots */}
            {!isDrawer && !showRoundBanner && wordLength > 0 && (
              <div className="flex gap-2 justify-center my-4 font-mono text-xl font-bold">
                {Array.from({ length: wordLength }).map((_, index) => (
                  <span key={index} className="border-b-2 border-[#171717] w-6 text-center">
                    _
                  </span>
                ))}
              </div>
            )}
          </div>

          {/* Current Drawer Badge */}
          <div className="flex items-center gap-2 border border-[#b22222] bg-[#b22222]/10 px-3 py-1 font-mono text-xs tracking-wider uppercase text-[#b22222]">
            <span>SKETCH ARTIST:</span>
            <strong className="underline">{headerData.drawerUsername}</strong>
          </div>
        </header>

        {/* 3. MAIN CONTENT AREA */}
        <main className="flex-1 flex flex-col lg:flex-row divide-y-2 lg:divide-y-0 lg:divide-x-2 divide-[#171717]">
          
          {/* LEFT: CANVAS AREA */}
          <div className="flex-1 flex flex-col p-3 sm:p-4 relative bg-[#f4ebd0]/40 min-w-0">
            
            {/* CANVAS BOARD */}
            <div className="relative flex-1 bg-white border-2 border-[#171717] min-h-[400px] lg:min-h-[460px] flex flex-col items-center justify-center shadow-[3px_3px_0px_0px_rgba(23,23,23,1)]">

              {/* AI GENERATED CLUE IMAGE */}
              {isGeneratingImage ? (
                    <div className="flex flex-col items-center justify-center text-center font-mono">
                      <div className="w-10 h-10 border-4 border-[#171717]/20 border-t-[#b22222] rounded-full animate-spin mb-4" />

                      <p className="text-sm font-bold uppercase tracking-widest">
                        GENERATING EVIDENCE...
                      </p>

                      <p className="text-[10px] text-zinc-500 mt-2">
                        AI is preparing the visual clue...
                      </p>
                    </div>
                  ) : currentImage ? (
                    <img
                      src={currentImage}
                      alt="AI generated clue"
                      className="max-h-[320px] max-w-full w-auto h-auto object-contain rounded border border-[#171717]"
                    />
                  ) : (
                    <div className="text-center font-mono select-none">
                      <span className="text-4xl block mb-2">🎨</span>

                      <p className="text-xs uppercase tracking-widest text-zinc-600">
                        Evidence Board / Canvas Area
                      </p>

                      <p className="text-[10px] text-zinc-400 mt-1">
                        Waiting for prompt selection...
                      </p>
                    </div>
                  )}

                  {isDrawer && isGeneratingPrompts && (
                      <div className="absolute inset-0 bg-[#171717]/85 backdrop-blur-xs flex flex-col items-center justify-center p-6 z-30">
                        <div className="bg-[#e9dfc4] border-2 border-[#171717] p-8 max-w-md w-full text-center shadow-[6px_6px_0px_0px_rgba(178,34,34,1)]">

                          <div className="w-10 h-10 mx-auto mb-5 border-4 border-[#171717]/20 border-t-[#b22222] rounded-full animate-spin" />

                          <h3 className="font-display text-2xl uppercase">
                            PREPARING CASE
                          </h3>

                          <p className="font-mono text-xs text-zinc-700 mt-2">
                            AI is generating your prompts...
                          </p>

                        </div>
                      </div>
                    )}

              {/* OVERLAY: PROMPT SELECTION (Shown to Drawer ONLY after Round Banner finishes) */}
              {isDrawer && !showRoundBanner && !isGeneratingPrompts && isSelectingPrompt && prompts.length > 0 && (
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
              {!isDrawer && !showRoundBanner && isSelectingPrompt && (
                <div className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-[#171717] text-[#e9dfc4] border border-[#171717] px-4 py-2 font-mono text-xs uppercase tracking-wider shadow-[3px_3px_0px_0px_rgba(178,34,34,1)] flex items-center gap-2">
                  <span className="w-2 h-2 bg-[#b22222] animate-ping rounded-full" />
                  WAITING FOR <span className="text-[#f0ece1] font-bold">{headerData.drawerUsername}</span> TO SELECT A CASE PROMPT...
                </div>
              )}
            </div>
          </div>

          {/* RIGHT SIDEBAR: PLAYERS & CHAT */}
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
                      <div className="flex items-center gap-2 min-w-0 flex-1">
                        <span className="flex h-6 w-6 items-center justify-center rounded-full border border-[#171717] text-[10px] font-bold bg-[#e9dfc4] text-[#171717] shrink-0">
                          {getInitials(player.username)}
                        </span>

                        <div className="flex items-center gap-1.5 min-w-0 flex-1">
                          <span className="truncate font-bold text-[#171717] block" title={player.username}>
                            {player.username}
                          </span>
                          <span className="truncate font-bold text-[#171717] block" title={player.username}>
                            {player.score} PTS
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