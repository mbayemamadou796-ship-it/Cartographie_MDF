import React from 'react';
import { Member } from '../../types';
import { AlertTriangle, Trash2, X } from 'lucide-react';

interface ConfirmDeleteModalProps {
  member: Member | null;
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (memberId: string) => void;
}

export const ConfirmDeleteModal: React.FC<ConfirmDeleteModalProps> = ({
  member,
  isOpen,
  onClose,
  onConfirm
}) => {
  if (!isOpen || !member) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl shadow-2xl border border-emerald-200 w-full max-w-md overflow-hidden animate-in zoom-in-95 duration-200 p-6 space-y-4 text-slate-800">
        
        <div className="flex items-start gap-3">
          <div className="w-10 h-10 rounded-2xl bg-rose-100 border border-rose-200 text-rose-600 flex items-center justify-center shrink-0">
            <AlertTriangle className="w-5 h-5" />
          </div>

          <div className="flex-1">
            <h3 className="text-base font-bold text-slate-900 font-['Outfit']">
              Confirmer la suppression
            </h3>
            <p className="text-xs text-slate-600 mt-1 leading-relaxed">
              Êtes-vous sûr de vouloir supprimer définitivement le membre <span className="font-bold text-slate-900">{member.prenom} {member.nom}</span> ({member.organisation} - {member.ville}) ?
            </p>
          </div>

          <button onClick={onClose} className="text-slate-400 hover:text-slate-700 p-1 transition-colors">
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-[11px] text-rose-700 font-medium">
          ⚠️ Cette action est irréversible et retirera immédiatement le membre de la carte et de l'annuaire synchronisé.
        </div>

        <div className="flex items-center justify-end gap-3 pt-2">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-200 text-xs font-semibold rounded-xl transition-colors"
          >
            Annuler
          </button>

          <button
            type="button"
            onClick={() => {
              onConfirm(member.id);
              onClose();
            }}
            className="inline-flex items-center gap-1.5 px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold rounded-xl shadow-xs transition-colors"
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span>Supprimer définitivement</span>
          </button>
        </div>

      </div>
    </div>
  );
};
