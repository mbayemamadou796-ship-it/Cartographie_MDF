import React, { useState } from 'react';
import { UserRole, AppUser, CustomZone } from '../../types';
import { FRENCH_ZONES } from '../membres/AdminMemberFormModal';
import {
  Users,
  UserPlus,
  Shield,
  ShieldCheck,
  UserCheck,
  UserX,
  Trash2,
  Edit3,
  Search,
  Key,
  Info,
  CheckCircle2,
  AlertCircle,
  X,
  Layers
} from 'lucide-react';

interface UserManagementViewProps {
  currentRole: UserRole;
  users: AppUser[];
  customZones?: CustomZone[];
  onAddUser: (user: Omit<AppUser, 'id' | 'lastLogin'>) => void;
  onUpdateUser: (userId: string, updates: Partial<AppUser>) => void;
  onDeleteUser: (userId: string) => void;
  onSwitchRole: (role: UserRole) => void;
}

export const UserManagementView: React.FC<UserManagementViewProps> = ({
  currentRole,
  users,
  customZones = [],
  onAddUser,
  onUpdateUser,
  onDeleteUser,
  onSwitchRole
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<AppUser | null>(null);

  // Password reset modal state
  const [resetUser, setResetUser] = useState<AppUser | null>(null);
  const [newPassword, setNewPassword] = useState('');
  const [confirmNewPassword, setConfirmNewPassword] = useState('');
  const [resetError, setResetError] = useState<string | null>(null);
  const [resetSuccess, setResetSuccess] = useState<string | null>(null);

  // Delete confirmation state
  const [userToDelete, setUserToDelete] = useState<AppUser | null>(null);

  // Form state for add / edit
  const [formNom, setFormNom] = useState('');
  const [formPrenom, setFormPrenom] = useState('');
  const [formEmail, setFormEmail] = useState('');
  const [formUsername, setFormUsername] = useState('');
  const [formPassword, setFormPassword] = useState('');
  const [formConfirmPassword, setFormConfirmPassword] = useState('');
  const [formRole, setFormRole] = useState<UserRole>('user');
  const [formRegion, setFormRegion] = useState('');
  const [formAssignedZoneIds, setFormAssignedZoneIds] = useState<string[]>([]);
  const [formActive, setFormActive] = useState(true);
  const [formError, setFormError] = useState<string | null>(null);

  const openAddModal = () => {
    setEditingUser(null);
    setFormNom('');
    setFormPrenom('');
    setFormEmail('');
    setFormUsername('');
    setFormPassword('');
    setFormConfirmPassword('');
    setFormRole('user');
    setFormRegion('Île-de-France');
    setFormAssignedZoneIds([]);
    setFormActive(true);
    setFormError(null);
    setIsModalOpen(true);
  };

  const openEditModal = (user: AppUser) => {
    setEditingUser(user);
    setFormNom(user.nom || user.name?.split(' ')[1] || user.name || '');
    setFormPrenom(user.prenom || user.name?.split(' ')[0] || '');
    setFormEmail(user.email || '');
    setFormUsername(user.username || '');
    setFormPassword(user.password || '');
    setFormConfirmPassword(user.password || '');
    setFormRole(user.role);
    setFormRegion(user.region || '');
    setFormAssignedZoneIds(user.assignedZoneIds || []);
    setFormActive(user.active);
    setFormError(null);
    setIsModalOpen(true);
  };

  const handleToggleZoneAssignment = (zoneId: string) => {
    setFormAssignedZoneIds((prev) =>
      prev.includes(zoneId) ? prev.filter((id) => id !== zoneId) : [...prev, zoneId]
    );
  };

  const handleSaveUser = (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);

    if (!formNom.trim() || !formPrenom.trim() || !formEmail.trim() || !formUsername.trim()) {
      setFormError('Veuillez remplir tous les champs obligatoires (Nom, Prénom, Email, Identifiant).');
      return;
    }

    if (!editingUser) {
      if (!formPassword) {
        setFormError('Le mot de passe est obligatoire pour la création d\'un utilisateur.');
        return;
      }
      if (formPassword !== formConfirmPassword) {
        setFormError('Les mots de passe ne correspondent pas.');
        return;
      }
    } else {
      if (formPassword && formPassword !== formConfirmPassword) {
        setFormError('Les mots de passe ne correspondent pas.');
        return;
      }
    }

    const fullName = `${formPrenom.trim()} ${formNom.trim()}`;

    if (editingUser) {
      onUpdateUser(editingUser.id, {
        nom: formNom.trim(),
        prenom: formPrenom.trim(),
        name: fullName,
        email: formEmail.trim(),
        username: formUsername.trim(),
        password: formPassword ? formPassword : editingUser.password,
        role: formRole,
        region: formRegion.trim(),
        assignedZoneIds: formRole === 'referent' ? formAssignedZoneIds : [],
        active: formActive
      });
    } else {
      onAddUser({
        nom: formNom.trim(),
        prenom: formPrenom.trim(),
        name: fullName,
        email: formEmail.trim(),
        username: formUsername.trim(),
        password: formPassword,
        role: formRole,
        region: formRegion.trim(),
        assignedZoneIds: formRole === 'referent' ? formAssignedZoneIds : [],
        active: formActive,
        createdAt: new Date().toLocaleDateString('fr-FR')
      });
    }

    setIsModalOpen(false);
  };

  const handleResetPasswordSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setResetError(null);
    setResetSuccess(null);

    if (!resetUser) return;
    if (!newPassword.trim()) {
      setResetError('Veuillez saisir un nouveau mot de passe.');
      return;
    }
    if (newPassword !== confirmNewPassword) {
      setResetError('Les deux mots de passe ne correspondent pas.');
      return;
    }

    onUpdateUser(resetUser.id, { password: newPassword.trim() });
    setResetSuccess(`Le mot de passe de ${resetUser.prenom || ''} ${resetUser.nom || resetUser.name} a été réinitialisé avec succès !`);

    setTimeout(() => {
      setResetUser(null);
      setNewPassword('');
      setConfirmNewPassword('');
      setResetSuccess(null);
    }, 1200);
  };

  const confirmDeleteUser = () => {
    if (userToDelete) {
      onDeleteUser(userToDelete.id);
      setUserToDelete(null);
    }
  };

  const filteredUsers = users.filter((u) => {
    const q = searchQuery.toLowerCase();
    const fullName = `${u.prenom || ''} ${u.nom || ''} ${u.name || ''}`.toLowerCase();
    const username = (u.username || '').toLowerCase();
    const email = (u.email || '').toLowerCase();
    const region = (u.region || '').toLowerCase();
    return fullName.includes(q) || username.includes(q) || email.includes(q) || region.includes(q);
  });

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      
      {/* Header Banner */}
      <div className="bg-white rounded-3xl p-6 border border-emerald-200 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-start gap-3.5">
          <div className="p-3.5 rounded-2xl bg-emerald-100 text-emerald-800 border border-emerald-200 shrink-0">
            <Users className="w-6 h-6 text-emerald-600" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-slate-900 font-['Outfit']">
              Gestion des Utilisateurs & Habilitations
            </h2>
            <p className="text-xs text-slate-500 font-medium mt-0.5">
              Gérez les comptes d'accès, rôles et réinitialisations de mots de passe pour l'application Cartographie MDF
            </p>
          </div>
        </div>

        {currentRole === 'admin' ? (
          <button
            onClick={openAddModal}
            className="inline-flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-[#2be39d] via-[#48c92a] to-[#8de02d] hover:brightness-105 text-emerald-950 font-bold rounded-2xl text-xs shadow-xs transition-all active:scale-95 shrink-0 cursor-pointer"
          >
            <UserPlus className="w-4 h-4 stroke-[2.5]" />
            <span>Ajouter un utilisateur</span>
          </button>
        ) : (
          <div className="px-3.5 py-2 bg-amber-50 border border-amber-200 text-amber-800 rounded-2xl text-xs font-semibold shrink-0">
            ⚠️ Réservé aux Administrateurs
          </div>
        )}
      </div>

      {/* Info Card: Separation Members vs Users */}
      <div className="p-4 bg-emerald-50/70 border border-emerald-200 rounded-3xl flex flex-col md:flex-row items-start md:items-center justify-between gap-3 text-xs">
        <div className="flex items-start gap-3">
          <div className="p-2 bg-emerald-200/80 rounded-xl text-emerald-800 shrink-0 mt-0.5">
            <Info className="w-4 h-4 text-emerald-700" />
          </div>
          <div className="space-y-0.5">
            <p className="font-bold text-slate-900">
              Distinction entre Membres MDF et Utilisateurs de l'Application :
            </p>
            <p className="text-slate-600 leading-relaxed">
              Les <strong>Membres</strong> constituent la base cartographique (annuaire public/interne). Les <strong>Utilisateurs</strong> sont les comptes disposant d'un identifiant et d'un mot de passe pour se connecter à l'application.
            </p>
          </div>
        </div>

        {/* Mode switcher for testing */}
        <div className="flex items-center gap-2 shrink-0 self-end md:self-center">
          <button
            onClick={() => onSwitchRole('user')}
            className={`px-3 py-1.5 rounded-xl font-bold text-xs transition-all cursor-pointer ${
              currentRole === 'user'
                ? 'bg-slate-800 text-white shadow-xs'
                : 'bg-white border border-slate-200 text-slate-700 hover:bg-slate-100'
            }`}
          >
            Mode Utilisateur
          </button>
          <button
            onClick={() => onSwitchRole('admin')}
            className={`px-3 py-1.5 rounded-xl font-bold text-xs transition-all cursor-pointer ${
              currentRole === 'admin'
                ? 'bg-gradient-to-r from-[#2be39d] to-[#48c92a] text-emerald-950 shadow-xs font-extrabold'
                : 'bg-white border border-slate-200 text-slate-700 hover:bg-slate-100'
            }`}
          >
            Mode Administrateur
          </button>
        </div>
      </div>

      {/* Search & Stats Bar */}
      <div className="bg-white rounded-3xl p-4 border border-emerald-200 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
          <input
            type="text"
            placeholder="Rechercher par nom, identifiant, email..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-slate-50 border border-emerald-200 rounded-xl pl-9 pr-3 py-2 text-xs text-slate-800 focus:bg-white focus:border-emerald-500 outline-none font-medium"
          />
        </div>

        <div className="flex items-center gap-4 text-xs font-semibold text-slate-600">
          <span>Comptes totaux : <strong className="text-slate-900">{users.length}</strong></span>
          <span>Administrateurs : <strong className="text-emerald-700">{users.filter((u) => u.role === 'admin').length}</strong></span>
          <span>Utilisateurs : <strong className="text-slate-700">{users.filter((u) => u.role === 'user').length}</strong></span>
          <span>Actifs : <strong className="text-emerald-700">{users.filter((u) => u.active).length}</strong></span>
        </div>
      </div>

      {/* Users Table */}
      <div className="bg-white rounded-3xl border border-emerald-200 overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-700 font-bold border-b border-emerald-100">
              <tr>
                <th className="p-4 pl-6">Nom & Prénom</th>
                <th className="p-4">Identifiant</th>
                <th className="p-4">Adresse Email</th>
                <th className="p-4">Rôle</th>
                <th className="p-4">Région</th>
                <th className="p-4">Statut</th>
                <th className="p-4">Dernière Connexion</th>
                <th className="p-4 pr-6 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-emerald-100">
              {filteredUsers.map((user) => {
                const displayName = user.name || `${user.prenom || ''} ${user.nom || ''}`.trim() || 'Utilisateur';
                const displayNom = user.nom || (user.name ? user.name.split(' ')[1] : '');
                const displayPrenom = user.prenom || (user.name ? user.name.split(' ')[0] : '');

                return (
                  <tr key={user.id} className="hover:bg-emerald-50/40 transition-colors">
                    {/* Nom & Prenom */}
                    <td className="p-4 pl-6 font-bold text-slate-900">
                      <div className="flex items-center gap-2.5">
                        <div className="w-8 h-8 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-200 flex items-center justify-center font-extrabold text-xs shrink-0">
                          {displayPrenom[0] ? displayPrenom[0].toUpperCase() : 'U'}
                          {displayNom[0] ? displayNom[0].toUpperCase() : ''}
                        </div>
                        <div>
                          <div className="text-slate-900 font-bold">{displayPrenom} {displayNom}</div>
                          {user.createdAt && <div className="text-[10px] text-slate-400 font-normal">Créé le {user.createdAt}</div>}
                        </div>
                      </div>
                    </td>

                    {/* Identifiant */}
                    <td className="p-4 text-slate-800 font-mono font-semibold">
                      <span className="px-2 py-0.5 bg-slate-100 rounded-md border border-slate-200 text-[11px]">
                        {user.username || 'Non défini'}
                      </span>
                    </td>

                    {/* Email */}
                    <td className="p-4 text-slate-600 font-medium">{user.email}</td>

                    {/* Role */}
                    <td className="p-4">
                      {user.role === 'admin' ? (
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-extrabold bg-purple-100 text-purple-900 border border-purple-300">
                          <ShieldCheck className="w-3 h-3 text-purple-700" /> Administrateur
                        </span>
                      ) : user.role === 'referent' ? (
                        <div className="space-y-1">
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-extrabold bg-blue-100 text-blue-900 border border-blue-300">
                            <Shield className="w-3 h-3 text-blue-700" /> Référent Zone
                          </span>
                          {user.assignedZoneIds && user.assignedZoneIds.length > 0 && (
                            <div className="flex flex-wrap gap-1">
                              {user.assignedZoneIds.map((zId) => {
                                const foundZone = customZones.find((z) => z.id === zId);
                                return (
                                  <span key={zId} className="text-[9px] bg-blue-50 text-blue-800 font-bold px-1.5 py-0.2 rounded border border-blue-200">
                                    {foundZone ? foundZone.name : zId}
                                  </span>
                                );
                              })}
                            </div>
                          )}
                        </div>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-slate-100 text-slate-700 border border-slate-200">
                          <Shield className="w-3 h-3 text-slate-500" /> Lecture seule
                        </span>
                      )}
                    </td>

                    {/* Region */}
                    <td className="p-4">
                      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-lg text-[11px] font-bold bg-emerald-50 text-emerald-900 border border-emerald-200">
                        {user.region || 'Île-de-France'}
                      </span>
                    </td>

                    {/* Status */}
                    <td className="p-4">
                      {user.active ? (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-emerald-50 text-emerald-700 border border-emerald-200 rounded-md font-bold text-[11px]">
                          <UserCheck className="w-3.5 h-3.5" /> Actif
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-rose-50 text-rose-700 border border-rose-200 rounded-md font-bold text-[11px]">
                          <UserX className="w-3.5 h-3.5" /> Inactif
                        </span>
                      )}
                    </td>

                    {/* Last Login */}
                    <td className="p-4 text-slate-500 font-mono text-[11px]">{user.lastLogin || 'Jamais'}</td>

                    {/* Actions */}
                    <td className="p-4 pr-6 text-right">
                      {currentRole === 'admin' ? (
                        <div className="flex items-center justify-end gap-1">
                          
                          {/* Reset Password Button */}
                          <button
                            onClick={() => {
                              setResetUser(user);
                              setNewPassword('');
                              setConfirmNewPassword('');
                              setResetError(null);
                              setResetSuccess(null);
                            }}
                            title="Réinitialiser le mot de passe"
                            className="p-1.5 hover:bg-emerald-100 text-emerald-800 rounded-lg transition-colors cursor-pointer"
                          >
                            <Key className="w-4 h-4 text-emerald-700" />
                          </button>

                          {/* Edit Button */}
                          <button
                            onClick={() => openEditModal(user)}
                            title="Modifier les informations"
                            className="p-1.5 hover:bg-slate-100 text-slate-700 rounded-lg transition-colors cursor-pointer"
                          >
                            <Edit3 className="w-4 h-4" />
                          </button>

                          {/* Toggle Active Button */}
                          <button
                            onClick={() => onUpdateUser(user.id, { active: !user.active })}
                            title={user.active ? "Désactiver ce compte" : "Réactiver ce compte"}
                            className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
                              user.active ? 'hover:bg-amber-100 text-amber-800' : 'hover:bg-emerald-100 text-emerald-800'
                            }`}
                          >
                            {user.active ? <UserX className="w-4 h-4" /> : <UserCheck className="w-4 h-4" />}
                          </button>

                          {/* Delete Button */}
                          <button
                            onClick={() => setUserToDelete(user)}
                            title="Supprimer définitivement"
                            className="p-1.5 hover:bg-rose-100 text-rose-700 rounded-lg transition-colors cursor-pointer"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      ) : (
                        <span className="text-slate-400 italic text-[11px]">Lecture seule</span>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* MODAL: Add / Edit User */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl shadow-2xl border border-emerald-200 w-full max-w-lg overflow-hidden p-6 space-y-4">
            
            <div className="flex items-center justify-between border-b border-emerald-100 pb-3">
              <h3 className="text-lg font-bold text-slate-900 font-['Outfit']">
                {editingUser ? 'Modifier l\'utilisateur' : 'Créer un nouvel utilisateur'}
              </h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-1 text-slate-400 hover:text-slate-600 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {formError && (
              <div className="p-3 bg-rose-50 border border-rose-200 rounded-2xl flex items-center gap-2 text-rose-800 text-xs">
                <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
                <span>{formError}</span>
              </div>
            )}

            <form onSubmit={handleSaveUser} className="space-y-3.5 text-xs">
              
              {/* Nom & Prenom */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">
                    Prénom <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={formPrenom}
                    onChange={(e) => setFormPrenom(e.target.value)}
                    placeholder="Ex: Mamadou"
                    className="w-full bg-slate-50 border border-emerald-200 rounded-xl px-3 py-2 text-slate-800 focus:bg-white focus:border-emerald-500 outline-none font-medium"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">
                    Nom <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={formNom}
                    onChange={(e) => setFormNom(e.target.value)}
                    placeholder="Ex: Mbaye"
                    className="w-full bg-slate-50 border border-emerald-200 rounded-xl px-3 py-2 text-slate-800 focus:bg-white focus:border-emerald-500 outline-none font-medium"
                  />
                </div>
              </div>

              {/* Email & Region */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">
                    Adresse e-mail <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="email"
                    required
                    value={formEmail}
                    onChange={(e) => setFormEmail(e.target.value)}
                    placeholder="Ex: membre@mbokdefrance.org"
                    className="w-full bg-slate-50 border border-emerald-200 rounded-xl px-3 py-2 text-slate-800 focus:bg-white focus:border-emerald-500 outline-none font-medium"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">
                    Région <span className="text-rose-500">*</span>
                  </label>
                  <select
                    value={formRegion}
                    onChange={(e) => setFormRegion(e.target.value)}
                    className="w-full bg-slate-50 border border-emerald-200 rounded-xl px-3 py-2 text-slate-800 focus:bg-white focus:border-emerald-500 outline-none font-medium"
                  >
                    {FRENCH_ZONES.map((z) => (
                      <option key={z} value={z}>{z}</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Identifiant */}
              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  Identifiant de connexion <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={formUsername}
                  onChange={(e) => setFormUsername(e.target.value)}
                  placeholder="Ex: mmbaye"
                  className="w-full bg-slate-50 border border-emerald-200 rounded-xl px-3 py-2 text-slate-800 focus:bg-white focus:border-emerald-500 outline-none font-medium font-mono"
                />
              </div>

              {/* Password Fields */}
              <div className="grid grid-cols-2 gap-3 p-3 bg-emerald-50/50 rounded-2xl border border-emerald-100">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">
                    Mot de passe {!editingUser && <span className="text-rose-500">*</span>}
                  </label>
                  <input
                    type="password"
                    required={!editingUser}
                    value={formPassword}
                    onChange={(e) => setFormPassword(e.target.value)}
                    placeholder={editingUser ? "Inchangé si vide" : "••••••••"}
                    className="w-full bg-white border border-emerald-200 rounded-xl px-3 py-2 text-slate-800 focus:border-emerald-500 outline-none font-medium"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">
                    Confirmer le mot de passe {!editingUser && <span className="text-rose-500">*</span>}
                  </label>
                  <input
                    type="password"
                    required={!editingUser}
                    value={formConfirmPassword}
                    onChange={(e) => setFormConfirmPassword(e.target.value)}
                    placeholder={editingUser ? "Inchangé si vide" : "••••••••"}
                    className="w-full bg-white border border-emerald-200 rounded-xl px-3 py-2 text-slate-800 focus:border-emerald-500 outline-none font-medium"
                  />
                </div>
              </div>

              {/* Role & Status */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Rôle d'accès *</label>
                  <select
                    value={formRole}
                    onChange={(e) => setFormRole(e.target.value as UserRole)}
                    className="w-full bg-slate-50 border border-emerald-200 rounded-xl px-3 py-2 text-slate-800 focus:bg-white focus:border-emerald-500 outline-none font-medium"
                  >
                    <option value="user">Utilisateur (Consultation seule)</option>
                    <option value="referent">Référent (Gestion de zone attribuée)</option>
                    <option value="admin">Administrateur (Accès global & Audit)</option>
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Statut du compte</label>
                  <select
                    value={formActive ? 'active' : 'inactive'}
                    onChange={(e) => setFormActive(e.target.value === 'active')}
                    className="w-full bg-slate-50 border border-emerald-200 rounded-xl px-3 py-2 text-slate-800 focus:bg-white focus:border-emerald-500 outline-none font-medium"
                  >
                    <option value="active">Actif (Autorisé)</option>
                    <option value="inactive">Inactif (Bloqué)</option>
                  </select>
                </div>
              </div>

              {/* Referent Zone Selection */}
              {formRole === 'referent' && (
                <div className="p-3 bg-blue-50/70 border border-blue-200 rounded-2xl space-y-2">
                  <label className="block text-xs font-bold text-blue-900 flex items-center gap-1.5">
                    <Layers className="w-4 h-4 text-blue-600" />
                    <span>Zones attribuées à ce référent ({formAssignedZoneIds.length})</span>
                  </label>
                  <p className="text-[11px] text-blue-700 font-medium leading-relaxed">
                    Ce référent aura un accès exclusif aux membres et statistiques de ces zones.
                  </p>

                  {customZones.length === 0 ? (
                    <div className="p-2 bg-white rounded-xl border border-blue-200 text-slate-500 text-[11px] italic">
                      Aucune zone personnalisée disponible. Créez d'abord des zones dans l'onglet "Zones".
                    </div>
                  ) : (
                    <div className="grid grid-cols-2 gap-2 pt-1 max-h-36 overflow-y-auto">
                      {customZones.map((z) => {
                        const isChecked = formAssignedZoneIds.includes(z.id);
                        return (
                          <label
                            key={z.id}
                            className={`p-2 rounded-xl border flex items-center gap-2 text-xs font-bold transition-all cursor-pointer ${
                              isChecked
                                ? 'bg-blue-100 border-blue-400 text-blue-950'
                                : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                            }`}
                          >
                            <input
                              type="checkbox"
                              checked={isChecked}
                              onChange={() => handleToggleZoneAssignment(z.id)}
                              className="rounded border-blue-300 text-blue-600 focus:ring-blue-500 w-3.5 h-3.5"
                            />
                            <span className="truncate">{z.name}</span>
                          </label>
                        );
                      })}
                    </div>
                  )}
                </div>
              )}

              <div className="flex justify-end gap-2 pt-4 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl font-bold transition-colors cursor-pointer"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-gradient-to-r from-[#2be39d] to-[#48c92a] text-emerald-950 font-extrabold rounded-xl shadow-xs hover:brightness-105 transition-all cursor-pointer"
                >
                  {editingUser ? 'Mettre à jour' : 'Enregistrer le compte'}
                </button>
              </div>
            </form>

          </div>
        </div>
      )}

      {/* MODAL: Password Reset */}
      {resetUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl shadow-2xl border border-emerald-200 w-full max-w-md p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-emerald-100 pb-3">
              <div className="flex items-center gap-2">
                <div className="p-2 bg-emerald-100 text-emerald-800 rounded-xl">
                  <Key className="w-5 h-5 text-emerald-700" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-900 font-['Outfit']">
                    Réinitialiser le mot de passe
                  </h3>
                  <p className="text-xs text-slate-500 font-medium">
                    Pour : <strong>{resetUser.prenom || ''} {resetUser.nom || resetUser.name}</strong> (@{resetUser.username})
                  </p>
                </div>
              </div>
              <button
                onClick={() => setResetUser(null)}
                className="p-1 text-slate-400 hover:text-slate-600 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {resetError && (
              <div className="p-3 bg-rose-50 border border-rose-200 rounded-2xl flex items-center gap-2 text-rose-800 text-xs">
                <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
                <span>{resetError}</span>
              </div>
            )}

            {resetSuccess && (
              <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-2xl flex items-center gap-2 text-emerald-900 text-xs font-bold">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>{resetSuccess}</span>
              </div>
            )}

            <form onSubmit={handleResetPasswordSubmit} className="space-y-3 text-xs">
              <div>
                <label className="block font-bold text-slate-700 mb-1">Nouveau mot de passe</label>
                <input
                  type="password"
                  required
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full bg-slate-50 border border-emerald-200 rounded-xl px-3 py-2 text-slate-800 focus:bg-white focus:border-emerald-500 outline-none font-medium"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Confirmer le nouveau mot de passe</label>
                <input
                  type="password"
                  required
                  value={confirmNewPassword}
                  onChange={(e) => setConfirmNewPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full bg-slate-50 border border-emerald-200 rounded-xl px-3 py-2 text-slate-800 focus:bg-white focus:border-emerald-500 outline-none font-medium"
                />
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setResetUser(null)}
                  className="px-4 py-2 bg-slate-100 text-slate-700 rounded-xl font-bold hover:bg-slate-200"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-gradient-to-r from-[#2be39d] to-[#48c92a] text-emerald-950 font-extrabold rounded-xl shadow-xs hover:brightness-105"
                >
                  Appliquer le nouveau mot de passe
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: Delete Confirmation */}
      {userToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl shadow-2xl border border-rose-200 w-full max-w-md p-6 space-y-4">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-rose-100 text-rose-700 rounded-2xl shrink-0">
                <Trash2 className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-base font-bold text-slate-900 font-['Outfit']">
                  Supprimer cet utilisateur ?
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Voulez-vous vraiment supprimer le compte d'accès de <strong>{userToDelete.prenom || ''} {userToDelete.nom || userToDelete.name}</strong> (@{userToDelete.username}) ?
                </p>
              </div>
            </div>

            <p className="text-[11px] text-emerald-800 bg-emerald-50 p-2.5 rounded-xl border border-emerald-200">
              ℹ️ <strong>Note importante :</strong> La suppression d'un utilisateur d'accès n'entraîne aucune suppression des membres répertoriés dans la cartographie.
            </p>

            <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setUserToDelete(null)}
                className="px-4 py-2 bg-slate-100 text-slate-700 font-bold rounded-xl hover:bg-slate-200 text-xs"
              >
                Annuler
              </button>
              <button
                type="button"
                onClick={confirmDeleteUser}
                className="px-5 py-2 bg-rose-600 text-white font-bold rounded-xl hover:bg-rose-700 text-xs shadow-xs"
              >
                Confirmer la suppression
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
