import { useEffect, useMemo, useState } from 'react';
import './styles.css';
import SessionForm from './components/SessionForm';
import Leaderboard from './components/Leaderboard';
import SessionList from './components/SessionList';
import { Session } from './types';
import { computeTotals } from './lib/stats';
import { loadSessions } from './lib/storage';
import { Toaster } from 'react-hot-toast';

export default function App() {
  const [sessions, setSessions] = useState<Session[]>([]);
  const [loading, setLoading] = useState(true);
  
  // --- 1. NOUVEL ÉTAT ---
  // Pour mémoriser la session qu'on est en train de modifier
  const [editingSession, setEditingSession] = useState<Session | null>(null);
  
  const totals = useMemo(()=> computeTotals(sessions), [sessions]);
  const existingPlayers = useMemo(() => totals.map(t => t.player), [totals]);

  useEffect(()=>{ 
    (async()=>{ 
      setLoading(true);
      const loadedSessions = await loadSessions();
      loadedSessions.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
      setSessions(loadedSessions); 
      setLoading(false);
    })(); 
  }, []);

  // --- 2. FONCTION ONSAVED MODIFIÉE ---
  // Gère à la fois la création et la mise à jour
  function onSaved(savedOrUpdatedSession: Session) {
    const exists = sessions.some(s => s.id === savedOrUpdatedSession.id);

    if (exists) {
      // C'est une MISE À JOUR : on remplace l'ancienne version
      setSessions(prev => 
        prev.map(s => s.id === savedOrUpdatedSession.id ? savedOrUpdatedSession : s)
      );
    } else {
      // C'est une NOUVELLE session : on l'ajoute au début
      setSessions(prev => [savedOrUpdatedSession, ...prev]);
    }
    
    // Dans les deux cas, on arrête le mode édition
    setEditingSession(null);
  }

  function onDeleted(id: string) {
    setSessions(prev => prev.filter(s => s.id !== id));
    // Au cas où on supprime la session qu'on est en train de modifier
    if (editingSession?.id === id) {
      setEditingSession(null);
    }
  }
  
  // --- 3. NOUVELLE FONCTION ---
  // Appelée par SessionList quand on clique sur "Modifier"
  function handleEdit(session: Session) {
    setEditingSession(session);
    // Bonus : on fait défiler la page vers le haut pour voir le formulaire
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  return (
    <div className="container space-y-4">
      <Toaster position="bottom-center" toastOptions={{ duration: 2000 }} />

      <header className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">🏸 Badminton Rivalry Tracker</h1>
        <a className="btn" href="https://github.com/" target="_blank" rel="noreferrer">Exporter / Git</a>
      </header>

      {/* --- 4. MODIFICATION DES PROPS DU FORMULAIRE --- */}
      <SessionForm 
        onSaved={onSaved} 
        existingPlayers={existingPlayers} 
        // On passe la session à modifier et une fonction pour annuler
        sessionToEdit={editingSession}
        onCancelEdit={() => setEditingSession(null)}
      />
      
      <Leaderboard totals={totals} />
      
      {loading ? (
        <div className="card text-center text-gray-500">
          Chargement de l'historique...
        </div>
      ) : (
        // --- 5. MODIFICATION DES PROPS DE LA LISTE ---
        <SessionList 
          sessions={sessions} 
          onDeleted={onDeleted}
          // On passe la nouvelle fonction
          onEdit={handleEdit}
        />
      )}

      <footer className="text-xs text-gray-500 text-center py-4">Fait avec React + TS + Tailwind – LocalStorage (Supabase optionnel)</footer>
    </div>
  );
}