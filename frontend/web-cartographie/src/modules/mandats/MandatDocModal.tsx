import React, { useState } from 'react';
import { MandatDocument } from '../../types';
import { X, FileText, Check, Upload } from 'lucide-react';

interface MandatDocModalProps {
  isOpen: boolean;
  mandatIntitule: string;
  onClose: () => void;
  onSave: (doc: Omit<MandatDocument, 'id' | 'dateAjout'>) => void;
}

export const MandatDocModal: React.FC<MandatDocModalProps> = ({
  isOpen,
  mandatIntitule,
  onClose,
  onSave
}) => {
  const [name, setName] = useState('');
  const [category, setCategory] = useState<MandatDocument['category']>('RAPPORT');
  const [description, setDescription] = useState('');
  const [fileSize, setFileSize] = useState<number>(1200000);

  if (!isOpen) return null;

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setName(file.name);
      setFileSize(file.size);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    onSave({
      name: name.trim(),
      category,
      description: description.trim() || undefined,
      size: fileSize,
      type: 'application/pdf'
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs animate-in fade-in duration-150">
      <div className="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-8 shadow-2xl border border-emerald-200 relative">
        <div className="flex items-center justify-between pb-4 mb-6 border-b border-emerald-100">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-emerald-100 text-emerald-800">
              <FileText className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-extrabold text-slate-900">
                Joindre un Document au Mandat
              </h3>
              <p className="text-xs text-slate-500">{mandatIntitule}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
              Fichier (PDF, DOCX, etc.)
            </label>
            <label className="border-2 border-dashed border-slate-300 hover:border-emerald-500 rounded-2xl p-4 flex flex-col items-center justify-center cursor-pointer transition-colors bg-slate-50">
              <Upload className="w-6 h-6 text-slate-400 mb-1.5" />
              <span className="text-xs font-semibold text-slate-700">
                {name || 'Cliquez pour sélectionner un fichier'}
              </span>
              <span className="text-[10px] text-slate-400 mt-0.5">Stocké dans Supabase Storage (mandats/)</span>
              <input
                type="file"
                className="hidden"
                accept=".pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx,.jpg,.png"
                onChange={handleFileUpload}
              />
            </label>
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
              Intitulé / Nom du Document *
            </label>
            <input
              type="text"
              required
              placeholder="Ex: PV_Assemblee_Generale_2026.pdf"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs font-semibold text-slate-900 focus:bg-white focus:ring-2 focus:ring-emerald-500 outline-hidden"
            />
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
              Type d'Acte / Catégorie *
            </label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value as MandatDocument['category'])}
              className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs font-semibold text-slate-900 focus:bg-white focus:ring-2 focus:ring-emerald-500 outline-hidden"
            >
              <option value="PROCES_VERBAL">Procès-Verbal (PV)</option>
              <option value="RAPPORT">Rapport d'activité / Moral</option>
              <option value="BILAN">Bilan Financier / Comptable</option>
              <option value="FEUILLE_DE_ROUTE">Feuille de Route & Stratégie</option>
              <option value="COMPTE_RENDU">Compte Rendu de Réunion</option>
              <option value="PRESENTATION">Présentation d'Assemblée Générale</option>
              <option value="PHOTO">Photos & Médias du Mandat</option>
              <option value="PROJET">Document de Projet Spécifique</option>
              <option value="AUTRE">Autre Document</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
              Note ou Description du Contenu (Optionnel)
            </label>
            <textarea
              rows={2}
              placeholder="Précisez le contexte ou les résolutions votées..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full px-3.5 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs text-slate-900 focus:bg-white focus:ring-2 focus:ring-emerald-500 outline-hidden"
            />
          </div>

          <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-200">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 rounded-xl border border-slate-300 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition-colors"
            >
              Annuler
            </button>
            <button
              type="submit"
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-emerald-800 text-white text-xs font-bold hover:bg-emerald-900 shadow-md transition-colors"
            >
              <Check className="w-4 h-4" />
              Verser le Document
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
