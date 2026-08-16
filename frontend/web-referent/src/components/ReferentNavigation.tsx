import React from 'react';

export type ReferentTab = 'dashboard' | 'zone' | 'members' | 'new_report' | 'my_reports' | 'profile';

interface ReferentNavigationProps {
  activeTab: ReferentTab;
  onTabChange: (tab: ReferentTab) => void;
  pendingCount?: number;
}

export const ReferentNavigation: React.FC<ReferentNavigationProps> = ({
  activeTab,
  onTabChange,
  pendingCount = 0
}) => {
  interface TabItem {
    id: ReferentTab;
    label: string;
    icon: string;
    badge?: number | string;
  }

  const tabs: TabItem[] = [
    { id: 'dashboard', label: 'Tableau de bord', icon: '📊' },
    { id: 'zone', label: 'Ma zone', icon: '📍' },
    { id: 'members', label: 'Mes membres', icon: '👥' },
    { id: 'new_report', label: 'Nouveau reporting / Cas', icon: '✍️' },
    { id: 'my_reports', label: 'Mes remontées', icon: '📋', badge: pendingCount > 0 ? pendingCount : undefined },
    { id: 'profile', label: 'Mon Profil Référent', icon: '👤' },
  ];

  return (
    <div className="bg-white border-b border-emerald-100 shadow-2xs sticky top-0 z-30">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <nav className="flex space-x-1 sm:space-x-2 overflow-x-auto py-2.5 scrollbar-none" aria-label="Navigation Référent">
          {tabs.map((tab) => {
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => onTabChange(tab.id)}
                className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all whitespace-nowrap ${
                  isActive
                    ? 'bg-emerald-700 text-white shadow-sm shadow-emerald-700/20'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-emerald-50'
                }`}
              >
                <span>{tab.icon}</span>
                <span>{tab.label}</span>
                {tab.badge !== undefined && (
                  <span className={`text-[10px] font-black px-1.5 py-0.5 rounded-full ${
                    isActive ? 'bg-white text-emerald-800' : 'bg-emerald-100 text-emerald-800'
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
