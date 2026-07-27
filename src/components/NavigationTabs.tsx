import React from 'react';
import { ActiveTab, UserRole } from '../types';
import { LayoutDashboard, MapPin, Globe, Users, AlertTriangle, FileSpreadsheet, Settings } from 'lucide-react';

interface NavigationTabsProps {
  activeTab: ActiveTab;
  onTabChange: (tab: ActiveTab) => void;
  userRole: UserRole;
  qualityIssueCount: number;
}

export const NavigationTabs: React.FC<NavigationTabsProps> = ({
  activeTab,
  onTabChange,
  userRole,
  qualityIssueCount
}) => {
  const tabs = [
    {
      id: 'dashboard' as ActiveTab,
      label: 'Tableau de bord',
      icon: LayoutDashboard,
      badge: null
    },
    {
      id: 'directory' as ActiveTab,
      label: 'Annuaire & Carte',
      icon: MapPin,
      badge: null
    },
    {
      id: 'zones' as ActiveTab,
      label: 'Zones géographiques',
      icon: Globe,
      badge: null
    },
    {
      id: 'users' as ActiveTab,
      label: userRole === 'admin' ? 'Utilisateurs (Admin)' : 'Utilisateurs',
      icon: Users,
      badge: null
    },
    {
      id: 'quality' as ActiveTab,
      label: 'Maintenance & Qualité',
      icon: AlertTriangle,
      badge: qualityIssueCount > 0 ? qualityIssueCount : null,
      badgeColor: 'bg-amber-500 text-white'
    },
    {
      id: 'import_export' as ActiveTab,
      label: 'Import / Export',
      icon: FileSpreadsheet,
      badge: null
    },
    {
      id: 'settings' as ActiveTab,
      label: 'Paramètres',
      icon: Settings,
      badge: null
    }
  ];

  return (
    <div className="bg-white border-b border-emerald-200 sticky top-[61px] z-20 shadow-2xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <nav className="flex items-center gap-1 overflow-x-auto py-2 no-scrollbar">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;

            return (
              <button
                key={tab.id}
                onClick={() => onTabChange(tab.id)}
                className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold transition-all shrink-0 whitespace-nowrap active:scale-95 ${
                  isActive
                    ? 'bg-gradient-to-r from-[#2be39d] via-[#48c92a] to-[#8de02d] text-emerald-950 shadow-xs'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-emerald-50/80'
                }`}
              >
                <Icon className={`w-4 h-4 ${isActive ? 'text-emerald-950' : 'text-emerald-700'}`} />
                <span>{tab.label}</span>

                {tab.badge !== null && (
                  <span
                    className={`ml-1 px-1.5 py-0.2 rounded-full text-[10px] font-extrabold ${
                      tab.badgeColor || 'bg-emerald-600 text-white'
                    }`}
                  >
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
