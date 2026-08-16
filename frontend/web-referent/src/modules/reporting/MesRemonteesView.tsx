import React, { useState, useMemo } from 'react';
import { WeeklyReport } from '@shared/types';
import { Search, Filter, MessageSquare, Clock, CheckCircle2, AlertTriangle, Send, Eye, FileText } from 'lucide-react';

interface MesRemonteesViewProps {
  reports: WeeklyReport[];
  currentZone: string;
  onSelectReport: (report: WeeklyReport) => void;
  onNewReportClick: () => void;
}

export const MesRemonteesView: React.FC<MesRemonteesViewProps> = ({
  reports,
  currentZone,
  onSelectReport,
  onNewReportClick
}) => {
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState('');

  const filteredReports = useMemo(() => {
    return reports.filter(r => {
      const matchStatus = filterStatus === 'all' || r.status === filterStatus;
      const matchSearch = 
        `${r.sujet} ${r.caseNumber} ${r.situationsPrioritaires} ${r.detailsDemandeRetour}`
          .toLowerCase()
          .includes(searchTerm.toLowerCase());
      return matchStatus && matchSearch;
    });
  }, [reports, filterStatus, searchTerm]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-2xs">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-xl font-extrabold text-slate-900">Mes Remontées & Dossiers ({filteredReports.length})</h1>
            <p className="text-xs text-slate-500">Suivez l'état de traitement et échangez en direct avec le Bureau National</p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            {/* Search */}
            <div className="relative min-w-[220px]">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Rechercher un dossier..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-9 pr-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-emerald-600 focus:bg-white"
              />
            </div>

            {/* Filter Status */}
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="py-2 px-3 text-xs bg-slate-50 border border-slate-200 rounded-xl font-medium text-slate-700 focus:outline-none focus:border-emerald-600"
            >
              <option value="all">Tous les statuts ({reports.length})</option>
              <option value="NOUVEAU">Nouveau</option>
              <option value="EN_COURS">En cours</option>
              <option value="TRAITE">Traité</option>
            </select>

            <button
              onClick={onNewReportClick}
              className="px-3.5 py-2 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-bold flex items-center gap-1.5 shadow-xs transition"
            >
              <Send className="w-3.5 h-3.5" />
              <span>Nouveau rapport</span>
            </button>
          </div>
        </div>
      </div>

      {/* Reports List */}
      {filteredReports.length === 0 ? (
        <div className="bg-white rounded-2xl border border-dashed border-slate-300 p-12 text-center">
          <p className="text-sm font-bold text-slate-700">Aucun dossier trouvé</p>
          <p className="text-xs text-slate-400 mt-1">Vous n'avez pas de remontée correspondant à ces critères.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {filteredReports.map((report) => {
            const isUrgent = report.priority === 'URGENT' || report.urgenceLevel >= 4;
            const repliesCount = report.reponses?.length || 0;

            return (
              <div
                key={report.id}
                onClick={() => onSelectReport(report)}
                className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-2xs hover:border-emerald-300 hover:shadow-md transition cursor-pointer flex flex-col md:flex-row md:items-center justify-between gap-4"
              >
                <div className="space-y-2 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="font-black text-xs text-slate-900 bg-slate-100 px-2 py-0.5 rounded-md">
                      {report.caseNumber || `#${report.id.slice(-4)}`}
                    </span>
                    <span className={`text-[10px] font-extrabold px-2.5 py-0.5 rounded-md ${
                      report.type === 'PONCTUEL' ? 'bg-purple-100 text-purple-800' : 'bg-blue-100 text-blue-800'
                    }`}>
                      {report.type === 'PONCTUEL' ? 'Cas ponctuel' : 'Périodique'}
                    </span>
                    {isUrgent && (
                      <span className="text-[10px] font-extrabold px-2.5 py-0.5 rounded-md bg-red-100 text-red-800">
                        🚨 Urgent (Niv. {report.urgenceLevel})
                      </span>
                    )}
                    <span className={`text-[10px] font-extrabold px-2.5 py-0.5 rounded-md ${
                      report.status === 'TRAITE' ? 'bg-emerald-100 text-emerald-800' :
                      report.status === 'EN_COURS' ? 'bg-amber-100 text-amber-800' :
                      'bg-slate-100 text-slate-700'
                    }`}>
                      {report.status === 'TRAITE' ? 'Traité' : report.status === 'EN_COURS' ? 'En cours de traitement' : 'Nouveau'}
                    </span>
                  </div>

                  <h3 className="text-sm font-black text-slate-900">
                    {report.sujet || `Compte-rendu semaine du ${report.semaineLundi}`}
                  </h3>

                  <p className="text-xs text-slate-600 line-clamp-2">
                    {report.situationsPrioritaires || report.detailsDemandeRetour || report.nouveauxContactes || 'Consulter le dossier pour plus de détails.'}
                  </p>

                  <div className="flex items-center gap-4 text-[11px] text-slate-400 pt-1">
                    <span>Transmis le {new Date(report.createdAt).toLocaleDateString('fr-FR')}</span>
                    {report.responsableName && (
                      <span className="text-indigo-700 font-semibold">
                        Responsable : {report.responsableName}
                      </span>
                    )}
                  </div>
                </div>

                <div className="flex md:flex-col items-center md:items-end justify-between md:justify-center gap-2 shrink-0 border-t md:border-t-0 pt-3 md:pt-0 border-slate-100">
                  <div className="flex items-center gap-1.5">
                    {repliesCount > 0 ? (
                      <span className="px-2.5 py-1 rounded-lg bg-emerald-50 text-emerald-800 text-xs font-bold flex items-center gap-1">
                        <MessageSquare className="w-3.5 h-3.5" />
                        {repliesCount} message(s)
                      </span>
                    ) : (
                      <span className="text-[11px] text-slate-400">En attente de réponse</span>
                    )}
                  </div>

                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onSelectReport(report);
                    }}
                    className="px-3 py-1.5 rounded-xl bg-slate-900 hover:bg-emerald-700 text-white text-xs font-bold transition flex items-center gap-1"
                  >
                    <Eye className="w-3.5 h-3.5" />
                    <span>Détails</span>
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
