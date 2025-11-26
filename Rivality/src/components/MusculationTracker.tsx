import { useEffect, useState } from 'react';
import { Group, User, SoloLog } from '../types';
import { loadSoloLogs, createSoloLog, deleteSoloLog, updateSoloLog } from '../lib/storage';
import { Toaster, toast } from 'react-hot-toast';

interface Props {
  group: Group;
  user: User;
  onLogout: () => void;
  onBackToHub: () => void;
  getSportIcon: (sportType: string) => string;
}

// Type spécifique pour les données de ce tracker
type MusculationData = {
  exercice: string;
  series: number;
  reps: number;
  poids: number;
  notes?: string;
};

export default function MusculationTracker({ group, user, onLogout, onBackToHub, getSportIcon }: Props) {
  const [logs, setLogs] = useState<SoloLog[]>([]);
  const [loading, setLoading] = useState(true);
  
  // États pour le formulaire
  const [date, setDate] = useState(() => new Date().toISOString().slice(0, 10));
  const [exercice, setExercice] = useState('');
  const [series, setSeries] = useState('');
  const [reps, setReps] = useState('');
  const [poids, setPoids] = useState('');
  const [notes, setNotes] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  // États pour l'édition
  const [editingLogId, setEditingLogId] = useState<string | null>(null);

  useEffect(() => {
    setLoading(true);
    loadSoloLogs(group.id).then(loadedLogs => {
      setLogs(loadedLogs);
      setLoading(false);
    });
  }, [group]);

  // Handler pour la soumission (Création ou Mise à jour)
  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    
    // On construit l'objet de données JSONB
    const logData: MusculationData = {
      exercice: exercice.trim(),
      series: parseInt(series) || 0,
      reps: parseInt(reps) || 0,
      poids: parseFloat(poids) || 0,
      notes: notes.trim() || undefined,
    };
    
    setIsSaving(true);

    if (editingLogId) {
      // Logique de MISE À JOUR
      const updatedLog = await updateSoloLog(editingLogId, new Date(date).toISOString(), logData);
      if (updatedLog) {
        setLogs(logs.map(l => l.id === updatedLog.id ? updatedLog : l));
        toast.success('Entrée mise à jour !');
        cancelEdit(); // Quitter le mode édition
      }
    } else {
      // Logique de CRÉATION
      const newLog = await createSoloLog(new Date(date).toISOString(), logData, group.id);
      if (newLog) {
        setLogs([newLog, ...logs]); // Ajouter au début
        toast.success('Entrée enregistrée !');
      }
    }
    
    // Réinitialiser le formulaire
    setIsSaving(false);
    if (!editingLogId) {
      setExercice('');
      setSeries('');
      setReps('');
      setPoids('');
      setNotes('');
    }
  }

  async function handleDelete(id: string) {
    if (!confirm('Supprimer cette entrée ?')) return;
    const success = await deleteSoloLog(id);
    if (success) {
      setLogs(logs.filter(l => l.id !== id));
      toast.success('Entrée supprimée.');
    } else {
      toast.error('Erreur lors de la suppression.');
    }
  }

  function handleEdit(log: SoloLog) {
    const data = log.data as MusculationData; // On s'attend à ce format
    setEditingLogId(log.id);
    setDate(log.date.slice(0, 10));
    setExercice(data.exercice || '');
    setSeries(data.series?.toString() || '');
    setReps(data.reps?.toString() || '');
    setPoids(data.poids?.toString() || '');
    setNotes(data.notes || '');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  function cancelEdit() {
    setEditingLogId(null);
    setDate(new Date().toISOString().slice(0, 10));
    setExercice('');
    setSeries('');
    setReps('');
    setPoids('');
    setNotes('');
  }

  return (
    <div className="container space-y-4">
      <Toaster position="bottom-center" toastOptions={{ duration: 2000 }} />
      <header className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">{getSportIcon(group.sport_type)} {group.name}</h1>
        <div className="flex items-center gap-3">
          <button className="btn" onClick={onBackToHub}>&larr; Hub</button>
          <button className="btn" onClick={onLogout}>Déconnexion</button>
        </div>
      </header>

      {/* Formulaire de journal spécifique à la musculation */}
      <form onSubmit={handleSubmit} className="card space-y-3">
        <h2 className="text-xl font-semibold">{editingLogId ? "Modifier l'entrée" : "Nouvelle entrée"}</h2>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="label" htmlFor="log-date">Date</label>
            <input id="log-date" type="date" className="input w-full" value={date} onChange={e => setDate(e.target.value)} required />
          </div>
          <div>
            <label className="label" htmlFor="log-exercice">Exercice</label>
            <input id="log-exercice" type="text" className="input w-full" value={exercice} onChange={e => setExercice(e.target.value)} placeholder="Ex: Développé couché" required />
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div>
            <label className="label" htmlFor="log-series">Séries</label>
            <input id="log-series" type="number" className="input w-full" value={series} onChange={e => setSeries(e.target.value)} placeholder="Ex: 3" />
          </div>
          <div>
            <label className="label" htmlFor="log-reps">Répétitions</label>
            <input id="log-reps" type="number" className="input w-full" value={reps} onChange={e => setReps(e.target.value)} placeholder="Ex: 5" />
          </div>
          <div>
            <label className="label" htmlFor="log-poids">Poids (kg)</label>
            <input id="log-poids" type="number" step="0.5" className="input w-full" value={poids} onChange={e => setPoids(e.target.value)} placeholder="Ex: 80" />
          </div>
        </div>

        <div>
          <label className="label" htmlFor="log-notes">Notes (optionnel)</label>
          <textarea id="log-notes" className="input w-full" rows={2} value={notes} onChange={e => setNotes(e.target.value)} placeholder="Ex: Bonne forme, +2.5kg vs la semaine passée" />
        </div>

        <div className="flex gap-2">
          <button className="btn" disabled={isSaving}>
            {isSaving ? (editingLogId ? 'Mise à jour...' : 'Enregistrement...') : (editingLogId ? 'Mettre à jour' : 'Enregistrer')}
          </button>
          {editingLogId && (
            <button type="button" className="btn" onClick={cancelEdit}>
              Annuler
            </button>
          )}
        </div>
      </form>

      {/* Historique des journaux */}
      <div className="card">
        <h2 className="text-xl font-semibold mb-3">Historique</h2>
        {loading ? ( <p className="text-gray-500">Chargement...</p> ) : 
         logs.length === 0 ? ( <p className="text-gray-500">Aucune entrée enregistrée.</p> ) : 
         (
          <div className="space-y-3">
            {logs.map(log => {
              // On caste les données pour y accéder
              const data = log.data as Partial<MusculationData>; 
              return (
                <div key={log.id} className="border border-gray-200 dark:border-gray-700 rounded-xl p-3">
                  <div className="flex items-center justify-between mb-2">
                    <div className="font-medium">{new Date(log.date).toLocaleDateString()}</div>
                    <div className="flex gap-2">
                      <button className="btn !px-2 !py-1 text-xs" onClick={() => handleEdit(log)}>Modifier</button>
                      <button className="btn !px-2 !py-1 text-xs" onClick={() => handleDelete(log.id)}>Supprimer</button>
                    </div>
                  </div>
                  <div className="text-sm">
                    <p className="font-semibold text-base">{data.exercice}</p>
                    <div className="flex gap-4 mt-1">
                      {data.series && <span>{data.series} séries</span>}
                      {data.reps && <span>{data.reps} reps</span>}
                      {data.poids && <span>@ {data.poids} kg</span>}
                    </div>
                    {data.notes && <p className="text-xs italic text-gray-500 mt-2">{data.notes}</p>}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}