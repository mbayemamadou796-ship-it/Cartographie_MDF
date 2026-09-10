import React, { useState } from 'react';
import { UsefulDocument } from '../../types';
import { 
  X, 
  Download, 
  FileText, 
  Calendar, 
  Tag, 
  ShieldCheck, 
  BookOpen, 
  Layers, 
  CheckCircle2, 
  Copy, 
  Printer, 
  Maximize2, 
  Minimize2,
  ExternalLink,
  Info,
  Clock,
  Eye
} from 'lucide-react';
import { DocumentService } from '../../services/documentService';

interface DocumentPreviewModalProps {
  isOpen: boolean;
  document: UsefulDocument;
  onClose: () => void;
  onDownload?: () => void;
}

export const DocumentPreviewModal: React.FC<DocumentPreviewModalProps> = ({
  isOpen,
  document: doc,
  onClose,
  onDownload
}) => {
  const [activeTab, setActiveTab] = useState<'content' | 'info'>('content');
  const [copied, setCopied] = useState(false);
  const [isFullScreen, setIsFullScreen] = useState(false);

  if (!isOpen) return null;

  const handleCopyText = () => {
    const textToCopy = doc.content || `${doc.name}\n\n${doc.description}`;
    navigator.clipboard.writeText(textToCopy);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handlePrint = () => {
    const printWindow = window.open('', '_blank');
    if (!printWindow) {
      window.print();
      return;
    }
    const htmlContent = `
      <!DOCTYPE html>
      <html>
        <head>
          <title>${doc.name} — Mbok de France</title>
          <style>
            body { font-family: 'Helvetica Neue', Arial, sans-serif; padding: 40px; color: #1e293b; line-height: 1.6; max-width: 800px; margin: auto; }
            .header { border-bottom: 2px solid #065f46; padding-bottom: 15px; margin-bottom: 25px; }
            .badge { background: #d1fae5; color: #065f46; padding: 4px 8px; border-radius: 4px; font-size: 12px; font-weight: bold; }
            h1 { color: #065f46; font-size: 22px; margin: 10px 0; }
            h2, h3 { color: #0f172a; margin-top: 20px; }
            pre { background: #f8fafc; border: 1px solid #e2e8f0; padding: 15px; border-radius: 8px; white-space: pre-wrap; font-family: inherit; }
            .footer { margin-top: 40px; border-top: 1px solid #cbd5e1; padding-top: 10px; font-size: 12px; color: #64748b; text-align: center; }
          </style>
        </head>
        <body>
          <div class="header">
            <span class="badge">${doc.category} — v${doc.version}</span>
            <h1>${doc.name}</h1>
            <p><strong>Fichier :</strong> ${doc.fileName} | <strong>Date de mise à jour :</strong> ${doc.dateMiseAJour}</p>
          </div>
          <pre>${doc.content || doc.description}</pre>
          <div class="footer">
            Document officiel — Association Mbok de France (MDF) — ${new Date().toLocaleDateString('fr-FR')}
          </div>
        </body>
      </html>
    `;
    printWindow.document.write(htmlContent);
    printWindow.document.close();
    printWindow.focus();
    setTimeout(() => {
      printWindow.print();
      printWindow.close();
    }, 300);
  };

  const handleDownloadClick = () => {
    DocumentService.downloadDocument(doc);
    if (onDownload) onDownload();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-slate-950/75 backdrop-blur-xs animate-in fade-in duration-150">
      <div 
        className={`bg-white rounded-3xl shadow-2xl border border-emerald-200 flex flex-col transition-all duration-200 ${
          isFullScreen 
            ? 'w-full h-full max-w-none rounded-none' 
            : 'max-w-4xl w-full max-h-[92vh]'
        }`}
      >
        {/* Top Header */}
        <div className="flex items-start justify-between p-4 sm:p-6 pb-3 border-b border-emerald-100 bg-slate-50/80 rounded-t-3xl shrink-0">
          <div className="flex items-start gap-3 min-w-0 pr-4">
            <div className="p-3 rounded-2xl bg-emerald-100 text-emerald-800 border border-emerald-300 shrink-0">
              <FileText className="w-6 h-6 text-emerald-800" />
            </div>
            <div className="min-w-0">
              <div className="flex flex-wrap items-center gap-2 mb-1">
                <span className="px-2.5 py-0.5 rounded-md text-[10px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-200">
                  {doc.category}
                </span>
                <span className="px-2 py-0.5 rounded-full text-[11px] font-extrabold bg-slate-900 text-white font-mono">
                  v{doc.version}
                </span>
                <span className="inline-flex items-center gap-1 text-[11px] text-emerald-800 font-semibold bg-emerald-50 px-2 py-0.5 rounded-md">
                  <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                  Certifié MDF
                </span>
              </div>
              <h2 className="text-base sm:text-lg font-extrabold text-slate-900 truncate">
                {doc.name}
              </h2>
              <span className="text-xs text-slate-500 font-mono flex items-center gap-2 mt-0.5">
                <span>{doc.fileName}</span>
                <span>•</span>
                <span>Mise à jour : {doc.dateMiseAJour}</span>
              </span>
            </div>
          </div>

          <div className="flex items-center gap-1.5 shrink-0">
            <button
              onClick={() => setIsFullScreen(!isFullScreen)}
              title={isFullScreen ? "Réduire" : "Plein écran"}
              className="p-2 rounded-xl text-slate-500 hover:text-slate-900 hover:bg-slate-200 transition-colors"
            >
              {isFullScreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
            </button>
            <button
              onClick={onClose}
              className="p-2 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-200 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Navigation Tabs between Content & Info */}
        <div className="flex items-center justify-between px-4 sm:px-6 pt-3 border-b border-slate-200 bg-white shrink-0">
          <div className="flex items-center gap-2">
            <button
              onClick={() => setActiveTab('content')}
              className={`flex items-center gap-2 px-4 py-2 text-xs font-bold border-b-2 transition-all cursor-pointer ${
                activeTab === 'content'
                  ? 'border-emerald-700 text-emerald-900 bg-emerald-50/50 rounded-t-lg'
                  : 'border-transparent text-slate-500 hover:text-slate-800'
              }`}
            >
              <BookOpen className="w-4 h-4" />
              <span>Contenu Intégral du Fichier</span>
            </button>
            <button
              onClick={() => setActiveTab('info')}
              className={`flex items-center gap-2 px-4 py-2 text-xs font-bold border-b-2 transition-all cursor-pointer ${
                activeTab === 'info'
                  ? 'border-emerald-700 text-emerald-900 bg-emerald-50/50 rounded-t-lg'
                  : 'border-transparent text-slate-500 hover:text-slate-800'
              }`}
            >
              <Info className="w-4 h-4" />
              <span>Fiche Mémo & Métadonnées</span>
            </button>
          </div>

          <div className="flex items-center gap-2 pb-1.5">
            <button
              onClick={handleCopyText}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-slate-100 hover:bg-slate-200 text-slate-700 transition-colors"
              title="Copier le texte"
            >
              <Copy className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">{copied ? 'Copié !' : 'Copier texte'}</span>
            </button>
            <button
              onClick={handlePrint}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-slate-100 hover:bg-slate-200 text-slate-700 transition-colors"
              title="Imprimer"
            >
              <Printer className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Imprimer</span>
            </button>
          </div>
        </div>

        {/* Modal Scrollable Body */}
        <div className="flex-1 p-4 sm:p-6 overflow-y-auto bg-slate-100/70 space-y-4">
          {activeTab === 'content' && (
            <div className="bg-white rounded-2xl p-6 sm:p-8 shadow-xs border border-slate-200 max-w-3xl mx-auto space-y-6">
              {/* Document Official Letterhead */}
              <div className="border-b-2 border-emerald-800 pb-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-slate-800">
                <div>
                  <div className="text-[11px] font-black text-emerald-900 uppercase tracking-wider font-['Outfit']">
                    Association Mbok de France (MDF)
                  </div>
                  <div className="text-xs text-slate-500 font-medium">
                    Pôle Administration & Gouvernance
                  </div>
                </div>
                <div className="text-right text-xs text-slate-500 font-mono">
                  <div>Réf : {doc.id.toUpperCase()}</div>
                  <div>Version : v{doc.version}</div>
                </div>
              </div>

              {/* Title inside Document */}
              <div className="text-center py-2">
                <h1 className="text-xl sm:text-2xl font-black text-slate-950 font-['Outfit']">
                  {doc.name}
                </h1>
                <p className="text-xs text-slate-500 mt-1 italic">
                  Document officiel à destination des adhérents et référents territoriaux
                </p>
              </div>

              {/* Document Text Body */}
              <div className="prose prose-slate max-w-none text-xs sm:text-sm text-slate-800 leading-relaxed space-y-4 bg-slate-50/50 p-4 sm:p-6 rounded-xl border border-slate-200/80 font-sans">
                {doc.content ? (
                  <div className="whitespace-pre-wrap font-sans text-slate-800">
                    {doc.content}
                  </div>
                ) : (
                  <div className="space-y-3">
                    <p className="font-semibold text-slate-900">{doc.description}</p>
                    <div className="p-4 bg-emerald-50 text-emerald-900 rounded-xl border border-emerald-200">
                      Ce document est certifié par l'Association Mbok de France. Vous pouvez télécharger le fichier original complet ({doc.fileName}) ci-dessous.
                    </div>
                  </div>
                )}
              </div>

              {/* Document Footer Signature */}
              <div className="pt-6 border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-500 gap-4">
                <div className="flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-emerald-600" />
                  <span>Validation : {doc.authorName || 'Bureau National MDF'}</span>
                </div>
                <div className="font-mono text-[11px]">
                  Date d'effet : {doc.datePublication} — MAJ : {doc.dateMiseAJour}
                </div>
              </div>
            </div>
          )}

          {activeTab === 'info' && (
            <div className="space-y-4 max-w-3xl mx-auto">
              {/* Instructions & Summary */}
              <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-3">
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 flex items-center gap-2">
                  <Info className="w-4 h-4 text-emerald-600" />
                  <span>Rôle & Consignes d'utilisation pour le Référent</span>
                </h3>
                <p className="text-xs sm:text-sm text-slate-700 leading-relaxed bg-slate-50 p-4 rounded-xl border border-slate-200">
                  {doc.description}
                </p>
              </div>

              {/* Technical Metadata */}
              <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block">Fichier & Version</span>
                  <div className="text-xs text-slate-800 space-y-1">
                    <div><strong>Nom de fichier :</strong> <span className="font-mono">{doc.fileName}</span></div>
                    <div><strong>Type :</strong> {doc.fileType}</div>
                    {doc.fileSize && (
                      <div><strong>Taille :</strong> {(doc.fileSize / (1024 * 1024)).toFixed(2)} Mo</div>
                    )}
                    <div><strong>Version active :</strong> <span className="font-mono font-bold text-emerald-700">v{doc.version}</span></div>
                  </div>
                </div>

                <div className="space-y-2">
                  <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block">Publication & Auteur</span>
                  <div className="text-xs text-slate-800 space-y-1">
                    <div><strong>Première publication :</strong> {doc.datePublication}</div>
                    <div><strong>Dernière mise à jour :</strong> {doc.dateMiseAJour}</div>
                    <div><strong>Auteur / Pôle :</strong> {doc.authorName || 'Secrétariat Général MDF'}</div>
                    <div><strong>Statut :</strong> <span className="text-emerald-700 font-bold">{doc.statut}</span></div>
                  </div>
                </div>
              </div>

              {/* Versions History */}
              {doc.versionsHistorique && doc.versionsHistorique.length > 0 && (
                <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-3">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 flex items-center gap-2">
                    <Clock className="w-4 h-4 text-emerald-600" />
                    <span>Historique des versions archivées</span>
                  </h3>
                  <div className="space-y-2">
                    {doc.versionsHistorique.map((v) => (
                      <div key={v.id} className="p-3 bg-slate-50 rounded-xl border border-slate-200 flex items-start justify-between gap-3 text-xs">
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-mono font-bold text-slate-900 bg-white px-2 py-0.5 rounded border border-slate-200">
                              v{v.version}
                            </span>
                            <span className="text-slate-500">{v.date}</span>
                          </div>
                          {v.notes && <p className="text-slate-600 mt-1">{v.notes}</p>}
                        </div>
                        {v.fileName && <span className="text-[11px] text-slate-400 font-mono">{v.fileName}</span>}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Keywords / Tags */}
              {doc.tags && doc.tags.length > 0 && (
                <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs flex items-center gap-2">
                  <Tag className="w-4 h-4 text-slate-400 shrink-0" />
                  <span className="text-xs text-slate-500 font-medium">Mots-clés :</span>
                  <div className="flex flex-wrap gap-1.5">
                    {doc.tags.map((t, idx) => (
                      <span key={idx} className="px-2 py-0.5 rounded-md text-[11px] font-semibold bg-emerald-50 text-emerald-800 border border-emerald-200">
                        #{t}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="flex items-center justify-between p-4 sm:p-6 border-t border-slate-200 bg-white rounded-b-3xl shrink-0">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2.5 rounded-xl border border-slate-300 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition-colors cursor-pointer"
          >
            Fermer
          </button>

          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={handlePrint}
              className="hidden sm:inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl border border-emerald-300 text-emerald-900 bg-emerald-50 text-xs font-bold hover:bg-emerald-100 transition-colors cursor-pointer"
            >
              <Printer className="w-4 h-4" />
              Imprimer le document
            </button>

            <button
              type="button"
              onClick={handleDownloadClick}
              className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl bg-emerald-800 text-white text-xs font-bold hover:bg-emerald-900 shadow-md transition-colors cursor-pointer active:scale-95"
            >
              <Download className="w-4 h-4" />
              <span>Télécharger le Fichier ({doc.fileName})</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
