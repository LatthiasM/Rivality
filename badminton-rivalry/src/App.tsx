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
  const totals = useMemo(()=> computeTotals(sessions), [sessions]);
  
  // NOUVEAU : On extrait la liste des joueurs existants à partir du classement
  const existingPlayers = useMemo(() => totals.map(t => t.player), [totals]);

  useEffect(()=>{ 
    (async()=>{ 
      setLoading(true);
      setSessions(await loadSessions()); 
      setLoading(false);
    })(); 
  }, []);

  function onSaved(s: Session) {
    setSessions(prev => [s, ...prev]);
  }
  function onDeleted(id: string) {
    setSessions(prev => prev.filter(s => s.id !== id));
  }

  return (
    <div className="container space-y-4">
      <Toaster position="bottom-center" toastOptions={{ duration: 2000 }} />

      <header className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">🏸 Badminton Rivalry Tracker</h1>
        <a className="btn" href="https://github.com/" target="_blank" rel="noreferrer">Exporter / Git</a>
      </header>

      <SessionForm onSaved={onSaved} existingPlayers={existingPlayers} />
      
      <Leaderboard totals={totals} />
      
      {loading ? (
        // --- CETTE PARTIE A ÉTÉ CORRIGÉE ---
        <div className="card text-center text-gray-500">
          Chargement de l'historique...
        </div>
      ) : (
        <SessionList sessions={sessions} onDeleted={onDeleted} />
      )}
      {/* --------------------------------- */}

      <footer className="text-xs text-gray-500 text-center py-4">Fait avec React + TS + Tailwind – LocalStorage (Supabase optionnel)</footer>
    </div>
  );
}