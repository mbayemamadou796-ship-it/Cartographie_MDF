import React, { useState } from 'react';
import { CustomZone, Member, AppUser } from '../../types';
import { X, UserCheck, UserPlus, Trash2, Search, ShieldCheck, ShieldAlert, MapPin } from 'lucide-react';

/**
 * Désignation des référents d'une zone — la zone est l'élément central :
 * seuls les MEMBRES de la zone peuvent être désignés (plusieurs référents
 * possibles). Le compte utilisateur reste une notion distincte : il donne
 * les droits d'accès et se gère dans « Utilisateurs & Droits ».
 */
interface DesignerReferentModalProps {
  isOpen: boolean;
  zone: CustomZone | null;
  members: Member[];
  users: AppUser[];
  onDesigner: (zoneId: string, memberId: string) => void;
  onRetirer: (zoneId: string, memberId: string) => void;
  onClose: () => void;
}

export const DesignerReferentModal: React.FC<DesignerReferentModalProps> = ({
  isOpen,
  zone,
  members,
  users,
  onDesigner,
  onRetirer,
  onClose
}) => {
  const [search, setSearch] = useState('');

  if (!isOpen || !zone) return null;

  const referentIds = zone.referentMemberIds || [];
  const zoneMembers = members.filter((m) => zone.memberIds.includes(m.id));
  const referents = zoneMembers.filter((m) => referentIds.includes(m.id));
  const candidates = zoneMembers.filter((m) => {
    if (referentIds.includes(m.id)) return false;
    const q = search.trim().toLowerCase();
    if (!q) return true;
    return `${m.prenom} ${m.nom} ${m.ville || ''}`.toLowerCase().includes(q);
  });

  /** État du compte utilisateur lié au membre (par e-mail). */
  const accountStatus = (member: Member): { label: string; ok: boolean } => {
    const email = (member.email || '').trim().toLowerCase();
    const account = email
      ? users.find((u) => (u.email || '').trim().toLowerCase() === email)
      : undefined;
    if (!account) return { label: 'Aucun compte utilisateur — à créer dans « Utilisateurs & Droits »', ok: false };
    if (!account.active) return { label: `Compte @${account.username} désactivé`, ok: false };
    if (account.role === 'referent' || account.role === 'admin' || account.role === 'super_admin') {
      return { label: `Compte @${account.username} actif (${account.role === 'referent' ? 'Référent' : 'Admin'})`, ok: true };
    }
    return { label: `Compte @${account.username} existant (lecture seule) — passer le rôle en Référent`, ok: false };
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl shadow-2xl border border-emerald-200 w-full max-w-xl max-h-[90vh] flex flex-col overflow-hidden">

        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-emerald-100 bg-emerald-50 shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-emerald-100 text-emerald-800 rounded-xl border border-emerald-200">
              <UserCheck className="w-5 h-5 text-emerald-700" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900 font-['Outfit']">
                Désigner un référent — Zone {zone.name}
              </h3>
              <p className="text-xs text-emerald-800 font-medium">
                Seuls les membres de cette zone peuvent être désignés. Une zone peut avoir plusieurs référents.
              </p>
            </div>
          </div>
          <button onClick={onClose} className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-emerald-100 rounded-xl transition-all cursor-pointer">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <div className="overflow-y-auto p-5 space-y-4 text-xs flex-1">

          {/* Référents actuels */}
          <div className="space-y-2">
            <h4 className="font-bold text-emerald-800 uppercase tracking-wider text-[10px] pb-1 border-b border-emerald-200">
              Référents actuels de la zone ({referents.length})
            </h4>
            {referents.length === 0 ? (
              <p className="text-slate-500 italic bg-slate-50 p-3 rounded-xl border border-slate-200">
                Aucun référent désigné pour cette zone.
              </p>
            ) : (
              referents.map((m) => {
                const status = accountStatus(m);
                return (
                  <div key={m.id} className="flex items-center justify-between gap-3 p-3 bg-emerald-50/70 rounded-2xl border border-emerald-200">
                    <div className="flex items-center gap-2.5 min-w-0">
                      <div className="w-9 h-9 rounded-xl bg-emerald-600 text-white font-extrabold flex items-center justify-center shrink-0">
                        {(m.prenom?.[0] || '') + (m.nom?.[0] || '')}
                      </div>
                      <div className="min-w-0">
                        <p className="font-bold text-slate-900 truncate">{m.prenom} {m.nom}</p>
                        <p className={`text-[10px] font-semibold flex items-center gap-1 ${status.ok ? 'text-emerald-700' : 'text-amber-700'}`}>
                          {status.ok ? <ShieldCheck className="w-3 h-3 shrink-0" /> : <ShieldAlert className="w-3 h-3 shrink-0" />}
                          <span className="truncate">{status.label}</span>
                        </p>
                      </div>
                    </div>
                    <button
                      onClick={() => onRetirer(zone.id, m.id)}
                      title="Retirer ce référent"
                      className="p-2 text-rose-600 hover:bg-rose-100 rounded-xl transition-colors cursor-pointer shrink-0"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                );
              })
            )}
          </div>

          {/* Membres désignables */}
          <div className="space-y-2">
            <div className="flex items-center justify-between pb-1 border-b border-emerald-200">
              <h4 className="font-bold text-emerald-800 uppercase tracking-wider text-[10px]">
                Membres de la zone désignables ({candidates.length})
              </h4>
              <div className="relative">
                <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-2" />
                <input
                  type="text"
                  placeholder="Rechercher un membre..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="bg-slate-50 border border-emerald-200 rounded-lg pl-8 pr-2.5 py-1.5 text-[11px] text-slate-800 focus:bg-white focus:border-emerald-500 outline-none font-medium w-48"
                />
              </div>
            </div>

            {zoneMembers.length === 0 ? (
              <p className="text-slate-500 italic bg-amber-50 p-3 rounded-xl border border-amber-200">
                Cette zone ne contient encore aucun membre : ajoutez d'abord des membres à la zone avant de désigner un référent.
              </p>
            ) : candidates.length === 0 ? (
              <p className="text-slate-500 italic bg-slate-50 p-3 rounded-xl border border-slate-200">
                Aucun autre membre désignable{search ? ' pour cette recherche' : ''}.
              </p>
            ) : (
              <div className="space-y-1.5 max-h-64 overflow-y-auto pr-1">
                {candidates.map((m) => (
                  <div key={m.id} className="flex items-center justify-between gap-3 p-2.5 bg-white rounded-2xl border border-slate-200 hover:border-emerald-300 transition-colors">
                    <div className="flex items-center gap-2.5 min-w-0">
                      <div className="w-8 h-8 rounded-xl bg-slate-100 text-slate-700 font-bold flex items-center justify-center border border-slate-200 shrink-0">
                        {(m.prenom?.[0] || '') + (m.nom?.[0] || '')}
                      </div>
                      <div className="min-w-0">
                        <p className="font-bold text-slate-900 truncate">{m.prenom} {m.nom}</p>
                        <p className="text-[10px] text-slate-500 flex items-center gap-1 truncate">
                          <MapPin className="w-3 h-3 text-emerald-600 shrink-0" />
                          {m.ville || 'Ville non renseignée'}{m.email ? ` · ${m.email}` : ''}
                        </p>
                      </div>
                    </div>
                    <button
                      onClick={() => onDesigner(zone.id, m.id)}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold text-[11px] shadow-xs transition-all active:scale-95 cursor-pointer shrink-0"
                    >
                      <UserPlus className="w-3.5 h-3.5" />
                      <span>Désigner</span>
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          <p className="text-[10px] text-slate-400 leading-relaxed bg-slate-50 p-2.5 rounded-xl border border-slate-100">
            ℹ️ La désignation fait du membre un référent de la zone dans l'annuaire. Pour lui donner les droits
            d'accès Référent dans l'application, créez ou activez son compte utilisateur (rôle Référent) dans
            « Utilisateurs &amp; Droits » — les deux notions restent distinctes.
          </p>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end px-5 py-3 border-t border-slate-200 bg-slate-50 shrink-0">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-white hover:bg-slate-100 text-slate-700 border border-slate-200 rounded-xl text-xs font-bold transition-all cursor-pointer"
          >
            Fermer
          </button>
        </div>
      </div>
    </div>
  );
};
