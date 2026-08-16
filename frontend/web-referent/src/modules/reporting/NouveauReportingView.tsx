import React, { useState } from 'react';
import { WeeklyReport, ReportingType, ReportingPriority, AppUser } from '@shared/types';
import { Send, AlertTriangle, Calendar, FileText, CheckCircle2, ShieldAlert, Sparkles, HelpCircle } from 'lucide-react';

interface NouveauReportingViewProps {
  currentUser: AppUser | null;
  currentZone: string;
  onSubmitReport: (reportData: Omit<WeeklyReport, 'id' | 'createdAt'>) => void;
  onCancel: () => void;
}

export const NouveauReportingView: React.FC<NouveauReportingViewProps> = ({
  currentUser,
  currentZone,
  onSubmitReport,
  onCancel
}) => {
  const [reportType, setReportType] = useState<ReportingType>('PERIODIQUE');
  const [sujet, setSujet] = useState('');
  const [semaineLundi, setSemaineLundi] = useState(() => {
    const d = new Date();
    const day = d.getDay();
    const diff = d.getDate() - day + (day === 0 ? -6 : 1);
    return new Date(d.setDate(diff)).toISOString().split('T')[0];
  });
  const [urgenceLevel, setUrgenceLevel] = useState<number>(1);
  const [nouveauxContactes, setNouveauxContactes] = useState('');
  const [situationsPrioritaires, setSituationsPrioritaires] = useState('');
  const [activitesLocales, setActivitesLocales] = useState('');
  const [besoinRetourBureau, setBesoinRetourBureau] = useState(false);
  const [detailsDemandeRetour, setDetailsDemandeRetour] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    let priority: ReportingPriority = 'NORMAL';
    if (urgenceLevel >= 4 || reportType === 'PONCTUEL') {
      priority = urgenceLevel >= 4 ? 'URGENT' : 'IMPORTANT';
    }

    const newReport: Omit<WeeklyReport, 'id' | 'createdAt'> = {
      referentId: currentUser?.id || 'ref-default',
      referentName: currentUser?.nom || 'Référent Zone',
      email: currentUser?.email || 'referent@mbokdefrance.fr',
      zone: currentZone,
      type: reportType,
      sujet: sujet || (reportType === 'PONCTUEL' ? 'Signalement Ponctuel' : `Rapport Hebdomadaire - Semaine du ${semaineLundi}`),
      priority,
      semaineLundi,
      nouveauxContactes,
      situationsPrioritaires,
      activitesLocales,
      besoinRetourBureau: besoinRetourBureau || urgenceLevel >= 3,
      detailsDemandeRetour,
      urgenceLevel,
      status: 'NOUVEAU',
      actionHistory: [
        {
          id: `act-${Date.now()}`,
          date: new Date().toISOString(),
          authorName: currentUser?.nom || 'Référent Zone',
          authorRole: `Référent ${currentZone}`,
          action: `Création du ${reportType === 'PONCTUEL' ? 'cas ponctuel' : 'reporting périodique'}`,
          details: sujet || 'Transmission initiale'
        }
      ]
    };

    onSubmitReport(newReport);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-2xs">
        <div className="flex items-center gap-3 mb-2">
          <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-800 flex items-center justify-center font-bold text-lg">
            ✍️
          </div>
          <div>
            <h1 className="text-xl font-black text-slate-900">Nouveau Reporting / Signalement</h1>
            <p className="text-xs text-slate-500">Transmettre un compte-rendu ou alerter le Bureau National MDF</p>
          </div>
        </div>

        {/* Mode Selector */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-6">
          <button
            type="button"
            onClick={() => {
              setReportType('PERIODIQUE');
              if (urgenceLevel > 3) setUrgenceLevel(1);
            }}
            className={`p-4 rounded-xl border-2 text-left transition flex flex-col justify-between ${
              reportType === 'PERIODIQUE'
                ? 'border-emerald-600 bg-emerald-50/50 shadow-xs'
                : 'border-slate-200 bg-white hover:border-slate-300'
            }`}
          >
            <div>
              <span className="inline-flex items-center gap-1 text-[11px] font-extrabold uppercase tracking-wider text-emerald-800 bg-emerald-100 px-2 py-0.5 rounded-md mb-2">
                <Calendar className="w-3 h-3" /> Périodique
              </span>
              <h3 className="text-sm font-bold text-slate-900">Rapport d'activité régulier</h3>
              <p className="text-xs text-slate-500 mt-1">
                Bilan de la semaine : nouveaux arrivants contactés, initiatives locales et synthèses régulières.
              </p>
            </div>
          </button>

          <button
            type="button"
            onClick={() => {
              setReportType('PONCTUEL');
              setBesoinRetourBureau(true);
              if (urgenceLevel < 3) setUrgenceLevel(3);
            }}
            className={`p-4 rounded-xl border-2 text-left transition flex flex-col justify-between ${
              reportType === 'PONCTUEL'
                ? 'border-purple-600 bg-purple-50/50 shadow-xs'
                : 'border-slate-200 bg-white hover:border-slate-300'
            }`}
          >
            <div>
              <span className="inline-flex items-center gap-1 text-[11px] font-extrabold uppercase tracking-wider text-purple-800 bg-purple-100 px-2 py-0.5 rounded-md mb-2">
                <AlertTriangle className="w-3 h-3" /> Cas Ponctuel & Urgence
              </span>
              <h3 className="text-sm font-bold text-slate-900">Signalement ciblé ou cas critique</h3>
              <p className="text-xs text-slate-500 mt-1">
                Demande d'appui expresse du Bureau : membre en difficulté, alerte administrative ou événement exceptionnel.
              </p>
            </div>
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="space-y-5 mt-6 pt-6 border-t border-slate-100">
          {/* Sujet */}
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
              Objet / Sujet de la transmission *
            </label>
            <input
              type="text"
              required
              placeholder={reportType === 'PONCTUEL' ? 'Ex: Situation critique logement membre à Lyon' : 'Ex: Bilan d’activité de début de mois - Antenne Nord'}
              value={sujet}
              onChange={(e) => setSujet(e.target.value)}
              className="w-full p-3 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-emerald-600 focus:bg-white transition font-semibold text-slate-800"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                Date de référence / Semaine
              </label>
              <input
                type="date"
                value={semaineLundi}
                onChange={(e) => setSemaineLundi(e.target.value)}
                className="w-full p-2.5 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-emerald-600 focus:bg-white font-medium"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                Niveau d'Urgence (1 = Routine, 5 = Très urgent)
              </label>
              <div className="flex items-center gap-2">
                {[1, 2, 3, 4, 5].map((lvl) => (
                  <button
                    key={lvl}
                    type="button"
                    onClick={() => setUrgenceLevel(lvl)}
                    className={`flex-1 py-2 text-xs font-black rounded-lg border transition ${
                      urgenceLevel === lvl
                        ? lvl >= 4
                          ? 'bg-red-600 text-white border-red-600 shadow-xs'
                          : lvl === 3
                          ? 'bg-amber-600 text-white border-amber-600 shadow-xs'
                          : 'bg-emerald-600 text-white border-emerald-600 shadow-xs'
                        : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                    }`}
                  >
                    {lvl}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Detailed Content Fields */}
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
              Nouveaux membres accueillis / contacts établis
            </label>
            <textarea
              rows={2}
              placeholder="Précisez les nouveaux membres rencontrés ou contactés cette période..."
              value={nouveauxContactes}
              onChange={(e) => setNouveauxContactes(e.target.value)}
              className="w-full p-3 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-emerald-600 focus:bg-white transition"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
              Situations prioritaires / Points d'attention
            </label>
            <textarea
              rows={3}
              placeholder="Difficultés signalées, recherche de logement, soutien administratif, insertion..."
              value={situationsPrioritaires}
              onChange={(e) => setSituationsPrioritaires(e.target.value)}
              className="w-full p-3 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-emerald-600 focus:bg-white transition"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
              Activités locales & Rencontres prévues
            </label>
            <textarea
              rows={2}
              placeholder="Événements d'antenne, réunions, rencontres d'entraide..."
              value={activitesLocales}
              onChange={(e) => setActivitesLocales(e.target.value)}
              className="w-full p-3 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-emerald-600 focus:bg-white transition"
            />
          </div>

          {/* Return required toggle */}
          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-3">
            <label className="flex items-center gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={besoinRetourBureau || reportType === 'PONCTUEL'}
                onChange={(e) => setBesoinRetourBureau(e.target.checked)}
                className="w-4 h-4 text-emerald-600 rounded border-slate-300 focus:ring-emerald-500"
              />
              <span className="text-xs font-bold text-slate-800">
                Action ou retour explicite attendu du Bureau National
              </span>
            </label>

            {(besoinRetourBureau || reportType === 'PONCTUEL') && (
              <div>
                <label className="block text-[11px] font-bold text-slate-600 uppercase mb-1">
                  Précisions sur l'appui attendu :
                </label>
                <textarea
                  rows={2}
                  placeholder="Décrivez l'aide requise (validation financière, prise de contact officielle, arbitrage...)"
                  value={detailsDemandeRetour}
                  onChange={(e) => setDetailsDemandeRetour(e.target.value)}
                  className="w-full p-2.5 text-xs bg-white border border-slate-300 rounded-lg focus:outline-none focus:border-emerald-600"
                />
              </div>
            )}
          </div>

          {/* Action Buttons */}
          <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
            <button
              type="button"
              onClick={onCancel}
              className="px-4 py-2.5 rounded-xl border border-slate-300 text-slate-700 text-xs font-bold hover:bg-slate-50 transition"
            >
              Annuler
            </button>
            <button
              type="submit"
              className="px-5 py-2.5 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-bold flex items-center gap-2 shadow-md transition cursor-pointer"
            >
              <Send className="w-4 h-4" />
              <span>Transmettre au Bureau National</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
