import { useEffect, useMemo, useState } from 'react';
import { Session, PlayerId, User, Group } from '../types';
import { computeTotals } from '../lib/stats';
import { loadSessions } from '../lib/storage';
import { Toaster } from 'react-hot-toast';
import PlayerStatsModal from './PlayerStatsModal';
import SessionForm from './SessionForm';
import Leaderboard from './Leaderboard';
import SessionList from './SessionList';

interface Props {
  group: Group;
  user: User;
  onLogout: () => void;
  onBackToHub: () => void;
}

export default function Tracker({ group, user, onLogout, onBackToHub }: Props) {
  const [sessions, setSessions] = useState<Session[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingSession, setEditingSession] = useState<Session | null>(null);
  const [viewingPlayer, setViewingPlayer] = useState<PlayerId | null>(null);
  const [showForm, setShowForm] = useState(false);

  const totals = useMemo(() => computeTotals(sessions), [sessions]);
  const existingPlayers = useMemo(() => totals.map(t => t.player), [totals]);

  // Hook pour charger les sessions (inchangé)
  useEffect(() => {
    if (!group) return;
    setLoading(true);
    loadSessions(group.id).then(loadedSessions => {
      loadedSessions.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
      setSessions(loadedSessions);
      setLoading(false);
    });
  }, [group]);

  function onSaved(savedOrUpdatedSession: Session) { /* ... (inchangé) ... */ }
  function onDeleted(id: string) { /* ... (inchangé) ... */ }
  function handleEdit(session: Session) { /* ... (inchangé) ... */ }
  function handlePlayerClick(player: PlayerId) { /* ... (inchangé) ... */ }

  return (
    <div className="container space-y-4">
      <Toaster position="bottom-center" toastOptions={{ duration: 2000 }} />
      <header className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">🏸 {group.name}</h1>
        <div className="flex items-center gap-2">
          <button className="btn" onClick={onBackToHub}>&larr; Hub</button>
          <button className="btn" onClick={onLogout}>Déconnexion</button>
        </div>
      </header>

      {(showForm || editingSession) ? (
        <SessionForm
          onSaved={onSaved}
          existingPlayers={existingPlayers}
          sessionToEdit={editingSession}
          onCancelEdit={() => {
            setEditingSession(null);
            setShowForm(false);
          }}
          groupId={group.id}
        />
      ) : (
        <div className="card">
          <button
            className="btn w-full font-medium text-center"
            onClick={() => setShowForm(true)}
          >
            + Ajouter une nouvelle séance
          </button>
        </div>
      )}

      {/* --- AMÉLIORATION DE L'INTERFACE (ÉTAT VIDE) --- */}
      {loading ? (
        <div className="card text-center text-gray-500">Chargement...</div>
      ) : sessions.length === 0 ? (
        // Si pas de sessions, on affiche un message engageant
        <div className="card text-center text-gray-500">
          <h3 className="text-lg font-medium">Prêt à jouer ?</h3>
          <p className="mt-1">Ajoutez votre première séance pour voir le classement apparaître ici.</p>
        </div>
      ) : (
        // Sinon, on affiche le classement et l'historique
        <>
          <Leaderboard totals={totals} onPlayerClick={handlePlayerClick} />
          <SessionList sessions={sessions} onDeleted={onDeleted} onEdit={handleEdit} />
        </>
      )}
      {/* ------------------------------------------------ */}

      {viewingPlayer && (
        <PlayerStatsModal
          player={viewingPlayer}
          allSessions={sessions}
          onClose={() => setViewingPlayer(null)}
        />
      )}

      <footer className="text-xs text-gray-500 text-center py-4">
        Groupe ID: {group.id}
      </footer>
    </div>
  );
}