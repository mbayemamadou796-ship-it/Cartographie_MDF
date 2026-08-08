import React from 'react';

interface LogoMDFProps {
  className?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  showText?: boolean;
}

export const LogoMDF: React.FC<LogoMDFProps> = ({
  className = '',
  size = 'md',
  showText = true
}) => {
  const sizeClasses = {
    sm: 'w-10 h-10',
    md: 'w-16 h-16',
    lg: 'w-24 h-24',
    xl: 'w-32 h-32'
  };

  return (
    <div className={`flex flex-col items-center text-center ${className}`}>
      {/* Globe & Clasped Hands Logo Graphic */}
      <div className={`relative ${sizeClasses[size]} rounded-full bg-white p-1 shadow-xs border border-emerald-100 flex items-center justify-center overflow-hidden`}>
        <svg
          viewBox="0 0 200 200"
          className="w-full h-full"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          {/* Green Globe Map Silhouette */}
          <circle cx="100" cy="90" r="70" fill="#f4faf0" stroke="#7cb022" strokeWidth="2" strokeDasharray="3 3" />
          
          {/* Continents simplified in vibrant green */}
          <path
            d="M80 35 C85 30, 110 32, 120 40 C125 45, 115 55, 105 60 C95 65, 80 50, 80 35 Z"
            fill="#80c226"
            opacity="0.8"
          />
          <path
            d="M70 70 C75 60, 110 65, 115 80 C120 100, 105 130, 90 135 C75 140, 65 110, 70 70 Z"
            fill="#80c226"
            opacity="0.85"
          />
          <path
            d="M130 75 C140 70, 155 80, 150 95 C145 105, 130 95, 130 75 Z"
            fill="#80c226"
            opacity="0.75"
          />

          {/* Clasped Hands of Unity / Fraternity in Center */}
          <g transform="translate(45, 45) scale(0.55)">
            {/* Left Arm & Hand (Darker brown tone) */}
            <path
              d="M30 110 L70 80 C75 76, 85 80, 90 85 L105 100 C110 105, 105 115, 95 120 L65 135 Z"
              fill="#5a3d28"
            />
            {/* Right Arm & Hand (Warm brown tone) */}
            <path
              d="M170 110 L130 80 C125 76, 115 80, 110 85 L95 100 C90 105, 95 115, 105 120 L135 135 Z"
              fill="#7a5230"
            />
            {/* Interlocked Fingers Detail */}
            <path d="M85 85 C95 80, 105 80, 115 85 C110 95, 90 95, 85 85 Z" fill="#4a301c" />
            <path d="M90 95 C98 90, 108 90, 112 95 C108 102, 95 102, 90 95 Z" fill="#633f22" />
          </g>

          {/* Curved Text inside logo badge */}
          <path id="curve" d="M 40,155 A 65,65 0 0,0 160,155" fill="none" />
          <text className="text-[12px] font-bold" fill="#3f6610" textAnchor="middle">
            <textPath href="#curve" startOffset="50%">
              Mbok de France
            </textPath>
          </text>
        </svg>
      </div>

      {showText && (
        <div className="mt-2 text-center">
          <div className="text-sm font-extrabold text-slate-800 tracking-tight font-['Outfit']">
            Mbok de France
          </div>
          <div className="text-[11px] font-semibold text-emerald-800 italic">
            au service de la fraternité !
          </div>
        </div>
      )}
    </div>
  );
};
