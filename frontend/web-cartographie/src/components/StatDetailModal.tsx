import React, { useState, useMemo } from 'react';
import { Member, CustomZone } from '../types';
import {
  X,
  Search,
  Compass,
  Building2,
  Globe,
  Users,
  MapPin,
  UserCheck,
  ChevronRight,
  Eye,
  ArrowRight,
  Phone,
  Mail,
  Building,
  Briefcase
} from 'lucide-react';

export type StatModalType = 'villes' | 'departements' | 'zones' | 'membres' | null;

export interface StatInlineViewProps {
  type: 'villes' | 'departements' | 'zones' | 'membres';
  members: Member[];
  customZones?: CustomZone[];
  onSelectMemberDetails: (member: Member) => void;
  onSelectZoneDetails?: (zone: CustomZone) => void;
  onFilterOnMap?: (geo: { region?: string; departement?: string; ville?: string }) => void;
}

export const StatInlineView: React.FC<StatInlineViewProps> = ({
  type,
  members,
  customZones = [],
  onSelectMemberDetails,
  onSelectZoneDetails,
  onFilterOnMap
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedItemName, setSelectedItemName] = useState<string | null>(null);

  // 1. Group by Cities
  const citiesData = useMemo(() => {
    const map = new Map<string, { dept: string; region: string; members: Member[] }>();
    members.forEach((m) => {
      const city = m.ville?.trim() || 'Non renseignée';
      if (!map.has(city)) {
        map.set(city, {
          dept: m.departement?.trim() || 'Non renseigné',
          region: m.region?.trim() || 'Non renseignée',
          members: []
        });
      }
      map.get(city)!.members.push(m);
    });

    return Array.from(map.entries())
      .map(([name, data]) => ({
        name,
        dept: data.dept,
        region: data.region,
        members: data.members,
        count: data.members.length
      }))
      .sort((a, b) => b.count - a.count);
  }, [members]);

  // 2. Group by Departments
  const deptsData = useMemo(() => {
    const map = new Map<string, { region: string; cities: Set<string>; members: Member[] }>();
    members.forEach((m) => {
      const dept = m.departement?.trim() || 'Non renseigné';
      if (!map.has(dept)) {
        map.set(dept, {
          region: m.region?.trim() || 'Non renseignée',
          cities: new Set(),
          members: []
        });
      }
      const entry = map.get(dept)!;
      if (m.ville?.trim()) entry.cities.add(m.ville.trim());
      entry.members.push(m);
    });

    return Array.from(map.entries())
      .map(([name, data]) => ({
        name,
        region: data.region,
        cityCount: data.cities.size,
        members: data.members,
        count: data.members.length
      }))
      .sort((a, b) => b.count - a.count);
  }, [members]);

  // Filtered lists based on search input
  const filteredCities = citiesData.filter(
    (c) =>
      c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.dept.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.region.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const filteredDepts = deptsData.filter(
    (d) =>
      d.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      d.region.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const filteredZones = customZones.filter(
    (z) =>
      z.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      z.description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      z.referentName?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const filteredMembers = members.filter((m) => {
    const q = searchQuery.toLowerCase().trim();
    if (!q) return true;
    return (
      `${m.prenom} ${m.nom}`.toLowerCase().includes(q) ||
      m.ville?.toLowerCase().includes(q) ||
      m.departement?.toLowerCase().includes(q) ||
      m.region?.toLowerCase().includes(q) ||
      m.organisation?.toLowerCase().includes(q) ||
      m.fonction?.toLowerCase().includes(q)
    );
  });

  const getHeaderInfo = () => {
    switch (type) {
      case 'villes':
        return {
          title: 'Villes & Communes Représentées',
          subtitle: `${citiesData.length} villes représentées par au moins un membre dans le réseau`,
          icon: <Compass className="w-5 h-5 text-emerald-600" />,
          count: citiesData.length
        };
      case 'departements':
        return {
          title: 'Départements Couverts',
          subtitle: `${deptsData.length} départements français couverts par les membres du réseau`,
          icon: <Building2 className="w-5 h-5 text-emerald-600" />,
          count: deptsData.length
        };
      case 'zones':
        return {
          title: 'Zones Régionales & Groupes Sur-Mesure',
          subtitle: `${customZones.length} zones configurées pour la répartition territoriale`,
          icon: <Globe className="w-5 h-5 text-emerald-600" />,
          count: customZones.length
        };
      case 'membres':
        return {
          title: 'Membres Associés au Périmètre',
          subtitle: `${members.length} membres enregistrés dans cette sélection`,
          icon: <Users className="w-5 h-5 text-emerald-600" />,
          count: members.length
        };
      default:
        return { title: '', subtitle: '', icon: null, count: 0 };
    }
  };

  const header = getHeaderInfo();

  return (
    <div className="bg-white rounded-3xl p-6 border border-emerald-200/80 shadow-xs space-y-5 animate-in fade-in duration-200">
      {/* Title & Search Bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-emerald-100">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-emerald-100/80 rounded-2xl text-emerald-800 border border-emerald-200">
            {header.icon}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-lg font-extrabold font-['Outfit'] text-slate-900">{header.title}</h3>
              <span className="px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 font-extrabold text-xs border border-emerald-200">
                {header.count}
              </span>
            </div>
            <p className="text-xs text-slate-500 font-medium mt-0.5">{header.subtitle}</p>
          </div>
        </div>

        {/* Search Field */}
        <div className="relative w-full md:w-80">
          <Search className="w-4 h-4 text-emerald-600 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder={`Filtrer les ${type}...`}
            className="w-full pl-10 pr-8 py-2 bg-slate-50 border border-emerald-200 rounded-2xl text-xs font-semibold focus:outline-hidden focus:ring-2 focus:ring-emerald-500/30 focus:bg-white shadow-2xs transition-all"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-bold text-slate-400 hover:text-slate-600"
            >
              ×
            </button>
          )}
        </div>
      </div>

      {/* Content Grid */}
      <div className="space-y-4">
        {/* 1. VILLES VIEW */}
        {type === 'villes' && (
          filteredCities.length === 0 ? (
            <div className="text-center py-12 space-y-2 bg-slate-50 rounded-2xl border border-dashed border-slate-200">
              <Compass className="w-10 h-10 text-emerald-300 mx-auto" />
              <p className="text-sm font-bold text-slate-700">Aucune ville trouvée</p>
              <p className="text-xs text-slate-400">Essayez un autre mot-clé de recherche.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredCities.map((c) => {
                const isExpanded = selectedItemName === c.name;
                return (
                  <div
                    key={c.name}
                    className="bg-white rounded-2xl p-4 border border-emerald-200/80 hover:border-emerald-400 shadow-2xs hover:shadow-md transition-all space-y-3"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex items-center gap-2.5">
                        <span className="p-2 bg-emerald-100 text-emerald-800 rounded-xl font-bold shrink-0">
                          <MapPin className="w-4 h-4" />
                        </span>
                        <div>
                          <h4 className="font-extrabold text-slate-900 text-sm font-['Outfit']">{c.name}</h4>
                          <div className="flex items-center gap-1.5 text-[11px] font-semibold text-slate-500 mt-0.5">
                            <span>{c.dept}</span>
                            <span>•</span>
                            <span className="text-emerald-700 font-bold">{c.region}</span>
                          </div>
                        </div>
                      </div>

                      <span className="px-2.5 py-1 bg-emerald-100 text-emerald-900 rounded-full text-xs font-black shrink-0 border border-emerald-200">
                        {c.count} membre{c.count > 1 ? 's' : ''}
                      </span>
                    </div>

                    {/* Members List inside City Card */}
                    <div className="pt-2 border-t border-slate-100 space-y-1.5">
                      <div className="flex items-center justify-between text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                        <span>Membres à {c.name} :</span>
                        <button
                          onClick={() => setSelectedItemName(isExpanded ? null : c.name)}
                          className="text-emerald-600 hover:text-emerald-800 font-bold lowercase hover:underline"
                        >
                          {isExpanded ? 'Réduire' : `Voir les ${c.count}`}
                        </button>
                      </div>

                      <div className="flex flex-wrap gap-1.5">
                        {(isExpanded ? c.members : c.members.slice(0, 3)).map((m) => (
                          <button
                            key={m.id}
                            onClick={() => onSelectMemberDetails(m)}
                            className="inline-flex items-center gap-1 text-[11px] bg-slate-50 hover:bg-emerald-100 text-slate-800 hover:text-emerald-950 px-2.5 py-1 rounded-xl border border-slate-200 font-bold transition-all cursor-pointer"
                          >
                            <span>{m.prenom} {m.nom}</span>
                            <Eye className="w-3 h-3 text-emerald-600 opacity-60" />
                          </button>
                        ))}
                        {!isExpanded && c.members.length > 3 && (
                          <button
                            onClick={() => setSelectedItemName(c.name)}
                            className="text-[11px] text-emerald-800 font-bold bg-emerald-100 hover:bg-emerald-200 px-2 py-0.5 rounded-lg transition-colors cursor-pointer"
                          >
                            +{c.members.length - 3} autres
                          </button>
                        )}
                      </div>
                    </div>

                    {/* Filter on map button */}
                    {onFilterOnMap && (
                      <button
                        onClick={() => onFilterOnMap({ ville: c.name, departement: c.dept, region: c.region })}
                        className="w-full py-1.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-900 font-bold text-xs rounded-xl flex items-center justify-center gap-1.5 transition-colors border border-emerald-200/80 cursor-pointer"
                      >
                        <Compass className="w-3.5 h-3.5 text-emerald-700" />
                        <span>Afficher {c.name} sur la carte</span>
                      </button>
                    )}
                  </div>
                );
              })}
            </div>
          )
        )}

        {/* 2. DEPARTEMENTS VIEW */}
        {type === 'departements' && (
          filteredDepts.length === 0 ? (
            <div className="text-center py-12 space-y-2 bg-slate-50 rounded-2xl border border-dashed border-slate-200">
              <Building2 className="w-10 h-10 text-emerald-300 mx-auto" />
              <p className="text-sm font-bold text-slate-700">Aucun département trouvé</p>
              <p className="text-xs text-slate-400">Essayez un autre mot-clé de recherche.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredDepts.map((d) => {
                const isExpanded = selectedItemName === d.name;
                return (
                  <div
                    key={d.name}
                    className="bg-white rounded-2xl p-4 border border-emerald-200/80 hover:border-emerald-400 shadow-2xs hover:shadow-md transition-all space-y-3"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex items-center gap-2.5">
                        <span className="p-2 bg-emerald-100 text-emerald-800 rounded-xl font-bold shrink-0">
                          <Building2 className="w-4 h-4" />
                        </span>
                        <div>
                          <h4 className="font-extrabold text-slate-900 text-sm font-['Outfit']">{d.name}</h4>
                          <p className="text-[11px] font-semibold text-emerald-700 mt-0.5">Région : {d.region}</p>
                        </div>
                      </div>

                      <div className="text-right">
                        <span className="px-2.5 py-1 bg-emerald-100 text-emerald-900 rounded-full text-xs font-black inline-block border border-emerald-200">
                          {d.count} membre{d.count > 1 ? 's' : ''}
                        </span>
                        <p className="text-[10px] text-slate-500 font-medium mt-1">{d.cityCount} ville{d.cityCount > 1 ? 's' : ''}</p>
                      </div>
                    </div>

                    {/* Members inside Dept Card */}
                    <div className="pt-2 border-t border-slate-100 space-y-1.5">
                      <div className="flex items-center justify-between text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                        <span>Membres du {d.name} :</span>
                        <button
                          onClick={() => setSelectedItemName(isExpanded ? null : d.name)}
                          className="text-emerald-600 hover:text-emerald-800 font-bold lowercase hover:underline"
                        >
                          {isExpanded ? 'Réduire' : `Voir les ${d.count}`}
                        </button>
                      </div>

                      <div className="flex flex-wrap gap-1.5">
                        {(isExpanded ? d.members : d.members.slice(0, 4)).map((m) => (
                          <button
                            key={m.id}
                            onClick={() => onSelectMemberDetails(m)}
                            className="inline-flex items-center gap-1 text-[11px] bg-slate-50 hover:bg-emerald-100 text-slate-800 hover:text-emerald-950 px-2.5 py-1 rounded-xl border border-slate-200 font-bold transition-all cursor-pointer"
                          >
                            <span>{m.prenom} {m.nom}</span>
                            <span className="text-[9px] text-slate-400">({m.ville})</span>
                          </button>
                        ))}
                        {!isExpanded && d.members.length > 4 && (
                          <button
                            onClick={() => setSelectedItemName(d.name)}
                            className="text-[11px] text-emerald-800 font-bold bg-emerald-100 hover:bg-emerald-200 px-2 py-0.5 rounded-lg transition-colors cursor-pointer"
                          >
                            +{d.members.length - 4} autres
                          </button>
                        )}
                      </div>
                    </div>

                    {/* Filter on map button */}
                    {onFilterOnMap && (
                      <button
                        onClick={() => onFilterOnMap({ departement: d.name, region: d.region })}
                        className="w-full py-1.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-900 font-bold text-xs rounded-xl flex items-center justify-center gap-1.5 transition-colors border border-emerald-200/80 cursor-pointer"
                      >
                        <Compass className="w-3.5 h-3.5 text-emerald-700" />
                        <span>Afficher le {d.name} sur la carte</span>
                      </button>
                    )}
                  </div>
                );
              })}
            </div>
          )
        )}

        {/* 3. ZONES VIEW */}
        {type === 'zones' && (
          filteredZones.length === 0 ? (
            <div className="text-center py-12 space-y-2 bg-slate-50 rounded-2xl border border-dashed border-slate-200">
              <Globe className="w-10 h-10 text-emerald-300 mx-auto" />
              <p className="text-sm font-bold text-slate-700">Aucune zone trouvée</p>
              <p className="text-xs text-slate-400">Essayez un autre mot-clé de recherche.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredZones.map((z) => {
                const zoneMembers = members.filter((m) => z.memberIds.includes(m.id));
                return (
                  <div
                    key={z.id}
                    className="bg-white rounded-2xl p-4 border border-emerald-200/80 hover:border-emerald-400 shadow-2xs hover:shadow-md transition-all space-y-3"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex items-center gap-2.5">
                        <span className="p-2 bg-emerald-100 text-emerald-800 rounded-xl font-bold shrink-0">
                          <Globe className="w-4 h-4" />
                        </span>
                        <div>
                          <h4 className="font-extrabold text-slate-900 text-sm font-['Outfit']">{z.name}</h4>
                          <p className="text-[11px] font-semibold text-slate-600 mt-0.5">
                            Référent : <strong className="text-slate-900">{z.referentName || 'Non assigné'}</strong>
                          </p>
                        </div>
                      </div>

                      <span className="px-2.5 py-1 bg-emerald-100 text-emerald-900 rounded-full text-xs font-black shrink-0 border border-emerald-200">
                        {zoneMembers.length} membre{zoneMembers.length > 1 ? 's' : ''}
                      </span>
                    </div>

                    {z.description && (
                      <p className="text-xs text-slate-500 font-medium line-clamp-2 pl-1">
                        {z.description}
                      </p>
                    )}

                    <div className="pt-2 border-t border-slate-100 flex items-center justify-between">
                      <div className="flex flex-wrap gap-1">
                        {zoneMembers.slice(0, 3).map((m) => (
                          <span key={m.id} className="text-[10px] bg-slate-100 text-slate-800 px-2 py-0.5 rounded-md font-bold">
                            {m.prenom} {m.nom}
                          </span>
                        ))}
                        {zoneMembers.length > 3 && (
                          <span className="text-[10px] text-slate-500 font-bold self-center">
                            +{zoneMembers.length - 3}
                          </span>
                        )}
                      </div>

                      {onSelectZoneDetails && (
                        <button
                          onClick={() => onSelectZoneDetails(z)}
                          className="inline-flex items-center gap-1 text-xs font-bold text-emerald-700 hover:text-emerald-900 cursor-pointer"
                        >
                          <span>Détails zone</span>
                          <ArrowRight className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )
        )}

        {/* 4. MEMBRES VIEW */}
        {type === 'membres' && (
          filteredMembers.length === 0 ? (
            <div className="text-center py-12 space-y-2 bg-slate-50 rounded-2xl border border-dashed border-slate-200">
              <Users className="w-10 h-10 text-emerald-300 mx-auto" />
              <p className="text-sm font-bold text-slate-700">Aucun membre trouvé</p>
              <p className="text-xs text-slate-400">Essayez un autre mot-clé de recherche.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
              {filteredMembers.map((m) => (
                <div
                  key={m.id}
                  onClick={() => onSelectMemberDetails(m)}
                  className="bg-white rounded-2xl p-3.5 border border-emerald-200/80 hover:border-emerald-400 hover:shadow-md transition-all flex items-center justify-between gap-3 cursor-pointer group"
                >
                  <div className="flex items-center gap-3">
                    {m.photo ? (
                      <img
                        src={m.photo}
                        alt={`${m.prenom} ${m.nom}`}
                        className="w-10 h-10 rounded-full object-cover border border-emerald-300 shrink-0"
                        referrerPolicy="no-referrer"
                      />
                    ) : (
                      <div className="w-10 h-10 rounded-full bg-emerald-100 text-emerald-800 font-bold text-xs flex items-center justify-center shrink-0 border border-emerald-200">
                        {m.prenom?.[0]}{m.nom?.[0]}
                      </div>
                    )}
                    <div>
                      <h4 className="font-extrabold text-slate-900 text-sm group-hover:text-emerald-900 transition-colors">
                        {m.prenom} {m.nom}
                      </h4>
                      <div className="flex items-center gap-2 text-[11px] font-semibold text-slate-500 mt-0.5">
                        <span className="flex items-center gap-1 text-slate-600">
                          <MapPin className="w-3 h-3 text-emerald-600" />
                          <span>{m.ville || 'Inconnue'}</span>
                        </span>
                        <span>•</span>
                        <span className="text-emerald-700 font-bold">{m.region}</span>
                      </div>
                    </div>
                  </div>

                  <span className="p-2 bg-emerald-50 text-emerald-700 group-hover:bg-emerald-600 group-hover:text-white rounded-xl transition-colors shrink-0">
                    <ChevronRight className="w-4 h-4" />
                  </span>
                </div>
              ))}
            </div>
          )
        )}
      </div>
    </div>
  );
};

interface StatDetailModalProps {
  isOpen: boolean;
  type: StatModalType;
  members: Member[];
  customZones?: CustomZone[];
  onClose: () => void;
  onSelectMemberDetails: (member: Member) => void;
  onSelectZoneDetails?: (zone: CustomZone) => void;
  onFilterOnMap?: (geo: { region?: string; departement?: string; ville?: string }) => void;
}

export const StatDetailModal: React.FC<StatDetailModalProps> = ({
  isOpen,
  type,
  members,
  customZones = [],
  onClose,
  onSelectMemberDetails,
  onSelectZoneDetails,
  onFilterOnMap
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedItemName, setSelectedItemName] = useState<string | null>(null);

  // 1. Group by Cities
  const citiesData = useMemo(() => {
    if (!isOpen || !type) return [];
    const map = new Map<string, { dept: string; region: string; members: Member[] }>();
    members.forEach((m) => {
      const city = m.ville?.trim() || 'Non renseignée';
      if (!map.has(city)) {
        map.set(city, {
          dept: m.departement?.trim() || 'Non renseigné',
          region: m.region?.trim() || 'Non renseignée',
          members: []
        });
      }
      map.get(city)!.members.push(m);
    });

    return Array.from(map.entries())
      .map(([name, data]) => ({
        name,
        dept: data.dept,
        region: data.region,
        members: data.members,
        count: data.members.length
      }))
      .sort((a, b) => b.count - a.count);
  }, [members, isOpen, type]);

  // 2. Group by Departments
  const deptsData = useMemo(() => {
    if (!isOpen || !type) return [];
    const map = new Map<string, { region: string; cities: Set<string>; members: Member[] }>();
    members.forEach((m) => {
      const dept = m.departement?.trim() || 'Non renseigné';
      if (!map.has(dept)) {
        map.set(dept, {
          region: m.region?.trim() || 'Non renseignée',
          cities: new Set(),
          members: []
        });
      }
      const entry = map.get(dept)!;
      if (m.ville?.trim()) entry.cities.add(m.ville.trim());
      entry.members.push(m);
    });

    return Array.from(map.entries())
      .map(([name, data]) => ({
        name,
        region: data.region,
        cityCount: data.cities.size,
        members: data.members,
        count: data.members.length
      }))
      .sort((a, b) => b.count - a.count);
  }, [members, isOpen, type]);

  // Early return after hooks execution
  if (!isOpen || !type) return null;

  // Filtered lists based on search input
  const filteredCities = citiesData.filter(
    (c) =>
      c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.dept.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.region.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const filteredDepts = deptsData.filter(
    (d) =>
      d.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      d.region.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const filteredZones = customZones.filter(
    (z) =>
      z.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      z.description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      z.referentName?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const filteredMembers = members.filter((m) => {
    const q = searchQuery.toLowerCase().trim();
    if (!q) return true;
    return (
      `${m.prenom} ${m.nom}`.toLowerCase().includes(q) ||
      m.ville?.toLowerCase().includes(q) ||
      m.departement?.toLowerCase().includes(q) ||
      m.region?.toLowerCase().includes(q) ||
      m.organisation?.toLowerCase().includes(q) ||
      m.fonction?.toLowerCase().includes(q)
    );
  });

  const getHeaderInfo = () => {
    switch (type) {
      case 'villes':
        return {
          title: 'Villes & Communes Représentées',
          subtitle: `${citiesData.length} villes représentées par au moins un membre dans le réseau`,
          icon: <Compass className="w-6 h-6 text-emerald-400" />,
          count: citiesData.length
        };
      case 'departements':
        return {
          title: 'Départements Couverts',
          subtitle: `${deptsData.length} départements français couverts par les membres du réseau`,
          icon: <Building2 className="w-6 h-6 text-emerald-400" />,
          count: deptsData.length
        };
      case 'zones':
        return {
          title: 'Zones Régionales & Groupes Sur-Mesure',
          subtitle: `${customZones.length} zones configurées pour la répartition territoriale`,
          icon: <Globe className="w-6 h-6 text-emerald-400" />,
          count: customZones.length
        };
      case 'membres':
        return {
          title: 'Membres Associés au Périmètre',
          subtitle: `${members.length} membres enregistrés dans cette sélection`,
          icon: <Users className="w-6 h-6 text-emerald-400" />,
          count: members.length
        };
      default:
        return { title: '', subtitle: '', icon: null, count: 0 };
    }
  };

  const header = getHeaderInfo();

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white w-full max-w-4xl max-h-[90vh] rounded-3xl shadow-2xl border border-emerald-100 flex flex-col overflow-hidden">
        
        {/* Modal Header */}
        <div className="bg-gradient-to-r from-emerald-900 via-emerald-950 to-slate-900 p-6 text-white flex items-center justify-between relative shrink-0">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-white/10 rounded-2xl border border-emerald-500/30">
              {header.icon}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-xl font-black font-['Outfit']">{header.title}</h3>
                <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/30 text-emerald-300 font-extrabold text-xs border border-emerald-400/30">
                  {header.count}
                </span>
              </div>
              <p className="text-xs text-emerald-200/80 font-medium mt-0.5">{header.subtitle}</p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-2xl bg-white/10 hover:bg-white/20 text-white/80 hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Search Bar & Actions */}
        <div className="p-4 bg-emerald-50/50 border-b border-emerald-100 flex items-center gap-3 shrink-0">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-emerald-600 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={`Rechercher un${type === 'villes' ? 'e ville' : type === 'departements' ? ' département' : type === 'zones' ? 'e zone' : ' membre'}...`}
              className="w-full pl-10 pr-4 py-2 bg-white border border-emerald-200 rounded-2xl text-xs font-semibold focus:outline-hidden focus:ring-2 focus:ring-emerald-500/30 shadow-2xs"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-bold text-slate-400 hover:text-slate-600"
              >
                Effacer
              </button>
            )}
          </div>
        </div>

        {/* Modal Body / Content List */}
        <div className="p-6 overflow-y-auto space-y-4 flex-1">
          
          {/* 1. VILLES VIEW */}
          {type === 'villes' && (
            filteredCities.length === 0 ? (
              <div className="text-center py-12 space-y-2">
                <Compass className="w-10 h-10 text-emerald-300 mx-auto" />
                <p className="text-sm font-bold text-slate-700">Aucune ville trouvée</p>
                <p className="text-xs text-slate-400">Essayez une autre recherche.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {filteredCities.map((c) => {
                  const isExpanded = selectedItemName === c.name;
                  return (
                    <div
                      key={c.name}
                      className="bg-white rounded-2xl p-4 border border-emerald-200/80 hover:border-emerald-400 shadow-2xs hover:shadow-md transition-all space-y-3"
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex items-center gap-2.5">
                          <span className="p-2 bg-emerald-100 text-emerald-800 rounded-xl font-bold">
                            <MapPin className="w-4 h-4" />
                          </span>
                          <div>
                            <h4 className="font-extrabold text-slate-900 text-sm font-['Outfit']">{c.name}</h4>
                            <div className="flex items-center gap-1.5 text-[11px] font-semibold text-slate-500 mt-0.5">
                              <span>{c.dept}</span>
                              <span>•</span>
                              <span className="text-emerald-700 font-bold">{c.region}</span>
                            </div>
                          </div>
                        </div>

                        <span className="px-2.5 py-1 bg-emerald-100 text-emerald-900 rounded-full text-xs font-black shrink-0 border border-emerald-200">
                          {c.count} membre{c.count > 1 ? 's' : ''}
                        </span>
                      </div>

                      {/* Members List inside City Card */}
                      <div className="pt-2 border-t border-slate-100 space-y-1.5">
                        <div className="flex items-center justify-between text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                          <span>Membres à {c.name} :</span>
                          <button
                            onClick={() => setSelectedItemName(isExpanded ? null : c.name)}
                            className="text-emerald-600 hover:text-emerald-800 font-bold lowercase hover:underline"
                          >
                            {isExpanded ? 'Réduire' : `Voir les ${c.count}`}
                          </button>
                        </div>

                        <div className="flex flex-wrap gap-1.5">
                          {(isExpanded ? c.members : c.members.slice(0, 3)).map((m) => (
                            <button
                              key={m.id}
                              onClick={() => {
                                onClose();
                                onSelectMemberDetails(m);
                              }}
                              className="inline-flex items-center gap-1 text-[11px] bg-slate-50 hover:bg-emerald-100 text-slate-800 hover:text-emerald-950 px-2.5 py-1 rounded-xl border border-slate-200 font-bold transition-all"
                            >
                              <span>{m.prenom} {m.nom}</span>
                              <Eye className="w-3 h-3 text-emerald-600 opacity-60" />
                            </button>
                          ))}
                          {!isExpanded && c.members.length > 3 && (
                            <button
                              onClick={() => setSelectedItemName(c.name)}
                              className="text-[11px] text-emerald-800 font-bold bg-emerald-100 hover:bg-emerald-200 px-2 py-0.5 rounded-lg transition-colors"
                            >
                              +{c.members.length - 3} autres
                            </button>
                          )}
                        </div>
                      </div>

                      {/* Filter on map button */}
                      {onFilterOnMap && (
                        <button
                          onClick={() => {
                            onClose();
                            onFilterOnMap({ ville: c.name, departement: c.dept, region: c.region });
                          }}
                          className="w-full py-1.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-900 font-bold text-xs rounded-xl flex items-center justify-center gap-1.5 transition-colors border border-emerald-200/80"
                        >
                          <Compass className="w-3.5 h-3.5 text-emerald-700" />
                          <span>Afficher {c.name} sur la carte</span>
                        </button>
                      )}
                    </div>
                  );
                })}
              </div>
            )
          )}

          {/* 2. DEPARTEMENTS VIEW */}
          {type === 'departements' && (
            filteredDepts.length === 0 ? (
              <div className="text-center py-12 space-y-2">
                <Building2 className="w-10 h-10 text-emerald-300 mx-auto" />
                <p className="text-sm font-bold text-slate-700">Aucun département trouvé</p>
                <p className="text-xs text-slate-400">Essayez une autre recherche.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {filteredDepts.map((d) => {
                  const isExpanded = selectedItemName === d.name;
                  return (
                    <div
                      key={d.name}
                      className="bg-white rounded-2xl p-4 border border-emerald-200/80 hover:border-emerald-400 shadow-2xs hover:shadow-md transition-all space-y-3"
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex items-center gap-2.5">
                          <span className="p-2 bg-emerald-100 text-emerald-800 rounded-xl font-bold">
                            <Building2 className="w-4 h-4" />
                          </span>
                          <div>
                            <h4 className="font-extrabold text-slate-900 text-sm font-['Outfit']">{d.name}</h4>
                            <p className="text-[11px] font-semibold text-emerald-700 mt-0.5">Région : {d.region}</p>
                          </div>
                        </div>

                        <div className="text-right">
                          <span className="px-2.5 py-1 bg-emerald-100 text-emerald-900 rounded-full text-xs font-black inline-block border border-emerald-200">
                            {d.count} membre{d.count > 1 ? 's' : ''}
                          </span>
                          <p className="text-[10px] text-slate-500 font-medium mt-1">{d.cityCount} ville{d.cityCount > 1 ? 's' : ''}</p>
                        </div>
                      </div>

                      {/* Members inside Dept Card */}
                      <div className="pt-2 border-t border-slate-100 space-y-1.5">
                        <div className="flex items-center justify-between text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                          <span>Membres du {d.name} :</span>
                          <button
                            onClick={() => setSelectedItemName(isExpanded ? null : d.name)}
                            className="text-emerald-600 hover:text-emerald-800 font-bold lowercase hover:underline"
                          >
                            {isExpanded ? 'Réduire' : `Voir les ${d.count}`}
                          </button>
                        </div>

                        <div className="flex flex-wrap gap-1.5">
                          {(isExpanded ? d.members : d.members.slice(0, 4)).map((m) => (
                            <button
                              key={m.id}
                              onClick={() => {
                                onClose();
                                onSelectMemberDetails(m);
                              }}
                              className="inline-flex items-center gap-1 text-[11px] bg-slate-50 hover:bg-emerald-100 text-slate-800 hover:text-emerald-950 px-2.5 py-1 rounded-xl border border-slate-200 font-bold transition-all"
                            >
                              <span>{m.prenom} {m.nom}</span>
                              <span className="text-[9px] text-slate-400">({m.ville})</span>
                            </button>
                          ))}
                          {!isExpanded && d.members.length > 4 && (
                            <button
                              onClick={() => setSelectedItemName(d.name)}
                              className="text-[11px] text-emerald-800 font-bold bg-emerald-100 hover:bg-emerald-200 px-2 py-0.5 rounded-lg transition-colors"
                            >
                              +{d.members.length - 4} autres
                            </button>
                          )}
                        </div>
                      </div>

                      {/* Filter on map button */}
                      {onFilterOnMap && (
                        <button
                          onClick={() => {
                            onClose();
                            onFilterOnMap({ departement: d.name, region: d.region });
                          }}
                          className="w-full py-1.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-900 font-bold text-xs rounded-xl flex items-center justify-center gap-1.5 transition-colors border border-emerald-200/80"
                        >
                          <Compass className="w-3.5 h-3.5 text-emerald-700" />
                          <span>Afficher le {d.name} sur la carte</span>
                        </button>
                      )}
                    </div>
                  );
                })}
              </div>
            )
          )}

          {/* 3. ZONES VIEW */}
          {type === 'zones' && (
            filteredZones.length === 0 ? (
              <div className="text-center py-12 space-y-2">
                <Globe className="w-10 h-10 text-emerald-300 mx-auto" />
                <p className="text-sm font-bold text-slate-700">Aucune zone trouvée</p>
                <p className="text-xs text-slate-400">Essayez une autre recherche.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {filteredZones.map((z) => {
                  const zoneMembers = members.filter((m) => z.memberIds.includes(m.id));
                  return (
                    <div
                      key={z.id}
                      className="bg-white rounded-2xl p-4 border border-emerald-200/80 hover:border-emerald-400 shadow-2xs hover:shadow-md transition-all space-y-3"
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex items-center gap-2.5">
                          <span className="p-2 bg-emerald-100 text-emerald-800 rounded-xl font-bold">
                            <Globe className="w-4 h-4" />
                          </span>
                          <div>
                            <h4 className="font-extrabold text-slate-900 text-sm font-['Outfit']">{z.name}</h4>
                            <p className="text-[11px] font-semibold text-slate-600 mt-0.5">
                              Référent : <strong className="text-slate-900">{z.referentName || 'Non assigné'}</strong>
                            </p>
                          </div>
                        </div>

                        <span className="px-2.5 py-1 bg-emerald-100 text-emerald-900 rounded-full text-xs font-black shrink-0 border border-emerald-200">
                          {zoneMembers.length} membre{zoneMembers.length > 1 ? 's' : ''}
                        </span>
                      </div>

                      {z.description && (
                        <p className="text-xs text-slate-500 font-medium line-clamp-2 pl-1">
                          {z.description}
                        </p>
                      )}

                      <div className="pt-2 border-t border-slate-100 flex items-center justify-between">
                        <div className="flex flex-wrap gap-1">
                          {zoneMembers.slice(0, 3).map((m) => (
                            <span key={m.id} className="text-[10px] bg-slate-100 text-slate-800 px-2 py-0.5 rounded-md font-bold">
                              {m.prenom} {m.nom}
                            </span>
                          ))}
                          {zoneMembers.length > 3 && (
                            <span className="text-[10px] text-slate-500 font-bold self-center">
                              +{zoneMembers.length - 3}
                            </span>
                          )}
                        </div>

                        {onSelectZoneDetails && (
                          <button
                            onClick={() => {
                              onClose();
                              onSelectZoneDetails(z);
                            }}
                            className="inline-flex items-center gap-1 text-xs font-bold text-emerald-700 hover:text-emerald-900"
                          >
                            <span>Détails zone</span>
                            <ArrowRight className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )
          )}

          {/* 4. MEMBRES VIEW */}
          {type === 'membres' && (
            filteredMembers.length === 0 ? (
              <div className="text-center py-12 space-y-2">
                <Users className="w-10 h-10 text-emerald-300 mx-auto" />
                <p className="text-sm font-bold text-slate-700">Aucun membre trouvé</p>
                <p className="text-xs text-slate-400">Essayez une autre recherche.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {filteredMembers.map((m) => (
                  <div
                    key={m.id}
                    onClick={() => {
                      onClose();
                      onSelectMemberDetails(m);
                    }}
                    className="bg-white rounded-2xl p-3.5 border border-emerald-200/80 hover:border-emerald-400 hover:shadow-md transition-all flex items-center justify-between gap-3 cursor-pointer group"
                  >
                    <div className="flex items-center gap-3">
                      {m.photo ? (
                        <img
                          src={m.photo}
                          alt={`${m.prenom} ${m.nom}`}
                          className="w-10 h-10 rounded-full object-cover border border-emerald-300 shrink-0"
                          referrerPolicy="no-referrer"
                        />
                      ) : (
                        <div className="w-10 h-10 rounded-full bg-emerald-100 text-emerald-800 font-bold text-xs flex items-center justify-center shrink-0 border border-emerald-200">
                          {m.prenom?.[0]}{m.nom?.[0]}
                        </div>
                      )}
                      <div>
                        <h4 className="font-extrabold text-slate-900 text-sm group-hover:text-emerald-900 transition-colors">
                          {m.prenom} {m.nom}
                        </h4>
                        <div className="flex items-center gap-2 text-[11px] font-semibold text-slate-500 mt-0.5">
                          <span className="flex items-center gap-1 text-slate-600">
                            <MapPin className="w-3 h-3 text-emerald-600" />
                            <span>{m.ville || 'Inconnue'}</span>
                          </span>
                          <span>•</span>
                          <span className="text-emerald-700 font-bold">{m.region}</span>
                        </div>
                      </div>
                    </div>

                    <span className="p-2 bg-emerald-50 text-emerald-700 group-hover:bg-emerald-600 group-hover:text-white rounded-xl transition-colors shrink-0">
                      <ChevronRight className="w-4 h-4" />
                    </span>
                  </div>
                ))}
              </div>
            )
          )}

        </div>

        {/* Modal Footer */}
        <div className="p-4 bg-slate-50 border-t border-slate-200 flex items-center justify-between text-xs font-semibold text-slate-500 shrink-0">
          <span>Mbok de France — Cartographie et Réseau Territorial</span>
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
