import React from 'react';

export type AdminActiveTab = 
  | 'dashboard'
  | 'remontees'
  | 'cas'
  | 'pilotage'
  | 'users'
  | 'logs'
  | 'settings';

interface AdminNavigationProps {
  activeTab: AdminActiveTab;
  onTabChange: (tab: AdminActiveTab) => void;
  urgentCount?: number;
  enAttenteCount?: number;
}

export const AdminNavigation: React.FC<AdminNavigationProps> = ({
  activeTab,
  onTabChange,
  urgentCount = 0,
  enAttenteCount = 0,
}) => {
  interface TabItem {
    id: AdminActiveTab;
    label: string;
    icon: string;
    badge?: number | string;
    badgeColor?: string;
  }

  const tabs: TabItem[] = [
    { id: 'dashboard', label: 'Dashboard', icon: '📊' },
    { 
      id: 'remontees', 
      label: 'Remontées Référents', 
      icon: '📥',
      badge: enAttenteCount > 0 ? enAttenteCount : undefined,
      badgeColor: 'bg-amber-100 text-amber-900'
    },
    { 
      id: 'cas', 
      label: 'Suivi des Cas & Traitement', 
      icon: '🎯',
      badge: urgentCount > 0 ? urgentCount : undefined,
      badgeColor: 'bg-red-100 text-red-900'
    },
    { id: 'pilotage', label: 'Pilotage & Statistiques', icon: '📈' },
    { id: 'users', label: 'Utilisateurs & Rôles', icon: '👥' },
    { id: 'logs', label: 'Journaux d’audit', icon: '📋' },
    { id: 'settings', label: 'Paramètres', icon: '⚙️' },
  ];

  return (
    <div className="bg-white border-b border-indigo-100 shadow-2xs sticky top-0 z-30">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <nav className="flex space-x-1 sm:space-x-2 overflow-x-auto py-2.5 scrollbar-none" aria-label="Navigation Admin">
          {tabs.map((tab) => {
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => onTabChange(tab.id)}
                className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all whitespace-nowrap ${
                  isActive
                    ? 'bg-indigo-900 text-white shadow-sm shadow-indigo-900/20'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-indigo-50'
                }`}
              >
                <span>{tab.icon}</span>
                <span>{tab.label}</span>
                {tab.badge !== undefined && (
                  <span className={`text-[10px] font-black px-1.5 py-0.5 rounded-full ${
                    isActive ? 'bg-white text-indigo-900' : (tab.badgeColor || 'bg-indigo-100 text-indigo-900')
                  }`}>
                    {tab.badge}
                  </span>
                )}
              </button>
            );
          })}
        </nav>
      </div>
    </div>
  );
};
