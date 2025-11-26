import { Session, Group, SoloLog } from '../types';
import { createClient } from '@supabase/supabase-js';

const USE_SUPABASE = !!(import.meta.env.VITE_SUPABASE_URL && import.meta.env.VITE_SUPABASE_ANON_KEY);

export const supabase = USE_SUPABASE
  ? createClient(import.meta.env.VITE_SUPABASE_URL!, import.meta.env.VITE_SUPABASE_ANON_KEY!)
  : null;

// --- Fonctions Local Storage (inchangées) ---
const LS_KEY = 'badminton_sessions_v1';
function loadLocal(): Session[] {
  const raw = localStorage.getItem(LS_KEY);
  return raw ? (JSON.parse(raw) as Session[]) : [];
}
function saveLocal(sessions: Session[]) {
  localStorage.setItem(LS_KEY, JSON.stringify(sessions));
}
// --------------------------------------------------

// Charge les groupes (hubs) dont l'utilisateur est membre
export async function loadGroups(): Promise<Group[]> {
  if (!USE_SUPABASE || !supabase) return [];
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return [];
  const { data, error } = await supabase
    .from('groups')
    .select(`
      id,
      name,
      created_by,
      sport_type,
      group_members!inner(user_id)
    `)
    .eq('group_members.user_id', user.id);
  if (error) {
    console.error('Erreur lors du chargement des groupes:', error);
    return [];
  }
  return data as Group[];
}

// Crée un nouveau groupe
export async function createGroup(name: string, sportType: string): Promise<Group | null> {
  if (!USE_SUPABASE || !supabase) return null;
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;

  const { data: newGroup, error: groupError } = await supabase
    .from('groups')
    .insert({ name: name, created_by: user.id, sport_type: sportType })
    .select()
    .single();
  if (groupError || !newGroup) {
    console.error('Erreur lors de la création du groupe:', groupError);
    return null;
  }

  const { error: memberError } = await supabase
    .from('group_members')
    .insert({ group_id: newGroup.id, user_id: user.id });
  if (memberError) { 
    console.error('Erreur lors de l\'ajout du membre:', memberError);
    return null; 
  }
  return newGroup as Group;
}

// Mettre à jour (Renommer) un groupe
export async function updateGroup(groupId: string, newName: string): Promise<Group | null> {
  if (!USE_SUPABASE || !supabase) return null;
  const { data, error } = await supabase
    .from('groups')
    .update({ name: newName })
    .eq('id', groupId)
    .select()
    .single();
    
  if (error) { console.error(error); return null; }
  return data as Group;
}

// Supprimer un groupe
export async function deleteGroup(groupId: string): Promise<boolean> {
  if (!USE_SUPABASE || !supabase) return false;
  const { error } = await supabase
    .from('groups')
    .delete()
    .eq('id', groupId);
    
  if (error) { console.error(error); return false; }
  return true;
}
// -------------------------------------------------

// Charge les sessions pour un groupe (Rivalité)
export async function loadSessions(groupId: string): Promise<Session[]> {
  if (!USE_SUPABASE || !supabase) return loadLocal();
  const { data, error } = await supabase
    .from('sessions')
    .select('*')
    .eq('group_id', groupId);
  if (error) {
    console.error(error);
    return [];
  }
  return (data as unknown as Session[]) ?? [];
}

// Sauvegarde une nouvelle session (Rivalité)
export async function saveSession(s: Session, groupId: string): Promise<void> {
  if (!USE_SUPABASE || !supabase) { /* ... */ return; }
  const sessionWithGroup = { ...s, group_id: groupId };
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { error } = await supabase.from('sessions').insert(sessionWithGroup as any);
  if (error) console.error(error);
}

// Supprime une session (Rivalité)
export async function deleteSession(id: string): Promise<void> {
  if (!USE_SUPABASE || !supabase) { /* ... */ return; }
  const { error } = await supabase.from('sessions').delete().eq('id', id);
  if (error) console.error(error);
}

// Met à jour une session (Rivalité)
export async function updateSession(s: Session): Promise<void> {
  if (!USE_SUPABASE || !supabase) { /* ... */ return; }
  if (!s.group_id) {
    console.error("Erreur : session à mettre à jour sans group_id.");
    return;
  }
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { error } = await supabase.from('sessions').update(s as any).eq('id', s.id);
  if (error) console.error(error);
}

// --- CRUD pour les Sports Solo ---

export async function loadSoloLogs(groupId: string): Promise<SoloLog[]> {
  if (!USE_SUPABASE || !supabase) return [];
  const { data, error } = await supabase
    .from('solo_logs')
    .select('*')
    .eq('group_id', groupId)
    .order('date', { ascending: false }); // Les plus récents en premier

  if (error) {
    console.error('Erreur lors du chargement des journaux solo:', error);
    return [];
  }
  return data as SoloLog[];
}

export async function createSoloLog(date: string, data: Record<string, any>, groupId: string): Promise<SoloLog | null> {
  if (!USE_SUPABASE || !supabase) return null;
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;

  const { data: newLog, error } = await supabase
    .from('solo_logs')
    .insert({
      date: date,
      data: data,
      group_id: groupId,
      user_id: user.id
    })
    .select()
    .single();
  
  if (error) {
    console.error('Erreur lors de la création du journal solo:', error);
    return null;
  }
  return newLog as SoloLog;
}

export async function updateSoloLog(id: string, date: string, data: Record<string, any>): Promise<SoloLog | null> {
  if (!USE_SUPABASE || !supabase) return null;
  const { data: updatedLog, error } = await supabase
    .from('solo_logs')
    .update({
      date: date,
      data: data
    })
    .eq('id', id)
    .select()
    .single();

  if (error) {
    console.error('Erreur lors de la mise à jour du journal solo:', error);
    return null;
  }
  return updatedLog as SoloLog;
}

export async function deleteSoloLog(id: string): Promise<boolean> {
  if (!USE_SUPABASE || !supabase) return false;
  const { error } = await supabase
    .from('solo_logs')
    .delete()
    .eq('id', id);

  if (error) {
    console.error('Erreur lors de la suppression du journal solo:', error);
    return false;
  }
  return true;
}