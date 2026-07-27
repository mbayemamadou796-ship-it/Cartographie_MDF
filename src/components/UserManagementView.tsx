import React, { useState } from 'react';
import { UserRole } from '../types';
import { Users, UserPlus, Shield, ShieldCheck, UserCheck, UserX, Trash2, Edit3, CheckCircle2, Search } from 'lucide-react';

export interface AppUser {
  id: string;
  name: string;
  email: string;
  username?: string;
  password?: string;
  role: UserRole;
  active: boolean;
  lastLogin: string;
}

interface UserManagementViewProps {
  currentRole: UserRole;
  users: AppUser[];
  onAddUser: (user: Omit<AppUser, 'id' | 'lastLogin'>) => void;
  onUpdateUser: (userId: string, updates: Partial<AppUser>) => void;
  onDeleteUser: (userId: string) => void;
  onSwitchRole: (role: UserRole) => void;
}

export const UserManagementView: React.FC<UserManagementViewProps> = ({
  currentRole,
  users,
  onAddUser,
  onUpdateUser,
  onDeleteUser,
  onSwitchRole
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<AppUser | null>(null);

  // Form state
  const [formName, setFormName] = useState('');
  const [formEmail, setFormEmail] = useState('');
  const [formUsername, setFormUsername] = useState('');
  const [formPassword, setFormPassword] = useState('');
  const [formRole, setFormRole] = useState<UserRole>('user');
  const [formActive, setFormActive] = useState(true);

  const openAddModal = () => {
    setEditingUser(null);
    setFormName('');
    setFormEmail('');
    setFormUsername('');
    setFormPassword('');
    setFormRole('user');
    setFormActive(true);
    setIsModalOpen(true);
  };

  const openEditModal = (user: AppUser) => {
    setEditingUser(user);
    setFormName(user.name);
    setFormEmail(user.email);
    setFormUsername(user.username || '');
    setFormPassword(user.password || '');
    setFormRole(user.role);
    setFormActive(user.active);
    setIsModalOpen(true);
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formName.trim() || !formEmail.trim()) return;

    if (editingUser) {
      onUpdateUser(editingUser.id, {
        name: formName,
        email: formEmail,
        username: formUsername.trim() || undefined,
        password: formPassword.trim() || undefined,
        role: formRole,
        active: formActive
      });
    } else {
      onAddUser({
        name: formName,
        email: formEmail,
        username: formUsername.trim() || undefined,
        password: formPassword.trim() || undefined,
        role: formRole,
        active: formActive
      });
    }

    setIsModalOpen(false);
  };

  const filteredUsers = users.filter(
    (u) =>
      u.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      u.email.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      
      {/* Header Banner */}
      <div className="bg-white rounded-3xl p-6 border border-emerald-200 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-start gap-3">
          <div className="p-3 rounded-2xl bg-emerald-100 text-emerald-800 border border-emerald-200 shrink-0">
            <Users className="w-6 h-6 text-emerald-600" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-slate-900 font-['Outfit']">
              Gestion des Utilisateurs & Droits d'Accès
            </h2>
            <p className="text-xs text-slate-500 font-medium mt-0.5">
              Gérez les comptes d'accès à l'application Cartographie MDF (Administrateurs & Utilisateurs)
            </p>
          </div>
        </div>

        {currentRole === 'admin' ? (
          <button
            onClick={openAddModal}
            className="inline-flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-[#2be39d] via-[#48c92a] to-[#8de02d] hover:brightness-105 text-emerald-950 font-bold rounded-2xl text-xs shadow-xs transition-all active:scale-95 shrink-0"
          >
            <UserPlus className="w-4 h-4" />
            <span>Ajouter un utilisateur</span>
          </button>
        ) : (
          <div className="px-3.5 py-2 bg-amber-50 border border-amber-200 text-amber-800 rounded-2xl text-xs font-semibold shrink-0">
            ⚠️ Réservé aux Administrateurs
          </div>
        )}
      </div>

      {/* Role Profile Switcher Banner */}
      <div className="p-4 bg-emerald-50/80 border border-emerald-200 rounded-3xl flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
        <div className="flex items-center gap-3">
          <span className="p-2 rounded-xl bg-emerald-200/80 text-emerald-900 font-bold">
            {currentRole === 'admin' ? <ShieldCheck className="w-5 h-5 text-emerald-700" /> : <Shield className="w-5 h-5 text-slate-600" />}
          </span>
          <div>
            <p className="font-bold text-slate-900">
              Votre session actuelle est : <span className="text-emerald-900 uppercase font-extrabold">{currentRole === 'admin' ? 'Administrateur' : 'Utilisateur (Consultation)'}</span>
            </p>
            <p className="text-slate-500 text-[11px] mt-0.5">
              {currentRole === 'admin'
                ? 'Accès complet : modification des membres, création de zones, gestion des utilisateurs, imports/exports.'
                : 'Accès limité : consultation de l\'annuaire, de la carte et des zones en lecture seule.'}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <button
            onClick={() => onSwitchRole('user')}
            className={`px-3 py-1.5 rounded-xl font-bold text-xs transition-all ${
              currentRole === 'user'
                ? 'bg-slate-800 text-white shadow-xs'
                : 'bg-white border border-slate-200 text-slate-700 hover:bg-slate-100'
            }`}
          >
            Tester mode Utilisateur
          </button>
          <button
            onClick={() => onSwitchRole('admin')}
            className={`px-3 py-1.5 rounded-xl font-bold text-xs transition-all ${
              currentRole === 'admin'
                ? 'bg-gradient-to-r from-[#2be39d] to-[#48c92a] text-emerald-950 shadow-xs'
                : 'bg-white border border-slate-200 text-slate-700 hover:bg-slate-100'
            }`}
          >
            Passer en Administrateur
          </button>
        </div>
      </div>

      {/* Search & Stats Bar */}
      <div className="bg-white rounded-3xl p-4 border border-emerald-200 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
          <input
            type="text"
            placeholder="Rechercher un utilisateur..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-slate-50 border border-emerald-200 rounded-xl pl-9 pr-3 py-2 text-xs text-slate-800 focus:bg-white focus:border-emerald-500 outline-none font-medium"
          />
        </div>

        <div className="flex items-center gap-4 text-xs font-semibold text-slate-600">
          <span>Total : <strong className="text-slate-900">{users.length}</strong></span>
          <span>Admins : <strong className="text-emerald-700">{users.filter(u => u.role === 'admin').length}</strong></span>
          <span>Actifs : <strong className="text-emerald-700">{users.filter(u => u.active).length}</strong></span>
        </div>
      </div>

      {/* Users Table */}
      <div className="bg-white rounded-3xl border border-emerald-200 overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-700 font-bold border-b border-emerald-100">
              <tr>
                <th className="p-4 pl-6">Nom & Prénom</th>
                <th className="p-4">Email</th>
                <th className="p-4">Rôle</th>
                <th className="p-4">Statut</th>
                <th className="p-4">Dernière Connexion</th>
                <th className="p-4 pr-6 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-emerald-100">
              {filteredUsers.map((user) => (
                <tr key={user.id} className="hover:bg-emerald-50/50 transition-colors">
                  <td className="p-4 pl-6 font-bold text-slate-900">
                    <div className="flex items-center gap-2.5">
                      <div className="w-8 h-8 rounded-full bg-emerald-100 text-emerald-800 flex items-center justify-center font-extrabold text-xs">
                        {user.name.split(' ').map((n) => n[0]).join('').toUpperCase()}
                      </div>
                      <span>{user.name}</span>
                    </div>
                  </td>
                  <td className="p-4 text-slate-600 font-medium">{user.email}</td>
                  <td className="p-4">
                    {user.role === 'admin' ? (
                      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-extrabold bg-emerald-100 text-emerald-900 border border-emerald-300">
                        <ShieldCheck className="w-3 h-3 text-emerald-700" /> Administrateur
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-slate-100 text-slate-700 border border-slate-200">
                        <Shield className="w-3 h-3 text-slate-500" /> Utilisateur
                      </span>
                    )}
                  </td>
                  <td className="p-4">
                    {user.active ? (
                      <span className="inline-flex items-center gap-1 text-emerald-700 font-bold">
                        <UserCheck className="w-3.5 h-3.5" /> Actif
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 text-rose-600 font-bold">
                        <UserX className="w-3.5 h-3.5" /> Désactivé
                      </span>
                    )}
                  </td>
                  <td className="p-4 text-slate-500 font-mono text-[11px]">{user.lastLogin}</td>
                  <td className="p-4 pr-6 text-right">
                    {currentRole === 'admin' ? (
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => openEditModal(user)}
                          title="Modifier"
                          className="p-1.5 hover:bg-emerald-100 text-emerald-800 rounded-lg transition-colors"
                        >
                          <Edit3 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => onUpdateUser(user.id, { active: !user.active })}
                          title={user.active ? "Désactiver" : "Activer"}
                          className={`p-1.5 rounded-lg transition-colors ${
                            user.active ? 'hover:bg-amber-100 text-amber-800' : 'hover:bg-emerald-100 text-emerald-800'
                          }`}
                        >
                          {user.active ? <UserX className="w-4 h-4" /> : <UserCheck className="w-4 h-4" />}
                        </button>
                        <button
                          onClick={() => onDeleteUser(user.id)}
                          title="Supprimer"
                          className="p-1.5 hover:bg-rose-100 text-rose-700 rounded-lg transition-colors"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    ) : (
                      <span className="text-slate-400 italic text-[11px]">Lecture seule</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add / Edit User Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl shadow-2xl border border-emerald-200 w-full max-w-md overflow-hidden p-6 space-y-4">
            <h3 className="text-lg font-bold text-slate-900 font-['Outfit'] border-b border-emerald-100 pb-3">
              {editingUser ? 'Modifier l\'utilisateur' : 'Ajouter un nouvel utilisateur'}
            </h3>

            <form onSubmit={handleSave} className="space-y-4 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Nom complet *</label>
                <input
                  type="text"
                  required
                  value={formName}
                  onChange={(e) => setFormName(e.target.value)}
                  placeholder="Ex: Jean Dupont"
                  className="w-full bg-slate-50 border border-emerald-200 rounded-xl px-3 py-2 text-slate-800 focus:bg-white focus:border-emerald-500 outline-none font-medium"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Adresse Email *</label>
                <input
                  type="email"
                  required
                  value={formEmail}
                  onChange={(e) => setFormEmail(e.target.value)}
                  placeholder="Ex: jean.dupont@mbokdefrance.org"
                  className="w-full bg-slate-50 border border-emerald-200 rounded-xl px-3 py-2 text-slate-800 focus:bg-white focus:border-emerald-500 outline-none font-medium"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Identifiant</label>
                  <input
                    type="text"
                    value={formUsername}
                    onChange={(e) => setFormUsername(e.target.value)}
                    placeholder="Ex: jdupont"
                    className="w-full bg-slate-50 border border-emerald-200 rounded-xl px-3 py-2 text-slate-800 focus:bg-white focus:border-emerald-500 outline-none font-medium"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Mot de passe</label>
                  <input
                    type="password"
                    value={formPassword}
                    onChange={(e) => setFormPassword(e.target.value)}
                    placeholder="Ex: ••••••••"
                    className="w-full bg-slate-50 border border-emerald-200 rounded-xl px-3 py-2 text-slate-800 focus:bg-white focus:border-emerald-500 outline-none font-medium"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Rôle dans l'application *</label>
                <select
                  value={formRole}
                  onChange={(e) => setFormRole(e.target.value as UserRole)}
                  className="w-full bg-slate-50 border border-emerald-200 rounded-xl px-3 py-2 text-slate-800 focus:bg-white focus:border-emerald-500 outline-none font-medium"
                >
                  <option value="user">Utilisateur (Consultation seule)</option>
                  <option value="admin">Administrateur (Gestion complète)</option>
                </select>
              </div>

              <div className="flex items-center gap-2 pt-2">
                <input
                  type="checkbox"
                  id="userActive"
                  checked={formActive}
                  onChange={(e) => setFormActive(e.target.checked)}
                  className="w-4 h-4 text-emerald-600 rounded border-slate-300 focus:ring-emerald-500"
                />
                <label htmlFor="userActive" className="font-semibold text-slate-700 cursor-pointer">
                  Compte actif
                </label>
              </div>

              <div className="flex justify-end gap-2 pt-4 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl font-bold transition-colors"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-gradient-to-r from-[#2be39d] to-[#48c92a] text-emerald-950 font-bold rounded-xl shadow-xs hover:brightness-105 transition-all"
                >
                  {editingUser ? 'Mettre à jour' : 'Enregistrer'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
