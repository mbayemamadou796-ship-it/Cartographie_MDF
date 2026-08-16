import React, { useState } from 'react';
import { WeeklyReport, ReportingStatus, AppUser } from '@shared/types';
import { UserCheck, Clock, CheckCircle2, AlertTriangle, ArrowRight, MessageSquare, Search } from 'lucide-react';

interface AdminSuiviCasViewProps {
  reports: WeeklyReport[];
  users: AppUser[];
  onSelectReport: (report: WeeklyReport) => void;
  onAssignResponsable: (reportId: string, responsableId: string, responsableName: string) => void;
  onUpdateStatus: (reportId: string, status: ReportingStatus) => void;
}

export const AdminSuiviCasView: React.FC<AdminSuiviCasViewProps> = ({
  reports,
  users,
  onSelectReport,
  onAssignResponsable,
  onUpdateStatus
}) => {
  const [searchTerm, setSearchTerm] = useState('');

  const adminUsers = users.filter(u => u.role === 'admin' || u.role === 'bureau');

  // Columns for Kanban / Pipeline
  const nouveaux = reports.filter(r => r.status === 'NOUVEAU');
  const enCours = reports.filter(r => r.status === 'EN_COURS');
  const traites = reports.filter(r => r.status === 'TRAITE');

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-2xs">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-xl font-extrabold text-slate-900">Pipeline de Traitement des Cas</h1>
            <p className="text-xs text-slate-500">
              Assignez les dossiers aux membres du Bureau National et suivez la résolution de bout en bout
            </p>
          </div>

          <div className="relative min-w-[240px]">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Filtrer les cas..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-indigo-600 focus:bg-white"
            />
          </div>
        </div>
      </div>

      {/* 3 Columns Kanban */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* 1. Nouveaux */}
        <div className="bg-slate-50 rounded-2xl p-4 border border-slate-200/80 space-y-3">
          <div className="flex items-center justify-between px-2 py-1">
            <span className="font-extrabold text-xs text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-amber-500" />
              Nouveaux Cas ({nouveaux.length})
            </span>
          </div>

          <div className="space-y-3">
            {nouveaux.map((report) => (
              <div
                key={report.id}
                onClick={() => onSelectReport(report)}
                className="bg-white p-4 rounded-xl border border-slate-200/80 shadow-2xs hover:border-indigo-300 hover:shadow-xs transition cursor-pointer space-y-2.5"
              >
                <div className="flex items-center justify-between">
                  <span className="font-black text-xs text-slate-900">{report.caseNumber || `#${report.id.slice(-4)}`}</span>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-slate-100 text-slate-700">
                    Zone {report.zone}
                  </span>
                </div>

                <h4 className="text-xs font-bold text-slate-900 line-clamp-2">{report.sujet}</h4>
                <p className="text-[11px] text-slate-500 line-clamp-2">{report.detailsDemandeRetour || report.situationsPrioritaires}</p>

                <div className="pt-2 border-t border-slate-100 flex items-center justify-between">
                  <span className="text-[10px] text-slate-400">
                    {new Date(report.createdAt).toLocaleDateString('fr-FR')}
                  </span>

                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onUpdateStatus(report.id, 'EN_COURS');
                    }}
                    className="px-2.5 py-1 bg-indigo-50 hover:bg-indigo-100 text-indigo-900 rounded-lg text-[10px] font-bold transition"
                  >
                    Prendre en charge →
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* 2. En cours */}
        <div className="bg-slate-50 rounded-2xl p-4 border border-slate-200/80 space-y-3">
          <div className="flex items-center justify-between px-2 py-1">
            <span className="font-extrabold text-xs text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-blue-500" />
              En cours de traitement ({enCours.length})
            </span>
          </div>

          <div className="space-y-3">
            {enCours.map((report) => (
              <div
                key={report.id}
                onClick={() => onSelectReport(report)}
                className="bg-white p-4 rounded-xl border border-blue-200/80 shadow-2xs hover:border-indigo-300 hover:shadow-xs transition cursor-pointer space-y-2.5"
              >
                <div className="flex items-center justify-between">
                  <span className="font-black text-xs text-slate-900">{report.caseNumber || `#${report.id.slice(-4)}`}</span>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-blue-50 text-blue-800">
                    Zone {report.zone}
                  </span>
                </div>

                <h4 className="text-xs font-bold text-slate-900 line-clamp-2">{report.sujet}</h4>

                {/* Responsible Picker */}
                <div className="pt-2 border-t border-slate-100 flex items-center justify-between gap-2" onClick={(e) => e.stopPropagation()}>
                  <select
                    value={report.responsableId || ''}
                    onChange={(e) => {
                      const sel = users.find(u => u.id === e.target.value);
                      if (sel) {
                        onAssignResponsable(report.id, sel.id, sel.nom);
                      }
                    }}
                    className="py-1 px-2 text-[10px] bg-slate-50 border border-slate-200 rounded-md font-bold text-indigo-950 max-w-[150px]"
                  >
                    <option value="">Assigner responsable...</option>
                    {users.map(u => (
                      <option key={u.id} value={u.id}>{u.nom} ({u.role})</option>
                    ))}
                  </select>

                  <button
                    onClick={() => onUpdateStatus(report.id, 'TRAITE')}
                    className="px-2 py-1 bg-emerald-600 hover:bg-emerald-700 text-white rounded-md text-[10px] font-bold transition shrink-0"
                  >
                    Clôturer ✓
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* 3. Traités */}
        <div className="bg-slate-50 rounded-2xl p-4 border border-slate-200/80 space-y-3">
          <div className="flex items-center justify-between px-2 py-1">
            <span className="font-extrabold text-xs text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
              Cas Traités & Clôturés ({traites.length})
            </span>
          </div>

          <div className="space-y-3">
            {traites.map((report) => (
              <div
                key={report.id}
                onClick={() => onSelectReport(report)}
                className="bg-white p-4 rounded-xl border border-emerald-100 shadow-2xs hover:border-emerald-300 hover:shadow-xs transition cursor-pointer space-y-2 opacity-85 hover:opacity-100"
              >
                <div className="flex items-center justify-between">
                  <span className="font-black text-xs text-slate-900">{report.caseNumber || `#${report.id.slice(-4)}`}</span>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-emerald-50 text-emerald-800 flex items-center gap-1">
                    <CheckCircle2 className="w-3 h-3 text-emerald-600" /> Traité
                  </span>
                </div>

                <h4 className="text-xs font-bold text-slate-900 line-clamp-2">{report.sujet}</h4>
                <p className="text-[10px] text-slate-400">
                  Résolu avec {report.reponses?.length || 0} échange(s)
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
