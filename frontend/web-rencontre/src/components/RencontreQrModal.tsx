import React, { useState } from 'react';
import { QrCode, X, Copy, Check, ExternalLink, Download, Share2 } from 'lucide-react';
import { Rencontre } from '@shared/types';

interface RencontreQrModalProps {
  rencontre: Rencontre;
  onClose: () => void;
}

export const RencontreQrModal: React.FC<RencontreQrModalProps> = ({
  rencontre,
  onClose
}) => {
  const [copied, setCopied] = useState(false);

  const surveyUrl = typeof window !== 'undefined'
    ? `${window.location.origin}${window.location.pathname}?app=rencontre&rencontre=${rencontre.id}`
    : `https://mbokdefrance.org?app=rencontre&rencontre=${rencontre.id}`;

  const qrImageUrl = `https://api.qrserver.com/v1/create-qr-code/?size=280x280&data=${encodeURIComponent(surveyUrl)}&color=064e3b&bgcolor=f0fdf4`;

  const handleCopyLink = () => {
    navigator.clipboard.writeText(surveyUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  const handleShareWhatsApp = () => {
    const text = `Assalamou 3aleykoum ya Ikhwa ! Voici le lien officiel pour répondre au sondage de la *${rencontre.nom}* (${rencontre.lieu}) : ${surveyUrl}`;
    window.open(`https://api.whatsapp.com/send?text=${encodeURIComponent(text)}`, '_blank');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl shadow-2xl border border-emerald-100 max-w-md w-full p-6 text-center relative overflow-hidden">
        
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 rounded-full text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header */}
        <div className="inline-flex p-3 rounded-2xl bg-emerald-50 text-emerald-800 mb-3">
          <QrCode className="w-8 h-8" />
        </div>

        <h3 className="text-xl font-black text-slate-900 mb-1">
          QR Code du Sondage
        </h3>
        <p className="text-xs text-slate-500 font-medium mb-5">
          {rencontre.nom} — {rencontre.lieu} ({rencontre.dateAffichage || rencontre.annee})
        </p>

        {/* QR Code Container */}
        <div className="bg-emerald-50/70 p-5 rounded-2xl border border-emerald-200 inline-block mb-5 shadow-inner">
          <img
            src={qrImageUrl}
            alt={`QR Code ${rencontre.nom}`}
            className="w-56 h-56 rounded-xl mx-auto shadow-sm"
          />
        </div>

        {/* Link Box */}
        <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-200 flex items-center justify-between gap-2 mb-4 text-left">
          <span className="text-[11px] text-slate-600 font-mono truncate px-1">
            {surveyUrl}
          </span>
          <button
            onClick={handleCopyLink}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-1 shrink-0 cursor-pointer ${
              copied
                ? 'bg-emerald-600 text-white'
                : 'bg-slate-900 hover:bg-slate-800 text-white'
            }`}
          >
            {copied ? (
              <>
                <Check className="w-3.5 h-3.5" />
                <span>Copié</span>
              </>
            ) : (
              <>
                <Copy className="w-3.5 h-3.5" />
                <span>Copier</span>
              </>
            )}
          </button>
        </div>

        {/* Action Buttons */}
        <div className="grid grid-cols-2 gap-2.5">
          <button
            type="button"
            onClick={handleShareWhatsApp}
            className="py-2.5 px-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition shadow-sm cursor-pointer"
          >
            <Share2 className="w-3.5 h-3.5" />
            <span>Partager WhatsApp</span>
          </button>
          <a
            href={qrImageUrl}
            download={`QR-Code-${rencontre.nom.replace(/\s+/g, '-')}.png`}
            target="_blank"
            rel="noreferrer"
            className="py-2.5 px-3 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition cursor-pointer"
          >
            <Download className="w-3.5 h-3.5 text-slate-600" />
            <span>Télécharger QR</span>
          </a>
        </div>

      </div>
    </div>
  );
};
