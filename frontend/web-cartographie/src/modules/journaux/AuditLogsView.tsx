import React, { useState, useMemo } from 'react';
import { AuditLog, AuditLogCategory, UserRole } from '../../types';
import { ShieldCheck, History, UserCheck, Layers, Users, FileSpreadsheet, AlertTriangle, Search, Filter, Download, Trash2, Calendar, Clock, Eye, CheckCircle, XCircle } from 'lucide-react';

interface AuditLogsViewProps {
  auditLogs?: AuditLog[];
  logs?: AuditLog[];
  userRole?: UserRole;
  onClearLogs?: () => void;
  onExportLogs?: () => void;
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
    desc: 'Historique des synchronisations et réconciliations'
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

export const AuditLogsView: React.FC<AuditLogsViewProps> = ({
  auditLogs,
  logs,
  userRole = 'admin',
  onClearLogs,
  onExportLogs
}) => {
  const allLogs = auditLogs || logs || [];
  const [selectedCategory, setSelectedCategory] = useState<AuditLogCategory | 'all'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedLogDetail, setSelectedLogDetail] = useState<AuditLog | null>(null);

  // Filtered logs calculation
  const filteredLogs = useMemo(() => {
    return allLogs.filter((log) => {
      // Category filter
      if (selectedCategory !== 'all' && log.category !== selectedCategory) {
        return false;
      }

      // Search query filter
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim();
        const fullText = [
          log.userName,
          log.action,
          log.targetItem || '',
          log.zoneName || '',
          log.champModifie || '',
          log.ancienneValeur || '',
          log.nouvelleValeur || '',
          log.details || '',
          log.date,
          log.time
        ]
          .join(' ')
          .toLowerCase();

        return fullText.includes(q);
      }

      return true;
    });
  }, [logs, selectedCategory, searchQuery]);

  // Export logs to CSV
  const handleExportCSV = () => {
    if (filteredLogs.length === 0) return;

    const headers = ['ID', 'Date', 'Heure', 'Utilisateur', 'Rôle', 'Catégorie', 'Action', 'Élément Concerné', 'Zone', 'Champ Modifié', 'Ancienne Valeur', 'Nouvelle Valeur', 'Détails'];
    
    const rows = filteredLogs.map((l) => [
      l.id,
      l.date,
      l.time,
      `"${l.userName.replace(/"/g, '""')}"`,
      l.userRole,
      l.category,
      `"${l.action.replace(/"/g, '""')}"`,
      `"${(l.targetItem || '').replace(/"/g, '""')}"`,
      `"${(l.zoneName || '').replace(/"/g, '""')}"`,
      `"${(l.champModifie || '').replace(/"/g, '""')}"`,
      `"${(l.ancienneValeur || '').replace(/"/g, '""')}"`,
      `"${(l.nouvelleValeur || '').replace(/"/g, '""')}"`,
      `"${(l.details || '').replace(/"/g, '""')}"`
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,\uFEFF' + [headers.join(';'), ...rows.map((e) => e.join(';'))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `journal_activite_mdf_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

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
              Traçabilité complète des actions effectuées dans l’application Mbok de France
            </p>
          </div>
        </div>

        {/* Top Buttons */}
        <div className="flex items-center gap-2 flex-wrap">
          <button
            onClick={handleExportCSV}
            disabled={filteredLogs.length === 0}
            className="inline-flex items-center gap-1.5 px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-xs rounded-2xl border border-slate-200 transition-all disabled:opacity-50"
          >
            <Download className="w-4 h-4 text-emerald-700" />
            <span>Exporter CSV ({filteredLogs.length})</span>
          </button>

          {userRole === 'admin' && onClearLogs && (
            <button
              onClick={() => {
                if (window.confirm('Voulez-vous vraiment effacer l’historique des journaux ?')) {
                  onClearLogs();
                }
              }}
              className="inline-flex items-center gap-1.5 px-3.5 py-2.5 bg-rose-50 hover:bg-rose-100 text-rose-700 font-bold text-xs rounded-2xl border border-rose-200 transition-all"
            >
              <Trash2 className="w-4 h-4 text-rose-600" />
              <span>Effacer journaux</span>
            </button>
          )}
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
      <div className="bg-white rounded-2xl p-4 border border-emerald-200 shadow-2xs flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Rechercher par utilisateur, action, membre..."
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

      {/* Logs Table / List */}
      <div className="bg-white rounded-3xl border border-emerald-200 shadow-sm overflow-hidden">
        {filteredLogs.length === 0 ? (
          <div className="p-12 text-center space-y-3">
            <div className="w-12 h-12 rounded-2xl bg-slate-100 text-slate-400 flex items-center justify-center mx-auto">
              <History className="w-6 h-6" />
            </div>
            <p className="text-sm font-bold text-slate-700">Aucune entrée trouvée dans les journaux</p>
            <p className="text-xs text-slate-400">
              {searchQuery ? 'Essayez de modifier votre terme de recherche.' : 'Aucune activité n’a encore été enregistrée dans cette catégorie.'}
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-slate-50 border-b border-emerald-100 text-slate-500 font-extrabold uppercase text-[10px] tracking-wider">
                  <th className="py-3.5 px-4">Horodatage</th>
                  <th className="py-3.5 px-4">Utilisateur</th>
                  <th className="py-3.5 px-4">Catégorie</th>
                  <th className="py-3.5 px-4">Action Réalisée</th>
                  <th className="py-3.5 px-4">Élément / Zone</th>
                  <th className="py-3.5 px-4">Détails de la modification</th>
                  <th className="py-3.5 px-4 text-right pr-6">Fiche</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-medium text-slate-800">
                {filteredLogs.map((log) => {
                  const cfg = CATEGORY_CONFIG[log.category] || CATEGORY_CONFIG.all;
                  const Icon = cfg.icon;

                  return (
                    <tr key={log.id} className="hover:bg-emerald-50/40 transition-colors group">
                      {/* Date & Time */}
                      <td className="py-3.5 px-4 whitespace-nowrap">
                        <div className="flex items-center gap-1.5 font-bold text-slate-900">
                          <Calendar className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                          <span>{log.date}</span>
                          <span className="text-slate-400 font-normal">à {log.time}</span>
                        </div>
                      </td>

                      {/* User */}
                      <td className="py-3.5 px-4 whitespace-nowrap">
                        <div className="space-y-0.5">
                          <span className="font-bold text-slate-900 block">{log.userName}</span>
                          <span className={`inline-block px-2 py-0.2 rounded-md text-[9px] font-black uppercase ${
                            log.userRole === 'admin'
                              ? 'bg-purple-100 text-purple-900'
                              : log.userRole === 'referent'
                              ? 'bg-blue-100 text-blue-900'
                              : 'bg-slate-100 text-slate-700'
                          }`}>
                            {log.userRole === 'admin' ? 'Administrateur' : log.userRole === 'referent' ? 'Référent' : 'Utilisateur'}
                          </span>
                        </div>
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

                      {/* Target Item / Zone */}
                      <td className="py-3.5 px-4">
                        {log.targetItem && (
                          <span className="font-bold text-emerald-950 block">
                            {log.targetItem}
                          </span>
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
                  <span className="text-[10px] text-slate-400 font-bold uppercase block">Date & Heure</span>
                  <span className="font-bold text-slate-900">{selectedLogDetail.date} à {selectedLogDetail.time}</span>
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 font-bold uppercase block">Utilisateur</span>
                  <span className="font-bold text-slate-900">{selectedLogDetail.userName} ({selectedLogDetail.userRole})</span>
                </div>
              </div>

              <div className="space-y-2">
                <span className="text-[10px] text-slate-400 font-bold uppercase block">Action & Catégorie</span>
                <p className="font-extrabold text-slate-900 text-sm font-['Outfit']">{selectedLogDetail.action}</p>
                {selectedLogDetail.targetItem && (
                  <p className="text-slate-700 font-medium">Élément concerné : <strong>{selectedLogDetail.targetItem}</strong></p>
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
