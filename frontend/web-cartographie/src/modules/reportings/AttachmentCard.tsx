import React from 'react';
import { ReportAttachment } from '@shared/types';
import { 
  FileText, 
  FileSpreadsheet, 
  FileCode, 
  Archive, 
  Image as ImageIcon, 
  File, 
  Download, 
  ExternalLink, 
  Eye, 
  Trash2 
} from 'lucide-react';
import { 
  downloadAttachment, 
  openAttachmentInNewTab, 
  formatFileSize, 
  getFileTypeCategory, 
  getFileTypeBadge 
} from '../../utils/attachmentStorage';

interface AttachmentCardProps {
  attachment: ReportAttachment;
  onPreview?: (attachment: ReportAttachment) => void;
  onDelete?: (id: string) => void;
  compact?: boolean;
}

export const AttachmentCard: React.FC<AttachmentCardProps> = ({
  attachment,
  onPreview,
  onDelete,
  compact = false
}) => {
  const category = getFileTypeCategory(attachment.name, attachment.type);
  const badge = getFileTypeBadge(attachment.name, attachment.type);
  const formattedSize = formatFileSize(attachment.size);

  const renderIcon = (className = "w-4 h-4") => {
    switch (category) {
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

  const handleCardClick = (e: React.MouseEvent) => {
    // If clicking action buttons, do not trigger card click
    if ((e.target as HTMLElement).closest('button')) return;
    if (onPreview) {
      onPreview(attachment);
    } else {
      openAttachmentInNewTab(attachment);
    }
  };

  if (compact) {
    return (
      <div 
        onClick={handleCardClick}
        className="group flex items-center justify-between gap-2 bg-slate-50 hover:bg-emerald-50/50 p-2 px-3 rounded-xl border border-slate-200 hover:border-emerald-300 text-xs transition cursor-pointer shadow-2xs"
        title={`Cliquer pour prévisualiser : ${attachment.name}`}
      >
        <div className="flex items-center gap-2 min-w-0">
          <div className="p-1.5 rounded-lg bg-white border border-slate-200 shrink-0">
            {renderIcon("w-3.5 h-3.5")}
          </div>
          <div className="min-w-0">
            <p className="font-semibold text-slate-800 group-hover:text-emerald-950 truncate max-w-[170px] sm:max-w-[220px]">
              {attachment.name}
            </p>
            <p className="text-[10px] text-slate-400 font-medium">
              {formattedSize}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-1 shrink-0">
          {onPreview && (
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                onPreview(attachment);
              }}
              className="p-1.5 text-slate-500 hover:text-emerald-700 hover:bg-emerald-100 rounded-lg transition"
              title="Aperçu / Ouvrir"
            >
              <Eye className="w-3.5 h-3.5" />
            </button>
          )}

          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              downloadAttachment(attachment);
            }}
            className="p-1.5 text-slate-500 hover:text-emerald-700 hover:bg-emerald-100 rounded-lg transition"
            title="Télécharger"
          >
            <Download className="w-3.5 h-3.5" />
          </button>

          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              openAttachmentInNewTab(attachment);
            }}
            className="p-1.5 text-slate-500 hover:text-blue-700 hover:bg-blue-100 rounded-lg transition"
            title="Ouvrir dans un nouvel onglet"
          >
            <ExternalLink className="w-3.5 h-3.5" />
          </button>

          {onDelete && (
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                onDelete(attachment.id || '');
              }}
              className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition"
              title="Supprimer"
            >
              <Trash2 className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </div>
    );
  }

  return (
    <div 
      onClick={handleCardClick}
      className="group flex flex-col justify-between bg-white hover:bg-emerald-50/30 p-3.5 rounded-2xl border border-slate-200 hover:border-emerald-300 transition-all shadow-2xs hover:shadow-xs cursor-pointer"
      title={`Cliquer pour ouvrir le document : ${attachment.name}`}
    >
      <div className="flex items-start gap-3 min-w-0 mb-3">
        <div className="p-2.5 rounded-xl bg-slate-50 group-hover:bg-white border border-slate-200 group-hover:border-emerald-200 shrink-0 transition">
          {renderIcon("w-5 h-5")}
        </div>

        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-1.5 mb-1">
            <span className={`text-[9px] font-black px-1.5 py-0.5 rounded uppercase border ${badge.bgColor} ${badge.color}`}>
              {badge.label}
            </span>
            <span className="text-[11px] text-slate-400 font-medium">
              {formattedSize}
            </span>
          </div>

          <h4 className="text-xs font-bold text-slate-900 group-hover:text-emerald-950 truncate" title={attachment.name}>
            {attachment.name}
          </h4>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex items-center justify-between pt-2 border-t border-slate-100 mt-auto">
        <div className="flex items-center gap-1">
          {onPreview && (
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                onPreview(attachment);
              }}
              className="px-2.5 py-1 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 font-bold rounded-lg text-[11px] transition flex items-center gap-1 cursor-pointer"
              title="Aperçu du fichier"
            >
              <Eye className="w-3 h-3" />
              <span>Aperçu</span>
            </button>
          )}

          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              openAttachmentInNewTab(attachment);
            }}
            className="px-2 py-1 hover:bg-slate-100 text-slate-700 font-semibold rounded-lg text-[11px] transition flex items-center gap-1 cursor-pointer"
            title="Ouvrir dans un nouvel onglet"
          >
            <ExternalLink className="w-3 h-3" />
            <span>Ouvrir</span>
          </button>
        </div>

        <div className="flex items-center gap-1">
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              downloadAttachment(attachment);
            }}
            className="px-2.5 py-1 bg-slate-900 hover:bg-emerald-600 text-white font-bold rounded-lg text-[11px] transition flex items-center gap-1 shadow-2xs cursor-pointer"
            title="Télécharger sur votre ordinateur"
          >
            <Download className="w-3 h-3" />
            <span>Télécharger</span>
          </button>

          {onDelete && (
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                onDelete(attachment.id || '');
              }}
              className="p-1 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition cursor-pointer ml-1"
              title="Supprimer la pièce jointe"
            >
              <Trash2 className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
