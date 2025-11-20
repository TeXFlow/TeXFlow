
import React, { useEffect, useState } from 'react';
import { GameStats, LeaderboardEntry, GameMode } from '../types';
import { RefreshCw, Crown, Trophy, Copy, Twitter, Check } from 'lucide-react';

interface ResultsPanelProps {
  stats: GameStats;
  gameMode: GameMode;
  onRestart: () => void;
  onChangeMode: () => void;
}

export const ResultsPanel: React.FC<ResultsPanelProps> = ({ stats, gameMode, onRestart, onChangeMode }) => {
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    const storageKey = `texflow_leaderboard_${gameMode}`;
    const rawData = localStorage.getItem(storageKey);
    let history: LeaderboardEntry[] = rawData ? JSON.parse(rawData) : [];

    // Create new entry
    const newEntry: LeaderboardEntry = {
        rank: 0, // temporary
        username: "You",
        score: stats.score,
        wpm: stats.wpm,
        isUser: true, // Current session
        date: new Date().toISOString()
    };

    // Add to history
    history.push(newEntry);

    // Sort by Score DESC
    history.sort((a, b) => b.score - a.score);

    // Keep top 10
    history = history.slice(0, 10);

    // Assign Ranks
    const ranked = history.map((item, index) => ({
        ...item,
        rank: index + 1,
        // Re-identify user if multiple "You" entries exist, pick the one matching current stats/date
        isUser: item.date === newEntry.date
    }));

    setLeaderboard(ranked);

    // Persist (remove isUser flag for storage)
    localStorage.setItem(storageKey, JSON.stringify(ranked.map(r => ({...r, isUser: false}))));
  }, [stats, gameMode]);

  const generateShareText = () => {
    const modeLabels: Record<string, string> = {
        'ZEN': 'Zen Mode 🧘',
        'TIME_ATTACK': 'Time Attack ⏱️',
        'SURVIVAL': 'Survival 🛡️',
        'DAILY': 'Daily Challenge 📅'
    };

    return `TeXFlow ${modeLabels[gameMode] || gameMode}

🏆 Score: ${stats.score}
⚡ Speed: ${stats.wpm} WPM
🎯 Accuracy: ${Math.round(stats.accuracy)}%
🔥 Max Streak: ${stats.maxStreak}

Can you beat my flow?
${window.location.origin}`;
  };

  const handleCopy = async () => {
    const text = generateShareText();
    try {
        await navigator.clipboard.writeText(text);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    } catch (err) {
        console.error('Failed to copy results', err);
    }
  };

  const handleTwitterShare = () => {
      const text = generateShareText();
      const url = `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}`;
      window.open(url, '_blank');
  };

  return (
    <div className="max-w-2xl mx-auto w-full bg-white dark:bg-slate-900 rounded-2xl shadow-xl border border-slate-200 dark:border-slate-800 overflow-hidden animate-in zoom-in-95 duration-300">
       
       {/* Header */}
       <div className="bg-indigo-600 p-6 text-center relative overflow-hidden">
            <div className="absolute inset-0 opacity-10 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-white via-transparent to-transparent"></div>
            <h2 className="text-3xl font-bold text-white relative z-10">
                {gameMode === 'ZEN' ? 'Session Complete' : 'Time\'s Up!'}
            </h2>
            <p className="text-indigo-100 mt-2 relative z-10">Great typing flow!</p>
       </div>

       <div className="p-8">
            {/* Primary Stats Grid */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
                <div className="flex flex-col items-center p-4 bg-slate-50 dark:bg-slate-800/50 rounded-xl">
                    <span className="text-xs uppercase font-bold text-slate-400 mb-1">WPM</span>
                    <span className="text-3xl font-bold text-slate-800 dark:text-slate-100">{stats.wpm}</span>
                </div>
                <div className="flex flex-col items-center p-4 bg-slate-50 dark:bg-slate-800/50 rounded-xl">
                    <span className="text-xs uppercase font-bold text-slate-400 mb-1">Score</span>
                    <span className="text-3xl font-bold text-indigo-600 dark:text-indigo-400">{stats.score}</span>
                </div>
                <div className="flex flex-col items-center p-4 bg-slate-50 dark:bg-slate-800/50 rounded-xl">
                    <span className="text-xs uppercase font-bold text-slate-400 mb-1">Accuracy</span>
                    <span className="text-3xl font-bold text-slate-800 dark:text-slate-100">{Math.round(stats.accuracy)}%</span>
                </div>
                <div className="flex flex-col items-center p-4 bg-slate-50 dark:bg-slate-800/50 rounded-xl">
                    <span className="text-xs uppercase font-bold text-slate-400 mb-1">Best Streak</span>
                    <span className="text-3xl font-bold text-orange-500">{stats.maxStreak}</span>
                </div>
            </div>

            {/* Leaderboard Section */}
            <div className="mb-8">
                <h3 className="text-sm font-bold text-slate-500 uppercase mb-3 flex items-center gap-2">
                    <Trophy size={16} className="text-yellow-500" /> 
                    Personal Best ({gameMode.replace('_', ' ')})
                </h3>
                {leaderboard.length > 0 ? (
                    <div className="bg-white dark:bg-slate-950 rounded-lg border border-slate-200 dark:border-slate-800 divide-y divide-slate-100 dark:divide-slate-800 max-h-60 overflow-y-auto">
                        {leaderboard.map((entry, idx) => (
                            <div key={idx} className={`flex items-center justify-between p-3 ${entry.isUser ? 'bg-indigo-50 dark:bg-indigo-900/20 ring-1 ring-indigo-500/30 z-10 relative' : ''}`}>
                                <div className="flex items-center gap-3">
                                    <div className={`w-6 h-6 flex items-center justify-center rounded text-xs font-bold ${entry.rank === 1 ? 'bg-yellow-100 text-yellow-700' : 'bg-slate-100 text-slate-500 dark:bg-slate-800 dark:text-slate-400'}`}>
                                        {entry.rank}
                                    </div>
                                    <span className={`text-sm font-medium ${entry.isUser ? 'text-indigo-700 dark:text-indigo-300 font-bold' : 'text-slate-600 dark:text-slate-400'}`}>
                                        {entry.username} {entry.isUser && '(Now)'}
                                    </span>
                                    {entry.rank === 1 && <Crown size={14} className="text-yellow-500" />}
                                </div>
                                <div className="flex items-center gap-4">
                                    <span className="text-xs text-slate-400 font-mono">{entry.wpm} WPM</span>
                                    <span className="text-sm font-bold text-slate-700 dark:text-slate-300">{entry.score} pts</span>
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="text-center py-4 text-slate-400 text-sm">No history yet.</div>
                )}
            </div>

            {/* Actions */}
            <div className="flex flex-col gap-3">
                {/* Game Actions */}
                <div className="grid grid-cols-2 gap-3">
                    <button 
                        onClick={onRestart}
                        className="flex items-center justify-center gap-2 px-4 py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-bold transition-all shadow-lg shadow-indigo-200 dark:shadow-none hover:scale-[1.02]"
                    >
                        <RefreshCw size={18} /> Play Again
                    </button>
                     <button 
                        onClick={onChangeMode}
                        className="flex items-center justify-center gap-2 px-4 py-3 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-700 rounded-xl font-bold transition-all"
                    >
                        Change Mode
                    </button>
                </div>
                
                {/* Social Actions */}
                <div className="grid grid-cols-2 gap-3">
                     <button 
                        onClick={handleCopy}
                        className={`flex items-center justify-center gap-2 px-4 py-3 rounded-xl font-bold transition-all border ${copied ? 'bg-green-50 border-green-200 text-green-600 dark:bg-green-900/20 dark:border-green-800 dark:text-green-400' : 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100 dark:bg-slate-800 dark:border-slate-700 dark:text-slate-300'}`}
                    >
                        {copied ? <Check size={18} /> : <Copy size={18} />}
                        {copied ? 'Copied!' : 'Copy Result'}
                    </button>
                    <button 
                        onClick={handleTwitterShare}
                        className="flex items-center justify-center gap-2 px-4 py-3 bg-sky-500 hover:bg-sky-600 text-white rounded-xl font-bold transition-all shadow-lg shadow-sky-200 dark:shadow-none hover:scale-[1.02]"
                    >
                        <Twitter size={18} /> Tweet
                    </button>
                </div>
            </div>

       </div>
    </div>
  );
};
