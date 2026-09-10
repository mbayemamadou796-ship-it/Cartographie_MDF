import React from 'react';
import { UsefulDocument } from '../../types';
import { X, History, Calendar, FileText, User, Download, ArrowRight, CheckCircle2 } from 'lucide-react';

interface DocumentHistoryModalProps {
  isOpen: boolean;
  document: UsefulDocument;
  onClose: () => void;
}

export const DocumentHistoryModal: React.FC<DocumentHistoryModalProps> = ({
  isOpen,
  document,
  onClose
}) => {
  if (!isOpen) return null;

  const versions = document.versionsHistorique || [];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs animate-in fade-in duration-150">
      <div className="bg-white rounded-3xl max-w-xl w-full p-6 sm:p-8 shadow-2xl border border-emerald-200 max-h-[90vh] overflow-y-auto relative">
        <div className="flex items-center justify-between pb-4 mb-6 border-b border-emerald-100">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-slate-100 text-slate-800">
              <History className="w-5 h-5 text-emerald-800" />
            </div>
            <div>
              <h3 className="text-base font-extrabold text-slate-900">
                Historique des Versions
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

        <div className="space-y-4 mb-6">
          <div className="flex items-center justify-between p-3 bg-emerald-50 rounded-2xl border border-emerald-200 text-xs">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              <span className="font-bold text-emerald-950">Version Active Actuelle :</span>
            </div>
            <span className="px-2 py-0.5 rounded-full font-extrabold bg-emerald-800 text-white font-mono">
              v{document.version}
            </span>
          </div>

          <div className="relative border-l-2 border-slate-200 ml-4 pl-4 space-y-6">
            {versions.map((ver, idx) => {
              const isCurrent = ver.version === document.version;
              return (
                <div key={ver.id || idx} className="relative">
                  {/* Dot */}
                  <div className={`absolute -left-[23px] top-1.5 w-3.5 h-3.5 rounded-full border-2 border-white ${
                    isCurrent ? 'bg-emerald-600 ring-4 ring-emerald-100' : 'bg-slate-400'
                  }`} />

                  <div className="bg-slate-50 p-3.5 rounded-2xl border border-slate-200">
                    <div className="flex items-center justify-between gap-2 mb-1.5">
                      <div className="flex items-center gap-2">
                        <span className="px-2 py-0.5 rounded-md text-xs font-extrabold bg-slate-900 text-white font-mono">
                          v{ver.version}
                        </span>
                        {isCurrent && (
                          <span className="text-[10px] font-bold text-emerald-700 uppercase tracking-wider">
                            Actuelle
                          </span>
                        )}
                      </div>
                      <span className="text-[11px] text-slate-400 font-medium">{ver.date}</span>
                    </div>

                    {ver.notes && (
                      <p className="text-xs text-slate-700 leading-relaxed mb-2">
                        {ver.notes}
                      </p>
                    )}

                    <div className="flex flex-wrap items-center justify-between gap-2 text-[11px] text-slate-500 pt-2 border-t border-slate-200/60">
                      <span className="font-mono text-slate-600 truncate max-w-[200px]">
                        {ver.fileName || document.fileName}
                      </span>
                      {ver.authorName && (
                        <span>Auteur : <strong>{ver.authorName}</strong></span>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        <div className="flex justify-end pt-4 border-t border-slate-200">
          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2.5 rounded-xl bg-slate-800 text-white text-xs font-semibold hover:bg-slate-900 transition-colors"
          >
            Fermer
          </button>
        </div>
      </div>
    </div>
  );
};
