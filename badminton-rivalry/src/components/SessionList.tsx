import { Session } from '../types';
import { deleteSession } from '../lib/storage';
import { toast } from 'react-hot-toast';


export default function SessionList({ sessions, onDeleted }: { sessions: Session[]; onDeleted: (id: string)=>void }) {
  async function handleDelete(id: string) {
    if (!confirm('Supprimer cette séance ?')) return;
    await deleteSession(id);
    onDeleted(id);
    toast.success('Séance supprimée.'); // <--- 2. L'appel au toast !
  }


return (
<div className="card">
<h2 className="text-xl font-semibold mb-3">Historique</h2>
{sessions.length === 0 ? (
<p className="text-sm text-gray-500">Aucune séance enregistrée pour le moment.</p>
) : (
<div className="space-y-3">
{sessions.map(s => (
<div key={s.id} className="border border-gray-200 dark:border-gray-700 rounded-xl p-3">
<div className="flex items-center justify-between">
<div className="font-medium">{new Date(s.date).toLocaleDateString()}</div>
<button className="btn" onClick={()=>handleDelete(s.id)}>Supprimer</button>
</div>
<div className="mt-2 grid sm:grid-cols-3 gap-3 text-sm">
{s.matches.map((m, i)=> (
<div key={m.id} className="border border-gray-100 dark:border-gray-800 rounded-lg p-2">
<div className="font-medium">Match {i+1}: {m.a} vs {m.b}</div>
<div className="opacity-80">{m.scoreA} - {m.scoreB}</div>
</div>
))}
</div>
{s.notes && <div className="mt-2 text-sm italic opacity-80">📝 {s.notes}</div>}
</div>
))}
</div>
)}
</div>
);
}