import React from 'react';
import { UserPlus, RefreshCw, Info, CheckCircle2, ShieldCheck, MapPin, ArrowRight, Sparkles, Building2 } from 'lucide-react';

interface AccueilViewProps {
  onNavigate: (tab: 'accueil' | 'inscription' | 'mise-a-jour' | 'confirmation' | 'informations') => void;
}

export const AccueilView: React.FC<AccueilViewProps> = ({ onNavigate }) => {
  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-10">
      {/* Hero Header */}
      <div className="bg-gradient-to-br from-emerald-900 via-teal-900 to-slate-900 text-white rounded-3xl p-8 md:p-12 shadow-2xl relative overflow-hidden border border-emerald-800/40">
        <div className="absolute right-0 top-0 bottom-0 w-1/2 bg-radial from-emerald-500/20 to-transparent pointer-events-none" />
        <div className="relative z-10 max-w-2xl space-y-4">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-xs font-bold uppercase tracking-wider">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Formulaire officiel d'adhésion</span>
          </div>

          <h1 className="text-3xl sm:text-4xl font-black font-['Outfit'] tracking-tight leading-tight">
            Bienvenue sur le portail des membres <span className="text-emerald-400">Mbok de France</span>
          </h1>

          <p className="text-slate-200 text-sm sm:text-base leading-relaxed">
            Inscrivez-vous en ligne ou mettez à jour vos informations personnelles en toute simplicité.
            Votre demande sera transmise en toute sécurité au bureau de l'association pour validation.
          </p>
        </div>
      </div>

      {/* Main Choice Action Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Card 1: Nouvelle Inscription */}
        <div
          onClick={() => onNavigate('inscription')}
          className="bg-white rounded-2xl border-2 border-emerald-100 p-8 shadow-xs hover:shadow-xl hover:border-emerald-500 transition-all cursor-pointer group relative overflow-hidden flex flex-col justify-between"
        >
          <div className="space-y-4">
            <div className="w-14 h-14 rounded-2xl bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold group-hover:scale-110 transition-transform shadow-xs">
              <UserPlus className="w-7 h-7" />
            </div>

            <h2 className="text-2xl font-black text-slate-900 font-['Outfit'] group-hover:text-emerald-700 transition-colors">
              Nouvelle Inscription
            </h2>

            <p className="text-xs text-slate-600 leading-relaxed">
              Vous êtes un nouveau membre de l'association Mbok de France ?
              Remplissez le formulaire d'adhésion avec votre ville de résidence, situation professionnelle et domaine d'activité.
            </p>
          </div>

          <div className="mt-6 pt-4 border-t border-slate-100 flex items-center justify-between text-xs font-bold text-emerald-700">
            <span>Remplir le formulaire d'inscription</span>
            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </div>
        </div>

        {/* Card 2: Demande de Mise à jour */}
        <div
          onClick={() => onNavigate('mise-a-jour')}
          className="bg-white rounded-2xl border-2 border-slate-200 p-8 shadow-xs hover:shadow-xl hover:border-blue-500 transition-all cursor-pointer group relative overflow-hidden flex flex-col justify-between"
        >
          <div className="space-y-4">
            <div className="w-14 h-14 rounded-2xl bg-blue-100 text-blue-700 flex items-center justify-center font-bold group-hover:scale-110 transition-transform shadow-xs">
              <RefreshCw className="w-7 h-7" />
            </div>

            <h2 className="text-2xl font-black text-slate-900 font-['Outfit'] group-hover:text-blue-700 transition-colors">
              Demande de Mise à Jour
            </h2>

            <p className="text-xs text-slate-600 leading-relaxed">
              Vous faites déjà partie de l'annuaire MDF et vos coordonnées ont changé (nouvelle ville, changement de téléphone, nouvel emploi) ?
              Soumettez votre mise à jour en quelques clics.
            </p>
          </div>

          <div className="mt-6 pt-4 border-t border-slate-100 flex items-center justify-between text-xs font-bold text-blue-700">
            <span>Soumettre une modification</span>
            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </div>
        </div>
      </div>

      {/* Workflow Explanation Banner */}
      <div className="bg-slate-50 border border-slate-200 rounded-2xl p-6 md:p-8 space-y-4">
        <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
          <ShieldCheck className="w-5 h-5 text-emerald-600" />
          Comment fonctionne la prise en compte de votre demande ?
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2">
          <div className="bg-white p-4 rounded-xl border border-slate-200 space-y-2">
            <div className="w-7 h-7 rounded-lg bg-emerald-100 text-emerald-800 text-xs font-bold flex items-center justify-center">
              1
            </div>
            <h4 className="text-xs font-bold text-slate-900">Saisie du formulaire</h4>
            <p className="text-[11px] text-slate-500">Vous renseignez vos informations (coordonnées, ville de résidence, parcours).</p>
          </div>

          <div className="bg-white p-4 rounded-xl border border-slate-200 space-y-2">
            <div className="w-7 h-7 rounded-lg bg-amber-100 text-amber-800 text-xs font-bold flex items-center justify-center">
              2
            </div>
            <h4 className="text-xs font-bold text-slate-900">Validation Bureau MDF</h4>
            <p className="text-[11px] text-slate-500">Un administrateur examine et valide votre demande pour garantir la qualité des données.</p>
          </div>

          <div className="bg-white p-4 rounded-xl border border-slate-200 space-y-2">
            <div className="w-7 h-7 rounded-lg bg-teal-100 text-teal-800 text-xs font-bold flex items-center justify-center">
              3
            </div>
            <h4 className="text-xs font-bold text-slate-900">Intégration automatique</h4>
            <p className="text-[11px] text-slate-500">Votre géolocalisation et votre zone MDF sont calculées automatiquement dans la cartographie.</p>
          </div>
        </div>
      </div>
    </div>
  );
};
