import { useState } from "react";

export function EvidenceCard() {
  // Track redacted state for accessibility and hover touch devices
  const [isRevealed, setIsRevealed] = useState(false);

  return (
    <div className="w-full max-w-md bg-[#e8e4d9] text-zinc-900 border-2 border-zinc-800 rounded-sm p-4 font-mono shadow-xl relative">
      
      {/* 1. POLAROID IMAGE CONTAINER */}
      <div className="w-full h-52 rounded border border-zinc-700 bg-gradient-to-br from-amber-700 via-amber-900 to-zinc-900 shadow-inner mb-4 flex items-center justify-center overflow-hidden">
        {/* Replace this div with an actual <img> tag when connecting your AI API */}
        <div className="text-zinc-400/50 text-xs tracking-widest uppercase text-center px-4">
          [ AI GENERATED IMAGE PREVIEW ]
        </div>
      </div>

      {/* 2. EXHIBIT HEADER */}
      <div className="flex justify-between items-center text-xs text-zinc-600 border-b border-zinc-400 pb-2 mb-3 tracking-widest">
        <span>EXHIBIT A</span>
        <span className="font-bold text-amber-900">FILE NO. 0417</span>
      </div>

      {/* 3. THE 4 PROMPTS THE PICKER SAW */}
      <div className="mb-4">
        <p className="text-[11px] text-zinc-600 uppercase tracking-wider mb-2 font-semibold">
          THE 4 PROMPTS THE PICKER SAW
        </p>

        <div className="grid grid-cols-4 gap-2">
          {/* Unselected Prompts */}
          <div className="border border-zinc-700 bg-[#dfdacd] py-2 px-1 text-center text-xs text-zinc-800 font-bold uppercase rounded-sm">
            VOLCANO
          </div>

          {/* REDACTED PROMPT (The Secret Pick) */}
          <div
            onMouseEnter={() => setIsRevealed(true)}
            onMouseLeave={() => setIsRevealed(false)}
            className="border-2 border-red-800 bg-black text-amber-400 py-2 px-1 text-center text-xs font-bold uppercase rounded-sm cursor-pointer select-none transition-all duration-200 relative group flex items-center justify-center"
          >
            {/* Censor bar when hidden */}
            <span
              className={`absolute inset-0 bg-zinc-950 transition-opacity duration-200 ${
                isRevealed ? "opacity-0" : "opacity-100"
              }`}
            />
            
            {/* The revealed word */}
            <span className="z-10">DRAGON</span>
          </div>

          <div className="border border-zinc-700 bg-[#dfdacd] py-2 px-1 text-center text-xs text-zinc-800 font-bold uppercase rounded-sm">
            TEACUP
          </div>

          <div className="border border-zinc-700 bg-[#dfdacd] py-2 px-1 text-center text-xs text-zinc-800 font-bold uppercase rounded-sm">
            COMET
          </div>
        </div>

        <p className="text-[10px] text-zinc-500 italic mt-1.5">
          * hover or focus to declassify their pick
        </p>
      </div>

      {/* 4. WHAT THE ROOM TYPED */}
      <div className="border-t border-zinc-400 pt-3">
        <p className="text-[10px] text-zinc-600 uppercase tracking-wider mb-2 font-semibold">
          WHAT THE ROOM TYPED — NOBODY SAW THE LIST ABOVE
        </p>

        <div className="flex flex-wrap gap-2 text-xs">
          {/* Incorrect Guesses */}
          <span className="border border-zinc-600 bg-[#dfdacd] px-2.5 py-1 text-zinc-800 rounded-sm">
            "fox"
          </span>
          <span className="border border-zinc-600 bg-[#dfdacd] px-2.5 py-1 text-zinc-800 rounded-sm">
            "phoenix"
          </span>

          {/* Correct Guess */}
          <span className="border-2 border-emerald-700 bg-emerald-100/80 text-emerald-900 font-bold px-2.5 py-1 rounded-sm flex items-center gap-1 shadow-sm">
            "dragon" <span className="text-emerald-700">✓</span>
          </span>

          <span className="border border-zinc-600 bg-[#dfdacd] px-2.5 py-1 text-zinc-800 rounded-sm">
            "lizard"
          </span>
        </div>
      </div>

      {/* Declassified Stamp (Optional Aesthetic Detail) */}
      <div className="absolute bottom-2 right-3 border-2 border-emerald-800/40 text-emerald-800/60 font-sans text-[9px] font-bold tracking-widest px-1.5 py-0.5 rounded rotate-[-6deg] pointer-events-none uppercase">
        REVEALED
      </div>

    </div>
  );
}