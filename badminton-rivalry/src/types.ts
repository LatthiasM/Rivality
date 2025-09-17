export type PlayerId = 'Matthias' | 'Paul' | 'Steven';


export interface Match {
id: string; // unique id
date: string; // ISO date
a: PlayerId;
b: PlayerId;
scoreA: number;
scoreB: number;
}


export interface Session { // triangle de matchs (3 matches)
id: string; // unique id
date: string; // ISO date
matches: Match[]; // exactement 3
notes?: string;
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