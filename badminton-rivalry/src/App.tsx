import { useEffect, useMemo, useState } from 'react';
import './styles.css';
import SessionForm from './components/SessionForm';
import Leaderboard from './components/Leaderboard';
import SessionList from './components/SessionList';
import { Session, PlayerId } from './types';
import { computeTotals } from './lib/stats';
import { loadSessions } from './lib/storage';
import { Toaster } from 'react-hot-toast';
import PlayerStatsModal from './components/PlayerStatsModal'; // <--- Importer le nouveau composant

export default function App() {
  const [sessions, setSessions] = useState<Session[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingSession, setEditingSession] = useState<Session | null>(null);
  const [viewingPlayer, setViewingPlayer] = useState<PlayerId | null>(null);
  const [showForm, setShowForm] = useState(false);
  const totals = useMemo(()=> computeTotals(sessions), [sessions]);
  const existingPlayers = useMemo(() => totals.map(t => t.player), [totals]);

  // ... (useEffect, onSaved, onDeleted, handleEdit sont inchangés) ...
  useEffect(()=>{ 
    (async()=>{ 
      setLoading(true);
      const loadedSessions = await loadSessions();
      loadedSessions.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
      setSessions(loadedSessions); 
      setLoading(false);
    })(); 
  }, []);

  function onSaved(savedOrUpdatedSession: Session) {
    const exists = sessions.some(s => s.id === savedOrUpdatedSession.id);
    if (exists) {
      setSessions(prev => 
        prev.map(s => s.id === savedOrUpdatedSession.id ? savedOrUpdatedSession : s)
      );
    } else {
      setSessions(prev => [savedOrUpdatedSession, ...prev]);
    }
    setEditingSession(null);
  }

  function onDeleted(id: string) {
    setSessions(prev => prev.filter(s => s.id !== id));
    if (editingSession?.id === id) {
      setEditingSession(null);
    }
  }
  
  function handleEdit(session: Session) {
    setEditingSession(session);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }
  
  function handlePlayerClick(player: PlayerId) {
    setViewingPlayer(player);
  }

  return (
    <div className="container space-y-4">
      <Toaster position="bottom-center" toastOptions={{ duration: 2000 }} />

      <header className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">🏸 Badminton Rivalry Tracker</h1>
        <a className="btn" href="https://github.com/" target="_blank" rel="noreferrer">Exporter / Git</a>
      </header>

            {/* On affiche le formulaire SEULEMENT si showForm est vrai OU si on est en mode édition */}
      {(showForm || editingSession) ? (
        <SessionForm
          onSaved={onSaved}
          existingPlayers={existingPlayers}
          sessionToEdit={editingSession}
          onCancelEdit={() => {
            setEditingSession(null);
            setShowForm(false); // On ferme aussi le formulaire
          }}
        />
      ) : (
        // Sinon, on affiche un simple bouton
        <div className="card text-center">
          <button
            className="btn w-full font-medium"
            onClick={() => setShowForm(true)}
          >
            + Ajouter une nouvelle séance
          </button>
        </div>
      )}
      
      <Leaderboard 
        totals={totals} 
        onPlayerClick={handlePlayerClick} 
      />
      
      {loading ? (
        <div className="card text-center text-gray-500">
          Chargement de l'historique...
        </div>
      ) : (
        <SessionList 
          sessions={sessions} 
          onDeleted={onDeleted}
          onEdit={handleEdit}
        />
      )}

      {/* --- MODAL (remplace le texte de débogage) --- */}
      {viewingPlayer && (
        <PlayerStatsModal 
          player={viewingPlayer}
          allSessions={sessions}
          onClose={() => setViewingPlayer(null)}
        />
      )}

      <footer className="text-xs text-gray-500 text-center py-4">Fait avec React + TS + Tailwind – LocalStorage (Supabase optionnel)</footer>
    </div>
  );
}