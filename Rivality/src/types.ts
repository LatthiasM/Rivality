import { User } from '@supabase/supabase-js';

export type { User };

// --- NOUVEAU : ROLES & CLUBS (Industrialisation) ---
export type UserRole = 'ADMIN' | 'COACH' | 'PLAYER';

export interface UserProfile {
  id: string; // Lie à auth.users
  email: string;
  username: string;
  avatar_url?: string;
  role: UserRole;
  club_id?: string; // Lien vers le club principal
}

export interface Club {
  id: string;
  name: string;
  sport: string; // ex: 'football', 'natation'
  logo_url?: string;
  primary_color?: string; // Branding
  subscription_status: 'FREE' | 'PREMIUM';
}

// --- NOUVEAU : ORGANISATEUR D'ÉVÈNEMENTS ---
export interface Event {
  id: string;
  club_id: string;
  created_by: string; // Coach ID
  title: string;
  start_time: string; // ISO String
  end_time: string;
  location: string; // ex: "Stade Municipal"
  type: 'MATCH' | 'TRAINING' | 'SOCIAL';
  description?: string;
}

export interface Convocation {
  id: string;
  event_id: string;
  user_id: string; // Joueur
  status: 'PENDING' | 'ACCEPTED' | 'DECLINED' | 'INJURED';
  reason?: string; // ex: "Malade"
}

// --- NOUVEAU : GAMIFICATION (Achievements) ---
export interface Achievement {
  id: string;
  code: string; // ex: 'GOAL_MACHINE'
  title: string;
  description: string;
  icon_emoji: string;
  condition_type: 'COUNT' | 'STREAK'; // Compteur ou Série
  target_value: number; // Valeur à atteindre
  sport_category?: string; // ex: 'football' ou null pour global
}

export interface UserAchievement {
  user_id: string;
  achievement_id: string;
  unlocked_at: string;
}

// ==========================================
// --- TON EXISTANT (Ne pas toucher) ---
// ==========================================

export type PlayerId = string;

export interface Group {
  id: string;
  name: string;
  created_by: string;
  sport_type: string;
}

export interface Match {
  id: string;
  date: string;
  a: PlayerId;
  b: PlayerId;
  scoreA: number;
  scoreB: number;
}

export interface Session {
  id: string;
  date: string;
  matches: Match[];
  notes?: string;
  group_id: string;
}

export interface Totals {
  player: PlayerId;
  played: number;
  wins: number;
  losses: number;
  pointsFor: number;
  pointsAgainst: number;
  diff: number;
}

export interface H2HMatchup {
  opponent: PlayerId;
  wins: number;
  losses: number;
  pointsFor: number;
  pointsAgainst: number;
  played: number;
  diff: number;
}

export interface PlayerH2HStats {
  player: PlayerId;
  totalWins: number;
  totalLosses: number;
  totalPlayed: number;
  totalDiff: number;
  matchups: H2HMatchup[];
}

// --- TYPES DE NATATION ---
export type NatationTrainingType = 'vitesse' | 'endurance' | 'technique';

export type VitesseBlock = {
  id: string;
  type: 'vitesse';
  nage: string;
  distance: number;
  temps: string;
};

export type EnduranceBlock = {
  id: string;
  type: 'endurance';
  nage: string;
  distance: number;
  series: number;
  tempsRepos: string;
};

export type TechniqueBlock = {
  id: string;
  type: 'technique';
  nage: string;
  exercice: string;
  distance: number;
};

export type SwimBlock = VitesseBlock | EnduranceBlock | TechniqueBlock;

export type NatationLogData = {
  trainingType: 'natation';
  warmingUp?: string;
  notes?: string;
  blocks: SwimBlock[];
};

// --- TYPES MUSCULATION ---
export type MusculationBlock = {
  id: string;
  exercice: string;
  series: number;
  reps: string;
  poids: string;
};

export type MusculationLogData = {
  trainingType: 'musculation';
  notes?: string;
  blocks: MusculationBlock[];
};

// Le 'data' de notre base de données
export type SoloLogData = NatationLogData | MusculationLogData | Record<string, unknown>;

export interface SoloLog {
  id: string;
  group_id: string;
  user_id: string;
  date: string;
  data: SoloLogData;
}