import React from 'react';
import { Member, WeeklyReport, CustomZone, AppUser } from '@shared/types';
import { Users, MapPin, Send, CheckCircle2, Clock, AlertTriangle, ArrowRight, MessageSquare } from 'lucide-react';

interface ReferentDashboardViewProps {
  currentUser: AppUser | null;
  zoneMembers: Member[];
  zoneReports: WeeklyReport[];
  currentZone: string;
  onNavigate: (tab: any) => void;
  onSelectReport: (report: WeeklyReport) => void;
}

export const ReferentDashboardView: React.FC<ReferentDashboardViewProps> = ({
  currentUser,
  zoneMembers,
  zoneReports,
  currentZone,
  onNavigate,
  onSelectReport
}) => {
  const pendingReports = zoneReports.filter(r => r.status === 'NOUVEAU' || r.status === 'EN_COURS');
  const treatedReports = zoneReports.filter(r => r.status === 'TRAITE');
  const urgentReports = zoneReports.filter(r => (r.priority === 'URGENT' || r.urgenceLevel >= 4) && r.status !== 'TRAITE');

  // Group members by city
  const citiesCount = new Set(zoneMembers.map(m => m.ville).filter(Boolean)).size;

  return (
    <div className="space-y-6">
      {/* Welcome Banner */}
      <div className="bg-gradient-to-r from-emerald-800 to-teal-900 rounded-2xl p-6 text-white shadow-md relative overflow-hidden">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-2 px-2.5 py-1 bg-emerald-500/20 rounded-full text-emerald-300 text-xs font-semibold mb-2 border border-emerald-400/20">
              <MapPin className="w-3.5 h-3.5" /> Antenne Régionale : {currentZone}
            </div>
            <h1 className="text-2xl font-bold tracking-tight">
              Bonjour, {currentUser?.nom || 'Référent'} 👋
            </h1>
            <p className="text-sm text-emerald-100/90 mt-1 max-w-2xl">
              Bienvenue sur votre portail dédié. Suivez vos membres locaux, transmettez vos remontées périodiques ou urgentes et échangez directement avec le Bureau National.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => onNavigate('new_report')}
              className="px-4 py-2.5 rounded-xl bg-emerald-400 hover:bg-emerald-300 text-slate-950 font-bold text-xs flex items-center gap-2 shadow-md transition"
            >
              <Send className="w-4 h-4" />
              <span>Nouveau Reporting / Cas</span>
            </button>
          </div>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div 
          onClick={() => onNavigate('members')}
          className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-2xs hover:border-emerald-300 transition cursor-pointer"
        >
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Membres Zone</span>
            <div className="w-9 h-9 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center font-bold">
              <Users className="w-5 h-5" />
            </div>
          </div>
          <div className="text-2xl font-black text-slate-800">{zoneMembers.length}</div>
          <p className="text-xs text-slate-500 mt-1">Répartis sur {citiesCount} ville(s)</p>
        </div>

        <div 
          onClick={() => onNavigate('my_reports')}
          className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-2xs hover:border-emerald-300 transition cursor-pointer"
        >
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Remontées totales</span>
            <div className="w-9 h-9 rounded-xl bg-blue-50 text-blue-700 flex items-center justify-center font-bold">
              <Send className="w-5 h-5" />
            </div>
          </div>
          <div className="text-2xl font-black text-slate-800">{zoneReports.length}</div>
          <p className="text-xs text-slate-500 mt-1">{treatedReports.length} traitée(s) par le Bureau</p>
        </div>

        <div 
          onClick={() => onNavigate('my_reports')}
          className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-2xs hover:border-emerald-300 transition cursor-pointer"
        >
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">En cours / Attente</span>
            <div className="w-9 h-9 rounded-xl bg-amber-50 text-amber-700 flex items-center justify-center font-bold">
              <Clock className="w-5 h-5" />
            </div>
          </div>
          <div className="text-2xl font-black text-slate-800">{pendingReports.length}</div>
          <p className="text-xs text-amber-600 font-semibold mt-1">Dossiers en suivi actif</p>
        </div>

        <div 
          onClick={() => onNavigate('my_reports')}
          className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-2xs hover:border-red-300 transition cursor-pointer"
        >
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Cas Urgents</span>
            <div className="w-9 h-9 rounded-xl bg-red-50 text-red-700 flex items-center justify-center font-bold">
              <AlertTriangle className="w-5 h-5" />
            </div>
          </div>
          <div className="text-2xl font-black text-red-600">{urgentReports.length}</div>
          <p className="text-xs text-red-500 font-semibold mt-1">Niveau d'urgence 4-5</p>
        </div>
      </div>

      {/* Two columns: Recent Remontées & Quick Actions */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Reports List (2 cols) */}
        <div className="lg:col-span-2 bg-white rounded-2xl border border-slate-200/80 p-6 shadow-2xs">
          <div className="flex items-center justify-between mb-5">
            <div>
              <h2 className="text-base font-bold text-slate-900">Dernières remontées de la zone</h2>
              <p className="text-xs text-slate-500">Statut des transmissions et retours du Bureau National</p>
            </div>
            <button
              onClick={() => onNavigate('my_reports')}
              className="text-xs font-bold text-emerald-700 hover:text-emerald-800 flex items-center gap-1"
            >
              <span>Voir tout</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          {zoneReports.length === 0 ? (
            <div className="text-center py-10 border border-dashed border-slate-200 rounded-xl">
              <div className="w-12 h-12 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center mx-auto mb-2 text-xl">
                ✍️
              </div>
              <p className="text-sm font-bold text-slate-700">Aucune remontée enregistrée pour l'instant</p>
              <p className="text-xs text-slate-400 mt-1 max-w-sm mx-auto">
                Transmettez votre premier compte-rendu périodique ou signalez une situation d'antenne.
              </p>
              <button
                onClick={() => onNavigate('new_report')}
                className="mt-4 px-4 py-2 bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl text-xs font-bold transition"
              >
                Rédiger un reporting
              </button>
            </div>
          ) : (
            <div className="space-y-3">
              {zoneReports.slice(0, 4).map((report) => {
                const isUrgent = report.priority === 'URGENT' || report.urgenceLevel >= 4;
                return (
                  <div
                    key={report.id}
                    onClick={() => onSelectReport(report)}
                    className="p-4 rounded-xl border border-slate-100 hover:border-emerald-200 hover:bg-emerald-50/30 transition cursor-pointer flex items-start justify-between gap-4"
                  >
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="font-extrabold text-xs text-slate-800">
                          {report.caseNumber || `#${report.id.slice(-4)}`}
                        </span>
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-md ${
                          report.type === 'PONCTUEL' ? 'bg-purple-100 text-purple-800' : 'bg-blue-100 text-blue-800'
                        }`}>
                          {report.type === 'PONCTUEL' ? 'Cas ponctuel' : 'Périodique'}
                        </span>
                        {isUrgent && (
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-red-100 text-red-800">
                            Urgent
                          </span>
                        )}
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-md ${
                          report.status === 'TRAITE' ? 'bg-emerald-100 text-emerald-800' :
                          report.status === 'EN_COURS' ? 'bg-amber-100 text-amber-800' :
                          'bg-slate-100 text-slate-700'
                        }`}>
                          {report.status === 'TRAITE' ? 'Traité' : report.status === 'EN_COURS' ? 'En cours' : 'Nouveau'}
                        </span>
                      </div>

                      <h4 className="text-sm font-bold text-slate-900">
                        {report.sujet || `Rapport d'activité semaine du ${report.semaineLundi || 'Semaine courante'}`}
                      </h4>

                      <p className="text-xs text-slate-500 line-clamp-1">
                        {report.detailsDemandeRetour || report.situationsPrioritaires || report.nouveauxContactes || 'Consulter le détail du dossier...'}
                      </p>
                    </div>

                    <div className="text-right shrink-0">
                      <span className="text-[10px] text-slate-400 block">
                        {new Date(report.createdAt).toLocaleDateString('fr-FR')}
                      </span>
                      {report.reponses && report.reponses.length > 0 && (
                        <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full mt-1">
                          <MessageSquare className="w-3 h-3" />
                          {report.reponses.length} rép.
                        </span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Quick Guide & Support (1 col) */}
        <div className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-2xs space-y-4">
          <h2 className="text-base font-bold text-slate-900">Missions Référent</h2>
          <div className="space-y-3 text-xs text-slate-600">
            <div className="flex items-start gap-2.5 p-3 rounded-xl bg-slate-50 border border-slate-100">
              <div className="w-5 h-5 rounded-full bg-emerald-100 text-emerald-800 flex items-center justify-center font-bold shrink-0 text-[11px]">1</div>
              <div>
                <strong className="text-slate-800 block">Accueil & Contact</strong>
                Prenez contact avec les nouveaux membres affectés à votre zone géographique.
              </div>
            </div>

            <div className="flex items-start gap-2.5 p-3 rounded-xl bg-slate-50 border border-slate-100">
              <div className="w-5 h-5 rounded-full bg-emerald-100 text-emerald-800 flex items-center justify-center font-bold shrink-0 text-[11px]">2</div>
              <div>
                <strong className="text-slate-800 block">Remontée terrain</strong>
                Transmettez vos rapports hebdomadaires et alertez le Bureau sur les cas sensibles.
              </div>
            </div>

            <div className="flex items-start gap-2.5 p-3 rounded-xl bg-slate-50 border border-slate-100">
              <div className="w-5 h-5 rounded-full bg-emerald-100 text-emerald-800 flex items-center justify-center font-bold shrink-0 text-[11px]">3</div>
              <div>
                <strong className="text-slate-800 block">Animation d'Antenne</strong>
                Coordonnez les rencontres et favorisez l'entraide communautaire.
              </div>
            </div>
          </div>

          <div className="pt-2 border-t border-slate-100">
            <button
              onClick={() => onNavigate('zone')}
              className="w-full py-2.5 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold flex items-center justify-center gap-2 transition"
            >
              <MapPin className="w-3.5 h-3.5 text-emerald-400" />
              <span>Voir la cartographie de ma zone</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
