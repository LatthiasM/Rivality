import { Match, PlayerId, Session, Totals } from '../types';

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