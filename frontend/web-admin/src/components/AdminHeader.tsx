import React from 'react';
import { AppUser } from '@shared/types';
import { ShieldAlert, LogOut, ArrowLeftRight, Settings, Users, Bell } from 'lucide-react';

interface AdminHeaderProps {
  currentUser: AppUser | null;
  onLogout: () => void;
  onSwitchPortal: (portal: 'cartographie' | 'referent' | 'admin' | 'formulaire') => void;
}

export const AdminHeader: React.FC<AdminHeaderProps> = ({
  currentUser,
  onLogout,
  onSwitchPortal
}) => {
  return (
    <header className="bg-slate-950 text-white border-b border-slate-800 shadow-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo & Portal Identity */}
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-600 to-purple-800 flex items-center justify-center text-white font-black text-lg shadow-inner">
              🏛️
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-extrabold text-base tracking-tight text-white">MDF — Administration & Pilotage</span>
                <span className="bg-indigo-500/20 text-indigo-300 text-[10px] font-bold px-2 py-0.5 rounded-full border border-indigo-500/30">
                  Bureau National
                </span>
              </div>
              <p className="text-xs text-slate-400">Cockpit de supervision nationale, arbitrage des cas & gouvernance</p>
            </div>
          </div>

          {/* User Profile & Portal Switcher Actions */}
          <div className="flex items-center gap-3">
            {/* Quick Switch Button to Cartographie */}
            <button
              onClick={() => onSwitchPortal('cartographie')}
              className="hidden md:flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 text-slate-300 text-xs font-semibold border border-slate-800 transition"
              title="Retour à la Cartographie générale"
            >
              <ArrowLeftRight className="w-3.5 h-3.5 text-indigo-400" />
              <span>Cartographie</span>
            </button>

            <button
              onClick={() => onSwitchPortal('referent')}
              className="hidden md:flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-950 hover:bg-emerald-900 text-emerald-300 text-xs font-semibold border border-emerald-700/50 transition"
              title="Ouvrir la vue Référent"
            >
              <span>📍 Vue Référent</span>
            </button>

            {/* User Badge */}
            <div className="flex items-center gap-2 bg-slate-900 px-3 py-1.5 rounded-xl border border-slate-800">
              <div className="w-7 h-7 rounded-full bg-indigo-700 flex items-center justify-center text-white font-bold text-xs">
                {currentUser?.nom?.charAt(0) || 'A'}
              </div>
              <div className="text-left">
                <div className="text-xs font-bold text-slate-200 leading-tight">
                  {currentUser?.nom || 'Administrateur'}
                </div>
                <div className="text-[10px] text-indigo-400">
                  Bureau National
                </div>
              </div>
            </div>

            {/* Logout */}
            <button
              onClick={onLogout}
              className="p-2 rounded-lg bg-slate-900 hover:bg-red-950 text-slate-400 hover:text-red-300 transition border border-slate-800"
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
