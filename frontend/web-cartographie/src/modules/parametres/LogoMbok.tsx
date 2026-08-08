import React from 'react';
import { Camera } from 'lucide-react';

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
        {/* Crisp Inner Circle */}
        <div className="w-full h-full rounded-full bg-white flex items-center justify-center relative overflow-hidden shadow-inner">
          {logoUrl ? (
            <img
              src={logoUrl}
              alt={associationName}
              className="w-full h-full object-cover rounded-full"
            />
          ) : (
            /* Default Emblem SVG */
            <svg viewBox="0 0 200 200" className="w-full h-full p-1" fill="none" xmlns="http://www.w3.org/2000/svg">
              <circle cx="100" cy="72" r="54" fill="#eaf8e4" stroke="#5da722" strokeWidth="2.5" />
              <path
                d="M 88,52 C 95,48 108,48 116,58 C 122,66 126,78 120,92 C 114,104 102,112 94,115 C 88,110 82,98 84,86 C 82,72 82,60 88,52 Z"
                fill="#5da722"
                opacity="0.88"
              />
              <path
                d="M 52,50 Q 64,36 78,42 Q 86,52 80,66 Q 66,78 56,72 Q 48,60 52,50 Z"
                fill="#5da722"
                opacity="0.88"
              />
              <path
                d="M 124,42 Q 138,40 146,54 Q 148,70 136,80 Q 128,68 124,42 Z"
                fill="#5da722"
                opacity="0.88"
              />
              <g transform="translate(100, 72) scale(0.68)">
                <path
                  d="M -48,32 L -18,2 C -12,-4 -2,-6 5,2 L 18,16 C 24,22 22,30 14,34 L -24,48 Z"
                  fill="#4a2e19"
                />
                <path
                  d="M 48,32 L 18,2 C 12,-4 2,-6 -5,2 L -18,16 C -24,22 -22,30 -14,34 L 24,48 Z"
                  fill="#613b20"
                />
                <path
                  d="M -14,10 C -9,2 9,2 14,10 C 18,16 12,24 0,24 C -12,24 -18,16 -14,10 Z"
                  fill="#331e10"
                />
                <path
                  d="M -8,14 C -4,8 4,8 8,14 C 10,18 6,22 0,22 C -6,22 -10,18 -8,14 Z"
                  fill="#52321b"
                />
              </g>
              <path id="globe-text-arc" d="M 40,126 A 62,62 0 0,0 160,126" fill="none" />
              <text className="text-[13px] font-bold fill-[#2f6812]" style={{ fontFamily: 'Caveat, Kalam, cursive' }} textAnchor="middle">
                <textPath href="#globe-text-arc" startOffset="50%">
                  Mbok de France
                </textPath>
              </text>
              <text x="100" y="152" textAnchor="middle" fill="#2a5e10" className="text-[14px] font-bold" style={{ fontFamily: 'Kalam, Caveat, cursive' }}>
                Mbok de France
              </text>
              <text x="100" y="172" textAnchor="middle" fill="#2a5e10" className="text-[12px] font-semibold" style={{ fontFamily: 'Kalam, Caveat, cursive' }}>
                au service de la fraternité !
              </text>
            </svg>
          )}

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
