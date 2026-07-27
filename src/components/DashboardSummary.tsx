import React, { useMemo } from 'react';
import { Member, QualityFilter, CustomZone } from '../types';
import { Users, Building2, MapPin, Compass, Calendar, AlertTriangle, PhoneOff, MailX, MapPinOff, Copy, CheckCircle2, RefreshCw, Layers, Activity, FileSpreadsheet, UserPlus } from 'lucide-react';

interface DashboardSummaryProps {
  members: Member[];
  customZones?: CustomZone[];
  lastUpdateDate: string;
  activeQualityFilter: QualityFilter;
  onSelectQualityFilter: (filter: QualityFilter) => void;
  onNavigateToTab?: (tab: 'directory' | 'zones' | 'quality' | 'import_export') => void;
}

export const DashboardSummary: React.FC<DashboardSummaryProps> = ({
  members,
  customZones = [],
  lastUpdateDate,
  activeQualityFilter,
  onSelectQualityFilter,
  onNavigateToTab
}) => {
  // Calculate summary metrics
  const stats = useMemo(() => {
    const totalMembers = members.length;
    const totalZones = customZones.length;

    const uniqueVilles = new Set(
      members.map((m) => m.ville.trim().toLowerCase()).filter(Boolean)
    ).size;

    const uniqueDepts = new Set(
      members.map((m) => m.departement.trim().toLowerCase()).filter(Boolean)
    ).size;

    const uniqueRegions = new Set(
      members.map((m) => m.region.trim().toLowerCase()).filter(Boolean)
    ).size;

    // Data Quality issues calculation
    const noPhoneCount = members.filter((m) => !m.telephone || !m.telephone.trim()).length;
    const noEmailCount = members.filter((m) => !m.email || !m.email.trim()).length;
    const noLocationCount = members.filter(
      (m) => !m.latitude || !m.longitude || (m.latitude === 0 && m.longitude === 0)
    ).length;

    // Duplicate detection (by email or full name)
    const emailCounts = new Map<string, number>();
    const nameCounts = new Map<string, number>();
    members.forEach((m) => {
      const email = m.email?.trim().toLowerCase();
      if (email) emailCounts.set(email, (emailCounts.get(email) || 0) + 1);

      const name = `${m.nom?.trim().toLowerCase()} ${m.prenom?.trim().toLowerCase()}`;
      if (name) nameCounts.set(name, (nameCounts.get(name) || 0) + 1);
    });

    const duplicateMembers = members.filter((m) => {
      const email = m.email?.trim().toLowerCase();
      const name = `${m.nom?.trim().toLowerCase()} ${m.prenom?.trim().toLowerCase()}`;
      return (email && (emailCounts.get(email) || 0) > 1) || (name && (nameCounts.get(name) || 0) > 1);
    });

    const duplicatesCount = duplicateMembers.length;

    return {
      totalMembers,
      totalZones,
      uniqueVilles,
      uniqueDepts,
      uniqueRegions,
      noPhoneCount,
      noEmailCount,
      noLocationCount,
      duplicatesCount
    };
  }, [members, customZones]);

  const totalQualityIssues =
    stats.noPhoneCount + stats.noEmailCount + stats.noLocationCount + stats.duplicatesCount;

  return (
    <section className="bg-white rounded-3xl p-5 sm:p-6 border border-emerald-200 shadow-sm space-y-5 transition-all">
      {/* Header Row */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-emerald-100 pb-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-1.5 rounded-xl bg-emerald-100 text-emerald-800">
              <Building2 className="w-4 h-4 text-emerald-700" />
            </span>
            <h2 className="text-base sm:text-lg font-bold text-slate-900 font-['Outfit']">
              Tableau de bord Mbok de France
            </h2>
          </div>
          <p className="text-xs text-slate-500 font-medium mt-0.5">
            Vue synthétique des données et indicateurs clés de la communauté MDF
          </p>
        </div>

        {/* Last update pill */}
        <div className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-emerald-50/80 border border-emerald-200/80 rounded-xl text-xs font-semibold text-emerald-950 shrink-0">
          <Calendar className="w-3.5 h-3.5 text-emerald-600" />
          <span>Dernière mise à jour : {lastUpdateDate || 'Aujourd\'hui'}</span>
        </div>
      </div>

      {/* Primary KPI Grid (5 metrics) */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 sm:gap-4">
        {/* Total Membres */}
        <div
          onClick={() => onNavigateToTab?.('directory')}
          className="bg-gradient-to-br from-emerald-500 to-emerald-600 text-white rounded-2xl p-4 shadow-sm relative overflow-hidden group cursor-pointer"
        >
          <div className="absolute right-2 bottom-2 opacity-15 transform group-hover:scale-110 transition-transform">
            <Users className="w-16 h-16" />
          </div>
          <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-100 block">
            Membres totaux
          </span>
          <div className="text-2xl sm:text-3xl font-extrabold font-['Outfit'] mt-1">
            {stats.totalMembers}
          </div>
          <p className="text-[10px] text-emerald-100 mt-1 font-medium">Inscrits dans l'annuaire</p>
        </div>

        {/* Nombre de Zones */}
        <div
          onClick={() => onNavigateToTab?.('zones')}
          className="bg-emerald-50/70 border border-emerald-200/80 rounded-2xl p-4 flex flex-col justify-between cursor-pointer hover:border-emerald-400 transition-all"
        >
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
              Zones
            </span>
            <Layers className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="text-2xl font-extrabold text-slate-900 font-['Outfit'] mt-1">
            {stats.totalZones}
          </div>
          <p className="text-[10px] text-slate-500 font-medium">Zones personnalisées MDF</p>
        </div>

        {/* Villes */}
        <div
          onClick={() => onNavigateToTab?.('directory')}
          className="bg-emerald-50/70 border border-emerald-200/80 rounded-2xl p-4 flex flex-col justify-between cursor-pointer hover:border-emerald-400 transition-all"
        >
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
              Villes
            </span>
            <MapPin className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="text-2xl font-extrabold text-slate-900 font-['Outfit'] mt-1">
            {stats.uniqueVilles}
          </div>
          <p className="text-[10px] text-slate-500 font-medium">Communes représentées</p>
        </div>

        {/* Départements */}
        <div
          onClick={() => onNavigateToTab?.('directory')}
          className="bg-emerald-50/70 border border-emerald-200/80 rounded-2xl p-4 flex flex-col justify-between cursor-pointer hover:border-emerald-400 transition-all"
        >
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
              Départements
            </span>
            <Compass className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="text-2xl font-extrabold text-slate-900 font-['Outfit'] mt-1">
            {stats.uniqueDepts}
          </div>
          <p className="text-[10px] text-slate-500 font-medium">Départements en France</p>
        </div>

        {/* Régions */}
        <div
          onClick={() => onNavigateToTab?.('directory')}
          className="bg-emerald-50/70 border border-emerald-200/80 rounded-2xl p-4 flex flex-col justify-between cursor-pointer hover:border-emerald-400 transition-all"
        >
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
              Régions
            </span>
            <Building2 className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="text-2xl font-extrabold text-slate-900 font-['Outfit'] mt-1">
            {stats.uniqueRegions}
          </div>
          <p className="text-[10px] text-slate-500 font-medium">Régions de présence</p>
        </div>
      </div>

      {/* Data Quality & Health Checks Section */}
      <div className="bg-slate-50/80 rounded-2xl p-4 border border-slate-200/80 space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-amber-600" />
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-800 font-['Outfit']">
              Amélioration de la qualité des données
            </h3>
            {totalQualityIssues === 0 ? (
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800">
                <CheckCircle2 className="w-3 h-3 text-emerald-600" /> 100% Complète
              </span>
            ) : (
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-800">
                {totalQualityIssues} point(s) à compléter
              </span>
            )}
          </div>

          {activeQualityFilter !== 'all' && (
            <button
              onClick={() => onSelectQualityFilter('all')}
              className="inline-flex items-center gap-1 text-[11px] text-emerald-800 font-bold hover:underline"
            >
              <RefreshCw className="w-3 h-3 text-emerald-600" />
              <span>Réinitialiser le filtre de qualité</span>
            </button>
          )}
        </div>

        {/* Data Quality Filter Buttons Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
          {/* Sans téléphone */}
          <button
            onClick={() => onSelectQualityFilter(activeQualityFilter === 'no_phone' ? 'all' : 'no_phone')}
            className={`p-3 rounded-xl border text-left transition-all flex flex-col justify-between ${
              activeQualityFilter === 'no_phone'
                ? 'bg-amber-100/90 border-amber-400 ring-2 ring-amber-400/30'
                : 'bg-white border-slate-200 hover:border-amber-300 hover:bg-amber-50/40'
            }`}
          >
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold text-slate-700 flex items-center gap-1">
                <PhoneOff className="w-3.5 h-3.5 text-amber-600" /> Sans téléphone
              </span>
              <span className={`text-xs font-bold px-1.5 py-0.5 rounded-full ${stats.noPhoneCount > 0 ? 'bg-amber-100 text-amber-900' : 'bg-slate-100 text-slate-600'}`}>
                {stats.noPhoneCount}
              </span>
            </div>
            <span className="text-[10px] text-slate-500 font-medium mt-1">
              {activeQualityFilter === 'no_phone' ? 'Filtre actif (Cliquer pour fermer)' : 'Filtrer l\'annuaire'}
            </span>
          </button>

          {/* Sans email */}
          <button
            onClick={() => onSelectQualityFilter(activeQualityFilter === 'no_email' ? 'all' : 'no_email')}
            className={`p-3 rounded-xl border text-left transition-all flex flex-col justify-between ${
              activeQualityFilter === 'no_email'
                ? 'bg-amber-100/90 border-amber-400 ring-2 ring-amber-400/30'
                : 'bg-white border-slate-200 hover:border-amber-300 hover:bg-amber-50/40'
            }`}
          >
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold text-slate-700 flex items-center gap-1">
                <MailX className="w-3.5 h-3.5 text-amber-600" /> Sans email
              </span>
              <span className={`text-xs font-bold px-1.5 py-0.5 rounded-full ${stats.noEmailCount > 0 ? 'bg-amber-100 text-amber-900' : 'bg-slate-100 text-slate-600'}`}>
                {stats.noEmailCount}
              </span>
            </div>
            <span className="text-[10px] text-slate-500 font-medium mt-1">
              {activeQualityFilter === 'no_email' ? 'Filtre actif (Cliquer pour fermer)' : 'Filtrer l\'annuaire'}
            </span>
          </button>

          {/* Sans localisation */}
          <button
            onClick={() => onSelectQualityFilter(activeQualityFilter === 'no_location' ? 'all' : 'no_location')}
            className={`p-3 rounded-xl border text-left transition-all flex flex-col justify-between ${
              activeQualityFilter === 'no_location'
                ? 'bg-amber-100/90 border-amber-400 ring-2 ring-amber-400/30'
                : 'bg-white border-slate-200 hover:border-amber-300 hover:bg-amber-50/40'
            }`}
          >
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold text-slate-700 flex items-center gap-1">
                <MapPinOff className="w-3.5 h-3.5 text-amber-600" /> Non géolocalisés
              </span>
              <span className={`text-xs font-bold px-1.5 py-0.5 rounded-full ${stats.noLocationCount > 0 ? 'bg-amber-100 text-amber-900' : 'bg-slate-100 text-slate-600'}`}>
                {stats.noLocationCount}
              </span>
            </div>
            <span className="text-[10px] text-slate-500 font-medium mt-1">
              {activeQualityFilter === 'no_location' ? 'Filtre actif (Cliquer pour fermer)' : 'Filtrer l\'annuaire'}
            </span>
          </button>

          {/* Doublons potentiels */}
          <button
            onClick={() => onSelectQualityFilter(activeQualityFilter === 'duplicates' ? 'all' : 'duplicates')}
            className={`p-3 rounded-xl border text-left transition-all flex flex-col justify-between ${
              activeQualityFilter === 'duplicates'
                ? 'bg-amber-100/90 border-amber-400 ring-2 ring-amber-400/30'
                : 'bg-white border-slate-200 hover:border-amber-300 hover:bg-amber-50/40'
            }`}
          >
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold text-slate-700 flex items-center gap-1">
                <Copy className="w-3.5 h-3.5 text-amber-600" /> Doublons détectés
              </span>
              <span className={`text-xs font-bold px-1.5 py-0.5 rounded-full ${stats.duplicatesCount > 0 ? 'bg-amber-100 text-amber-900' : 'bg-slate-100 text-slate-600'}`}>
                {stats.duplicatesCount}
              </span>
            </div>
            <span className="text-[10px] text-slate-500 font-medium mt-1">
              {activeQualityFilter === 'duplicates' ? 'Filtre actif (Cliquer pour fermer)' : 'Filtrer l\'annuaire'}
            </span>
          </button>
        </div>
      </div>

      {/* Activité récente / Journal d'activité */}
      <div className="bg-slate-50/80 rounded-2xl p-4 border border-slate-200/80 space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Activity className="w-4 h-4 text-emerald-700" />
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-800 font-['Outfit']">
              Activité Récente & Synchronisation
            </h3>
          </div>
          <span className="text-[10px] text-slate-400 font-medium">Temps réel</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
          <div className="bg-white p-3 rounded-xl border border-slate-200/80 flex items-start gap-2.5">
            <span className="p-1.5 rounded-lg bg-emerald-100 text-emerald-800 shrink-0 mt-0.5">
              <CheckCircle2 className="w-3.5 h-3.5" />
            </span>
            <div>
              <p className="font-bold text-slate-900">Synchronisation base de données</p>
              <p className="text-[11px] text-slate-500">
                Annuaire ({stats.totalMembers} membres) & Carte synchronisés.
              </p>
              <span className="text-[9px] text-emerald-700 font-mono mt-1 block">Aujourd'hui, {lastUpdateDate}</span>
            </div>
          </div>

          <div className="bg-white p-3 rounded-xl border border-slate-200/80 flex items-start gap-2.5">
            <span className="p-1.5 rounded-lg bg-emerald-100 text-emerald-800 shrink-0 mt-0.5">
              <Layers className="w-3.5 h-3.5" />
            </span>
            <div>
              <p className="font-bold text-slate-900">Mise à jour des zones MDF</p>
              <p className="text-[11px] text-slate-500">
                {stats.totalZones} zone(s) personnalisée(s) actives (Île-de-France, Bretagne...).
              </p>
              <span className="text-[9px] text-emerald-700 font-mono mt-1 block">Réseau MDF actif</span>
            </div>
          </div>

          <div className="bg-white p-3 rounded-xl border border-slate-200/80 flex items-start gap-2.5">
            <span className="p-1.5 rounded-lg bg-emerald-100 text-emerald-800 shrink-0 mt-0.5">
              <FileSpreadsheet className="w-3.5 h-3.5" />
            </span>
            <div>
              <p className="font-bold text-slate-900">Rapport de qualité des données</p>
              <p className="text-[11px] text-slate-500">
                {totalQualityIssues === 0 ? 'Toutes les fiches sont 100% complètes' : `${totalQualityIssues} fiche(s) nécessitent une attention`}
              </p>
              <span className="text-[9px] text-emerald-700 font-mono mt-1 block">Contrôle de cohérence OK</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
