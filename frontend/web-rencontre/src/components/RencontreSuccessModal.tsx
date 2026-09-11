import React, { useState } from 'react';
import { CheckCircle2, QrCode, Calendar, MapPin, Check, Copy, Sparkles, ArrowRight, UserCheck } from 'lucide-react';
import { Rencontre, RencontreResponse } from '@shared/types';

interface RencontreSuccessModalProps {
  rencontre: Rencontre;
  response: RencontreResponse;
  onClose: () => void;
  onEdit: () => void;
}

export const RencontreSuccessModal: React.FC<RencontreSuccessModalProps> = ({
  rencontre,
  response,
  onClose,
  onEdit
}) => {
  const [copied, setCopied] = useState(false);

  const getParticipationLabel = () => {
    if (response.participation === 'OUI') {
      return response.dureePresence === 'TROIS_JOURS' ? 'Présence confirmée — 3 jours' : 'Présence confirmée — Week-end';
    }
    if (response.participation === 'NON') return 'Absence signalée';
    return 'Participation incertaine (en attente)';
  };

  const getParticipationBadgeColor = () => {
    if (response.participation === 'OUI') return 'bg-emerald-100 text-emerald-900 border-emerald-300';
    if (response.participation === 'NON') return 'bg-rose-100 text-rose-900 border-rose-300';
    return 'bg-amber-100 text-amber-900 border-amber-300';
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl shadow-2xl border border-emerald-100 max-w-lg w-full p-6 text-center relative overflow-hidden animate-in zoom-in-95 duration-200">
        
        {/* Top Decorative Sparkle */}
        <div className="w-16 h-16 rounded-2xl bg-emerald-100 text-emerald-700 flex items-center justify-center mx-auto mb-4 ring-8 ring-emerald-50 shadow-inner">
          <CheckCircle2 className="w-10 h-10 stroke-[2.5]" />
        </div>

        <div className="space-y-2.5 mb-5">
          <p className="text-xl sm:text-2xl font-bold text-emerald-800 font-serif" dir="rtl">
            بارك الله فيك وجزاك الله خيرا
          </p>
          <h3 className="text-xl sm:text-2xl font-black text-slate-900 font-['Outfit']">
            Vos informations ont bien été enregistrées.
          </h3>
          <p className="text-xs sm:text-sm font-semibold text-emerald-900 bg-emerald-50/80 py-2 px-4 rounded-xl border border-emerald-200 inline-block shadow-2xs">
            Qu’Allah vous récompense pour votre participation.
          </p>
        </div>

        {/* Summary Card */}
        <div className="bg-slate-50 rounded-2xl p-4 border border-slate-200 text-left space-y-3 mb-5 text-xs">
          
          <div className="flex items-center justify-between pb-2 border-b border-slate-200">
            <span className="text-slate-500 font-medium">Participant</span>
            <span className="font-bold text-slate-900">{response.prenom} {response.nom}</span>
          </div>

          <div className="flex items-center justify-between pb-2 border-b border-slate-200">
            <span className="text-slate-500 font-medium">Zone & Ville</span>
            <span className="font-semibold text-slate-800">{response.zone} {response.ville ? `(${response.ville})` : ''}</span>
          </div>

          <div className="flex items-center justify-between pb-2 border-b border-slate-200">
            <span className="text-slate-500 font-medium">Participation</span>
            <span className={`px-2.5 py-0.5 rounded-full font-bold border ${getParticipationBadgeColor()}`}>
              {getParticipationLabel()}
            </span>
          </div>

          {response.aideOrganisation && response.domainesAide && response.domainesAide.length > 0 && (
            <div className="pb-2 border-b border-slate-200">
              <span className="text-slate-500 font-medium block mb-1">Aide à l'organisation acceptée :</span>
              <div className="flex flex-wrap gap-1">
                {response.domainesAide.map(d => (
                  <span key={d} className="px-2 py-0.5 bg-emerald-100 text-emerald-800 rounded-lg text-[10px] font-bold">
                    ✓ {d}
                  </span>
                ))}
              </div>
            </div>
          )}

          <div className="flex items-center justify-between text-[11px] text-slate-400">
            <span>Date d'enregistrement</span>
            <span>{new Date(response.dateReponse).toLocaleDateString('fr-FR', { day: '2-digit', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit' })}</span>
          </div>

        </div>

        {/* Buttons */}
        <div className="grid grid-cols-2 gap-2">
          <button
            type="button"
            onClick={onEdit}
            className="py-2.5 px-3 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold transition cursor-pointer"
          >
            Modifier ma réponse
          </button>
          <button
            type="button"
            onClick={onClose}
            className="py-2.5 px-3 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold transition cursor-pointer"
          >
            Terminer
          </button>
        </div>

      </div>
    </div>
  );
};
