import React, { useState, useMemo } from 'react';
import { WeeklyReport, ReportingStatus, CustomZone } from '@shared/types';
import { Search, Filter, Eye, MessageSquare, AlertTriangle, CheckCircle2, Clock, MapPin, UserCheck, ShieldAlert } from 'lucide-react';

interface AdminRemonteesListViewProps {
  reports: WeeklyReport[];
  customZones: CustomZone[];
  onSelectReport: (report: WeeklyReport) => void;
  onUpdateStatus: (reportId: string, status: ReportingStatus) => void;
}

export const AdminRemonteesListView: React.FC<AdminRemonteesListViewProps> = ({
  reports,
  customZones,
  onSelectReport,
  onUpdateStatus
}) => {
  const [activeSubTab, setActiveSubTab] = useState<'all' | 'zone' | 'referent' | 'urgents' | 'en_attente'>('all');
  const [selectedZoneFilter, setSelectedZoneFilter] = useState<string>('all');
  const [selectedStatusFilter, setSelectedStatusFilter] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState('');

  // Unique list of referent names
  const referents = useMemo(() => {
    return Array.from(new Set(reports.map(r => r.referentName).filter(Boolean))).sort();
  }, [reports]);

  // Unique zones
  const zonesList = useMemo(() => {
    return Array.from(new Set(reports.map(r => r.zone).filter(Boolean))).sort();
  }, [reports]);

  const filteredReports = useMemo(() => {
    return reports.filter(r => {
      // Subtab filter
      if (activeSubTab === 'urgents' && !(r.priority === 'URGENT' || r.urgenceLevel >= 4)) return false;
      if (activeSubTab === 'en_attente' && r.status !== 'NOUVEAU') return false;

      // Dropdown filters
      if (selectedZoneFilter !== 'all' && r.zone?.toLowerCase() !== selectedZoneFilter.toLowerCase()) return false;
      if (selectedStatusFilter !== 'all' && r.status !== selectedStatusFilter) return false;

      // Search term
      const searchStr = `${r.sujet} ${r.caseNumber} ${r.referentName} ${r.zone} ${r.detailsDemandeRetour} ${r.situationsPrioritaires}`.toLowerCase();
      if (searchTerm && !searchStr.includes(searchTerm.toLowerCase())) return false;

      return true;
    });
  }, [reports, activeSubTab, selectedZoneFilter, selectedStatusFilter, searchTerm]);

  return (
    <div className="space-y-6">
      {/* Header & Subtabs */}
      <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-2xs space-y-4">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-xl font-extrabold text-slate-900">Remontées des Référents ({filteredReports.length})</h1>
            <p className="text-xs text-slate-500">Toutes les transmissions territoriales centralisées pour arbitrage</p>
          </div>

          {/* Search bar */}
          <div className="relative min-w-[260px]">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Rechercher par référent, zone, sujet..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-indigo-600 focus:bg-white"
            />
          </div>
        </div>

        {/* Subtabs Bar */}
        <div className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-slate-100">
          <div className="flex flex-wrap items-center gap-1.5">
            <button
              onClick={() => setActiveSubTab('all')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition ${
                activeSubTab === 'all' ? 'bg-indigo-900 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              Toutes ({reports.length})
            </button>

            <button
              onClick={() => setActiveSubTab('en_attente')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-1 ${
                activeSubTab === 'en_attente' ? 'bg-amber-600 text-white' : 'bg-amber-50 text-amber-900 hover:bg-amber-100'
              }`}
            >
              <span>⏳ À traiter</span>
              <span className="text-[10px] font-black px-1.5 rounded-full bg-white/30">
                {reports.filter(r => r.status === 'NOUVEAU').length}
              </span>
            </button>

            <button
              onClick={() => setActiveSubTab('urgents')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-1 ${
                activeSubTab === 'urgents' ? 'bg-red-600 text-white' : 'bg-red-50 text-red-900 hover:bg-red-100'
              }`}
            >
              <span>🚨 Cas Urgents</span>
              <span className="text-[10px] font-black px-1.5 rounded-full bg-white/30">
                {reports.filter(r => (r.priority === 'URGENT' || r.urgenceLevel >= 4) && r.status !== 'TRAITE').length}
              </span>
            </button>
          </div>

          {/* Zone & Status Dropdowns */}
          <div className="flex items-center gap-2">
            <select
              value={selectedZoneFilter}
              onChange={(e) => setSelectedZoneFilter(e.target.value)}
              className="py-1.5 px-2.5 text-xs bg-slate-50 border border-slate-200 rounded-lg text-slate-700 font-medium"
            >
              <option value="all">Toutes les zones</option>
              {zonesList.map(z => (
                <option key={z} value={z}>Zone {z}</option>
              ))}
            </select>

            <select
              value={selectedStatusFilter}
              onChange={(e) => setSelectedStatusFilter(e.target.value)}
              className="py-1.5 px-2.5 text-xs bg-slate-50 border border-slate-200 rounded-lg text-slate-700 font-medium"
            >
              <option value="all">Tous les statuts</option>
              <option value="NOUVEAU">Nouveau</option>
              <option value="EN_COURS">En cours</option>
              <option value="TRAITE">Traité</option>
            </select>
          </div>
        </div>
      </div>

      {/* Reports Table / Card List */}
      {filteredReports.length === 0 ? (
        <div className="bg-white rounded-2xl border border-dashed border-slate-300 p-12 text-center">
          <p className="text-sm font-bold text-slate-700">Aucune remontée ne correspond aux filtres</p>
          <p className="text-xs text-slate-400 mt-1">Modifiez vos critères de sélection pour afficher les dossiers.</p>
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
                className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-2xs hover:border-indigo-300 hover:shadow-md transition cursor-pointer flex flex-col md:flex-row md:items-center justify-between gap-4"
              >
                <div className="space-y-2 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="font-black text-xs text-slate-900 bg-slate-100 px-2.5 py-0.5 rounded-md">
                      {report.caseNumber || `#${report.id.slice(-4)}`}
                    </span>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-indigo-50 text-indigo-900 border border-indigo-100">
                      📍 Zone {report.zone}
                    </span>
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-md ${
                      report.type === 'PONCTUEL' ? 'bg-purple-100 text-purple-800' : 'bg-blue-100 text-blue-800'
                    }`}>
                      {report.type === 'PONCTUEL' ? 'Cas Ponctuel' : 'Rapport Périodique'}
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
                      {report.status === 'TRAITE' ? 'Traité' : report.status === 'EN_COURS' ? 'En cours' : 'À traiter'}
                    </span>
                  </div>

                  <h3 className="text-sm font-black text-slate-900">
                    {report.sujet || `Rapport d'activité - Semaine du ${report.semaineLundi}`}
                  </h3>

                  <p className="text-xs text-slate-600 line-clamp-2">
                    {report.detailsDemandeRetour || report.situationsPrioritaires || report.nouveauxContactes || 'Ouvrir le dossier pour lire le contenu complet.'}
                  </p>

                  <div className="flex flex-wrap items-center gap-4 text-[11px] text-slate-500 pt-1">
                    <span>Référent : <strong className="text-slate-800">{report.referentName}</strong></span>
                    <span>Date : {new Date(report.createdAt).toLocaleDateString('fr-FR')}</span>
                    {report.responsableName && (
                      <span className="text-indigo-700 font-bold">
                        Responsable : {report.responsableName}
                      </span>
                    )}
                  </div>
                </div>

                <div className="flex md:flex-col items-center md:items-end justify-between md:justify-center gap-2 shrink-0 border-t md:border-t-0 pt-3 md:pt-0 border-slate-100">
                  <div className="flex items-center gap-1.5">
                    {repliesCount > 0 && (
                      <span className="px-2 py-0.5 rounded-md bg-indigo-50 text-indigo-800 text-[11px] font-bold flex items-center gap-1">
                        <MessageSquare className="w-3 h-3" />
                        {repliesCount} message(s)
                      </span>
                    )}
                  </div>

                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onSelectReport(report);
                    }}
                    className="px-3.5 py-1.5 rounded-xl bg-indigo-900 hover:bg-indigo-800 text-white text-xs font-bold transition flex items-center gap-1 shadow-xs"
                  >
                    <Eye className="w-3.5 h-3.5" />
                    <span>Ouvrir & Répondre</span>
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
