import React, { useState, useMemo } from 'react';
import * as XLSX from 'xlsx';
import { AuditLog, AuditLogCategory, UserRole } from '../../types';
import { ShieldCheck, History, UserCheck, Layers, Users, FileSpreadsheet, AlertTriangle, Search, Filter, Download, Calendar, Eye } from 'lucide-react';

interface AuditLogsViewProps {
  auditLogs?: AuditLog[];
  logs?: AuditLog[];
  userRole?: UserRole;
  zoneNames?: string[];
  onClearLogs?: () => void; // conservé pour compatibilité — les journaux ne sont jamais supprimés (historique officiel)
  onExportLogs?: (count: number) => void;
}

const CATEGORY_CONFIG: Record<
  AuditLogCategory | 'all',
  { label: string; icon: React.ElementType; color: string; bg: string; border: string; desc: string }
> = {
  all: {
    label: 'Tous les journaux',
    icon: History,
    color: 'text-slate-700',
    bg: 'bg-slate-100',
    border: 'border-slate-300',
    desc: 'Vue consolidée de l’ensemble de l’activité système'
  },
  member: {
    label: 'Journal des membres',
    icon: Users,
    color: 'text-emerald-700',
    bg: 'bg-emerald-50',
    border: 'border-emerald-200',
    desc: 'Ajouts, modifications, suppressions et affectations de membres'
  },
  zone: {
    label: 'Journal des zones',
    icon: Layers,
    color: 'text-blue-700',
    bg: 'bg-blue-50',
    border: 'border-blue-200',
    desc: 'Créations, modifications de zones et désignations de référents'
  },
  user: {
    label: 'Journal des utilisateurs',
    icon: UserCheck,
    color: 'text-purple-700',
    bg: 'bg-purple-50',
    border: 'border-purple-200',
    desc: 'Gestion des comptes, attributions de rôles et réinitialisations'
  },
  auth: {
    label: 'Journal des connexions',
    icon: ShieldCheck,
    color: 'text-teal-700',
    bg: 'bg-teal-50',
    border: 'border-teal-200',
    desc: 'Historique des connexions et authentifications'
  },
  data: {
    label: 'Journal des données & imports',
    icon: FileSpreadsheet,
    color: 'text-amber-700',
    bg: 'bg-amber-50',
    border: 'border-amber-200',
    desc: 'Historique des synchronisations, imports et exports'
  },
  system: {
    label: 'Journal système',
    icon: AlertTriangle,
    color: 'text-rose-700',
    bg: 'bg-rose-50',
    border: 'border-rose-200',
    desc: 'Événements système et alertes de maintenance'
  }
};

const ROLE_LABELS: Record<string, string> = {
  admin: 'Administrateur',
  referent: 'Référent',
  user: 'Lecteur'
};

type DatePreset = 'all' | 'today' | 'yesterday' | 'week' | 'month' | 'custom';
type ActionFilter = 'all' | 'ajout' | 'modification' | 'suppression' | 'connexion' | 'deconnexion' | 'import' | 'export';

const DATE_PRESET_OPTIONS: Array<{ value: DatePreset; label: string }> = [
  { value: 'all', label: 'Toutes les dates' },
  { value: 'today', label: 'Aujourd’hui' },
  { value: 'yesterday', label: 'Hier' },
  { value: 'week', label: 'Cette semaine' },
  { value: 'month', label: 'Ce mois' },
  { value: 'custom', label: 'Période personnalisée' }
];

const ACTION_FILTER_OPTIONS: Array<{ value: ActionFilter; label: string; pattern: RegExp | null }> = [
  { value: 'all', label: 'Toutes les actions', pattern: null },
  { value: 'ajout', label: 'Ajout', pattern: /cr[ée]ation|ajout/i },
  { value: 'modification', label: 'Modification', pattern: /modification|mise [àa] jour|r[ée]initialisation/i },
  { value: 'suppression', label: 'Suppression', pattern: /suppression/i },
  { value: 'connexion', label: 'Connexion', pattern: /^connexion/i },
  { value: 'deconnexion', label: 'Déconnexion', pattern: /d[ée]connexion/i },
  { value: 'import', label: 'Import', pattern: /import/i },
  { value: 'export', label: 'Export', pattern: /export/i }
];

/** Date fr "JJ/MM/AAAA" (+ heure "HH:MM[:SS]") -> Date locale. Fallback : timestamp "JJ/MM/AAAA HH:mm". */
function parseLogDate(log: AuditLog): Date | null {
  const dateStr = (log.date || (log.timestamp || '').split(' ')[0] || '').trim();
  const timeStr = (log.time || (log.timestamp || '').split(' ')[1] || '00:00').trim();
  const m = /^(\d{2})\/(\d{2})\/(\d{4})$/.exec(dateStr);
  if (!m) return null;
  const [hh = '0', mi = '0', ss = '0'] = timeStr.split(':');
  const d = new Date(Number(m[3]), Number(m[2]) - 1, Number(m[1]), Number(hh) || 0, Number(mi) || 0, Number(ss) || 0);
  return isNaN(d.getTime()) ? null : d;
}

/** Temps relatif fr ("Il y a 2 minutes") — amélioration UX, spec Cartographie1.md. */
function relativeTime(dt: Date | null): string {
  if (!dt) return '';
  const diffSec = Math.floor((Date.now() - dt.getTime()) / 1000);
  if (diffSec < 0) return '';
  if (diffSec < 60) return 'À l’instant';
  const min = Math.floor(diffSec / 60);
  if (min < 60) return `Il y a ${min} minute${min > 1 ? 's' : ''}`;
  const h = Math.floor(min / 60);
  if (h < 24) return `Il y a ${h} heure${h > 1 ? 's' : ''}`;
  const days = Math.floor(h / 24);
  if (days < 30) return `Il y a ${days} jour${days > 1 ? 's' : ''}`;
  const months = Math.floor(days / 30);
  if (months < 12) return `Il y a ${months} mois`;
  const years = Math.floor(months / 12);
  return `Il y a ${years} an${years > 1 ? 's' : ''}`;
}

function getLogDateDisplay(log: AuditLog): { date: string; time: string } {
  return {
    date: log.date || (log.timestamp || '').split(' ')[0] || '—',
    time: log.time || (log.timestamp || '').split(' ')[1] || '—'
  };
}

function startOfDay(d: Date): Date {
  return new Date(d.getFullYear(), d.getMonth(), d.getDate());
}

export const AuditLogsView: React.FC<AuditLogsViewProps> = ({
  auditLogs,
  logs,
  userRole = 'admin',
  zoneNames = [],
  onExportLogs
}) => {
  const allLogs = auditLogs || logs || [];
  const [selectedCategory, setSelectedCategory] = useState<AuditLogCategory | 'all'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedLogDetail, setSelectedLogDetail] = useState<AuditLog | null>(null);

  // Filtres avancés (spec Cartographie1.md)
  const [datePreset, setDatePreset] = useState<DatePreset>('all');
  const [customFrom, setCustomFrom] = useState('');
  const [customTo, setCustomTo] = useState('');
  const [roleFilter, setRoleFilter] = useState<'all' | UserRole>('all');
  const [actionFilter, setActionFilter] = useState<ActionFilter>('all');
  const [zoneFilter, setZoneFilter] = useState('all');

  // Zones proposées dans le filtre : zones de l'application + zones présentes dans les journaux
  const availableZones = useMemo(() => {
    const set = new Set<string>(zoneNames);
    allLogs.forEach((l) => {
      if (l.zoneName) set.add(l.zoneName);
    });
    return Array.from(set).sort((a, b) => a.localeCompare(b, 'fr'));
  }, [zoneNames, allLogs]);

  // Filtered logs calculation
  const filteredLogs = useMemo(() => {
    const now = new Date();
    const todayStart = startOfDay(now);
    const yesterdayStart = new Date(todayStart.getTime() - 86400000);
    // Semaine commençant le lundi
    const weekStart = new Date(todayStart.getTime() - ((todayStart.getDay() + 6) % 7) * 86400000);
    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
    const customFromDate = customFrom ? startOfDay(new Date(customFrom)) : null;
    const customToDate = customTo ? new Date(startOfDay(new Date(customTo)).getTime() + 86400000 - 1) : null;
    const actionPattern = ACTION_FILTER_OPTIONS.find((o) => o.value === actionFilter)?.pattern ?? null;

    return allLogs.filter((log) => {
      // Category filter
      if (selectedCategory !== 'all' && log.category !== selectedCategory) {
        return false;
      }

      // Role filter
      if (roleFilter !== 'all' && log.userRole !== roleFilter) {
        return false;
      }

      // Action filter (par mot-clé de l'action réalisée)
      if (actionPattern && !actionPattern.test(log.action || '')) {
        return false;
      }

      // Zone filter
      if (zoneFilter !== 'all') {
        const z = zoneFilter.toLowerCase();
        const matchesZone =
          (log.zoneName || '').toLowerCase() === z ||
          (log.category === 'zone' && ((log.targetName || '').toLowerCase() === z || (log.targetItem || '').toLowerCase() === z));
        if (!matchesZone) return false;
      }

      // Date filter
      if (datePreset !== 'all') {
        const dt = parseLogDate(log);
        if (!dt) return false;
        if (datePreset === 'today' && dt < todayStart) return false;
        if (datePreset === 'yesterday' && (dt < yesterdayStart || dt >= todayStart)) return false;
        if (datePreset === 'week' && dt < weekStart) return false;
        if (datePreset === 'month' && dt < monthStart) return false;
        if (datePreset === 'custom') {
          if (customFromDate && dt < customFromDate) return false;
          if (customToDate && dt > customToDate) return false;
        }
      }

      // Search query filter (utilisateur, membre, zone, action, catégorie...)
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim();
        const fullText = [
          log.userName,
          ROLE_LABELS[log.userRole] || log.userRole,
          log.action,
          CATEGORY_CONFIG[log.category]?.label || log.category,
          log.targetName || '',
          log.targetItem || '',
          log.zoneName || '',
          log.champModifie || '',
          log.ancienneValeur || '',
          log.nouvelleValeur || '',
          log.details || '',
          log.date || '',
          log.time || '',
          log.timestamp || ''
        ]
          .join(' ')
          .toLowerCase();

        return fullText.includes(q);
      }

      return true;
    });
  }, [allLogs, selectedCategory, searchQuery, datePreset, customFrom, customTo, roleFilter, actionFilter, zoneFilter]);

  // Lignes d'export (les filtres appliqués sont conservés — spec Cartographie1.md)
  const buildExportRows = () =>
    filteredLogs.map((l) => {
      const { date, time } = getLogDateDisplay(l);
      return {
        'Date': date,
        'Heure': time,
        'Utilisateur': l.userName,
        'Rôle': ROLE_LABELS[l.userRole] || l.userRole,
        'Catégorie': (CATEGORY_CONFIG[l.category]?.label || l.category).replace('Journal des ', ''),
        'Action réalisée': l.action,
        'Élément concerné': l.targetItem || l.targetName || '-',
        'Zone': l.zoneName || '-',
        'Champ modifié': l.champModifie || '',
        'Ancienne valeur': l.ancienneValeur || '',
        'Nouvelle valeur': l.nouvelleValeur || '',
        'Détails': l.details || ''
      };
    });

  // Export logs to Excel (.xlsx)
  const handleExportXlsx = () => {
    if (filteredLogs.length === 0) return;
    const worksheet = XLSX.utils.json_to_sheet(buildExportRows());
    worksheet['!cols'] = [
      { wch: 11 }, { wch: 9 }, { wch: 20 }, { wch: 14 }, { wch: 14 },
      { wch: 28 }, { wch: 24 }, { wch: 18 }, { wch: 16 }, { wch: 18 }, { wch: 18 }, { wch: 50 }
    ];
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Journaux MDF');
    XLSX.writeFile(workbook, `journal_activite_mdf_${new Date().toISOString().slice(0, 10)}.xlsx`);
    onExportLogs?.(filteredLogs.length);
  };

  // Export logs to CSV
  const handleExportCSV = () => {
    if (filteredLogs.length === 0) return;

    const rows = buildExportRows();
    const headers = Object.keys(rows[0]);
    const escape = (v: string) => `"${String(v).replace(/"/g, '""')}"`;
    const csvContent =
      'data:text/csv;charset=utf-8,﻿' +
      [headers.join(';'), ...rows.map((r) => headers.map((h) => escape((r as Record<string, string>)[h])).join(';'))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `journal_activite_mdf_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    onExportLogs?.(filteredLogs.length);
  };

  const selectClass =
    'px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-800 focus:outline-none focus:border-emerald-500 focus:bg-white transition-all cursor-pointer';

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* Header */}
      <div className="bg-white rounded-3xl p-6 border border-emerald-200 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <span className="p-3 rounded-2xl bg-gradient-to-tr from-slate-900 via-emerald-950 to-slate-900 text-emerald-300 border border-emerald-800 shadow-xs">
            <History className="w-6 h-6 text-emerald-400" />
          </span>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-xl font-extrabold text-slate-900 font-['Outfit']">
                Journaux d’Activité & Audit
              </h2>
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-emerald-100 text-emerald-900 border border-emerald-200">
                Administration
              </span>
            </div>
            <p className="text-xs text-slate-500 font-medium mt-0.5">
              Traçabilité complète et horodatée (Europe/Paris) des actions effectuées — historique officiel, jamais supprimé
            </p>
          </div>
        </div>

        {/* Top Buttons */}
        <div className="flex items-center gap-2 flex-wrap">
          <button
            onClick={handleExportXlsx}
            disabled={filteredLogs.length === 0}
            className="inline-flex items-center gap-1.5 px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-2xl border border-emerald-700 transition-all disabled:opacity-50"
          >
            <FileSpreadsheet className="w-4 h-4" />
            <span>Exporter Excel ({filteredLogs.length})</span>
          </button>
          <button
            onClick={handleExportCSV}
            disabled={filteredLogs.length === 0}
            className="inline-flex items-center gap-1.5 px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-xs rounded-2xl border border-slate-200 transition-all disabled:opacity-50"
          >
            <Download className="w-4 h-4 text-emerald-700" />
            <span>Exporter CSV</span>
          </button>
        </div>
      </div>

      {/* Category Pills Switcher */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-7 gap-2.5">
        {(Object.keys(CATEGORY_CONFIG) as Array<AuditLogCategory | 'all'>).map((catKey) => {
          const cfg = CATEGORY_CONFIG[catKey];
          const Icon = cfg.icon;
          const isSelected = selectedCategory === catKey;

          const count = catKey === 'all'
            ? allLogs.length
            : allLogs.filter((l) => l.category === catKey).length;

          return (
            <button
              key={catKey}
              onClick={() => setSelectedCategory(catKey)}
              className={`p-3 rounded-2xl border text-left transition-all flex flex-col justify-between space-y-2 active:scale-95 ${
                isSelected
                  ? `${cfg.bg} ${cfg.border} ring-2 ring-emerald-500/30 text-slate-900 shadow-xs`
                  : 'bg-white border-slate-200 hover:bg-slate-50 text-slate-600'
              }`}
            >
              <div className="flex items-center justify-between">
                <Icon className={`w-4 h-4 ${isSelected ? cfg.color : 'text-slate-400'}`} />
                <span className={`px-2 py-0.5 rounded-full text-[10px] font-black ${
                  isSelected ? 'bg-emerald-600 text-white' : 'bg-slate-100 text-slate-600'
                }`}>
                  {count}
                </span>
              </div>

              <div>
                <span className={`block font-extrabold text-xs leading-tight font-['Outfit'] ${
                  isSelected ? 'text-slate-900' : 'text-slate-700'
                }`}>
                  {cfg.label.replace('Journal des ', '')}
                </span>
              </div>
            </button>
          );
        })}
      </div>

      {/* Search and Filters Bar */}
      <div className="bg-white rounded-2xl p-4 border border-emerald-200 shadow-2xs space-y-3">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="relative w-full sm:w-80">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Rechercher : utilisateur, membre, zone, action, catégorie..."
              className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-800 placeholder-slate-400 focus:outline-none focus:border-emerald-500 focus:bg-white transition-all"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 text-xs font-bold"
              >
                ✕
              </button>
            )}
          </div>

          <div className="text-xs text-slate-500 font-semibold flex items-center gap-2 self-end sm:self-auto">
            <Filter className="w-3.5 h-3.5 text-emerald-600" />
            <span>Affichage de <strong className="text-slate-900">{filteredLogs.length}</strong> journal(aux)</span>
          </div>
        </div>

        {/* Filtres avancés : date, rôle, action, zone */}
        <div className="flex flex-wrap items-center gap-2 pt-1 border-t border-slate-100">
          <select value={datePreset} onChange={(e) => setDatePreset(e.target.value as DatePreset)} className={selectClass} aria-label="Filtre par date">
            {DATE_PRESET_OPTIONS.map((o) => (
              <option key={o.value} value={o.value}>{o.label}</option>
            ))}
          </select>

          {datePreset === 'custom' && (
            <div className="flex items-center gap-1.5">
              <input type="date" value={customFrom} onChange={(e) => setCustomFrom(e.target.value)} className={selectClass} aria-label="Date de début" />
              <span className="text-xs text-slate-400 font-bold">→</span>
              <input type="date" value={customTo} onChange={(e) => setCustomTo(e.target.value)} className={selectClass} aria-label="Date de fin" />
            </div>
          )}

          <select value={roleFilter} onChange={(e) => setRoleFilter(e.target.value as 'all' | UserRole)} className={selectClass} aria-label="Filtre par rôle">
            <option value="all">Tous les rôles</option>
            <option value="admin">Administrateur</option>
            <option value="referent">Référent</option>
            <option value="user">Lecteur</option>
          </select>

          <select value={actionFilter} onChange={(e) => setActionFilter(e.target.value as ActionFilter)} className={selectClass} aria-label="Filtre par action">
            {ACTION_FILTER_OPTIONS.map((o) => (
              <option key={o.value} value={o.value}>{o.label}</option>
            ))}
          </select>

          <select value={zoneFilter} onChange={(e) => setZoneFilter(e.target.value)} className={selectClass} aria-label="Filtre par zone">
            <option value="all">Toutes les zones</option>
            {availableZones.map((z) => (
              <option key={z} value={z}>{z}</option>
            ))}
          </select>

          {(datePreset !== 'all' || roleFilter !== 'all' || actionFilter !== 'all' || zoneFilter !== 'all') && (
            <button
              onClick={() => {
                setDatePreset('all');
                setCustomFrom('');
                setCustomTo('');
                setRoleFilter('all');
                setActionFilter('all');
                setZoneFilter('all');
              }}
              className="px-3 py-2 text-xs font-bold text-rose-600 hover:text-rose-800 hover:bg-rose-50 rounded-xl transition-colors"
            >
              ✕ Réinitialiser les filtres
            </button>
          )}
        </div>
      </div>

      {/* Logs Table / List */}
      <div className="bg-white rounded-3xl border border-emerald-200 shadow-sm overflow-hidden">
        {filteredLogs.length === 0 ? (
          <div className="p-12 text-center space-y-3">
            <div className="w-12 h-12 rounded-2xl bg-slate-100 text-slate-400 flex items-center justify-center mx-auto">
              <History className="w-6 h-6" />
            </div>
            <p className="text-sm font-bold text-slate-700">Aucune entrée trouvée dans les journaux</p>
            <p className="text-xs text-slate-400">
              {searchQuery ? 'Essayez de modifier votre terme de recherche ou vos filtres.' : 'Aucune activité ne correspond aux filtres sélectionnés.'}
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-slate-50 border-b border-emerald-100 text-slate-500 font-extrabold uppercase text-[10px] tracking-wider">
                  <th className="py-3.5 px-4">Date</th>
                  <th className="py-3.5 px-4">Heure</th>
                  <th className="py-3.5 px-4">Utilisateur</th>
                  <th className="py-3.5 px-4">Rôle</th>
                  <th className="py-3.5 px-4">Catégorie</th>
                  <th className="py-3.5 px-4">Action réalisée</th>
                  <th className="py-3.5 px-4">Élément concerné</th>
                  <th className="py-3.5 px-4">Détails de la modification</th>
                  <th className="py-3.5 px-4 text-right pr-6">Fiche</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-medium text-slate-800">
                {filteredLogs.map((log) => {
                  const cfg = CATEGORY_CONFIG[log.category] || CATEGORY_CONFIG.all;
                  const Icon = cfg.icon;
                  const { date, time } = getLogDateDisplay(log);
                  const relative = relativeTime(parseLogDate(log));

                  return (
                    <tr key={log.id} className="hover:bg-emerald-50/40 transition-colors group">
                      {/* Date */}
                      <td className="py-3.5 px-4 whitespace-nowrap">
                        <div className="flex items-center gap-1.5 font-bold text-slate-900">
                          <Calendar className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                          <span>{date}</span>
                        </div>
                        {relative && (
                          <span className="block text-[10px] text-emerald-700 font-semibold mt-0.5 pl-5">
                            {relative}
                          </span>
                        )}
                      </td>

                      {/* Heure */}
                      <td className="py-3.5 px-4 whitespace-nowrap">
                        <span className="font-bold text-slate-900 font-mono">{time}</span>
                      </td>

                      {/* Utilisateur */}
                      <td className="py-3.5 px-4 whitespace-nowrap">
                        <span className="font-bold text-slate-900">{log.userName}</span>
                      </td>

                      {/* Rôle */}
                      <td className="py-3.5 px-4 whitespace-nowrap">
                        <span className={`inline-block px-2 py-0.5 rounded-md text-[9px] font-black uppercase ${
                          log.userRole === 'admin'
                            ? 'bg-purple-100 text-purple-900'
                            : log.userRole === 'referent'
                            ? 'bg-blue-100 text-blue-900'
                            : 'bg-slate-100 text-slate-700'
                        }`}>
                          {ROLE_LABELS[log.userRole] || log.userRole}
                        </span>
                      </td>

                      {/* Category Badge */}
                      <td className="py-3.5 px-4 whitespace-nowrap">
                        <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-xl text-[10px] font-bold ${cfg.bg} ${cfg.color} border ${cfg.border}`}>
                          <Icon className="w-3 h-3" />
                          <span>{cfg.label.replace('Journal des ', '')}</span>
                        </span>
                      </td>

                      {/* Action */}
                      <td className="py-3.5 px-4">
                        <span className="font-extrabold text-slate-900 block font-['Outfit']">
                          {log.action}
                        </span>
                      </td>

                      {/* Élément concerné */}
                      <td className="py-3.5 px-4">
                        {(log.targetItem || log.targetName) ? (
                          <span className="font-bold text-emerald-950 block">
                            {log.targetItem || log.targetName}
                          </span>
                        ) : (
                          <span className="text-slate-400">-</span>
                        )}
                        {log.zoneName && (
                          <span className="text-[10px] text-slate-500 font-medium block">
                            Zone : {log.zoneName}
                          </span>
                        )}
                      </td>

                      {/* Details / Changed field */}
                      <td className="py-3.5 px-4 max-w-xs">
                        {log.champModifie ? (
                          <div className="text-[11px] space-y-0.5">
                            <span className="font-bold text-slate-700 block">Champ : {log.champModifie}</span>
                            <div className="text-[10px] text-slate-500 font-mono">
                              {log.ancienneValeur && <span className="text-rose-600 line-through mr-1">{log.ancienneValeur}</span>}
                              {log.nouvelleValeur && <span className="text-emerald-700 font-bold">→ {log.nouvelleValeur}</span>}
                            </div>
                          </div>
                        ) : (
                          <p className="text-[11px] text-slate-600 line-clamp-2">
                            {log.details || 'Aucun détail supplémentaire'}
                          </p>
                        )}
                      </td>

                      {/* Action Button */}
                      <td className="py-3.5 px-4 text-right pr-6 whitespace-nowrap">
                        <button
                          onClick={() => setSelectedLogDetail(log)}
                          className="p-1.5 bg-slate-100 hover:bg-emerald-100 text-slate-600 hover:text-emerald-900 rounded-xl transition-colors inline-flex items-center gap-1 font-bold text-[11px]"
                        >
                          <Eye className="w-3.5 h-3.5" />
                          <span>Voir fiche</span>
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Detail Modal */}
      {selectedLogDetail && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl max-w-lg w-full border border-emerald-200 shadow-2xl overflow-hidden flex flex-col">
            <div className="p-5 bg-gradient-to-r from-slate-900 via-emerald-950 to-slate-900 text-white flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <History className="w-5 h-5 text-emerald-400" />
                <div>
                  <h3 className="font-bold text-base font-['Outfit']">Détails de l’entrée du journal</h3>
                  <p className="text-[11px] text-emerald-200 font-medium">Référence : #{selectedLogDetail.id}</p>
                </div>
              </div>
              <button
                onClick={() => setSelectedLogDetail(null)}
                className="p-1.5 rounded-full hover:bg-white/10 text-slate-300 hover:text-white"
              >
                ✕
              </button>
            </div>

            <div className="p-6 space-y-4 text-xs">
              <div className="grid grid-cols-2 gap-3 bg-slate-50 p-4 rounded-2xl border border-slate-200">
                <div>
                  <span className="text-[10px] text-slate-400 font-bold uppercase block">Date & Heure (Europe/Paris)</span>
                  <span className="font-bold text-slate-900">
                    {getLogDateDisplay(selectedLogDetail).date} à {getLogDateDisplay(selectedLogDetail).time}
                  </span>
                  {relativeTime(parseLogDate(selectedLogDetail)) && (
                    <span className="block text-[10px] text-emerald-700 font-semibold mt-0.5">
                      {relativeTime(parseLogDate(selectedLogDetail))}
                    </span>
                  )}
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 font-bold uppercase block">Utilisateur</span>
                  <span className="font-bold text-slate-900">
                    {selectedLogDetail.userName} ({ROLE_LABELS[selectedLogDetail.userRole] || selectedLogDetail.userRole})
                  </span>
                </div>
              </div>

              <div className="space-y-2">
                <span className="text-[10px] text-slate-400 font-bold uppercase block">Action & Catégorie</span>
                <p className="font-extrabold text-slate-900 text-sm font-['Outfit']">{selectedLogDetail.action}</p>
                {(selectedLogDetail.targetItem || selectedLogDetail.targetName) && (
                  <p className="text-slate-700 font-medium">Élément concerné : <strong>{selectedLogDetail.targetItem || selectedLogDetail.targetName}</strong></p>
                )}
                {selectedLogDetail.zoneName && (
                  <p className="text-slate-700 font-medium">Zone : <strong>{selectedLogDetail.zoneName}</strong></p>
                )}
              </div>

              {selectedLogDetail.champModifie && (
                <div className="bg-emerald-50/80 p-4 rounded-2xl border border-emerald-200 space-y-1.5">
                  <span className="font-extrabold text-emerald-950 block">Audit des modifications :</span>
                  <p className="text-slate-700">Champ modifié : <strong>{selectedLogDetail.champModifie}</strong></p>
                  {selectedLogDetail.ancienneValeur && (
                    <p className="text-rose-700">Ancienne valeur : <strong>{selectedLogDetail.ancienneValeur}</strong></p>
                  )}
                  {selectedLogDetail.nouvelleValeur && (
                    <p className="text-emerald-800">Nouvelle valeur : <strong>{selectedLogDetail.nouvelleValeur}</strong></p>
                  )}
                </div>
              )}

              {selectedLogDetail.details && (
                <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200">
                  <span className="text-[10px] text-slate-400 font-bold uppercase block mb-1">Rapport complémentaire</span>
                  <p className="text-slate-800 font-medium whitespace-pre-wrap leading-relaxed">{selectedLogDetail.details}</p>
                </div>
              )}

              <div className="pt-2 text-right">
                <button
                  onClick={() => setSelectedLogDetail(null)}
                  className="px-5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl shadow-xs text-xs"
                >
                  Fermer
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
