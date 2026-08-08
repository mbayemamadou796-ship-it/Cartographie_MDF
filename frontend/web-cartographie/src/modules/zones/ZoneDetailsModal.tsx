import React, { useState, useMemo } from 'react';
import { CustomZone, Member, UserRole } from '../../types';
import {
  X,
  Users,
  Search,
  UserPlus,
  Plus,
  MapPin,
  Phone,
  Mail,
  Building,
  Briefcase,
  Compass,
  Layers,
  ArrowRight,
  ExternalLink,
  Trash2,
  CheckCircle2,
  Globe
} from 'lucide-react';

export interface ZoneDataInfo {
  id?: string; // Custom zone ID if custom
  name: string;
  description?: string;
  color?: string;
  isCustom: boolean;
  zoneType?: 'custom' | 'region' | 'departement' | 'ville';
  defaultGeo?: {
    region?: string;
    departement?: string;
    ville?: string;
  };
}

interface ZoneDetailsModalProps {
  isOpen: boolean;
  zone: ZoneDataInfo | null;
  zoneMembers: Member[];
  allMembers?: Member[];
  userRole?: UserRole;
  onClose: () => void;
  onOpenAddMemberInZone?: (
    zoneId?: string,
    zoneName?: string,
    defaultGeo?: { region?: string; departement?: string; ville?: string }
  ) => void;
  onManageZoneMembers?: (zoneId: string) => void;
  onRemoveMemberFromZone?: (zoneId: string, memberId: string) => void;
  onSelectMemberDetails: (member: Member) => void;
  onFilterOnMap?: () => void;
}

const COLOR_THEMES: Record<string, { headerBg: string; badgeBg: string; badgeText: string; accentBorder: string }> = {
  emerald: {
    headerBg: 'from-emerald-800 via-emerald-900 to-slate-900',
    badgeBg: 'bg-emerald-400',
    badgeText: 'text-emerald-950',
    accentBorder: 'border-emerald-300'
  },
  blue: {
    headerBg: 'from-blue-800 via-blue-900 to-slate-900',
    badgeBg: 'bg-blue-400',
    badgeText: 'text-blue-950',
    accentBorder: 'border-blue-300'
  },
  indigo: {
    headerBg: 'from-indigo-800 via-indigo-900 to-slate-900',
    badgeBg: 'bg-indigo-400',
    badgeText: 'text-indigo-950',
    accentBorder: 'border-indigo-300'
  },
  purple: {
    headerBg: 'from-purple-800 via-purple-900 to-slate-900',
    badgeBg: 'bg-purple-400',
    badgeText: 'text-purple-950',
    accentBorder: 'border-purple-300'
  },
  amber: {
    headerBg: 'from-amber-800 via-amber-900 to-slate-900',
    badgeBg: 'bg-amber-400',
    badgeText: 'text-amber-950',
    accentBorder: 'border-amber-300'
  },
  rose: {
    headerBg: 'from-rose-800 via-rose-900 to-slate-900',
    badgeBg: 'bg-rose-400',
    badgeText: 'text-rose-950',
    accentBorder: 'border-rose-300'
  },
  teal: {
    headerBg: 'from-teal-800 via-teal-900 to-slate-900',
    badgeBg: 'bg-teal-400',
    badgeText: 'text-teal-950',
    accentBorder: 'border-teal-300'
  }
};

export const ZoneDetailsModal: React.FC<ZoneDetailsModalProps> = ({
  isOpen,
  zone,
  zoneMembers,
  userRole,
  onClose,
  onOpenAddMemberInZone,
  onManageZoneMembers,
  onRemoveMemberFromZone,
  onSelectMemberDetails,
  onFilterOnMap
}) => {
  const [searchQuery, setSearchQuery] = useState('');

  // Calculate Geographic Distribution for this zone unconditionally
  const zoneCitiesMap = useMemo(() => {
    const map = new Map<string, number>();
    if (!zoneMembers) return map;
    zoneMembers.forEach((m) => {
      const v = m.ville?.trim();
      if (v) {
        map.set(v, (map.get(v) || 0) + 1);
      }
    });
    return map;
  }, [zoneMembers]);

  const zoneDeptsSet = useMemo(() => {
    if (!zoneMembers) return new Set<string>();
    return new Set(zoneMembers.map((m) => m.departement?.trim()).filter(Boolean));
  }, [zoneMembers]);

  const cityList = useMemo(() => {
    return Array.from(zoneCitiesMap.entries()).sort((a, b) => b[1] - a[1]);
  }, [zoneCitiesMap]);

  // Filter members in real-time inside the modal
  const filteredMembers = useMemo(() => {
    if (!zoneMembers) return [];
    if (!searchQuery.trim()) return zoneMembers;
    const q = searchQuery.toLowerCase().trim();
    return zoneMembers.filter((m) => {
      return (
        `${m.prenom} ${m.nom}`.toLowerCase().includes(q) ||
        (m.ville && m.ville.toLowerCase().includes(q)) ||
        (m.organisation && m.organisation.toLowerCase().includes(q)) ||
        (m.fonction && m.fonction.toLowerCase().includes(q)) ||
        (m.telephone && m.telephone.includes(q)) ||
        (m.email && m.email.toLowerCase().includes(q))
      );
    });
  }, [zoneMembers, searchQuery]);

  if (!isOpen || !zone) return null;

  const colorTheme = COLOR_THEMES[zone.color || 'emerald'] || COLOR_THEMES.emerald;

  const handleAddNewMemberClick = () => {
    if (onOpenAddMemberInZone) {
      onOpenAddMemberInZone(zone.id, zone.name, zone.defaultGeo);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/70 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl max-w-4xl w-full border border-emerald-200 shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        
        {/* Header */}
        <div className={`p-6 bg-gradient-to-r ${colorTheme.headerBg} text-white flex flex-col sm:flex-row sm:items-center justify-between gap-4 shrink-0 relative`}>
          <div className="flex items-start gap-3.5">
            <span className="p-3 rounded-2xl bg-white/10 text-emerald-300 border border-white/10 shadow-xs shrink-0 mt-0.5">
              {zone.isCustom ? <Layers className="w-6 h-6" /> : <Globe className="w-6 h-6" />}
            </span>
            <div className="space-y-1">
              <div className="flex items-center flex-wrap gap-2.5">
                <h2 className="text-xl font-extrabold font-['Outfit'] text-white">
                  {zone.name}
                </h2>
                <span className={`px-3 py-0.5 rounded-full text-xs font-black ${colorTheme.badgeBg} ${colorTheme.badgeText}`}>
                  {zoneMembers.length} membre{zoneMembers.length > 1 ? 's' : ''}
                </span>
                {zone.zoneType && (
                  <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-white/15 text-emerald-200 border border-white/10 uppercase tracking-wider">
                    {zone.zoneType === 'custom' ? 'Zone MDF' : zone.zoneType}
                  </span>
                )}
              </div>
              {zone.description ? (
                <p className="text-xs text-emerald-100 font-medium max-w-xl line-clamp-2">
                  {zone.description}
                </p>
              ) : (
                <p className="text-xs text-emerald-200 font-medium">
                  Liste complète des membres enregistrés dans cette zone.
                </p>
              )}
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-full hover:bg-white/10 text-slate-300 hover:text-white transition-colors self-start sm:self-center"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Action Toolbar */}
        <div className="p-4 bg-slate-50 border-b border-slate-200 flex flex-col md:flex-row items-center justify-between gap-3 shrink-0">
          
          {/* Search bar */}
          <div className="relative w-full md:w-80">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Rechercher dans cette zone..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-white border border-emerald-200 rounded-2xl pl-10 pr-3 py-2 text-xs text-slate-800 placeholder-slate-400 focus:border-emerald-500 outline-none font-semibold shadow-2xs"
            />
          </div>

          {/* Quick Action Buttons */}
          <div className="flex items-center flex-wrap gap-2 w-full md:w-auto justify-end">
            
            {/* Primary Action: Add New Member directly in this zone (Admin only) */}
            {userRole === 'admin' && (
              <button
                onClick={handleAddNewMemberClick}
                className="inline-flex items-center justify-center gap-1.5 px-4 py-2 bg-gradient-to-r from-[#2be39d] via-[#48c92a] to-[#8de02d] hover:brightness-105 text-emerald-950 font-black text-xs rounded-xl shadow-xs transition-all active:scale-95 shrink-0"
              >
                <UserPlus className="w-4 h-4 stroke-[2.5]" />
                <span>+ Nouveau membre dans cette zone</span>
              </button>
            )}

            {/* Associate Existing Members (if custom zone) */}
            {zone.isCustom && zone.id && onManageZoneMembers && userRole === 'admin' && (
              <button
                onClick={() => onManageZoneMembers(zone.id!)}
                className="inline-flex items-center justify-center gap-1.5 px-3.5 py-2 bg-white hover:bg-emerald-50 border border-emerald-300 text-emerald-950 font-bold text-xs rounded-xl transition-all shrink-0 shadow-2xs"
              >
                <Users className="w-3.5 h-3.5 text-emerald-600" />
                <span>Associer existants (+/-)</span>
              </button>
            )}

            {/* View on Map/Filter */}
            <button
              onClick={() => {
                if (onFilterOnMap) onFilterOnMap();
                onClose();
              }}
              className="inline-flex items-center justify-center gap-1.5 px-3.5 py-2 bg-emerald-950 hover:bg-emerald-900 text-white font-bold text-xs rounded-xl transition-all shrink-0 shadow-2xs"
            >
              <span>Voir sur la carte</span>
              <ArrowRight className="w-3.5 h-3.5 text-emerald-400" />
            </button>

          </div>
        </div>

        {/* Territory Distribution Summary Banner */}
        {zoneMembers.length > 0 && (
          <div className="mx-6 mt-4 p-3.5 bg-emerald-50/80 border border-emerald-200/80 rounded-2xl space-y-2 shrink-0">
            <div className="flex items-center justify-between text-xs">
              <span className="flex items-center gap-1.5 font-extrabold text-emerald-950">
                <MapPin className="w-4 h-4 text-emerald-600" />
                <span>Répartition géographique : {cityList.length} ville{cityList.length > 1 ? 's' : ''} représentée{cityList.length > 1 ? 's' : ''}</span>
              </span>
              <span className="text-[11px] font-bold text-emerald-900 bg-white px-2.5 py-0.5 rounded-full border border-emerald-300/80 shadow-2xs">
                {zoneDeptsSet.size} département{zoneDeptsSet.size > 1 ? 's' : ''}
              </span>
            </div>

            <div className="flex flex-wrap gap-1.5 max-h-24 overflow-y-auto pt-1">
              {cityList.map(([cityName, count]) => (
                <button
                  key={cityName}
                  onClick={() => setSearchQuery(cityName)}
                  title={`Filtrer par ${cityName}`}
                  className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-xl text-[11px] font-bold transition-all border ${
                    searchQuery.toLowerCase() === cityName.toLowerCase()
                      ? 'bg-emerald-950 text-white border-emerald-950 shadow-2xs'
                      : 'bg-white hover:bg-emerald-100 text-slate-800 border-emerald-200/80'
                  }`}
                >
                  <span>{cityName}</span>
                  <span className="bg-emerald-100 text-emerald-950 font-black px-1.5 py-0.2 rounded-md text-[9px]">
                    {count}
                  </span>
                </button>
              ))}
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="text-[11px] font-bold text-emerald-700 hover:text-emerald-900 underline self-center ml-1 cursor-pointer"
                >
                  Réinitialiser le filtre
                </button>
              )}
            </div>
          </div>
        )}

        {/* Members List Container */}
        <div className="p-6 overflow-y-auto space-y-4 flex-1">
          {filteredMembers.length === 0 ? (
            <div className="bg-slate-50 border-2 border-dashed border-slate-200 rounded-3xl p-10 text-center space-y-4 my-4">
              <div className="w-14 h-14 rounded-2xl bg-emerald-100/70 text-emerald-800 border border-emerald-200 flex items-center justify-center mx-auto">
                <Users className="w-7 h-7 text-emerald-700" />
              </div>
              <div className="max-w-md mx-auto space-y-1">
                <h4 className="text-sm font-extrabold text-slate-800 font-['Outfit']">
                  {searchQuery ? 'Aucun membre ne correspond à la recherche' : 'Aucun membre trouvé dans cette zone'}
                </h4>
                <p className="text-xs text-slate-500 font-medium">
                  {searchQuery
                    ? 'Essayez de modifier votre terme de recherche.'
                    : 'Ajoutez un nouveau membre ou associez des membres existants à cette zone.'}
                </p>
              </div>

              {!searchQuery && userRole === 'admin' && (
                <button
                  onClick={handleAddNewMemberClick}
                  className="inline-flex items-center gap-2 px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-2xl shadow-sm transition-all"
                >
                  <UserPlus className="w-4 h-4" />
                  <span>Ajouter le premier membre</span>
                </button>
              )}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {filteredMembers.map((m) => (
                <div
                  key={m.id}
                  className="bg-white rounded-2xl p-4 border border-emerald-200 hover:border-emerald-400 hover:shadow-md transition-all flex flex-col justify-between space-y-3 group"
                >
                  {/* Top Info */}
                  <div className="flex items-start gap-3">
                    {/* Avatar */}
                    <div className="relative shrink-0">
                      {m.photo ? (
                        <img
                          src={m.photo}
                          alt={`${m.prenom} ${m.nom}`}
                          className="w-12 h-12 rounded-xl object-cover border border-emerald-200 shadow-2xs"
                        />
                      ) : (
                        <div className="w-12 h-12 rounded-xl bg-gradient-to-tr from-emerald-800 to-slate-800 text-emerald-300 font-extrabold text-sm flex items-center justify-center border border-emerald-700 shadow-2xs">
                          {m.prenom[0]}
                          {m.nom[0]}
                        </div>
                      )}
                    </div>

                    {/* Member Name and details */}
                    <div className="min-w-0 flex-1 space-y-0.5">
                      <div className="flex items-center justify-between gap-2">
                        <h4 className="font-extrabold text-slate-900 text-sm font-['Outfit'] truncate group-hover:text-emerald-900 transition-colors">
                          {m.prenom} {m.nom}
                        </h4>
                        {zone.isCustom && zone.id && onRemoveMemberFromZone && userRole === 'admin' && (
                          <button
                            onClick={() => onRemoveMemberFromZone(zone.id!, m.id)}
                            title="Retirer de cette zone"
                            className="p-1 text-slate-300 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </div>

                      <p className="text-xs text-emerald-900 font-bold truncate">
                        {m.fonction || 'Membre Mbok de France'}
                      </p>

                      <p className="text-[11px] text-slate-500 font-medium truncate flex items-center gap-1">
                        <Building className="w-3 h-3 text-slate-400 shrink-0" />
                        <span>{m.organisation || 'Mbok de France'}</span>
                      </p>
                    </div>
                  </div>

                  {/* Location & Contact Badges */}
                  <div className="pt-2 border-t border-slate-100 text-[11px] space-y-1.5 text-slate-600 font-medium">
                    <div className="flex items-center gap-1.5 text-slate-700 font-bold">
                      <MapPin className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                      <span className="truncate">
                        {m.ville} {m.departement ? `(${m.departement})` : ''} — {m.region || 'France'}
                      </span>
                    </div>

                    <div className="flex items-center flex-wrap gap-3 pt-0.5 text-xs">
                      {m.telephone ? (
                        <a
                          href={`tel:${m.telephone}`}
                          className="inline-flex items-center gap-1 text-emerald-800 font-bold hover:underline"
                        >
                          <Phone className="w-3 h-3 text-emerald-600" />
                          <span>{m.telephone}</span>
                        </a>
                      ) : (
                        <span className="text-[11px] text-slate-400 italic">Téléphone non renseigné</span>
                      )}

                      {m.email && (
                        <a
                          href={`mailto:${m.email}`}
                          className="inline-flex items-center gap-1 text-slate-600 hover:text-emerald-800 font-medium truncate max-w-[200px]"
                        >
                          <Mail className="w-3 h-3 text-slate-400" />
                          <span className="truncate">{m.email}</span>
                        </a>
                      )}
                    </div>
                  </div>

                  {/* Footer Card Action */}
                  <div className="pt-2 border-t border-slate-100 flex items-center justify-end">
                    <button
                      onClick={() => {
                        onSelectMemberDetails(m);
                        onClose();
                      }}
                      className="inline-flex items-center gap-1 text-xs font-bold text-emerald-800 hover:text-emerald-950 hover:underline"
                    >
                      <span>Voir la fiche complète</span>
                      <ExternalLink className="w-3.5 h-3.5" />
                    </button>
                  </div>

                </div>
              ))}
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="p-4 bg-slate-50 border-t border-slate-200 flex items-center justify-between text-xs text-slate-500 font-bold shrink-0">
          <span>
            Affichage de {filteredMembers.length} membre{filteredMembers.length > 1 ? 's' : ''} sur {zoneMembers.length}
          </span>

          <button
            onClick={onClose}
            className="px-4 py-2 bg-slate-200 hover:bg-slate-300 text-slate-800 font-bold rounded-xl transition-colors"
          >
            Fermer
          </button>
        </div>

      </div>
    </div>
  );
};
