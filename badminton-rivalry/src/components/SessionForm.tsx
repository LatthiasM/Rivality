import { useState, useEffect } from 'react'; // <--- Importer useEffect
import { Match, PlayerId, Session } from '../types';
import { newMatch } from '../lib/stats';
import ScoreInput from './ScoreInput';
import { saveSession, updateSession } from '../lib/storage'; // <--- Importer updateSession
import { toast } from 'react-hot-toast';

// --- 1. Mettre à jour les Props ---
interface Props {
  onSaved: (s: Session) => void;
  existingPlayers: PlayerId[];
  sessionToEdit: Session | null; // <--- Prop pour la session à modifier
  onCancelEdit: () => void; // <--- Prop pour annuler
}

export default function SessionForm({ onSaved, existingPlayers, sessionToEdit, onCancelEdit }: Props) {
  const [date, setDate] = useState<string>(() => new Date().toISOString().slice(0, 10));
  const [matches, setMatches] = useState<Match[]>([]);
  const [notes, setNotes] = useState('');
  const [saving, setSaving] = useState(false);
  
  // États pour le formulaire d'ajout de match (ceux-ci sont indépendants)
  const [playerA, setPlayerA] = useState('');
  const [playerB, setPlayerB] = useState('');

  // --- 2. Définir le mode d'édition ---
  const isEditMode = sessionToEdit !== null;

  // --- 3. Hook pour pré-remplir ou réinitialiser le formulaire ---
  // Ce code s'exécute à chaque fois que 'sessionToEdit' change
  useEffect(() => {
    if (sessionToEdit) {
      // On est en mode édition : on pré-remplit les champs
      setDate(sessionToEdit.date.slice(0, 10)); // Format YYYY-MM-DD
      setMatches(sessionToEdit.matches);
      setNotes(sessionToEdit.notes || '');
    } else {
      // On n'est PAS en mode édition : on réinitialise les champs
      setDate(new Date().toISOString().slice(0, 10));
      setMatches([]);
      setNotes('');
    }
  }, [sessionToEdit]); // <--- Le hook "surveille" sessionToEdit

  function setScore(i: number, which: 'A' | 'B', val: number) {
    setMatches(prev =>
      prev.map((m, idx) =>
        idx === i ? { ...m, [which === 'A' ? 'scoreA' : 'scoreB']: Math.max(0, val) } : m
      )
    );
  }

  // Fonction pour ajouter un nouveau match (inchangée)
  function addMatch(e: React.FormEvent) {
    e.preventDefault();
    if (!playerA || !playerB || playerA === playerB) {
      alert("Veuillez choisir deux joueurs différents.");
      return;
    }
    const matchDate = new Date(date).toISOString();
    setMatches(prev => [...prev, newMatch(matchDate, playerA, playerB)]);
    // On réinitialise les champs d'ajout de match
    setPlayerA('');
    setPlayerB('');
  }

  // --- 4. Fonction onSubmit "intelligente" ---
  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (matches.length === 0) {
      alert("Veuillez ajouter au moins un match à la séance.");
      return;
    }
    setSaving(true);

    if (isEditMode) {
      // --- Logique de MISE À JOUR ---
      const updatedSession: Session = {
        ...sessionToEdit, // <--- On garde l'ID et les anciennes données
        date: new Date(date).toISOString(), // On met à jour la date
        matches: matches, // On met à jour les matchs
        notes: notes.trim() || undefined, // On met à jour les notes
      };
      await updateSession(updatedSession);
      toast.success('Séance mise à jour !');
      onSaved(updatedSession); // <--- onSaved (de App.tsx) gère déjà la suite
    
    } else {
      // --- Logique de CRÉATION (inchangée) ---
      const newSession: Session = {
        id: crypto.randomUUID(),
        date: new Date(date).toISOString(),
        matches,
        notes: notes.trim() || undefined,
      };
      await saveSession(newSession);
      toast.success('Séance enregistrée !');
      onSaved(newSession);
      
      // Réinitialiser le formulaire complet (uniquement en mode création)
      setNotes('');
      setMatches([]);
      setPlayerA('');
      setPlayerB('');
    }

    setSaving(false); // <--- Déplacé ici pour être après l'action
  }
  
  // Crée une liste unique de joueurs pour les datalists (inchangée)
  const playerOptions = [...new Set([...existingPlayers, playerA, playerB].filter(Boolean))];

  return (
    // --- 5. Rendu JSX (titre, boutons) ---
    <form onSubmit={onSubmit} className="card space-y-4">
      <h2 className="text-xl font-semibold">
        {isEditMode ? 'Modifier la séance' : 'Nouvelle séance'}
      </h2>
      
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

      {/* Formulaire pour ajouter un match (inchangé) */}
      <div className="card !bg-gray-50 dark:!bg-gray-700 space-y-3">
        {/* ... (contenu du formulaire "Ajouter un match" inchangé) ... */}
        {/* ... (inputs playerA, playerB) ... */}
        <div className="grid sm:grid-cols-2 gap-4">
          <div>
            <label className="label">Joueur A</label>
            <input type="text" className="input w-full" value={playerA} onChange={e => setPlayerA(e.target.value)} list="players-list" placeholder="Nom du joueur A" />
          </div>
          <div>
            <label className="label">Joueur B</label>
            <input type="text" className="input w-full" value={playerB} onChange={e => setPlayerB(e.target.value)} list="players-list" placeholder="Nom du joueur B" />
          </div>
        </div>
        <button
          type="button"
          className="w-full px-3 py-2 rounded-lg bg-emerald-600 text-white hover:bg-emerald-700 dark:bg-emerald-500 dark:hover:bg-emerald-600 font-medium"
          onClick={addMatch}
          // On désactive l'ajout si les champs sont vides
          disabled={!playerA || !playerB}
        >
          + Ajouter le match
        </button>
      </div>

      {/* Liste des matchs ajoutés (inchangée) */}
      {matches.length > 0 && (
        <div className="space-y-3">
          {/* ... (boucle .map sur les matchs pour les ScoreInput) ... */}
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

      {/* Notes (inchangé) */}
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
      
      {/* --- 6. Boutons de soumission et d'annulation --- */}
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
      
      {/* Datalist (inchangée) */}
      <datalist id="players-list">
        {playerOptions.map(p => <option key={p} value={p} />)}
      </datalist>
    </form>
  );
}