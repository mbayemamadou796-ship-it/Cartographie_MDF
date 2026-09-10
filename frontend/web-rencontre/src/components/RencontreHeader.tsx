import React from 'react';
import { Calendar, MapPin, QrCode, ArrowLeft, ExternalLink, ShieldCheck, Sparkles } from 'lucide-react';
import { LogoMbok } from '../../../web-cartographie/src/modules/parametres/LogoMbok';

interface RencontreHeaderProps {
  onSwitchToBureau?: () => void;
  onOpenQrCode?: () => void;
  logoUrl?: string;
  rencontreNom?: string;
  rencontreLieu?: string;
  rencontreDates?: string;
}

export const RencontreHeader: React.FC<RencontreHeaderProps> = ({
  onSwitchToBureau,
  onOpenQrCode,
  logoUrl,
  rencontreNom = 'Rencontre MDF 2026',
  rencontreLieu = 'Toulouse',
  rencontreDates = '25 - 27 Décembre 2026'
}) => {
  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-emerald-100 shadow-xs">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-3">
        <div className="flex items-center justify-between gap-4">
          
          {/* Logo & Platform Name */}
          <div className="flex items-center gap-3">
            <LogoMbok
              size="sm"
              showText={true}
              logoUrl={logoUrl}
              tagline="Sondages & Événements Annuels"
            />
          </div>

          {/* Quick Badges & Actions */}
          <div className="flex items-center gap-2 sm:gap-3">
            {onOpenQrCode && (
              <button
                type="button"
                onClick={onOpenQrCode}
                className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-900 border border-emerald-200 rounded-xl text-xs font-bold transition shadow-2xs cursor-pointer"
                title="Afficher le QR Code du sondage"
              >
                <QrCode className="w-3.5 h-3.5 text-emerald-600" />
                <span>QR Code</span>
              </button>
            )}

            {onSwitchToBureau && (
              <button
                type="button"
                onClick={onSwitchToBureau}
                className="inline-flex items-center gap-1.5 px-3.5 py-1.5 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold transition shadow-sm cursor-pointer"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Espace Bureau MDF</span>
                <span className="sm:hidden">Bureau</span>
              </button>
            )}
          </div>

        </div>
      </div>
    </header>
  );
};
