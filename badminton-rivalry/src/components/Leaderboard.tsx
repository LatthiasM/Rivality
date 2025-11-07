import { Totals, PlayerId } from '../types'; // <--- Importer PlayerId

// --- 1. Définir une interface pour les Props ---
interface Props {
  totals: Totals[];
  onPlayerClick: (player: PlayerId) => void;
}

export default function Leaderboard({ totals, onPlayerClick }: Props) { // <--- 2. Utiliser les nouvelles props
  return (
    <div className="card">
      <h2 className="text-xl font-semibold mb-3">Classement</h2>
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="text-left border-b border-gray-200 dark:border-gray-700">
              <th className="py-2">#</th>
              <th>Joueur</th>
              <th>J</th>
              <th>V</th>
              <th>D</th>
              <th>Pts +</th>
              <th>Pts -</th>
              <th>Diff</th>
            </tr>
          </thead>
          <tbody>
            {totals.map((t, i) => (
              <tr key={t.player} className="border-b border-gray-100 dark:border-gray-800">
                <td className="py-2">{i + 1}</td>
                
                {/* --- 3. Rendre le nom du joueur cliquable --- */}
                <td>
                  <button
                    type="button"
                    onClick={() => onPlayerClick(t.player)}
                    className="text-emerald-600 dark:text-emerald-500 hover:underline"
                  >
                    {t.player}
                  </button>
                </td>
                
                <td>{t.played}</td>
                <td>{t.wins}</td>
                <td>{t.losses}</td>
                <td>{t.pointsFor}</td>
                <td>{t.pointsAgainst}</td>
                <td className={t.diff >= 0 ? 'text-emerald-600' : 'text-rose-600'}>{t.diff}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}