import { Match, PlayerId, Session, Totals, PlayerH2HStats, H2HMatchup } from '../types';

export function computeTotals(sessions: Session[]): Totals[] {
  const map = new Map<PlayerId, Totals>();

  function getPlayerTotals(name: PlayerId): Totals {
    if (!map.has(name)) {
      map.set(name, {
        player: name,
        played: 0,
        wins: 0,
        losses: 0,
        pointsFor: 0,
        pointsAgainst: 0,
        diff: 0,
      });
    }
    return map.get(name)!;
  }

  for (const s of sessions) {
    for (const m of s.matches) {
      const a = getPlayerTotals(m.a);
      const b = getPlayerTotals(m.b);
      
      a.played++; b.played++;
      a.pointsFor += m.scoreA; a.pointsAgainst += m.scoreB;
      b.pointsFor += m.scoreB; b.pointsAgainst += m.scoreA;
      if (m.scoreA > m.scoreB) { a.wins++; b.losses++; } else if (m.scoreB > m.scoreA) { b.wins++; a.losses++; }
    }
  }

  for (const p of map.keys()) {
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
    group_id: '', // <--- CORRECTION ICI : Ajout du champ manquant
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

export function computePlayerH2H(player: PlayerId, sessions: Session[]): PlayerH2HStats {
  const stats: PlayerH2HStats = {
    player,
    totalWins: 0,
    totalLosses: 0,
    totalPlayed: 0,
    totalDiff: 0,
    matchups: [],
  };

  const map = new Map<PlayerId, H2HMatchup>();

  function getOpponent(name: PlayerId): H2HMatchup {
    if (!map.has(name)) {
      map.set(name, {
        opponent: name,
        wins: 0,
        losses: 0,
        pointsFor: 0,
        pointsAgainst: 0,
        played: 0,
        diff: 0,
      });
    }
    return map.get(name)!;
  }

  for (const s of sessions) {
    for (const m of s.matches) {
      if (m.a !== player && m.b !== player) {
        continue;
      }

      stats.totalPlayed++;
      
      const isPlayerA = m.a === player;
      const opponentName = isPlayerA ? m.b : m.a;
      const opponent = getOpponent(opponentName);

      const playerScore = isPlayerA ? m.scoreA : m.scoreB;
      const opponentScore = isPlayerA ? m.scoreB : m.scoreA;

      opponent.played++;
      opponent.pointsFor += playerScore;
      opponent.pointsAgainst += opponentScore;

      if (playerScore > opponentScore) {
        stats.totalWins++;
        opponent.wins++;
      } else if (opponentScore > playerScore) {
        stats.totalLosses++;
        opponent.losses++;
      }
    }
  }

  for (const matchup of map.values()) {
    matchup.diff = matchup.pointsFor - matchup.pointsAgainst;
    stats.totalDiff += matchup.diff;
  }

  stats.matchups = Array.from(map.values()).sort((a,b) => b.wins - a.wins || b.diff - a.diff);
  return stats;
}