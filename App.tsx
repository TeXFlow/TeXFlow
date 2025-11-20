
import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Editor } from './components/Editor';
import { LatexPreview } from './components/LatexPreview';
import { MacrosPanel } from './components/MacrosPanel';
import { GameHUD } from './components/GameHUD';
import { ResultsPanel } from './components/ResultsPanel';
import { DEFAULT_MACROS_SOURCE, CURATED_PROBLEMS, SAMPLE_PROBLEMS } from './constants';
import { Macro, ViewMode, PracticeProblem, GameMode, GameStats } from './types';
import { generateProceduralProblem, GeneratorType, setGeneratorSeed } from './services/mathGenerator';
import { parseMacros, serializeMacros, normalizeLatex } from './services/macroUtils';
import { 
  Settings, 
  Play, 
  Keyboard, 
  BookOpen,
  Trophy,
  Zap,
  Timer,
  Calendar
} from 'lucide-react';

export default function App() {
  // --- State ---
  
  const [macros, setMacros] = useState<Macro[]>([]);
  
  useEffect(() => {
      const savedSource = localStorage.getItem('texflow_macros_source_v2');
      try {
          const initialMacros = parseMacros(savedSource || DEFAULT_MACROS_SOURCE);
          setMacros(initialMacros);
      } catch (e) {
          console.error("Failed to load macros, falling back to default", e);
          setMacros(parseMacros(DEFAULT_MACROS_SOURCE));
      }
  }, []);

  const handleSetMacros = (newMacros: Macro[]) => {
      setMacros(newMacros);
      const source = serializeMacros(newMacros);
      localStorage.setItem('texflow_macros_source_v2', source);
  };

  // Default to Practice Arena
  const [mode, setMode] = useState<ViewMode>(ViewMode.PRACTICE);
  
  // Playground State
  const [playgroundInput, setPlaygroundInput] = useState('');

  // --- PRACTICE / GAME STATE ---
  const [gameMode, setGameMode] = useState<GameMode>('ZEN');
  const [gameState, setGameState] = useState<'IDLE' | 'PLAYING' | 'FINISHED'>('IDLE');
  
  const [currentProblem, setCurrentProblem] = useState<PracticeProblem>(SAMPLE_PROBLEMS[0]);
  const [practiceInput, setPracticeInput] = useState('');
  
  // Stats
  const [score, setScore] = useState(0);
  const [streak, setStreak] = useState(0);
  const [maxStreak, setMaxStreak] = useState(0);
  const [correctCount, setCorrectCount] = useState(0);
  const [startTime, setStartTime] = useState<number | null>(null);
  const [timeLeft, setTimeLeft] = useState(0); // For timed modes
  const [elapsedTime, setElapsedTime] = useState(0); // For zen mode
  
  // Derived Stats for WPM
  const charCountRef = useRef(0); // Total characters typed correctly in session

  // --- GAME ENGINE ---

  const startGame = (selectedMode: GameMode) => {
      setGameMode(selectedMode);
      setGameState('PLAYING');
      setScore(0);
      setStreak(0);
      setMaxStreak(0);
      setCorrectCount(0);
      setPracticeInput('');
      charCountRef.current = 0;
      setStartTime(Date.now());
      setElapsedTime(0);
      
      if (selectedMode === 'TIME_ATTACK') {
          setTimeLeft(60); // 60 seconds
          setGeneratorSeed(null);
      } else if (selectedMode === 'SURVIVAL') {
          setTimeLeft(30); // 30s start
          setGeneratorSeed(null);
      } else if (selectedMode === 'DAILY') {
          // Seed based on Date (YYYYMMDD)
          const today = new Date();
          const seed = parseInt(`${today.getFullYear()}${today.getMonth()+1}${today.getDate()}`);
          setGeneratorSeed(seed);
          setTimeLeft(120); // 2 minutes for daily
      } else {
          // ZEN
          setTimeLeft(0);
          setGeneratorSeed(null);
      }

      // Generate first problem
      handleNewProblem(selectedMode);
  };

  const endGame = useCallback(() => {
      setGameState('FINISHED');
  }, []);

  // Timer Tick
  useEffect(() => {
      if (gameState !== 'PLAYING') return;

      const timer = setInterval(() => {
          if (gameMode === 'ZEN') {
              setElapsedTime(prev => prev + 1);
          } else {
              setTimeLeft(prev => {
                  if (prev <= 1) {
                      clearInterval(timer);
                      endGame();
                      return 0;
                  }
                  return prev - 1;
              });
          }
      }, 1000);

      return () => clearInterval(timer);
  }, [gameState, gameMode, endGame]);

  const getRandomCuratedProblem = () => {
      const categories = Object.keys(CURATED_PROBLEMS);
      const randomCat = categories[Math.floor(Math.random() * categories.length)];
      const problems = CURATED_PROBLEMS[randomCat];
      return problems[Math.floor(Math.random() * problems.length)];
  };

  const handleNewProblem = useCallback(async (currentMode: GameMode = gameMode) => {
    try {
        let newProb: PracticeProblem;

        if (currentMode === 'DAILY') {
            // Daily uses Procedural with Seed
            newProb = generateProceduralProblem(GeneratorType.ALGEBRA); 
        } 
        else if (currentMode === 'ZEN') {
             // Mix for Zen
             if (Math.random() > 0.5) {
                const p = getRandomCuratedProblem();
                newProb = { ...p, id: Date.now().toString() };
            } else {
                const types = Object.values(GeneratorType);
                const randomType = types[Math.floor(Math.random() * types.length)];
                newProb = generateProceduralProblem(randomType);
            }
        }
        else {
            // Time Attack / Survival: Procedural is better for flow
            const types = Object.values(GeneratorType);
            const randomType = types[Math.floor(Math.random() * types.length)];
            newProb = generateProceduralProblem(randomType);
        }
        
        setCurrentProblem(newProb);
    } catch (e) {
        console.error(e);
    } finally {
        setPracticeInput('');
    }
  }, [gameMode]);

  // Input Logic & Scoring
  const handlePracticeInput = (val: string) => {
      setPracticeInput(val);
      
      // Check Match
      if (normalizeLatex(val) === normalizeLatex(currentProblem.latex)) {
          // SUCCESS
          const problemLength = currentProblem.latex.length;
          charCountRef.current += problemLength;
          
          // Calculate Score
          let points = 100; 
          if (currentProblem.difficulty === 'Medium') points = 200;
          if (currentProblem.difficulty === 'Hard') points = 300;
          
          const streakBonus = Math.min(streak * 10, 200);
          const newScore = score + points + streakBonus;
          
          setScore(newScore);
          setStreak(s => s + 1);
          setMaxStreak(s => Math.max(s, streak + 1));
          setCorrectCount(c => c + 1);

          // Mode specific bonuses
          if (gameMode === 'SURVIVAL') {
              setTimeLeft(t => t + 5); // +5s per correct answer
          }

          // Next Problem
          handleNewProblem();
      }
  };

  // Calculate WPM
  const calculateStats = (): GameStats => {
      const timeInMinutes = (gameMode === 'ZEN' ? elapsedTime : (
          gameMode === 'DAILY' ? (120 - timeLeft) : 
          gameMode === 'TIME_ATTACK' ? (60 - timeLeft) : 
          (startTime ? (Date.now() - startTime)/1000 : 1)
      )) / 60;
      
      const safeTime = Math.max(timeInMinutes, 0.1); // Avoid div by zero
      const wpm = Math.round((charCountRef.current / 5) / safeTime);
      
      return {
          wpm,
          accuracy: 100, // Simplification: Only correct submits count
          correctCount,
          score,
          streak,
          maxStreak,
          timeElapsed: Math.floor(timeInMinutes * 60)
      };
  };


  const renderSidebarItem = (targetMode: ViewMode, icon: React.ReactNode, label: string) => (
    <button
      onClick={() => setMode(targetMode)}
      className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200 ${
        mode === targetMode
          ? 'bg-indigo-50 text-indigo-600 dark:bg-indigo-950/50 dark:text-indigo-400 font-semibold'
          : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800/50'
      }`}
    >
      {icon}
      <span>{label}</span>
    </button>
  );

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex flex-col md:flex-row font-sans overflow-hidden">
      
      {/* Mobile Header */}
      <div className="md:hidden bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 p-4 flex items-center justify-between">
        <h1 className="font-bold text-xl text-indigo-600 dark:text-indigo-400 flex items-center gap-2">
            <Keyboard className="w-6 h-6" /> TeXFlow
        </h1>
      </div>

      {/* Sidebar */}
      <aside className="hidden md:flex flex-col w-64 bg-white dark:bg-slate-900 border-r border-slate-200 dark:border-slate-800 p-4 z-10">
        <div className="mb-8 px-2">
           <h1 className="font-bold text-2xl text-indigo-600 dark:text-indigo-400 flex items-center gap-2">
             <Keyboard className="w-8 h-8" /> TeXFlow
           </h1>
           <p className="text-xs text-slate-500 mt-1 ml-10">Flow state typesetting</p>
        </div>

        <nav className="space-y-2 flex-1">
          {renderSidebarItem(ViewMode.PRACTICE, <Trophy size={20}/>, 'Arena')}
          {renderSidebarItem(ViewMode.PLAYGROUND, <Play size={20}/>, 'Playground')}
          {renderSidebarItem(ViewMode.MACROS, <Settings size={20}/>, 'Configure Macros')}
        </nav>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col h-[calc(100vh-60px)] md:h-screen overflow-hidden relative">
        
        {/* Mobile Nav Tabs */}
        <div className="md:hidden flex border-b border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900">
            <button onClick={() => setMode(ViewMode.PRACTICE)} className={`flex-1 py-3 text-sm font-medium border-b-2 ${mode === ViewMode.PRACTICE ? 'border-indigo-500 text-indigo-600' : 'border-transparent text-slate-500'}`}>Arena</button>
            <button onClick={() => setMode(ViewMode.PLAYGROUND)} className={`flex-1 py-3 text-sm font-medium border-b-2 ${mode === ViewMode.PLAYGROUND ? 'border-indigo-500 text-indigo-600' : 'border-transparent text-slate-500'}`}>Playground</button>
            <button onClick={() => setMode(ViewMode.MACROS)} className={`flex-1 py-3 text-sm font-medium border-b-2 ${mode === ViewMode.MACROS ? 'border-indigo-500 text-indigo-600' : 'border-transparent text-slate-500'}`}>Macros</button>
        </div>

        {/* View: Playground */}
        {mode === ViewMode.PLAYGROUND && (
          <div className="flex-1 flex flex-col md:flex-row overflow-hidden">
            {/* Editor Pane */}
            <div className="flex-1 flex flex-col border-b md:border-b-0 md:border-r border-slate-200 dark:border-slate-800 relative bg-white dark:bg-slate-900">
               <div className="absolute top-0 left-0 right-0 h-8 bg-gradient-to-b from-white dark:from-slate-900 to-transparent z-10 pointer-events-none" />
               <Editor 
                  value={playgroundInput} 
                  onChange={setPlaygroundInput} 
                  macros={macros} 
                  autoFocus
                  className="text-slate-800 dark:text-slate-200 leading-relaxed"
                  placeholder={"Start typing...\n\nTips:\n• 'mk' for inline math ($...$)\n• 'dm' for display math ($$...$$)\n• Tab inside Matrix to insert &"}
                  forceMath={false}
               />
               <div className="p-4 border-t border-slate-200 dark:border-slate-800 flex justify-between items-center bg-slate-50 dark:bg-slate-950">
                  <span className="text-xs text-slate-400">{playgroundInput.length} chars</span>
               </div>
            </div>

            {/* Preview Pane */}
            <div className="flex-1 flex flex-col bg-slate-50 dark:bg-slate-950 overflow-y-auto">
               <div className="p-8 flex-1 flex items-center justify-center min-h-[300px]">
                  {playgroundInput ? (
                    <div className="w-full max-w-2xl">
                        <LatexPreview latex={playgroundInput} mode="markdown" className="text-xl md:text-2xl text-slate-800 dark:text-slate-100" />
                    </div>
                  ) : (
                    <div className="text-slate-400 flex flex-col items-center">
                        <Play className="w-12 h-12 mb-4 opacity-20" />
                        <p>Preview will appear here</p>
                    </div>
                  )}
               </div>
            </div>
          </div>
        )}

        {/* View: Practice Arena */}
        {mode === ViewMode.PRACTICE && (
            <div className="flex-1 flex flex-col p-4 md:p-8 overflow-y-auto bg-slate-50 dark:bg-slate-950">
                
                {gameState === 'FINISHED' ? (
                    <div className="h-full flex items-center justify-center">
                        <ResultsPanel 
                            stats={calculateStats()} 
                            gameMode={gameMode}
                            onRestart={() => startGame(gameMode)}
                            onChangeMode={() => setGameState('IDLE')}
                        />
                    </div>
                ) : gameState === 'IDLE' ? (
                    // --- MODE SELECTION MENU ---
                    <div className="max-w-4xl mx-auto w-full h-full flex flex-col justify-center">
                        <div className="text-center mb-12">
                            <h2 className="text-4xl font-bold text-slate-800 dark:text-slate-100 mb-4">Enter the Arena</h2>
                            <p className="text-slate-500 dark:text-slate-400 text-lg">Choose your challenge mode to improve your LaTeX speed.</p>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {/* ZEN MODE */}
                            <button 
                                onClick={() => startGame('ZEN')}
                                className="group relative p-6 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 hover:border-indigo-500 dark:hover:border-indigo-500 transition-all shadow-sm hover:shadow-lg text-left"
                            >
                                <div className="p-3 bg-indigo-50 dark:bg-indigo-900/20 w-fit rounded-xl text-indigo-600 dark:text-indigo-400 mb-4 group-hover:scale-110 transition-transform">
                                    <BookOpen size={32} />
                                </div>
                                <h3 className="text-xl font-bold text-slate-800 dark:text-slate-100 mb-2">Zen Practice</h3>
                                <p className="text-sm text-slate-500 dark:text-slate-400">Unlimited time, random selection of curated and procedural problems. Focus on accuracy and macro building.</p>
                            </button>

                            {/* TIME ATTACK */}
                            <button 
                                onClick={() => startGame('TIME_ATTACK')}
                                className="group relative p-6 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 hover:border-pink-500 dark:hover:border-pink-500 transition-all shadow-sm hover:shadow-lg text-left"
                            >
                                <div className="p-3 bg-pink-50 dark:bg-pink-900/20 w-fit rounded-xl text-pink-600 dark:text-pink-400 mb-4 group-hover:scale-110 transition-transform">
                                    <Timer size={32} />
                                </div>
                                <h3 className="text-xl font-bold text-slate-800 dark:text-slate-100 mb-2">Time Attack</h3>
                                <p className="text-sm text-slate-500 dark:text-slate-400">60 Seconds on the clock. Solve as many expressions as possible. Speed is key.</p>
                            </button>

                            {/* SURVIVAL */}
                            <button 
                                onClick={() => startGame('SURVIVAL')}
                                className="group relative p-6 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 hover:border-orange-500 dark:hover:border-orange-500 transition-all shadow-sm hover:shadow-lg text-left"
                            >
                                <div className="p-3 bg-orange-50 dark:bg-orange-900/20 w-fit rounded-xl text-orange-600 dark:text-orange-400 mb-4 group-hover:scale-110 transition-transform">
                                    <Zap size={32} />
                                </div>
                                <h3 className="text-xl font-bold text-slate-800 dark:text-slate-100 mb-2">Survival</h3>
                                <p className="text-sm text-slate-500 dark:text-slate-400">Start with 30s. Each correct answer adds +5s. How long can you last?</p>
                            </button>

                            {/* DAILY */}
                            <button 
                                onClick={() => startGame('DAILY')}
                                className="group relative p-6 bg-gradient-to-br from-indigo-600 to-purple-700 rounded-2xl border border-transparent text-white shadow-lg hover:shadow-indigo-500/30 transition-all text-left"
                            >
                                <div className="flex justify-between items-start">
                                    <div className="p-3 bg-white/20 w-fit rounded-xl text-white mb-4 group-hover:scale-110 transition-transform">
                                        <Calendar size={32} />
                                    </div>
                                    <div className="px-3 py-1 bg-white/20 rounded-full text-xs font-bold uppercase tracking-wider backdrop-blur-sm">
                                        Ranked
                                    </div>
                                </div>
                                <h3 className="text-xl font-bold text-white mb-2">Daily Challenge</h3>
                                <p className="text-sm text-indigo-100">Everyone gets the same seed. Compete on the daily leaderboard for glory.</p>
                            </button>
                        </div>
                    </div>
                ) : (
                    // --- ACTIVE GAMEPLAY ---
                    <div className="max-w-5xl mx-auto w-full space-y-6 animate-in fade-in duration-300">
                        
                        <div className="flex items-center justify-between">
                             <button onClick={endGame} className="text-sm text-slate-500 hover:text-red-500 font-medium px-2 py-1 rounded hover:bg-red-50 dark:hover:bg-red-950/30 transition-colors">
                                &larr; End Session
                             </button>
                             <div className="flex items-center gap-2">
                                <span className="text-xs font-bold uppercase text-slate-400 bg-slate-100 dark:bg-slate-800 px-2 py-1 rounded">
                                    {gameMode.replace('_', ' ')}
                                </span>
                             </div>
                        </div>

                        <GameHUD 
                            timeLeft={timeLeft} 
                            score={score} 
                            streak={streak}
                            wpm={calculateStats().wpm}
                            gameMode={gameMode}
                        />

                        <div className="flex flex-col gap-6">
                            {/* Problem Card */}
                            <div className="flex flex-col bg-white dark:bg-slate-900 rounded-2xl shadow-lg border border-slate-200 dark:border-slate-800 overflow-hidden relative min-h-[200px]">
                                <div className="absolute top-0 left-0 w-full h-1 bg-slate-100 dark:bg-slate-800">
                                    <div className="h-full bg-indigo-500 transition-all duration-1000" style={{ width: `${(timeLeft / 60) * 100}%` }} />
                                </div>
                                <div className="p-2 flex items-center justify-center border-b border-slate-100 dark:border-slate-800">
                                    <span className="text-xs font-bold text-slate-400 uppercase tracking-wide">{currentProblem.description || currentProblem.category}</span>
                                </div>
                                <div className="flex-1 flex items-center justify-center p-8 overflow-x-auto">
                                    <LatexPreview latex={currentProblem.latex} className="text-3xl md:text-4xl text-slate-800 dark:text-slate-100 transition-all" />
                                </div>
                            </div>

                            {/* Input Card */}
                            <div className={`flex flex-col rounded-2xl transition-all duration-100 border-2 overflow-hidden shadow-lg h-[450px] ${
                                practiceInput && normalizeLatex(practiceInput) === normalizeLatex(currentProblem.latex) 
                                ? 'border-green-500 ring-4 ring-green-500/20' 
                                : 'border-slate-200 dark:border-slate-800 focus-within:border-indigo-500 focus-within:ring-4 focus-within:ring-indigo-500/20'
                            } bg-white dark:bg-slate-900`}>
                                
                                {/* Live Render Preview */}
                                <div className="h-32 bg-slate-50 dark:bg-slate-950 border-b border-slate-200 dark:border-slate-800 flex items-center justify-center overflow-hidden px-4 relative group">
                                     {practiceInput ? (
                                        <LatexPreview latex={practiceInput} className="text-xl md:text-2xl text-slate-700 dark:text-slate-300" />
                                     ) : (
                                        <span className="text-slate-400 text-sm italic opacity-50 select-none">Your output render...</span>
                                     )}
                                     <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                         <span className="text-[10px] font-mono text-slate-400 bg-white dark:bg-slate-900 px-1 rounded border border-slate-200 dark:border-slate-800">Preview</span>
                                     </div>
                                </div>

                                {/* Editor */}
                                <div className="flex-1 relative">
                                    <Editor 
                                        value={practiceInput} 
                                        onChange={handlePracticeInput} 
                                        macros={macros} 
                                        autoFocus
                                        className="text-xl md:text-2xl h-full rounded-none border-0 shadow-none"
                                        placeholder="Type LaTeX..."
                                        forceMath={true}
                                    />
                                </div>
                            </div>
                        </div>
                        
                        {/* Hint / Visual Feedback */}
                        <div className="text-center h-6">
                             {streak > 1 && (
                                 <span className="text-sm font-medium text-orange-500 animate-pulse">
                                     Combo {streak}! Keep the flow!
                                 </span>
                             )}
                        </div>

                    </div>
                )}
            </div>
        )}

        {/* View: Macros */}
        {mode === ViewMode.MACROS && (
             <div className="flex-1 p-4 md:p-8 overflow-hidden flex flex-col">
                <div className="max-w-4xl mx-auto w-full h-full flex flex-col">
                    <div className="mb-6">
                        <h2 className="text-2xl font-bold text-slate-800 dark:text-slate-100">Macro Configuration</h2>
                        <p className="text-slate-500 dark:text-slate-400">Define text shortcuts to speed up your LaTeX workflow.</p>
                    </div>
                    <div className="flex-1 min-h-0">
                        <MacrosPanel macros={macros} setMacros={handleSetMacros} onClose={() => setMode(ViewMode.PLAYGROUND)} />
                    </div>
                </div>
             </div>
        )}

      </main>
    </div>
  );
}
