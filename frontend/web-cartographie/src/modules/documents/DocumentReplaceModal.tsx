import React, { useState } from 'react';
import { UsefulDocument } from '../../types';
import { X, RefreshCw, Upload, Check, AlertCircle } from 'lucide-react';

interface DocumentReplaceModalProps {
  isOpen: boolean;
  document: UsefulDocument;
  onClose: () => void;
  onReplace: (fileData: {
    fileName: string;
    fileType: string;
    fileSize?: number;
    fileUrl?: string;
    newVersion: string;
    updateNotes?: string;
  }) => void;
}

export const DocumentReplaceModal: React.FC<DocumentReplaceModalProps> = ({
  isOpen,
  document,
  onClose,
  onReplace
}) => {
  const [fileName, setFileName] = useState('');
  const [fileType, setFileType] = useState('application/pdf');
  const [fileSize, setFileSize] = useState<number>(0);
  const [newVersion, setNewVersion] = useState(() => {
    // Attempt automatic version increment (e.g. 1.0 -> 1.1 or 2.1 -> 2.2)
    const current = document.version || '1.0';
    const parts = current.split('.');
    if (parts.length === 2 && !isNaN(Number(parts[1]))) {
      return `${parts[0]}.${Number(parts[1]) + 1}`;
    }
    return `${current}.1`;
  });
  const [updateNotes, setUpdateNotes] = useState('');

  if (!isOpen) return null;

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setFileName(file.name);
      setFileType(file.type || 'application/pdf');
      setFileSize(file.size);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!fileName.trim() || !newVersion.trim()) return;

    onReplace({
      fileName: fileName.trim(),
      fileType,
      fileSize: fileSize || document.fileSize,
      newVersion: newVersion.trim(),
      updateNotes: updateNotes.trim() || `Mise à jour v${newVersion}`
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs animate-in fade-in duration-150">
      <div className="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-8 shadow-2xl border border-emerald-200 relative">
        <div className="flex items-center justify-between pb-4 mb-6 border-b border-emerald-100">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-amber-100 text-amber-800">
              <RefreshCw className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-extrabold text-slate-900">
                Remplacer le Fichier
              </h3>
              <p className="text-xs text-slate-500">{document.name}</p>
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
          <div className="p-3 bg-amber-50 rounded-2xl border border-amber-200 flex items-start gap-2.5 text-xs text-amber-900">
            <AlertCircle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
            <div>
              Le fichier actuel (<strong>{document.fileName}</strong> — v{document.version}) sera archivé dans l'historique et remplacé par le nouveau fichier.
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
              Nouveau Fichier *
            </label>
            <label className="border-2 border-dashed border-slate-300 hover:border-emerald-500 rounded-2xl p-4 flex flex-col items-center justify-center cursor-pointer transition-colors bg-slate-50">
              <Upload className="w-6 h-6 text-slate-400 mb-1.5" />
              <span className="text-xs font-semibold text-slate-800">
                {fileName || 'Sélectionner le nouveau fichier PDF/Doc'}
              </span>
              <span className="text-[10px] text-slate-400 mt-0.5">
                Remplacement direct dans Supabase Storage
              </span>
              <input
                type="file"
                className="hidden"
                accept=".pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx"
                onChange={handleFileUpload}
              />
            </label>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
                Version Actuelle
              </label>
              <div className="px-3.5 py-2.5 bg-slate-100 border border-slate-200 rounded-xl text-xs font-bold text-slate-600 font-mono">
                v{document.version}
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
                Nouvelle Version *
              </label>
              <input
                type="text"
                required
                value={newVersion}
                onChange={(e) => setNewVersion(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs font-bold text-slate-900 focus:bg-white focus:ring-2 focus:ring-emerald-500 outline-hidden font-mono"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
              Notes de Version / Motif du Changement
            </label>
            <textarea
              rows={3}
              placeholder="Ex: Mise à jour des coordonnées des référents 2026 et ajout de l'antenne PACA..."
              value={updateNotes}
              onChange={(e) => setUpdateNotes(e.target.value)}
              className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs text-slate-900 focus:bg-white focus:ring-2 focus:ring-emerald-500 outline-hidden"
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
              disabled={!fileName}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-emerald-800 text-white text-xs font-bold hover:bg-emerald-900 shadow-md transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Check className="w-4 h-4" />
              Valider le Remplacement
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
