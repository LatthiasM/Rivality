import { useEffect, useMemo, useState } from 'react';
import { Match, Session } from '../types';
import { newMatch, newSession, trianglePairs, PLAYERS } from '../lib/stats';
import ScoreInput from './ScoreInput';
import { saveSession } from '../lib/storage';

export default function SessionForm({ onSaved }: { onSaved: (s: Session) => void }) {
  const [date, setDate] = useState<string>(() => new Date().toISOString().slice(0, 10));
  const pairs = useMemo(() => trianglePairs(PLAYERS), []);
  const [matches, setMatches] = useState<Match[]>(
    () => pairs.map(([a, b]) => newMatch(new Date().toISOString(), a, b))
  );
  const [notes, setNotes] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    setMatches(pairs.map(([a, b]) => newMatch(new Date(date).toISOString(), a, b)));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [date]);

  function setScore(i: number, which: 'A' | 'B', val: number) {
    setMatches(prev =>
      prev.map((m, idx) =>
        idx === i ? { ...m, [which === 'A' ? 'scoreA' : 'scoreB']: Math.max(0, val) } : m
      )
    );
  }

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    const s: Session = {
      id: crypto.randomUUID(),
      date: new Date(date).toISOString(),
      matches,
      notes: notes.trim() || undefined,
    };
    await saveSession(s);
    setSaving(false);
    onSaved(s);
    // reset
    setNotes('');
    setMatches(pairs.map(([a, b]) => newMatch(new Date(date).toISOString(), a, b)));
  }

  return (
    <form onSubmit={onSubmit} className="card space-y-4">
      <h2 className="text-xl font-semibold">Nouvelle séance (triangle)</h2>
      <div className="grid sm:grid-cols-3 gap-4">
        <div>
          <label className="label">Date</label>
          <input
            type="date"
            className="input w-full"
            value={date}
            onChange={e => setDate(e.target.value)}
          />
        </div>
      </div>

      {matches.map((m, i) => (
        <div key={m.id} className="border border-gray-200 dark:border-gray-700 rounded-xl p-3">
          <div className="mb-2 font-medium">
            Match {i + 1}: {m.a} vs {m.b}
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

      <button className="btn" disabled={saving}>
        {saving ? 'Enregistrement…' : 'Enregistrer la séance'}
      </button>
    </form>
  );
}
