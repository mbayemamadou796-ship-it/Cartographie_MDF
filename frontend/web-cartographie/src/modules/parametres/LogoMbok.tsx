import React from 'react';
import { Camera } from 'lucide-react';
import defaultLogo from '@assets/logo-mdf.jpeg';

interface LogoMbokProps {
  size?: 'sm' | 'md' | 'lg' | 'xl';
  showText?: boolean;
  showBadge?: boolean;
  className?: string;
  logoUrl?: string;
  editable?: boolean;
  onEditClick?: () => void;
  associationName?: string;
  tagline?: string;
}

export const LogoMbok: React.FC<LogoMbokProps> = ({
  size = 'md',
  showText = true,
  showBadge = true,
  className = '',
  logoUrl,
  editable = false,
  onEditClick,
  associationName = 'Mbok de France',
  tagline = 'au service de la fraternité !'
}) => {
  const dimensions = {
    sm: { container: 'w-12 h-12', title: 'text-base', motto: 'text-[11px]', camera: 'w-4 h-4' },
    md: { container: 'w-16 h-16 sm:w-20 sm:h-20', title: 'text-xl sm:text-2xl', motto: 'text-xs sm:text-sm', camera: 'w-5 h-5' },
    lg: { container: 'w-24 h-24 sm:w-28 sm:h-28', title: 'text-2xl sm:text-3xl', motto: 'text-sm sm:text-base', camera: 'w-6 h-6' },
    xl: { container: 'w-36 h-36 sm:w-40 sm:h-40', title: 'text-3xl sm:text-4xl', motto: 'text-base sm:text-lg', camera: 'w-7 h-7' }
  }[size];

  // Render title with styled "de France"
  const renderTitle = () => {
    if (associationName === 'Mbok de France') {
      return (
        <>
          Mbok <span className="text-[#3fb222]">de France</span>
        </>
      );
    }
    return associationName;
  };

  return (
    <div className={`flex items-center gap-3.5 ${className}`}>
      {/* Emblem Badge Container */}
      <div
        onClick={onEditClick}
        className={`relative ${dimensions.container} rounded-full bg-gradient-to-tr from-[#31d3ba] via-[#52c234] to-[#bbf055] p-[3px] shadow-lg shadow-emerald-600/20 shrink-0 group ${
          onEditClick ? 'cursor-pointer hover:scale-105 transition-all duration-200' : ''
        }`}
        title={onEditClick ? "Cliquer pour modifier la photo / logo" : undefined}
      >
        {/* Crisp Inner Circle — logo officiel MDF par défaut, photo personnalisée sinon */}
        <div className="w-full h-full rounded-full bg-white flex items-center justify-center relative overflow-hidden shadow-inner">
          <img
            src={logoUrl || defaultLogo}
            alt={associationName}
            className="w-full h-full object-cover rounded-full"
          />

          {/* Hover Overlay Icon when editable (allows changing logo photo on click) */}
          {(editable || onEditClick) && (
            <div className="absolute inset-0 bg-slate-900/35 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center text-white rounded-full backdrop-blur-[1px] p-1">
              <Camera className={dimensions.camera} />
              <span className="text-[9px] font-bold mt-0.5 leading-tight hidden sm:block">Changer</span>
            </div>
          )}
        </div>
      </div>

      {/* Brand Title & Motto beside Logo */}
      {showText && (
        <div className="flex flex-col">
          <div className="flex items-center gap-2">
            <h1 className={`font-extrabold tracking-tight text-emerald-950 ${dimensions.title} font-['Outfit']`}>
              {renderTitle()}
            </h1>
            {showBadge && (
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-[#3fb222]/15 text-[#2b7e16] border border-[#3fb222]/30 shadow-xs hidden sm:inline-flex">
                Annuaire & Carte
              </span>
            )}
          </div>
          <p className={`text-[#2f6e18] font-bold italic font-['Kalam',cursive] tracking-wide ${dimensions.motto}`}>
            {tagline}
          </p>
        </div>
      )}
    </div>
  );
};
