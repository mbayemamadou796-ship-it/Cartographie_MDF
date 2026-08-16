import React, { useState, useMemo } from 'react';
import { 
  WeeklyReport, CustomZone, ReportingStatus, UserRole, ReportingType, ReportingPriority, Member 
} from '@shared/types';
import { 
  Search, Filter, Calendar, MapPin, AlertTriangle, CheckCircle2, 
  Clock, MessageSquare, Download, HelpCircle, Eye, Trash2, 
  Users, Activity, ChevronRight, ChevronDown, ShieldAlert, Sparkles, PlusCircle,
  LayoutGrid, ListFilter, Layers, Check, ExternalLink, Archive, History, FolderKanban,
  ArrowRight, ShieldCheck, Send, Zap, FileText, BarChart3, UserCheck, Inbox, CheckCheck,
  Folder, FolderOpen
} from 'lucide-react';
import { ReportingWorkflowStepper } from './ReportingWorkflowStepper';
import { PriorityBadge, ReportTypeBadge } from './PriorityBadge';
import { PilotageDashboardView } from './PilotageDashboardView';

export type ReportingSubTab = 
  | 'LISTE'       // Toutes les remontées
  | 'URGENCES'    // Urgences & À traiter
  | 'PIPELINE'    // Suivi des cas / Kanban
  | 'PILOTAGE';   // Statistiques & Pilotage

export type ReportViewMode = 'BY_MONTH' | 'BY_ZONE' | 'FLAT_LIST';

interface AdminReportingViewProps {
  reports: WeeklyReport[];
  customZones: CustomZone[];
  members?: Member[];
  userRole: UserRole;
  onOpenReportDetail: (report: WeeklyReport) => void;
  onUpdateStatus: (reportId: string, status: ReportingStatus, bureauNotes?: string) => void;
  onDeleteReport: (reportId: string) => void;
  onOpenNewReportForm?: () => void;
}

export const AdminReportingView: React.FC<AdminReportingViewProps> = ({
  reports,
  customZones,
  members = [],
  userRole,
  onOpenReportDetail,
  onUpdateStatus,
  onDeleteReport,
  onOpenNewReportForm
}) => {
  // Main Sub-feature Tab
  const [subTab, setSubTab] = useState<ReportingSubTab>('LISTE');

  // Search & Filters
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedZone, setSelectedZone] = useState('ALL');
  const [selectedMonth, setSelectedMonth] = useState('ALL');
  const [typeFilter, setTypeFilter] = useState<'ALL' | ReportingType>('ALL');
  const [statusFilter, setStatusFilter] = useState<'ALL' | ReportingStatus>('ALL');
  const [priorityFilter, setPriorityFilter] = useState<'ALL' | ReportingPriority>('ALL');
  const [besoinRetourFilter, setBesoinRetourFilter] = useState<'ALL' | 'OUI' | 'NON'>('ALL');
  
  // Default to BY_MONTH (Dossiers Mensuels)
  const [viewMode, setViewMode] = useState<ReportViewMode>('BY_MONTH');
  const [collapsedMonths, setCollapsedMonths] = useState<Record<string, boolean>>({});
  const [collapsedZones, setCollapsedZones] = useState<Record<string, boolean>>({});

  // Helper to extract formatted month label from date string
  const getMonthKeyAndLabel = (dateStr?: string) => {
    if (!dateStr) return { key: 'NON_DATE', label: 'Dossier sans date' };
    try {
      const d = new Date(dateStr);
      if (isNaN(d.getTime())) return { key: 'NON_DATE', label: 'Dossier sans date' };
      const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
      const rawLabel = d.toLocaleDateString('fr-FR', { month: 'long', year: 'numeric' });
      const label = rawLabel.charAt(0).toUpperCase() + rawLabel.slice(1);
      return { key, label };
    } catch {
      return { key: 'NON_DATE', label: 'Dossier sans date' };
    }
  };

  // Extract unique months
  const availableMonths = useMemo(() => {
    const monthsMap = new Map<string, string>();
    reports.forEach((r) => {
      const dStr = r.semaineLundi || r.createdAt;
      const { key, label } = getMonthKeyAndLabel(dStr);
      if (key !== 'NON_DATE') {
        monthsMap.set(key, label);
      }
    });

    return Array.from(monthsMap.entries())
      .sort((a, b) => b[0].localeCompare(a[0]))
      .map(([key, label]) => ({ key, label }));
  }, [reports]);

  // Counts for Badges
  const urgentCount = reports.filter((r) => (r.priority === 'URGENT' || r.urgenceLevel >= 4) && r.status !== 'TRAITE').length;
  const newCount = reports.filter((r) => r.status === 'NOUVEAU').length;
  const enCoursCount = reports.filter((r) => r.status === 'EN_COURS').length;
  const traiteCount = reports.filter((r) => r.status === 'TRAITE').length;
  const pendingActionCount = reports.filter((r) => r.status !== 'TRAITE' && (r.besoinRetourBureau || r.priority === 'URGENT' || r.urgenceLevel >= 4)).length;

  // Filtered reports
  const filteredReports = useMemo(() => {
    return reports.filter((r) => {
      // Sub-tab specific pre-filter
      if (subTab === 'URGENCES') {
        const isUrgentOrNeedHelp = (r.priority === 'URGENT' || r.urgenceLevel >= 4 || r.besoinRetourBureau) && r.status !== 'TRAITE';
        if (!isUrgentOrNeedHelp) return false;
      }

      // Search Query
      const q = searchQuery.toLowerCase().trim();
      if (q) {
        const fullText = [
          r.referentName,
          r.zone,
          r.email,
          r.sujet,
          r.caseNumber,
          r.nouveauxContactes,
          r.situationsPrioritaires,
          r.activitesLocales,
          r.detailsDemandeRetour,
          r.bureauNotes
        ]
          .filter(Boolean)
          .join(' ')
          .toLowerCase();

        if (!fullText.includes(q)) return false;
      }

      // Zone filter
      if (selectedZone !== 'ALL' && r.zone?.toLowerCase() !== selectedZone.toLowerCase()) {
        return false;
      }

      // Month filter
      if (selectedMonth !== 'ALL') {
        const dStr = r.semaineLundi || r.createdAt;
        const { key } = getMonthKeyAndLabel(dStr);
        if (key !== selectedMonth) return false;
      }

      // Type filter
      if (typeFilter !== 'ALL' && (r.type || 'PERIODIQUE') !== typeFilter) {
        return false;
      }

      // Status filter
      if (statusFilter !== 'ALL' && r.status !== statusFilter) {
        return false;
      }

      // Priority filter
      if (priorityFilter !== 'ALL') {
        const currentPriority = r.priority || (r.urgenceLevel >= 4 ? 'URGENT' : r.urgenceLevel === 3 ? 'IMPORTANT' : 'NORMAL');
        if (currentPriority !== priorityFilter) return false;
      }

      // Besoin retour Bureau
      if (besoinRetourFilter === 'OUI' && !r.besoinRetourBureau) return false;
      if (besoinRetourFilter === 'NON' && r.besoinRetourBureau) return false;

      return true;
    });
  }, [reports, subTab, searchQuery, selectedZone, selectedMonth, typeFilter, statusFilter, priorityFilter, besoinRetourFilter]);

  // Grouped by Month (Dossiers Mensuels)
  const groupedByMonth = useMemo(() => {
    const groups: Record<string, { label: string; key: string; reports: WeeklyReport[] }> = {};

    filteredReports.forEach((r) => {
      const dStr = r.semaineLundi || r.createdAt;
      const { key, label } = getMonthKeyAndLabel(dStr);
      if (!groups[key]) {
        groups[key] = {
          key,
          label,
          reports: []
        };
      }
      groups[key].reports.push(r);
    });

    // Sort reports inside each month (newest first)
    Object.values(groups).forEach((g) => {
      g.reports.sort((a, b) => {
        return (b.semaineLundi || '').localeCompare(a.semaineLundi || '') ||
               (b.createdAt || '').localeCompare(a.createdAt || '');
      });
    });

    // Sort months descending (e.g. 2026-08 before 2026-07)
    return Object.values(groups).sort((a, b) => b.key.localeCompare(a.key));
  }, [filteredReports]);

  // Grouped by Zone
  const groupedByZone = useMemo(() => {
    const groups: Record<string, WeeklyReport[]> = {};

    filteredReports.forEach((r) => {
      const zName = r.zone || 'Zone non définie';
      if (!groups[zName]) {
        groups[zName] = [];
      }
      groups[zName].push(r);
    });

    Object.keys(groups).forEach((zKey) => {
      groups[zKey].sort((a, b) => {
        return (b.semaineLundi || '').localeCompare(a.semaineLundi || '') ||
               (b.createdAt || '').localeCompare(a.createdAt || '');
      });
    });

    return Object.entries(groups).sort(([a], [b]) => a.localeCompare(b));
  }, [filteredReports]);

  const toggleMonthCollapse = (monthKey: string) => {
    setCollapsedMonths((prev) => ({
      ...prev,
      [monthKey]: !prev[monthKey]
    }));
  };

  const toggleZoneCollapse = (zoneName: string) => {
    setCollapsedZones((prev) => ({
      ...prev,
      [zoneName]: !prev[zoneName]
    }));
  };

  const hasActiveFilters = searchQuery !== '' || selectedZone !== 'ALL' || selectedMonth !== 'ALL' || typeFilter !== 'ALL' || statusFilter !== 'ALL' || priorityFilter !== 'ALL' || besoinRetourFilter !== 'ALL';

  const resetFilters = () => {
    setSearchQuery('');
    setSelectedZone('ALL');
    setSelectedMonth('ALL');
    setTypeFilter('ALL');
    setStatusFilter('ALL');
    setPriorityFilter('ALL');
    setBesoinRetourFilter('ALL');
  };

  // Render a Single Clean Report Card
  const renderReportCard = (report: WeeklyReport) => {
    const isUrgent = report.priority === 'URGENT' || report.urgenceLevel >= 4;
    const isPonctuel = report.type === 'PONCTUEL';
    const repliesCount = report.reponses?.length || 0;

    return (
      <div
        key={report.id}
        className={`bg-white rounded-2xl p-5 border transition-all hover:shadow-md ${
          isUrgent && report.status !== 'TRAITE'
            ? 'border-red-200 bg-red-50/10'
            : report.status === 'TRAITE'
            ? 'border-slate-200/90'
            : 'border-slate-200 hover:border-emerald-300'
        }`}
      >
        <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
          
          {/* Main Info */}
          <div className="space-y-2 flex-1">
            {/* Top Badges */}
            <div className="flex flex-wrap items-center gap-2">
              <span className="font-mono text-xs font-black px-2.5 py-0.5 rounded-lg bg-slate-100 text-slate-800">
                {report.caseNumber || `#${report.id.slice(-4)}`}
              </span>

              <span className="text-xs font-bold px-2.5 py-0.5 rounded-lg bg-emerald-50 text-emerald-800 border border-emerald-200/60 flex items-center gap-1">
                <MapPin className="w-3 h-3 text-emerald-600" />
                <span>Zone {report.zone}</span>
              </span>

              <ReportTypeBadge type={report.type || 'PERIODIQUE'} />
              <PriorityBadge priority={report.priority} urgenceLevel={report.urgenceLevel} />

              {/* Status Pill */}
              <span className={`text-xs font-bold px-2.5 py-0.5 rounded-lg flex items-center gap-1.5 ${
                report.status === 'TRAITE'
                  ? 'bg-emerald-100 text-emerald-800'
                  : report.status === 'EN_COURS'
                  ? 'bg-amber-100 text-amber-900'
                  : 'bg-blue-100 text-blue-900'
              }`}>
                <span className={`w-1.5 h-1.5 rounded-full ${
                  report.status === 'TRAITE' ? 'bg-emerald-600' : report.status === 'EN_COURS' ? 'bg-amber-600' : 'bg-blue-600'
                }`} />
                {report.status === 'TRAITE' ? 'Traité & Clôturé' : report.status === 'EN_COURS' ? 'En cours' : 'Nouveau'}
              </span>

              {report.semaineLundi && (
                <span className="text-xs font-medium text-slate-500 flex items-center gap-1">
                  <Calendar className="w-3 h-3 text-slate-400" />
                  <span>Semaine du {report.semaineLundi}</span>
                </span>
              )}
            </div>

            {/* Sujet & Content */}
            <div>
              <h3 className="text-sm font-extrabold text-slate-900 leading-snug">
                {report.sujet || (isPonctuel ? 'Signalement ponctuel' : `Compte-rendu d'activité hebdomadaire`)}
              </h3>
              
              {report.situationsPrioritaires && (
                <p className="text-xs text-slate-700 mt-1 line-clamp-2 bg-slate-50 p-2.5 rounded-xl border border-slate-100 font-medium">
                  {report.situationsPrioritaires}
                </p>
              )}

              {report.detailsDemandeRetour && (
                <div className="mt-2 bg-amber-50/80 p-2.5 rounded-xl border border-amber-200/80 text-xs text-amber-950 font-medium flex items-start gap-1.5">
                  <HelpCircle className="w-3.5 h-3.5 text-amber-600 shrink-0 mt-0.5" />
                  <div>
                    <strong className="font-bold">Demande au Bureau :</strong> {report.detailsDemandeRetour}
                  </div>
                </div>
              )}

              {report.bureauNotes && (
                <div className="mt-2 bg-emerald-50/80 p-2.5 rounded-xl border border-emerald-200 text-xs text-emerald-950 flex items-start gap-1.5">
                  <MessageSquare className="w-3.5 h-3.5 text-emerald-700 shrink-0 mt-0.5" />
                  <div>
                    <strong className="font-bold">Dernier retour Bureau :</strong> {report.bureauNotes}
                    {report.reviewedBy && <span className="text-[10px] text-emerald-700 ml-1">({report.reviewedBy})</span>}
                  </div>
                </div>
              )}
            </div>

            {/* Footer Metadata */}
            <div className="flex flex-wrap items-center gap-4 text-xs text-slate-500 pt-1">
              <span>Transmis par : <strong className="text-slate-800 font-bold">{report.referentName}</strong></span>
              <span>Reçu le : {new Date(report.createdAt).toLocaleDateString('fr-FR')}</span>
              {report.responsableName && (
                <span className="text-indigo-800 font-bold bg-indigo-50 px-2 py-0.5 rounded-md border border-indigo-100">
                  Assigné à : {report.responsableName}
                </span>
              )}
            </div>
          </div>

          {/* Right Action Block */}
          <div className="flex md:flex-col items-end justify-between gap-3 shrink-0 pt-2 md:pt-0 border-t md:border-t-0 border-slate-100">
            {/* Quick Status Buttons */}
            <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl">
              <button
                onClick={() => onUpdateStatus(report.id, 'NOUVEAU')}
                className={`px-2 py-1 rounded-lg text-[10px] font-bold transition ${
                  report.status === 'NOUVEAU' ? 'bg-white text-blue-900 shadow-2xs' : 'text-slate-600 hover:text-slate-900'
                }`}
                title="Marquer comme Nouveau"
              >
                Nouveau
              </button>
              <button
                onClick={() => onUpdateStatus(report.id, 'EN_COURS')}
                className={`px-2 py-1 rounded-lg text-[10px] font-bold transition ${
                  report.status === 'EN_COURS' ? 'bg-white text-amber-900 shadow-2xs' : 'text-slate-600 hover:text-slate-900'
                }`}
                title="Marquer En cours"
              >
                En cours
              </button>
              <button
                onClick={() => onUpdateStatus(report.id, 'TRAITE')}
                className={`px-2 py-1 rounded-lg text-[10px] font-bold transition ${
                  report.status === 'TRAITE' ? 'bg-emerald-700 text-white shadow-2xs' : 'text-slate-600 hover:text-slate-900'
                }`}
                title="Clôturer le dossier"
              >
                Traité ✓
              </button>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => onOpenReportDetail(report)}
                className="px-3.5 py-1.5 bg-slate-900 hover:bg-emerald-800 text-white rounded-xl text-xs font-bold transition flex items-center gap-1.5 shadow-2xs cursor-pointer"
              >
                <Eye className="w-3.5 h-3.5" />
                <span>{repliesCount > 0 ? `Dossier (${repliesCount} rép.)` : 'Ouvrir & Répondre'}</span>
              </button>

              <button
                onClick={() => {
                  if (window.confirm('Voulez-vous supprimer ce reporting ?')) {
                    onDeleteReport(report.id);
                  }
                }}
                className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition"
                title="Supprimer"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          </div>

        </div>
      </div>
    );
  };

  return (
    <div className="space-y-6">
      
      {/* Sub-features Navigation Bar */}
      <div className="bg-white rounded-2xl border border-slate-200/80 p-2 shadow-2xs">
        <div className="flex items-center justify-between gap-2 overflow-x-auto scrollbar-none">
          <div className="flex items-center gap-1.5 sm:gap-2">
            
            {/* 1. Toutes les remontées */}
            <button
              onClick={() => setSubTab('LISTE')}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap cursor-pointer ${
                subTab === 'LISTE'
                  ? 'bg-slate-900 text-white shadow-sm'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
              }`}
            >
              <Inbox className="w-4 h-4" />
              <span>Toutes les Remontées</span>
              <span className={`text-[10px] font-black px-1.5 py-0.5 rounded-full ${
                subTab === 'LISTE' ? 'bg-slate-800 text-slate-200' : 'bg-slate-100 text-slate-700'
              }`}>
                {reports.length}
              </span>
            </button>

            {/* 2. Urgences & À traiter */}
            <button
              onClick={() => setSubTab('URGENCES')}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap cursor-pointer ${
                subTab === 'URGENCES'
                  ? 'bg-red-600 text-white shadow-sm'
                  : 'text-slate-600 hover:text-red-700 hover:bg-red-50'
              }`}
            >
              <AlertTriangle className="w-4 h-4" />
              <span>Urgences & Arbitrages</span>
              {pendingActionCount > 0 && (
                <span className={`text-[10px] font-black px-1.5 py-0.5 rounded-full ${
                  subTab === 'URGENCES' ? 'bg-red-800 text-white' : 'bg-red-100 text-red-700 animate-pulse'
                }`}>
                  {pendingActionCount}
                </span>
              )}
            </button>

            {/* 3. Pipeline / Suivi des cas */}
            <button
              onClick={() => setSubTab('PIPELINE')}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap cursor-pointer ${
                subTab === 'PIPELINE'
                  ? 'bg-indigo-900 text-white shadow-sm'
                  : 'text-slate-600 hover:text-indigo-900 hover:bg-indigo-50'
              }`}
            >
              <FolderKanban className="w-4 h-4" />
              <span>Suivi & Workflows</span>
            </button>

            {/* 4. Pilotage & Statistiques */}
            <button
              onClick={() => setSubTab('PILOTAGE')}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap cursor-pointer ${
                subTab === 'PILOTAGE'
                  ? 'bg-emerald-800 text-white shadow-sm'
                  : 'text-slate-600 hover:text-emerald-900 hover:bg-emerald-50'
              }`}
            >
              <BarChart3 className="w-4 h-4" />
              <span>Tableau de Pilotage</span>
            </button>
          </div>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* SUBTAB 1 & 2: LISTE & URGENCES */}
      {/* ========================================================================= */}
      {(subTab === 'LISTE' || subTab === 'URGENCES') && (
        <div className="space-y-4">
          
          {/* Quick Filter Bar */}
          <div className="bg-white rounded-2xl border border-slate-200/80 p-4 shadow-2xs space-y-3">
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3">
              
              {/* Search Bar */}
              <div className="relative flex-1 min-w-[240px]">
                <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Rechercher par référent, zone, sujet, mot-clé..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-emerald-600 focus:bg-white transition font-medium"
                />
              </div>

              {/* Dropdowns */}
              <div className="flex flex-wrap items-center gap-2">
                {/* Zone Filter */}
                <select
                  value={selectedZone}
                  onChange={(e) => setSelectedZone(e.target.value)}
                  className="py-2 px-3 text-xs bg-slate-50 border border-slate-200 rounded-xl text-slate-700 font-medium focus:outline-none focus:border-emerald-600"
                >
                  <option value="ALL">Toutes les zones</option>
                  {customZones.map((z) => (
                    <option key={z.id} value={z.name}>Zone : {z.name}</option>
                  ))}
                </select>

                {/* Month Filter */}
                <select
                  value={selectedMonth}
                  onChange={(e) => setSelectedMonth(e.target.value)}
                  className="py-2 px-3 text-xs bg-slate-50 border border-slate-200 rounded-xl text-slate-700 font-medium focus:outline-none focus:border-emerald-600"
                >
                  <option value="ALL">Tous les mois</option>
                  {availableMonths.map((m) => (
                    <option key={m.key} value={m.key}>{m.label}</option>
                  ))}
                </select>

                {/* Status Filter */}
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value as any)}
                  className="py-2 px-3 text-xs bg-slate-50 border border-slate-200 rounded-xl text-slate-700 font-medium focus:outline-none focus:border-emerald-600"
                >
                  <option value="ALL">Tous les statuts</option>
                  <option value="NOUVEAU">Nouveau</option>
                  <option value="EN_COURS">En cours</option>
                  <option value="TRAITE">Traité & Clôturé</option>
                </select>

                {/* Type Filter */}
                <select
                  value={typeFilter}
                  onChange={(e) => setTypeFilter(e.target.value as any)}
                  className="py-2 px-3 text-xs bg-slate-50 border border-slate-200 rounded-xl text-slate-700 font-medium focus:outline-none focus:border-emerald-600"
                >
                  <option value="ALL">Tous types</option>
                  <option value="PERIODIQUE">Périodique</option>
                  <option value="PONCTUEL">Cas ponctuel</option>
                </select>

                {/* View Mode Toggle: Dossiers par Mois (Default) / Par Zone / Liste plate */}
                <div className="flex items-center bg-slate-100 p-1 rounded-xl border border-slate-200">
                  <button
                    type="button"
                    onClick={() => setViewMode('BY_MONTH')}
                    className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-bold transition cursor-pointer ${
                      viewMode === 'BY_MONTH' ? 'bg-white text-emerald-950 shadow-2xs' : 'text-slate-500 hover:text-slate-800'
                    }`}
                    title="Regrouper en dossiers mensuels"
                  >
                    <Folder className="w-3.5 h-3.5 text-amber-600" />
                    <span className="hidden sm:inline">Dossiers Mois</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setViewMode('BY_ZONE')}
                    className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-bold transition cursor-pointer ${
                      viewMode === 'BY_ZONE' ? 'bg-white text-emerald-950 shadow-2xs' : 'text-slate-500 hover:text-slate-800'
                    }`}
                    title="Regrouper par zone / antenne"
                  >
                    <Layers className="w-3.5 h-3.5 text-emerald-600" />
                    <span className="hidden sm:inline">Par Zone</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setViewMode('FLAT_LIST')}
                    className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-bold transition cursor-pointer ${
                      viewMode === 'FLAT_LIST' ? 'bg-white text-emerald-950 shadow-2xs' : 'text-slate-500 hover:text-slate-800'
                    }`}
                    title="Liste chronologique continue"
                  >
                    <ListFilter className="w-3.5 h-3.5 text-slate-600" />
                    <span className="hidden sm:inline">Liste</span>
                  </button>
                </div>

              </div>
            </div>

            {/* Active Filters feedback */}
            <div className="flex items-center justify-between pt-2 border-t border-slate-100 text-xs text-slate-500">
              <span>
                <strong className="text-slate-800 font-bold">{filteredReports.length}</strong> dossier{filteredReports.length > 1 ? 's' : ''} au total
                {subTab === 'URGENCES' && ' (Filtre Urgences actif)'}
                {viewMode === 'BY_MONTH' && ` • Réparti en ${groupedByMonth.length} dossier${groupedByMonth.length > 1 ? 's' : ''} mensuel${groupedByMonth.length > 1 ? 's' : ''}`}
              </span>
              {hasActiveFilters && (
                <button
                  onClick={resetFilters}
                  className="text-emerald-700 hover:underline font-bold cursor-pointer"
                >
                  Réinitialiser les filtres
                </button>
              )}
            </div>
          </div>

          {/* Main List Rendering */}
          {filteredReports.length === 0 ? (
            <div className="bg-white rounded-2xl border border-dashed border-slate-300 p-12 text-center space-y-2">
              <Inbox className="w-10 h-10 text-slate-300 mx-auto" />
              <h4 className="text-sm font-bold text-slate-700">Aucun dossier correspondant</h4>
              <p className="text-xs text-slate-400">Modifiez vos critères de recherche ou réinitialisez les filtres.</p>
              {hasActiveFilters && (
                <button
                  onClick={resetFilters}
                  className="mt-2 px-3 py-1.5 bg-slate-900 text-white rounded-xl text-xs font-bold"
                >
                  Effacer les filtres
                </button>
              )}
            </div>
          ) : viewMode === 'BY_MONTH' ? (
            /* ========================================================================= */
            /* 📁 GROUPED IN MONTHLY FOLDERS (DOSSIERS PAR MOIS) */
            /* ========================================================================= */
            <div className="space-y-4">
              {groupedByMonth.map((monthGroup) => {
                const isCollapsed = !!collapsedMonths[monthGroup.key];
                const monthUrgentCount = monthGroup.reports.filter(r => (r.priority === 'URGENT' || r.urgenceLevel >= 4) && r.status !== 'TRAITE').length;
                const monthNeedBureauCount = monthGroup.reports.filter(r => r.besoinRetourBureau && r.status !== 'TRAITE').length;
                const monthNewCount = monthGroup.reports.filter(r => r.status === 'NOUVEAU').length;
                const monthTraiteCount = monthGroup.reports.filter(r => r.status === 'TRAITE').length;
                const resolutionRate = monthGroup.reports.length > 0 
                  ? Math.round((monthTraiteCount / monthGroup.reports.length) * 100) 
                  : 0;

                return (
                  <div 
                    key={monthGroup.key} 
                    className="bg-slate-50/90 rounded-2xl border border-slate-200/90 shadow-2xs overflow-hidden transition-all"
                  >
                    {/* Folder Header Card */}
                    <div
                      onClick={() => toggleMonthCollapse(monthGroup.key)}
                      className="p-4 sm:p-5 bg-white border-b border-slate-200/80 cursor-pointer hover:bg-slate-50/60 transition flex flex-col md:flex-row md:items-center md:justify-between gap-3 select-none"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-amber-500 to-amber-600 text-white flex items-center justify-center shadow-xs shrink-0">
                          {isCollapsed ? (
                            <Folder className="w-6 h-6" />
                          ) : (
                            <FolderOpen className="w-6 h-6" />
                          )}
                        </div>
                        <div>
                          <div className="flex flex-wrap items-center gap-2">
                            <h3 className="text-base font-extrabold text-slate-900">
                              Dossier Mensuel — {monthGroup.label}
                            </h3>
                            <span className="px-2.5 py-0.5 bg-amber-100 text-amber-900 font-extrabold text-xs rounded-full border border-amber-200">
                              {monthGroup.reports.length} remontée{monthGroup.reports.length > 1 ? 's' : ''}
                            </span>
                          </div>

                          <div className="flex flex-wrap items-center gap-3 text-xs text-slate-500 mt-1">
                            <span>Taux de résolution : <strong className="text-slate-800 font-bold">{resolutionRate}%</strong> ({monthTraiteCount}/{monthGroup.reports.length})</span>
                            <span>•</span>
                            <span>Dernière activité : {new Date(monthGroup.reports[0].createdAt).toLocaleDateString('fr-FR')}</span>
                          </div>
                        </div>
                      </div>

                      {/* Folder Badges & Toggle Button */}
                      <div className="flex items-center flex-wrap gap-2 self-end md:self-auto">
                        {monthNewCount > 0 && (
                          <span className="px-2.5 py-1 bg-blue-100 text-blue-900 text-xs font-bold rounded-xl border border-blue-200">
                            {monthNewCount} nouveau{monthNewCount > 1 ? 'x' : ''}
                          </span>
                        )}

                        {monthNeedBureauCount > 0 && (
                          <span className="px-2.5 py-1 bg-amber-100 text-amber-900 text-xs font-bold rounded-xl border border-amber-300 flex items-center gap-1">
                            <HelpCircle className="w-3 h-3 text-amber-700" />
                            <span>{monthNeedBureauCount} attente bureau</span>
                          </span>
                        )}

                        {monthUrgentCount > 0 && (
                          <span className="px-2.5 py-1 bg-red-100 text-red-900 text-xs font-bold rounded-xl border border-red-300 flex items-center gap-1 animate-pulse">
                            <AlertTriangle className="w-3 h-3 text-red-700" />
                            <span>{monthUrgentCount} urgent</span>
                          </span>
                        )}

                        <button
                          type="button"
                          className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-xl transition ml-1"
                        >
                          {isCollapsed ? <ChevronRight className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
                        </button>
                      </div>
                    </div>

                    {/* Folder Content: Reports of the Month */}
                    {!isCollapsed && (
                      <div className="p-4 space-y-3">
                        {monthGroup.reports.map((report) => renderReportCard(report))}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          ) : viewMode === 'BY_ZONE' ? (
            /* ========================================================================= */
            /* 📍 GROUPED BY ZONE */
            /* ========================================================================= */
            <div className="space-y-4">
              {groupedByZone.map(([zoneName, zoneReports]) => {
                const isCollapsed = !!collapsedZones[zoneName];
                const zoneUrgent = zoneReports.filter(r => (r.priority === 'URGENT' || r.urgenceLevel >= 4) && r.status !== 'TRAITE').length;

                return (
                  <div key={zoneName} className="bg-slate-50/70 rounded-2xl border border-slate-200 p-4 space-y-3">
                    <div
                      onClick={() => toggleZoneCollapse(zoneName)}
                      className="flex items-center justify-between bg-white p-3.5 rounded-xl border border-slate-200 shadow-2xs cursor-pointer hover:border-emerald-300 transition select-none"
                    >
                      <div className="flex items-center gap-2.5">
                        <div className="w-8 h-8 rounded-lg bg-emerald-700 text-white flex items-center justify-center font-bold text-xs">
                          📍
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <h3 className="text-sm font-bold text-slate-900">Zone {zoneName}</h3>
                            <span className="text-[10px] font-bold bg-slate-100 text-slate-700 px-2 py-0.5 rounded-full">
                              {zoneReports.length} dossier{zoneReports.length > 1 ? 's' : ''}
                            </span>
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        {zoneUrgent > 0 && (
                          <span className="text-[10px] font-bold bg-red-100 text-red-700 px-2 py-0.5 rounded-md">
                            {zoneUrgent} urgent
                          </span>
                        )}
                        <button className="p-1 text-slate-400">
                          {isCollapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                        </button>
                      </div>
                    </div>

                    {!isCollapsed && (
                      <div className="space-y-3 pt-1">
                        {zoneReports.map((report) => renderReportCard(report))}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          ) : (
            /* ========================================================================= */
            /* 📋 FLAT CHRONOLOGICAL LIST */
            /* ========================================================================= */
            <div className="space-y-3">
              {filteredReports.map((report) => renderReportCard(report))}
            </div>
          )}
        </div>
      )}

      {/* ========================================================================= */}
      {/* SUBTAB 3: SUIVI DES CAS (PIPELINE KANBAN) */}
      {/* ========================================================================= */}
      {subTab === 'PIPELINE' && (
        <div className="space-y-4">
          <div className="bg-white rounded-2xl border border-slate-200/80 p-4 shadow-2xs flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <div>
              <h2 className="text-sm font-black text-slate-900">Pipeline de Traitement & Workflows</h2>
              <p className="text-xs text-slate-500">Visualisez les statuts de chaque dossier et changez leur état d'un clic</p>
            </div>
            <div className="flex items-center gap-2 text-xs font-bold text-slate-600">
              <span>{reports.length} dossiers au total</span>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
            {/* 1. NOUVEAUX */}
            <div className="bg-slate-50 rounded-2xl p-4 border border-blue-200/80 space-y-3">
              <div className="flex items-center justify-between px-2 py-1">
                <span className="font-extrabold text-xs text-blue-900 uppercase tracking-wider flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-blue-600" />
                  Nouveaux dossiers ({newCount})
                </span>
              </div>

              <div className="space-y-3">
                {reports.filter(r => r.status === 'NOUVEAU').map(report => (
                  <div
                    key={report.id}
                    onClick={() => onOpenReportDetail(report)}
                    className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs hover:border-blue-300 hover:shadow-xs transition cursor-pointer space-y-2"
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-mono font-bold text-xs text-slate-800">{report.caseNumber || `#${report.id.slice(-4)}`}</span>
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-slate-100 text-slate-700">
                        Zone {report.zone}
                      </span>
                    </div>

                    <h4 className="text-xs font-bold text-slate-900 line-clamp-2">{report.sujet}</h4>
                    <p className="text-[11px] text-slate-500 line-clamp-2">{report.detailsDemandeRetour || report.situationsPrioritaires}</p>

                    <div className="pt-2 border-t border-slate-100 flex items-center justify-between" onClick={(e) => e.stopPropagation()}>
                      <span className="text-[10px] text-slate-400">
                        {new Date(report.createdAt).toLocaleDateString('fr-FR')}
                      </span>
                      <button
                        onClick={() => onUpdateStatus(report.id, 'EN_COURS')}
                        className="px-2.5 py-1 bg-amber-50 hover:bg-amber-100 text-amber-900 rounded-lg text-[10px] font-bold transition"
                      >
                        Prendre en charge →
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* 2. EN COURS */}
            <div className="bg-slate-50 rounded-2xl p-4 border border-amber-200/80 space-y-3">
              <div className="flex items-center justify-between px-2 py-1">
                <span className="font-extrabold text-xs text-amber-900 uppercase tracking-wider flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-amber-500" />
                  En cours de traitement ({enCoursCount})
                </span>
              </div>

              <div className="space-y-3">
                {reports.filter(r => r.status === 'EN_COURS').map(report => (
                  <div
                    key={report.id}
                    onClick={() => onOpenReportDetail(report)}
                    className="bg-white p-4 rounded-xl border border-amber-200 shadow-2xs hover:border-amber-400 hover:shadow-xs transition cursor-pointer space-y-2"
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-mono font-bold text-xs text-slate-800">{report.caseNumber || `#${report.id.slice(-4)}`}</span>
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-amber-50 text-amber-900">
                        Zone {report.zone}
                      </span>
                    </div>

                    <h4 className="text-xs font-bold text-slate-900 line-clamp-2">{report.sujet}</h4>

                    <div className="pt-2 border-t border-slate-100 flex items-center justify-between" onClick={(e) => e.stopPropagation()}>
                      <button
                        onClick={() => onUpdateStatus(report.id, 'NOUVEAU')}
                        className="text-[10px] text-slate-500 hover:underline"
                      >
                        ← Retour nouveau
                      </button>
                      <button
                        onClick={() => onUpdateStatus(report.id, 'TRAITE')}
                        className="px-2.5 py-1 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-[10px] font-bold transition"
                      >
                        Clôturer ✓
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* 3. TRAITES & CLOTURES */}
            <div className="bg-slate-50 rounded-2xl p-4 border border-emerald-200/80 space-y-3">
              <div className="flex items-center justify-between px-2 py-1">
                <span className="font-extrabold text-xs text-emerald-900 uppercase tracking-wider flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-600" />
                  Traités & Clôturés ({traiteCount})
                </span>
              </div>

              <div className="space-y-3">
                {reports.filter(r => r.status === 'TRAITE').map(report => (
                  <div
                    key={report.id}
                    onClick={() => onOpenReportDetail(report)}
                    className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs hover:border-emerald-300 hover:shadow-xs transition cursor-pointer space-y-2 opacity-90 hover:opacity-100"
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-mono font-bold text-xs text-slate-800">{report.caseNumber || `#${report.id.slice(-4)}`}</span>
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-emerald-50 text-emerald-800 flex items-center gap-1">
                        <CheckCircle2 className="w-3 h-3 text-emerald-600" /> Traité
                      </span>
                    </div>

                    <h4 className="text-xs font-bold text-slate-900 line-clamp-2">{report.sujet}</h4>
                    
                    <div className="pt-2 border-t border-slate-100 flex items-center justify-between" onClick={(e) => e.stopPropagation()}>
                      <span className="text-[10px] text-slate-400">
                        {report.reponses?.length || 0} réponse(s)
                      </span>
                      <button
                        onClick={() => onUpdateStatus(report.id, 'EN_COURS')}
                        className="text-[10px] text-slate-500 hover:text-amber-700 hover:underline"
                      >
                        Rouvrir dossier
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* SUBTAB 4: PILOTAGE & STATISTIQUES */}
      {/* ========================================================================= */}
      {subTab === 'PILOTAGE' && (
        <div className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-2xs">
          <PilotageDashboardView
            reports={reports}
            customZones={customZones}
            members={members}
            userRole={userRole}
            onOpenReportDetail={onOpenReportDetail}
          />
        </div>
      )}

    </div>
  );
};
