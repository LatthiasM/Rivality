import { Session } from '../types';
import { createClient } from '@supabase/supabase-js';

const USE_SUPABASE = !!(import.meta.env.VITE_SUPABASE_URL && import.meta.env.VITE_SUPABASE_ANON_KEY);

// --- Local Storage fallback ---
const LS_KEY = 'badminton_sessions_v1';

function loadLocal(): Session[] {
  const raw = localStorage.getItem(LS_KEY);
  return raw ? (JSON.parse(raw) as Session[]) : [];
}

function saveLocal(sessions: Session[]) {
  localStorage.setItem(LS_KEY, JSON.stringify(sessions));
}

// --- Supabase optional ---
const supabase = USE_SUPABASE
  ? createClient(import.meta.env.VITE_SUPABASE_URL!, import.meta.env.VITE_SUPABASE_ANON_KEY!)
  : null;

export async function loadSessions(): Promise<Session[]> {
  if (!USE_SUPABASE || !supabase) return loadLocal();
  const { data, error } = await supabase.from('sessions').select();
  if (error) {
    console.error(error);
    return [];
  }
  return (data as unknown as Session[]) ?? [];
}

export async function saveSession(s: Session): Promise<void> {
  if (!USE_SUPABASE || !supabase) {
    const list = loadLocal();
    list.push(s);
    saveLocal(list);
    return;
  }
  const { error } = await supabase.from('sessions').insert(s as any);
  if (error) console.error(error);
}

export async function deleteSession(id: string): Promise<void> {
  if (!USE_SUPABASE || !supabase) {
    const list = loadLocal().filter(s => s.id !== id);
    saveLocal(list);
    return;
  }
  const { error } = await supabase.from('sessions').delete().eq('id', id);
  if (error) console.error(error);
}
