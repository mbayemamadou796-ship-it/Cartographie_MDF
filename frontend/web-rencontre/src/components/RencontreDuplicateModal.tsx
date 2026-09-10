import React from 'react';
import { AlertCircle, CheckCircle2, X, Edit3, ArrowRight } from 'lucide-react';
import { Rencontre, RencontreResponse } from '@shared/types';

interface RencontreDuplicateModalProps {
  rencontre: Rencontre;
  existingResponse: RencontreResponse;
  onClose: () => void;
  onEdit: () => void;
}

export const RencontreDuplicateModal: React.FC<RencontreDuplicateModalProps> = ({
  rencontre,
  existingResponse,
  onClose,
  onEdit
}) => {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl shadow-2xl border border-amber-200 max-w-md w-full p-6 text-center relative overflow-hidden">
        
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 rounded-full text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Warning Icon */}
        <div className="w-14 h-14 rounded-full bg-amber-100 text-amber-700 flex items-center justify-center mx-auto mb-3 ring-8 ring-amber-50">
          <AlertCircle className="w-8 h-8" />
        </div>

        <h3 className="text-xl font-black text-slate-900 mb-1">
          Réponse déjà enregistrée
        </h3>
        <p className="text-xs text-slate-600 font-medium mb-4">
          Vous avez déjà répondu au sondage de la <strong className="text-slate-900">{rencontre.nom}</strong>.
        </p>

        {/* Recap card */}
        <div className="bg-amber-50/70 border border-amber-200 rounded-2xl p-4 text-left text-xs mb-5 space-y-2">
          <div className="flex justify-between">
            <span className="text-slate-500">Membre :</span>
            <span className="font-bold text-slate-900">{existingResponse.prenom} {existingResponse.nom}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-slate-500">Participation enregistrée :</span>
            <span className="font-extrabold text-emerald-800">
              {existingResponse.participation === 'OUI' ? 'Oui (Présent)' : existingResponse.participation === 'NON' ? 'Non (Absent)' : 'Incertain'}
            </span>
          </div>
          {existingResponse.dureePresence && (
            <div className="flex justify-between">
              <span className="text-slate-500">Durée :</span>
              <span className="font-semibold text-slate-700">
                {existingResponse.dureePresence === 'TROIS_JOURS' ? 'Les 3 jours' : 'Week-end uniquement'}
              </span>
            </div>
          )}
          <div className="flex justify-between">
            <span className="text-slate-500">Aide organisation :</span>
            <span className="font-semibold text-slate-700">{existingResponse.aideOrganisation ? 'Oui (Volontaire)' : 'Non'}</span>
          </div>
          <div className="flex justify-between pt-1 border-t border-amber-200/60 text-[10px] text-slate-400">
            <span>Date de la réponse :</span>
            <span>{new Date(existingResponse.dateReponse).toLocaleDateString('fr-FR')}</span>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="grid grid-cols-2 gap-2.5">
          <button
            type="button"
            onClick={onClose}
            className="py-2.5 px-3 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold transition cursor-pointer"
          >
            Fermer
          </button>
          <button
            type="button"
            onClick={onEdit}
            className="py-2.5 px-3 bg-emerald-800 hover:bg-emerald-900 text-white rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition shadow-sm cursor-pointer"
          >
            <Edit3 className="w-3.5 h-3.5" />
            <span>Modifier ma réponse</span>
          </button>
        </div>

      </div>
    </div>
  );
};
