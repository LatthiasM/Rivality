import { useState } from 'react';
import { Group } from '../types';
import { supabase, updateGroup, deleteGroup } from '../lib/storage'; // <-- Importer les nouvelles fonctions

interface Props {
  group: Group;
  onClose: () => void;
  onGroupUpdated: (updatedGroup: Group) => void;
  onGroupDeleted: (groupId: string) => void;
}

export default function GroupManagementModal({ group, onClose, onGroupUpdated, onGroupDeleted }: Props) {
  // Section Invitation
  const [inviteEmail, setInviteEmail] = useState('');
  const [isLoadingInvite, setIsLoadingInvite] = useState(false);
  const [inviteMessage, setInviteMessage] = useState('');

  // Section Renommage
  const [newName, setNewName] = useState(group.name);
  const [isLoadingUpdate, setIsLoadingUpdate] = useState(false);

  // Section Suppression
  const [isLoadingDelete, setIsLoadingDelete] = useState(false);

  // --- Logique d'invitation (inchangée, toujours en attente) ---
  async function handleInvite(e: React.FormEvent) {
    e.preventDefault();
    if (!supabase) return;
    setIsLoadingInvite(true);
    setInviteMessage('');
    // ... (logique d'appel 'supabase.functions.invoke'...)
    setInviteMessage('Fonctionnalité pas encore connectée.');
    setIsLoadingInvite(false);
  }

  // --- NOUVEAU : Logique de Renommage ---
  async function handleUpdateName(e: React.FormEvent) {
    e.preventDefault();
    if (!newName.trim() || newName === group.name) return;

    setIsLoadingUpdate(true);
    const updatedGroup = await updateGroup(group.id, newName.trim());
    if (updatedGroup) {
      onGroupUpdated(updatedGroup); // Laisse App.tsx gérer la fermeture
    } else {
      alert("Erreur lors du renommage.");
    }
    setIsLoadingUpdate(false);
  }

  // --- NOUVEAU : Logique de Suppression ---
  async function handleDeleteGroup() {
    if (!confirm(`Êtes-vous sûr de vouloir supprimer "${group.name}" ?\nTOUTES les sessions de ce groupe seront perdues.`)) {
      return;
    }
    setIsLoadingDelete(true);
    const success = await deleteGroup(group.id);
    if (success) {
      onGroupDeleted(group.id); // Laisse App.tsx gérer la fermeture
    } else {
      alert("Erreur lors de la suppression.");
    }
    setIsLoadingDelete(false);
  }


  return (
    <>
      <div className="modal-overlay" onClick={onClose} />
      <div className="modal-content !space-y-6">
        <div className="flex justify-between items-center">
          <h2 className="text-xl font-semibold">Gérer "{group.name}"</h2>
          <button className="btn !px-2 !py-1 text-xs" onClick={onClose}>
            Fermer
          </button>
        </div>

        {/* --- Formulaire Renommer --- */}
        <form onSubmit={handleUpdateName} className="space-y-2">
          <h3 className="text-lg font-medium">Renommer</h3>
          <div>
            <label className="label" htmlFor="rename-group">Nom du groupe</label>
            <input
              id="rename-group"
              type="text"
              className="input w-full"
              value={newName}
              onChange={e => setNewName(e.target.value)}
              required
            />
          </div>
          <button className="btn" disabled={isLoadingUpdate || newName === group.name}>
            {isLoadingUpdate ? 'Enregistrement...' : 'Enregistrer le nouveau nom'}
          </button>
        </form>

        {/* --- Formulaire Inviter (inchangé) --- */}
        <form onSubmit={handleInvite} className="space-y-2">
          <h3 className="text-lg font-medium">Inviter un membre</h3>
          <p className="text-sm text-gray-500">
            L'utilisateur doit déjà avoir un compte sur cette application.
          </p>
          <div>
            <label className="label" htmlFor="invite-email">E-mail de l'invité</label>
            <input
              id="invite-email"
              type="email"
              className="input w-full"
              value={inviteEmail}
              onChange={e => setInviteEmail(e.target.value)}
              placeholder="ami@exemple.com"
            />
          </div>
          <button className="btn" disabled={isLoadingInvite || !inviteEmail}>
            {isLoadingInvite ? 'Envoi...' : "Envoyer l'invitation"}
          </button>
          {inviteMessage && <p className="text-sm">{inviteMessage}</p>}
        </form>
        
        {/* --- Section Supprimer --- */}
        <div className="space-y-2">
           <h3 className="text-lg font-medium text-rose-600">Zone de danger</h3>
           <p className="text-sm text-gray-500">
             La suppression d'un groupe est irréversible et supprime tout son historique.
           </p>
           <button 
             className="btn bg-rose-600 text-white hover:bg-rose-700" 
             disabled={isLoadingDelete}
             onClick={handleDeleteGroup}
            >
             {isLoadingDelete ? 'Suppression...' : 'Supprimer ce groupe'}
           </button>
        </div>

      </div>
    </>
  );
}