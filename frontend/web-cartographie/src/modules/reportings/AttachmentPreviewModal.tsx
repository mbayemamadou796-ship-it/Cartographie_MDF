import React, { useState } from 'react';
import { ReportAttachment } from '@shared/types';
import { 
  X, 
  Download, 
  ExternalLink, 
  FileText, 
  FileSpreadsheet, 
  FileCode, 
  Archive, 
  Image as ImageIcon, 
  File, 
  Printer, 
  Maximize2, 
  Minimize2, 
  RotateCw, 
  ZoomIn, 
  ZoomOut, 
  Copy, 
  Check, 
  Eye, 
  AlertCircle 
} from 'lucide-react';
import { 
  downloadAttachment, 
  openAttachmentInNewTab, 
  formatFileSize, 
  getFileTypeCategory, 
  getFileTypeBadge 
} from '../../utils/attachmentStorage';

interface AttachmentPreviewModalProps {
  isOpen: boolean;
  attachment: ReportAttachment | null;
  onClose: () => void;
}

export const AttachmentPreviewModal: React.FC<AttachmentPreviewModalProps> = ({
  isOpen,
  attachment,
  onClose
}) => {
  const [zoomLevel, setZoomLevel] = useState(1);
  const [rotation, setRotation] = useState(0);
  const [isFullScreen, setIsFullScreen] = useState(false);
  const [copied, setCopied] = useState(false);
  const [pdfLoadError, setPdfLoadError] = useState(false);

  if (!isOpen || !attachment) return null;

  const category = getFileTypeCategory(attachment.name, attachment.type);
  const badge = getFileTypeBadge(attachment.name, attachment.type);
  const formattedSize = formatFileSize(attachment.size);

  const handleDownload = () => {
    downloadAttachment(attachment);
  };

  const handleOpenInNewTab = () => {
    openAttachmentInNewTab(attachment);
  };

  const handlePrint = () => {
    if (category === 'image' && attachment.url) {
      const printWindow = window.open('', '_blank');
      if (printWindow) {
        printWindow.document.write(`
          <html>
            <head><title>${attachment.name}</title></head>
            <body style="margin:0;display:flex;align-items:center;justify-content:center;height:100vh;">
              <img src="${attachment.url}" style="max-width:100%;max-height:100%;" onload="window.print();window.close();" />
            </body>
          </html>
        `);
        printWindow.document.close();
      }
    } else {
      openAttachmentInNewTab(attachment);
    }
  };

  const renderIcon = (cat: string, className = "w-5 h-5") => {
    switch (cat) {
      case 'pdf':
        return <FileText className={`${className} text-red-600`} />;
      case 'image':
        return <ImageIcon className={`${className} text-purple-600`} />;
      case 'excel':
        return <FileSpreadsheet className={`${className} text-emerald-600`} />;
      case 'word':
        return <FileText className={`${className} text-blue-600`} />;
      case 'text':
        return <FileCode className={`${className} text-slate-700`} />;
      case 'archive':
        return <Archive className={`${className} text-amber-600`} />;
      default:
        return <File className={`${className} text-slate-500`} />;
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-slate-950/80 backdrop-blur-xs animate-in fade-in duration-200">
      <div 
        className={`bg-white rounded-3xl border border-slate-200 shadow-2xl overflow-hidden flex flex-col transition-all ${
          isFullScreen ? 'w-full h-full rounded-none' : 'max-w-4xl w-full max-h-[92vh]'
        }`}
      >
        {/* Top Header Bar */}
        <div className="bg-slate-900 text-white p-4 sm:px-6 flex items-center justify-between gap-3 shrink-0 border-b border-slate-800">
          <div className="flex items-center gap-3 min-w-0">
            <div className="p-2.5 rounded-xl bg-white/10 shrink-0">
              {renderIcon(category, "w-5 h-5")}
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <span className={`text-[10px] font-black px-2 py-0.5 rounded-md uppercase border ${badge.bgColor} ${badge.color}`}>
                  {badge.label}
                </span>
                <span className="text-xs text-slate-400 font-medium">
                  {formattedSize}
                </span>
              </div>
              <h2 className="text-sm sm:text-base font-bold text-white truncate font-['Outfit'] mt-0.5" title={attachment.name}>
                {attachment.name}
              </h2>
            </div>
          </div>

          {/* Action buttons */}
          <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
            <button
              type="button"
              onClick={handleOpenInNewTab}
              className="p-2 text-slate-300 hover:text-white hover:bg-white/10 rounded-xl transition cursor-pointer flex items-center gap-1.5 text-xs font-semibold"
              title="Ouvrir dans un nouvel onglet"
            >
              <ExternalLink className="w-4 h-4" />
              <span className="hidden sm:inline">Nouvel onglet</span>
            </button>

            <button
              type="button"
              onClick={handleDownload}
              className="px-3.5 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold transition flex items-center gap-1.5 shadow-xs cursor-pointer"
              title="Télécharger le fichier"
            >
              <Download className="w-4 h-4" />
              <span>Télécharger</span>
            </button>

            <button
              type="button"
              onClick={() => setIsFullScreen(!isFullScreen)}
              className="p-2 text-slate-300 hover:text-white hover:bg-white/10 rounded-xl transition cursor-pointer hidden md:flex"
              title={isFullScreen ? "Réduire" : "Plein écran"}
            >
              {isFullScreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
            </button>

            <button
              type="button"
              onClick={onClose}
              className="p-2 text-slate-400 hover:text-white hover:bg-white/10 rounded-xl transition cursor-pointer ml-1"
              title="Fermer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Viewer Sub-toolbar for zoom/rotate if image */}
        {category === 'image' && attachment.url && (
          <div className="bg-slate-100 border-b border-slate-200 px-4 py-2 flex items-center justify-between text-xs text-slate-700">
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setZoomLevel((z) => Math.max(0.5, z - 0.25))}
                className="p-1.5 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 cursor-pointer"
                title="Zoom arrière"
              >
                <ZoomOut className="w-3.5 h-3.5 text-slate-700" />
              </button>
              <span className="font-mono text-[11px] font-bold w-12 text-center">
                {Math.round(zoomLevel * 100)}%
              </span>
              <button
                type="button"
                onClick={() => setZoomLevel((z) => Math.min(3, z + 0.25))}
                className="p-1.5 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 cursor-pointer"
                title="Zoom avant"
              >
                <ZoomIn className="w-3.5 h-3.5 text-slate-700" />
              </button>
              <button
                type="button"
                onClick={() => setZoomLevel(1)}
                className="px-2 py-1 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 cursor-pointer text-[11px] font-medium"
              >
                Ajuster
              </button>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setRotation((r) => (r + 90) % 360)}
                className="p-1.5 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 cursor-pointer flex items-center gap-1 text-[11px]"
                title="Pivoter à 90°"
              >
                <RotateCw className="w-3.5 h-3.5 text-slate-700" />
                <span>Pivoter</span>
              </button>
              <button
                type="button"
                onClick={handlePrint}
                className="p-1.5 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 cursor-pointer flex items-center gap-1 text-[11px]"
                title="Imprimer l'image"
              >
                <Printer className="w-3.5 h-3.5 text-slate-700" />
                <span>Imprimer</span>
              </button>
            </div>
          </div>
        )}

        {/* Viewer Content Area */}
        <div className="flex-1 overflow-auto p-4 sm:p-6 bg-slate-100 flex items-center justify-center min-h-[350px]">
          {/* 1. IMAGE VIEWER */}
          {category === 'image' && (
            <div className="w-full h-full flex items-center justify-center overflow-auto">
              {attachment.url ? (
                <div 
                  className="transition-transform duration-150 flex items-center justify-center"
                  style={{
                    transform: `scale(${zoomLevel}) rotate(${rotation}deg)`,
                    transformOrigin: 'center center'
                  }}
                >
                  <img
                    src={attachment.url}
                    alt={attachment.name}
                    className="max-h-[68vh] max-w-full object-contain rounded-xl shadow-lg border border-slate-200 bg-white"
                  />
                </div>
              ) : (
                <div className="text-center p-8 bg-white rounded-2xl border border-slate-200 shadow-sm space-y-2 max-w-md">
                  <AlertCircle className="w-8 h-8 text-amber-500 mx-auto" />
                  <p className="font-bold text-slate-800 text-sm">Image non prévisualisable directement</p>
                  <p className="text-xs text-slate-500">Le contenu de cette image peut être téléchargé ci-dessous.</p>
                  <button
                    onClick={handleDownload}
                    className="mt-2 px-4 py-2 bg-emerald-600 text-white rounded-xl text-xs font-bold"
                  >
                    Télécharger {attachment.name}
                  </button>
                </div>
              )}
            </div>
          )}

          {/* 2. PDF VIEWER */}
          {category === 'pdf' && (
            <div className="w-full h-full flex flex-col space-y-3">
              {attachment.url && !pdfLoadError ? (
                <div className="w-full h-[68vh] bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden relative">
                  <object
                    data={attachment.url}
                    type="application/pdf"
                    className="w-full h-full"
                    onError={() => setPdfLoadError(true)}
                  >
                    <iframe
                      src={attachment.url}
                      className="w-full h-full border-0"
                      title={attachment.name}
                    />
                  </object>
                </div>
              ) : (
                <div className="m-auto text-center p-8 bg-white rounded-2xl border border-slate-200 shadow-sm space-y-4 max-w-md">
                  <div className="w-12 h-12 bg-red-100 text-red-600 rounded-2xl flex items-center justify-center mx-auto">
                    <FileText className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="font-bold text-slate-900 text-base">{attachment.name}</h3>
                    <p className="text-xs text-slate-500 mt-1">
                      Document PDF ({formattedSize}). Pour le consulter dans un lecteur externe ou l'enregistrer :
                    </p>
                  </div>
                  <div className="flex flex-wrap items-center justify-center gap-2 pt-2">
                    <button
                      onClick={handleOpenInNewTab}
                      className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold flex items-center gap-1.5"
                    >
                      <ExternalLink className="w-3.5 h-3.5" />
                      <span>Ouvrir dans le navigateur</span>
                    </button>
                    <button
                      onClick={handleDownload}
                      className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold flex items-center gap-1.5"
                    >
                      <Download className="w-3.5 h-3.5" />
                      <span>Télécharger le PDF</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* 3. TABLEUR / EXCEL / CSV */}
          {category === 'excel' && (
            <div className="m-auto text-center p-8 bg-white rounded-2xl border border-emerald-200 shadow-sm space-y-4 max-w-lg">
              <div className="w-16 h-16 bg-emerald-100 text-emerald-700 rounded-3xl flex items-center justify-center mx-auto shadow-inner">
                <FileSpreadsheet className="w-8 h-8" />
              </div>
              <div className="space-y-1">
                <span className="text-[10px] font-black uppercase tracking-wider text-emerald-800 bg-emerald-100 px-2.5 py-0.5 rounded-full">
                  Fichier Tableur / Excel
                </span>
                <h3 className="font-bold text-slate-900 text-base font-['Outfit'] pt-1">{attachment.name}</h3>
                <p className="text-xs text-slate-500">
                  Taille : <strong>{formattedSize}</strong> — Fichier transmis par le référent de zone
                </p>
              </div>

              <div className="bg-emerald-50/70 p-3.5 rounded-xl border border-emerald-200 text-xs text-emerald-950 text-left space-y-1.5">
                <p className="font-semibold flex items-center gap-1.5">
                  <Check className="w-3.5 h-3.5 text-emerald-600" />
                  <span>Prêt pour ouverture dans Microsoft Excel, LibreOffice ou Google Sheets</span>
                </p>
                <p className="text-[11px] text-slate-600">
                  Cliquez sur « Télécharger » pour enregistrer le classeur sur votre ordinateur ou sur « Nouvel onglet » pour l'ouvrir directement.
                </p>
              </div>

              <div className="flex flex-wrap items-center justify-center gap-2.5 pt-2">
                <button
                  onClick={handleDownload}
                  className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold flex items-center gap-2 shadow-xs cursor-pointer"
                >
                  <Download className="w-4 h-4" />
                  <span>Télécharger le fichier Excel</span>
                </button>
                <button
                  onClick={handleOpenInNewTab}
                  className="px-4 py-2.5 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold flex items-center gap-2 cursor-pointer"
                >
                  <ExternalLink className="w-4 h-4" />
                  <span>Ouvrir dans le navigateur</span>
                </button>
              </div>
            </div>
          )}

          {/* 4. WORD / DOCUMENTS */}
          {category === 'word' && (
            <div className="m-auto text-center p-8 bg-white rounded-2xl border border-blue-200 shadow-sm space-y-4 max-w-lg">
              <div className="w-16 h-16 bg-blue-100 text-blue-700 rounded-3xl flex items-center justify-center mx-auto shadow-inner">
                <FileText className="w-8 h-8" />
              </div>
              <div className="space-y-1">
                <span className="text-[10px] font-black uppercase tracking-wider text-blue-800 bg-blue-100 px-2.5 py-0.5 rounded-full">
                  Document Word / Texte formaté
                </span>
                <h3 className="font-bold text-slate-900 text-base font-['Outfit'] pt-1">{attachment.name}</h3>
                <p className="text-xs text-slate-500">
                  Taille : <strong>{formattedSize}</strong> — Fichier texte / Word
                </p>
              </div>

              <div className="bg-blue-50/70 p-3.5 rounded-xl border border-blue-200 text-xs text-blue-950 text-left space-y-1.5">
                <p className="font-semibold flex items-center gap-1.5">
                  <Check className="w-3.5 h-3.5 text-blue-600" />
                  <span>Compatible Microsoft Word, Pages & Google Docs</span>
                </p>
                <p className="text-[11px] text-slate-600">
                  Téléchargez ce document pour consulter les notes, comptes-rendus ou justificatifs transmis.
                </p>
              </div>

              <div className="flex flex-wrap items-center justify-center gap-2.5 pt-2">
                <button
                  onClick={handleDownload}
                  className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold flex items-center gap-2 shadow-xs cursor-pointer"
                >
                  <Download className="w-4 h-4" />
                  <span>Télécharger le document</span>
                </button>
                <button
                  onClick={handleOpenInNewTab}
                  className="px-4 py-2.5 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold flex items-center gap-2 cursor-pointer"
                >
                  <ExternalLink className="w-4 h-4" />
                  <span>Ouvrir</span>
                </button>
              </div>
            </div>
          )}

          {/* 5. ARCHIVES & OTHER */}
          {(category === 'archive' || category === 'other' || category === 'text') && (
            <div className="m-auto text-center p-8 bg-white rounded-2xl border border-slate-200 shadow-sm space-y-4 max-w-lg">
              <div className="w-16 h-16 bg-slate-100 text-slate-700 rounded-3xl flex items-center justify-center mx-auto shadow-inner">
                {renderIcon(category, "w-8 h-8")}
              </div>
              <div className="space-y-1">
                <span className={`text-[10px] font-black uppercase tracking-wider px-2.5 py-0.5 rounded-full border ${badge.bgColor} ${badge.color}`}>
                  {badge.label}
                </span>
                <h3 className="font-bold text-slate-900 text-base font-['Outfit'] pt-1">{attachment.name}</h3>
                <p className="text-xs text-slate-500">
                  Taille : <strong>{formattedSize}</strong>
                </p>
              </div>

              <p className="text-xs text-slate-600 bg-slate-50 p-3 rounded-xl border border-slate-200">
                Vous pouvez télécharger ce fichier sur votre appareil ou l'ouvrir directement dans votre navigateur.
              </p>

              <div className="flex flex-wrap items-center justify-center gap-2.5 pt-2">
                <button
                  onClick={handleDownload}
                  className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold flex items-center gap-2 shadow-xs cursor-pointer"
                >
                  <Download className="w-4 h-4" />
                  <span>Télécharger ({formattedSize})</span>
                </button>
                <button
                  onClick={handleOpenInNewTab}
                  className="px-4 py-2.5 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold flex items-center gap-2 cursor-pointer"
                >
                  <ExternalLink className="w-4 h-4" />
                  <span>Ouvrir dans le navigateur</span>
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer Info */}
        <div className="p-3.5 px-6 bg-white border-t border-slate-200 flex flex-wrap items-center justify-between gap-3 text-xs text-slate-500 shrink-0">
          <div className="flex items-center gap-2">
            <span className="font-bold text-slate-700">Pièce jointe officielle Mbok de France</span>
            <span>•</span>
            <span>{attachment.name}</span>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={handleDownload}
              className="text-emerald-700 font-bold hover:underline flex items-center gap-1 cursor-pointer"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Enregistrer sous...</span>
            </button>
            <button
              onClick={onClose}
              className="px-3 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg font-semibold transition cursor-pointer"
            >
              Fermer
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
