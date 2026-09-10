import React from 'react';
import { 
  Calendar, 
  MapPin, 
  Clock, 
  Users, 
  Sparkles, 
  ArrowRight, 
  QrCode, 
  Share2, 
  CheckCircle2, 
  HeartHandshake, 
  ShieldCheck, 
  ExternalLink,
  Search
} from 'lucide-react';
import { Rencontre, RencontreResponse } from '@shared/types';

interface RencontreHomeViewProps {
  rencontre: Rencontre;
  totalResponsesCount: number;
  participantsCount: number;
  onStartSurvey: () => void;
  onOpenQrCode: () => void;
  onCheckMyResponse: () => void;
  onSwitchToBureau?: () => void;
}

export const RencontreHomeView: React.FC<RencontreHomeViewProps> = ({
  rencontre,
  totalResponsesCount,
  participantsCount,
  onStartSurvey,
  onOpenQrCode,
  onCheckMyResponse,
  onSwitchToBureau
}) => {
  const isClosed = rencontre.statut === 'SONDAGE_FERME' || rencontre.statut === 'TERMINEE' || rencontre.statut === 'ARCHIVEE';

  return (
    <div className="space-y-6 max-w-3xl mx-auto animate-in fade-in duration-300">
      
      {/* Main Hero Card */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-emerald-100 shadow-sm relative overflow-hidden">
        
        {/* Background Subtle Gradient Accents */}
        <div className="absolute top-0 right-0 -mr-16 -mt-16 w-64 h-64 bg-emerald-100/60 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-0 -ml-16 -mb-16 w-64 h-64 bg-teal-100/50 rounded-full blur-3xl pointer-events-none" />

        {/* Top Status & Year Badge */}
        <div className="flex items-center justify-between gap-2 mb-4 relative z-10">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-emerald-50 text-emerald-800 border border-emerald-200 rounded-full text-xs font-bold shadow-2xs">
            <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
            <span>Édition Officielle {rencontre.annee}</span>
          </div>

          <span className={`text-[11px] font-black px-2.5 py-0.5 rounded-full uppercase tracking-wider ${
            rencontre.statut === 'SONDAGE_OUVERT'
              ? 'bg-emerald-600 text-white'
              : rencontre.statut === 'PREPARATION'
              ? 'bg-blue-600 text-white'
              : 'bg-slate-600 text-white'
          }`}>
            {rencontre.statut === 'SONDAGE_OUVERT' ? 'Sondage Ouvert' : rencontre.statut}
          </span>
        </div>

        {/* Title */}
        <h1 className="text-2xl sm:text-4xl font-black text-slate-900 tracking-tight mb-2 relative z-10 font-['Outfit',sans-serif]">
          {rencontre.nom}
        </h1>

        <p className="text-emerald-800 font-bold text-sm sm:text-base mb-6 relative z-10 flex items-center gap-2">
          <span>📍 {rencontre.lieu}</span>
          <span>•</span>
          <span>📅 {rencontre.dateAffichage || `${rencontre.dateDebut} au ${rencontre.dateFin}`}</span>
        </p>

        {/* Official Welcome Message Box */}
        <div className="bg-emerald-50/70 border border-emerald-200/90 rounded-2xl p-5 mb-6 relative z-10 text-slate-700 leading-relaxed text-xs sm:text-sm shadow-inner font-normal space-y-3">
          <p className="text-base sm:text-lg font-bold text-emerald-900 font-serif text-center py-1.5 bg-white/70 rounded-xl border border-emerald-200/80 shadow-2xs" dir="rtl">
            السلام عليكم ورحمة الله وبركاته
          </p>

          <p className="font-medium text-slate-800">
            Nous avons le plaisir de vous annoncer que la rencontre MDF 2026 se tiendra du 25 au 27 décembre à Toulouse.
          </p>

          <p className="font-medium text-slate-800">
            Afin de bien préparer l'événement, nous vous invitons à répondre à ce formulaire.
          </p>

          <p className="font-medium text-slate-800">
            Votre réponse nous permettra d'organiser au mieux la rencontre et d'anticiper les besoins logistiques.
          </p>
        </div>

        {/* Event Key Info Grid (2 columns without date limite) */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-8 relative z-10">
          
          <div className="bg-white p-4 rounded-2xl border border-emerald-100 shadow-2xs">
            <div className="flex items-center gap-2 text-emerald-700 mb-1">
              <Calendar className="w-4 h-4" />
              <span className="text-[11px] font-bold uppercase tracking-wider">Dates</span>
            </div>
            <p className="text-xs font-black text-slate-900">
              {rencontre.dateAffichage || 'Du 25 au 27 décembre 2026'}
            </p>
          </div>

          <div className="bg-white p-4 rounded-2xl border border-emerald-100 shadow-2xs">
            <div className="flex items-center gap-2 text-emerald-700 mb-1">
              <MapPin className="w-4 h-4" />
              <span className="text-[11px] font-bold uppercase tracking-wider">Lieu & Adresse</span>
            </div>
            <p className="text-xs font-black text-slate-900 line-clamp-2">
              {rencontre.adresse || '424 Montgay, 31560 Nailloux, Toulouse'}
            </p>
          </div>

        </div>

        {/* Primary Call to Action Button */}
        <div className="relative z-10 space-y-3">
          <button
            type="button"
            onClick={onStartSurvey}
            disabled={isClosed}
            className={`w-full py-4 px-6 rounded-2xl text-base sm:text-lg font-black flex items-center justify-center gap-3 transition-all shadow-md active:scale-98 cursor-pointer ${
              isClosed
                ? 'bg-slate-200 text-slate-400 cursor-not-allowed'
                : 'bg-gradient-to-r from-emerald-700 via-emerald-800 to-teal-800 hover:from-emerald-800 hover:to-teal-900 text-white shadow-emerald-800/25 hover:shadow-lg'
            }`}
          >
            <span>✍️ Répondre au sondage</span>
            <ArrowRight className="w-5 h-5 text-emerald-300" />
          </button>

          {/* Sub actions */}
          <div className="flex flex-wrap items-center justify-center gap-2 pt-2 text-xs">
            <button
              type="button"
              onClick={onOpenQrCode}
              className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl font-bold transition flex items-center gap-1.5 cursor-pointer"
            >
              <QrCode className="w-3.5 h-3.5 text-emerald-600" />
              <span>Afficher le QR Code</span>
            </button>

            <button
              type="button"
              onClick={onCheckMyResponse}
              className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl font-bold transition flex items-center gap-1.5 cursor-pointer"
            >
              <Search className="w-3.5 h-3.5 text-slate-500" />
              <span>Déjà répondu ? Vérifier ma réponse</span>
            </button>
          </div>
        </div>

      </div>

    </div>
  );
};
