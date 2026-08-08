import React from 'react';
import { CheckCircle2, Clock, ShieldCheck, ArrowRight, FileText, Home } from 'lucide-react';
import { DemandeMember } from '@shared/types';

interface ConfirmationViewProps {
  demande?: DemandeMember | null;
  onNavigate: (tab: 'accueil' | 'inscription' | 'mise-a-jour' | 'confirmation' | 'informations') => void;
}

export const ConfirmationView: React.FC<ConfirmationViewProps> = ({ demande, onNavigate }) => {
  return (
    <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-12 text-center space-y-6">
      <div className="w-20 h-20 bg-emerald-100 border-4 border-emerald-200 text-emerald-600 rounded-full flex items-center justify-center mx-auto shadow-lg animate-bounce">
        <CheckCircle2 className="w-10 h-10" />
      </div>

      <div className="space-y-2">
        <span className="bg-amber-100 text-amber-900 border border-amber-300 px-3 py-1 rounded-full text-xs font-bold inline-flex items-center gap-1.5">
          <Clock className="w-3.5 h-3.5 text-amber-600" />
          Statut : En attente de validation par le bureau
        </span>

        <h1 className="text-3xl font-black font-['Outfit'] text-slate-900">
          Votre demande a été transmise avec succès !
        </h1>

        <p className="text-xs sm:text-sm text-slate-600 max-w-lg mx-auto">
          Merci ! Votre {demande?.type === 'MISE_A_JOUR' ? 'demande de mise à jour' : "demande d'inscription"} a bien été enregistrée dans la base de données.
        </p>
      </div>

      {demande && (
        <div className="bg-white rounded-2xl border border-slate-200 p-6 text-left shadow-xs space-y-3">
          <div className="text-xs font-bold text-slate-500 uppercase tracking-wider border-b border-slate-100 pb-2">
            Récapitulatif du reçu
          </div>

          <div className="grid grid-cols-2 gap-3 text-xs">
            <div>
              <span className="text-slate-400 block">Référence ticket :</span>
              <span className="font-mono font-bold text-emerald-800">{demande.id}</span>
            </div>

            <div>
              <span className="text-slate-400 block">Nom & Prénom :</span>
              <span className="font-bold text-slate-800">{demande.prenom} {demande.nom}</span>
            </div>

            <div>
              <span className="text-slate-400 block">Ville de résidence :</span>
              <span className="font-bold text-slate-800">{demande.ville}</span>
            </div>

            <div>
              <span className="text-slate-400 block">Email :</span>
              <span className="font-bold text-slate-800">{demande.email}</span>
            </div>
          </div>
        </div>
      )}

      {/* Info Callout */}
      <div className="bg-slate-50 border border-slate-200 rounded-2xl p-5 text-xs text-slate-600 text-left space-y-2">
        <div className="font-bold text-slate-900 flex items-center gap-2">
          <ShieldCheck className="w-4 h-4 text-emerald-600" />
          Que se passe-t-il ensuite ?
        </div>
        <p className="text-slate-600 leading-relaxed">
          Un administrateur de l'association Mbok de France examinera votre fiche dans l'application d'administration Cartographie. Dès sa validation, votre ville sera géolocalisée et vous apparaîtrez automatiquement dans la carte et l'annuaire de votre zone MDF.
        </p>
      </div>

      <div className="pt-4 flex items-center justify-center gap-3">
        <button
          onClick={() => onNavigate('accueil')}
          className="px-6 py-3 bg-slate-900 text-white rounded-xl text-xs font-bold hover:bg-slate-800 transition-all shadow-md flex items-center gap-2"
        >
          <Home className="w-4 h-4" />
          <span>Retour à l'accueil</span>
        </button>
      </div>
    </div>
  );
};
