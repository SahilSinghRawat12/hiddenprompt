import React from "react";

export interface FinalPlayer {
  username: string;
  score: number;
  rank?: number;
}

interface GameOverScreenProps {
  scores: FinalPlayer[];
  onPlayAgain?: () => void;
}

export const GameOverScreen: React.FC<GameOverScreenProps> = ({ scores, onPlayAgain }) => {
  // Sort scores descending and assign ranks
  const sorted = [...scores]
    .sort((a, b) => b.score - a.score)
    .map((player, idx) => ({ ...player, rank: idx + 1 }));

  const first = sorted.find((p) => p.rank === 1);
  const second = sorted.find((p) => p.rank === 2);
  const third = sorted.find((p) => p.rank === 3);
  const others = sorted.filter((p) => p.rank > 3);

  return (
    <div className="flex flex-col items-center justify-center min-h-[500px] p-6 bg-slate-900 text-white rounded-xl max-w-lg mx-auto font-mono">
      <h1 className="text-3xl font-black mb-6 tracking-wider text-yellow-400 uppercase">
        🏆 Final Results 🏆
      </h1>

      {/* Top 3 Podium */}
      <div className="flex items-end justify-center gap-4 w-full mb-8 h-48">
        {/* 2nd Place */}
        {second ? (
          <div className="flex flex-col items-center flex-1">
            <span className="font-bold text-xs truncate max-w-[80px]">{second.username}</span>
            <span className="text-[10px] text-slate-400 mb-1">{second.score} pts</span>
            <div className="w-full bg-slate-400 h-28 rounded-t-lg flex items-center justify-center font-extrabold text-2xl text-slate-900 shadow-md">
              2nd
            </div>
          </div>
        ) : <div className="flex-1" />}

        {/* 1st Place */}
        {first && (
          <div className="flex flex-col items-center flex-1">
            <span className="text-2xl mb-1">👑</span>
            <span className="font-bold text-sm truncate text-yellow-300 max-w-[90px]">{first.username}</span>
            <span className="text-[10px] text-slate-400 mb-1">{first.score} pts</span>
            <div className="w-full bg-yellow-400 h-36 rounded-t-lg flex items-center justify-center font-black text-3xl text-slate-900 shadow-lg shadow-yellow-500/30">
              1st
            </div>
          </div>
        )}

        {/* 3rd Place */}
        {third ? (
          <div className="flex flex-col items-center flex-1">
            <span className="font-bold text-xs truncate max-w-[80px]">{third.username}</span>
            <span className="text-[10px] text-slate-400 mb-1">{third.score} pts</span>
            <div className="w-full bg-amber-700 h-20 rounded-t-lg flex items-center justify-center font-extrabold text-xl text-slate-100 shadow-md">
              3rd
            </div>
          </div>
        ) : <div className="flex-1" />}
      </div>

      {/* 4th Place and below */}
      {others.length > 0 && (
        <div className="w-full bg-slate-800/80 rounded-lg p-3 space-y-2 border border-slate-700 mb-6">
          {others.map((player) => (
            <div
              key={player.username}
              className="flex justify-between items-center text-xs px-2 py-1.5 border-b border-slate-700/50 last:border-none"
            >
              <span className="font-semibold text-slate-300">
                #{player.rank} {player.username}
              </span>
              <span className="font-mono text-slate-400">{player.score} pts</span>
            </div>
          ))}
        </div>
      )}

      {onPlayAgain && (
        <button
          onClick={onPlayAgain}
          className="bg-yellow-400 text-slate-900 font-bold px-6 py-2.5 rounded hover:bg-yellow-300 transition-colors"
        >
          PLAY AGAIN
        </button>
      )}
    </div>
  );
};