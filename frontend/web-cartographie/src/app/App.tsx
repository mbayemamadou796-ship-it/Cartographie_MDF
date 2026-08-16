/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useMemo } from 'react';
import { Member, FilterState, UserRole, ActiveTab, AppSettings, CustomZone, AppUser, ImportLog, LocationChangeAlert, AuditLog, AuditLogCategory } from '../types';
import { INITIAL_MEMBERS } from '../data/initialMembers';
import { Header } from '../components/Header';
import { NavigationTabs } from '../components/NavigationTabs';
import { DashboardSummary } from '../components/DashboardSummary';
import { InteractiveMap } from '../components/InteractiveMap';
import { InfoBar } from '../components/InfoBar';
import { MemberList } from '../components/MemberList';
import { FiltersPanel } from '../components/FiltersPanel';
import { MemberModal } from '../components/MemberModal';
import { AdminMemberFormModal } from '../components/AdminMemberFormModal';
import { ImportExcelModal } from '../components/ImportExcelModal';
import { LocationChangeModal } from '../components/LocationChangeModal';
import { ConfirmDeleteModal } from '../components/ConfirmDeleteModal';
import { GeographicZonesView } from '../components/GeographicZonesView';
import { DataQualityView } from '../components/DataQualityView';
import { UserManagementView } from '../components/UserManagementView';
import { ImportExportView } from '../components/ImportExportView';
import { AuditLogsView } from '../components/AuditLogsView';
import { SettingsView } from '../components/SettingsView';
import { EditLogoModal } from '../components/EditLogoModal';
import { LoginScreen } from '../components/LoginScreen';
import { DemandesView } from '../modules/demandes/DemandesView';
import { DemandeService } from '../services/demandeService';
import { DemandeMember, WeeklyReport, ReportingStatus } from '../types';
import { exportToExcel, exportToCsv } from '../utils/excelUtils';
import { ApiService } from '../services/apiService';
import { FRENCH_ZONES } from '../modules/membres/AdminMemberFormModal';
import { geocodeVille, calculateCityOffsetCoordinates } from '../services/geocodingService';
import { ReportingsView } from '../modules/reportings/ReportingsView';
import { ReportingService } from '../services/reportingService';
import { CheckCircle2, MapPin, Users, ArrowRight, Layers, FileText, ExternalLink, ClipboardList } from 'lucide-react';

// URL de l'application Formulaire publique. Les deux applications sont servies
// séparément : Bureau/Cartographie sur le port 3000, Formulaire sur le 3002.
const FORMULAIRE_URL: string =
  ((import.meta as unknown as { env?: Record<string, string | undefined> }).env?.VITE_FORMULAIRE_URL) ??
  `${window.location.protocol}//${window.location.hostname}:3002`;

const LOCAL_STORAGE_KEY = 'mbok_de_france_members_v1';
const LOCAL_STORAGE_UPDATE_KEY = 'mbok_de_france_last_update_v1';
const LOCAL_STORAGE_SETTINGS_KEY = 'mbok_de_france_app_settings_v1';
const LOCAL_STORAGE_ZONES_KEY = 'mbok_de_france_custom_zones_v1';
const LOCAL_STORAGE_USERS_KEY = 'mbok_de_france_users_v1';
const LOCAL_STORAGE_SESSION_KEY = 'mbok_de_france_session_user_v1';
const LOCAL_STORAGE_LOGS_KEY = 'mbok_de_france_import_logs_v1';
const LOCAL_STORAGE_AUDIT_LOGS_KEY = 'mbok_de_france_audit_logs_v1';

const INITIAL_AUDIT_LOGS: AuditLog[] = [
  {
    id: 'log-001',
    timestamp: new Date(Date.now() - 7200000).toLocaleDateString('fr-FR', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' }),
    category: 'system',
    action: 'Initialisation du système',
    details: 'Cartographie Mbok de France opérationnelle avec annuaire et gestion par zones',
    userId: 'usr-admin',
    userName: 'Administrateur MDF',
    userRole: 'admin',
    severity: 'info'
  },
  {
    id: 'log-002',
    timestamp: new Date(Date.now() - 3600000).toLocaleDateString('fr-FR', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' }),
    category: 'auth',
    action: 'Connexion administrateur',
    details: 'Ouverture de session administrateur sur la plateforme',
    userId: 'usr-admin',
    userName: 'Administrateur MDF',
    userRole: 'admin',
    severity: 'info'
  }
];

const INITIAL_USERS: AppUser[] = [
  { id: 'usr-admin', nom: 'MDF', prenom: 'Administrateur', name: 'Administrateur MDF', email: 'admin@mbokdefrance.org', username: 'admin', password: 'admin123', role: 'admin', active: true, lastLogin: 'En ligne' },
  { id: 'usr-modou', nom: 'Mbaye', prenom: 'Modou', name: 'Modou Mbaye', email: 'modou.mbaye@mbokdefrance.org', username: 'modou', password: 'modou123', role: 'referent', region: 'Bretagne', assignedZoneIds: ['zone-bretagne'], active: true, lastLogin: 'En ligne' },
  { id: 'usr-referent-idf', nom: 'Diallo', prenom: 'Aïssatou', name: 'Aïssatou Diallo', email: 'referent.idf@mbokdefrance.org', username: 'referent', password: 'referent123', role: 'referent', region: 'Île-de-France', assignedZoneIds: ['zone-idf'], active: true, lastLogin: 'Hier' },
  { id: 'usr-user', nom: 'Sow', prenom: 'Mamadou', name: 'Mamadou Sow', email: 'membre@mbokdefrance.org', username: 'membre', password: 'user123', role: 'user', active: true, lastLogin: 'Il y a 2h' }
];

const DEFAULT_CUSTOM_ZONES: CustomZone[] = [
  {
    id: 'zone-auvergne-rhone-alpes',
    name: 'Auvergne-Rhône-Alpes',
    description: 'Antennes Auvergne-Rhône-Alpes (Lyon, Grenoble, Saint-Étienne...)',
    color: 'purple',
    memberIds: ['mdf-004'],
    createdAt: new Date().toISOString()
  },
  {
    id: 'zone-bourgogne-franche-comte',
    name: 'Bourgogne-Franche-Comté',
    description: 'Antennes Bourgogne-Franche-Comté (Dijon, Besançon, Belfort...)',
    color: 'amber',
    memberIds: [],
    createdAt: new Date().toISOString()
  },
  {
    id: 'zone-bretagne',
    name: 'Bretagne',
    description: 'Réseau et membres basés en région Bretagne (Rennes, Brest, Quimper...)',
    color: 'emerald',
    memberIds: ['mdf-010', 'mdf-modou'],
    referentUserId: 'usr-modou',
    referentName: 'Modou Mbaye',
    createdAt: new Date().toISOString()
  },
  {
    id: 'zone-centre-val-de-loire',
    name: 'Centre-Val de Loire',
    description: 'Réseau Centre-Val de Loire (Orléans, Tours, Bourges...)',
    color: 'teal',
    memberIds: [],
    createdAt: new Date().toISOString()
  },
  {
    id: 'zone-corse',
    name: 'Corse',
    description: 'Antenne et membres basés en Corse (Ajaccio, Bastia...)',
    color: 'rose',
    memberIds: [],
    createdAt: new Date().toISOString()
  },
  {
    id: 'zone-grand-est',
    name: 'Grand Est',
    description: 'Réseau Grand Est (Strasbourg, Reims, Metz, Nancy...)',
    color: 'indigo',
    memberIds: ['mdf-007'],
    createdAt: new Date().toISOString()
  },
  {
    id: 'zone-hauts-de-france',
    name: 'Hauts-de-France',
    description: 'Antennes Hauts-de-France (Lille, Amiens, Roubaix...)',
    color: 'blue',
    memberIds: ['mdf-006'],
    createdAt: new Date().toISOString()
  },
  {
    id: 'zone-idf',
    name: 'Île-de-France',
    description: 'Membres actifs en Île-de-France et réseau Parisien',
    color: 'blue',
    memberIds: ['mdf-001', 'mdf-002', 'mdf-011', 'mdf-012'],
    referentUserId: 'usr-referent-idf',
    referentName: 'Aïssatou Diallo',
    createdAt: new Date().toISOString()
  },
  {
    id: 'zone-normandie',
    name: 'Normandie',
    description: 'Réseau et antenne Normandie (Rouen, Caen, Le Havre...)',
    color: 'indigo',
    memberIds: [],
    createdAt: new Date().toISOString()
  },
  {
    id: 'zone-nouvelle-aquitaine',
    name: 'Nouvelle-Aquitaine',
    description: 'Réseau Nouvelle-Aquitaine (Bordeaux, Limoges, Poitiers...)',
    color: 'amber',
    memberIds: ['mdf-005'],
    createdAt: new Date().toISOString()
  },
  {
    id: 'zone-occitanie',
    name: 'Occitanie',
    description: 'Antennes Occitanie (Toulouse, Montpellier, Nîmes...)',
    color: 'rose',
    memberIds: ['mdf-008'],
    createdAt: new Date().toISOString()
  },
  {
    id: 'zone-pays-de-la-loire',
    name: 'Pays de la Loire',
    description: 'Réseau et antenne Pays de la Loire (Nantes, Angers, Le Mans...)',
    color: 'teal',
    memberIds: ['mdf-009'],
    createdAt: new Date().toISOString()
  },
  {
    id: 'zone-paca',
    name: 'Provence-Alpes-Côte d\'Azur',
    description: 'Réseau Provence-Alpes-Côte d\'Azur (Marseille, Nice, Avignon...)',
    color: 'emerald',
    memberIds: ['mdf-003'],
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
    ApiService.saveSettings(newSettings).then((ok) => {
      if (!ok && ApiService.hasSession()) {
        showToast('⚠️ Paramètres enregistrés localement mais non synchronisés avec le serveur.');
      }
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
    ApiService.saveSettings({ lastUpdateDate: formatted });
  };

  // Save members to localStorage (cache) + broadcast + synchronisation backend
  useEffect(() => {
    try {
      localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(members));
      window.dispatchEvent(new CustomEvent('mbok_members_updated', { detail: members }));
    } catch {
      // Ignore quota errors
    }
    ApiService.syncMembers(members);
  }, [members]);

  // Synchronize members across storage events
  useEffect(() => {
    const syncMembers = (e: any) => {
      try {
        const saved = localStorage.getItem(LOCAL_STORAGE_KEY);
        if (saved) {
          const parsed = JSON.parse(saved);
          if (Array.isArray(parsed) && parsed.length > 0) {
            setMembers(parsed);
          }
        }
      } catch {}
    };

    window.addEventListener('storage', syncMembers);
    window.addEventListener('mbok_members_updated', syncMembers);
    return () => {
      window.removeEventListener('storage', syncMembers);
      window.removeEventListener('mbok_members_updated', syncMembers);
    };
  }, []);

  // Custom Zones State with LocalStorage Persistence & Guaranteed 13 Metropolitan Region Cards
  const [customZones, setCustomZones] = useState<CustomZone[]>(() => {
    let savedZones: CustomZone[] = [];
    try {
      const saved = localStorage.getItem(LOCAL_STORAGE_ZONES_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          savedZones = parsed;
        }
      }
    } catch {}

    const zoneMap = new Map<string, CustomZone>();

    // Add default 13 metropolitan zones first
    DEFAULT_CUSTOM_ZONES.forEach((dz) => {
      zoneMap.set(dz.name.toLowerCase(), { ...dz, memberIds: [...dz.memberIds] });
    });

    // Merge saved zones if they belong to FRENCH_ZONES
    savedZones.forEach((sz) => {
      if (FRENCH_ZONES.includes(sz.name)) {
        const existing = zoneMap.get(sz.name.toLowerCase());
        zoneMap.set(sz.name.toLowerCase(), {
          ...existing,
          ...sz,
          memberIds: Array.from(new Set([...(existing?.memberIds || []), ...(sz.memberIds || [])]))
        });
      }
    });

    return Array.from(zoneMap.values());
  });

  useEffect(() => {
    try {
      localStorage.setItem(LOCAL_STORAGE_ZONES_KEY, JSON.stringify(customZones));
      window.dispatchEvent(new CustomEvent('mbok_zones_updated', { detail: customZones }));
    } catch {}
    ApiService.syncZones(customZones);
  }, [customZones]);

  // Auto-synchronize memberIds in customZones based on live member.zone or member.region
  useEffect(() => {
    const validMemberIds = new Set(members.map((m) => m.id));
    const memberZoneMap = new Map<string, string>(); // member.id -> normalized zone/region name
    members.forEach((m) => {
      const zName = (m.zone || m.region || '').trim().toLowerCase();
      if (zName) memberZoneMap.set(m.id, zName);
    });

    setCustomZones((prevZones) => {
      let changed = false;
      const newZones = prevZones.map((z) => {
        const zNameLower = z.name.trim().toLowerCase();

        // All members whose region or zone matches this zone
        const matchingMemberIds = members
          .filter((m) => (m.zone || m.region || '').trim().toLowerCase() === zNameLower)
          .map((m) => m.id);

        // Keep IDs that exist in members AND either explicitly match this zone or were manually added and haven't moved to another known zone
        const updatedMemberIds = Array.from(
          new Set([
            ...z.memberIds.filter((id) => {
              if (!validMemberIds.has(id)) return false; // remove deleted member
              const currentMZone = memberZoneMap.get(id);
              if (currentMZone && currentMZone !== zNameLower) {
                // Member's region/zone was changed to another specific zone! Remove from old zone.
                return false;
              }
              return true;
            }),
            ...matchingMemberIds
          ])
        );

        if (
          updatedMemberIds.length !== z.memberIds.length ||
          !updatedMemberIds.every((id, idx) => id === z.memberIds[idx])
        ) {
          changed = true;
          return { ...z, memberIds: updatedMemberIds };
        }
        return z;
      });

      return changed ? newZones : prevZones;
    });
  }, [members]);

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

  // Hiérarchie des rôles : le super_admin a tous les droits d'un admin, plus
  // les onglets sensibles (Utilisateurs, Journaux, Qualité, Paramètres) que
  // l'admin ne voit plus. Les composants enfants ne connaissent que le rôle
  // "effectif" (super_admin => admin) ; seuls la navigation et le Header
  // reçoivent le rôle réel.
  const isAdminLevel = userRole === 'admin' || userRole === 'super_admin';
  const componentRole: UserRole = isAdminLevel ? 'admin' : userRole;

  /** Onglets autorisés selon le rôle réel. Les Demandes d'inscription sont
   * réservées aux niveaux admin ; le Reporting est ouvert à tous (saisie
   * référent / consultation et pilotage côté bureau). */
  const getAllowedTabs = (role: UserRole): string[] => {
    if (role === 'super_admin') {
      return ['dashboard', 'directory', 'zones', 'reportings', 'demandes', 'users', 'quality', 'import_export', 'audit_logs', 'settings'];
    }
    if (role === 'admin') {
      return ['dashboard', 'directory', 'zones', 'reportings', 'demandes', 'import_export'];
    }
    return ['dashboard', 'directory', 'zones', 'reportings'];
  };

  // Keep role in sync with currentUser
  useEffect(() => {
    if (currentUser) {
      setUserRole(currentUser.role);
    }
  }, [currentUser]);

  // L'application Formulaire est désormais servée séparément (port 3002) :
  // les anciens liens ?app=formulaire ou /formulaire sont redirigés vers elle.
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.get('app') === 'formulaire' || window.location.pathname.includes('/formulaire')) {
      window.location.replace(FORMULAIRE_URL);
    }
  }, []);

  // Demandes State — cache localStorage au démarrage, vérité serveur ensuite
  const [demandes, setDemandes] = useState<DemandeMember[]>(() => DemandeService.getDemandes());

  // Synchronisation temps réel même navigateur (formulaire public -> bureau) :
  // 'storage' couvre les autres onglets, 'mbok_demandes_updated' l'onglet courant.
  useEffect(() => {
    const syncDemandesFromStorage = () => {
      setDemandes(DemandeService.getDemandes());
    };

    window.addEventListener('storage', syncDemandesFromStorage);
    window.addEventListener('mbok_demandes_updated', syncDemandesFromStorage);

    return () => {
      window.removeEventListener('storage', syncDemandesFromStorage);
      window.removeEventListener('mbok_demandes_updated', syncDemandesFromStorage);
    };
  }, []);

  // Rafraîchissement périodique depuis le backend : les soumissions du
  // formulaire public faites depuis d'autres appareils arrivent par ici.
  useEffect(() => {
    if (!currentUser || !ApiService.hasSession()) return;

    const refresh = async () => {
      const serverDemandes = await ApiService.fetchDemandes();
      if (serverDemandes) {
        DemandeService.saveDemandes(serverDemandes);
        setDemandes(serverDemandes);
      }
    };

    const interval = setInterval(refresh, 15000);
    return () => clearInterval(interval);
  }, [currentUser?.id]);

  // Synchronisation backend des changements d'état (validation, refus...)
  useEffect(() => {
    ApiService.syncDemandes(demandes);
  }, [demandes]);

  const pendingDemandesCount = useMemo(() => {
    return demandes.filter((d) => d.status === 'EN_ATTENTE').length;
  }, [demandes]);

  // Weekly Reports State with Real-Time Synchronization
  const [weeklyReports, setWeeklyReports] = useState<WeeklyReport[]>(() => {
    return ReportingService.getReports();
  });

  useEffect(() => {
    const syncReportsFromStorage = () => {
      const latest = ReportingService.getReports();
      setWeeklyReports(latest);
    };

    window.addEventListener('storage', syncReportsFromStorage);
    window.addEventListener('mbok_reports_updated', syncReportsFromStorage);
    const interval = setInterval(syncReportsFromStorage, 1000);

    return () => {
      window.removeEventListener('storage', syncReportsFromStorage);
      window.removeEventListener('mbok_reports_updated', syncReportsFromStorage);
      clearInterval(interval);
    };
  }, []);

  const pendingReportingsCount = useMemo(() => {
    if (userRole === 'referent') {
      // For referent, count their reports that have a Bureau response or pending
      return weeklyReports.filter(
        (r) =>
          (r.referentId === currentUser?.id || r.email === currentUser?.email) &&
          r.status !== 'TRAITE'
      ).length;
    }
    // For admin, count all reports that need attention (new or need bureau feedback)
    return weeklyReports.filter(
      (r) => r.status === 'NOUVEAU' || (r.besoinRetourBureau && r.status !== 'TRAITE')
    ).length;
  }, [weeklyReports, userRole, currentUser]);

  const handleCreateWeeklyReport = (reportData: Omit<WeeklyReport, 'id' | 'createdAt' | 'status'>) => {
    const newReport = ReportingService.addReport(reportData);
    setWeeklyReports(ReportingService.getReports());

    addAuditLog(
      'system',
      'Nouveau reporting hebdomadaire',
      `Reporting soumis par ${reportData.referentName} pour la Zone ${reportData.zone} (Semaine du ${reportData.semaineLundi})`,
      reportData.urgenceLevel >= 4 ? 'danger' : reportData.besoinRetourBureau ? 'warning' : 'info',
      newReport.id,
      reportData.zone
    );

    showToast(`Reporting pour la zone ${reportData.zone} transmis avec succès !`);
  };

  const handleUpdateWeeklyReportStatus = (
    reportId: string,
    status: ReportingStatus,
    bureauNotes?: string
  ) => {
    const updated = ReportingService.updateReportStatus(
      reportId,
      status,
      bureauNotes,
      currentUser?.name || 'Administrateur MDF'
    );
    setWeeklyReports(updated);

    const target = updated.find((r) => r.id === reportId);

    addAuditLog(
      'system',
      'Mise à jour reporting hebdomadaire',
      `Statut du reporting de ${target?.referentName || 'la zone'} passé à "${status}"${bureauNotes ? ' avec réponse' : ''}`,
      'info',
      reportId,
      target?.zone
    );

    showToast(`Statut du reporting mis à jour (${status}).`);
  };

  const handleDeleteWeeklyReport = (reportId: string) => {
    if (!isAdminLevel) {
      showToast("Action réservée aux administrateurs.");
      return;
    }
    const updated = ReportingService.deleteReport(reportId);
    setWeeklyReports(updated);
    addAuditLog('system', 'Suppression reporting', `Reporting ${reportId} supprimé`, 'warning', reportId);
    showToast('Reporting supprimé.');
  };

  // Security Guard: Reset active tab if viewing a tab not allowed for the role
  useEffect(() => {
    if (!getAllowedTabs(userRole).includes(activeTab)) {
      setActiveTab('directory');
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userRole, activeTab]);

  // Handlers for Demandes (Inscription / Updates) Validation
  const handleValiderDemande = (demandeId: string, updatedData?: Partial<DemandeMember>) => {
    const targetDemande = demandes.find((d) => d.id === demandeId);
    if (!targetDemande) return;

    const dataToUse = { ...targetDemande, ...updatedData };

    // 1. Calculate Geocoding Coordinates
    const cityCoords = geocodeVille(dataToUse.ville || 'Paris');
    const offsetCoords = calculateCityOffsetCoordinates(
      dataToUse.ville || 'Paris',
      members.map((m) => ({ id: m.id, latitude: m.latitude, longitude: m.longitude, ville: m.ville }))
    );

    // 2. Automatically Determine MDF Regional Zone based on Zone, Region, City, Departement, or CodePostal
    const requestedZone = (dataToUse.zone || dataToUse.region || '').trim();
    const vLower = (dataToUse.ville || '').toLowerCase();
    const dLower = (dataToUse.departement || '').toLowerCase();
    const cpLower = (dataToUse.codePostal || '').toLowerCase();

    let assignedZone = 'Île-de-France';

    const directMatch = FRENCH_ZONES.find(
      (fz) => fz.toLowerCase() === requestedZone.toLowerCase()
    );

    if (directMatch) {
      assignedZone = directMatch;
    } else if (
      requestedZone.toLowerCase().includes('bretagne') ||
      vLower.includes('rennes') || vLower.includes('brest') || vLower.includes('quimper') ||
      vLower.includes('lorient') || vLower.includes('vannes') || vLower.includes('saint-brieuc') ||
      vLower.includes('saint-malo') || vLower.includes('morlaix') || vLower.includes('fougères') ||
      dLower.includes('35') || dLower.includes('29') || dLower.includes('56') || dLower.includes('22') ||
      dLower.includes('ille-et-vilaine') || dLower.includes('finistère') || dLower.includes('finistere') ||
      dLower.includes('morbihan') || dLower.includes('côtes') || dLower.includes('cotes') ||
      cpLower.startsWith('35') || cpLower.startsWith('29') || cpLower.startsWith('56') || cpLower.startsWith('22')
    ) {
      assignedZone = 'Bretagne';
    } else if (
      requestedZone.toLowerCase().includes('auvergne') || requestedZone.toLowerCase().includes('rhône') || requestedZone.toLowerCase().includes('rhone') ||
      vLower.includes('lyon') || vLower.includes('grenoble') || vLower.includes('saint-étienne') || vLower.includes('saint-etienne') || vLower.includes('clermont') ||
      dLower.includes('69') || dLower.includes('38') || dLower.includes('42') || dLower.includes('63') || dLower.includes('74') || dLower.includes('73') ||
      cpLower.startsWith('69') || cpLower.startsWith('38') || cpLower.startsWith('42') || cpLower.startsWith('63') || cpLower.startsWith('74') || cpLower.startsWith('73')
    ) {
      assignedZone = 'Auvergne-Rhône-Alpes';
    } else if (
      requestedZone.toLowerCase().includes('pays de la loire') || requestedZone.toLowerCase().includes('loire') ||
      vLower.includes('nantes') || vLower.includes('angers') || vLower.includes('le mans') || vLower.includes('saint-nazaire') ||
      dLower.includes('44') || dLower.includes('49') || dLower.includes('72') || dLower.includes('85') || dLower.includes('53') ||
      cpLower.startsWith('44') || cpLower.startsWith('49') || cpLower.startsWith('72') || cpLower.startsWith('85') || cpLower.startsWith('53')
    ) {
      assignedZone = 'Pays de la Loire';
    } else if (
      requestedZone.toLowerCase().includes('hauts-de-france') || requestedZone.toLowerCase().includes('nord') ||
      vLower.includes('lille') || vLower.includes('amiens') || vLower.includes('roubaix') || vLower.includes('dunkerque') ||
      dLower.includes('59') || dLower.includes('62') || dLower.includes('80') || dLower.includes('60') || dLower.includes('02') ||
      cpLower.startsWith('59') || cpLower.startsWith('62') || cpLower.startsWith('80') || cpLower.startsWith('60') || cpLower.startsWith('02')
    ) {
      assignedZone = 'Hauts-de-France';
    } else if (
      requestedZone.toLowerCase().includes('grand est') || requestedZone.toLowerCase().includes('alsace') ||
      vLower.includes('strasbourg') || vLower.includes('reims') || vLower.includes('metz') || vLower.includes('nancy') ||
      dLower.includes('67') || dLower.includes('68') || dLower.includes('57') || dLower.includes('54') || dLower.includes('51') ||
      cpLower.startsWith('67') || cpLower.startsWith('68') || cpLower.startsWith('57') || cpLower.startsWith('54') || cpLower.startsWith('51')
    ) {
      assignedZone = 'Grand Est';
    } else if (
      requestedZone.toLowerCase().includes('nouvelle-aquitaine') || requestedZone.toLowerCase().includes('aquitaine') ||
      vLower.includes('bordeaux') || vLower.includes('limoges') || vLower.includes('poitiers') || vLower.includes('pau') ||
      dLower.includes('33') || dLower.includes('87') || dLower.includes('86') || dLower.includes('64') || dLower.includes('17') ||
      cpLower.startsWith('33') || cpLower.startsWith('87') || cpLower.startsWith('86') || cpLower.startsWith('64') || cpLower.startsWith('17')
    ) {
      assignedZone = 'Nouvelle-Aquitaine';
    } else if (
      requestedZone.toLowerCase().includes('occitanie') ||
      vLower.includes('toulouse') || vLower.includes('montpellier') || vLower.includes('nîmes') || vLower.includes('nimes') ||
      dLower.includes('31') || dLower.includes('34') || dLower.includes('30') || dLower.includes('66') || dLower.includes('11') ||
      cpLower.startsWith('31') || cpLower.startsWith('34') || cpLower.startsWith('30') || cpLower.startsWith('66') || cpLower.startsWith('11')
    ) {
      assignedZone = 'Occitanie';
    } else if (
      requestedZone.toLowerCase().includes('provence') || requestedZone.toLowerCase().includes('paca') || requestedZone.toLowerCase().includes('côte d\'azur') ||
      vLower.includes('marseille') || vLower.includes('nice') || vLower.includes('toulon') || vLower.includes('aix') ||
      dLower.includes('13') || dLower.includes('06') || dLower.includes('83') || dLower.includes('84') ||
      cpLower.startsWith('13') || cpLower.startsWith('06') || cpLower.startsWith('83') || cpLower.startsWith('84')
    ) {
      assignedZone = 'Provence-Alpes-Côte d\'Azur';
    } else if (
      requestedZone.toLowerCase().includes('normandie') ||
      vLower.includes('rouen') || vLower.includes('caen') || vLower.includes('le havre') ||
      dLower.includes('76') || dLower.includes('14') || dLower.includes('50') || dLower.includes('27') || dLower.includes('61') ||
      cpLower.startsWith('76') || cpLower.startsWith('14') || cpLower.startsWith('50') || cpLower.startsWith('27') || cpLower.startsWith('61')
    ) {
      assignedZone = 'Normandie';
    } else if (
      requestedZone.toLowerCase().includes('bourgogne') || requestedZone.toLowerCase().includes('franche-comté') ||
      vLower.includes('dijon') || vLower.includes('besançon') || vLower.includes('besancon') ||
      dLower.includes('21') || dLower.includes('25') || dLower.includes('90') || dLower.includes('71') ||
      cpLower.startsWith('21') || cpLower.startsWith('25') || cpLower.startsWith('90') || cpLower.startsWith('71')
    ) {
      assignedZone = 'Bourgogne-Franche-Comté';
    } else if (
      requestedZone.toLowerCase().includes('centre') ||
      vLower.includes('orléans') || vLower.includes('orleans') || vLower.includes('tours') ||
      dLower.includes('45') || dLower.includes('37') || dLower.includes('18') || dLower.includes('41') ||
      cpLower.startsWith('45') || cpLower.startsWith('37') || cpLower.startsWith('18') || cpLower.startsWith('41')
    ) {
      assignedZone = 'Centre-Val de Loire';
    } else if (
      requestedZone.toLowerCase().includes('corse') ||
      vLower.includes('ajaccio') || vLower.includes('bastia') ||
      dLower.includes('20') || cpLower.startsWith('20')
    ) {
      assignedZone = 'Corse';
    }

    const finalZone = assignedZone;

    // 3. Create or update member
    const newMemberId = targetDemande.targetMemberId || `mdf-validated-${Date.now()}`;
    const newMember: Member = {
      id: newMemberId,
      nom: dataToUse.nom || 'Nom',
      prenom: dataToUse.prenom || 'Prénom',
      email: dataToUse.email || '',
      telephone: dataToUse.telephone || '',
      adresse: dataToUse.adresse || '',
      codePostal: dataToUse.codePostal || '',
      ville: dataToUse.ville || 'Paris',
      departement: dataToUse.departement,
      region: finalZone,
      zone: finalZone,
      pays: dataToUse.pays || 'France',
      situationProfessionnelle: dataToUse.situationProfessionnelle,
      domaineEtude: dataToUse.domaineEtude,
      anneeArriveeFrance: dataToUse.anneeArriveeFrance,
      organisation: dataToUse.organisation,
      fonction: dataToUse.fonction,
      latitude: offsetCoords ? offsetCoords.latitude : cityCoords.latitude,
      longitude: offsetCoords ? offsetCoords.longitude : cityCoords.longitude,
      photo: dataToUse.photo,
      champsPersonnalises: dataToUse.champsPersonnalises || []
    };

    setMembers((prev) => {
      const existingIndex = prev.findIndex(
        (m) => m.id === newMemberId || (newMember.email && m.email.toLowerCase() === newMember.email.toLowerCase())
      );
      if (existingIndex !== -1) {
        const updated = [...prev];
        updated[existingIndex] = { ...updated[existingIndex], ...newMember };
        return updated;
      }
      return [newMember, ...prev];
    });

    // 3b. Instantly add member to matching zone in customZones state
    setCustomZones((prev) => {
      return prev.map((z) => {
        if (z.name.trim().toLowerCase() === finalZone.trim().toLowerCase()) {
          if (!z.memberIds.includes(newMemberId)) {
            return {
              ...z,
              memberIds: [...z.memberIds, newMemberId]
            };
          }
        }
        return z;
      });
    });

    // 4. Update demand status
    const updatedDemandesList = DemandeService.updateDemandeStatus(
      demandeId,
      'VALIDEE',
      currentUser?.name || 'Administrateur MDF'
    );
    setDemandes(updatedDemandesList);

    // 5. Audit Log (envoyé aussi au backend via addAuditLog)
    addAuditLog(
      'member',
      'Validation Inscription Membre',
      `Demande de ${newMember.prenom} ${newMember.nom} validée et intégrée dans la Zone ${assignedZone}`,
      'info',
      newMemberId,
      `${newMember.prenom} ${newMember.nom}`.trim(),
      assignedZone
    );

    recordDataUpdate();
    showToast(`Demande de ${newMember.prenom} ${newMember.nom} validée et intégrée à la Zone ${assignedZone} !`);
  };

  const handleRefuserDemande = (demandeId: string, reason?: string) => {
    const updatedDemandesList = DemandeService.updateDemandeStatus(
      demandeId,
      'REFUSEE',
      currentUser?.name || 'Administrateur MDF',
      reason
    );
    setDemandes(updatedDemandesList);

    addAuditLog(
      'member',
      'Refus Demande Membre',
      `Demande ${demandeId} refusée. Motif : ${reason || 'Information non conforme'}`,
      'warning',
      demandeId
    );

    showToast('La demande a été refusée.');
  };

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
    ApiService.syncUsers(users);
  }, [users]);

  // Auto-synchronize referents as members & zone leads whenever users change
  useEffect(() => {
    let membersAdded = false;
    let zonesChanged = false;

    let updatedMembers = [...members];
    let updatedZones = [...customZones];

    users.forEach((u) => {
      if (u.role === 'referent') {
        const fullName = u.name || `${u.prenom || ''} ${u.nom || ''}`.trim();

        // 1. Check if user exists as a member in directory
        let matchingMember = updatedMembers.find(
          (m) =>
            (m.email && u.email && m.email.toLowerCase() === u.email.toLowerCase()) ||
            (`${m.prenom} ${m.nom}`.toLowerCase() === fullName.toLowerCase())
        );

        if (!matchingMember) {
          const newMember: Member = {
            id: `mdf-ref-${u.id}`,
            nom: u.nom || u.name?.split(' ')[1] || 'Nom',
            prenom: u.prenom || u.name?.split(' ')[0] || 'Prénom',
            email: u.email,
            telephone: '06 00 00 00 00',
            region: u.region || 'Île-de-France',
            zone: u.region || 'Île-de-France',
            ville: u.region === 'Bretagne' ? 'Rennes' : 'Paris',
            departement: u.region || 'France',
            pays: 'France',
            fonction: `Référent Régional ${u.region || ''}`,
            organisation: 'Mbok de France',
            latitude: 48.8566,
            longitude: 2.3522
          };
          updatedMembers.push(newMember);
          matchingMember = newMember;
          membersAdded = true;
        }

        const memberId = matchingMember.id;

        // 2. Link referent to custom zone(s)
        updatedZones = updatedZones.map((z) => {
          const isTargetZone =
            (u.assignedZoneIds && u.assignedZoneIds.includes(z.id)) ||
            (u.region && z.name.trim().toLowerCase() === u.region.trim().toLowerCase());

          if (isTargetZone) {
            const hasMember = z.memberIds.includes(memberId);
            const needsRefInfo = z.referentUserId !== u.id || z.referentName !== fullName;
            if (!hasMember || needsRefInfo) {
              zonesChanged = true;
              return {
                ...z,
                referentUserId: u.id,
                referentName: fullName,
                memberIds: Array.from(new Set([...z.memberIds, memberId]))
              };
            }
          } else if (z.referentUserId === u.id && !isTargetZone) {
            // Unassign from zones not assigned to this user
            zonesChanged = true;
            return {
              ...z,
              referentUserId: undefined,
              referentName: undefined
            };
          }
          return z;
        });
      }
    });

    if (membersAdded) {
      setMembers(updatedMembers);
    }
    if (zonesChanged) {
      setCustomZones(updatedZones);
    }
  }, [users]);

  // Import Logs & History State
  const [importLogs, setImportLogs] = useState<ImportLog[]>(() => {
    try {
      const saved = localStorage.getItem(LOCAL_STORAGE_LOGS_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) return parsed;
      }
    } catch {}
    return [];
  });

  useEffect(() => {
    try {
      localStorage.setItem(LOCAL_STORAGE_LOGS_KEY, JSON.stringify(importLogs));
    } catch {}
    ApiService.syncImportLogs(importLogs);
  }, [importLogs]);

  // Audit Logs State
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>(() => {
    try {
      const saved = localStorage.getItem(LOCAL_STORAGE_AUDIT_LOGS_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch {}
    return INITIAL_AUDIT_LOGS;
  });

  useEffect(() => {
    try {
      localStorage.setItem(LOCAL_STORAGE_AUDIT_LOGS_KEY, JSON.stringify(auditLogs));
    } catch {}
  }, [auditLogs]);

  // Hydratation depuis l'API backend (Supabase). Le localStorage reste le
  // cache de démarrage : si l'API est indisponible, l'application continue
  // sur le cache local sans erreur visible.
  useEffect(() => {
    if (!currentUser || !ApiService.hasSession()) return;
    let cancelled = false;
    ApiService.bootstrap()
      .then((d) => {
        if (cancelled) return;
        const { lastUpdateDate, ...serverSettings } = d.settings;
        setAppSettings((prev) => ({ ...prev, ...serverSettings }));
        if (lastUpdateDate) setLastUpdateDate(lastUpdateDate);
        setMembers(d.members);
        setCustomZones(d.zones);
        if (Array.isArray(d.demandes)) {
          DemandeService.saveDemandes(d.demandes);
          setDemandes(d.demandes);
        }
        if (currentUser.role === 'admin' || currentUser.role === 'super_admin') {
          setImportLogs(d.importLogs);
        }
        if (currentUser.role === 'super_admin') {
          if (d.users.length > 0) setUsers(d.users);
          setAuditLogs(d.auditLogs);
        }
      })
      .catch(() => {
        // API hors ligne : mode cache localStorage
      });
    return () => {
      cancelled = true;
    };
  }, [currentUser?.id]);

  const addAuditLog = (
    category: AuditLogCategory,
    action: string,
    details: string,
    severity: 'info' | 'warning' | 'danger' = 'info',
    targetId?: string,
    targetName?: string,
    zoneName?: string
  ) => {
    // Horodatage local pour l'affichage immédiat ; le serveur ré-horodate
    // chaque entrée (fuseau Europe/Paris) pour garantir l'exactitude.
    const now = new Date();
    const newLog: AuditLog = {
      id: `log-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      timestamp: now.toLocaleDateString('fr-FR', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      }),
      date: now.toLocaleDateString('fr-FR', { day: '2-digit', month: '2-digit', year: 'numeric' }),
      time: now.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
      category,
      action,
      details,
      userId: currentUser?.id || 'sys',
      userName: currentUser ? `${currentUser.prenom || ''} ${currentUser.nom || currentUser.name}`.trim() : 'Système',
      userRole: currentUser?.role || 'admin',
      targetId,
      targetName,
      targetItem: targetName,
      zoneName,
      severity
    };
    setAuditLogs((prev) => [newLog, ...prev]);
    ApiService.appendAuditLog(newLog);
  };

  // Location Change Alerts State
  const [locationAlerts, setLocationAlerts] = useState<LocationChangeAlert[]>([]);
  const [isLocationModalOpen, setIsLocationModalOpen] = useState(false);

  // Authentication Handlers — l'authentification est déléguée au backend
  // (Supabase Auth). L'identifiant accepte le username ou l'email.
  const handleLogin = async (inputUsername: string, inputPassword: string): Promise<boolean> => {
    const result = await ApiService.login(inputUsername.trim(), inputPassword.trim());

    if (result.status === 'disabled') {
      showToast('Ce compte d\'accès est désactivé. Veuillez contacter l\'administrateur.');
      return false;
    }
    if (result.status === 'error') {
      showToast('Serveur inaccessible. Vérifiez que l\'API backend est démarrée.');
      return false;
    }
    if (result.status !== 'ok') return false;

    // Success login
    const timeStr = 'Aujourd\'hui ' + new Date().toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' });
    const loggedUser = { ...result.user, lastLogin: timeStr };

    setCurrentUser(loggedUser);
    setUserRole(loggedUser.role);

    // Security reset: Ensure users start on a tab allowed for their role
    if (!getAllowedTabs(loggedUser.role).includes(activeTab)) {
      setActiveTab('directory');
    }

    try {
      localStorage.setItem(LOCAL_STORAGE_SESSION_KEY, JSON.stringify(loggedUser));
    } catch {}

    setUsers((prev) =>
      prev.map((u) => (u.id === loggedUser.id ? { ...u, lastLogin: timeStr } : u))
    );

    addAuditLog('auth', 'Connexion', `Ouverture de session de "${loggedUser.name || loggedUser.username}"`, 'info', loggedUser.id, loggedUser.name);
    showToast(`Bienvenue ${loggedUser.name} ! Connexion réussie.`);
    return true;
  };

  const handleLogout = () => {
    if (currentUser) {
      addAuditLog('auth', 'Déconnexion', `Fermeture de session de "${currentUser.name || currentUser.username}"`, 'info', currentUser.id, currentUser.name);
    }
    ApiService.logout();
    setCurrentUser(null);
    setUserRole('user');
    setActiveTab('directory');
    try {
      localStorage.removeItem(LOCAL_STORAGE_SESSION_KEY);
    } catch {}
    showToast('Vous avez été déconnecté.');
  };

  const handleAddUser = (user: Omit<AppUser, 'id' | 'lastLogin'>, memberInfo: { ville: string }) => {
    const newUser: AppUser = {
      ...user,
      id: `usr-${Date.now()}`,
      lastLogin: 'Nouveau'
    };
    setUsers((prev) => [newUser, ...prev]);
    addAuditLog('user', 'Création d\'un compte utilisateur', `Création du compte "${newUser.name}" (Rôle: ${newUser.role}, Région: ${newUser.region || 'Non spécifiée'})`, 'info', newUser.id, newUser.name);

    // Règle MDF : tout utilisateur est aussi membre. On relie le compte au
    // membre existant portant le même e-mail, sinon on crée automatiquement
    // sa fiche membre dans la zone correspondante (géolocalisée par la ville).
    const email = (newUser.email || '').trim().toLowerCase();
    const existingMember = email
      ? members.find((m) => (m.email || '').trim().toLowerCase() === email)
      : undefined;

    if (existingMember) {
      addAuditLog('member', 'Liaison utilisateur-membre', `Compte "${newUser.name}" relié au membre existant ${existingMember.prenom} ${existingMember.nom}`, 'info', existingMember.id, `${existingMember.prenom} ${existingMember.nom}`);
      showToast(`Utilisateur "${user.name}" créé et relié au membre existant "${existingMember.prenom} ${existingMember.nom}".`);
      return;
    }

    const zoneName = newUser.region || 'Île-de-France';
    const ville = memberInfo.ville || '';
    const cityCoords = geocodeVille(ville, zoneName);
    const offsetCoords = calculateCityOffsetCoordinates(
      ville,
      members.map((m) => ({ id: m.id, latitude: m.latitude ?? 0, longitude: m.longitude ?? 0, ville: m.ville || '' }))
    );

    const roleLabel =
      newUser.role === 'super_admin' ? 'Super Administrateur MDF'
      : newUser.role === 'admin' ? 'Administrateur MDF'
      : newUser.role === 'referent' ? 'Référent de Zone MDF'
      : 'Membre Mbok de France';

    const linkedMember: Member = {
      id: `mdf-usr-${Date.now()}`,
      nom: newUser.nom || '',
      prenom: newUser.prenom || '',
      email: newUser.email,
      telephone: '',
      ville,
      zone: zoneName,
      region: zoneName,
      pays: 'France',
      fonction: roleLabel,
      organisation: 'Mbok de France',
      situationProfessionnelle: roleLabel,
      latitude: offsetCoords ? offsetCoords.latitude : cityCoords.latitude,
      longitude: offsetCoords ? offsetCoords.longitude : cityCoords.longitude,
      champsPersonnalises: []
    };
    setMembers((prev) => [linkedMember, ...prev]);

    // Rattachement immédiat à la zone MDF correspondante
    setCustomZones((prev) =>
      prev.map((z) =>
        z.name.trim().toLowerCase() === zoneName.trim().toLowerCase() && !z.memberIds.includes(linkedMember.id)
          ? { ...z, memberIds: [...z.memberIds, linkedMember.id] }
          : z
      )
    );

    addAuditLog('member', 'Création automatique d\'un membre', `Fiche membre créée automatiquement pour l'utilisateur "${newUser.name}" (Zone ${zoneName}, ${ville})`, 'info', linkedMember.id, `${linkedMember.prenom} ${linkedMember.nom}`, zoneName);
    recordDataUpdate();
    showToast(`Utilisateur "${user.name}" créé et ajouté comme membre de la Zone ${zoneName}.`);
  };

  const handleUpdateUser = (userId: string, updates: Partial<AppUser>) => {
    setUsers((prev) =>
      prev.map((u) => {
        if (u.id === userId) {
          const updated = { ...u, ...updates };
          if (currentUser && currentUser.id === userId) {
            setCurrentUser(updated);
            setUserRole(updated.role);
            try {
              localStorage.setItem(LOCAL_STORAGE_SESSION_KEY, JSON.stringify(updated));
            } catch {}
          }
          return updated;
        }
        return u;
      })
    );
    const target = users.find((u) => u.id === userId);
    addAuditLog('user', 'Mise à jour d\'un utilisateur', `Mise à jour du compte "${target?.name || userId}"`, 'info', userId, target?.name);
    showToast('Compte utilisateur mis à jour.');
  };

  const handleDeleteUser = (userId: string) => {
    const target = users.find((u) => u.id === userId);
    setUsers((prev) => prev.filter((u) => u.id !== userId));
    ApiService.deleteUser(userId);
    addAuditLog('user', 'Suppression d\'un utilisateur', `Suppression du compte "${target?.name || userId}"`, 'warning', userId, target?.name);
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

  // Referent Scoping Logic
  const referentZones = useMemo(() => {
    if (userRole !== 'referent') return [];

    // 1. First priority: explicitly assigned zone IDs
    if (currentUser?.assignedZoneIds && currentUser.assignedZoneIds.length > 0) {
      const assigned = customZones.filter((z) => currentUser.assignedZoneIds?.includes(z.id));
      if (assigned.length > 0) return assigned;
    }

    // 2. Second priority: matching referentUserId on custom zone
    if (currentUser?.id) {
      const assignedByUserId = customZones.filter((z) => z.referentUserId === currentUser.id);
      if (assignedByUserId.length > 0) return assignedByUserId;
    }

    // 3. Fallback: match region name
    if (currentUser?.region) {
      const regionMatched = customZones.filter(
        (z) => z.name.trim().toLowerCase() === currentUser.region?.trim().toLowerCase()
      );
      if (regionMatched.length > 0) return regionMatched;
    }

    return [];
  }, [userRole, currentUser, customZones]);

  const referentZoneNames = useMemo(() => {
    if (userRole !== 'referent') return [];
    const names = new Set<string>();
    referentZones.forEach((z) => names.add(z.name));
    if (currentUser?.region) names.add(currentUser.region);
    return Array.from(names);
  }, [userRole, referentZones, currentUser]);

  const scopedMembers = useMemo(() => {
    if (userRole !== 'referent') {
      return members;
    }

    const allowedMemberIds = new Set<string>();
    referentZones.forEach((z) => {
      z.memberIds.forEach((id) => allowedMemberIds.add(id));
    });

    const normalizedZoneNames = referentZoneNames.map((n) => n.trim().toLowerCase());

    const matched = members.filter((m) => {
      if (allowedMemberIds.has(m.id)) return true;

      const mRegion = m.region?.trim().toLowerCase();
      const mZone = m.zone?.trim().toLowerCase();

      if (mRegion && normalizedZoneNames.some((zName) => mRegion.includes(zName) || zName.includes(mRegion))) {
        return true;
      }
      if (mZone && normalizedZoneNames.some((zName) => mZone.includes(zName) || zName.includes(mZone))) {
        return true;
      }

      return false;
    });

    return matched;
  }, [userRole, members, referentZones, referentZoneNames]);

  // Map for duplicates computation
  const duplicateIdsSet = useMemo(() => {
    const emailCounts = new Map<string, number>();
    const nameCounts = new Map<string, number>();

    scopedMembers.forEach((m) => {
      const email = m.email?.trim().toLowerCase();
      if (email) emailCounts.set(email, (emailCounts.get(email) || 0) + 1);

      const name = `${m.nom?.trim().toLowerCase()} ${m.prenom?.trim().toLowerCase()}`;
      if (name) nameCounts.set(name, (nameCounts.get(name) || 0) + 1);
    });

    const dupSet = new Set<string>();
    scopedMembers.forEach((m) => {
      const email = m.email?.trim().toLowerCase();
      const name = `${m.nom?.trim().toLowerCase()} ${m.prenom?.trim().toLowerCase()}`;
      if ((email && (emailCounts.get(email) || 0) > 1) || (name && (nameCounts.get(name) || 0) > 1)) {
        dupSet.add(m.id);
      }
    });
    return dupSet;
  }, [scopedMembers]);

  // Quality Issues count calculation for navigation badge (distinct member records with at least 1 issue)
  const qualityIssueCount = useMemo(() => {
    return scopedMembers.filter((m) => {
      const noPhone = !m.telephone || !m.telephone.trim();
      const noEmail = !m.email || !m.email.trim();
      const noLocation = !m.latitude || !m.longitude || (m.latitude === 0 && m.longitude === 0);
      const isDuplicate = duplicateIdsSet.has(m.id);
      return noPhone || noEmail || noLocation || isDuplicate;
    }).length;
  }, [scopedMembers, duplicateIdsSet]);

  // Filter & Search Logic (Multi-field match)
  const filteredAndSortedMembers = useMemo(() => {
    const q = filters.searchQuery.trim().toLowerCase();

    const filtered = scopedMembers.filter((m) => {
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
  }, [scopedMembers, filters, customZones, duplicateIdsSet]);

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

  /**
   * Synchronise l'utilisateur nommé référent d'une zone : la zone est ajoutée
   * à ses attributions et un simple utilisateur est promu au rôle Référent.
   */
  const syncReferentAssignment = (zoneId: string, referentUserId?: string) => {
    if (!referentUserId) return;
    setUsers((prev) =>
      prev.map((u) => {
        if (u.id !== referentUserId) return u;
        const assigned = u.assignedZoneIds || [];
        const nextRole: UserRole = u.role === 'user' ? 'referent' : u.role;
        if (assigned.includes(zoneId) && nextRole === u.role) return u;
        return { ...u, role: nextRole, assignedZoneIds: assigned.includes(zoneId) ? assigned : [...assigned, zoneId] };
      })
    );
    const target = users.find((u) => u.id === referentUserId);
    if (target && target.role === 'user') {
      addAuditLog('user', 'Promotion en Référent', `"${target.name || target.username}" promu Référent suite à son attribution de zone`, 'info', target.id, target.name);
    }
  };

  // Custom Zone Actions
  const handleAddZone = (newZone: Omit<CustomZone, 'id' | 'createdAt'>) => {
    const created: CustomZone = {
      ...newZone,
      id: `zone-${Date.now()}`,
      createdAt: new Date().toISOString()
    };
    setCustomZones((prev) => [created, ...prev]);
    syncReferentAssignment(created.id, created.referentUserId);
    addAuditLog('zone', 'Création de zone', `Zone "${created.name}" créée`, 'info', created.id, created.name, created.name);
    showToast(`Zone "${created.name}" créée avec succès.`);
  };

  const handleUpdateZone = (zoneId: string, updates: Partial<CustomZone>) => {
    setCustomZones((prev) =>
      prev.map((z) => (z.id === zoneId ? { ...z, ...updates } : z))
    );
    syncReferentAssignment(zoneId, updates.referentUserId);
    const target = customZones.find((z) => z.id === zoneId);
    addAuditLog('zone', 'Mise à jour de zone', `Zone "${updates.name || target?.name || zoneId}" mise à jour`, 'info', zoneId, target?.name, updates.name || target?.name);
    showToast('Zone mise à jour.');
  };

  const handleDeleteZone = (zoneId: string) => {
    const target = customZones.find((z) => z.id === zoneId);
    setCustomZones((prev) => prev.filter((z) => z.id !== zoneId));
    ApiService.deleteZone(zoneId);
    if (filters.zoneId === zoneId) {
      handleFilterChange({ zoneId: undefined });
    }
    addAuditLog('zone', 'Suppression de zone', `Zone "${target?.name || zoneId}" supprimée`, 'warning', zoneId, target?.name, target?.name);
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
    if (!isAdminLevel) {
      showToast("Action réservée aux administrateurs.");
      return;
    }
    if (memberData.id) {
      // Edit
      setMembers((prev) =>
        prev.map((m) => (m.id === memberData.id ? ({ ...memberData, id: memberData.id } as Member) : m))
      );
      addAuditLog('member', 'Modification d\'un membre', `Membre ${memberData.prenom} ${memberData.nom} mis à jour (${memberData.region || ''})`, 'info', memberData.id, `${memberData.prenom} ${memberData.nom}`, memberData.zone || memberData.region);
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

      addAuditLog('member', 'Création d\'un membre', `Nouveau membre ${newMember.prenom} ${newMember.nom} créé (${newMember.ville}, ${newMember.region})`, 'info', newMember.id, `${newMember.prenom} ${newMember.nom}`, newMember.zone || newMember.region);
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
    if (!isAdminLevel) {
      showToast("Action réservée aux administrateurs.");
      return;
    }
    const target = members.find((m) => m.id === memberId);
    setMembers((prev) => prev.filter((m) => m.id !== memberId));
    ApiService.deleteMember(memberId);
    setCustomZones((prev) =>
      prev.map((z) => ({
        ...z,
        memberIds: z.memberIds.filter((id) => id !== memberId)
      }))
    );
    if (selectedMemberId === memberId) setSelectedMemberId(null);
    if (activeDetailsMember?.id === memberId) setActiveDetailsMember(null);
    addAuditLog('member', 'Suppression d\'un membre', `Membre ${target ? `${target.prenom} ${target.nom}` : memberId} supprimé de l'annuaire`, 'danger', memberId, target ? `${target.prenom} ${target.nom}` : undefined, target?.zone || target?.region);
    showToast(`Membre ${target ? `"${target.prenom} ${target.nom}"` : ''} supprimé.`);
    recordDataUpdate();
  };

  // Excel / CSV Import Success & Smart Reconciliation
  const handleImportSuccess = (
    imported: Member[],
    replaceExisting: boolean,
    filename: string = 'Import_MDF.xlsx',
    errors: string[] = []
  ) => {
    let updatedCount = 0;
    let addedCount = 0;
    const alerts: LocationChangeAlert[] = [];

    let updatedMembersList: Member[] = [];

    if (replaceExisting) {
      updatedMembersList = imported;
      addedCount = imported.length;
    } else {
      // Create lookup map from current members (by email and by normalized full name)
      const existingEmailMap = new Map<string, Member>();
      const existingNameMap = new Map<string, Member>();

      members.forEach((m) => {
        if (m.email?.trim()) {
          existingEmailMap.set(m.email.trim().toLowerCase(), m);
        }
        const nameKey = `${(m.nom || '').trim().toLowerCase()}_${(m.prenom || '').trim().toLowerCase()}`;
        if (nameKey && nameKey !== '_') {
          existingNameMap.set(nameKey, m);
        }
      });

      const newMembers: Member[] = [];
      const updatedMemberMap = new Map<string, Member>();

      imported.forEach((imp) => {
        const emailKey = imp.email?.trim().toLowerCase();
        const nameKey = `${(imp.nom || '').trim().toLowerCase()}_${(imp.prenom || '').trim().toLowerCase()}`;

        const existing = (emailKey ? existingEmailMap.get(emailKey) : null) || existingNameMap.get(nameKey);

        if (existing && !updatedMemberMap.has(existing.id)) {
          // Member already exists -> Update fields & detect location change
          updatedCount++;

          const oldVille = existing.ville || '';
          const newVille = imp.ville || '';
          const isLocationChanged = oldVille && newVille && oldVille.toLowerCase() !== newVille.toLowerCase();

          if (isLocationChanged) {
            // Check if member belongs to any Custom Zone
            customZones.forEach((z) => {
              if (z.memberIds.includes(existing.id)) {
                alerts.push({
                  memberId: existing.id,
                  memberName: `${existing.prenom} ${existing.nom}`,
                  oldVille,
                  newVille,
                  zoneId: z.id,
                  zoneName: z.name
                });
              }
            });
          }

          // Merge fields into existing member, maintaining ID & Custom Field values if preserved
          const updatedMember: Member = {
            ...existing,
            ...imp,
            id: existing.id,
            // Keep existing custom fields if the imported row does not specify them
            champsPersonnalises: imp.champsPersonnalises || existing.champsPersonnalises
          };

          updatedMemberMap.set(existing.id, updatedMember);
        } else {
          // New Member -> Append
          addedCount++;
          newMembers.push(imp);
        }
      });

      // Reconstruct updated members array
      const mergedExisting = members.map((m) => updatedMemberMap.get(m.id) || m);
      updatedMembersList = [...newMembers, ...mergedExisting];
    }

    setMembers(updatedMembersList);

    // Save import log entry
    const newLog: ImportLog = {
      id: `log-${Date.now()}`,
      filename,
      date: new Date().toLocaleDateString('fr-FR', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      }),
      importedBy: currentUser ? (currentUser.name || currentUser.prenom || currentUser.username) : 'Administrateur',
      totalRows: imported.length,
      addedCount,
      updatedCount,
      locationChangesCount: alerts.length,
      errors
    };

    setImportLogs((prev) => [newLog, ...prev]);

    addAuditLog(
      'data',
      replaceExisting ? 'Réinitialisation annuaire (Import)' : 'Import / Synchronisation Excel',
      `Fichier: ${filename} | +${addedCount} ajoutés, ${updatedCount} mis à jour, ${alerts.length} alerte(s) de zone`,
      replaceExisting ? 'warning' : 'info'
    );

    if (alerts.length > 0) {
      setLocationAlerts(alerts);
      setIsLocationModalOpen(true);
    }

    showToast(
      replaceExisting
        ? `Annuaire réinitialisé avec ${imported.length} membres.`
        : `Synchronisation réussie : +${addedCount} nouveau(x), ${updatedCount} mis à jour.${alerts.length > 0 ? ` (${alerts.length} alerte(s) zone)` : ''}`
    );
    recordDataUpdate();
  };

  // Handle decisions from Location Change Modal
  const handleApplyLocationDecisions = (
    decisions: Array<{ memberId: string; currentZoneId: string; action: 'keep' | 'change' | 'remove' | 'later'; targetZoneId?: string }>
  ) => {
    setCustomZones((prev) => {
      let updatedZones = [...prev];

      decisions.forEach((d) => {
        if (d.action === 'remove' || (d.action === 'change' && d.targetZoneId)) {
          // Remove member from current zone
          updatedZones = updatedZones.map((z) => {
            if (z.id === d.currentZoneId) {
              return { ...z, memberIds: z.memberIds.filter((id) => id !== d.memberId) };
            }
            return z;
          });
        }

        if (d.action === 'change' && d.targetZoneId) {
          // Add member to new target zone
          updatedZones = updatedZones.map((z) => {
            if (z.id === d.targetZoneId) {
              const exists = z.memberIds.includes(d.memberId);
              return exists ? z : { ...z, memberIds: [...z.memberIds, d.memberId] };
            }
            return z;
          });
        }
      });

      return updatedZones;
    });

    showToast("Décisions d'affectations aux zones enregistrées avec succès !");
  };

  // Export handlers
  const handleExportExcel = () => {
    exportToExcel(filteredAndSortedMembers, `Mbok_de_France_Membres_${new Date().toISOString().slice(0, 10)}.xlsx`);
    addAuditLog('data', 'Export Excel', `Export Excel de ${filteredAndSortedMembers.length} membre(s) de l'annuaire`);
    showToast(`Exportation Excel de ${filteredAndSortedMembers.length} membres en cours...`);
  };

  const handleExportCsv = () => {
    exportToCsv(filteredAndSortedMembers, `Mbok_de_France_Membres_${new Date().toISOString().slice(0, 10)}.csv`);
    addAuditLog('data', 'Export CSV', `Export CSV de ${filteredAndSortedMembers.length} membre(s) de l'annuaire`);
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
      
      {/* Top Application Mode Switcher Banner */}
      <div className="bg-slate-900 text-slate-200 py-1.5 px-4 text-xs flex items-center justify-between border-b border-slate-800">
        <div className="flex items-center gap-2">
          <span className="inline-flex items-center gap-1.5 font-bold text-emerald-400">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            Espace Bureau Administrateur — Cartographie MDF
          </span>
          {pendingDemandesCount > 0 && (
            <span
              onClick={() => setActiveTab('demandes')}
              className="bg-amber-500 text-slate-950 font-black px-2 py-0.5 rounded-full text-[10px] cursor-pointer hover:bg-amber-400 transition-colors animate-pulse"
            >
              {pendingDemandesCount} demande(s) en attente
            </span>
          )}
        </div>

        <a
          href={FORMULAIRE_URL}
          target="_blank"
          rel="noopener noreferrer"
          className="hover:text-white bg-slate-800 hover:bg-emerald-800 text-emerald-300 font-bold px-3 py-1 rounded-lg border border-emerald-700/50 transition-all flex items-center gap-1.5 text-[11px] cursor-pointer"
        >
          <ExternalLink className="w-3.5 h-3.5 text-emerald-400" />
          <span>Ouvrir l'application Formulaire</span>
        </a>
      </div>

      {/* Top Header */}
      <Header
        userRole={userRole}
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
        pendingDemandesCount={pendingDemandesCount}
        pendingReportingsCount={pendingReportingsCount}
      />

      {/* Collapsible Filters Panel (When opened in directory tab) */}
      {isFiltersOpen && activeTab === 'directory' && (
        <FiltersPanel
          members={scopedMembers}
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
              members={scopedMembers}
              customZones={customZones}
              lastUpdateDate={lastUpdateDate}
              activeQualityFilter={filters.qualityFilter}
              userRole={componentRole}
              referentZoneNames={referentZoneNames}
              referentUser={currentUser}
              onSelectQualityFilter={(qf) => {
                handleFilterChange({ qualityFilter: qf });
                setActiveTab('directory');
              }}
              onNavigateToTab={(tab) => setActiveTab(tab)}
              onSelectMemberDetails={(member) => setActiveDetailsMember(member)}
            />

            {/* Quick Map Preview */}
            <div className="bg-white rounded-3xl p-6 border border-emerald-200 shadow-sm space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="font-bold text-slate-900 text-sm font-['Outfit'] flex items-center gap-2">
                  <MapPin className="w-4 h-4 text-emerald-600" />
                  <span>
                    {userRole === 'referent'
                      ? `Aperçu Carte — Zone ${referentZoneNames.join(', ')}`
                      : 'Aperçu Rapide de la Carte Géographique'}
                  </span>
                </h3>
                <button
                  onClick={() => setActiveTab('directory')}
                  className="inline-flex items-center gap-1 text-xs font-bold text-emerald-800 hover:underline cursor-pointer"
                >
                  <span>Ouvrir l'annuaire complet</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>

              <InteractiveMap
                members={scopedMembers}
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

            {/* Info Bar (Search, Filters, Counters, Filter Chips, Sort Dropdown) */}
            <InfoBar
              totalCount={scopedMembers.length}
              filteredCount={filteredAndSortedMembers.length}
              filters={filters}
              customZones={customZones}
              onFilterChange={handleFilterChange}
              onResetFilters={handleResetFilters}
              activeFilterCount={activeFilterCount}
              onToggleFiltersPanel={() => setIsFiltersOpen(!isFiltersOpen)}
              isFiltersOpen={isFiltersOpen}
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
                userRole={componentRole}
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
            members={scopedMembers}
            customZones={userRole === 'referent' ? referentZones : customZones}
            userRole={componentRole}
            users={users}
            currentUserId={currentUser?.id}
            assignedZoneIds={currentUser?.assignedZoneIds}
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

        {/* Tab: Reportings Hebdomadaires des Référents */}
        {activeTab === 'reportings' && (
          <ReportingsView
            reports={weeklyReports}
            currentUser={currentUser}
            customZones={customZones}
            members={members}
            userRole={componentRole}
            onSubmitReport={handleCreateWeeklyReport}
            onUpdateStatus={handleUpdateWeeklyReportStatus}
            onDeleteReport={handleDeleteWeeklyReport}
          />
        )}

        {/* Tab: Demandes d'inscription & mise à jour (niveaux admin uniquement) */}
        {activeTab === 'demandes' && isAdminLevel && (
          <DemandesView
            demandes={demandes}
            userRole={componentRole}
            onValiderDemande={handleValiderDemande}
            onRefuserDemande={handleRefuserDemande}
          />
        )}

        {/* Tab 4: Gestion des Utilisateurs */}
        {activeTab === 'users' && (
          <UserManagementView
            currentRole={componentRole}
            users={users}
            customZones={customZones}
            onAddUser={handleAddUser}
            onUpdateUser={handleUpdateUser}
            onDeleteUser={handleDeleteUser}
            onSwitchRole={(role) => setUserRole(role)}
          />
        )}

        {/* Tab 5: Journaux d'audit (Audit Logs) */}
        {activeTab === 'audit_logs' && (
          <AuditLogsView
            auditLogs={auditLogs}
            zoneNames={customZones.map((z) => z.name)}
            onExportLogs={(count) => {
              showToast(`Exportation de ${count} entrée(s) du journal d'audit effectuée.`);
            }}
          />
        )}

        {/* Tab 5: Qualité & Maintenance des données */}
        {activeTab === 'quality' && (
          <DataQualityView
            members={scopedMembers}
            customZones={customZones}
            userRole={componentRole}
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
            userRole={componentRole}
            importLogs={importLogs}
            onImportSuccess={handleImportSuccess}
            onClearLogs={() => {
              setImportLogs([]);
              showToast("Historique des imports effacé.");
            }}
          />
        )}

        {/* Tab 6: Settings */}
        {activeTab === 'settings' && (
          <SettingsView
            settings={appSettings}
            userRole={componentRole}
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
        userRole={componentRole}
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
        userRole={componentRole}
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

      {/* Location Change Review Modal */}
      <LocationChangeModal
        isOpen={isLocationModalOpen}
        alerts={locationAlerts}
        customZones={customZones}
        onClose={() => setIsLocationModalOpen(false)}
        onApplyDecisions={handleApplyLocationDecisions}
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
