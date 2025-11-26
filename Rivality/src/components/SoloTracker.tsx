import React, { useEffect, useState } from 'react';
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

export default function SoloTracker({ group, onLogout, onBackToHub, getSportIcon }: Props) {
  const [logs, setLogs] = useState<SoloLog[]>([]);
  const [loading, setLoading] = useState(true);
  
  // États pour le formulaire
  const [date, setDate] = useState(() => new Date().toISOString().slice(0, 10));
  const [notes, setNotes] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  // États pour l'édition
  const [editingLog, setEditingLog] = useState<SoloLog | null>(null);

  // Charger les journaux
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
    if (!notes.trim()) return;
    setIsSaving(true);

    // On prépare l'objet data qui contient les notes
    const payloadData = { notes };

    if (editingLog) {
      // Logique de MISE À JOUR
      // CORRECTION : On envoie payloadData au lieu de {...data} indéfini
      const updatedLog = await updateSoloLog(editingLog.id, date, payloadData);
      if (updatedLog) {
        setLogs(logs.map(l => l.id === updatedLog.id ? updatedLog : l));
        toast.success('Entrée mise à jour !');
        setEditingLog(null);
      }
    } else {
      // Logique de CRÉATION
      // CORRECTION : On ajoute group.id à la fin et on envoie payloadData
      const newLog = await createSoloLog(date, payloadData, group.id);
      
      if (newLog) {
        setLogs([newLog, ...logs]);
        toast.success('Entrée enregistrée !');
      }
    }
    
    // Réinitialiser le formulaire
    setIsSaving(false);
    if (!editingLog) {
      setNotes('');
    }
  }

  // Handler pour la suppression
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

  // Handler pour l'édition
  function handleEdit(log: SoloLog) {
    setEditingLog(log);
    setDate(log.date.slice(0, 10));
    // CORRECTION : On va chercher les notes dans log.data avec un cast 'any' pour éviter l'erreur TS
    setNotes((log.data as any).notes || '');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  // Annuler l'édition
  function cancelEdit() {
    setEditingLog(null);
    setDate(new Date().toISOString().slice(0, 10));
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

      {/* Formulaire de journal */}
      <form onSubmit={handleSubmit} className="card space-y-3">
        <h2 className="text-xl font-semibold">{editingLog ? "Modifier l'entrée" : "Nouvelle entrée"}</h2>
        <div>
          <label className="label" htmlFor="log-date">Date</label>
          <input
            id="log-date"
            type="date"
            className="input w-full"
            value={date}
            onChange={e => setDate(e.target.value)}
            required
          />
        </div>
        <div>
          <label className="label" htmlFor="log-notes">Notes (Entraînement, Performance, etc.)</label>
          <textarea
            id="log-notes"
            className="input w-full"
            rows={3}
            value={notes}
            onChange={e => setNotes(e.target.value)}
            placeholder="Ex: 5km en 25min / Développé couché: 3x5 @ 80kg"
            required
          />
        </div>
        <div className="flex gap-2">
          <button className="btn" disabled={isSaving}>
            {isSaving ? (editingLog ? 'Mise à jour...' : 'Enregistrement...') : (editingLog ? 'Mettre à jour' : 'Enregistrer')}
          </button>
          {editingLog && (
            <button type="button" className="btn" onClick={cancelEdit}>
              Annuler
            </button>
          )}
        </div>
      </form>

      {/* Historique des journaux */}
      <div className="card">
        <h2 className="text-xl font-semibold mb-3">Historique</h2>
        {loading ? (
          <p className="text-gray-500">Chargement...</p>
        ) : logs.length === 0 ? (
          <p className="text-gray-500">Aucune entrée enregistrée pour le moment.</p>
        ) : (
          <div className="space-y-3">
            {logs.map(log => (
              <div key={log.id} className="border border-gray-200 dark:border-gray-700 rounded-xl p-3">
                <div className="flex items-center justify-between mb-2">
                  <div className="font-medium">{new Date(log.date).toLocaleDateString()}</div>
                  <div className="flex gap-2">
                    <button className="btn !px-2 !py-1 text-xs" onClick={() => handleEdit(log)}>Modifier</button>
                    <button className="btn !px-2 !py-1 text-xs" onClick={() => handleDelete(log.id)}>Supprimer</button>
                  </div>
                </div>
                {/* CORRECTION : Affichage des notes depuis data */}
                <p className="text-sm whitespace-pre-wrap">{(log.data as any).notes}</p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}