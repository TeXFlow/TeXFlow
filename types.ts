
export interface Macro {
  id?: string; // Optional because parsed snippets might not have IDs initially
  trigger: string | RegExp;
  replacement: string | ((match: string[]) => string);
  options?: string; // e.g., "mA", "rmA", "tA"
  description?: string;
  priority?: number;
}

export interface PracticeProblem {
  id: string;
  latex: string;
  category: string;
  difficulty: 'Easy' | 'Medium' | 'Hard';
  description?: string;
}

export enum ViewMode {
  PLAYGROUND = 'PLAYGROUND',
  PRACTICE = 'PRACTICE',
  MACROS = 'MACROS',
}

export interface EditorState {
  content: string;
  cursorPosition: number;
}

export type GameMode = 'ZEN' | 'TIME_ATTACK' | 'SURVIVAL' | 'DAILY';

export interface GameStats {
  wpm: number;
  accuracy: number;
  correctCount: number;
  timeElapsed: number;
  score: number;
  streak: number;
  maxStreak: number;
}

export interface LeaderboardEntry {
  rank: number;
  username: string;
  score: number;
  wpm: number;
  isUser: boolean;
  date?: string;
}
