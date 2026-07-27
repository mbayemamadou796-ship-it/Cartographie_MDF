import React, { useState } from 'react';
import { Search, Filter, Shield, ShieldCheck, Plus, Upload, Download, X, LogOut, User as UserIcon } from 'lucide-react';
import { UserRole, AppUser } from '../types';
import { LogoMbok } from './LogoMbok';

interface HeaderProps {
  searchQuery: string;
  onSearchChange: (query: string) => void;
  userRole: UserRole;
  onToggleRole: () => void;
  activeFilterCount: number;
  onToggleFiltersPanel: () => void;
  isFiltersOpen: boolean;
  onOpenAddMember: () => void;
  onOpenImportModal: () => void;
  onExportExcel: () => void;
  onExportCsv: () => void;
  logoUrl?: string;
  associationName?: string;
  tagline?: string;
  onEditLogoClick?: () => void;
  currentUser?: AppUser | null;
  onLogout?: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  searchQuery,
  onSearchChange,
  userRole,
  onToggleRole,
  activeFilterCount,
  onToggleFiltersPanel,
  isFiltersOpen,
  onOpenAddMember,
  onOpenImportModal,
  onExportExcel,
  onExportCsv,
  logoUrl,
  associationName,
  tagline,
  onEditLogoClick,
  currentUser,
  onLogout
}) => {
  const [showExportMenu, setShowExportMenu] = useState(false);

  return (
    <header className="sticky top-0 z-30 bg-white/95 backdrop-blur-md border-b border-emerald-200 shadow-sm transition-all">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3">
        <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-3 lg:gap-6">
          
          {/* Brand Logo & Name */}
          <div className="flex items-center justify-between gap-4">
            <LogoMbok
              size="md"
              showText={true}
              logoUrl={logoUrl}
              editable={userRole === 'admin'}
              onEditClick={userRole === 'admin' ? onEditLogoClick : undefined}
              associationName={associationName}
              tagline={tagline}
            />

            {/* Mobile logged user & logout button */}
            <div className="lg:hidden flex items-center gap-2">
              {currentUser && (
                <div className="flex items-center gap-1.5 px-2.5 py-1 bg-emerald-50 rounded-xl border border-emerald-200 text-xs">
                  <div className="w-6 h-6 rounded-full bg-emerald-600 text-white flex items-center justify-center font-bold text-[10px]">
                    {currentUser.name.charAt(0).toUpperCase()}
                  </div>
                  <span className="font-bold text-slate-800 truncate max-w-[80px]">{currentUser.name.split(' ')[0]}</span>
                </div>
              )}

              {onLogout && (
                <button
                  onClick={onLogout}
                  className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 text-xs font-bold transition-all"
                  title="Se déconnecter"
                >
                  <LogOut className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">Déconnexion</span>
                </button>
              )}
            </div>
          </div>

          {/* Search & Filter Bar */}
          <div className="flex items-center gap-2 flex-1 max-w-2xl">
            {/* Search Input */}
            <div className="relative flex-1">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Search className="h-4 w-4 text-emerald-600" />
              </div>
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => onSearchChange(e.target.value)}
                placeholder="Rechercher par nom, prénom, ville, fonction, organisation..."
                className="block w-full pl-9 pr-8 py-2 text-xs sm:text-sm bg-emerald-50/50 hover:bg-emerald-50 focus:bg-white text-slate-800 placeholder-slate-400 rounded-xl border border-emerald-200 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-400/30 outline-none transition-all"
              />
              {searchQuery && (
                <button
                  onClick={() => onSearchChange('')}
                  className="absolute inset-y-0 right-0 pr-2.5 flex items-center text-slate-400 hover:text-slate-600"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>

            {/* Filter Toggle Button */}
            <button
              onClick={onToggleFiltersPanel}
              className={`relative inline-flex items-center gap-2 px-3.5 py-2 text-xs sm:text-sm font-semibold rounded-xl border transition-all active:scale-95 ${
                isFiltersOpen || activeFilterCount > 0
                  ? 'bg-emerald-100 border-emerald-300 text-emerald-900 shadow-xs'
                  : 'bg-emerald-50/70 hover:bg-emerald-100/60 border-emerald-200 text-slate-700'
              }`}
            >
              <Filter className="w-4 h-4 text-emerald-600" />
              <span className="hidden sm:inline">Filtres</span>
              {activeFilterCount > 0 && (
                <span className="inline-flex items-center justify-center w-5 h-5 text-[11px] font-bold rounded-full bg-emerald-600 text-white shadow-xs">
                  {activeFilterCount}
                </span>
              )}
            </button>
          </div>

          {/* Role Toggle & Actions */}
          <div className="hidden lg:flex items-center gap-3">
            {/* Export Dropdown */}
            <div className="relative">
              <button
                onClick={() => setShowExportMenu(!showExportMenu)}
                className="inline-flex items-center gap-1.5 px-3 py-2 bg-emerald-50/80 hover:bg-emerald-100 text-slate-700 text-xs font-semibold rounded-xl border border-emerald-200 transition-colors"
              >
                <Download className="w-3.5 h-3.5 text-emerald-600" />
                <span>Exporter</span>
              </button>

              {showExportMenu && (
                <div className="absolute right-0 mt-1.5 w-52 bg-white rounded-xl shadow-xl border border-emerald-100 py-1.5 z-50 text-xs text-slate-700 animate-in fade-in zoom-in-95 duration-150">
                  <button
                    onClick={() => {
                      onExportExcel();
                      setShowExportMenu(false);
                    }}
                    className="w-full text-left px-3.5 py-2 hover:bg-emerald-50 text-slate-800 font-medium flex items-center gap-2 transition-colors"
                  >
                    <span>📊 Exporter en Excel (.xlsx)</span>
                  </button>
                  <button
                    onClick={() => {
                      onExportCsv();
                      setShowExportMenu(false);
                    }}
                    className="w-full text-left px-3.5 py-2 hover:bg-emerald-50 text-slate-800 font-medium flex items-center gap-2 border-t border-slate-100 transition-colors"
                  >
                    <span>📄 Exporter en CSV (.csv)</span>
                  </button>
                </div>
              )}
            </div>

            {/* Admin Action Buttons */}
            {userRole === 'admin' && (
              <>
                <button
                  onClick={onOpenImportModal}
                  className="inline-flex items-center gap-1.5 px-3 py-2 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 text-xs font-semibold rounded-xl border border-emerald-300 transition-colors shadow-xs"
                >
                  <Upload className="w-3.5 h-3.5 text-emerald-600" />
                  <span>Import Excel</span>
                </button>

                <button
                  onClick={onOpenAddMember}
                  className="inline-flex items-center gap-1.5 px-4 py-2 bg-gradient-to-r from-[#2be39d] via-[#48c92a] to-[#8de02d] hover:brightness-105 text-emerald-950 text-xs font-extrabold rounded-xl shadow-sm transition-all active:scale-95"
                >
                  <Plus className="w-4 h-4 text-emerald-950" />
                  <span>Ajouter un membre</span>
                </button>
              </>
            )}

            {/* User Account Info & Logout */}
            <div className="h-6 w-px bg-slate-200 my-auto" />
            
            {currentUser && (
              <div className="flex items-center gap-2 bg-emerald-50/80 px-3 py-1.5 rounded-2xl border border-emerald-200/80">
                <div className="w-7 h-7 rounded-full bg-emerald-600 text-white flex items-center justify-center font-bold text-xs shadow-2xs">
                  {currentUser.name.charAt(0).toUpperCase()}
                </div>
                <div className="flex flex-col">
                  <span className="text-xs font-bold text-slate-800 leading-tight">
                    {currentUser.name}
                  </span>
                  <span className="text-[10px] font-extrabold text-emerald-800 flex items-center gap-1">
                    {userRole === 'admin' ? (
                      <>
                        <ShieldCheck className="w-3 h-3 text-emerald-600 inline" />
                        <span>Administrateur</span>
                      </>
                    ) : (
                      <>
                        <Shield className="w-3 h-3 text-slate-500 inline" />
                        <span>Utilisateur</span>
                      </>
                    )}
                  </span>
                </div>
              </div>
            )}

            {onLogout && (
              <button
                onClick={onLogout}
                className="inline-flex items-center gap-1.5 px-3 py-2 bg-rose-50 hover:bg-rose-100 text-rose-700 text-xs font-bold rounded-xl border border-rose-200 transition-all active:scale-95 cursor-pointer"
                title="Se déconnecter"
              >
                <LogOut className="w-3.5 h-3.5" />
                <span>Déconnexion</span>
              </button>
            )}
          </div>

        </div>

        {/* Admin Bar on mobile if admin */}
        {userRole === 'admin' && (
          <div className="lg:hidden flex items-center gap-2 mt-2 pt-2 border-t border-slate-100">
            <button
              onClick={onOpenAddMember}
              className="flex-1 inline-flex items-center justify-center gap-1.5 px-3 py-1.5 bg-emerald-600 text-white text-xs font-bold rounded-lg shadow-xs"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Nouveau membre</span>
            </button>

            <button
              onClick={onOpenImportModal}
              className="inline-flex items-center justify-center gap-1.5 px-3 py-1.5 bg-emerald-50 text-emerald-800 text-xs font-semibold rounded-lg border border-emerald-200"
            >
              <Upload className="w-3.5 h-3.5 text-emerald-600" />
              <span>Import Excel</span>
            </button>

            <button
              onClick={onExportExcel}
              className="inline-flex items-center justify-center gap-1 px-2.5 py-1.5 bg-slate-100 text-slate-700 text-xs font-medium rounded-lg border border-slate-200"
            >
              <Download className="w-3.5 h-3.5 text-slate-500" />
              <span>Export</span>
            </button>
          </div>
        )}
      </div>
    </header>
  );
};
