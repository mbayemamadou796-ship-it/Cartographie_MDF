import React from 'react';
import { Member, CustomZone, WeeklyReport, AppUser } from '@shared/types';
import { Users, AlertTriangle, CheckCircle2, Clock, MapPin, Send, PlusCircle, ArrowRight, MessageSquare } from 'lucide-react';

interface ReferentDashboardProps {
  currentUser: AppUser | null;
  zone: CustomZone | null;
  zoneMembers: Member[];
  myReports: WeeklyReport[];
  onNavigate: (tab: 'dashboard' | 'zone' | 'members' | 'new_report' | 'my_reports' | 'profile') => void;
  onSelectReport: (report: WeeklyReport) => void;
}

export const ReferentZoneDashboard: React.FC<ReferentDashboardProps> = ({
  currentUser,
  zone,
  zoneMembers,
  myReports,
  onNavigate,
  onSelectReport,
}) => {
  const referentName = currentUser?.name || currentUser?.prenom || 'Référent';
  const zoneName = zone?.name || currentUser?.region || 'Ma Zone';

  const pendingReports = myReports.filter((r) => r.status === 'NOUVEAU' || r.status === 'EN_COURS');
  const treatedReports = myReports.filter((r) => r.status === 'TRAITE');
  const urgentReports = myReports.filter((r) => r.priority === 'URGENT' || r.urgenceLevel >= 4);

  // Recent 3 reports
  const recentReports = [...myReports].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()).slice(0, 3);

  return (
    <div className="space-y-6">
      
      {/* Welcome Banner */}
      <div className="bg-gradient-to-r from-emerald-800 via-teal-800 to-slate-900 rounded-3xl p-6 sm:p-8 text-white shadow-xl relative overflow-hidden">
        <div className="absolute right-0 top-0 w-80 h-full bg-radial from-emerald-500/20 to-transparent pointer-events-none opacity-60" />
        
        <div className="relative z-10 max-w-3xl space-y-3">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/20 border border-emerald-400/30 text-emerald-300 text-xs font-bold">
            <MapPin className="w-3.5 h-3.5" />
            <span>Antenne Régionale : {zoneName}</span>
          </div>

          <h2 className="text-2xl sm:text-3xl font-black font-['Outfit'] tracking-tight">
            Bienvenue, {referentName} !
          </h2>

          <p className="text-emerald-100/90 text-sm leading-relaxed">
            Votre espace dédié pour animer votre antenne locale, suivre les <span className="font-bold text-white">{zoneMembers.length} adhérents</span> de votre zone et transmettre vos remontées de terrain au Bureau National.
          </p>

          <div className="pt-2 flex flex-wrap items-center gap-3">
            <button
              onClick={() => onNavigate('new_report')}
              className="flex items-center gap-2 bg-emerald-500 hover:bg-emerald-400 text-emerald-950 px-4 py-2.5 rounded-2xl font-black text-xs shadow-lg transition-all transform hover:-translate-y-0.5 cursor-pointer"
            >
              <PlusCircle className="w-4 h-4" />
              <span>Transmettre un nouveau rapport / cas</span>
            </button>

            <button
              onClick={() => onNavigate('members')}
              className="flex items-center gap-2 bg-white/10 hover:bg-white/20 text-white px-4 py-2.5 rounded-2xl font-bold text-xs border border-white/20 transition-all cursor-pointer"
            >
              <Users className="w-4 h-4" />
              <span>Consulter mes {zoneMembers.length} membres</span>
            </button>
          </div>
        </div>
      </div>

      {/* 4 KPI Cards for the Referent's Zone */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        
        <div 
          onClick={() => onNavigate('members')}
          className="bg-white rounded-2xl p-5 border border-slate-100 shadow-sm hover:shadow-md transition-all cursor-pointer group"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Membres Zone</span>
            <div className="w-9 h-9 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center group-hover:scale-110 transition-transform">
              <Users className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl font-black text-slate-900 mt-2 font-['Outfit']">{zoneMembers.length}</p>
          <p className="text-[11px] text-slate-500 mt-1 flex items-center gap-1">
            <span>Adhérents dans {zoneName}</span>
            <ArrowRight className="w-3 h-3 group-hover:translate-x-1 transition-transform text-blue-500" />
          </p>
        </div>

        <div 
          onClick={() => onNavigate('my_reports')}
          className="bg-white rounded-2xl p-5 border border-slate-100 shadow-sm hover:shadow-md transition-all cursor-pointer group"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Mes Remontées</span>
            <div className="w-9 h-9 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center group-hover:scale-110 transition-transform">
              <Send className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl font-black text-slate-900 mt-2 font-['Outfit']">{myReports.length}</p>
          <p className="text-[11px] text-slate-500 mt-1 flex items-center gap-1">
            <span>Rapports & cas signalés</span>
            <ArrowRight className="w-3 h-3 group-hover:translate-x-1 transition-transform text-indigo-500" />
          </p>
        </div>

        <div 
          onClick={() => onNavigate('my_reports')}
          className="bg-white rounded-2xl p-5 border border-slate-100 shadow-sm hover:shadow-md transition-all cursor-pointer group"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">En cours / Bureau</span>
            <div className="w-9 h-9 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center group-hover:scale-110 transition-transform">
              <Clock className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl font-black text-slate-900 mt-2 font-['Outfit']">{pendingReports.length}</p>
          <p className="text-[11px] text-amber-600 font-medium mt-1">
            {pendingReports.length > 0 ? 'En traitement par le Bureau' : 'Tous vos cas sont traités'}
          </p>
        </div>

        <div 
          onClick={() => onNavigate('my_reports')}
          className="bg-white rounded-2xl p-5 border border-slate-100 shadow-sm hover:shadow-md transition-all cursor-pointer group"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Cas Traités</span>
            <div className="w-9 h-9 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center group-hover:scale-110 transition-transform">
              <CheckCircle2 className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl font-black text-slate-900 mt-2 font-['Outfit']">{treatedReports.length}</p>
          <p className="text-[11px] text-emerald-600 font-medium mt-1">
            Solutions apportées par le Bureau
          </p>
        </div>

      </div>

      {/* Grid: Recent Reports & Zone Quick Info */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Recent Reports List (2 cols) */}
        <div className="lg:col-span-2 bg-white rounded-3xl p-6 border border-slate-100 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-base font-bold text-slate-900 font-['Outfit']">Mes Dernières Remontées</h3>
              <p className="text-xs text-slate-500">Suivi direct de l'état d'avancement de vos signalements</p>
            </div>
            <button
              onClick={() => onNavigate('my_reports')}
              className="text-xs font-bold text-emerald-600 hover:text-emerald-700 flex items-center gap-1 cursor-pointer"
            >
              <span>Voir tout</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          {recentReports.length === 0 ? (
            <div className="text-center py-10 border border-dashed border-slate-200 rounded-2xl">
              <p className="text-xs text-slate-400 font-medium">Aucune remontée enregistrée pour le moment.</p>
              <button
                onClick={() => onNavigate('new_report')}
                className="mt-3 inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-50 text-emerald-700 text-xs font-bold hover:bg-emerald-100 transition-colors"
              >
                <PlusCircle className="w-3.5 h-3.5" />
                <span>Créer mon premier rapport</span>
              </button>
            </div>
          ) : (
            <div className="space-y-3">
              {recentReports.map((report) => {
                const statusColor = 
                  report.status === 'TRAITE' ? 'bg-emerald-50 text-emerald-700 border-emerald-200' :
                  report.status === 'EN_COURS' ? 'bg-blue-50 text-blue-700 border-blue-200' :
                  'bg-amber-50 text-amber-700 border-amber-200';
                
                const statusLabel = 
                  report.status === 'TRAITE' ? 'Traité' :
                  report.status === 'EN_COURS' ? 'En cours' : 'Nouveau';

                return (
                  <div
                    key={report.id}
                    onClick={() => onSelectReport(report)}
                    className="p-4 rounded-2xl border border-slate-100 hover:border-emerald-200 hover:bg-emerald-50/30 transition-all cursor-pointer flex flex-col sm:flex-row sm:items-center justify-between gap-3 group"
                  >
                    <div className="space-y-1 flex-1">
                      <div className="flex items-center gap-2">
                        <span className="text-[11px] font-black text-slate-400">{report.caseNumber || `#${report.id.substring(0, 5)}`}</span>
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-black border ${statusColor}`}>
                          {statusLabel}
                        </span>
                        {report.priority === 'URGENT' && (
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-rose-50 text-rose-700 border border-rose-200">
                            Urgent
                          </span>
                        )}
                        <span className="text-[11px] text-slate-400">
                          {new Date(report.createdAt).toLocaleDateString('fr-FR')}
                        </span>
                      </div>

                      <h4 className="text-xs sm:text-sm font-bold text-slate-800 group-hover:text-emerald-800 transition-colors">
                        {report.sujet || report.situationsPrioritaires?.substring(0, 70) || `Rapport d'activité semaine du ${report.semaineLundi}`}
                      </h4>

                      {report.reponses && report.reponses.length > 0 && (
                        <p className="text-[11px] text-emerald-700 font-medium flex items-center gap-1.5 pt-0.5">
                          <MessageSquare className="w-3 h-3" />
                          <span>{report.reponses.length} réponse(s) du Bureau National</span>
                        </p>
                      )}
                    </div>

                    <div className="flex items-center gap-2 self-end sm:self-center">
                      <span className="text-xs font-bold text-slate-400 group-hover:text-emerald-700 flex items-center gap-1">
                        <span>Consulter</span>
                        <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Antenne & Contact Info (1 col) */}
        <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-sm space-y-4">
          <h3 className="text-base font-bold text-slate-900 font-['Outfit']">Mon Antenne Locale</h3>
          
          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100 space-y-2">
            <div className="flex items-center gap-2 text-xs font-bold text-slate-700">
              <MapPin className="w-4 h-4 text-emerald-600" />
              <span>{zoneName}</span>
            </div>
            <p className="text-xs text-slate-500">
              {zone?.description || `Réseau des membres et activités de la région ${zoneName}.`}
            </p>
          </div>

          <div className="space-y-2 pt-2">
            <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider">Actions Rapides</h4>
            
            <button
              onClick={() => onNavigate('new_report')}
              className="w-full text-left p-3 rounded-xl border border-slate-100 hover:bg-emerald-50 hover:border-emerald-200 transition-colors flex items-center justify-between text-xs font-bold text-slate-700 hover:text-emerald-800"
            >
              <span>Signaler une urgence membre</span>
              <PlusCircle className="w-4 h-4 text-emerald-600" />
            </button>

            <button
              onClick={() => onNavigate('members')}
              className="w-full text-left p-3 rounded-xl border border-slate-100 hover:bg-blue-50 hover:border-blue-200 transition-colors flex items-center justify-between text-xs font-bold text-slate-700 hover:text-blue-800"
            >
              <span>Accéder à l'annuaire de ma zone</span>
              <Users className="w-4 h-4 text-blue-600" />
            </button>
          </div>
        </div>

      </div>

    </div>
  );
};
