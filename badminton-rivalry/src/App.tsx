import { useEffect, useMemo, useState } from 'react';
import './styles.css';
import SessionForm from './components/SessionForm';
import Leaderboard from './components/Leaderboard';
import SessionList from './components/SessionList';
import { Session } from './types';
import { computeTotals } from './lib/stats';
import { loadSessions } from './lib/storage';


export default function App() {
const [sessions, setSessions] = useState<Session[]>([]);
const totals = useMemo(()=> computeTotals(sessions), [sessions]);


useEffect(()=>{ (async()=>{ setSessions(await loadSessions()); })(); }, []);


function onSaved(s: Session) {
setSessions(prev => [s, ...prev]);
}
function onDeleted(id: string) {
setSessions(prev => prev.filter(s => s.id !== id));
}


return (
<div className="container space-y-4">
<header className="flex items-center justify-between">
<h1 className="text-2xl font-bold">🏸 Badminton Rivalry Tracker</h1>
<a className="btn" href="https://github.com/" target="_blank" rel="noreferrer">Exporter / Git</a>
</header>


<SessionForm onSaved={onSaved} />
<Leaderboard totals={totals} />
<SessionList sessions={sessions} onDeleted={onDeleted} />


<footer className="text-xs text-gray-500 text-center py-6">Fait avec React + TS + Tailwind – LocalStorage (Supabase optionnel)</footer>
</div>
);
}