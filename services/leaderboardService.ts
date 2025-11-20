
import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { GameMode, LeaderboardEntry } from '../types';

const USERNAME_KEY = 'texflow_username';

// ============================================================================
// ⚡️ SETUP INSTRUCTIONS ⚡️
// 1. The URL is already set below based on your message.
// 2. Go to Supabase -> Settings -> API.
// 3. Copy "anon public" Key (starts with eyJ...) and paste it below.
// ============================================================================

const SUPABASE_URL: string = "https://nfgozrkoqmvgtpqhxugh.supabase.co"; 
const SUPABASE_ANON_KEY: string = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5mZ296cmtvcW12Z3RwcWh4dWdoIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjM2NzI3NzksImV4cCI6MjA3OTI0ODc3OX0.d4BbvCmyUFYs-Jvj3-g4F7cjYHKiqR67ohfHf1kWG38";

export const getStoredUsername = (): string => {
    return localStorage.getItem(USERNAME_KEY) || 'Anonymous';
};

export const setStoredUsername = (name: string) => {
    localStorage.setItem(USERNAME_KEY, name);
};

// We use a singleton client since the config is now static
let clientInstance: SupabaseClient | null = null;

export const getClient = (): SupabaseClient | null => {
    if (clientInstance) return clientInstance;
    
    // Check if user actually configured it in the code
    if (SUPABASE_ANON_KEY.includes("REPLACE_WITH") || SUPABASE_ANON_KEY === "") {
        console.warn("⚠️ Supabase Anon Key is missing. Please update services/leaderboardService.ts");
        return null;
    }
    
    try {
        clientInstance = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
        return clientInstance;
    } catch (e) {
        console.error("Failed to initialize Supabase client", e);
        return null;
    }
};

export const fetchGlobalLeaderboard = async (mode: GameMode): Promise<LeaderboardEntry[]> => {
    const client = getClient();
    if (!client) {
        // Fail silently or throw specific error handled by UI
        throw new Error("Supabase keys not configured in code.");
    }

    // Schema assumption: 'scores' table
    // columns: username (text), score (int), wpm (int), mode (text), created_at (timestamp)
    const { data, error } = await client
        .from('scores')
        .select('*')
        .eq('mode', mode)
        .order('score', { ascending: false })
        .limit(20);

    if (error) throw error;

    return data.map((row: any, index: number) => ({
        rank: index + 1,
        username: row.username || 'Anonymous',
        score: row.score,
        wpm: row.wpm,
        isUser: false, // This will be handled by the UI comparing usernames
        date: row.created_at
    }));
};

export const submitGlobalScore = async (username: string, score: number, wpm: number, mode: GameMode) => {
    const client = getClient();
    if (!client) return;

    const { error } = await client.from('scores').insert({
        username,
        score,
        wpm,
        mode
    });
    
    if (error) throw error;
};
