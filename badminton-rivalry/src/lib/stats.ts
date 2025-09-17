import { Match, PlayerId, Session, Totals } from '../types';


export const PLAYERS: PlayerId[] = ['Matthias', 'Paul', 'Steven'];


export function computeTotals(sessions: Session[]): Totals[] {
const map = new Map<PlayerId, Totals>();
for (const p of PLAYERS) {
map.set(p, { player: p, played: 0, wins: 0, losses: 0, pointsFor: 0, pointsAgainst: 0, diff: 0 });
}
for (const s of sessions) {
for (const m of s.matches) {
const a = map.get(m.a)!;
const b = map.get(m.b)!;
a.played++; b.played++;
a.pointsFor += m.scoreA; a.pointsAgainst += m.scoreB;
b.pointsFor += m.scoreB; b.pointsAgainst += m.scoreA;
if (m.scoreA > m.scoreB) { a.wins++; b.losses++; } else if (m.scoreB > m.scoreA) { b.wins++; a.losses++; }
}
}
for (const p of PLAYERS) {
const t = map.get(p)!;
t.diff = t.pointsFor - t.pointsAgainst;
}
return Array.from(map.values()).sort((x,y)=> y.wins - x.wins || y.diff - x.diff || y.pointsFor - x.pointsFor);
}


export function newSession(dateISO?: string): Session {
const date = dateISO ?? new Date().toISOString();
return {
id: crypto.randomUUID(),
date,
matches: [],
};
}


export function newMatch(dateISO: string, a: PlayerId, b: PlayerId): Match {
return {
id: crypto.randomUUID(),
date: dateISO,
a, b,
scoreA: 0,
scoreB: 0,
};
}


export function trianglePairs(players: PlayerId[] = ['Matthias','Paul','Steven']): [PlayerId, PlayerId][] {
return [
[players[0], players[1]],
[players[1], players[2]],
[players[0], players[2]],
];
}