import React, { useState, useMemo } from 'react';
import { WeeklyReport, CustomZone, ReportingStatus, ReportingPriority, ReportingType, UserRole, Member } from '@shared/types';
import { ReportingService, PilotageStatsResult } from '../../services/reportingService';
import { 
  CustomBarChartComparison, 
  CustomHorizontalBarChart, 
  CustomDonutChart, 
  CustomAreaChart 
} from './ReportingCharts';
import { 
  Activity, TrendingUp, CheckCircle2, Clock, AlertTriangle, Users, 
  MapPin, ShieldAlert, Zap, Filter, Calendar, Award, Sparkles, HelpCircle, 
  ArrowUpRight, BarChart3, PieChart as PieIcon, Layers, ChevronDown, Check,
  Info, RefreshCw, Send, ArrowRight, Eye, Search, X, FolderKanban, MessageSquare,
  ChevronRight, CornerDownRight, CheckCheck, UserCheck
} from 'lucide-react';
import { PriorityBadge, ReportTypeBadge } from './PriorityBadge';
import { ReportingWorkflowStepper } from './ReportingWorkflowStepper';

export type ActiveKpiType = 
  | 'ALL_REMONTEES'
  | 'CAS_REMONTES'
  | 'CAS_TRAITES'
  | 'CAS_EN_COURS'
  | 'TAUX_TRAITEMENT'
  | 'DELAI_REPONSE'
  | 'DELAI_TRAITEMENT'
  | 'REGULARITE'
  | 'CAS_OUVERTS'
  | 'CAS_TRAITES_IND'
  | 'CAS_URGENTS'
  | null;

interface PilotageDashboardViewProps {
  reports: WeeklyReport[];
  customZones: CustomZone[];
  members?: Member[];
  userRole: UserRole;
  onOpenReportDetail?: (report: WeeklyReport) => void;
  onFilterZone?: (zoneName: string) => void;
  onFilterStatus?: (status: ReportingStatus) => void;
  onFilterPriority?: (priority: ReportingPriority) => void;
  onFilterType?: (type: ReportingType) => void;
  onNavigateToCasManagement?: () => void;
}

export const PilotageDashboardView: React.FC<PilotageDashboardViewProps> = ({
  reports,
  customZones,
  members = [],
  userRole,
  onOpenReportDetail,
  onFilterZone,
  onFilterStatus,
  onFilterPriority,
  onFilterType,
  onNavigateToCasManagement
}) => {
  // Multidimensional Filters
  const [selectedPeriod, setSelectedPeriod] = useState<'ALL' | 'THIS_MONTH' | 'LAST_MONTH' | 'THIS_QUARTER' | 'THIS_YEAR'>('ALL');
  const [selectedMonth, setSelectedMonth] = useState<string>('ALL');
  const [selectedZone, setSelectedZone] = useState<string>('ALL');
  const [selectedReferent, setSelectedReferent] = useState<string>('ALL');
  const [selectedStatus, setSelectedStatus] = useState<string>('ALL');
  const [selectedUrgence, setSelectedUrgence] = useState<string>('ALL');
  const [selectedType, setSelectedType] = useState<string>('ALL');

  // Interactive Dynamic KPI Selection
  const [activeKpi, setActiveKpi] = useState<ActiveKpiType>(null);
  const [focusSearch, setFocusSearch] = useState('');

  // Extract unique available months
  const availableMonths = useMemo(() => {
    const monthsMap = new Map<string, string>();
    reports.forEach((r) => {
      const dStr = r.createdAt || r.semaineLundi;
      if (dStr) {
        try {
          const d = new Date(dStr);
          if (!isNaN(d.getTime())) {
            const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
            const label = d.toLocaleDateString('fr-FR', { month: 'long', year: 'numeric' });
            const capitalized = label.charAt(0).toUpperCase() + label.slice(1);
            monthsMap.set(key, capitalized);
          }
        } catch {}
      }
    });

    return Array.from(monthsMap.entries())
      .sort((a, b) => b[0].localeCompare(a[0]))
      .map(([key, label]) => ({ key, label }));
  }, [reports]);

  // Extract unique referents
  const availableReferents = useMemo(() => {
    const set = new Set<string>();
    reports.forEach((r) => {
      if (r.referentName) set.add(r.referentName);
    });
    return Array.from(set).sort();
  }, [reports]);

  // Filtered reports according to all selected filters
  const filteredReports = useMemo(() => {
    return reports.filter((r) => {
      const reportDate = new Date(r.createdAt || r.semaineLundi);
      const now = new Date();

      // Month specific filter
      if (selectedMonth !== 'ALL') {
        const monthKey = `${reportDate.getFullYear()}-${String(reportDate.getMonth() + 1).padStart(2, '0')}`;
        if (monthKey !== selectedMonth) return false;
      }

      // Period filter
      if (selectedPeriod === 'THIS_MONTH') {
        if (reportDate.getMonth() !== now.getMonth() || reportDate.getFullYear() !== now.getFullYear()) {
          return false;
        }
      } else if (selectedPeriod === 'LAST_MONTH') {
        const lastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
        if (reportDate.getMonth() !== lastMonth.getMonth() || reportDate.getFullYear() !== lastMonth.getFullYear()) {
          return false;
        }
      } else if (selectedPeriod === 'THIS_QUARTER') {
        const currentQuarter = Math.floor(now.getMonth() / 3);
        const reportQuarter = Math.floor(reportDate.getMonth() / 3);
        if (currentQuarter !== reportQuarter || reportDate.getFullYear() !== now.getFullYear()) {
          return false;
        }
      } else if (selectedPeriod === 'THIS_YEAR') {
        if (reportDate.getFullYear() !== now.getFullYear()) return false;
      }

      // Zone
      if (selectedZone !== 'ALL' && r.zone?.toLowerCase() !== selectedZone.toLowerCase()) {
        return false;
      }

      // Referent
      if (selectedReferent !== 'ALL' && r.referentName?.toLowerCase() !== selectedReferent.toLowerCase()) {
        return false;
      }

      // Status
      if (selectedStatus !== 'ALL' && r.status !== selectedStatus) {
        return false;
      }

      // Urgence / Priorité
      if (selectedUrgence !== 'ALL') {
        const prio = r.priority || (r.urgenceLevel >= 4 ? 'URGENT' : r.urgenceLevel === 3 ? 'IMPORTANT' : 'NORMAL');
        if (prio !== selectedUrgence) return false;
      }

      // Type
      if (selectedType !== 'ALL' && (r.type || 'PERIODIQUE') !== selectedType) {
        return false;
      }

      return true;
    });
  }, [reports, selectedPeriod, selectedMonth, selectedZone, selectedReferent, selectedStatus, selectedUrgence, selectedType]);

  // Real-time calculated stats from filtered reports
  const stats: PilotageStatsResult = useMemo(() => {
    return ReportingService.calculatePilotage(filteredReports);
  }, [filteredReports]);

  // Reports matching active KPI card selection
  const kpiMatchedReports = useMemo(() => {
    if (!activeKpi) return [];
    
    let subset: WeeklyReport[] = filteredReports;

    switch (activeKpi) {
      case 'ALL_REMONTEES':
      case 'CAS_REMONTES':
        subset = filteredReports;
        break;
      case 'CAS_TRAITES':
      case 'CAS_TRAITES_IND':
        subset = filteredReports.filter(r => r.status === 'TRAITE');
        break;
      case 'CAS_EN_COURS':
        subset = filteredReports.filter(r => r.status === 'EN_COURS');
        break;
      case 'TAUX_TRAITEMENT':
        subset = filteredReports;
        break;
      case 'DELAI_REPONSE':
        subset = filteredReports.filter(r => Boolean(r.dateReponse || (r.reponses && r.reponses.length > 0) || r.reviewedAt));
        break;
      case 'DELAI_TRAITEMENT':
        subset = filteredReports.filter(r => r.status === 'TRAITE');
        break;
      case 'REGULARITE':
        subset = filteredReports.filter(r => r.type === 'PERIODIQUE');
        break;
      case 'CAS_OUVERTS':
        subset = filteredReports.filter(r => r.status === 'NOUVEAU' || r.status === 'EN_COURS');
        break;
      case 'CAS_URGENTS':
        subset = filteredReports.filter(r => r.priority === 'URGENT' || (r.urgenceLevel && r.urgenceLevel >= 4));
        break;
    }

    if (focusSearch.trim()) {
      const q = focusSearch.toLowerCase();
      subset = subset.filter(r => 
        (r.caseNumber && String(r.caseNumber).toLowerCase().includes(q)) ||
        (r.sujet && r.sujet.toLowerCase().includes(q)) ||
        (r.referentName && r.referentName.toLowerCase().includes(q)) ||
        (r.zone && r.zone.toLowerCase().includes(q)) ||
        (r.situationsPrioritaires && r.situationsPrioritaires.toLowerCase().includes(q)) ||
        (r.activitesLocales && r.activitesLocales.toLowerCase().includes(q))
      );
    }

    return subset;
  }, [filteredReports, activeKpi, focusSearch]);

  // KPI Metadata for focus panel
  const kpiMeta = useMemo(() => {
    if (!activeKpi) return null;
    switch (activeKpi) {
      case 'ALL_REMONTEES':
        return {
          title: 'Toutes les remontées & signalements',
          subtitle: 'Ensemble des 24 dossiers et reportings réguliers enregistrés dans l\'application',
          color: 'slate',
          targetStatus: 'ALL' as const,
          icon: Layers
        };
      case 'CAS_REMONTES':
        return {
          title: 'Ensemble des cas & dossiers remontés',
          subtitle: 'Dossiers nécessitant un suivi opérationnel ou un appui du Bureau National',
          color: 'blue',
          targetStatus: 'ALL' as const,
          icon: AlertTriangle
        };
      case 'CAS_TRAITES':
        return {
          title: 'Cas traités & résolus avec succès',
          subtitle: 'Dossiers pour lesquels une solution concrète a été apportée et validée par le Bureau',
          color: 'emerald',
          targetStatus: 'TRAITE' as const,
          icon: CheckCircle2
        };
      case 'CAS_EN_COURS':
        return {
          title: 'Cas actuellement en cours de traitement',
          subtitle: 'Dossiers pris en charge par le Bureau ou en phase d\'accompagnement active',
          color: 'amber',
          targetStatus: 'EN_COURS' as const,
          icon: Clock
        };
      case 'TAUX_TRAITEMENT':
        return {
          title: 'Analyse du Taux de Résolution & Dossiers associés',
          subtitle: `Taux global de ${stats.tauxTraitement}% — ${stats.casTraites} dossiers résolus sur ${stats.casRemontees} cas`,
          color: 'emerald',
          targetStatus: 'ALL' as const,
          icon: TrendingUp
        };
      case 'DELAI_REPONSE':
        return {
          title: 'Dossiers avec Réponse & Prise en Charge Bureau',
          subtitle: `Délai moyen de réponse calculé : ${stats.delaiMoyenReponseJours} jour(s) entre la transmission et le retour`,
          color: 'indigo',
          targetStatus: 'ALL' as const,
          icon: Zap
        };
      case 'DELAI_TRAITEMENT':
        return {
          title: 'Dossiers clôturés & Délais de Traitement',
          subtitle: `Délai moyen de clôture : ${stats.delaiMoyenTraitementJours} jour(s) pour la résolution complète`,
          color: 'teal',
          targetStatus: 'TRAITE' as const,
          icon: CheckCircle2
        };
      case 'REGULARITE':
        return {
          title: 'Reportings Périodiques Réguliers des Référents',
          subtitle: `Taux de régularité global de ${stats.tauxRegularite}% sur les transmissions programmées d'antenne`,
          color: 'emerald',
          targetStatus: 'ALL' as const,
          icon: Calendar
        };
      case 'CAS_OUVERTS':
        return {
          title: 'Cas ouverts en attente ou en cours',
          subtitle: 'Cumul des dossiers Nouveaux non encore traités et En cours de résolution',
          color: 'blue',
          targetStatus: 'EN_COURS' as const,
          icon: Clock
        };
      case 'CAS_TRAITES_IND':
        return {
          title: 'Cas traités & solutions apportées',
          subtitle: 'Dossiers clôturés avec traçabilité complète des réponses et actions',
          color: 'emerald',
          targetStatus: 'TRAITE' as const,
          icon: CheckCircle2
        };
      case 'CAS_URGENTS':
        return {
          title: 'Cas urgents & Priorités absolues (Niveaux 4 et 5)',
          subtitle: 'Signalements critiques exigeant une réactivité et une intervention immédiate',
          color: 'red',
          targetStatus: 'ALL' as const,
          icon: ShieldAlert
        };
      default:
        return null;
    }
  }, [activeKpi, stats]);

  const toggleKpiFilter = (kpi: NonNullable<ActiveKpiType>) => {
    setActiveKpi((prev) => (prev === kpi ? null : kpi));
    setFocusSearch('');
  };

  const handleDrilldownToCasManagement = () => {
    if (!kpiMeta) {
      if (onNavigateToCasManagement) onNavigateToCasManagement();
      return;
    }

    if (kpiMeta.targetStatus !== 'ALL' && onFilterStatus) {
      onFilterStatus(kpiMeta.targetStatus);
    } else if (activeKpi === 'CAS_URGENTS' && onFilterPriority) {
      onFilterPriority('URGENT');
    } else if (activeKpi === 'REGULARITE' && onFilterType) {
      onFilterType('PERIODIQUE');
    } else if (onNavigateToCasManagement) {
      onNavigateToCasManagement();
    }
  };

  const resetFilters = () => {
    setSelectedPeriod('ALL');
    setSelectedMonth('ALL');
    setSelectedZone('ALL');
    setSelectedReferent('ALL');
    setSelectedStatus('ALL');
    setSelectedUrgence('ALL');
    setSelectedType('ALL');
    setActiveKpi(null);
    setFocusSearch('');
  };

  const hasActiveFilters = selectedPeriod !== 'ALL' || selectedMonth !== 'ALL' || selectedZone !== 'ALL' || 
    selectedReferent !== 'ALL' || selectedStatus !== 'ALL' || selectedUrgence !== 'ALL' || selectedType !== 'ALL';

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      
      {/* 1. Header Banner */}
      <div className="bg-gradient-to-br from-emerald-950 via-slate-900 to-emerald-900 rounded-3xl p-6 sm:p-7 text-white shadow-xl border border-emerald-800/40 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />
        
        <div className="relative z-10 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="bg-emerald-500/20 text-emerald-300 border border-emerald-400/30 text-[11px] font-bold px-3 py-1 rounded-full uppercase tracking-wider flex items-center gap-1.5">
                <Activity className="w-3.5 h-3.5 text-emerald-400" />
                <span>Outil de pilotage & coordination d'activité</span>
              </span>
              <span className="bg-white/10 text-slate-300 text-[11px] font-medium px-2.5 py-0.5 rounded-full">
                MDF National
              </span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-black font-['Outfit'] text-white">
              Tableau de Bord & Pilotage des Zones
            </h2>
            <p className="text-slate-300 text-xs sm:text-sm mt-1 max-w-2xl">
              Suivi objectif de l'activité des Référents, du traitement des cas prioritaires et de l'accompagnement des antennes régionales.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
            <div className="bg-white/10 backdrop-blur-md border border-white/15 px-4 py-2.5 rounded-2xl text-right">
              <p className="text-[10px] uppercase font-bold text-slate-300">Données synchronisées</p>
              <p className="text-xs font-bold text-emerald-300 flex items-center justify-end gap-1 mt-0.5">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                {reports.length} remontées réelles liées
              </p>
            </div>

            {onNavigateToCasManagement && (
              <button
                onClick={onNavigateToCasManagement}
                className="bg-emerald-500 hover:bg-emerald-400 text-slate-950 px-4 py-2.5 rounded-2xl font-bold text-xs flex items-center justify-center gap-2 shadow-md transition-all cursor-pointer"
              >
                <FolderKanban className="w-4 h-4" />
                <span>Gestion des Cas</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        </div>
      </div>

      {/* 2. Multidimensional Filter Bar (Section 8) */}
      <div className="bg-white rounded-3xl p-5 border border-slate-200 shadow-2xs space-y-4">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center font-bold">
              <Filter className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-900 font-['Outfit']">Filtres Multidimensionnels</h3>
              <p className="text-[11px] text-slate-500">Période, mois, zone, référent, statut, urgence & type</p>
            </div>
          </div>

          {hasActiveFilters && (
            <button
              onClick={resetFilters}
              className="text-xs font-bold text-rose-600 hover:text-rose-700 flex items-center gap-1.5 bg-rose-50 px-3 py-1.5 rounded-xl border border-rose-200 transition-all cursor-pointer"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span>Réinitialiser les filtres</span>
            </button>
          )}
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-7 gap-2.5">
          
          {/* Période */}
          <div>
            <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">
              Période
            </label>
            <select
              value={selectedPeriod}
              onChange={(e) => setSelectedPeriod(e.target.value as any)}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-2.5 py-1.5 text-xs font-semibold text-slate-800 focus:ring-2 focus:ring-emerald-500 focus:outline-none"
            >
              <option value="ALL">Toutes périodes</option>
              <option value="THIS_MONTH">Ce mois-ci</option>
              <option value="LAST_MONTH">Mois dernier</option>
              <option value="THIS_QUARTER">Ce trimestre</option>
              <option value="THIS_YEAR">Cette année</option>
            </select>
          </div>

          {/* Mois spécifique */}
          <div>
            <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">
              Mois
            </label>
            <select
              value={selectedMonth}
              onChange={(e) => setSelectedMonth(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-2.5 py-1.5 text-xs font-semibold text-slate-800 focus:ring-2 focus:ring-emerald-500 focus:outline-none"
            >
              <option value="ALL">Tous les mois</option>
              {availableMonths.map((m) => (
                <option key={m.key} value={m.key}>{m.label}</option>
              ))}
            </select>
          </div>

          {/* Zone */}
          <div>
            <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">
              Zone
            </label>
            <select
              value={selectedZone}
              onChange={(e) => setSelectedZone(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-2.5 py-1.5 text-xs font-semibold text-slate-800 focus:ring-2 focus:ring-emerald-500 focus:outline-none"
            >
              <option value="ALL">Toutes les zones</option>
              {customZones.map((z) => (
                <option key={z.id} value={z.name}>{z.name}</option>
              ))}
            </select>
          </div>

          {/* Référent */}
          <div>
            <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">
              Référent
            </label>
            <select
              value={selectedReferent}
              onChange={(e) => setSelectedReferent(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-2.5 py-1.5 text-xs font-semibold text-slate-800 focus:ring-2 focus:ring-emerald-500 focus:outline-none"
            >
              <option value="ALL">Tous les référents</option>
              {availableReferents.map((ref) => (
                <option key={ref} value={ref}>{ref}</option>
              ))}
            </select>
          </div>

          {/* Type */}
          <div>
            <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">
              Type
            </label>
            <select
              value={selectedType}
              onChange={(e) => setSelectedType(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-2.5 py-1.5 text-xs font-semibold text-slate-800 focus:ring-2 focus:ring-emerald-500 focus:outline-none"
            >
              <option value="ALL">Tous les types</option>
              <option value="PERIODIQUE">📅 Périodique</option>
              <option value="PONCTUEL">⚡ Ponctuel / Cas</option>
            </select>
          </div>

          {/* Statut */}
          <div>
            <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">
              Statut
            </label>
            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-2.5 py-1.5 text-xs font-semibold text-slate-800 focus:ring-2 focus:ring-emerald-500 focus:outline-none"
            >
              <option value="ALL">Tous statuts</option>
              <option value="NOUVEAU">Nouveau</option>
              <option value="EN_COURS">En cours</option>
              <option value="TRAITE">Traité</option>
            </select>
          </div>

          {/* Urgence */}
          <div>
            <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">
              Priorité
            </label>
            <select
              value={selectedUrgence}
              onChange={(e) => setSelectedUrgence(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-2.5 py-1.5 text-xs font-semibold text-slate-800 focus:ring-2 focus:ring-emerald-500 focus:outline-none"
            >
              <option value="ALL">Toutes priorités</option>
              <option value="URGENT">🔴 Urgent (4-5)</option>
              <option value="IMPORTANT">🟡 Important (3)</option>
              <option value="NORMAL">🟢 Normal (1-2)</option>
            </select>
          </div>

        </div>
      </div>

      {/* 3. Four Core KPIs + Taux de Traitement (Sections 6 & 7) — Clickable & Interactive */}
      <div className="space-y-2">
        <div className="flex items-center justify-between px-1">
          <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
            <span>Métriques Principales d'Activité</span>
            <span className="text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full font-semibold normal-case">
              💡 Cliquez sur une carte pour voir les dossiers associés
            </span>
          </p>
          {activeKpi && (
            <button
              onClick={() => setActiveKpi(null)}
              className="text-[11px] font-bold text-emerald-800 hover:text-emerald-950 flex items-center gap-1 cursor-pointer"
            >
              <span>Fermer le focus</span>
              <X className="w-3 h-3" />
            </button>
          )}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3.5">
          
          {/* KPI 1: Total des remontées */}
          <div 
            onClick={() => toggleKpiFilter('ALL_REMONTEES')}
            className={`p-5 rounded-2xl border transition-all duration-200 cursor-pointer select-none group relative overflow-hidden ${
              activeKpi === 'ALL_REMONTEES'
                ? 'bg-slate-900 text-white border-slate-900 ring-2 ring-emerald-500 ring-offset-2 shadow-lg transform -translate-y-1'
                : 'bg-white hover:bg-slate-50 border-slate-200 shadow-2xs hover:shadow-md hover:-translate-y-0.5'
            }`}
          >
            <div className="flex items-center justify-between text-slate-400">
              <span className={`text-[11px] font-bold uppercase tracking-wider ${activeKpi === 'ALL_REMONTEES' ? 'text-slate-300' : 'text-slate-500'}`}>
                Total des remontées
              </span>
              <div className={`w-7 h-7 rounded-xl flex items-center justify-center transition-all ${
                activeKpi === 'ALL_REMONTEES' ? 'bg-white/20 text-white' : 'bg-slate-100 text-slate-700 group-hover:bg-slate-200'
              }`}>
                <Layers className="w-4 h-4" />
              </div>
            </div>
            
            <div className="flex items-baseline gap-2 mt-1">
              <span className={`text-3xl font-black font-['Outfit'] ${activeKpi === 'ALL_REMONTEES' ? 'text-white' : 'text-slate-900'}`}>
                {stats.totalRemontees}
              </span>
              <span className={`text-xs font-medium ${activeKpi === 'ALL_REMONTEES' ? 'text-slate-300' : 'text-slate-500'}`}>
                enregistrées
              </span>
            </div>

            <div className="flex items-center justify-between mt-2 pt-2 border-t border-slate-100/30">
              <p className={`text-[11px] ${activeKpi === 'ALL_REMONTEES' ? 'text-slate-300' : 'text-slate-500'}`}>
                Périodiques & ponctuels
              </p>
              {activeKpi === 'ALL_REMONTEES' ? (
                <span className="text-[10px] font-bold text-emerald-400 flex items-center gap-1">
                  <Check className="w-3 h-3" /> Actif
                </span>
              ) : (
                <span className="text-[10px] text-slate-400 group-hover:text-emerald-700 font-bold transition-all flex items-center gap-0.5">
                  Afficher <ChevronRight className="w-3 h-3" />
                </span>
              )}
            </div>
          </div>

          {/* KPI 2: Cas remontés */}
          <div 
            onClick={() => toggleKpiFilter('CAS_REMONTES')}
            className={`p-5 rounded-2xl border transition-all duration-200 cursor-pointer select-none group relative overflow-hidden ${
              activeKpi === 'CAS_REMONTES'
                ? 'bg-blue-900 text-white border-blue-900 ring-2 ring-blue-400 ring-offset-2 shadow-lg transform -translate-y-1'
                : 'bg-white hover:bg-blue-50/40 border-blue-200 shadow-2xs hover:shadow-md hover:-translate-y-0.5'
            }`}
          >
            <div className="flex items-center justify-between">
              <span className={`text-[11px] font-bold uppercase tracking-wider ${activeKpi === 'CAS_REMONTES' ? 'text-blue-200' : 'text-blue-700'}`}>
                Cas remontés
              </span>
              <div className={`w-7 h-7 rounded-xl flex items-center justify-center transition-all ${
                activeKpi === 'CAS_REMONTES' ? 'bg-white/20 text-white' : 'bg-blue-50 text-blue-700 group-hover:bg-blue-100'
              }`}>
                <AlertTriangle className="w-4 h-4" />
              </div>
            </div>

            <div className="flex items-baseline gap-2 mt-1">
              <span className={`text-3xl font-black font-['Outfit'] ${activeKpi === 'CAS_REMONTES' ? 'text-white' : 'text-blue-900'}`}>
                {stats.casRemontees}
              </span>
              <span className={`text-xs font-medium ${activeKpi === 'CAS_REMONTES' ? 'text-blue-200' : 'text-blue-700'}`}>
                dossiers
              </span>
            </div>

            <div className="flex items-center justify-between mt-2 pt-2 border-t border-blue-100/30">
              <p className={`text-[11px] ${activeKpi === 'CAS_REMONTES' ? 'text-blue-200' : 'text-blue-600'}`}>
                Suivi Bureau requis
              </p>
              {activeKpi === 'CAS_REMONTES' ? (
                <span className="text-[10px] font-bold text-blue-300 flex items-center gap-1">
                  <Check className="w-3 h-3" /> Actif
                </span>
              ) : (
                <span className="text-[10px] text-blue-400 group-hover:text-blue-700 font-bold transition-all flex items-center gap-0.5">
                  Afficher <ChevronRight className="w-3 h-3" />
                </span>
              )}
            </div>
          </div>

          {/* KPI 3: Cas traités */}
          <div 
            onClick={() => toggleKpiFilter('CAS_TRAITES')}
            className={`p-5 rounded-2xl border transition-all duration-200 cursor-pointer select-none group relative overflow-hidden ${
              activeKpi === 'CAS_TRAITES'
                ? 'bg-emerald-900 text-white border-emerald-900 ring-2 ring-emerald-400 ring-offset-2 shadow-lg transform -translate-y-1'
                : 'bg-white hover:bg-emerald-50/40 border-emerald-200 shadow-2xs hover:shadow-md hover:-translate-y-0.5'
            }`}
          >
            <div className="flex items-center justify-between">
              <span className={`text-[11px] font-bold uppercase tracking-wider ${activeKpi === 'CAS_TRAITES' ? 'text-emerald-200' : 'text-emerald-700'}`}>
                Cas traités
              </span>
              <div className={`w-7 h-7 rounded-xl flex items-center justify-center transition-all ${
                activeKpi === 'CAS_TRAITES' ? 'bg-white/20 text-white' : 'bg-emerald-50 text-emerald-700 group-hover:bg-emerald-100'
              }`}>
                <CheckCircle2 className="w-4 h-4" />
              </div>
            </div>

            <div className="flex items-baseline gap-2 mt-1">
              <span className={`text-3xl font-black font-['Outfit'] ${activeKpi === 'CAS_TRAITES' ? 'text-white' : 'text-emerald-900'}`}>
                {stats.casTraites}
              </span>
              <span className={`text-xs font-medium ${activeKpi === 'CAS_TRAITES' ? 'text-emerald-200' : 'text-emerald-700'}`}>
                résolus
              </span>
            </div>

            <div className="flex items-center justify-between mt-2 pt-2 border-t border-emerald-100/30">
              <p className={`text-[11px] ${activeKpi === 'CAS_TRAITES' ? 'text-emerald-200' : 'text-emerald-600'}`}>
                Statut Traité & clos
              </p>
              {activeKpi === 'CAS_TRAITES' ? (
                <span className="text-[10px] font-bold text-emerald-300 flex items-center gap-1">
                  <Check className="w-3 h-3" /> Actif
                </span>
              ) : (
                <span className="text-[10px] text-emerald-500 group-hover:text-emerald-800 font-bold transition-all flex items-center gap-0.5">
                  Afficher <ChevronRight className="w-3 h-3" />
                </span>
              )}
            </div>
          </div>

          {/* KPI 4: Cas en cours */}
          <div 
            onClick={() => toggleKpiFilter('CAS_EN_COURS')}
            className={`p-5 rounded-2xl border transition-all duration-200 cursor-pointer select-none group relative overflow-hidden ${
              activeKpi === 'CAS_EN_COURS'
                ? 'bg-amber-900 text-white border-amber-900 ring-2 ring-amber-400 ring-offset-2 shadow-lg transform -translate-y-1'
                : 'bg-white hover:bg-amber-50/40 border-amber-200 shadow-2xs hover:shadow-md hover:-translate-y-0.5'
            }`}
          >
            <div className="flex items-center justify-between">
              <span className={`text-[11px] font-bold uppercase tracking-wider ${activeKpi === 'CAS_EN_COURS' ? 'text-amber-200' : 'text-amber-800'}`}>
                Cas en cours
              </span>
              <div className={`w-7 h-7 rounded-xl flex items-center justify-center transition-all ${
                activeKpi === 'CAS_EN_COURS' ? 'bg-white/20 text-white' : 'bg-amber-50 text-amber-800 group-hover:bg-amber-100'
              }`}>
                <Clock className="w-4 h-4" />
              </div>
            </div>

            <div className="flex items-baseline gap-2 mt-1">
              <span className={`text-3xl font-black font-['Outfit'] ${activeKpi === 'CAS_EN_COURS' ? 'text-white' : 'text-amber-900'}`}>
                {stats.casEnCours}
              </span>
              <span className={`text-xs font-medium ${activeKpi === 'CAS_EN_COURS' ? 'text-amber-200' : 'text-amber-700'}`}>
                pris en charge
              </span>
            </div>

            <div className="flex items-center justify-between mt-2 pt-2 border-t border-amber-100/30">
              <p className={`text-[11px] ${activeKpi === 'CAS_EN_COURS' ? 'text-amber-200' : 'text-amber-700'}`}>
                En cours d'instruction
              </p>
              {activeKpi === 'CAS_EN_COURS' ? (
                <span className="text-[10px] font-bold text-amber-300 flex items-center gap-1">
                  <Check className="w-3 h-3" /> Actif
                </span>
              ) : (
                <span className="text-[10px] text-amber-500 group-hover:text-amber-800 font-bold transition-all flex items-center gap-0.5">
                  Afficher <ChevronRight className="w-3 h-3" />
                </span>
              )}
            </div>
          </div>

          {/* KPI 5: Taux de traitement (Section 7) */}
          <div 
            onClick={() => toggleKpiFilter('TAUX_TRAITEMENT')}
            className={`p-5 rounded-2xl border transition-all duration-200 cursor-pointer select-none group relative overflow-hidden sm:col-span-2 lg:col-span-1 ${
              activeKpi === 'TAUX_TRAITEMENT'
                ? 'bg-gradient-to-br from-emerald-950 to-slate-950 text-white border-emerald-400 ring-2 ring-emerald-400 ring-offset-2 shadow-lg transform -translate-y-1'
                : 'bg-gradient-to-br from-emerald-900 to-slate-900 text-white border-emerald-700/50 shadow-xs hover:shadow-md hover:-translate-y-0.5'
            }`}
          >
            <div className="flex items-center justify-between text-emerald-400">
              <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-300">Taux de traitement</span>
              <TrendingUp className="w-4 h-4 text-emerald-400" />
            </div>

            <div className="flex items-baseline gap-2 mt-1">
              <span className="text-3xl font-black text-emerald-300 font-['Outfit']">{stats.tauxTraitement} %</span>
            </div>

            {/* Progress bar */}
            <div className="w-full bg-slate-700/80 rounded-full h-2 overflow-hidden mt-1.5">
              <div 
                className="bg-emerald-400 h-full rounded-full transition-all duration-500" 
                style={{ width: `${Math.min(100, Math.max(5, stats.tauxTraitement))}%` }}
              />
            </div>

            <div className="flex items-center justify-between mt-2 pt-2 border-t border-white/10">
              <p className="text-[10px] text-slate-300">
                {stats.casTraites} / {stats.casRemontees} cas
              </p>
              {activeKpi === 'TAUX_TRAITEMENT' ? (
                <span className="text-[10px] font-bold text-emerald-300 flex items-center gap-1">
                  <Check className="w-3 h-3" /> Actif
                </span>
              ) : (
                <span className="text-[10px] text-emerald-400 group-hover:text-emerald-200 font-bold transition-all flex items-center gap-0.5">
                  Détails <ChevronRight className="w-3 h-3" />
                </span>
              )}
            </div>
          </div>

        </div>
      </div>

      {/* 4. Indicateurs de Réactivité & Régularité (Sections 9 & 10) — Clickable & Interactive */}
      <div className="bg-slate-50 border border-slate-200 rounded-3xl p-5 sm:p-6 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-200 pb-3">
          <div>
            <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <Zap className="w-4 h-4 text-amber-500" />
              <span>Indicateurs de Réactivité & d'Accompagnement</span>
            </h3>
            <p className="text-xs text-slate-500">
              Mesures automatisées à partir des dates réelles de création, prise en charge et réponse du Bureau. Cliquez pour filtrer.
            </p>
          </div>
          <div className="bg-emerald-100 text-emerald-900 border border-emerald-200 text-[11px] font-bold px-3 py-1 rounded-xl flex items-center gap-1.5 self-start">
            <ShieldAlert className="w-3.5 h-3.5 text-emerald-700" />
            <span>Pilotage bienveillant (non noté)</span>
          </div>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
          
          {/* Ind 1: Délai moyen de réponse */}
          <div 
            onClick={() => toggleKpiFilter('DELAI_REPONSE')}
            className={`p-3.5 rounded-2xl border transition-all duration-200 cursor-pointer select-none group ${
              activeKpi === 'DELAI_REPONSE'
                ? 'bg-indigo-900 text-white border-indigo-900 ring-2 ring-indigo-400 shadow-md transform -translate-y-0.5'
                : 'bg-white hover:bg-indigo-50/40 border-slate-200 shadow-2xs hover:shadow-sm'
            }`}
          >
            <p className={`text-[10px] font-bold uppercase ${activeKpi === 'DELAI_REPONSE' ? 'text-indigo-200' : 'text-slate-400'}`}>
              Délai moyen de réponse
            </p>
            <p className={`text-xl font-black font-['Outfit'] mt-1 ${activeKpi === 'DELAI_REPONSE' ? 'text-white' : 'text-slate-900'}`}>
              {stats.delaiMoyenReponseJours} j
            </p>
            <p className={`text-[10px] ${activeKpi === 'DELAI_REPONSE' ? 'text-indigo-200' : 'text-slate-500'}`}>
              Date réponse - Création
            </p>
          </div>

          {/* Ind 2: Délai moyen traitement */}
          <div 
            onClick={() => toggleKpiFilter('DELAI_TRAITEMENT')}
            className={`p-3.5 rounded-2xl border transition-all duration-200 cursor-pointer select-none group ${
              activeKpi === 'DELAI_TRAITEMENT'
                ? 'bg-teal-900 text-white border-teal-900 ring-2 ring-teal-400 shadow-md transform -translate-y-0.5'
                : 'bg-white hover:bg-teal-50/40 border-slate-200 shadow-2xs hover:shadow-sm'
            }`}
          >
            <p className={`text-[10px] font-bold uppercase ${activeKpi === 'DELAI_TRAITEMENT' ? 'text-teal-200' : 'text-slate-400'}`}>
              Délai moyen traitement
            </p>
            <p className={`text-xl font-black font-['Outfit'] mt-1 ${activeKpi === 'DELAI_TRAITEMENT' ? 'text-white' : 'text-slate-900'}`}>
              {stats.delaiMoyenTraitementJours} j
            </p>
            <p className={`text-[10px] ${activeKpi === 'DELAI_TRAITEMENT' ? 'text-teal-200' : 'text-slate-500'}`}>
              Clôture moyenne
            </p>
          </div>

          {/* Ind 3: Régularité globale */}
          <div 
            onClick={() => toggleKpiFilter('REGULARITE')}
            className={`p-3.5 rounded-2xl border transition-all duration-200 cursor-pointer select-none group ${
              activeKpi === 'REGULARITE'
                ? 'bg-emerald-900 text-white border-emerald-900 ring-2 ring-emerald-400 shadow-md transform -translate-y-0.5'
                : 'bg-white hover:bg-emerald-50/40 border-slate-200 shadow-2xs hover:shadow-sm'
            }`}
          >
            <p className={`text-[10px] font-bold uppercase ${activeKpi === 'REGULARITE' ? 'text-emerald-200' : 'text-slate-400'}`}>
              Régularité globale
            </p>
            <p className={`text-xl font-black font-['Outfit'] mt-1 ${activeKpi === 'REGULARITE' ? 'text-emerald-300' : 'text-emerald-700'}`}>
              {stats.tauxRegularite} %
            </p>
            <p className={`text-[10px] ${activeKpi === 'REGULARITE' ? 'text-emerald-200' : 'text-slate-500'}`}>
              Transmissions régulières
            </p>
          </div>

          {/* Ind 4: Cas ouverts */}
          <div 
            onClick={() => toggleKpiFilter('CAS_OUVERTS')}
            className={`p-3.5 rounded-2xl border transition-all duration-200 cursor-pointer select-none group ${
              activeKpi === 'CAS_OUVERTS'
                ? 'bg-blue-900 text-white border-blue-900 ring-2 ring-blue-400 shadow-md transform -translate-y-0.5'
                : 'bg-white hover:bg-blue-50/40 border-slate-200 shadow-2xs hover:shadow-sm'
            }`}
          >
            <p className={`text-[10px] font-bold uppercase ${activeKpi === 'CAS_OUVERTS' ? 'text-blue-200' : 'text-blue-600'}`}>
              Cas ouverts (non clos)
            </p>
            <p className={`text-xl font-black font-['Outfit'] mt-1 ${activeKpi === 'CAS_OUVERTS' ? 'text-white' : 'text-blue-900'}`}>
              {stats.casNouveaux + stats.casEnCours}
            </p>
            <p className={`text-[10px] ${activeKpi === 'CAS_OUVERTS' ? 'text-blue-200' : 'text-blue-700'}`}>
              Nouveaux + En cours
            </p>
          </div>

          {/* Ind 5: Cas traités */}
          <div 
            onClick={() => toggleKpiFilter('CAS_TRAITES_IND')}
            className={`p-3.5 rounded-2xl border transition-all duration-200 cursor-pointer select-none group ${
              activeKpi === 'CAS_TRAITES_IND'
                ? 'bg-emerald-900 text-white border-emerald-900 ring-2 ring-emerald-400 shadow-md transform -translate-y-0.5'
                : 'bg-white hover:bg-emerald-50/40 border-slate-200 shadow-2xs hover:shadow-sm'
            }`}
          >
            <p className={`text-[10px] font-bold uppercase ${activeKpi === 'CAS_TRAITES_IND' ? 'text-emerald-200' : 'text-emerald-600'}`}>
              Cas traités
            </p>
            <p className={`text-xl font-black font-['Outfit'] mt-1 ${activeKpi === 'CAS_TRAITES_IND' ? 'text-white' : 'text-emerald-900'}`}>
              {stats.casTraites}
            </p>
            <p className={`text-[10px] ${activeKpi === 'CAS_TRAITES_IND' ? 'text-emerald-200' : 'text-emerald-700'}`}>
              Solutions apportées
            </p>
          </div>

          {/* Ind 6: Cas urgents */}
          <div 
            onClick={() => toggleKpiFilter('CAS_URGENTS')}
            className={`p-3.5 rounded-2xl border transition-all duration-200 cursor-pointer select-none group ${
              activeKpi === 'CAS_URGENTS'
                ? 'bg-red-900 text-white border-red-900 ring-2 ring-red-400 shadow-md transform -translate-y-0.5'
                : 'bg-white hover:bg-red-50/40 border-red-200 shadow-2xs hover:shadow-sm'
            }`}
          >
            <p className={`text-[10px] font-bold uppercase ${activeKpi === 'CAS_URGENTS' ? 'text-red-200' : 'text-red-600'}`}>
              Cas urgents (4-5)
            </p>
            <p className={`text-xl font-black font-['Outfit'] mt-1 ${activeKpi === 'CAS_URGENTS' ? 'text-white' : 'text-red-900'}`}>
              {stats.casUrgents}
            </p>
            <p className={`text-[10px] ${activeKpi === 'CAS_URGENTS' ? 'text-red-200' : 'text-red-700'}`}>
              Priorités absolues
            </p>
          </div>

        </div>

        {/* Notice explicative (Section 10) */}
        <div className="bg-blue-50/70 border border-blue-200 rounded-2xl p-3.5 flex items-start gap-3">
          <Info className="w-4 h-4 text-blue-700 shrink-0 mt-0.5" />
          <p className="text-xs text-blue-900 font-medium">
            <span className="font-bold">Note d'accompagnement :</span> Ces indicateurs de réactivité et de régularité ne constituent en aucun cas une note ou un jugement automatique. Ils fournissent au Bureau National une vision claire pour accompagner les référents bénévoles et ajuster les ressources nécessaires.
          </p>
        </div>
      </div>

      {/* DYNAMIC KPI FOCUS & DRILLDOWN DRAWER / PANEL */}
      {activeKpi && kpiMeta && (
        <div className="bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 rounded-3xl p-5 sm:p-6 text-white border-2 border-emerald-500 shadow-2xl space-y-4 animate-in fade-in slide-in-from-top-4 duration-300">
          
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 border-b border-slate-700/80 pb-4">
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-2xl bg-emerald-500/20 border border-emerald-400/40 text-emerald-300 flex items-center justify-center shrink-0">
                <kpiMeta.icon className="w-5 h-5" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="bg-emerald-500 text-slate-950 text-[10px] font-black uppercase px-2.5 py-0.5 rounded-full">
                    Focus Actif
                  </span>
                  <h3 className="text-lg font-black text-white font-['Outfit']">
                    {kpiMeta.title}
                  </h3>
                </div>
                <p className="text-xs text-slate-300 mt-0.5">
                  {kpiMeta.subtitle}
                </p>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <span className="bg-white/10 text-slate-200 text-xs font-bold px-3 py-1.5 rounded-xl border border-white/10">
                {kpiMatchedReports.length} dossier(s) trouvé(s)
              </span>

              <button
                onClick={handleDrilldownToCasManagement}
                className="bg-emerald-500 hover:bg-emerald-400 text-slate-950 px-3.5 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all shadow-md cursor-pointer"
              >
                <FolderKanban className="w-3.5 h-3.5" />
                <span>Gérer ces cas dans la vue détaillée</span>
                <ArrowRight className="w-3 h-3" />
              </button>

              <button
                onClick={() => setActiveKpi(null)}
                className="p-1.5 bg-white/10 hover:bg-white/20 text-slate-300 hover:text-white rounded-xl transition-all cursor-pointer"
                title="Fermer le focus"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Quick Search inside focused KPI */}
          <div className="flex items-center gap-2 bg-slate-950/60 p-2 rounded-2xl border border-slate-700">
            <Search className="w-4 h-4 text-slate-400 ml-2" />
            <input
              type="text"
              value={focusSearch}
              onChange={(e) => setFocusSearch(e.target.value)}
              placeholder="Rechercher par #cas, sujet, référent ou zone dans cette sélection..."
              className="bg-transparent text-xs text-white placeholder-slate-400 w-full focus:outline-none"
            />
            {focusSearch && (
              <button
                onClick={() => setFocusSearch('')}
                className="text-slate-400 hover:text-white p-1 text-xs"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {/* List of matching reports */}
          <div className="space-y-2.5 max-h-96 overflow-y-auto pr-1">
            {kpiMatchedReports.length > 0 ? (
              kpiMatchedReports.map((r) => (
                <div
                  key={r.id}
                  onClick={() => onOpenReportDetail && onOpenReportDetail(r)}
                  className="bg-slate-800/90 hover:bg-slate-800 border border-slate-700/80 hover:border-emerald-500/50 rounded-2xl p-4 transition-all duration-200 cursor-pointer group flex flex-col md:flex-row md:items-center justify-between gap-3 shadow-xs"
                >
                  <div className="space-y-1.5 flex-1 min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="font-mono font-black text-emerald-400 text-xs bg-emerald-950/80 px-2 py-0.5 rounded-md border border-emerald-700/50">
                        {r.caseNumber || `#${r.id.replace(/\D/g, '').slice(-3)}`}
                      </span>
                      <ReportTypeBadge type={r.type || 'PERIODIQUE'} />
                      <PriorityBadge priority={r.priority} urgenceLevel={r.urgenceLevel} />
                      
                      <span className="text-[11px] font-semibold text-slate-300 bg-white/10 px-2 py-0.5 rounded-md flex items-center gap-1">
                        <MapPin className="w-3 h-3 text-emerald-400" />
                        <span>{r.zone}</span>
                      </span>

                      <span className="text-[11px] text-slate-400">
                        Par <strong className="text-white">{r.referentName}</strong> • {new Date(r.createdAt || r.semaineLundi).toLocaleDateString('fr-FR')}
                      </span>
                    </div>

                    <h4 className="text-sm font-bold text-white group-hover:text-emerald-300 transition-colors line-clamp-1">
                      {r.sujet || r.situationsPrioritaires || 'Reporting d\'activité de zone'}
                    </h4>

                    {r.situationsPrioritaires && r.sujet && (
                      <p className="text-xs text-slate-300 line-clamp-1">
                        {r.situationsPrioritaires}
                      </p>
                    )}

                    {r.reponses && r.reponses.length > 0 && (
                      <div className="flex items-center gap-1.5 text-[11px] text-emerald-300 bg-emerald-950/40 border border-emerald-800/40 px-2.5 py-1 rounded-xl w-fit">
                        <MessageSquare className="w-3 h-3 text-emerald-400" />
                        <span>Dernière réponse : {r.reponses[r.reponses.length - 1].content.slice(0, 60)}...</span>
                      </div>
                    )}
                  </div>

                  <div className="flex items-center gap-3 shrink-0 self-end md:self-center">
                    <span className={`px-2.5 py-1 rounded-xl text-xs font-black uppercase tracking-wider ${
                      r.status === 'TRAITE' ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40' :
                      r.status === 'EN_COURS' ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40' :
                      'bg-blue-500/20 text-blue-300 border border-blue-500/40'
                    }`}>
                      {r.status === 'TRAITE' ? '✓ Traité' : r.status === 'EN_COURS' ? '⏳ En cours' : '✦ Nouveau'}
                    </span>

                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        if (onOpenReportDetail) onOpenReportDetail(r);
                      }}
                      className="bg-white/10 hover:bg-emerald-500 hover:text-slate-950 text-white px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer"
                    >
                      <Eye className="w-3.5 h-3.5" />
                      <span>Consulter</span>
                    </button>
                  </div>
                </div>
              ))
            ) : (
              <div className="bg-slate-800/50 rounded-2xl p-8 text-center text-slate-400 space-y-2">
                <Layers className="w-8 h-8 mx-auto text-slate-500" />
                <p className="text-sm font-bold text-slate-300">Aucun dossier ne correspond à ce filtre</p>
                <p className="text-xs text-slate-400">Essayez de réinitialiser la recherche ou de choisir une autre métrique.</p>
              </div>
            )}
          </div>

        </div>
      )}

      {/* 5. Diagrammes 11, 12, 13 & 14 (Graphiques SVG Interactifs Indépendants) */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Graphique 1 : Cas remontés vs Cas traités (Section 11) */}
        <div className="bg-white rounded-3xl p-5 sm:p-6 border border-slate-200 shadow-2xs space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <BarChart3 className="w-4 h-4 text-emerald-600" />
                <span>Cas remontés vs Cas traités dans le temps</span>
              </h3>
              <p className="text-xs text-slate-500">Comparaison mensuelle automatique des flux</p>
            </div>
            <span className="text-[11px] font-bold bg-slate-100 text-slate-700 px-2.5 py-1 rounded-xl">
              {stats.chartRemontesVsTraites.length} mois
            </span>
          </div>

          <div className="h-64 w-full">
            <CustomBarChartComparison data={stats.chartRemontesVsTraites} />
          </div>
        </div>

        {/* Graphique 2 : Activité par Référent (Section 12) */}
        <div className="bg-white rounded-3xl p-5 sm:p-6 border border-slate-200 shadow-2xs space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <Users className="w-4 h-4 text-blue-600" />
                <span>Activité des Référents (Volume de remontées)</span>
              </h3>
              <p className="text-xs text-slate-500">Nombre de reportings & cas par référent de zone</p>
            </div>
          </div>

          <div className="h-64 w-full">
            <CustomHorizontalBarChart 
              data={stats.chartActivityPerReferent} 
              onSelectReferent={(name) => setSelectedReferent(name)}
            />
          </div>
        </div>

        {/* Graphique 3 : Répartition du traitement des cas (Section 13) */}
        <div className="bg-white rounded-3xl p-5 sm:p-6 border border-slate-200 shadow-2xs space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <PieIcon className="w-4 h-4 text-amber-500" />
                <span>Traitement des cas (Répartition par statut)</span>
              </h3>
              <p className="text-xs text-slate-500">Nouveau • En cours • Traité</p>
            </div>
            <span className="text-xs font-black text-slate-900 bg-slate-100 px-3 py-1 rounded-xl">
              {stats.casRemontees} cas
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 items-center gap-4 h-64">
            <div className="h-full w-full">
              <CustomDonutChart 
                data={stats.chartStatusDistribution} 
                onSelectStatus={(statusName) => {
                  const s = statusName === 'Nouveau' ? 'NOUVEAU' : statusName === 'En cours' ? 'EN_COURS' : 'TRAITE';
                  if (onFilterStatus) onFilterStatus(s);
                }}
              />
            </div>

            <div className="space-y-2.5 pr-2">
              <button
                onClick={() => toggleKpiFilter('CAS_OUVERTS')}
                className="w-full text-left bg-blue-50/80 hover:bg-blue-100/80 p-2.5 rounded-xl border border-blue-200 flex items-center justify-between text-xs transition-all cursor-pointer"
              >
                <div className="flex items-center gap-2">
                  <span className="w-3 h-3 rounded-full bg-blue-500" />
                  <span className="font-bold text-blue-950">Nouveau</span>
                </div>
                <span className="font-black text-blue-900">{stats.casNouveaux}</span>
              </button>

              <button
                onClick={() => toggleKpiFilter('CAS_EN_COURS')}
                className="w-full text-left bg-amber-50/80 hover:bg-amber-100/80 p-2.5 rounded-xl border border-amber-200 flex items-center justify-between text-xs transition-all cursor-pointer"
              >
                <div className="flex items-center gap-2">
                  <span className="w-3 h-3 rounded-full bg-amber-500" />
                  <span className="font-bold text-amber-950">En cours</span>
                </div>
                <span className="font-black text-amber-900">{stats.casEnCours}</span>
              </button>

              <button
                onClick={() => toggleKpiFilter('CAS_TRAITES')}
                className="w-full text-left bg-emerald-50/80 hover:bg-emerald-100/80 p-2.5 rounded-xl border border-emerald-200 flex items-center justify-between text-xs transition-all cursor-pointer"
              >
                <div className="flex items-center gap-2">
                  <span className="w-3 h-3 rounded-full bg-emerald-500" />
                  <span className="font-bold text-emerald-950">Traité & clos</span>
                </div>
                <span className="font-black text-emerald-900">{stats.casTraites}</span>
              </button>
            </div>
          </div>
        </div>

        {/* Graphique 4 : Activité dans le temps (Section 14) */}
        <div className="bg-white rounded-3xl p-5 sm:p-6 border border-slate-200 shadow-2xs space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-teal-600" />
                <span>Évolution de l'activité dans le temps</span>
              </h3>
              <p className="text-xs text-slate-500">Flux d'enregistrement des remontées</p>
            </div>
          </div>

          <div className="h-64 w-full">
            <CustomAreaChart data={stats.chartTimelineActivity} />
          </div>
        </div>

      </div>

      {/* 6. Tableau Comparatif par Zone (Section 15) — Synchronisé avec les Membres de l'application */}
      <div className="bg-white rounded-3xl p-5 sm:p-6 border border-slate-200 shadow-2xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-3">
          <div>
            <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <MapPin className="w-4 h-4 text-emerald-600" />
              <span>Activité par Zone & Comparatif Régional</span>
            </h3>
            <p className="text-xs text-slate-500">
              Vue synthétique permettant d'identifier les zones nécessitant une attention ou un accompagnement particulier.
            </p>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-emerald-900 bg-emerald-50 px-3 py-1 rounded-xl border border-emerald-200 self-start">
              {stats.zoneActivitySummary.length} zone(s) active(s)
            </span>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-slate-50 text-slate-600 border-b border-slate-200">
                <th className="py-3 px-4 font-bold uppercase tracking-wider">Zone</th>
                <th className="py-3 px-3 font-bold uppercase tracking-wider text-center">Membres</th>
                <th className="py-3 px-3 font-bold uppercase tracking-wider text-center">Remontées</th>
                <th className="py-3 px-3 font-bold uppercase tracking-wider text-center text-emerald-700">Cas traités</th>
                <th className="py-3 px-3 font-bold uppercase tracking-wider text-center text-amber-700">Cas en cours</th>
                <th className="py-3 px-3 font-bold uppercase tracking-wider text-center text-blue-700">Nouveaux</th>
                <th className="py-3 px-3 font-bold uppercase tracking-wider text-center text-red-600">Urgences</th>
                <th className="py-3 px-3 font-bold uppercase tracking-wider text-center">Taux Traitement</th>
                <th className="py-3 px-3 font-bold uppercase tracking-wider text-right">Délai Moyen</th>
                <th className="py-3 px-3 font-bold uppercase tracking-wider text-center">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {stats.zoneActivitySummary.map((z) => {
                // Count real members in this zone from app's members list
                const zoneMembersCount = members.filter(
                  (m) => m.zone?.toLowerCase() === z.zone.toLowerCase() || m.region?.toLowerCase() === z.zone.toLowerCase()
                ).length;

                return (
                  <tr 
                    key={z.zone} 
                    className="hover:bg-emerald-50/50 transition-all group cursor-pointer"
                    onClick={() => onFilterZone && onFilterZone(z.zone)}
                  >
                    <td className="py-3 px-4 font-bold text-slate-900 flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full bg-emerald-500" />
                      <span>{z.zone}</span>
                    </td>
                    <td className="py-3 px-3 text-center">
                      <span className="inline-flex items-center gap-1 bg-slate-100 text-slate-800 text-[11px] font-bold px-2 py-0.5 rounded-md">
                        <Users className="w-3 h-3 text-slate-500" />
                        {zoneMembersCount > 0 ? zoneMembersCount : '—'}
                      </span>
                    </td>
                    <td className="py-3 px-3 font-bold text-center text-slate-900">{z.total}</td>
                    <td className="py-3 px-3 font-bold text-center text-emerald-700 bg-emerald-50/40 rounded-lg">{z.traites}</td>
                    <td className="py-3 px-3 font-bold text-center text-amber-800">{z.enCours}</td>
                    <td className="py-3 px-3 font-bold text-center text-blue-700">{z.nouveaux}</td>
                    <td className="py-3 px-3 font-bold text-center">
                      {z.urgences > 0 ? (
                        <span className="bg-red-100 text-red-800 text-[11px] font-black px-2 py-0.5 rounded-full">
                          {z.urgences}
                        </span>
                      ) : (
                        <span className="text-slate-400">0</span>
                      )}
                    </td>
                    <td className="py-3 px-3 text-center font-black text-slate-800">
                      <span className={`px-2 py-0.5 rounded-md ${
                        z.tauxTraitement >= 75 ? 'bg-emerald-100 text-emerald-900' : z.tauxTraitement >= 40 ? 'bg-amber-100 text-amber-900' : 'bg-slate-100 text-slate-700'
                      }`}>
                        {z.tauxTraitement} %
                      </span>
                    </td>
                    <td className="py-3 px-3 text-right font-semibold text-slate-600">
                      {z.delaiMoyen} j
                    </td>
                    <td className="py-3 px-3 text-center">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          if (onFilterZone) onFilterZone(z.zone);
                        }}
                        className="text-[11px] font-bold text-emerald-800 hover:text-emerald-950 bg-emerald-50 hover:bg-emerald-100 px-2 py-1 rounded-lg transition-all"
                      >
                        Filtrer
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* 7. Activité des Référents / Référents les plus actifs (Section 16) */}
      <div className="bg-white rounded-3xl p-5 sm:p-6 border border-slate-200 shadow-2xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-3">
          <div>
            <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <Award className="w-4 h-4 text-amber-500" />
              <span>Activité des Référents & Suivi Terrain</span>
            </h3>
            <p className="text-xs text-slate-500">
              Suivi objectif des transmissions de reportings et de l'état des cas attribués (terminologie bienveillante : « Référents les plus actifs »).
            </p>
          </div>
          <span className="text-xs font-bold text-slate-700 bg-slate-100 px-3 py-1 rounded-xl">
            {stats.referentsRanking.length} référent(s) recensé(s)
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3.5">
          {stats.referentsRanking.map((ref, idx) => (
            <div 
              key={ref.referentName}
              onClick={() => setSelectedReferent(ref.referentName)}
              className="bg-slate-50 hover:bg-emerald-50/40 rounded-2xl p-4 border border-slate-200 hover:border-emerald-300 transition-all space-y-3 cursor-pointer group"
            >
              <div className="flex items-start justify-between gap-2">
                <div className="flex items-center gap-2.5">
                  <div className={`w-7 h-7 rounded-xl flex items-center justify-center font-black text-xs ${
                    idx === 0 ? 'bg-amber-400 text-slate-950 shadow-2xs' :
                    idx === 1 ? 'bg-slate-300 text-slate-900' :
                    idx === 2 ? 'bg-amber-700/20 text-amber-900' : 'bg-slate-200 text-slate-700'
                  }`}>
                    {idx + 1}
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-slate-900 group-hover:text-emerald-900 transition-colors">
                      {ref.referentName}
                    </h4>
                    <span className="text-[11px] font-semibold text-emerald-800 bg-emerald-100 px-2 py-0.2 rounded-md">
                      {ref.zone}
                    </span>
                  </div>
                </div>

                <div className="text-right">
                  <span className="text-lg font-black text-slate-900 font-['Outfit']">{ref.total}</span>
                  <p className="text-[10px] text-slate-400 uppercase font-bold">remontées</p>
                </div>
              </div>

              {/* Stats breakdown pills */}
              <div className="grid grid-cols-3 gap-1.5 text-center text-[11px]">
                <div className="bg-white p-1.5 rounded-lg border border-slate-200">
                  <p className="text-[9px] uppercase font-bold text-emerald-700">Traités</p>
                  <p className="font-bold text-slate-800">{ref.traites}</p>
                </div>
                <div className="bg-white p-1.5 rounded-lg border border-slate-200">
                  <p className="text-[9px] uppercase font-bold text-amber-700">En cours</p>
                  <p className="font-bold text-slate-800">{ref.enCours}</p>
                </div>
                <div className="bg-white p-1.5 rounded-lg border border-slate-200">
                  <p className="text-[9px] uppercase font-bold text-slate-500">Régularité</p>
                  <p className="font-bold text-emerald-700">{ref.regularite}%</p>
                </div>
              </div>

            </div>
          ))}
        </div>
      </div>

    </div>
  );
};
