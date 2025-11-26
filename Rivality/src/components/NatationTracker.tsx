import { useEffect, useState, useMemo } from 'react';
import { Group, User, SoloLog, NatationLogData, SwimBlock, NatationTrainingType } from '../types';
import { loadSoloLogs, createSoloLog, deleteSoloLog, updateSoloLog } from '../lib/storage';
import { Toaster, toast } from 'react-hot-toast';

interface Props {
  group: Group;
  user: User;
  onLogout: () => void;
  onBackToHub: () => void;
  getSportIcon: (sportType: string) => string;
}

// Composant pour afficher les détails d'UN bloc dans l'historique
function BlockDetails({ block }: { block: SwimBlock }) {
  switch (block.type) {
    case 'vitesse':
      return <>{block.nage} | {block.distance}m | {block.temps}</>;
    case 'endurance':
      return <>{block.nage} | {block.series}x{block.distance}m | repos: {block.tempsRepos}</>;
    case 'technique':
      return <>{block.nage} | {block.exercice} | {block.distance}m</>;
    default: return null;
  }
}

// --- Fonctions utilitaires pour les calculs (Ajoutées lors de la 1ère modif) ---

function timeToSeconds(timeStr: string): number {
  const parts = timeStr.split(':');
  if (parts.length === 2) {
    const minutes = parseInt(parts[0]);
    const seconds = parseFloat(parts[1]);
    return minutes * 60 + seconds;
  }
  if (parts.length === 1) {
    return parseFloat(parts[0]);
  }
  return 0;
}

function computeBlockTotals(blocks: SwimBlock[]) {
  let totalDistance = 0;
  let totalTimeSeconds = 0;

  for (const block of blocks) {
    if (!block.distance || block.distance <= 0) continue;

    switch (block.type) {
      case 'vitesse':
        totalDistance += block.distance;
        if (block.temps) {
            totalTimeSeconds += timeToSeconds(block.temps);
        }
        break;
      case 'endurance':
        totalDistance += block.distance * block.series;
        break;
      case 'technique':
        totalDistance += block.distance;
        break;
    }
  }

  return { 
      totalDistance, 
      totalTimeDisplay: totalTimeSeconds > 0 ? 
        `${Math.floor(totalTimeSeconds / 60)}m ${Math.round(totalTimeSeconds % 60)}s` : 
        'N/A' 
  };
}

// -----------------------------------------------------------------


export default function NatationTracker({ group, user, onLogout, onBackToHub, getSportIcon }: Props) {
  const [logs, setLogs] = useState<SoloLog[]>([]);
  const [loading, setLoading] = useState(true);
  
  // États pour le formulaire PRINCIPAL
  const [date, setDate] = useState(() => new Date().toISOString().slice(0, 10));
  const [globalNotes, setGlobalNotes] = useState('');
  const [warmingUp, setWarmingUp] = useState(''); // NOUVEAU: État pour l'échauffement
  const [blocks, setBlocks] = useState<SwimBlock[]>([]); // La liste des lignes
  
  // États pour le SUB-FORMULAIRE (pour ajouter une ligne)
  const [trainingType, setTrainingType] = useState<NatationTrainingType>('vitesse');
  const [nage, setNage] = useState('Crawl');
  const [distance, setDistance] = useState('');
  const [temps, setTemps] = useState('');
  const [series, setSeries] = useState('');
  const [tempsRepos, setTempsRepos] = useState('');
  const [exercice, setExercice] = useState('');
  
  const [isSaving, setIsSaving] = useState(false);
  const [editingLogId, setEditingLogId] = useState<string | null>(null);

  // --- Logique de Datalist (auto-complétion) ---
  const { knownNages, knownExercices } = useMemo(() => {
    // ... (Logique useMemo existante) ...
    const nages = new Set<string>(['Crawl', 'Brasse', 'Dos', 'Papillon']);
    const exercices = new Set<string>(['Respiration 3 temps', 'Jambes avec planche', 'Educatif un bras']);
    
    logs.forEach(log => {
      const data = log.data as NatationLogData;
      if (data.blocks) {
        data.blocks.forEach(block => {
          if (block.nage) nages.add(block.nage);
          if (block.type === 'technique' && block.exercice) {
            exercices.add(block.exercice);
          }
        });
      }
    });
    return { 
      knownNages: [...nages],
      knownExercices: [...exercices]
    };
  }, [logs]);
  // --------------------------------------------------------

  useEffect(() => {
    setLoading(true);
    loadSoloLogs(group.id).then(loadedLogs => {
      setLogs(loadedLogs);
      setLoading(false);
    });
  }, [group]);

  function resetSubForm() {
    // Ne réinitialise pas 'nage' pour la fluidité
    setDistance('');
    setTemps('');
    setSeries('');
    setTempsRepos('');
    setExercice('');
  }
  
  function resetMainForm() {
    setDate(new Date().toISOString().slice(0, 10));
    setGlobalNotes('');
    setWarmingUp(''); // MODIFIÉ: Reset de l'échauffement
    setBlocks([]);
    resetSubForm();
    setTrainingType('vitesse');
  }

  // --- AJOUTER UNE LIGNE (ne sauvegarde pas en BDD) ---
  function handleAddBlock(e: React.FormEvent) {
    // ... (Logique handleAddBlock existante, inchangée) ...
    e.preventDefault();
    let newBlock: SwimBlock;
    
    try {
      const nageInput = nage.trim() || 'Nage libre';
      const distNum = parseInt(distance);
      
      switch (trainingType) {
        case 'vitesse':
          if (!distance || !temps) throw new Error("Champs Vitesse requis");
          newBlock = { id: crypto.randomUUID(), type: 'vitesse', nage: nageInput, distance: distNum, temps: temps.trim() };
          break;
        case 'endurance':
          if (!series || !distance || !tempsRepos) throw new Error("Champs Endurance requis");
          newBlock = { id: crypto.randomUUID(), type: 'endurance', nage: nageInput, distance: distNum, series: parseInt(series), tempsRepos: tempsRepos.trim() };
          break;
        case 'technique':
          if (!exercice || !distance) throw new Error("Champs Technique requis");
          newBlock = { id: crypto.randomUUID(), type: 'technique', nage: nageInput, exercice: exercice.trim(), distance: distNum };
          break;
      }
    } catch (err: any) {
      toast.error(err.message || "Veuillez remplir les champs pour cette ligne.");
      return;
    }

    setBlocks(prevBlocks => [...prevBlocks, newBlock]);
    resetSubForm();
  }

  // --- ENREGISTRER LA SÉANCE (sauvegarde en BDD) ---
  async function handleSubmitSession(e: React.FormEvent) {
    e.preventDefault();
    // MODIFIÉ: Validation assouplie
    if (blocks.length === 0 && !warmingUp.trim() && !globalNotes.trim()) {
      alert("Votre séance est vide ! Veuillez ajouter au moins une ligne, un échauffement ou une note.");
      return;
    }
    setIsSaving(true);

    const logData: NatationLogData = {
      trainingType: 'natation',
      notes: globalNotes.trim() || undefined,
      warmingUp: warmingUp.trim() || undefined, // NOUVEAU: Ajout de l'échauffement
      blocks: blocks
    };

    if (editingLogId) {
      // Logique de MISE À JOUR
      const updatedLog = await updateSoloLog(editingLogId, new Date(date).toISOString(), logData);
      if (updatedLog) {
        setLogs(logs.map(l => l.id === updatedLog.id ? (updatedLog as SoloLog) : l));
        toast.success('Séance mise à jour !');
        cancelEdit();
      } else {
        toast.error('Erreur lors de la mise à jour.');
      }
    } else {
      // Logique de CRÉATION
      const newLog = await createSoloLog(new Date(date).toISOString(), logData, group.id);
      if (newLog) {
        setLogs([newLog as SoloLog, ...logs]);
        toast.success('Séance enregistrée !');
        resetMainForm();
      } else {
        toast.error('Erreur lors de la création.');
      }
    }
    
    setIsSaving(false);
  }

  async function handleDeleteSession(id: string) {
    // ... (Logique handleDeleteSession existante, inchangée) ...
    if (!confirm('Supprimer cette séance ?')) return;
    const success = await deleteSoloLog(id);
    if (success) {
      setLogs(logs.filter(l => l.id !== id));
      toast.success('Séance supprimée.');
    } else {
      toast.error('Erreur lors de la suppression.');
    }
  }

  function handleEditSession(log: SoloLog) {
    const data = log.data as NatationLogData;
    // S'assurer que ce sont des données de natation multi-blocs
    if (!data.blocks) {
      toast.error("Impossible d'éditer ce log (ancien format).");
      return;
    }
    setEditingLogId(log.id);
    setDate(log.date.slice(0, 10));
    setGlobalNotes(data.notes || '');
    setWarmingUp(data.warmingUp || ''); // NOUVEAU: Chargement de l'échauffement
    setBlocks(data.blocks || []);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  function cancelEdit() {
    setEditingLogId(null);
    resetMainForm();
  }
  
  // NOUVEAU: Calcul des totaux pour la session en cours
  const sessionTotals = useMemo(() => {
    return computeBlockTotals(blocks);
  }, [blocks]);


  // --- Rendu du sous-formulaire dynamique ---
  function renderDynamicFields() {
    // ... (Logique renderDynamicFields existante, inchangée) ...
    switch (trainingType) {
      case 'vitesse':
        return (
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <input type="text" className="input" value={nage} onChange={e => setNage(e.target.value)} list="nages-list" placeholder="Nage (ex: Crawl)" required />
            <input type="number" step={25} min={0} className="input" value={distance} onChange={e => setDistance(e.target.value)} placeholder="Distance (m)" required />
            <input type="text" className="input" value={temps} onChange={e => setTemps(e.target.value)} placeholder="Temps (MM:SS.ms)" required />
          </div>
        );
      case 'endurance':
        return (
          <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
            <input type="text" className="input" value={nage} onChange={e => setNage(e.target.value)} list="nages-list" placeholder="Nage (ex: Crawl)" required />
            <input type="number" min={1} className="input" value={series} onChange={e => setSeries(e.target.value)} placeholder="Séries (ex: 10)" required />
            <input type="number" step={25} min={0} className="input" value={distance} onChange={e => setDistance(e.target.value)} placeholder="Distance (m)" required />
            <input type="text" className="input" value={tempsRepos} onChange={e => setTempsRepos(e.target.value)} placeholder="Repos (ex: 45s)" required />
          </div>
        );
      case 'technique':
        return (
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <input type="text" className="input" value={nage} onChange={e => setNage(e.target.value)} list="nages-list" placeholder="Nage (ex: Crawl)" required />
            <input type="text" className="input" value={exercice} onChange={e => setExercice(e.target.value)} list="exercices-list" placeholder="Exercice" required />
            <input type="number" step={25} min={0} className="input" value={distance} onChange={e => setDistance(e.target.value)} placeholder="Distance (m)" required />
          </div>
        );
    }
  }

  return (
    <div className="container space-y-4">
      <Toaster position="bottom-center" toastOptions={{ duration: 2000 }} />
      <header className="flex items-center justify-between">
        {/* ... (Header existant, inchangé) ... */}
        <h1 className="text-2xl font-bold">{getSportIcon(group.sport_type)} {group.name}</h1>
        <div className="flex items-center gap-3">
          <button className="btn" onClick={onBackToHub}>&larr; Hub</button>
          <button className="btn" onClick={onLogout}>Déconnexion</button>
        </div>
      </header>

      {/* --- FORMULAIRE PRINCIPAL --- */}
      <form onSubmit={handleSubmitSession} className="card space-y-4">
        <h2 className="text-xl font-semibold">{editingLogId ? "Modifier la séance" : "Nouvelle séance"}</h2>
        
        {/* MODIFIÉ: Champs de la Séance (Date, Échauffement, Notes) */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="label" htmlFor="log-date">Date de la séance</label>
            <input id="log-date" type="date" className="input w-full" value={date} onChange={e => setDate(e.target.value)} required />
          </div>
          {/* NOUVEAU: Champ Échauffement */}
          <div>
            <label className="label" htmlFor="log-warming-up">Échauffement (optionnel)</label>
            <input 
              id="log-warming-up" 
              type="text" 
              className="input w-full" 
              value={warmingUp} 
              onChange={e => setWarmingUp(e.target.value)} 
              placeholder="Ex: 400m libre éducatif" 
            />
          </div>
        </div>
        {/* Champ Notes déplacé en pleine largeur */}
        <div className="col-span-full">
            <label className="label" htmlFor="log-notes">Notes sur la séance (optionnel)</label>
            <input id="log-notes" type="text" className="input w-full" value={globalNotes} onChange={e => setGlobalNotes(e.target.value)} placeholder="Ex: Bonne énergie" />
        </div>


        {/* NOUVEAU: Affichage des totaux */}
        <div className="flex justify-between p-3 border rounded-lg bg-gray-100 dark:bg-gray-700">
            <span className="font-medium text-sm">Distance Totale (blocs):</span>
            <span className="font-semibold">{sessionTotals.totalDistance}m</span>
        </div>
        
        {/* --- SOUS-FORMULAIRE D'AJOUT DE LIGNE --- */}
        <div className="card !bg-gray-50 dark:!bg-gray-700 space-y-3">
          {/* ... (Sous-formulaire existant, inchangé) ... */}
          <h3 className="font-medium">Ajouter une ligne d'entraînement</h3>
          <div>
            <label className="label" htmlFor="log-type">Type</label>
            <select 
              id="log-type" 
              className="select w-full" 
              value={trainingType} 
              onChange={e => setTrainingType(e.target.value as NatationTrainingType)}
            >
              <option value="vitesse">Vitesse (Nage, Distance, Temps)</option>
              <option value="endurance">Endurance (Nage, Séries, Distance, Repos)</option>
              <option value="technique">Technique (Nage, Exercice, Distance)</option>
            </select>
          </div>
          {renderDynamicFields()}
          <button 
            type="button" 
            className="w-full px-3 py-2 rounded-lg bg-emerald-600 text-white hover:bg-emerald-700 dark:bg-emerald-500 dark:hover:bg-emerald-600 font-medium" 
            onClick={handleAddBlock}
          >
            + Ajouter cette ligne
          </button>
        </div>

        {/* --- Liste des lignes ajoutées (temporaire) --- */}
        {blocks.length > 0 && (
          <div className="space-y-2">
            {/* ... (Affichage des blocs temporaires existant, inchangé) ... */}
            <h3 className="font-medium">Lignes de la séance</h3>
            <ul className="list-disc list-inside space-y-1">
              {blocks.map(block => (
                <li key={block.id} className="text-sm flex justify-between items-center">
                  <span><BlockDetails block={block} /></span>
                  <button 
                    type="button" 
                    className="btn !px-2 !py-0 text-xs"
                    onClick={() => setBlocks(prev => prev.filter(b => b.id !== block.id))}
                  >
                    Retirer
                  </button>
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* --- Boutons de sauvegarde --- */}
        <div className="flex gap-2">
          {/* MODIFIÉ: Retrait de la condition blocks.length === 0 */}
          <button className="btn" disabled={isSaving}>
            {isSaving ? (editingLogId ? 'Mise à jour...' : 'Enregistrement...') : (editingLogId ? 'Mettre à jour la séance' : 'Enregistrer la séance')}
          </button>
          {editingLogId && (
            <button type="button" className="btn" onClick={cancelEdit}>
              Annuler
            </button>
          )}
        </div>
      </form>

      {/* --- Historique des Séances --- */}
      <div className="card">
        <h2 className="text-xl font-semibold mb-3">Historique des Séances</h2>
        {loading ? ( <p className="text-gray-500">Chargement...</p> ) : 
         logs.length === 0 ? ( <p className="text-gray-500">Aucune séance enregistrée.</p> ) : 
         (
          <div className="space-y-3">
            {logs.map(log => {
              const data = log.data as NatationLogData; 
              // S'assurer que les données sont bien au format 'blocks'
              if (!data.blocks) return (
                <div key={log.id} className="border border-gray-200 dark:border-gray-700 rounded-xl p-3 opacity-50">
                   <div className="font-medium">{new Date(log.date).toLocaleDateString()} - Ancien Format</div>
                   <p className="text-xs">Log non compatible avec le nouveau système.</p>
                </div>
              );
              
              // NOUVEAU: Calcul des totaux pour l'historique
              const historyTotals = computeBlockTotals(data.blocks); 
              
              return (
                <div key={log.id} className="border border-gray-200 dark:border-gray-700 rounded-xl p-3">
                  <div className="flex items-center justify-between mb-2">
                    <div className="font-medium">{new Date(log.date).toLocaleDateString()}</div>
                    {/* NOUVEAU: Affichage distance totale historique */}
                    <div className="text-sm font-semibold">
                       {historyTotals.totalDistance}m 
                    </div> 
                    <div className="flex gap-2">
                      <button className="btn !px-2 !py-1 text-xs" onClick={() => handleEditSession(log)}>Modifier</button>
                      <button className="btn !px-2 !py-1 text-xs" onClick={() => handleDeleteSession(log.id)}>Supprimer</button>
                    </div>
                  </div>
                  <div className="text-sm space-y-2">
                    {/* NOUVEAU: Affichage de l'échauffement */}
                    {data.warmingUp && (
                        <div className="pl-2 border-l-2 border-yellow-500 dark:border-yellow-600">
                           <span className="capitalize font-medium text-yellow-500">Échauffement: </span>
                           {data.warmingUp}
                        </div>
                    )}
                    
                    {/* Affiche les détails formatés pour chaque bloc */}
                    {data.blocks.map(block => (
                      <div key={block.id} className="pl-2 border-l-2 border-gray-200 dark:border-gray-700">
                        <span className="capitalize font-medium">{block.type}: </span>
                        <BlockDetails block={block} />
                      </div>
                    ))}
                    {data.notes && <p className="text-xs italic text-gray-500 mt-2">Notes: {data.notes}</p>}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* --- Datalists pour l'auto-complétion --- */}
      <datalist id="nages-list">
        {knownNages.map(n => <option key={n} value={n} />)}
      </datalist>
      <datalist id="exercices-list">
        {knownExercices.map(e => <option key={e} value={e} />)}
      </datalist>

    </div>
  );
}