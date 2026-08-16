import React from 'react';
import { AppUser } from '@shared/types';
import { MapPin, User, LogOut, ArrowLeftRight, Bell } from 'lucide-react';

interface ReferentHeaderProps {
  currentUser: AppUser | null;
  onLogout: () => void;
  onSwitchPortal: (portal: 'cartographie' | 'referent' | 'admin' | 'formulaire') => void;
  userZone?: string;
}

export const ReferentHeader: React.FC<ReferentHeaderProps> = ({
  currentUser,
  onLogout,
  onSwitchPortal,
  userZone = 'Toute la France'
}) => {
  return (
    <header className="bg-slate-900 text-white border-b border-slate-800 shadow-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo & Portal Identity */}
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-700 flex items-center justify-center text-white font-black text-lg shadow-inner">
              📍
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-extrabold text-base tracking-tight text-white">MDF — Portail Référent</span>
                <span className="bg-emerald-500/20 text-emerald-300 text-[10px] font-bold px-2 py-0.5 rounded-full border border-emerald-500/30">
                  Zone {userZone}
                </span>
              </div>
              <p className="text-xs text-slate-400">Espace de gestion terrain, liaison et remontées d'antenne</p>
            </div>
          </div>

          {/* User Profile & Portal Switcher Actions */}
          <div className="flex items-center gap-3">
            {/* Quick Switch Button to Cartographie */}
            <button
              onClick={() => onSwitchPortal('cartographie')}
              className="hidden md:flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold border border-slate-700 transition"
              title="Retour à la Cartographie générale"
            >
              <ArrowLeftRight className="w-3.5 h-3.5 text-emerald-400" />
              <span>Cartographie</span>
            </button>

            {currentUser?.role === 'admin' && (
              <button
                onClick={() => onSwitchPortal('admin')}
                className="hidden md:flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-indigo-950 hover:bg-indigo-900 text-indigo-300 text-xs font-semibold border border-indigo-700/50 transition"
                title="Accéder au Portail Administration"
              >
                <span>🏛️ Espace Admin</span>
              </button>
            )}

            {/* User Badge */}
            <div className="flex items-center gap-2 bg-slate-800/80 px-3 py-1.5 rounded-xl border border-slate-700">
              <div className="w-7 h-7 rounded-full bg-emerald-700 flex items-center justify-center text-white font-bold text-xs">
                {currentUser?.nom?.charAt(0) || 'R'}
              </div>
              <div className="text-left">
                <div className="text-xs font-bold text-slate-200 leading-tight">
                  {currentUser?.nom || 'Référent Zone'}
                </div>
                <div className="text-[10px] text-emerald-400">
                  {currentUser?.zone ? `Zone ${currentUser.zone}` : 'Référent Territorial'}
                </div>
              </div>
            </div>

            {/* Logout */}
            <button
              onClick={onLogout}
              className="p-2 rounded-lg bg-slate-800 hover:bg-red-900/60 text-slate-400 hover:text-red-300 transition border border-slate-700"
              title="Déconnexion"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};
