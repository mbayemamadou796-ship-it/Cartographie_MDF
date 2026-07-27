/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useMemo } from 'react';
import { Member, FilterState, UserRole, ActiveTab, AppSettings, CustomZone, AppUser } from './types';
import { INITIAL_MEMBERS } from './data/initialMembers';
import { Header } from './components/Header';
import { NavigationTabs } from './components/NavigationTabs';
import { DashboardSummary } from './components/DashboardSummary';
import { InteractiveMap } from './components/InteractiveMap';
import { InfoBar } from './components/InfoBar';
import { MemberList } from './components/MemberList';
import { FiltersPanel } from './components/FiltersPanel';
import { MemberModal } from './components/MemberModal';
import { AdminMemberFormModal } from './components/AdminMemberFormModal';
import { ImportExcelModal } from './components/ImportExcelModal';
import { ConfirmDeleteModal } from './components/ConfirmDeleteModal';
import { GeographicZonesView } from './components/GeographicZonesView';
import { DataQualityView } from './components/DataQualityView';
import { UserManagementView } from './components/UserManagementView';
import { ImportExportView } from './components/ImportExportView';
import { SettingsView } from './components/SettingsView';
import { EditLogoModal } from './components/EditLogoModal';
import { LoginScreen } from './components/LoginScreen';
import { exportToExcel, exportToCsv } from './utils/excelUtils';
import { CheckCircle2, MapPin, Users, ArrowRight } from 'lucide-react';

const LOCAL_STORAGE_KEY = 'mbok_de_france_members_v1';
const LOCAL_STORAGE_UPDATE_KEY = 'mbok_de_france_last_update_v1';
const LOCAL_STORAGE_SETTINGS_KEY = 'mbok_de_france_app_settings_v1';
const LOCAL_STORAGE_ZONES_KEY = 'mbok_de_france_custom_zones_v1';
const LOCAL_STORAGE_USERS_KEY = 'mbok_de_france_users_v1';
const LOCAL_STORAGE_SESSION_KEY = 'mbok_de_france_session_user_v1';

const INITIAL_USERS: AppUser[] = [
  { id: 'usr-admin', nom: 'MDF', prenom: 'Administrateur', name: 'Administrateur MDF', email: 'admin@mbokdefrance.org', username: 'admin', password: 'admin123', role: 'admin', active: true, lastLogin: 'En ligne' }
];

const DEFAULT_CUSTOM_ZONES: CustomZone[] = [
  {
    id: 'zone-bretagne',
    name: 'Bretagne',
    description: 'Réseau et membres basés en région Bretagne',
    color: 'emerald',
    memberIds: ['mdf-005', 'mdf-009'],
    createdAt: new Date().toISOString()
  },
  {
    id: 'zone-idf',
    name: 'Île-de-France',
    description: 'Membres actifs en Île-de-France et réseau Parisien',
    color: 'blue',
    memberIds: ['mdf-001', 'mdf-002', 'mdf-007'],
    createdAt: new Date().toISOString()
  },
  {
    id: 'zone-grand-ouest',
    name: 'Grand Ouest',
    description: 'Regroupement des antennes Ouest (Nantes, Rennes, Bordeaux)',
    color: 'indigo',
    memberIds: ['mdf-005', 'mdf-008', 'mdf-009'],
    createdAt: new Date().toISOString()
  },
  {
    id: 'zone-reseau-sud',
    name: 'Réseau Sud',
    description: 'Antennes Sud et Méditerranée (Marseille, Nice, Toulouse)',
    color: 'amber',
    memberIds: ['mdf-003', 'mdf-010'],
    createdAt: new Date().toISOString()
  },
  {
    id: 'zone-antilles',
    name: 'Antilles',
    description: 'Délégation Caraïbes et Outre-mer',
    color: 'rose',
    memberIds: [],
    createdAt: new Date().toISOString()
  },
  {
    id: 'zone-groupe-a',
    name: 'Groupe A',
    description: 'Groupe de travail A - Action Sociale & Fraternité',
    color: 'purple',
    memberIds: ['mdf-001', 'mdf-003', 'mdf-006'],
    createdAt: new Date().toISOString()
  },
  {
    id: 'zone-projet-2026',
    name: 'Projet 2026',
    description: 'Comité de pilotage de la nouvelle initiative 2026',
    color: 'teal',
    memberIds: ['mdf-002', 'mdf-004', 'mdf-007'],
    createdAt: new Date().toISOString()
  }
];

export default function App() {
  // Navigation Tab State
  const [activeTab, setActiveTab] = useState<ActiveTab>('directory');

  // App Settings State
  const [appSettings, setAppSettings] = useState<AppSettings>(() => {
    try {
      const saved = localStorage.getItem(LOCAL_STORAGE_SETTINGS_KEY);
      if (saved) return JSON.parse(saved);
    } catch {}
    return {
      appName: 'Cartographie MDF',
      associationName: 'Mbok de France',
      tagline: 'au service de la fraternité !',
      defaultCountry: 'France',
      mapDefaultZoom: 6
    };
  });

  const handleUpdateSettings = (newSettings: Partial<AppSettings>) => {
    setAppSettings((prev) => {
      const updated = { ...prev, ...newSettings };
      try {
        localStorage.setItem(LOCAL_STORAGE_SETTINGS_KEY, JSON.stringify(updated));
      } catch {}
      return updated;
    });
  };

  // Members State with LocalStorage Persistence
  const [members, setMembers] = useState<Member[]>(() => {
    try {
      const saved = localStorage.getItem(LOCAL_STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          return parsed;
        }
      }
    } catch {
      // Fallback
    }
    return INITIAL_MEMBERS;
  });

  // Last update timestamp
  const [lastUpdateDate, setLastUpdateDate] = useState<string>(() => {
    try {
      const saved = localStorage.getItem(LOCAL_STORAGE_UPDATE_KEY);
      if (saved) return saved;
    } catch {}
    return new Date().toLocaleDateString('fr-FR', {
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    });
  });

  const recordDataUpdate = () => {
    const formatted = new Date().toLocaleDateString('fr-FR', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
    setLastUpdateDate(formatted);
    try {
      localStorage.setItem(LOCAL_STORAGE_UPDATE_KEY, formatted);
    } catch {}
  };

  // Save members to localStorage
  useEffect(() => {
    try {
      localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(members));
    } catch {
      // Ignore quota errors
    }
  }, [members]);

  // Custom Zones State with LocalStorage Persistence
  const [customZones, setCustomZones] = useState<CustomZone[]>(() => {
    try {
      const saved = localStorage.getItem(LOCAL_STORAGE_ZONES_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          return parsed;
        }
      }
    } catch {}
    return DEFAULT_CUSTOM_ZONES;
  });

  useEffect(() => {
    try {
      localStorage.setItem(LOCAL_STORAGE_ZONES_KEY, JSON.stringify(customZones));
    } catch {}
  }, [customZones]);

  // Current Logged In User State with Session Persistence
  const [currentUser, setCurrentUser] = useState<AppUser | null>(() => {
    try {
      const saved = localStorage.getItem(LOCAL_STORAGE_SESSION_KEY);
      if (saved) return JSON.parse(saved);
    } catch {}
    return null;
  });

  // Role State (Derived from currentUser or defaulted to 'user')
  const [userRole, setUserRole] = useState<UserRole>(() => currentUser?.role || 'user');

  // Keep role in sync with currentUser
  useEffect(() => {
    if (currentUser) {
      setUserRole(currentUser.role);
    }
  }, [currentUser]);

  // Users Management State with LocalStorage Persistence
  const [users, setUsers] = useState<AppUser[]>(() => {
    try {
      const saved = localStorage.getItem(LOCAL_STORAGE_USERS_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch {}
    return INITIAL_USERS;
  });

  useEffect(() => {
    try {
      localStorage.setItem(LOCAL_STORAGE_USERS_KEY, JSON.stringify(users));
    } catch {}
  }, [users]);

  // Authentication Handlers
  const handleLogin = (inputUsername: string, inputPassword: string): boolean => {
    const normInput = inputUsername.trim().toLowerCase();

    // 1. Search in users list
    let matchedUser = users.find((u) => {
      const normName = u.username ? u.username.toLowerCase() : '';
      const normEmail = u.email ? u.email.toLowerCase() : '';
      const normId = u.id ? u.id.toLowerCase() : '';
      return normName === normInput || normEmail === normInput || normId === normInput;
    });

    // 2. Fallback check for default MVP accounts if not found by user list
    if (!matchedUser) {
      if (normInput === 'admin' && inputPassword === 'admin123') {
        matchedUser = {
          id: 'usr-admin',
          name: 'Administrateur MDF',
          email: 'admin@mbokdefrance.org',
          username: 'admin',
          password: 'admin123',
          role: 'admin',
          active: true,
          lastLogin: 'En ligne'
        };
      } else if (normInput === 'utilisateur' && inputPassword === 'utilisateur123') {
        matchedUser = {
          id: 'usr-user',
          name: 'Membre Utilisateur',
          email: 'utilisateur@mbokdefrance.org',
          username: 'utilisateur',
          password: 'utilisateur123',
          role: 'user',
          active: true,
          lastLogin: 'En ligne'
        };
      }
    }

    if (!matchedUser) return false;

    // Check if account active
    if (!matchedUser.active) {
      showToast('Ce compte d\'accès est désactivé. Veuillez contacter l\'administrateur.');
      return false;
    }

    // Check password
    const expectedPassword = matchedUser.password || (matchedUser.role === 'admin' ? 'admin123' : 'utilisateur123');
    if (inputPassword !== expectedPassword) {
      return false;
    }

    // Success login
    const timeStr = 'Aujourd\'hui ' + new Date().toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' });
    const loggedUser = { ...matchedUser, lastLogin: timeStr };

    setCurrentUser(loggedUser);
    setUserRole(loggedUser.role);

    try {
      localStorage.setItem(LOCAL_STORAGE_SESSION_KEY, JSON.stringify(loggedUser));
    } catch {}

    setUsers((prev) =>
      prev.map((u) => (u.id === loggedUser.id ? { ...u, lastLogin: timeStr } : u))
    );

    showToast(`Bienvenue ${loggedUser.name} ! Connexion réussie.`);
    return true;
  };

  const handleLogout = () => {
    setCurrentUser(null);
    setUserRole('user');
    try {
      localStorage.removeItem(LOCAL_STORAGE_SESSION_KEY);
    } catch {}
    showToast('Vous avez été déconnecté.');
  };

  const handleAddUser = (user: Omit<AppUser, 'id' | 'lastLogin'>) => {
    const newUser: AppUser = {
      ...user,
      id: `usr-${Date.now()}`,
      lastLogin: 'Nouveau'
    };
    setUsers((prev) => [newUser, ...prev]);
    showToast(`Utilisateur "${user.name}" créé avec succès.`);
  };

  const handleUpdateUser = (userId: string, updates: Partial<AppUser>) => {
    setUsers((prev) =>
      prev.map((u) => (u.id === userId ? { ...u, ...updates } : u))
    );
    showToast('Compte utilisateur mis à jour.');
  };

  const handleDeleteUser = (userId: string) => {
    setUsers((prev) => prev.filter((u) => u.id !== userId));
    showToast('Utilisateur supprimé.');
  };

  // Filter & Search State
  const [filters, setFilters] = useState<FilterState>({
    searchQuery: '',
    ville: '',
    departement: '',
    region: '',
    organisation: '',
    fonction: '',
    qualityFilter: 'all',
    sortBy: 'nom_asc'
  });

  // UI Panel & Modal States
  const [isFiltersOpen, setIsFiltersOpen] = useState(false);
  const [selectedMemberId, setSelectedMemberId] = useState<string | null>(null);
  const [activeDetailsMember, setActiveDetailsMember] = useState<Member | null>(null);
  
  // Admin Modals
  const [isFormModalOpen, setIsFormModalOpen] = useState(false);
  const [memberToEdit, setMemberToEdit] = useState<Member | null>(null);
  const [isImportModalOpen, setIsImportModalOpen] = useState(false);
  const [memberToDelete, setMemberToDelete] = useState<Member | null>(null);
  const [isEditLogoModalOpen, setIsEditLogoModalOpen] = useState(false);

  // Target Zone State for adding a member within a zone context
  const [targetZoneForNewMember, setTargetZoneForNewMember] = useState<string | undefined>(undefined);
  const [targetZoneNameForNewMember, setTargetZoneNameForNewMember] = useState<string | undefined>(undefined);
  const [defaultGeoForNewMember, setDefaultGeoForNewMember] = useState<{ region?: string; departement?: string; ville?: string } | undefined>(undefined);

  const handleOpenAddMemberInZone = (
    zoneId?: string,
    zoneName?: string,
    defaultGeo?: { region?: string; departement?: string; ville?: string }
  ) => {
    setTargetZoneForNewMember(zoneId);
    setTargetZoneNameForNewMember(zoneName);
    setDefaultGeoForNewMember(defaultGeo);
    setMemberToEdit(null);
    setIsFormModalOpen(true);
  };

  // Toast Feedback State
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage(null);
    }, 4000);
  };

  // Map for duplicates computation
  const duplicateIdsSet = useMemo(() => {
    const emailCounts = new Map<string, number>();
    const nameCounts = new Map<string, number>();

    members.forEach((m) => {
      const email = m.email?.trim().toLowerCase();
      if (email) emailCounts.set(email, (emailCounts.get(email) || 0) + 1);

      const name = `${m.nom?.trim().toLowerCase()} ${m.prenom?.trim().toLowerCase()}`;
      if (name) nameCounts.set(name, (nameCounts.get(name) || 0) + 1);
    });

    const dupSet = new Set<string>();
    members.forEach((m) => {
      const email = m.email?.trim().toLowerCase();
      const name = `${m.nom?.trim().toLowerCase()} ${m.prenom?.trim().toLowerCase()}`;
      if ((email && (emailCounts.get(email) || 0) > 1) || (name && (nameCounts.get(name) || 0) > 1)) {
        dupSet.add(m.id);
      }
    });
    return dupSet;
  }, [members]);

  // Quality Issues count calculation for navigation badge
  const qualityIssueCount = useMemo(() => {
    const noPhone = members.filter((m) => !m.telephone || !m.telephone.trim()).length;
    const noEmail = members.filter((m) => !m.email || !m.email.trim()).length;
    const noLocation = members.filter(
      (m) => !m.latitude || !m.longitude || (m.latitude === 0 && m.longitude === 0)
    ).length;
    return noPhone + noEmail + noLocation + duplicateIdsSet.size;
  }, [members, duplicateIdsSet]);

  // Filter & Search Logic (Multi-field match)
  const filteredAndSortedMembers = useMemo(() => {
    const q = filters.searchQuery.trim().toLowerCase();

    const filtered = members.filter((m) => {
      // Instant Multi-field Search
      if (q) {
        const fullText = [
          m.nom,
          m.prenom,
          m.fonction,
          m.organisation,
          m.ville,
          m.departement,
          m.region,
          m.codePostal,
          m.adresse,
          m.email,
          m.telephone
        ]
          .filter(Boolean)
          .join(' ')
          .toLowerCase();

        if (!fullText.includes(q)) return false;
      }

      // Dropdown Filters
      if (filters.ville && m.ville.toLowerCase() !== filters.ville.toLowerCase()) {
        return false;
      }
      if (filters.departement && m.departement.toLowerCase() !== filters.departement.toLowerCase()) {
        return false;
      }
      if (filters.region && m.region.toLowerCase() !== filters.region.toLowerCase()) {
        return false;
      }
      if (filters.organisation && m.organisation.toLowerCase() !== filters.organisation.toLowerCase()) {
        return false;
      }
      if (filters.fonction && m.fonction.toLowerCase() !== filters.fonction.toLowerCase()) {
        return false;
      }

      // Custom Zone Filter
      if (filters.zoneId) {
        const zone = customZones.find((z) => z.id === filters.zoneId);
        if (zone && !zone.memberIds.includes(m.id)) {
          return false;
        }
      }

      // Quality Filter
      if (filters.qualityFilter === 'no_phone') {
        if (m.telephone && m.telephone.trim()) return false;
      } else if (filters.qualityFilter === 'no_email') {
        if (m.email && m.email.trim()) return false;
      } else if (filters.qualityFilter === 'no_location') {
        if (m.latitude && m.longitude && m.latitude !== 0 && m.longitude !== 0) return false;
      } else if (filters.qualityFilter === 'duplicates') {
        if (!duplicateIdsSet.has(m.id)) return false;
      }

      return true;
    });

    // Sorting Logic
    return filtered.sort((a, b) => {
      if (filters.sortBy === 'nom_asc') {
        return a.nom.localeCompare(b.nom, 'fr');
      }
      if (filters.sortBy === 'nom_desc') {
        return b.nom.localeCompare(a.nom, 'fr');
      }
      if (filters.sortBy === 'ville_asc') {
        return a.ville.localeCompare(b.ville, 'fr');
      }
      if (filters.sortBy === 'organisation_asc') {
        return a.organisation.localeCompare(b.organisation, 'fr');
      }
      return 0;
    });
  }, [members, filters, customZones, duplicateIdsSet]);

  // Active filter count calculation
  const activeFilterCount = [
    filters.ville,
    filters.departement,
    filters.region,
    filters.organisation,
    filters.fonction,
    filters.zoneId,
    filters.qualityFilter !== 'all' ? filters.qualityFilter : ''
  ].filter(Boolean).length;

  // Handlers
  const handleFilterChange = (newFilters: Partial<FilterState>) => {
    setFilters((prev) => ({ ...prev, ...newFilters }));
  };

  const handleResetFilters = () => {
    setFilters({
      searchQuery: '',
      ville: '',
      departement: '',
      region: '',
      organisation: '',
      fonction: '',
      zoneId: undefined,
      qualityFilter: 'all',
      sortBy: 'nom_asc'
    });
  };

  // Custom Zone Actions
  const handleAddZone = (newZone: Omit<CustomZone, 'id' | 'createdAt'>) => {
    const created: CustomZone = {
      ...newZone,
      id: `zone-${Date.now()}`,
      createdAt: new Date().toISOString()
    };
    setCustomZones((prev) => [created, ...prev]);
    showToast(`Zone "${created.name}" créée avec succès.`);
  };

  const handleUpdateZone = (zoneId: string, updates: Partial<CustomZone>) => {
    setCustomZones((prev) =>
      prev.map((z) => (z.id === zoneId ? { ...z, ...updates } : z))
    );
    showToast('Zone mise à jour.');
  };

  const handleDeleteZone = (zoneId: string) => {
    const target = customZones.find((z) => z.id === zoneId);
    setCustomZones((prev) => prev.filter((z) => z.id !== zoneId));
    if (filters.zoneId === zoneId) {
      handleFilterChange({ zoneId: undefined });
    }
    showToast(`Zone "${target?.name || ''}" supprimée.`);
  };

  const handleToggleMemberInZone = (zoneId: string, memberId: string) => {
    setCustomZones((prev) =>
      prev.map((z) => {
        if (z.id !== zoneId) return z;
        const exists = z.memberIds.includes(memberId);
        const updatedIds = exists
          ? z.memberIds.filter((id) => id !== memberId)
          : [...z.memberIds, memberId];
        return { ...z, memberIds: updatedIds };
      })
    );
  };

  const handleSelectCustomZone = (zoneId: string) => {
    const zone = customZones.find((z) => z.id === zoneId);
    handleResetFilters();
    handleFilterChange({ zoneId });
    setActiveTab('directory');
    if (zone) {
      showToast(`Filtre activé : Zone ${zone.name} (${zone.memberIds.length} membres)`);
    }
  };

  const handleToggleRole = () => {
    const nextRole = userRole === 'user' ? 'admin' : 'user';
    setUserRole(nextRole);
    showToast(
      nextRole === 'admin'
        ? 'Mode Administrateur activé : Vous pouvez gérer et importer les membres.'
        : 'Mode Consultation activé.'
    );
  };

  // Add / Edit Member Handler
  const handleSaveMember = (memberData: Omit<Member, 'id'> & { id?: string }) => {
    if (userRole !== 'admin') {
      showToast("Action réservée aux administrateurs.");
      return;
    }
    if (memberData.id) {
      // Edit
      setMembers((prev) =>
        prev.map((m) => (m.id === memberData.id ? ({ ...memberData, id: memberData.id } as Member) : m))
      );
      showToast(`Membre "${memberData.prenom} ${memberData.nom}" mis à jour.`);
    } else {
      // Create
      const newMember: Member = {
        ...memberData,
        id: `mdf-new-${Date.now()}`
      };
      setMembers((prev) => [newMember, ...prev]);

      // If created from a specific custom zone context, automatically link member to that zone
      if (targetZoneForNewMember) {
        setCustomZones((prev) =>
          prev.map((z) => {
            if (z.id === targetZoneForNewMember) {
              const updatedIds = z.memberIds.includes(newMember.id)
                ? z.memberIds
                : [...z.memberIds, newMember.id];
              return { ...z, memberIds: updatedIds };
            }
            return z;
          })
        );
      }

      showToast(`Membre "${newMember.prenom} ${newMember.nom}" ajouté avec succès.`);
    }

    // Reset target zone states
    setTargetZoneForNewMember(undefined);
    setTargetZoneNameForNewMember(undefined);
    setDefaultGeoForNewMember(undefined);
    recordDataUpdate();
  };

  // Delete Member Handler
  const handleDeleteMember = (memberId: string) => {
    if (userRole !== 'admin') {
      showToast("Action réservée aux administrateurs.");
      return;
    }
    const target = members.find((m) => m.id === memberId);
    setMembers((prev) => prev.filter((m) => m.id !== memberId));
    if (selectedMemberId === memberId) setSelectedMemberId(null);
    if (activeDetailsMember?.id === memberId) setActiveDetailsMember(null);
    showToast(`Membre ${target ? `"${target.prenom} ${target.nom}"` : ''} supprimé.`);
    recordDataUpdate();
  };

  // Excel / CSV Import Success
  const handleImportSuccess = (imported: Member[], replaceExisting: boolean) => {
    if (replaceExisting) {
      setMembers(imported);
      showToast(`Annuaire réinitialisé avec ${imported.length} membres importés.`);
    } else {
      setMembers((prev) => [...imported, ...prev]);
      showToast(`${imported.length} nouveaux membres ajoutés à l'annuaire.`);
    }
    recordDataUpdate();
  };

  // Export handlers
  const handleExportExcel = () => {
    exportToExcel(filteredAndSortedMembers, `Mbok_de_France_Membres_${new Date().toISOString().slice(0, 10)}.xlsx`);
    showToast(`Exportation Excel de ${filteredAndSortedMembers.length} membres en cours...`);
  };

  const handleExportCsv = () => {
    exportToCsv(filteredAndSortedMembers, `Mbok_de_France_Membres_${new Date().toISOString().slice(0, 10)}.csv`);
    showToast(`Exportation CSV de ${filteredAndSortedMembers.length} membres en cours...`);
  };

  // Geographic zone click handler
  const handleSelectZone = (zoneType: 'region' | 'departement' | 'ville', zoneName: string) => {
    handleResetFilters();
    if (zoneType === 'region') {
      handleFilterChange({ region: zoneName });
    } else if (zoneType === 'departement') {
      handleFilterChange({ departement: zoneName });
    } else if (zoneType === 'ville') {
      handleFilterChange({ ville: zoneName });
    }
    setActiveTab('directory');
    showToast(`Filtre appliqué : ${zoneName}`);
  };

  if (!currentUser) {
    return (
      <LoginScreen
        onLogin={handleLogin}
        logoUrl={appSettings.logoUrl}
        associationName={appSettings.associationName}
        tagline={appSettings.tagline}
      />
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-[#f0f8f3] text-slate-800 font-['Plus_Jakarta_Sans',sans-serif]">
      
      {/* Top Header */}
      <Header
        searchQuery={filters.searchQuery}
        onSearchChange={(q) => handleFilterChange({ searchQuery: q })}
        userRole={userRole}
        onToggleRole={handleToggleRole}
        activeFilterCount={activeFilterCount}
        onToggleFiltersPanel={() => setIsFiltersOpen(!isFiltersOpen)}
        isFiltersOpen={isFiltersOpen}
        onOpenAddMember={() => {
          setMemberToEdit(null);
          setIsFormModalOpen(true);
        }}
        onOpenImportModal={() => setIsImportModalOpen(true)}
        onExportExcel={handleExportExcel}
        onExportCsv={handleExportCsv}
        logoUrl={appSettings.logoUrl}
        associationName={appSettings.associationName}
        tagline={appSettings.tagline}
        onEditLogoClick={() => setIsEditLogoModalOpen(true)}
        currentUser={currentUser}
        onLogout={handleLogout}
      />

      {/* Navigation Tabs Bar */}
      <NavigationTabs
        activeTab={activeTab}
        onTabChange={(tab) => {
          setActiveTab(tab);
          if (tab === 'directory') {
            setIsFiltersOpen(false);
          }
        }}
        userRole={userRole}
        qualityIssueCount={qualityIssueCount}
      />

      {/* Collapsible Filters Panel (When opened in directory tab) */}
      {isFiltersOpen && activeTab === 'directory' && (
        <FiltersPanel
          members={members}
          customZones={customZones}
          filters={filters}
          onFilterChange={handleFilterChange}
          onResetFilters={handleResetFilters}
          onClose={() => setIsFiltersOpen(false)}
        />
      )}

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-5 space-y-6">
        
        {/* Tab 1: Dashboard */}
        {activeTab === 'dashboard' && (
          <div className="space-y-6 animate-in fade-in duration-200">
            <DashboardSummary
              members={members}
              customZones={customZones}
              lastUpdateDate={lastUpdateDate}
              activeQualityFilter={filters.qualityFilter}
              onSelectQualityFilter={(qf) => {
                handleFilterChange({ qualityFilter: qf });
                setActiveTab('directory');
              }}
              onNavigateToTab={(tab) => setActiveTab(tab)}
            />

            {/* Quick Map Preview */}
            <div className="bg-white rounded-3xl p-6 border border-emerald-200 shadow-sm space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="font-bold text-slate-900 text-sm font-['Outfit'] flex items-center gap-2">
                  <MapPin className="w-4 h-4 text-emerald-600" />
                  <span>Aperçu Rapide de la Carte Géographique</span>
                </h3>
                <button
                  onClick={() => setActiveTab('directory')}
                  className="inline-flex items-center gap-1 text-xs font-bold text-emerald-800 hover:underline"
                >
                  <span>Ouvrir l'annuaire complet</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>

              <InteractiveMap
                members={members}
                selectedMemberId={selectedMemberId}
                onSelectMember={(member) => {
                  setSelectedMemberId(member.id);
                  setActiveTab('directory');
                }}
                onOpenDetailsModal={(member) => setActiveDetailsMember(member)}
              />
            </div>
          </div>
        )}

        {/* Tab 2: Directory & Map (Core view) */}
        {activeTab === 'directory' && (
          <div className="space-y-5 animate-in fade-in duration-200">
            {/* Interactive Leaflet Map */}
            <section className="w-full">
              <InteractiveMap
                members={filteredAndSortedMembers}
                selectedMemberId={selectedMemberId}
                onSelectMember={(member) => setSelectedMemberId(member.id)}
                onOpenDetailsModal={(member) => setActiveDetailsMember(member)}
              />
            </section>

            {/* Info Bar (Counters, Filter Chips, Sort Dropdown) */}
            <InfoBar
              totalCount={members.length}
              filteredCount={filteredAndSortedMembers.length}
              filters={filters}
              customZones={customZones}
              onFilterChange={handleFilterChange}
              onResetFilters={handleResetFilters}
            />

            {/* Member Directory List Grid */}
            <section className="py-2">
              <div className="flex items-center justify-between mb-3">
                <h2 className="text-sm font-bold text-emerald-950 tracking-tight font-['Outfit'] uppercase">
                  Annuaire Synchronisé des Membres ({filteredAndSortedMembers.length})
                </h2>
                <span className="text-xs text-slate-500 font-medium hidden sm:inline">
                  Cliquer sur un membre pour le situer sur la carte
                </span>
              </div>

              <MemberList
                members={filteredAndSortedMembers}
                selectedMemberId={selectedMemberId}
                userRole={userRole}
                onSelectMember={(member) => {
                  setSelectedMemberId(member.id);
                  window.scrollTo({ top: 0, behavior: 'smooth' });
                }}
                onViewDetails={(member) => setActiveDetailsMember(member)}
                onEditMember={(member) => {
                  setMemberToEdit(member);
                  setIsFormModalOpen(true);
                }}
                onDeleteMember={(member) => setMemberToDelete(member)}
                onResetFilters={handleResetFilters}
                onOpenAddMember={() => {
                  setMemberToEdit(null);
                  setIsFormModalOpen(true);
                }}
              />
            </section>
          </div>
        )}

        {/* Tab 3: Zones Géographiques */}
        {activeTab === 'zones' && (
          <GeographicZonesView
            members={members}
            customZones={customZones}
            userRole={userRole}
            onSelectZone={(type, name) => {
              handleResetFilters();
              handleFilterChange({ [type]: name });
              setActiveTab('directory');
            }}
            onSelectCustomZone={handleSelectCustomZone}
            onAddZone={handleAddZone}
            onUpdateZone={handleUpdateZone}
            onDeleteZone={handleDeleteZone}
            onToggleMemberInZone={handleToggleMemberInZone}
            onOpenAddMemberInZone={handleOpenAddMemberInZone}
            onSelectMemberDetails={(m) => setActiveDetailsMember(m)}
          />
        )}

        {/* Tab 4: Gestion des Utilisateurs */}
        {activeTab === 'users' && (
          <UserManagementView
            currentRole={userRole}
            users={users}
            onAddUser={handleAddUser}
            onUpdateUser={handleUpdateUser}
            onDeleteUser={handleDeleteUser}
            onSwitchRole={(role) => setUserRole(role)}
          />
        )}

        {/* Tab 5: Qualité & Maintenance des données */}
        {activeTab === 'quality' && (
          <DataQualityView
            members={members}
            customZones={customZones}
            userRole={userRole}
            onEditMember={(m) => {
              setMemberToEdit(m);
              setIsFormModalOpen(true);
            }}
            onFilterDirectoryQuality={(qf) => {
              handleFilterChange({ qualityFilter: qf });
              setActiveTab('directory');
            }}
          />
        )}

        {/* Tab 5: Import / Export */}
        {activeTab === 'import_export' && (
          <ImportExportView
            members={filteredAndSortedMembers}
            userRole={userRole}
            onImportSuccess={handleImportSuccess}
          />
        )}

        {/* Tab 6: Settings */}
        {activeTab === 'settings' && (
          <SettingsView
            settings={appSettings}
            userRole={userRole}
            onUpdateSettings={handleUpdateSettings}
            onOpenEditLogoModal={() => setIsEditLogoModalOpen(true)}
            onResetToInitialMembers={() => {
              setMembers(INITIAL_MEMBERS);
              recordDataUpdate();
              showToast("Annuaire réinitialisé avec les membres de départ.");
            }}
          />
        )}

      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-emerald-200 mt-10 py-5 text-center text-xs text-slate-600 shadow-xs">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-2">
          <p>© {new Date().getFullYear()} {appSettings.associationName} — {appSettings.appName}</p>
          <p className="text-[11px] text-emerald-800 font-medium">"{appSettings.tagline}"</p>
        </div>
      </footer>

      {/* Member Details Modal */}
      <MemberModal
        member={activeDetailsMember}
        customZones={customZones}
        userRole={userRole}
        onClose={() => setActiveDetailsMember(null)}
        onSelectOnMap={(m) => {
          setSelectedMemberId(m.id);
          setActiveTab('directory');
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }}
        onEdit={(m) => {
          setMemberToEdit(m);
          setIsFormModalOpen(true);
        }}
        onDelete={(m) => setMemberToDelete(m)}
      />

      {/* Admin Member Form Modal (Add / Edit) */}
      <AdminMemberFormModal
        isOpen={isFormModalOpen}
        userRole={userRole}
        memberToEdit={memberToEdit}
        targetZoneName={targetZoneNameForNewMember}
        defaultGeo={defaultGeoForNewMember}
        onClose={() => {
          setIsFormModalOpen(false);
          setMemberToEdit(null);
          setTargetZoneForNewMember(undefined);
          setTargetZoneNameForNewMember(undefined);
          setDefaultGeoForNewMember(undefined);
        }}
        onSave={handleSaveMember}
      />

      {/* Admin Excel / CSV Import Modal */}
      <ImportExcelModal
        isOpen={isImportModalOpen}
        onClose={() => setIsImportModalOpen(false)}
        onImportSuccess={handleImportSuccess}
      />

      {/* Confirm Delete Modal */}
      <ConfirmDeleteModal
        isOpen={Boolean(memberToDelete)}
        member={memberToDelete}
        onClose={() => setMemberToDelete(null)}
        onConfirm={handleDeleteMember}
      />

      {/* Edit Logo / Profile Photo Modal */}
      <EditLogoModal
        isOpen={isEditLogoModalOpen}
        currentLogoUrl={appSettings.logoUrl}
        onClose={() => setIsEditLogoModalOpen(false)}
        onSaveLogo={(newLogoUrl) => {
          handleUpdateSettings({ logoUrl: newLogoUrl });
          showToast(newLogoUrl ? "Photo de profil / logo mise à jour !" : "Logo officiel rétabli.");
        }}
      />

      {/* Notification Toast */}
      {toastMessage && (
        <div className="fixed bottom-5 right-5 z-50 bg-white text-emerald-950 backdrop-blur px-4 py-3 rounded-2xl shadow-xl border border-emerald-300 flex items-center gap-2.5 text-xs font-semibold animate-in slide-in-from-bottom-3 duration-200">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>{toastMessage}</span>
        </div>
      )}

    </div>
  );
}
