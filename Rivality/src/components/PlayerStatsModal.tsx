import { useMemo } from 'react';
import { PlayerId, Session } from '../types';
import { computePlayerH2H } from '../lib/stats';

interface Props {
  player: PlayerId;
  allSessions: Session[];
  onClose: () => void;
}

export default function PlayerStatsModal({ player, allSessions, onClose }: Props) {
  // On calcule les stats H2H et on les mémorise
  const stats = useMemo(() => {
    return computePlayerH2H(player, allSessions);
  }, [player, allSessions]);

  return (
    <>
      {/* L'arrière-plan semi-transparent qui ferme le modal au clic */}
      <div className="modal-overlay" onClick={onClose} />
      
      {/* Le contenu du modal */}
      <div className="modal-content">
        <div className="flex justify-between items-center">
          <h2 className="text-xl font-semibold">Stats de {player}</h2>
          <button className="btn !px-2 !py-1 text-xs" onClick={onClose}>
            Fermer
          </button>
        </div>
        
        {/* Résumé global */}
        <div className="flex gap-4 justify-center text-center">
          <div>
            <div className="text-2xl font-bold">{stats.totalPlayed}</div>
            <div className="text-xs opacity-70">Joués</div>
          </div>
          <div>
            <div className="text-2xl font-bold text-emerald-600">{stats.totalWins}</div>
            <div className="text-xs opacity-70">Victoires</div>
          </div>
          <div>
            <div className="text-2xl font-bold text-rose-600">{stats.totalLosses}</div>
            <div className="text-xs opacity-70">Défaites</div>
          </div>
          <div>
            <div className={`text-2xl font-bold ${stats.totalDiff >= 0 ? 'text-emerald-600' : 'text-rose-600'}`}>{stats.totalDiff > 0 ? '+' : ''}{stats.totalDiff}</div>
            <div className="text-xs opacity-70">Diff. Pts</div>
          </div>
        </div>

        {/* Tableau des face-à-face */}
        <h3 className="text-lg font-medium pt-2">Face-à-face</h3>
        <div className="overflow-x-auto max-h-60">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left border-b border-gray-200 dark:border-gray-700">
                <th className="py-1">Adversaire</th>
                <th>V</th>
                <th>D</th>
                <th>Pts +</th>
                <th>Pts -</th>
                <th>Diff</th>
              </tr>
            </thead>
            <tbody>
              {stats.matchups.map(m => (
                <tr key={m.opponent} className="border-b border-gray-100 dark:border-gray-800">
                  <td className="py-2">{m.opponent}</td>
                  <td className="text-emerald-600">{m.wins}</td>
                  <td className="text-rose-600">{m.losses}</td>
                  <td>{m.pointsFor}</td>
                  <td>{m.pointsAgainst}</td>
                  <td className={m.diff >= 0 ? 'text-emerald-600' : 'text-rose-600'}>{m.diff > 0 ? '+' : ''}{m.diff}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </>
  );
}