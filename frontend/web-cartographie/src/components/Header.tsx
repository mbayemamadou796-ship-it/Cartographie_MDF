import React, { useState } from 'react';
import { Search, Filter, Shield, ShieldCheck, Upload, Download, X, LogOut, User as UserIcon } from 'lucide-react';
import { UserRole, AppUser } from '../types';
import { LogoMbok } from './LogoMbok';

interface HeaderProps {
  userRole: UserRole;
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
  userRole,
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
    <header className="sticky top-0 z-30 bg-white/95 backdrop-blur-md border-b border-emerald-200 shadow-xs transition-all">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-2.5">
        <div className="flex items-center justify-between gap-4">
          
          {/* Brand Logo & Name */}
          <div className="flex items-center gap-4">
            <LogoMbok
              size="md"
              showText={true}
              logoUrl={logoUrl}
              editable={userRole === 'admin'}
              onEditClick={userRole === 'admin' ? onEditLogoClick : undefined}
              associationName={associationName}
              tagline={tagline}
            />
          </div>

          {/* Action Buttons & Profile (Right aligned) */}
          <div className="flex items-center gap-2.5 sm:gap-3">
            
            {/* Export Dropdown */}
            <div className="relative">
              <button
                onClick={() => setShowExportMenu(!showExportMenu)}
                className="inline-flex items-center gap-1.5 px-3 py-2 bg-emerald-50/80 hover:bg-emerald-100 text-slate-700 text-xs font-bold rounded-xl border border-emerald-200 transition-colors cursor-pointer"
              >
                <Download className="w-3.5 h-3.5 text-emerald-600" />
                <span className="hidden sm:inline">Exporter</span>
              </button>

              {showExportMenu && (
                <div className="absolute right-0 mt-1.5 w-52 bg-white rounded-2xl shadow-xl border border-emerald-100 py-1.5 z-50 text-xs text-slate-700 animate-in fade-in zoom-in-95 duration-150">
                  <button
                    onClick={() => {
                      onExportExcel();
                      setShowExportMenu(false);
                    }}
                    className="w-full text-left px-3.5 py-2 hover:bg-emerald-50 text-slate-800 font-medium flex items-center gap-2 transition-colors cursor-pointer"
                  >
                    <span>📊 Exporter en Excel (.xlsx)</span>
                  </button>
                  <button
                    onClick={() => {
                      onExportCsv();
                      setShowExportMenu(false);
                    }}
                    className="w-full text-left px-3.5 py-2 hover:bg-emerald-50 text-slate-800 font-medium flex items-center gap-2 border-t border-slate-100 transition-colors cursor-pointer"
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
                  className="inline-flex items-center gap-1.5 px-3 py-2 bg-emerald-50 hover:bg-emerald-100 text-emerald-900 text-xs font-bold rounded-xl border border-emerald-300 transition-colors shadow-2xs cursor-pointer"
                >
                  <Upload className="w-3.5 h-3.5 text-emerald-600" />
                  <span className="hidden md:inline">Import Excel</span>
                </button>
              </>
            )}

            {/* User Account Info & Logout */}
            <div className="hidden sm:block h-6 w-px bg-slate-200 mx-0.5" />
            
            {currentUser && (
              <div className="flex items-center gap-2 bg-emerald-50/80 px-2.5 py-1.5 rounded-2xl border border-emerald-200/80">
                <div className="w-7 h-7 rounded-full bg-emerald-600 text-white flex items-center justify-center font-extrabold text-xs shadow-2xs shrink-0">
                  {currentUser.name ? currentUser.name.charAt(0).toUpperCase() : 'A'}
                </div>
                <div className="hidden md:flex flex-col">
                  <span className="text-xs font-bold text-slate-900 leading-tight">
                    {currentUser.name}
                  </span>
                  <span className="text-[10px] font-extrabold text-emerald-800 flex items-center gap-0.5">
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
                <span className="hidden sm:inline">Déconnexion</span>
              </button>
            )}
          </div>

        </div>
      </div>
    </header>
  );
};
