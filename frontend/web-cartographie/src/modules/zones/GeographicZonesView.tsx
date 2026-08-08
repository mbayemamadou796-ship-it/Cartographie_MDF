import React, { useState, useMemo } from 'react';
import { Member, CustomZone, UserRole, AppUser } from '../../types';
import { Layers, Globe, MapPin, Building2, Compass, Plus, Users, ArrowRight, Edit3, Trash2, UserPlus, Eye, UserCheck, ChevronRight } from 'lucide-react';
import { CustomZoneModal } from './CustomZoneModal';
import { ManageZoneMembersModal } from './ManageZoneMembersModal';
import { ZoneDetailsModal, ZoneDataInfo } from './ZoneDetailsModal';
import { StatInlineView } from '../../components/StatDetailModal';

interface GeographicZonesViewProps {
  members: Member[];
  customZones: CustomZone[];
  userRole: UserRole;
  users?: AppUser[];
  currentUserId?: string;
  assignedZoneIds?: string[];
  onAddZone: (zone: Omit<CustomZone, 'id' | 'createdAt'>) => void;
  onUpdateZone: (zoneId: string, updates: Partial<CustomZone>) => void;
  onDeleteZone: (zoneId: string) => void;
  onToggleMemberInZone: (zoneId: string, memberId: string) => void;
  onSelectCustomZone: (zoneId: string) => void;
  onSelectZone: (zoneType: 'region' | 'departement' | 'ville', zoneName: string) => void;
  onOpenAddMemberInZone: (
    zoneId?: string,
    zoneName?: string,
    defaultGeo?: { region?: string; departement?: string; ville?: string }
  ) => void;
  onSelectMemberDetails: (member: Member) => void;
}

const COLOR_MAP: Record<string, { bg: string; border: string; text: string; badgeBg: string }> = {
  emerald: { bg: 'bg-emerald-500', border: 'border-emerald-200', text: 'text-emerald-900', badgeBg: 'bg-emerald-100' },
  blue: { bg: 'bg-blue-500', border: 'border-blue-200', text: 'text-blue-900', badgeBg: 'bg-blue-100' },
  indigo: { bg: 'bg-indigo-500', border: 'border-indigo-200', text: 'text-indigo-900', badgeBg: 'bg-indigo-100' },
  purple: { bg: 'bg-purple-500', border: 'border-purple-200', text: 'text-purple-900', badgeBg: 'bg-purple-100' },
  amber: { bg: 'bg-amber-500', border: 'border-amber-200', text: 'text-amber-900', badgeBg: 'bg-amber-100' },
  rose: { bg: 'bg-rose-500', border: 'border-rose-200', text: 'text-rose-900', badgeBg: 'bg-rose-100' },
  teal: { bg: 'bg-teal-500', border: 'border-teal-200', text: 'text-teal-900', badgeBg: 'bg-teal-100' },
};

export const GeographicZonesView: React.FC<GeographicZonesViewProps> = ({
  members,
  customZones,
  userRole,
  users,
  currentUserId,
  assignedZoneIds,
  onAddZone,
  onUpdateZone,
  onDeleteZone,
  onToggleMemberInZone,
  onSelectCustomZone,
  onSelectZone,
  onOpenAddMemberInZone,
  onSelectMemberDetails
}) => {
  // Modals state
  const [isZoneModalOpen, setIsZoneModalOpen] = useState(false);
  const [zoneToEdit, setZoneToEdit] = useState<CustomZone | null>(null);

  const [isManageMembersModalOpen, setIsManageMembersModalOpen] = useState(false);
  const [selectedZoneForMembers, setSelectedZoneForMembers] = useState<CustomZone | null>(null);

  // Zone details modal state
  const [activeDetailsZone, setActiveDetailsZone] = useState<ZoneDataInfo | null>(null);

  // Active sub-part tab state ('zones' | 'villes' | 'departements' | 'membres')
  const [activeSubTab, setActiveSubTab] = useState<'zones' | 'villes' | 'departements' | 'membres'>('zones');

  // Filter custom zones for referent users
  const filteredCustomZones = useMemo(() => {
    if (userRole === 'referent') {
      if (assignedZoneIds && assignedZoneIds.length > 0) {
        const matched = customZones.filter((z) => assignedZoneIds.includes(z.id));
        if (matched.length > 0) return matched;
      }
      if (currentUserId) {
        const matchedByUserId = customZones.filter((z) => z.referentUserId === currentUserId);
        if (matchedByUserId.length > 0) return matchedByUserId;
      }
      return customZones;
    }
    return customZones;
  }, [customZones, userRole, currentUserId, assignedZoneIds]);

  // Map of memberId to Member for O(1) live synchronized lookups
  const membersMap = useMemo(() => {
    const map = new Map<string, Member>();
    members.forEach((m) => map.set(m.id, m));
    return map;
  }, [members]);

  // Compute live members for the active details zone
  const activeZoneMembers = useMemo(() => {
    if (!activeDetailsZone) return [];

    if (activeDetailsZone.isCustom && activeDetailsZone.id) {
      const foundZone = customZones.find((z) => z.id === activeDetailsZone.id);
      const zoneNameLower = (foundZone?.name || activeDetailsZone.name || '').trim().toLowerCase();
      const memberIdsSet = new Set(foundZone ? foundZone.memberIds : []);

      return members.filter((m) => {
        if (memberIdsSet.has(m.id)) return true;
        const mZone = (m.zone || '').trim().toLowerCase();
        const mRegion = (m.region || '').trim().toLowerCase();
        if (mZone === zoneNameLower || mRegion === zoneNameLower) return true;
        if (zoneNameLower === 'bretagne') {
          const v = (m.ville || '').toLowerCase();
          const d = (m.departement || '').toLowerCase();
          const cp = (m.codePostal || '').toLowerCase();
          if (
            v.includes('rennes') || v.includes('brest') || v.includes('quimper') ||
            v.includes('lorient') || v.includes('vannes') || v.includes('saint-brieuc') ||
            v.includes('saint-malo') || d.includes('35') || d.includes('29') ||
            d.includes('56') || d.includes('22') || d.includes('ille-et-vilaine') ||
            d.includes('finistère') || d.includes('finistere') || d.includes('morbihan') ||
            cp.startsWith('35') || cp.startsWith('29') || cp.startsWith('56') || cp.startsWith('22')
          ) {
            return true;
          }
        }
        return false;
      });
    }

    if (activeDetailsZone.zoneType === 'region' && activeDetailsZone.defaultGeo?.region) {
      const targetReg = activeDetailsZone.defaultGeo.region.toLowerCase().trim();
      return members.filter((m) => (m.region?.trim() || m.zone?.trim() || '').toLowerCase() === targetReg);
    }

    if (activeDetailsZone.zoneType === 'departement' && activeDetailsZone.defaultGeo?.departement) {
      const targetDept = activeDetailsZone.defaultGeo.departement.toLowerCase().trim();
      return members.filter((m) => (m.departement?.trim() || '').toLowerCase() === targetDept);
    }

    if (activeDetailsZone.zoneType === 'ville' && activeDetailsZone.defaultGeo?.ville) {
      const targetCity = activeDetailsZone.defaultGeo.ville.toLowerCase().trim();
      return members.filter((m) => (m.ville?.trim() || '').toLowerCase() === targetCity);
    }

    return [];
  }, [activeDetailsZone, customZones, members]);

  // Compute stats for Regions, Departments, and Cities
  const zonesData = useMemo(() => {
    const regionMap = new Map<string, { count: number; cities: Set<string>; members: Member[] }>();
    const deptMap = new Map<string, { count: number; region: string; members: Member[] }>();
    const cityMap = new Map<string, { count: number; dept: string; region: string; members: Member[] }>();

    members.forEach((m) => {
      // Region
      const region = m.region?.trim() || 'Non renseignée';
      if (!regionMap.has(region)) {
        regionMap.set(region, { count: 0, cities: new Set(), members: [] });
      }
      const rData = regionMap.get(region)!;
      rData.count += 1;
      if (m.ville) rData.cities.add(m.ville.trim());
      rData.members.push(m);

      // Dept
      const dept = m.departement?.trim() || 'Non renseigné';
      if (!deptMap.has(dept)) {
        deptMap.set(dept, { count: 0, region: m.region || '', members: [] });
      }
      const dData = deptMap.get(dept)!;
      dData.count += 1;
      dData.members.push(m);

      // City
      const city = m.ville?.trim() || 'Non renseignée';
      if (!cityMap.has(city)) {
        cityMap.set(city, { count: 0, dept: m.departement || '', region: m.region || '', members: [] });
      }
      const cData = cityMap.get(city)!;
      cData.count += 1;
      cData.members.push(m);
    });

    const regionsList = Array.from(regionMap.entries())
      .map(([name, data]) => ({
        name,
        count: data.count,
        cityCount: data.cities.size,
        members: data.members
      }))
      .sort((a, b) => b.count - a.count);

    const deptsList = Array.from(deptMap.entries())
      .map(([name, data]) => ({
        name,
        count: data.count,
        region: data.region,
        members: data.members
      }))
      .sort((a, b) => b.count - a.count);

    const citiesList = Array.from(cityMap.entries())
      .map(([name, data]) => ({
        name,
        count: data.count,
        dept: data.dept,
        region: data.region,
        members: data.members
      }))
      .sort((a, b) => b.count - a.count);

    return { regionsList, deptsList, citiesList };
  }, [members]);

  // Handlers
  const handleOpenCreateZone = () => {
    setZoneToEdit(null);
    setIsZoneModalOpen(true);
  };

  const handleOpenEditZone = (zone: CustomZone, e: React.MouseEvent) => {
    e.stopPropagation();
    setZoneToEdit(zone);
    setIsZoneModalOpen(true);
  };

  const handleDeleteZoneConfirm = (zone: CustomZone, e: React.MouseEvent) => {
    e.stopPropagation();
    if (window.confirm(`Voulez-vous vraiment supprimer la zone "${zone.name}" ?`)) {
      onDeleteZone(zone.id);
    }
  };

  const handleOpenManageMembers = (zone: CustomZone, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    setSelectedZoneForMembers(zone);
    setIsManageMembersModalOpen(true);
  };

  const handleSaveZoneModal = (
    name: string,
    description: string,
    color: string,
    referentUserId?: string,
    referentName?: string
  ) => {
    if (zoneToEdit) {
      onUpdateZone(zoneToEdit.id, { name, description, color, referentUserId, referentName });
    } else {
      onAddZone({
        name,
        description,
        color,
        referentUserId,
        referentName,
        memberIds: []
      });
    }
  };

  const handleOpenCustomZoneDetails = (zone: CustomZone, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    setActiveDetailsZone({
      id: zone.id,
      name: zone.name,
      description: zone.description,
      color: zone.color,
      isCustom: true,
      zoneType: 'custom'
    });
  };

  const handleOpenAdminZoneDetails = (
    type: 'region' | 'departement' | 'ville',
    name: string,
    deptName?: string,
    regionName?: string,
    e?: React.MouseEvent
  ) => {
    if (e) e.stopPropagation();
    setActiveDetailsZone({
      name: `${type === 'region' ? 'Région' : type === 'departement' ? 'Département' : 'Ville'} : ${name}`,
      description: `Membres enregistrés résidant dans la localité "${name}".`,
      color: 'emerald',
      isCustom: false,
      zoneType: type,
      defaultGeo: {
        region: type === 'region' ? name : regionName,
        departement: type === 'departement' ? name : deptName,
        ville: type === 'ville' ? name : undefined
      }
    });
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      
      {/* View Header with Main Section Tabs */}
      <div className="bg-white rounded-3xl p-6 border border-emerald-200 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <span className="p-3 rounded-2xl bg-gradient-to-tr from-emerald-800 to-slate-900 text-emerald-300 border border-emerald-700 shadow-xs">
            <Layers className="w-6 h-6" />
          </span>
          <div>
            <h2 className="text-xl font-extrabold text-slate-900 font-['Outfit']">
              Rubrique Zones & Groupes sur-mesure
            </h2>
            <p className="text-xs text-slate-500 font-medium mt-0.5">
              Gérez et attribuez les zones régionales de France (Bretagne, Île-de-France, Pays de la Loire, Normandie, Occitanie...) avec synchronisation automatique
            </p>
          </div>
        </div>

        {/* Header Title & Create Button */}
        <div className="flex flex-wrap items-center gap-3">
          {userRole === 'admin' && (
            <button
              onClick={handleOpenCreateZone}
              className="inline-flex items-center gap-1.5 px-4 py-2.5 bg-gradient-to-r from-[#2be39d] via-[#48c92a] to-[#8de02d] hover:brightness-105 text-emerald-950 font-bold text-xs rounded-2xl shadow-sm transition-all active:scale-95 shrink-0"
            >
              <Plus className="w-4 h-4 stroke-[3]" />
              <span>Ajouter une zone</span>
            </button>
          )}
        </div>
      </div>

      {/* Coverage Statistics Banner / Sub-part Tabs */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-gradient-to-r from-emerald-900 via-emerald-950 to-slate-900 p-4 rounded-3xl text-white shadow-md border border-emerald-700/40">
        <button
          type="button"
          onClick={() => setActiveSubTab('zones')}
          className={`flex items-center gap-3 p-3 rounded-2xl transition-all text-left group cursor-pointer ${
            activeSubTab === 'zones'
              ? 'bg-emerald-500/30 border-2 border-emerald-400 ring-2 ring-emerald-400/40 shadow-lg scale-[1.02]'
              : 'bg-white/5 hover:bg-white/10 border border-emerald-500/20 hover:border-emerald-400/50 opacity-80 hover:opacity-100'
          }`}
        >
          <div className="p-2.5 rounded-2xl bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 group-hover:scale-110 transition-transform shrink-0">
            <Globe className="w-5 h-5" />
          </div>
          <div className="min-w-0">
            <p className="text-[10px] uppercase tracking-wider font-bold text-emerald-300/90 flex items-center gap-1">
              <span>Zones Régionales</span>
            </p>
            <p className="text-lg font-black font-['Outfit'] text-white">
              {filteredCustomZones.length}
            </p>
          </div>
        </button>

        <button
          type="button"
          onClick={() => setActiveSubTab('villes')}
          className={`flex items-center gap-3 p-3 rounded-2xl transition-all text-left group cursor-pointer ${
            activeSubTab === 'villes'
              ? 'bg-emerald-500/30 border-2 border-emerald-400 ring-2 ring-emerald-400/40 shadow-lg scale-[1.02]'
              : 'bg-white/5 hover:bg-white/10 border border-emerald-500/20 hover:border-emerald-400/50 opacity-80 hover:opacity-100'
          }`}
        >
          <div className="p-2.5 rounded-2xl bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 group-hover:scale-110 transition-transform shrink-0">
            <Compass className="w-5 h-5" />
          </div>
          <div className="min-w-0">
            <p className="text-[10px] uppercase tracking-wider font-bold text-emerald-300/90 flex items-center gap-1">
              <span>Villes Représentées</span>
            </p>
            <p className="text-lg font-black font-['Outfit'] text-white">
              {new Set(filteredCustomZones.flatMap(z => z.memberIds.map(id => membersMap.get(id)?.ville?.trim()).filter(Boolean))).size}
            </p>
          </div>
        </button>

        <button
          type="button"
          onClick={() => setActiveSubTab('departements')}
          className={`flex items-center gap-3 p-3 rounded-2xl transition-all text-left group cursor-pointer ${
            activeSubTab === 'departements'
              ? 'bg-emerald-500/30 border-2 border-emerald-400 ring-2 ring-emerald-400/40 shadow-lg scale-[1.02]'
              : 'bg-white/5 hover:bg-white/10 border border-emerald-500/20 hover:border-emerald-400/50 opacity-80 hover:opacity-100'
          }`}
        >
          <div className="p-2.5 rounded-2xl bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 group-hover:scale-110 transition-transform shrink-0">
            <Building2 className="w-5 h-5" />
          </div>
          <div className="min-w-0">
            <p className="text-[10px] uppercase tracking-wider font-bold text-emerald-300/90 flex items-center gap-1">
              <span>Départements Couverts</span>
            </p>
            <p className="text-lg font-black font-['Outfit'] text-white">
              {new Set(filteredCustomZones.flatMap(z => z.memberIds.map(id => membersMap.get(id)?.departement?.trim()).filter(Boolean))).size}
            </p>
          </div>
        </button>

        <button
          type="button"
          onClick={() => setActiveSubTab('membres')}
          className={`flex items-center gap-3 p-3 rounded-2xl transition-all text-left group cursor-pointer ${
            activeSubTab === 'membres'
              ? 'bg-emerald-500/30 border-2 border-emerald-400 ring-2 ring-emerald-400/40 shadow-lg scale-[1.02]'
              : 'bg-white/5 hover:bg-white/10 border border-emerald-500/20 hover:border-emerald-400/50 opacity-80 hover:opacity-100'
          }`}
        >
          <div className="p-2.5 rounded-2xl bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 group-hover:scale-110 transition-transform shrink-0">
            <Users className="w-5 h-5" />
          </div>
          <div className="min-w-0">
            <p className="text-[10px] uppercase tracking-wider font-bold text-emerald-300/90 flex items-center gap-1">
              <span>Membres Associés</span>
            </p>
            <p className="text-lg font-black font-['Outfit'] text-white">
              {filteredCustomZones.reduce((acc, z) => acc + z.memberIds.length, 0)}
            </p>
          </div>
        </button>
      </div>

      {/* DYNAMIC CONTENT UNDERNEATH BANNER */}
      {activeSubTab !== 'zones' ? (
        <StatInlineView
          type={activeSubTab}
          members={members}
          customZones={filteredCustomZones}
          onSelectMemberDetails={onSelectMemberDetails}
          onSelectZoneDetails={(zone) => handleOpenCustomZoneDetails(zone)}
          onFilterOnMap={(geo) => {
            if (geo.ville) {
              onSelectZone('ville', geo.ville);
            } else if (geo.departement) {
              onSelectZone('departement', geo.departement);
            } else if (geo.region) {
              onSelectZone('region', geo.region);
            }
          }}
        />
      ) : (
      /* MDF ZONES LIST */
      <div className="space-y-6">
          
          {customZones.length === 0 ? (
            <div className="bg-white rounded-3xl p-12 border border-dashed border-emerald-300 text-center space-y-4">
              <div className="w-16 h-16 rounded-2xl bg-emerald-50 text-emerald-600 border border-emerald-200 flex items-center justify-center mx-auto">
                <Layers className="w-8 h-8" />
              </div>
              <div className="max-w-md mx-auto space-y-1">
                <h3 className="text-base font-bold text-slate-900 font-['Outfit']">
                  Aucune zone personnalisée définie
                </h3>
                <p className="text-xs text-slate-500 font-medium">
                  Créez vos zones régionales (ex: Bretagne, Île-de-France, Occitanie, Normandie...) pour associer des membres et les afficher sur la carte.
                </p>
              </div>

              {userRole === 'admin' && (
                <button
                  onClick={handleOpenCreateZone}
                  className="inline-flex items-center gap-2 px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold text-xs shadow-sm transition-all"
                >
                  <Plus className="w-4 h-4" />
                  <span>Créer la première zone</span>
                </button>
              )}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {filteredCustomZones.map((zone) => {
                const colorTheme = COLOR_MAP[zone.color || 'emerald'] || COLOR_MAP.emerald;

                // Resolve live Member objects matching memberIds, region/zone name, or geography
                const memberIdsSet = new Set(zone.memberIds);
                const zoneNameLower = zone.name.trim().toLowerCase();

                const zoneMembers = members.filter((m) => {
                  if (memberIdsSet.has(m.id)) return true;
                  const mZone = (m.zone || '').trim().toLowerCase();
                  const mRegion = (m.region || '').trim().toLowerCase();
                  if (mZone === zoneNameLower || mRegion === zoneNameLower) return true;
                  if (zoneNameLower === 'bretagne') {
                    const v = (m.ville || '').toLowerCase();
                    const d = (m.departement || '').toLowerCase();
                    const cp = (m.codePostal || '').toLowerCase();
                    if (
                      v.includes('rennes') || v.includes('brest') || v.includes('quimper') ||
                      v.includes('lorient') || v.includes('vannes') || v.includes('saint-brieuc') ||
                      v.includes('saint-malo') || d.includes('35') || d.includes('29') ||
                      d.includes('56') || d.includes('22') || d.includes('ille-et-vilaine') ||
                      d.includes('finistère') || d.includes('finistere') || d.includes('morbihan') ||
                      cp.startsWith('35') || cp.startsWith('29') || cp.startsWith('56') || cp.startsWith('22')
                    ) {
                      return true;
                    }
                  }
                  return false;
                });

                // Geographic Breakdown Calculations
                const zoneCitiesSet = new Set(zoneMembers.map((m) => m.ville?.trim()).filter(Boolean));
                const zoneDeptsSet = new Set(zoneMembers.map((m) => m.departement?.trim()).filter(Boolean));
                const zoneCitiesList = Array.from(zoneCitiesSet);

                return (
                  <div
                    key={zone.id}
                    onClick={() => handleOpenCustomZoneDetails(zone)}
                    className="bg-white rounded-3xl p-6 border border-emerald-200 hover:border-emerald-400 hover:shadow-lg transition-all flex flex-col justify-between space-y-5 group relative overflow-hidden cursor-pointer"
                  >
                    {/* Top Decorative Color Bar */}
                    <div className={`absolute top-0 left-0 right-0 h-1.5 ${colorTheme.bg}`} />

                    {/* Zone Header */}
                    <div className="space-y-2">
                      <div className="flex items-start justify-between gap-3 pt-1">
                        <div className="flex items-center gap-3">
                          <span className={`w-3.5 h-3.5 rounded-full ${colorTheme.bg} shrink-0 shadow-xs`} />
                          <h3 className="font-extrabold text-slate-900 text-base font-[#Outfit] group-hover:text-emerald-900 transition-colors">
                            {zone.name}
                          </h3>
                        </div>

                        <div className="flex items-center gap-1">
                          {userRole === 'admin' && (
                            <>
                              <button
                                onClick={(e) => handleOpenEditZone(zone, e)}
                                title="Modifier le nom/couleur de la zone"
                                className="p-1.5 rounded-xl hover:bg-slate-100 text-slate-400 hover:text-slate-700 transition-colors"
                              >
                                <Edit3 className="w-3.5 h-3.5" />
                              </button>
                              <button
                                onClick={(e) => handleDeleteZoneConfirm(zone, e)}
                                title="Supprimer la zone"
                                className="p-1.5 rounded-xl hover:bg-rose-50 text-slate-400 hover:text-rose-600 transition-colors"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </>
                          )}
                          <button
                            onClick={(e) => handleOpenCustomZoneDetails(zone, e)}
                            className={`px-3 py-1 rounded-full text-xs font-extrabold ${colorTheme.badgeBg} ${colorTheme.text} border border-black/5 shrink-0 hover:scale-105 transition-transform`}
                          >
                            {zoneMembers.length} membre{zoneMembers.length > 1 ? 's' : ''}
                          </button>
                        </div>
                      </div>

                      {/* Referent Badge */}
                      <div className="flex items-center gap-1.5 text-[11px] font-semibold text-slate-600 bg-slate-50 px-2.5 py-1 rounded-lg border border-slate-100 w-fit">
                        <UserCheck className="w-3 h-3 text-emerald-600 shrink-0" />
                        <span>Référent : </span>
                        <strong className="text-slate-900">
                          {zone.referentName || (zone.referentUserId && users?.find(u => u.id === zone.referentUserId)?.name) || 'Non assigné'}
                        </strong>
                      </div>

                      {zone.description && (
                        <p className="text-xs text-slate-500 font-medium leading-relaxed pl-1 line-clamp-2">
                          {zone.description}
                        </p>
                      )}
                    </div>

                    {/* Geographic Distribution Breakdown */}
                    <div className="bg-emerald-50/70 p-3 rounded-2xl border border-emerald-200/70 space-y-2">
                      <div className="flex items-center justify-between text-xs">
                        <span className="flex items-center gap-1.5 font-bold text-emerald-950">
                          <MapPin className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                          <span>{zoneCitiesList.length} ville{zoneCitiesList.length > 1 ? 's' : ''} représentée{zoneCitiesList.length > 1 ? 's' : ''}</span>
                        </span>
                        <span className="text-[10px] bg-emerald-100 text-emerald-900 px-2.5 py-0.5 rounded-full font-extrabold border border-emerald-300/60">
                          {zoneDeptsSet.size} dép.
                        </span>
                      </div>

                      {zoneCitiesList.length > 0 && (
                        <div className="flex flex-wrap gap-1 pt-0.5">
                          {zoneCitiesList.slice(0, 4).map((c) => (
                            <span key={c} className="text-[10px] bg-white text-emerald-900 px-2 py-0.5 rounded-lg border border-emerald-200 font-extrabold shadow-2xs">
                              {c}
                            </span>
                          ))}
                          {zoneCitiesList.length > 4 && (
                            <span className="text-[10px] text-emerald-800 font-bold self-center pl-0.5">
                              +{zoneCitiesList.length - 4} autres
                            </span>
                          )}
                        </div>
                      )}
                    </div>

                    {/* Live Member Reference List */}
                    <div className="space-y-2 pt-3 border-t border-slate-100">
                      <div className="flex items-center justify-between text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                        <span>Membres dans cette zone :</span>
                        <button
                          onClick={(e) => handleOpenCustomZoneDetails(zone, e)}
                          className="text-emerald-600 hover:text-emerald-800 font-bold lowercase flex items-center gap-1 hover:underline"
                        >
                          <Eye className="w-3 h-3" />
                          <span>Voir tout ({zoneMembers.length})</span>
                        </button>
                      </div>

                      <div className="flex flex-wrap gap-1.5 min-h-[36px]">
                        {zoneMembers.length === 0 ? (
                          <span className="text-[11px] text-slate-400 italic">
                            Aucun membre dans cette zone. Cliquez pour en ajouter.
                          </span>
                        ) : (
                          <>
                            {zoneMembers.slice(0, 5).map((m) => (
                              <div
                                key={m.id}
                                onClick={(e) => {
                                  e.stopPropagation();
                                  onSelectMemberDetails(m);
                                }}
                                className="inline-flex items-center gap-1 text-[11px] bg-slate-50 hover:bg-emerald-100/70 text-slate-800 hover:text-emerald-950 px-2.5 py-1 rounded-xl border border-slate-200 font-bold transition-colors cursor-pointer"
                              >
                                <span>{m.prenom} {m.nom}</span>
                                <span className="text-[9px] text-slate-400 font-normal">({m.ville})</span>
                              </div>
                            ))}
                            {zoneMembers.length > 5 && (
                              <button
                                onClick={(e) => handleOpenCustomZoneDetails(zone, e)}
                                className="text-[11px] text-emerald-800 font-bold self-center bg-emerald-100 hover:bg-emerald-200 px-2 py-0.5 rounded-lg transition-colors"
                              >
                                +{zoneMembers.length - 5} autres
                              </button>
                            )}
                          </>
                        )}
                      </div>
                    </div>

                    {/* Bottom Action Buttons */}
                    <div className="pt-3 border-t border-slate-100 flex items-center justify-between gap-1.5 flex-wrap">
                      {userRole === 'admin' && (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            onOpenAddMemberInZone(zone.id, zone.name);
                          }}
                          className="inline-flex items-center gap-1 px-2.5 py-1.5 bg-gradient-to-r from-[#2be39d] to-[#48c92a] hover:brightness-105 text-emerald-950 rounded-xl font-black text-xs transition-all shadow-2xs"
                        >
                          <UserPlus className="w-3.5 h-3.5" />
                          <span>+ Nouveau membre</span>
                        </button>
                      )}

                      <button
                        onClick={(e) => handleOpenCustomZoneDetails(zone, e)}
                        className="inline-flex items-center gap-1 px-2.5 py-1.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-900 rounded-xl font-bold text-xs transition-colors border border-emerald-200"
                      >
                        <Eye className="w-3.5 h-3.5 text-emerald-700" />
                        <span>Voir membres ({zoneMembers.length})</span>
                      </button>

                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          onSelectCustomZone(zone.id);
                        }}
                        title="Afficher sur la carte"
                        className="p-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl transition-colors"
                      >
                        <ArrowRight className="w-4 h-4 text-emerald-700" />
                      </button>
                    </div>

                  </div>
                );
              })}
            </div>
          )}

        </div>
      )}

      {/* Modals */}
      <CustomZoneModal
        isOpen={isZoneModalOpen}
        zoneToEdit={zoneToEdit}
        users={users}
        onClose={() => setIsZoneModalOpen(false)}
        onSave={handleSaveZoneModal}
      />

      <ManageZoneMembersModal
        isOpen={isManageMembersModalOpen}
        zone={selectedZoneForMembers}
        allMembers={members}
        onClose={() => setIsManageMembersModalOpen(false)}
        onToggleMember={(zoneId, memberId) => {
          onToggleMemberInZone(zoneId, memberId);
          // Update local modal state so badge count updates live
          if (selectedZoneForMembers) {
            const hasMember = selectedZoneForMembers.memberIds.includes(memberId);
            const updatedIds = hasMember
              ? selectedZoneForMembers.memberIds.filter((id) => id !== memberId)
              : [...selectedZoneForMembers.memberIds, memberId];
            setSelectedZoneForMembers({
              ...selectedZoneForMembers,
              memberIds: updatedIds
            });
          }
        }}
      />

      <ZoneDetailsModal
        isOpen={activeDetailsZone !== null}
        zone={activeDetailsZone}
        zoneMembers={activeZoneMembers}
        allMembers={members}
        userRole={userRole}
        onClose={() => setActiveDetailsZone(null)}
        onOpenAddMemberInZone={(targetZoneId, targetZoneName, defaultGeo) => {
          onOpenAddMemberInZone(targetZoneId, targetZoneName, defaultGeo);
        }}
        onManageZoneMembers={(zoneId) => {
          const z = customZones.find((cz) => cz.id === zoneId);
          if (z) {
            handleOpenManageMembers(z);
          }
        }}
        onRemoveMemberFromZone={(zoneId, memberId) => {
          onToggleMemberInZone(zoneId, memberId);
        }}
        onSelectMemberDetails={(member) => {
          setActiveDetailsZone(null);
          onSelectMemberDetails(member);
        }}
        onFilterOnMap={() => {
          if (activeDetailsZone) {
            if (activeDetailsZone.isCustom && activeDetailsZone.id) {
              onSelectCustomZone(activeDetailsZone.id);
            }
          }
        }}
      />

    </div>
  );
};
