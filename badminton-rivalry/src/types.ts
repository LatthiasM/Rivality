// La correction clé : 'string' devient string (sans guillemets)
export type PlayerId = string;


export interface Match {
  id: string; // unique id
  date: string; // ISO date
  a: PlayerId;
  b: PlayerId;
  scoreA: number;
  scoreB: number;
}


export interface Session {
  id: string; // unique id
  date: string; // ISO date
  matches: Match[]; // N'est plus limité à 3
  notes?: string;
}


export interface Totals {
  player: PlayerId;
  played: number;
  wins: number;
  losses: number;
  // Les champs manquants ont été ajoutés ici :
  pointsFor: number;
  pointsAgainst: number;
  diff: number;
}

// --- Nouveaux types pour les stats H2H ---
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