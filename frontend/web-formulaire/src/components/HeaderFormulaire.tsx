import React from 'react';
import { UserCheck, FileText, Info, HelpCircle, ArrowRight, Layers } from 'lucide-react';

interface HeaderFormulaireProps {
  activeTab: 'accueil' | 'inscription' | 'mise-a-jour' | 'confirmation' | 'informations';
  onNavigate: (tab: 'accueil' | 'inscription' | 'mise-a-jour' | 'confirmation' | 'informations') => void;
  onSwitchToBureau?: () => void;
}

export const HeaderFormulaire: React.FC<HeaderFormulaireProps> = ({
  activeTab,
  onNavigate,
  onSwitchToBureau
}) => {
  return (
    <header className="bg-slate-900 text-white border-b border-emerald-800/40 sticky top-0 z-30 shadow-md">
      {/* Top Banner Switcher for AI Studio Preview */}
      {onSwitchToBureau && (
        <div className="bg-gradient-to-r from-emerald-950 via-slate-900 to-emerald-950 text-emerald-300 py-1.5 px-4 text-xs font-semibold flex items-center justify-between border-b border-emerald-900/50">
          <span className="flex items-center gap-1.5 text-[11px]">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            Espace Membres — Formulaire d'inscription & mise à jour Mbok de France
          </span>
          <button
            onClick={onSwitchToBureau}
            className="hover:text-white bg-emerald-800/40 hover:bg-emerald-700/50 text-emerald-200 px-2.5 py-0.5 rounded-md border border-emerald-700/50 transition-all flex items-center gap-1 text-[11px] font-bold"
          >
            <span>Passer à l'application Cartographie (Bureau MDF)</span>
            <ArrowRight className="w-3 h-3" />
          </button>
        </div>
      )}

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo Brand */}
          <div
            onClick={() => onNavigate('accueil')}
            className="flex items-center gap-3 cursor-pointer group"
          >
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-500 via-teal-500 to-emerald-700 text-white font-black text-xl flex items-center justify-center shadow-md group-hover:scale-105 transition-all">
              MDF
            </div>
            <div>
              <div className="font-black text-lg font-['Outfit'] tracking-tight text-white group-hover:text-emerald-300 transition-colors">
                Mbok de France
              </div>
              <div className="text-[10px] text-emerald-400 font-bold tracking-widest uppercase">
                Portail Membres & Adhésions
              </div>
            </div>
          </div>

          {/* Navigation Links */}
          <nav className="hidden md:flex items-center gap-1">
            <button
              onClick={() => onNavigate('accueil')}
              className={`px-3 py-2 rounded-xl text-xs font-bold transition-all ${
                activeTab === 'accueil'
                  ? 'bg-emerald-500 text-slate-950 font-black'
                  : 'text-slate-300 hover:text-white hover:bg-slate-800'
              }`}
            >
              Accueil
            </button>

            <button
              onClick={() => onNavigate('inscription')}
              className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
                activeTab === 'inscription'
                  ? 'bg-emerald-500 text-slate-950 font-black'
                  : 'text-slate-300 hover:text-white hover:bg-slate-800'
              }`}
            >
              <UserCheck className="w-3.5 h-3.5" />
              <span>S'inscrire</span>
            </button>

            <button
              onClick={() => onNavigate('mise-a-jour')}
              className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
                activeTab === 'mise-a-jour'
                  ? 'bg-emerald-500 text-slate-950 font-black'
                  : 'text-slate-300 hover:text-white hover:bg-slate-800'
              }`}
            >
              <FileText className="w-3.5 h-3.5" />
              <span>Mettre à jour mes infos</span>
            </button>

            <button
              onClick={() => onNavigate('informations')}
              className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
                activeTab === 'informations'
                  ? 'bg-emerald-500 text-slate-950 font-black'
                  : 'text-slate-300 hover:text-white hover:bg-slate-800'
              }`}
            >
              <Info className="w-3.5 h-3.5" />
              <span>Informations & Règles</span>
            </button>
          </nav>
        </div>
      </div>
    </header>
  );
};
