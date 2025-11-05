import { useState } from 'react';
import { Match, PlayerId, Session } from '../types';
import { newMatch } from '../lib/stats';
import ScoreInput from './ScoreInput';
import { saveSession } from '../lib/storage';
import { toast } from 'react-hot-toast';

interface Props {
  onSaved: (s: Session) => void;
  existingPlayers: PlayerId[];
}

export default function SessionForm({ onSaved, existingPlayers }: Props) {
  const [date, setDate] = useState<string>(() => new Date().toISOString().slice(0, 10));
  const [matches, setMatches] = useState<Match[]>([]);
  const [notes, setNotes] = useState('');
  const [saving, setSaving] = useState(false);
  
  // États pour le formulaire d'ajout de match
  const [playerA, setPlayerA] = useState('');
  const [playerB, setPlayerB] = useState('');

  function setScore(i: number, which: 'A' | 'B', val: number) {
    setMatches(prev =>
      prev.map((m, idx) =>
        idx === i ? { ...m, [which === 'A' ? 'scoreA' : 'scoreB']: Math.max(0, val) } : m
      )
    );
  }

  // Fonction pour ajouter un nouveau match à la session en cours
  function addMatch(e: React.FormEvent) {
    e.preventDefault();
    if (!playerA || !playerB || playerA === playerB) {
      alert("Veuillez choisir deux joueurs différents.");
      return;
    }
    const matchDate = new Date(date).toISOString();
    setMatches(prev => [...prev, newMatch(matchDate, playerA, playerB)]);
    // Optionnel: réinitialiser les champs après ajout
    // setPlayerA('');
    // setPlayerB('');
  }

  // Fonction pour gérer la soumission finale de la session
  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (matches.length === 0) {
      alert("Veuillez ajouter au moins un match à la séance.");
      return;
    }
    setSaving(true);
    const s: Session = {
      // ... (les données de votre session) ...
      id: crypto.randomUUID(),
      date: new Date(date).toISOString(),
      matches,
      notes: notes.trim() || undefined,
    };
    await saveSession(s);
    setSaving(false);
    onSaved(s);
    
    toast.success('Séance enregistrée !'); // <--- 2. L'appel au toast !

    // Réinitialiser le formulaire complet
    setNotes('');
    setMatches([]);
    setPlayerA('');
    setPlayerB('');
  }
  
  // Crée une liste unique de joueurs pour les datalists
  const playerOptions = [...new Set([...existingPlayers, playerA, playerB].filter(Boolean))];

  return (
    <form onSubmit={onSubmit} className="card space-y-4">
      <h2 className="text-xl font-semibold">Nouvelle séance</h2>
      
      {/* Sélecteur de date */}
      <div>
        <label className="label">Date de la séance</label>
        <input
          type="date"
          className="input w-full"
          value={date}
          onChange={e => setDate(e.target.value)}
        />
      </div>

      {/* Formulaire pour ajouter un match */}
      <div className="card !bg-gray-50 dark:!bg-gray-700 space-y-3">
        <h3 className="font-medium">Ajouter un match</h3>
        <div className="grid sm:grid-cols-2 gap-4">
          {/* Input pour Joueur A avec datalist */}
          <div>
            <label className="label">Joueur A</label>
            <input
              type="text"
              className="input w-full"
              value={playerA}
              onChange={e => setPlayerA(e.target.value)}
              list="players-list"
              placeholder="Nom du joueur A"
              required
            />
          </div>
          {/* Input pour Joueur B avec datalist */}
          <div>
            <label className="label">Joueur B</label>
            <input
              type="text"
              className="input w-full"
              value={playerB}
              onChange={e => setPlayerB(e.target.value)}
              list="players-list"
              placeholder="Nom du joueur B"
              required
            />
          </div>
        </div>
        
        {/* --- C'EST CE BOUTON QUI A ÉTÉ MODIFIÉ --- */}
        <button
          type="button"
          className="w-full px-3 py-2 rounded-lg bg-emerald-600 text-white hover:bg-emerald-700 dark:bg-emerald-500 dark:hover:bg-emerald-600 font-medium"
          onClick={addMatch}
        >
          + Ajouter le match
        </button>
        {/* ------------------------------------------ */}

      </div>

      {/* Liste des matchs ajoutés (avec inputs de score) */}
      {matches.length > 0 && (
        <div className="space-y-3">
          <h3 className="text-lg font-semibold">Matchs de la séance</h3>
          {matches.map((m, i) => (
            <div key={m.id} className="border border-gray-200 dark:border-gray-700 rounded-xl p-3">
              <div className="flex justify-between items-center mb-2">
                <span className="font-medium">Match {i + 1}: {m.a} vs {m.b}</span>
                <button
                  type="button"
                  className="btn !px-2 !py-1 text-xs"
                  onClick={() => setMatches(prev => prev.filter(match => match.id !== m.id))}
                >
                  Retirer
                </button>
              </div>
              <ScoreInput
                labelA={`${m.a} points`}
                labelB={`${m.b} points`}
                valueA={m.scoreA}
                valueB={m.scoreB}
                onChangeA={n => setScore(i, 'A', n)}
                onChangeB={n => setScore(i, 'B', n)}
              />
            </div>
          ))}
        </div>
      )}

      {/* Notes et bouton de soumission */}
      <div>
        <label className="label">Notes (optionnel)</label>
        <textarea
          className="input w-full"
          rows={2}
          value={notes}
          onChange={e => setNotes(e.target.value)}
          placeholder="État de forme, exercices, etc."
        />
      </div>
      <button className="btn" disabled={saving || matches.length === 0}>
        {saving ? 'Enregistrement…' : 'Enregistrer la séance'}
      </button>
      
      {/* Datalist pour l'auto-complétion (invisible) */}
      <datalist id="players-list">
        {playerOptions.map(p => <option key={p} value={p} />)}
      </datalist>
    </form>
  );
}