
import React, { useEffect, useState, useRef } from 'react';
import { GameStats, LeaderboardEntry, GameMode } from '../types';
import { RefreshCw, Crown, Trophy, Copy, Twitter, Check, Download, Globe, User, AlertCircle } from 'lucide-react';
import html2canvas from 'html2canvas';
import { 
    fetchGlobalLeaderboard, 
    submitGlobalScore, 
    getStoredUsername,
    setStoredUsername,
    getClient
} from '../services/leaderboardService';

interface ResultsPanelProps {
  stats: GameStats;
  gameMode: GameMode;
  onRestart: () => void;
  onChangeMode: () => void;
}

type Tab = 'PERSONAL' | 'GLOBAL';

export const ResultsPanel: React.FC<ResultsPanelProps> = ({ stats, gameMode, onRestart, onChangeMode }) => {
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [globalLeaderboard, setGlobalLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [tab, setTab] = useState<Tab>('PERSONAL');
  const [copied, setCopied] = useState(false);
  const panelRef = useRef<HTMLDivElement>(null);
  
  // Global State
  const [isConnected, setIsConnected] = useState(false);
  const [isLoadingGlobal, setIsLoadingGlobal] = useState(false);
  const [globalError, setGlobalError] = useState<string | null>(null);
  const [username, setUsername] = useState(getStoredUsername());
  const [hasSubmittedGlobal, setHasSubmittedGlobal] = useState(false);

  // 1. Initialize Local Leaderboard
  useEffect(() => {
    const storageKey = `texflow_leaderboard_${gameMode}`;
    const rawData = localStorage.getItem(storageKey);
    let history: LeaderboardEntry[] = rawData ? JSON.parse(rawData) : [];

    const newEntry: LeaderboardEntry = {
        rank: 0,
        username: "You",
        score: stats.score,
        wpm: stats.wpm,
        isUser: true,
        date: new Date().toISOString()
    };

    history.push(newEntry);
    history.sort((a, b) => b.score - a.score);
    history = history.slice(0, 10);

    const ranked = history.map((item, index) => ({
        ...item,
        rank: index + 1,
        isUser: item.date === newEntry.date
    }));

    setLeaderboard(ranked);
    localStorage.setItem(storageKey, JSON.stringify(ranked.map(r => ({...r, isUser: false}))));

    // Check if Supabase is configured in code
    if (getClient()) {
        setIsConnected(true);
        handleGlobalFetch(true); // Auto-fetch (and auto-submit if logic allows)
    }
  }, [stats, gameMode]);

  const handleUsernameChange = (newVal: string) => {
      setUsername(newVal);
      setStoredUsername(newVal);
  };

  const handleGlobalFetch = async (autoSubmit = false) => {
      setIsLoadingGlobal(true);
      setGlobalError(null);
      try {
          // Optional Auto-Submit
          if (autoSubmit && !hasSubmittedGlobal && getClient()) {
              await submitGlobalScore(username, stats.score, stats.wpm, gameMode);
              setHasSubmittedGlobal(true);
          }

          const data = await fetchGlobalLeaderboard(gameMode);
          
          // Highlight user in global data
          const processed = data.map(entry => ({
              ...entry,
              isUser: entry.username === username && entry.score === stats.score
          }));
          
          setGlobalLeaderboard(processed);
      } catch (e: any) {
          console.error(e);
          setGlobalError(e.message || "Failed to connect");
          if (e.message && e.message.includes("configured")) {
              setIsConnected(false);
          }
      } finally {
          setIsLoadingGlobal(false);
      }
  };

  const handleManualSubmit = async () => {
      if (!getClient()) return;
      setIsLoadingGlobal(true);
      try {
          await submitGlobalScore(username, stats.score, stats.wpm, gameMode);
          setHasSubmittedGlobal(true);
          // Refresh
          await handleGlobalFetch();
      } catch (e: any) {
          setGlobalError("Submit failed: " + e.message);
      } finally {
          setIsLoadingGlobal(false);
      }
  };

  // --- Share & Export ---
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

  const handleDownloadImage = async () => {
      if (!panelRef.current) return;
      try {
          const canvas = await html2canvas(panelRef.current, {
              scale: 2,
              useCORS: true,
              backgroundColor: null,
              logging: false,
              ignoreElements: (element) => element.getAttribute('data-html2canvas-ignore') === 'true'
          });
          const image = canvas.toDataURL("image/png");
          const link = document.createElement('a');
          link.href = image;
          link.download = `texflow-${gameMode.toLowerCase()}-${stats.score}.png`;
          link.click();
      } catch (e) {
          console.error("Screenshot generation failed", e);
      }
  };

  const handleTwitterShare = () => {
      const text = generateShareText();
      const url = `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}`;
      window.open(url, '_blank');
  };

  return (
    <div ref={panelRef} className="max-w-2xl mx-auto w-full bg-white dark:bg-slate-900 rounded-2xl shadow-xl border border-slate-200 dark:border-slate-800 overflow-hidden animate-in zoom-in-95 duration-300 relative">
       
       {/* Header */}
       <div className="bg-indigo-600 p-6 text-center relative overflow-hidden">
            <div className="absolute inset-0 opacity-10 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-white via-transparent to-transparent"></div>
            <h2 className="text-3xl font-bold text-white relative z-10">
                {gameMode === 'ZEN' ? 'Session Complete' : 'Time\'s Up!'}
            </h2>
            <p className="text-indigo-100 mt-2 relative z-10">Great typing flow!</p>
       </div>

       <div className="p-8">
            {/* Stats Grid */}
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
                    <span className="text-xs uppercase font-bold text-slate-400 mb-1">Streak</span>
                    <span className="text-3xl font-bold text-orange-500">{stats.maxStreak}</span>
                </div>
            </div>

            {/* Tab Navigation */}
            <div className="flex border-b border-slate-200 dark:border-slate-800 mb-4">
                <button 
                    onClick={() => setTab('PERSONAL')}
                    className={`flex-1 pb-3 text-sm font-bold flex items-center justify-center gap-2 border-b-2 transition-colors ${tab === 'PERSONAL' ? 'border-indigo-500 text-indigo-600 dark:text-indigo-400' : 'border-transparent text-slate-400 hover:text-slate-600'}`}
                >
                    <User size={16} /> Personal
                </button>
                <button 
                    onClick={() => { setTab('GLOBAL'); if(isConnected && globalLeaderboard.length === 0) handleGlobalFetch(); }}
                    className={`flex-1 pb-3 text-sm font-bold flex items-center justify-center gap-2 border-b-2 transition-colors ${tab === 'GLOBAL' ? 'border-indigo-500 text-indigo-600 dark:text-indigo-400' : 'border-transparent text-slate-400 hover:text-slate-600'}`}
                >
                    <Globe size={16} /> Global
                </button>
            </div>

            {/* Leaderboard Content */}
            <div className="mb-8 min-h-[250px]">
                
                {/* PERSONAL TAB */}
                {tab === 'PERSONAL' && (
                    <>
                        <h3 className="text-sm font-bold text-slate-500 uppercase mb-3 flex items-center gap-2">
                            <Trophy size={16} className="text-yellow-500" /> 
                            Local History
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
                                        </div>
                                        <span className="text-sm font-bold text-slate-700 dark:text-slate-300">{entry.score}</span>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="text-center py-8 text-slate-400 text-sm">No history yet.</div>
                        )}
                    </>
                )}

                {/* GLOBAL TAB */}
                {tab === 'GLOBAL' && (
                    <>
                         <div className="flex items-center justify-between mb-3">
                             <h3 className="text-sm font-bold text-slate-500 uppercase flex items-center gap-2">
                                <Globe size={16} className="text-blue-500" /> 
                                Global Ranking
                             </h3>
                         </div>

                         {!isConnected ? (
                             <div className="bg-slate-50 dark:bg-slate-800/50 rounded-lg p-6 text-center border border-slate-200 dark:border-slate-800" data-html2canvas-ignore="true">
                                 <h4 className="font-bold text-slate-800 dark:text-slate-200 mb-2">Global Leaderboard Offline</h4>
                                 <p className="text-xs text-slate-500 mb-4 max-w-xs mx-auto">
                                     The developer has not configured the Supabase connection in the source code yet. 
                                 </p>
                             </div>
                         ) : (
                             <>
                                {/* Connected View */}
                                <div className="flex gap-2 mb-4" data-html2canvas-ignore="true">
                                    <input 
                                        value={username}
                                        onChange={(e) => handleUsernameChange(e.target.value)}
                                        className="flex-1 px-3 py-2 rounded border border-slate-300 dark:border-slate-700 text-sm bg-white dark:bg-slate-950 focus:ring-2 focus:ring-indigo-500 outline-none"
                                        placeholder="Enter Username"
                                    />
                                    <button 
                                        onClick={handleManualSubmit}
                                        disabled={hasSubmittedGlobal || isLoadingGlobal}
                                        className="px-4 py-2 bg-indigo-600 disabled:bg-slate-300 dark:disabled:bg-slate-800 text-white rounded font-bold text-sm transition-colors"
                                    >
                                        {hasSubmittedGlobal ? 'Submitted' : 'Submit Score'}
                                    </button>
                                </div>

                                {isLoadingGlobal ? (
                                    <div className="text-center py-12 text-slate-400 animate-pulse">Loading scores...</div>
                                ) : globalError ? (
                                    <div className="p-4 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 text-sm rounded-lg flex items-center gap-2">
                                        <AlertCircle size={16} /> {globalError}
                                    </div>
                                ) : globalLeaderboard.length > 0 ? (
                                    <div className="bg-white dark:bg-slate-950 rounded-lg border border-slate-200 dark:border-slate-800 divide-y divide-slate-100 dark:divide-slate-800 max-h-60 overflow-y-auto">
                                        {globalLeaderboard.map((entry, idx) => (
                                            <div key={idx} className={`flex items-center justify-between p-3 ${entry.isUser ? 'bg-indigo-50 dark:bg-indigo-900/20 ring-1 ring-indigo-500/30 z-10 relative' : ''}`}>
                                                <div className="flex items-center gap-3">
                                                    <div className={`w-6 h-6 flex items-center justify-center rounded text-xs font-bold ${entry.rank === 1 ? 'bg-yellow-100 text-yellow-700' : 'bg-slate-100 text-slate-500 dark:bg-slate-800 dark:text-slate-400'}`}>
                                                        {entry.rank}
                                                    </div>
                                                    <span className={`text-sm font-medium ${entry.isUser ? 'text-indigo-700 dark:text-indigo-300 font-bold' : 'text-slate-600 dark:text-slate-400'}`}>
                                                        {entry.username}
                                                    </span>
                                                    {entry.rank === 1 && <Crown size={14} className="text-yellow-500" />}
                                                </div>
                                                <span className="text-sm font-bold text-slate-700 dark:text-slate-300">{entry.score}</span>
                                            </div>
                                        ))}
                                    </div>
                                ) : (
                                    <div className="text-center py-8 text-slate-400 text-sm">No global scores yet. Be the first!</div>
                                )}
                             </>
                         )}
                    </>
                )}
            </div>

            {/* Actions - Ignored by Screenshot */}
            <div className="flex flex-col gap-3" data-html2canvas-ignore="true">
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
                <div className="grid grid-cols-3 gap-3">
                     <button 
                        onClick={handleCopy}
                        className={`flex items-center justify-center gap-2 px-2 py-3 rounded-xl font-bold transition-all border ${copied ? 'bg-green-50 border-green-200 text-green-600 dark:bg-green-900/20 dark:border-green-800 dark:text-green-400' : 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100 dark:bg-slate-800 dark:border-slate-700 dark:text-slate-300'}`}
                        title="Copy Text Result"
                    >
                        {copied ? <Check size={18} /> : <Copy size={18} />}
                        <span className="hidden sm:inline">{copied ? 'Copied' : 'Text'}</span>
                    </button>
                    <button 
                        onClick={handleDownloadImage}
                        className="flex items-center justify-center gap-2 px-2 py-3 bg-rose-500 hover:bg-rose-600 text-white rounded-xl font-bold transition-all shadow-lg shadow-rose-200 dark:shadow-none hover:scale-[1.02]"
                        title="Download Screenshot"
                    >
                        <Download size={18} /> 
                        <span className="hidden sm:inline">Image</span>
                    </button>
                    <button 
                        onClick={handleTwitterShare}
                        className="flex items-center justify-center gap-2 px-2 py-3 bg-sky-500 hover:bg-sky-600 text-white rounded-xl font-bold transition-all shadow-lg shadow-sky-200 dark:shadow-none hover:scale-[1.02]"
                        title="Share on Twitter"
                    >
                        <Twitter size={18} /> 
                        <span className="hidden sm:inline">Tweet</span>
                    </button>
                </div>
            </div>

       </div>
    </div>
  );
};
