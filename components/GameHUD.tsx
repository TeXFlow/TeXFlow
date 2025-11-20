
import React from 'react';
import { Clock, Flame, Gauge } from 'lucide-react';
import { GameMode } from '../types';

interface GameHUDProps {
  timeLeft: number;
  score: number;
  wpm: number;
  streak: number;
  gameMode: GameMode;
}

export const GameHUD: React.FC<GameHUDProps> = ({ timeLeft, score, wpm, streak, gameMode }) => {
  
  const getTimerColor = () => {
    if (gameMode === 'ZEN') return 'text-slate-500 dark:text-slate-400';
    if (timeLeft <= 10) return 'text-red-500 animate-pulse';
    return 'text-indigo-600 dark:text-indigo-400';
  };

  return (
    <div className="flex flex-wrap items-center justify-between gap-4 p-4 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm mb-6">
      
      {/* Timer */}
      <div className="flex items-center gap-3">
        <div className={`p-2 rounded-lg bg-slate-50 dark:bg-slate-800/50 ${getTimerColor()}`}>
            <Clock size={24} />
        </div>
        <div className="flex flex-col">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                {gameMode === 'ZEN' ? 'Time' : 'Remaining'}
            </span>
            <span className={`text-2xl font-mono font-bold ${getTimerColor()}`}>
                {gameMode === 'ZEN' 
                    ? new Date(timeLeft * 1000).toISOString().substr(14, 5)
                    : `${timeLeft}s`
                }
            </span>
        </div>
      </div>

      {/* Divider */}
      <div className="w-px h-10 bg-slate-200 dark:bg-slate-800 hidden sm:block" />

      {/* WPM */}
      <div className="flex items-center gap-3">
        <div className="p-2 rounded-lg bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 dark:text-emerald-400">
            <Gauge size={24} />
        </div>
        <div className="flex flex-col">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Speed</span>
            <span className="text-2xl font-mono font-bold text-slate-800 dark:text-slate-100">
                {wpm} <span className="text-sm text-slate-500 font-sans font-normal">WPM</span>
            </span>
        </div>
      </div>

      {/* Divider */}
      <div className="w-px h-10 bg-slate-200 dark:bg-slate-800 hidden sm:block" />

      {/* Score / Streak */}
      <div className="flex items-center gap-4">
         <div className="flex flex-col items-end">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Score</span>
            <span className="text-xl font-mono font-bold text-slate-800 dark:text-slate-100">{score}</span>
         </div>
         
         {streak > 2 && (
             <div className="flex items-center gap-1 px-3 py-1 bg-orange-50 dark:bg-orange-900/20 text-orange-600 dark:text-orange-400 rounded-full border border-orange-200 dark:border-orange-900/50 animate-in zoom-in duration-300">
                <Flame size={16} className="fill-current" />
                <span className="font-bold">{streak}x</span>
             </div>
         )}
      </div>

    </div>
  );
};
