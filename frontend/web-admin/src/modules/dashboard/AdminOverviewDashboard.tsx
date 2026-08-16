import React from 'react';
import { WeeklyReport, Member, CustomZone, AppUser } from '@shared/types';
import { Send, CheckCircle2, Clock, AlertTriangle, Users, MapPin, ArrowRight, ShieldCheck } from 'lucide-react';

interface AdminOverviewDashboardProps {
  reports: WeeklyReport[];
  members: Member[];
  customZones: CustomZone[];
  users: AppUser[];
  onNavigate: (tab: any) => void;
  onSelectReport: (report: WeeklyReport) => void;
}

export const AdminOverviewDashboard: React.FC<AdminOverviewDashboardProps> = ({
  reports,
  members,
  customZones,
  users,
  onNavigate,
  onSelectReport
}) => {
  const totalRemontees = reports.length;
  const enAttente = reports.filter(r => r.status === 'NOUVEAU').length;
  const enCours = reports.filter(r => r.status === 'EN_COURS').length;
  const traites = reports.filter(r => r.status === 'TRAITE').length;
  const urgents = reports.filter(r => (r.priority === 'URGENT' || r.urgenceLevel >= 4) && r.status !== 'TRAITE').length;

  const referentsCount = users.filter(u => u.role === 'referent' || u.role === 'admin').length;

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-slate-950 via-indigo-950 to-slate-900 rounded-2xl p-6 text-white shadow-md">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-2 px-2.5 py-1 bg-indigo-500/20 rounded-full text-indigo-300 text-xs font-semibold mb-2 border border-indigo-500/30">
              <ShieldCheck className="w-3.5 h-3.5" /> Cockpit National MDF
            </div>
            <h1 className="text-2xl font-black tracking-tight">Supervision & Arbitrage National</h1>
            <p className="text-xs text-slate-300 mt-1 max-w-2xl">
              Tableau de bord de synthèse pour la coordination des antennes territoriales, le traitement des signalements et le pilotage associatif.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => onNavigate('remontees')}
              className="px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs flex items-center gap-2 shadow-md transition cursor-pointer"
            >
              <Send className="w-4 h-4" />
              <span>Traiter les remontées ({enAttente + enCours})</span>
            </button>
          </div>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        <div 
          onClick={() => onNavigate('remontees')}
          className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-2xs hover:border-indigo-300 transition cursor-pointer"
        >
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold text-slate-500 uppercase">Total Dossiers</span>
            <div className="w-8 h-8 rounded-xl bg-slate-100 text-slate-700 flex items-center justify-center font-bold">
              📁
            </div>
          </div>
          <div className="text-2xl font-black text-slate-900">{totalRemontees}</div>
          <p className="text-xs text-slate-500 mt-1">Toutes antennes</p>
        </div>

        <div 
          onClick={() => onNavigate('remontees')}
          className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-2xs hover:border-amber-300 transition cursor-pointer"
        >
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold text-slate-500 uppercase">À traiter (Nouveaux)</span>
            <div className="w-8 h-8 rounded-xl bg-amber-50 text-amber-700 flex items-center justify-center font-bold">
              ⏳
            </div>
          </div>
          <div className="text-2xl font-black text-amber-600">{enAttente}</div>
          <p className="text-xs text-slate-500 mt-1">Non encore ouverts</p>
        </div>

        <div 
          onClick={() => onNavigate('cas')}
          className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-2xs hover:border-blue-300 transition cursor-pointer"
        >
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold text-slate-500 uppercase">En cours</span>
            <div className="w-8 h-8 rounded-xl bg-blue-50 text-blue-700 flex items-center justify-center font-bold">
              🔄
            </div>
          </div>
          <div className="text-2xl font-black text-blue-600">{enCours}</div>
          <p className="text-xs text-slate-500 mt-1">Responsable assigné</p>
        </div>

        <div 
          onClick={() => onNavigate('cas')}
          className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-2xs hover:border-red-300 transition cursor-pointer"
        >
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold text-slate-500 uppercase">Cas Urgents</span>
            <div className="w-8 h-8 rounded-xl bg-red-50 text-red-700 flex items-center justify-center font-bold">
              🚨
            </div>
          </div>
          <div className="text-2xl font-black text-red-600">{urgents}</div>
          <p className="text-xs text-red-500 font-semibold mt-1">Niveau 4-5 critique</p>
        </div>

        <div 
          onClick={() => onNavigate('remontees')}
          className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-2xs hover:border-emerald-300 transition cursor-pointer"
        >
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold text-slate-500 uppercase">Cas Traités</span>
            <div className="w-8 h-8 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center font-bold">
              ✅
            </div>
          </div>
          <div className="text-2xl font-black text-emerald-600">{traites}</div>
          <p className="text-xs text-slate-500 mt-1">Clôturés avec succès</p>
        </div>
      </div>

      {/* Dual Column: Urgent / En attente priority queue + Activity by zone */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Priority Queue (2 cols) */}
        <div className="lg:col-span-2 bg-white rounded-2xl border border-slate-200/80 p-6 shadow-2xs">
          <div className="flex items-center justify-between mb-5">
            <div>
              <h2 className="text-base font-bold text-slate-900">Remontées nécessitant un arbitrage</h2>
              <p className="text-xs text-slate-500">Dossiers récents en attente de réponse du Bureau</p>
            </div>
            <button
              onClick={() => onNavigate('remontees')}
              className="text-xs font-bold text-indigo-700 hover:text-indigo-800 flex items-center gap-1"
            >
              <span>Voir tout</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="space-y-3">
            {reports
              .filter(r => r.status !== 'TRAITE')
              .slice(0, 5)
              .map((report) => {
                const isUrgent = report.priority === 'URGENT' || report.urgenceLevel >= 4;
                return (
                  <div
                    key={report.id}
                    onClick={() => onSelectReport(report)}
                    className="p-4 rounded-xl border border-slate-100 hover:border-indigo-200 hover:bg-indigo-50/30 transition cursor-pointer flex items-start justify-between gap-4"
                  >
                    <div className="space-y-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="font-extrabold text-xs text-slate-900 bg-slate-100 px-2 py-0.5 rounded-md">
                          {report.caseNumber || `#${report.id.slice(-4)}`}
                        </span>
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-slate-100 text-slate-800">
                          Zone {report.zone}
                        </span>
                        {isUrgent && (
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-red-100 text-red-800">
                            🚨 Urgent
                          </span>
                        )}
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-md ${
                          report.status === 'EN_COURS' ? 'bg-amber-100 text-amber-800' : 'bg-slate-200 text-slate-800'
                        }`}>
                          {report.status === 'EN_COURS' ? 'En cours' : 'Nouveau'}
                        </span>
                      </div>

                      <h4 className="text-sm font-bold text-slate-900">
                        {report.sujet || `Rapport d'activité semaine du ${report.semaineLundi}`}
                      </h4>

                      <p className="text-xs text-slate-600 line-clamp-1">
                        Transmis par <strong className="text-slate-800">{report.referentName}</strong> — {report.detailsDemandeRetour || report.situationsPrioritaires || 'Voir la fiche complète'}
                      </p>
                    </div>

                    <div className="text-right shrink-0">
                      <span className="text-[10px] text-slate-400 block">
                        {new Date(report.createdAt).toLocaleDateString('fr-FR')}
                      </span>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          onSelectReport(report);
                        }}
                        className="mt-2 px-2.5 py-1 bg-indigo-900 hover:bg-indigo-800 text-white rounded-lg text-[10px] font-bold"
                      >
                        Traiter
                      </button>
                    </div>
                  </div>
                );
              })}
          </div>
        </div>

        {/* Right Column: Zone stats & Quick Tools (1 col) */}
        <div className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-2xs space-y-4">
          <h2 className="text-base font-bold text-slate-900">Activité par Zone</h2>

          <div className="space-y-2.5">
            {customZones.slice(0, 6).map((z) => {
              const countZone = reports.filter(r => r.zone?.toLowerCase() === z.name.toLowerCase()).length;
              return (
                <div key={z.id} className="flex items-center justify-between p-2.5 rounded-xl bg-slate-50 border border-slate-100 text-xs">
                  <span className="font-bold text-slate-800">{z.name}</span>
                  <span className="font-bold text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded-md">
                    {countZone} remontée(s)
                  </span>
                </div>
              );
            })}
          </div>

          <div className="pt-3 border-t border-slate-100 space-y-2">
            <button
              onClick={() => onNavigate('cas')}
              className="w-full py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5"
            >
              <span>Suivi & Workflows des Cas</span>
            </button>
            <button
              onClick={() => onNavigate('pilotage')}
              className="w-full py-2 bg-indigo-50 hover:bg-indigo-100 text-indigo-900 rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5"
            >
              <span>Statistiques Détaillées</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
