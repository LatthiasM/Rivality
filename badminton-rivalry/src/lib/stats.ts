import { Match, PlayerId, Session, Totals, PlayerH2HStats, H2HMatchup } from '../types';

export function computeTotals(sessions: Session[]): Totals[] {
  const map = new Map<PlayerId, Totals>();

  // Fonction interne pour obtenir ou créer un joueur dans notre 'map' de classement
  function getPlayerTotals(name: PlayerId): Totals {
    if (!map.has(name)) {
      // Si le joueur n'est pas dans le 'map', on le crée à la volée
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

  // On parcourt toutes les sessions et tous les matchs
  for (const s of sessions) {
    for (const m of s.matches) {
      // On s'assure que les joueurs existent dans notre 'map' (on les crée si besoin)
      const a = getPlayerTotals(m.a);
      const b = getPlayerTotals(m.b);
      
      // On applique la logique de calcul comme avant
      a.played++; b.played++;
      a.pointsFor += m.scoreA; a.pointsAgainst += m.scoreB;
      b.pointsFor += m.scoreB; b.pointsAgainst += m.scoreA;
      if (m.scoreA > m.scoreB) { a.wins++; b.losses++; } else if (m.scoreB > m.scoreA) { b.wins++; a.losses++; }
    }
  }

  // On calcule la différence de points pour chaque joueur trouvé
  for (const p of map.keys()) {
    const t = map.get(p)!;
    t.diff = t.pointsFor - t.pointsAgainst;
  }
  
  // On retourne le tableau trié, comme avant
  return Array.from(map.values()).sort((x,y)=> y.wins - x.wins || y.diff - x.diff || y.pointsFor - x.pointsFor);
}

export function newSession(dateISO?: string): Session {
  const date = dateISO ?? new Date().toISOString();
  return {
    id: crypto.randomUUID(),
    date,
    matches: [], // Le formulaire gérera l'ajout de matchs
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

  // Map pour stocker les stats par adversaire
  const map = new Map<PlayerId, H2HMatchup>();

  // Fonction interne pour obtenir ou créer un adversaire dans le map
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

  // On parcourt tous les matchs de toutes les sessions
  for (const s of sessions) {
    for (const m of s.matches) {
      // Si notre joueur n'est pas dans ce match, on l'ignore
      if (m.a !== player && m.b !== player) {
        continue;
      }

      // Notre joueur est dans le match
      stats.totalPlayed++;
      
      const isPlayerA = m.a === player;
      const opponentName = isPlayerA ? m.b : m.a;
      const opponent = getOpponent(opponentName); // On récupère l'adversaire

      const playerScore = isPlayerA ? m.scoreA : m.scoreB;
      const opponentScore = isPlayerA ? m.scoreB : m.scoreA;

      opponent.played++;
      opponent.pointsFor += playerScore;
      opponent.pointsAgainst += opponentScore;

      // On met à jour les victoires/défaites
      if (playerScore > opponentScore) {
        stats.totalWins++;
        opponent.wins++;
      } else if (opponentScore > playerScore) {
        stats.totalLosses++;
        opponent.losses++;
      }
    }
  }

  // Une fois tous les matchs comptés, on calcule les 'diff'
  for (const matchup of map.values()) {
    matchup.diff = matchup.pointsFor - matchup.pointsAgainst;
    stats.totalDiff += matchup.diff;
  }

  // On trie les face-à-face (ex: par plus de victoires)
  stats.matchups = Array.from(map.values()).sort((a,b) => b.wins - a.wins || b.diff - a.diff);
  return stats;
}