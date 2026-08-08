import React, { useState, useMemo } from 'react';
import { CustomZone, Member } from '../../types';
import { Users, Search, X, Check, Plus, Trash2, UserPlus, Phone, Mail, MapPin } from 'lucide-react';

interface ManageZoneMembersModalProps {
  isOpen: boolean;
  zone: CustomZone | null;
  allMembers: Member[];
  onClose: () => void;
  onToggleMember: (zoneId: string, memberId: string) => void;
}

export const ManageZoneMembersModal: React.FC<ManageZoneMembersModalProps> = ({
  isOpen,
  zone,
  allMembers,
  onClose,
  onToggleMember
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [filterTab, setFilterTab] = useState<'all' | 'in_zone' | 'not_in_zone'>('all');

  const currentMemberIds = useMemo(() => new Set(zone ? zone.memberIds : []), [zone]);

  const filteredMembers = useMemo(() => {
    if (!allMembers) return [];
    return allMembers.filter((m) => {
      // Search
      const query = searchQuery.toLowerCase().trim();
      const matchesSearch =
        !query ||
        `${m.prenom} ${m.nom}`.toLowerCase().includes(query) ||
        (m.ville && m.ville.toLowerCase().includes(query)) ||
        (m.organisation && m.organisation.toLowerCase().includes(query)) ||
        (m.fonction && m.fonction.toLowerCase().includes(query));

      if (!matchesSearch) return false;

      // Filter Tab
      const isInZone = currentMemberIds.has(m.id);
      if (filterTab === 'in_zone' && !isInZone) return false;
      if (filterTab === 'not_in_zone' && isInZone) return false;

      return true;
    });
  }, [allMembers, searchQuery, filterTab, currentMemberIds]);

  if (!isOpen || !zone) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl max-w-2xl w-full border border-emerald-200 shadow-2xl overflow-hidden flex flex-col max-h-[85vh]">
        
        {/* Header */}
        <div className="p-5 bg-gradient-to-r from-emerald-800 via-emerald-900 to-slate-900 text-white flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <span className="p-2.5 rounded-2xl bg-white/10 text-emerald-300 border border-white/10">
              <Users className="w-5 h-5" />
            </span>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-bold text-base font-['Outfit']">
                  Gestion des Membres — {zone.name}
                </h3>
                <span className="px-2.5 py-0.5 rounded-full text-xs font-extrabold bg-emerald-400 text-emerald-950">
                  {zone.memberIds.length} membres
                </span>
              </div>
              <p className="text-[11px] text-emerald-200 font-medium">
                Ajoutez ou retirez des membres de cette zone en un clic
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-full hover:bg-white/10 text-slate-300 hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Toolbar: Search + Filter Tabs */}
        <div className="p-4 bg-slate-50 border-b border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-3 shrink-0">
          
          {/* Search bar */}
          <div className="relative w-full sm:w-72">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Rechercher un membre par nom, ville..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-white border border-emerald-200 rounded-xl pl-9 pr-3 py-1.5 text-xs text-slate-800 placeholder-slate-400 focus:border-emerald-500 outline-none font-medium"
            />
          </div>

          {/* Sub filter tabs */}
          <div className="flex items-center bg-slate-200/80 p-1 rounded-xl border border-slate-200 text-xs font-bold w-full sm:w-auto">
            <button
              onClick={() => setFilterTab('all')}
              className={`flex-1 sm:flex-none px-3 py-1 rounded-lg transition-all ${
                filterTab === 'all'
                  ? 'bg-white text-emerald-950 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Tous ({allMembers.length})
            </button>
            <button
              onClick={() => setFilterTab('in_zone')}
              className={`flex-1 sm:flex-none px-3 py-1 rounded-lg transition-all ${
                filterTab === 'in_zone'
                  ? 'bg-white text-emerald-950 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Dans la zone ({zone.memberIds.length})
            </button>
            <button
              onClick={() => setFilterTab('not_in_zone')}
              className={`flex-1 sm:flex-none px-3 py-1 rounded-lg transition-all ${
                filterTab === 'not_in_zone'
                  ? 'bg-white text-emerald-950 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Non assignés ({allMembers.length - zone.memberIds.length})
            </button>
          </div>

        </div>

        {/* Member List */}
        <div className="p-4 overflow-y-auto space-y-2.5 flex-1">
          {filteredMembers.length === 0 ? (
            <div className="text-center py-12 text-slate-400 text-xs space-y-2">
              <Users className="w-8 h-8 mx-auto text-slate-300" />
              <p className="font-semibold">Aucun membre ne correspond à cette recherche.</p>
            </div>
          ) : (
            filteredMembers.map((m) => {
              const isInZone = currentMemberIds.has(m.id);

              return (
                <div
                  key={m.id}
                  className={`p-3 rounded-2xl border transition-all flex items-center justify-between gap-3 ${
                    isInZone
                      ? 'bg-emerald-50/70 border-emerald-300 shadow-2xs'
                      : 'bg-white border-slate-200 hover:border-emerald-200'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-emerald-100 border border-emerald-300 flex items-center justify-center font-bold text-emerald-900 text-xs shrink-0 overflow-hidden">
                      {m.photo ? (
                        <img src={m.photo} alt={`${m.prenom} ${m.nom}`} className="w-full h-full object-cover" />
                      ) : (
                        `${m.prenom.charAt(0)}${m.nom.charAt(0)}`
                      )}
                    </div>

                    <div>
                      <div className="flex items-center gap-2">
                        <h4 className="font-bold text-slate-900 text-xs font-['Outfit']">
                          {m.prenom} {m.nom}
                        </h4>
                        {isInZone && (
                          <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-emerald-200 text-emerald-900">
                            Dans la zone
                          </span>
                        )}
                      </div>

                      <div className="flex flex-wrap items-center gap-x-3 gap-y-0.5 text-[11px] text-slate-500 font-medium mt-0.5">
                        <span className="flex items-center gap-1">
                          <MapPin className="w-3 h-3 text-emerald-600" />
                          {m.ville} ({m.region || 'France'})
                        </span>
                        {m.telephone && (
                          <span className="flex items-center gap-1">
                            <Phone className="w-3 h-3 text-emerald-600" />
                            {m.telephone}
                          </span>
                        )}
                        {m.organisation && (
                          <span className="text-slate-400">
                            • {m.organisation}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Toggle Button */}
                  <button
                    onClick={() => onToggleMember(zone.id, m.id)}
                    className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl font-bold text-xs transition-all shrink-0 active:scale-95 ${
                      isInZone
                        ? 'bg-rose-100 hover:bg-rose-200 text-rose-800'
                        : 'bg-emerald-600 hover:bg-emerald-700 text-white shadow-2xs'
                    }`}
                  >
                    {isInZone ? (
                      <>
                        <Trash2 className="w-3.5 h-3.5" />
                        <span>Retirer</span>
                      </>
                    ) : (
                      <>
                        <UserPlus className="w-3.5 h-3.5" />
                        <span>Ajouter</span>
                      </>
                    )}
                  </button>
                </div>
              );
            })
          )}
        </div>

        {/* Modal Footer */}
        <div className="p-4 bg-slate-50 border-t border-slate-200 flex items-center justify-between shrink-0">
          <p className="text-xs text-slate-500 font-medium">
            {zone.memberIds.length} membres associés à la zone <strong className="text-slate-800">{zone.name}</strong>
          </p>

          <button
            onClick={onClose}
            className="px-5 py-2 bg-emerald-900 hover:bg-emerald-950 text-white rounded-xl font-bold text-xs transition-colors shadow-2xs"
          >
            Fermer
          </button>
        </div>

      </div>
    </div>
  );
};
