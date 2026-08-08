import React from 'react';
import { Info, Globe, ShieldCheck, MapPin, Users, HelpCircle, ArrowLeft } from 'lucide-react';

interface InformationsViewProps {
  onNavigate: (tab: 'accueil' | 'inscription' | 'mise-a-jour' | 'confirmation' | 'informations') => void;
}

export const InformationsView: React.FC<InformationsViewProps> = ({ onNavigate }) => {
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      <button
        onClick={() => onNavigate('accueil')}
        className="text-slate-500 hover:text-slate-800 text-xs font-bold flex items-center gap-1 transition-colors"
      >
        <ArrowLeft className="w-4 h-4" />
        Retour à l'accueil
      </button>

      {/* Header */}
      <div className="bg-gradient-to-r from-emerald-900 to-slate-900 text-white rounded-2xl p-6 shadow-md border border-emerald-800/40">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-xl bg-emerald-500/20 border border-emerald-400/30 flex items-center justify-center font-bold text-emerald-300">
            <Info className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-2xl font-black font-['Outfit']">Informations & Règles de Gestion MDF</h1>
            <p className="text-xs text-emerald-100/80 mt-0.5">
              Comprendre le fonctionnement des adhésions, du réseau et de la cartographie de l'association.
            </p>
          </div>
        </div>
      </div>

      {/* FAQ Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-3">
          <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold">
            <Globe className="w-5 h-5" />
          </div>
          <h3 className="text-base font-bold text-slate-900">1. Qu'est-ce que Mbok de France ?</h3>
          <p className="text-xs text-slate-600 leading-relaxed">
            Mbok de France est le réseau associatif regroupant les membres et ressortissants en France. La plateforme permet d'organiser l'annuaire national, de connecter les professionnels, les étudiants et les cadres sur tout le territoire français.
          </p>
        </div>

        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-3">
          <div className="w-10 h-10 rounded-xl bg-teal-100 text-teal-700 flex items-center justify-center font-bold">
            <MapPin className="w-5 h-5" />
          </div>
          <h3 className="text-base font-bold text-slate-900">2. Comment ma zone est-elle attribuée ?</h3>
          <p className="text-xs text-slate-600 leading-relaxed">
            Le membre n'a pas besoin de sélectionner sa zone manuellement. L'application calcule automatiquement la zone géographique en fonction de votre ville de résidence et de votre département.
          </p>
        </div>

        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-3">
          <div className="w-10 h-10 rounded-xl bg-blue-100 text-blue-700 flex items-center justify-center font-bold">
            <ShieldCheck className="w-5 h-5" />
          </div>
          <h3 className="text-base font-bold text-slate-900">3. Pourquoi une validation préalable ?</h3>
          <p className="text-xs text-slate-600 leading-relaxed">
            Pour éviter les doublons et garantir l'exactitude des informations, toutes les inscriptions et demandes de modification soumises en ligne sont vérifiées par un administrateur du bureau avant leur intégration dans la cartographie officielle.
          </p>
        </div>

        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-3">
          <div className="w-10 h-10 rounded-xl bg-amber-100 text-amber-700 flex items-center justify-center font-bold">
            <Users className="w-5 h-5" />
          </div>
          <h3 className="text-base font-bold text-slate-900">4. Protection des données & Confidentialité</h3>
          <p className="text-xs text-slate-600 leading-relaxed">
            Vos informations personnelles sont uniquement accessibles par le bureau d'administration et les référents officiels de votre zone pour des besoins de coordination et de contact associatif.
          </p>
        </div>
      </div>
    </div>
  );
};
