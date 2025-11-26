import { useState, useEffect } from 'react';
import { Match, PlayerId, Session } from '../types';
import { newMatch } from '../lib/stats';
import ScoreInput from './ScoreInput';
import { saveSession, updateSession } from '../lib/storage';
import { toast } from 'react-hot-toast';

// 1. Définition des Props (corrigée)
interface Props {
  onSaved: (s: Session) => void;
  existingPlayers: PlayerId[];
  sessionToEdit: Session | null;
  onCancelEdit: () => void;
  groupId: string;
}

export default function SessionForm({ onSaved, existingPlayers, sessionToEdit, onCancelEdit, groupId }: Props) {
  
  // 2. Définition des États (ils manquaient)
  const [date, setDate] = useState<string>(() => new Date().toISOString().slice(0, 10));
  const [matches, setMatches] = useState<Match[]>([]);
  const [notes, setNotes] = useState('');
  const [saving, setSaving] = useState(false);
  const [playerA, setPlayerA] = useState('');
  const [playerB, setPlayerB] = useState('');

  // 3. Mode d'édition
  const isEditMode = sessionToEdit !== null;

  // 4. Hook pour pré-remplir le formulaire (logique unique)
  useEffect(() => {
    if (sessionToEdit) {
      // On est en mode édition : on pré-remplit les champs
      setDate(sessionToEdit.date.slice(0, 10));
      setMatches(sessionToEdit.matches);
      setNotes(sessionToEdit.notes || '');
    } else {
      // On n'est PAS en mode édition : on réinitialise les champs
      setDate(new Date().toISOString().slice(0, 10));
      setMatches([]);
      setNotes('');
    }
  }, [sessionToEdit]);

  // 5. Fonctions de gestion (uniques)
  function setScore(i: number, which: 'A' | 'B', val: number) {
    setMatches(prev =>
      prev.map((m, idx) =>
        idx === i ? { ...m, [which === 'A' ? 'scoreA' : 'scoreB']: Math.max(0, val) } : m
      )
    );
  }

  function addMatch(e: React.FormEvent) {
    e.preventDefault();
    if (!playerA || !playerB || playerA === playerB) {
      alert("Veuillez choisir deux joueurs différents.");
      return;
    }
    const matchDate = new Date(date).toISOString();
    setMatches(prev => [...prev, newMatch(matchDate, playerA, playerB)]);
    setPlayerA('');
    setPlayerB('');
  }

  // 6. Fonction onSubmit (logique unique et corrigée)
  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (matches.length === 0) {
      alert("Veuillez ajouter au moins un match à la séance.");
      return;
    }
    setSaving(true);

    if (isEditMode) {
      // Logique de MISE À JOUR
      const updatedSession: Session = {
        ...sessionToEdit,
        date: new Date(date).toISOString(),
        matches: matches,
        notes: notes.trim() || undefined,
        group_id: groupId, // S'assurer que le group_id est là
      };
      await updateSession(updatedSession);
      toast.success('Séance mise à jour !');
      onSaved(updatedSession);
    
    } else {
      // Logique de CRÉATION
      const newSession: Session = {
        id: crypto.randomUUID(),
        date: new Date(date).toISOString(),
        matches,
        notes: notes.trim() || undefined,
        group_id: groupId, // Ajouter le group_id
      };
      await saveSession(newSession, groupId); // Passer le groupId
      toast.success('Séance enregistrée !');
      onSaved(newSession);
      
      // Réinitialiser (uniquement en mode création)
      setNotes('');
      setMatches([]);
      setPlayerA('');
      setPlayerB('');
    }

    setSaving(false);
  }
  
  // 7. Rendu JSX (inchangé par rapport à votre code cible)
  const playerOptions = [...new Set([...existingPlayers, playerA, playerB].filter(Boolean))];

  return (
    <form onSubmit={onSubmit} className="card space-y-4">
      <h2 className="text-xl font-semibold">
        {isEditMode ? 'Modifier la séance' : 'Nouvelle séance'}
      </h2>
      
      <div>
        <label className="label">Date de la séance</label>
        <input
          type="date"
          className="input w-full"
          value={date}
          onChange={e => setDate(e.target.value)}
        />
      </div>

      <div className="card !bg-gray-50 dark:!bg-gray-700 space-y-3">
        <h3 className="font-medium">Ajouter un match</h3>
        <div className="grid sm:grid-cols-2 gap-4">
          <div>
            <label className="label">Joueur A</label>
            <input type="text" className="input w-full" value={playerA} onChange={e => setPlayerA(e.target.value)} list="players-list" placeholder="Nom du joueur A" required />
          </div>
          <div>
            <label className="label">Joueur B</label>
            <input type="text" className="input w-full" value={playerB} onChange={e => setPlayerB(e.target.value)} list="players-list" placeholder="Nom du joueur B" required />
          </div>
        </div>
        <button
          type="button"
          className="w-full px-3 py-2 rounded-lg bg-emerald-600 text-white hover:bg-emerald-700 dark:bg-emerald-500 dark:hover:bg-emerald-600 font-medium"
          onClick={addMatch}
          disabled={!playerA || !playerB}
        >
          + Ajouter le match
        </button>
      </div>

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
      
      <div className="flex gap-2">
        <button className="btn" disabled={saving || matches.length === 0}>
          {saving ? (isEditMode ? 'Mise à jour…' : 'Enregistrement…') : (isEditMode ? 'Mettre à jour la séance' : 'Enregistrer la séance')}
        </button>
        {isEditMode && (
          <button type="button" className="btn" onClick={onCancelEdit}>
            Annuler
          </button>
        )}
      </div>
      
      <datalist id="players-list">
        {playerOptions.map(p => <option key={p} value={p} />)}
      </datalist>
    </form>
  );
}