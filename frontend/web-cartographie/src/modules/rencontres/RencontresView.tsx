import React, { useState, useEffect, useMemo } from 'react';
import { 
  Rencontre, 
  RencontreResponse, 
  RencontreParticipation, 
  RencontreDureePresence, 
  UserRole, 
  AppUser, 
  Member 
} from '@shared/types';
import { RencontreService } from '../../services/rencontreService';
import { RencontreFormModal } from './RencontreFormModal';
import { RencontreQrModal } from '../../../../web-rencontre/src/components/RencontreQrModal';
import { FRENCH_ZONES } from '../membres/AdminMemberFormModal';
import { exportToExcel, exportToCsv } from '../../utils/excelUtils';
import { 
  Calendar, 
  MapPin, 
  Clock, 
  Users, 
  CheckCircle2, 
  XCircle, 
  HelpCircle, 
  Plus, 
  ExternalLink, 
  QrCode, 
  Download, 
  Search, 
  Filter, 
  Edit, 
  Trash2, 
  Share2, 
  PackageCheck, 
  Truck, 
  Wrench, 
  Utensils, 
  UserCheck, 
  Megaphone, 
  HeartHandshake, 
  Sparkles, 
  FileSpreadsheet, 
  Copy, 
  Check, 
  SlidersHorizontal,
  ChevronRight,
  TrendingUp,
  ArrowRight
} from 'lucide-react';

interface RencontresViewProps {
  userRole: UserRole;
  currentUser?: AppUser | null;
  members: Member[];
  onShowToast: (message: string) => void;
  onOpenPublicSurvey?: (rencontreId?: string) => void;
  onSelectMember?: (member: Member) => void;
}

export type RencontreSubTab = 'dashboard' | 'rencontres' | 'participants' | 'organisation' | 'export';

export const RencontresView: React.FC<RencontresViewProps> = ({
  userRole,
  currentUser,
  members,
  onShowToast,
  onOpenPublicSurvey,
  onSelectMember
}) => {
  // Rencontres State
  const [rencontres, setRencontres] = useState<Rencontre[]>(() => RencontreService.getRencontres());
  const [selectedRencontreId, setSelectedRencontreId] = useState<string>(() => {
    const active = RencontreService.getActiveRencontre();
    return active.id;
  });

  const currentRencontre = useMemo(() => {
    return rencontres.find(r => r.id === selectedRencontreId) || rencontres[0] || RencontreService.getActiveRencontre();
  }, [rencontres, selectedRencontreId]);

  // Responses State
  const [responses, setResponses] = useState<RencontreResponse[]>(() => 
    RencontreService.getResponses(selectedRencontreId)
  );

  // SubTab State
  const [activeSubTab, setActiveSubTab] = useState<RencontreSubTab>('dashboard');

  // Modals State
  const [isFormModalOpen, setIsFormModalOpen] = useState(false);
  const [rencontreToEdit, setRencontreToEdit] = useState<Rencontre | null>(null);
  const [isQrModalOpen, setIsQrModalOpen] = useState(false);
  const [copiedMessage, setCopiedMessage] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);

  // Filters State for Participants
  const [searchTerm, setSearchTerm] = useState('');
  const [zoneFilter, setZoneFilter] = useState('ALL');
  const [participationFilter, setParticipationFilter] = useState('ALL');
  const [dureeFilter, setDureeFilter] = useState('ALL');
  const [aideFilter, setAideFilter] = useState('ALL');
  const [domaineFilter, setDomaineFilter] = useState('ALL');

  // Load and sync responses when selected rencontre changes
  useEffect(() => {
    if (currentRencontre?.id) {
      setResponses(RencontreService.getResponses(currentRencontre.id));
    }
  }, [currentRencontre?.id]);

  // Sync listener across tabs, storage events, and broadcast channels
  useEffect(() => {
    const handleSync = () => {
      const allR = RencontreService.getRencontres();
      setRencontres(allR);
      if (currentRencontre?.id) {
        setResponses(RencontreService.getResponses(currentRencontre.id));
      }
    };

    const unsubscribe = RencontreService.subscribe(handleSync);
    return () => {
      unsubscribe();
    };
  }, [currentRencontre?.id]);

  // Computed Stats
  const stats = useMemo(() => {
    if (!currentRencontre?.id) {
      return {
        total: 0,
        ouiCount: 0,
        nonCount: 0,
        incertainCount: 0,
        troisJoursCount: 0,
        weekendCount: 0,
        aideCount: 0,
        participationRate: 0,
        aideRate: 0,
        zoneStats: [],
        referentStats: [],
        domaineMap: {
          'Logistique': [],
          'Transport': [],
          'Installation / rangement': [],
          'Cuisine / repas': [],
          'Accueil': [],
          'Communication': [],
          'Autre': []
        }
      };
    }
    return RencontreService.getRencontreStats(currentRencontre.id);
  }, [currentRencontre?.id, responses]);

  // Filtered Participants
  const filteredResponses = useMemo(() => {
    return responses.filter((r) => {
      if (searchTerm.trim()) {
        const q = searchTerm.toLowerCase();
        const matchName = `${r.prenom} ${r.nom}`.toLowerCase().includes(q);
        const matchEmail = r.email ? r.email.toLowerCase().includes(q) : false;
        const matchTel = r.telephone ? r.telephone.includes(q) : false;
        const matchVille = r.ville ? r.ville.toLowerCase().includes(q) : false;
        if (!matchName && !matchEmail && !matchTel && !matchVille) return false;
      }

      if (zoneFilter !== 'ALL' && r.zone !== zoneFilter) return false;
      if (participationFilter !== 'ALL' && r.participation !== participationFilter) return false;
      if (dureeFilter !== 'ALL' && r.dureePresence !== dureeFilter) return false;
      if (aideFilter === 'YES' && !r.aideOrganisation) return false;
      if (aideFilter === 'NO' && r.aideOrganisation) return false;
      if (domaineFilter !== 'ALL') {
        if (!r.domainesAide || !r.domainesAide.includes(domaineFilter)) return false;
      }

      return true;
    });
  }, [responses, searchTerm, zoneFilter, participationFilter, dureeFilter, aideFilter, domaineFilter]);

  // Save/Update Rencontre
  const handleSaveRencontre = (saved: Rencontre) => {
    const updatedList = RencontreService.saveRencontre(saved);
    setRencontres(updatedList);
    setSelectedRencontreId(saved.id);
    setIsFormModalOpen(false);
    onShowToast(`Rencontre "${saved.nom}" enregistrée avec succès.`);
  };

  // Delete Rencontre
  const handleDeleteRencontre = (id: string, nom: string) => {
    if (window.confirm(`Êtes-vous sûr de vouloir supprimer la rencontre "${nom}" et ses réponses associées ?`)) {
      const updatedList = RencontreService.deleteRencontre(id);
      setRencontres(updatedList);
      if (selectedRencontreId === id) {
        setSelectedRencontreId(updatedList[0]?.id || '');
      }
      onShowToast(`Rencontre "${nom}" supprimée.`);
    }
  };

  // Delete Response
  const handleDeleteResponse = (id: string, nomPrenom: string) => {
    if (window.confirm(`Supprimer la réponse de ${nomPrenom} ?`)) {
      const updated = RencontreService.deleteResponse(id);
      setResponses(updated.filter(r => r.rencontreId === currentRencontre.id));
      onShowToast(`Réponse de ${nomPrenom} supprimée.`);
    }
  };

  // Export Excel
  const handleExportExcel = () => {
    const rows = filteredResponses.map((r, i) => ({
      'N°': i + 1,
      'Nom': r.nom,
      'Prénom': r.prenom,
      'Email': r.email,
      'Téléphone': r.telephone,
      'Zone': r.zone,
      'Ville': r.ville || '',
      'Référent': r.referentName || '',
      'Participation': r.participation === 'OUI' ? 'Oui (Présent)' : r.participation === 'NON' ? 'Non (Absent)' : 'Incertain',
      'Durée de présence': r.dureePresence === 'TROIS_JOURS' ? 'Les 3 jours' : r.dureePresence === 'WEEK_END' ? 'Week-end uniquement' : '',
      'Aide organisation': r.aideOrganisation ? 'Oui' : 'Non',
      'Domaines d\'aide': r.domainesAide ? r.domainesAide.join(', ') : '',
      'Précisions autre': r.autrePrecision || '',
      'Remarques': r.remarques || '',
      'Date de réponse': new Date(r.dateReponse).toLocaleDateString('fr-FR')
    }));

    exportToExcel(rows, `Participants_${currentRencontre.nom.replace(/\s+/g, '_')}_${new Date().toISOString().split('T')[0]}`);
    onShowToast(`Export Excel généré avec ${rows.length} lignes.`);
  };

  // Export CSV
  const handleExportCsv = () => {
    const rows = filteredResponses.map((r, i) => ({
      'N°': i + 1,
      'Nom': r.nom,
      'Prénom': r.prenom,
      'Email': r.email,
      'Téléphone': r.telephone,
      'Zone': r.zone,
      'Ville': r.ville || '',
      'Référent': r.referentName || '',
      'Participation': r.participation === 'OUI' ? 'Oui' : r.participation === 'NON' ? 'Non' : 'Incertain',
      'Durée': r.dureePresence === 'TROIS_JOURS' ? '3 jours' : r.dureePresence === 'WEEK_END' ? 'Week-end' : '',
      'Aide': r.aideOrganisation ? 'Oui' : 'Non',
      'Domaines': r.domainesAide ? r.domainesAide.join(';') : '',
      'Précisions': r.autrePrecision || '',
      'Date': new Date(r.dateReponse).toLocaleDateString('fr-FR')
    }));

    exportToCsv(rows, `Participants_${currentRencontre.nom.replace(/\s+/g, '_')}_${new Date().toISOString().split('T')[0]}`);
    onShowToast(`Export CSV généré.`);
  };

  // URL publique du sondage : l'application web-rencontre est servie
  // séparément (VITE_RENCONTRE_URL en production, hostname:3003 en dev).
  // Cette URL sert uniquement au PARTAGE (lien copié, message, QR code) —
  // le bureau n'offre aucun accès direct au formulaire.
  const rencontreBaseUrl: string =
    ((import.meta as unknown as { env?: Record<string, string | undefined> }).env?.VITE_RENCONTRE_URL) ??
    (typeof window !== 'undefined'
      ? `${window.location.protocol}//${window.location.hostname}:3003`
      : 'https://mbokdefrance.org');
  const surveyUrl = `${rencontreBaseUrl}/?rencontre=${currentRencontre.id}`;

  const invitationMessage = `السلام عليكم ورحمة الله وبركاته

Nous avons le plaisir de vous annoncer que la ${currentRencontre.nom} se tiendra du ${currentRencontre.dateAffichage || '25 au 27 décembre'} à ${currentRencontre.lieu} (${currentRencontre.adresse}).

Afin d'anticiper au mieux la logistique, merci de compléter le formulaire de participation via le lien ci-dessous :
👉 ${surveyUrl}

Fraternellement,
Le Bureau Mbok de France (MDF)`;

  const handleCopyLink = () => {
    navigator.clipboard.writeText(surveyUrl);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2000);
    onShowToast('Lien du sondage copié !');
  };

  const handleCopyInvitationMessage = () => {
    navigator.clipboard.writeText(invitationMessage);
    setCopiedMessage(true);
    setTimeout(() => setCopiedMessage(false), 2000);
    onShowToast('Message d\'invitation copié dans le presse-papier !');
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      
      {/* Top Banner & Rencontre Selector */}
      <div className="bg-white rounded-3xl p-5 sm:p-6 border border-emerald-100 shadow-xs relative overflow-hidden">
        
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          
          {/* Left: Rencontre Title & Metadata */}
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-900 text-[10px] font-extrabold uppercase tracking-wider">
                🕌 Rencontres & Sondages
              </span>
              <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider ${
                currentRencontre.statut === 'SONDAGE_OUVERT'
                  ? 'bg-emerald-600 text-white'
                  : currentRencontre.statut === 'PREPARATION'
                  ? 'bg-blue-600 text-white'
                  : 'bg-slate-600 text-white'
              }`}>
                {currentRencontre.statut === 'SONDAGE_OUVERT' ? 'Sondage Ouvert' : currentRencontre.statut}
              </span>
            </div>

            <div className="flex flex-wrap items-center gap-3">
              {/* Selector dropdown */}
              <select
                value={selectedRencontreId}
                onChange={(e) => setSelectedRencontreId(e.target.value)}
                aria-label="Sélectionner la rencontre active"
                className="text-lg sm:text-2xl font-black text-slate-900 bg-transparent border-b-2 border-emerald-500 pb-0.5 outline-none cursor-pointer font-['Outfit',sans-serif]"
              >
                {rencontres.map((r) => (
                  <option key={r.id} value={r.id}>
                    {r.nom} ({r.annee}) — {r.lieu}
                  </option>
                ))}
              </select>

              {userRole === 'admin' && (
                <button
                  onClick={() => {
                    setRencontreToEdit(currentRencontre);
                    setIsFormModalOpen(true);
                  }}
                  className="p-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 transition cursor-pointer"
                  title="Modifier les détails de la rencontre"
                >
                  <Edit className="w-4 h-4" />
                </button>
              )}
            </div>

            <p className="text-xs text-slate-500 font-semibold mt-1 flex flex-wrap items-center gap-3">
              <span>📅 {currentRencontre.dateAffichage || 'Dates non fixées'}</span>
              <span>•</span>
              <span>📍 {currentRencontre.adresse || currentRencontre.lieu}</span>
            </p>
          </div>

          {/* Right Action Buttons */}
          <div className="flex flex-wrap items-center gap-2 shrink-0">
            
            {/* Pas de bouton d'ouverture directe du sondage : l'accès aux
                formulaires publics depuis le bureau est désactivé — seuls le
                lien à copier et le QR code servent au partage aux membres. */}

            {/* QR Code */}
            <button
              onClick={() => setIsQrModalOpen(true)}
              className="inline-flex items-center gap-1.5 px-3 py-2 bg-emerald-50 hover:bg-emerald-100 text-emerald-900 border border-emerald-200 rounded-xl text-xs font-bold transition cursor-pointer"
              title="QR Code pour affiches et partages"
            >
              <QrCode className="w-3.5 h-3.5 text-emerald-600" />
              <span className="hidden sm:inline">QR Code</span>
            </button>

            {/* Copy Link */}
            <button
              onClick={handleCopyLink}
              className="inline-flex items-center gap-1.5 px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold transition cursor-pointer"
              title="Copier le lien public"
            >
              {copiedLink ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
              <span className="hidden sm:inline">{copiedLink ? 'Copié' : 'Lien'}</span>
            </button>

            {/* Add Rencontre (Admin) */}
            {userRole === 'admin' && (
              <button
                onClick={() => {
                  setRencontreToEdit(null);
                  setIsFormModalOpen(true);
                }}
                className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold transition shadow-sm cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Nouvelle rencontre</span>
              </button>
            )}

          </div>

        </div>

        {/* Sub-Navigation Tabs */}
        <div className="flex items-center gap-1.5 border-t border-slate-100 mt-5 pt-3 overflow-x-auto no-scrollbar">
          
          <button
            onClick={() => setActiveSubTab('dashboard')}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1.5 cursor-pointer whitespace-nowrap ${
              activeSubTab === 'dashboard'
                ? 'bg-slate-900 text-white shadow-xs'
                : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            <span>📊</span>
            <span>Tableau de bord</span>
          </button>

          <button
            onClick={() => setActiveSubTab('participants')}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1.5 cursor-pointer whitespace-nowrap ${
              activeSubTab === 'participants'
                ? 'bg-slate-900 text-white shadow-xs'
                : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            <span>👥</span>
            <span>Participants ({responses.length})</span>
          </button>

          <button
            onClick={() => setActiveSubTab('organisation')}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1.5 cursor-pointer whitespace-nowrap ${
              activeSubTab === 'organisation'
                ? 'bg-slate-900 text-white shadow-xs'
                : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            <span>🤝</span>
            <span>Organisation ({stats.aideCount} volontaires)</span>
          </button>

          <button
            onClick={() => setActiveSubTab('rencontres')}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1.5 cursor-pointer whitespace-nowrap ${
              activeSubTab === 'rencontres'
                ? 'bg-slate-900 text-white shadow-xs'
                : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            <span>🗓️</span>
            <span>Toutes les rencontres ({rencontres.length})</span>
          </button>

          <button
            onClick={() => setActiveSubTab('export')}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1.5 cursor-pointer whitespace-nowrap ${
              activeSubTab === 'export'
                ? 'bg-slate-900 text-white shadow-xs'
                : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            <span>⚙️</span>
            <span>Export & Partage</span>
          </button>

        </div>

      </div>

      {/* ========================================================= */}
      {/* 1. SUBTAB : DASHBOARD */}
      {/* ========================================================= */}
      {activeSubTab === 'dashboard' && (
        <div className="space-y-6">
          
          {/* Main Key KPI Cards */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3.5">
            
            {/* Total Réponses */}
            <div 
              onClick={() => {
                setParticipationFilter('ALL');
                setDureeFilter('ALL');
                setAideFilter('ALL');
                setDomaineFilter('ALL');
                setZoneFilter('ALL');
                setSearchTerm('');
                setActiveSubTab('participants');
              }}
              className="bg-white p-4 rounded-2xl border border-slate-200 hover:border-slate-400 hover:shadow-md transition-all cursor-pointer group shadow-2xs"
              title="Cliquer pour voir toutes les réponses"
            >
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-bold text-slate-500 block uppercase tracking-wider group-hover:text-slate-900">
                  Total Réponses
                </span>
                <span className="text-[10px] text-slate-400 opacity-0 group-hover:opacity-100 transition-opacity">
                  Voir tout →
                </span>
              </div>
              <div className="flex items-baseline justify-between mt-1">
                <span className="text-2xl sm:text-3xl font-black text-slate-900">{stats.total}</span>
                <span className="text-[11px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full">
                  100%
                </span>
              </div>
            </div>

            {/* Participants confirmés (Oui) */}
            <div 
              onClick={() => {
                setParticipationFilter('OUI');
                setDureeFilter('ALL');
                setAideFilter('ALL');
                setDomaineFilter('ALL');
                setZoneFilter('ALL');
                setSearchTerm('');
                setActiveSubTab('participants');
              }}
              className="bg-white p-4 rounded-2xl border border-emerald-200 hover:border-emerald-500 hover:shadow-md transition-all cursor-pointer group shadow-2xs bg-gradient-to-br from-emerald-50/40 to-white"
              title="Cliquer pour voir les participants confirmés (Oui)"
            >
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-bold text-emerald-800 block uppercase tracking-wider group-hover:text-emerald-950">
                  Participants confirmés (Oui)
                </span>
                <span className="text-[10px] font-bold text-emerald-700 opacity-0 group-hover:opacity-100 transition-opacity">
                  Filtrer →
                </span>
              </div>
              <div className="flex items-baseline justify-between mt-1">
                <span className="text-2xl sm:text-3xl font-black text-emerald-950">{stats.ouiCount}</span>
                <span className="text-[11px] font-bold text-emerald-800 bg-emerald-100 px-2 py-0.5 rounded-full">
                  {stats.participationRate}%
                </span>
              </div>
            </div>

            {/* Aide Organisation (Bénévoles) */}
            <div 
              onClick={() => {
                setParticipationFilter('ALL');
                setAideFilter('YES');
                setDureeFilter('ALL');
                setDomaineFilter('ALL');
                setZoneFilter('ALL');
                setSearchTerm('');
                setActiveSubTab('participants');
              }}
              className="bg-white p-4 rounded-2xl border border-teal-200 hover:border-teal-500 hover:shadow-md transition-all cursor-pointer group shadow-2xs bg-gradient-to-br from-teal-50/40 to-white"
              title="Cliquer pour voir les bénévoles pour l'aide à l'organisation"
            >
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-bold text-teal-800 block uppercase tracking-wider group-hover:text-teal-950">
                  Aide Organisation (Bénévoles)
                </span>
                <span className="text-[10px] font-bold text-teal-700 opacity-0 group-hover:opacity-100 transition-opacity">
                  Filtrer →
                </span>
              </div>
              <div className="flex items-baseline justify-between mt-1">
                <span className="text-2xl sm:text-3xl font-black text-teal-950">{stats.aideCount}</span>
                <span className="text-[11px] font-bold text-teal-800 bg-teal-100 px-2 py-0.5 rounded-full">
                  {stats.aideRate}%
                </span>
              </div>
            </div>

            {/* Durée (3 jours vs Week-end) */}
            <div 
              className="bg-white p-4 rounded-2xl border border-amber-200 shadow-2xs bg-gradient-to-br from-amber-50/30 to-white flex flex-col justify-between"
            >
              <span className="text-[11px] font-bold text-amber-800 block uppercase tracking-wider">
                Durée (3 jours vs Week-end)
              </span>
              <div className="flex items-center gap-1.5 mt-1.5">
                <button
                  type="button"
                  onClick={() => {
                    setParticipationFilter('OUI');
                    setDureeFilter('TROIS_JOURS');
                    setAideFilter('ALL');
                    setDomaineFilter('ALL');
                    setZoneFilter('ALL');
                    setSearchTerm('');
                    setActiveSubTab('participants');
                  }}
                  className="flex-1 py-1 px-2 bg-emerald-100 hover:bg-emerald-200 text-emerald-950 font-black rounded-lg text-xs transition cursor-pointer text-center"
                  title="Filtrer les participants 3 jours"
                >
                  {stats.troisJoursCount} <span className="font-semibold text-[10px] text-emerald-800">3j</span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setParticipationFilter('OUI');
                    setDureeFilter('WEEK_END');
                    setAideFilter('ALL');
                    setDomaineFilter('ALL');
                    setZoneFilter('ALL');
                    setSearchTerm('');
                    setActiveSubTab('participants');
                  }}
                  className="flex-1 py-1 px-2 bg-teal-100 hover:bg-teal-200 text-teal-950 font-black rounded-lg text-xs transition cursor-pointer text-center"
                  title="Filtrer les participants Week-end"
                >
                  {stats.weekendCount} <span className="font-semibold text-[10px] text-teal-800">WE</span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setParticipationFilter('INCERTAIN');
                    setDureeFilter('ALL');
                    setAideFilter('ALL');
                    setDomaineFilter('ALL');
                    setZoneFilter('ALL');
                    setSearchTerm('');
                    setActiveSubTab('participants');
                  }}
                  className="py-1 px-1.5 bg-amber-100 hover:bg-amber-200 text-amber-950 font-bold rounded-lg text-[10px] transition cursor-pointer text-center"
                  title="Filtrer les incertains"
                >
                  {stats.incertainCount} ?
                </button>
              </div>
            </div>

          </div>

          {/* Section Charts : Participation & Durée */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            
            {/* Chart 1: Participation */}
            <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-2xs space-y-4">
              <div className="flex items-center justify-between">
                <h4 className="text-xs font-extrabold text-slate-900 uppercase tracking-wider flex items-center gap-2">
                  <span>📊 Participation au sondage</span>
                </h4>
                <span className="text-xs font-bold text-slate-500">{stats.total} réponses</span>
              </div>

              <div className="space-y-3 text-xs">
                <div
                  onClick={() => {
                    setParticipationFilter('OUI');
                    setDureeFilter('ALL');
                    setAideFilter('ALL');
                    setDomaineFilter('ALL');
                    setZoneFilter('ALL');
                    setSearchTerm('');
                    setActiveSubTab('participants');
                  }}
                  className="p-2 -mx-2 rounded-xl hover:bg-emerald-50/60 transition cursor-pointer group"
                  title="Cliquer pour filtrer les participants présents (Oui)"
                >
                  <div className="flex justify-between font-bold mb-1">
                    <span className="text-emerald-900 group-hover:underline">🟢 Oui (Présent)</span>
                    <span>{stats.ouiCount} ({stats.total > 0 ? Math.round((stats.ouiCount / stats.total) * 100) : 0}%)</span>
                  </div>
                  <div className="w-full h-3 bg-slate-100 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-emerald-600 rounded-full transition-all duration-500"
                      style={{ width: `${stats.total > 0 ? (stats.ouiCount / stats.total) * 100 : 0}%` }}
                    />
                  </div>
                </div>

                <div
                  onClick={() => {
                    setParticipationFilter('NON');
                    setDureeFilter('ALL');
                    setAideFilter('ALL');
                    setDomaineFilter('ALL');
                    setZoneFilter('ALL');
                    setSearchTerm('');
                    setActiveSubTab('participants');
                  }}
                  className="p-2 -mx-2 rounded-xl hover:bg-rose-50/60 transition cursor-pointer group"
                  title="Cliquer pour filtrer les absents (Non)"
                >
                  <div className="flex justify-between font-bold mb-1">
                    <span className="text-rose-900 group-hover:underline">🔴 Non (Absent)</span>
                    <span>{stats.nonCount} ({stats.total > 0 ? Math.round((stats.nonCount / stats.total) * 100) : 0}%)</span>
                  </div>
                  <div className="w-full h-3 bg-slate-100 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-rose-500 rounded-full transition-all duration-500"
                      style={{ width: `${stats.total > 0 ? (stats.nonCount / stats.total) * 100 : 0}%` }}
                    />
                  </div>
                </div>

                <div
                  onClick={() => {
                    setParticipationFilter('INCERTAIN');
                    setDureeFilter('ALL');
                    setAideFilter('ALL');
                    setDomaineFilter('ALL');
                    setZoneFilter('ALL');
                    setSearchTerm('');
                    setActiveSubTab('participants');
                  }}
                  className="p-2 -mx-2 rounded-xl hover:bg-amber-50/60 transition cursor-pointer group"
                  title="Cliquer pour filtrer les incertains"
                >
                  <div className="flex justify-between font-bold mb-1">
                    <span className="text-amber-900 group-hover:underline">🟡 Incertain (Je ne sais pas encore)</span>
                    <span>{stats.incertainCount} ({stats.total > 0 ? Math.round((stats.incertainCount / stats.total) * 100) : 0}%)</span>
                  </div>
                  <div className="w-full h-3 bg-slate-100 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-amber-500 rounded-full transition-all duration-500"
                      style={{ width: `${stats.total > 0 ? (stats.incertainCount / stats.total) * 100 : 0}%` }}
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Chart 2: Durée de présence */}
            <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-2xs space-y-4">
              <div className="flex items-center justify-between">
                <h4 className="text-xs font-extrabold text-slate-900 uppercase tracking-wider flex items-center gap-2">
                  <span>⏱️ Durée de présence confirmée</span>
                </h4>
                <span className="text-xs font-bold text-emerald-800">{stats.ouiCount} participants</span>
              </div>

              <div className="space-y-3 text-xs">
                <div
                  onClick={() => {
                    setParticipationFilter('OUI');
                    setDureeFilter('TROIS_JOURS');
                    setAideFilter('ALL');
                    setDomaineFilter('ALL');
                    setZoneFilter('ALL');
                    setSearchTerm('');
                    setActiveSubTab('participants');
                  }}
                  className="p-2 -mx-2 rounded-xl hover:bg-emerald-50/60 transition cursor-pointer group"
                  title="Cliquer pour filtrer les participants présents les 3 jours"
                >
                  <div className="flex justify-between font-bold mb-1">
                    <span className="text-slate-800 group-hover:text-emerald-950 group-hover:underline">Les trois jours (Vendredi au Dimanche)</span>
                    <span className="font-extrabold">{stats.troisJoursCount} ({stats.ouiCount > 0 ? Math.round((stats.troisJoursCount / stats.ouiCount) * 100) : 0}%)</span>
                  </div>
                  <div className="w-full h-3 bg-slate-100 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-emerald-800 rounded-full transition-all duration-500"
                      style={{ width: `${stats.ouiCount > 0 ? (stats.troisJoursCount / stats.ouiCount) * 100 : 0}%` }}
                    />
                  </div>
                </div>

                <div
                  onClick={() => {
                    setParticipationFilter('OUI');
                    setDureeFilter('WEEK_END');
                    setAideFilter('ALL');
                    setDomaineFilter('ALL');
                    setZoneFilter('ALL');
                    setSearchTerm('');
                    setActiveSubTab('participants');
                  }}
                  className="p-2 -mx-2 rounded-xl hover:bg-teal-50/60 transition cursor-pointer group"
                  title="Cliquer pour filtrer les participants présents uniquement le week-end"
                >
                  <div className="flex justify-between font-bold mb-1">
                    <span className="text-slate-800 group-hover:text-teal-950 group-hover:underline">Le week-end uniquement (Samedi et Dimanche)</span>
                    <span className="font-extrabold">{stats.weekendCount} ({stats.ouiCount > 0 ? Math.round((stats.weekendCount / stats.ouiCount) * 100) : 0}%)</span>
                  </div>
                  <div className="w-full h-3 bg-slate-100 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-teal-600 rounded-full transition-all duration-500"
                      style={{ width: `${stats.ouiCount > 0 ? (stats.weekendCount / stats.ouiCount) * 100 : 0}%` }}
                    />
                  </div>
                </div>

                <div 
                  onClick={() => {
                    setParticipationFilter('ALL');
                    setAideFilter('YES');
                    setDureeFilter('ALL');
                    setDomaineFilter('ALL');
                    setZoneFilter('ALL');
                    setSearchTerm('');
                    setActiveSubTab('participants');
                  }}
                  className="p-3 bg-emerald-50 hover:bg-emerald-100/80 rounded-2xl border border-emerald-100 flex items-center justify-between text-xs mt-2 transition cursor-pointer group"
                  title="Cliquer pour voir la liste des volontaires"
                >
                  <span className="font-bold text-emerald-950 group-hover:underline flex items-center gap-1.5">
                    <span>🤝</span>
                    <span>Volontaires pour aider :</span>
                  </span>
                  <span className="font-black text-emerald-800 text-sm flex items-center gap-1">
                    <span>{stats.aideCount} volontaires</span>
                    <span className="text-[10px] text-emerald-600">→</span>
                  </span>
                </div>
              </div>
            </div>

          </div>

          {/* Section: Répartition géographique des participants par Zone */}
          <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-2xs space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-2 border-b border-slate-100">
              <div>
                <h4 className="text-sm font-black text-slate-900 uppercase tracking-wider flex items-center gap-2">
                  <span>📍 Répartition géographique des participants par zone</span>
                </h4>
                <p className="text-xs text-slate-500 font-medium">
                  Vue consolidée par région pour anticiper les flux, navettes et transports
                </p>
              </div>
              <button
                onClick={() => setActiveSubTab('participants')}
                className="text-xs font-bold text-emerald-800 hover:text-emerald-950 hover:underline flex items-center gap-1 cursor-pointer self-start sm:self-auto"
              >
                <span>Voir la liste détaillée</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>

            {stats.zoneStats.length === 0 ? (
              <div className="text-center py-8 text-slate-400 text-xs">
                Aucune réponse enregistrée pour le moment.
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-1">
                {stats.zoneStats.map((z) => {
                  const pct = stats.ouiCount > 0 ? Math.round((z.participants / stats.ouiCount) * 100) : 0;
                  return (
                    <div 
                      key={z.zone} 
                      onClick={() => {
                        setZoneFilter(z.zone);
                        setActiveSubTab('participants');
                      }}
                      className="flex flex-col p-3 bg-slate-50/70 hover:bg-emerald-50/50 rounded-2xl border border-slate-100 hover:border-emerald-200 transition cursor-pointer group"
                      title={`Filtrer les participants de la zone ${z.zone}`}
                    >
                      <div className="flex items-center justify-between font-bold text-xs mb-1.5">
                        <span className="text-slate-900 group-hover:text-emerald-950 font-extrabold flex items-center gap-1.5">
                          <span>{z.zone}</span>
                        </span>
                        <div className="flex items-center gap-2">
                          <span className="text-emerald-900 font-black">
                            {z.participants} <span className="text-[10px] font-semibold text-slate-500">confirmés</span>
                          </span>
                          <span className="text-[10px] text-slate-400 font-normal">
                            ({z.total} rép.)
                          </span>
                        </div>
                      </div>
                      
                      <div className="w-full h-2 bg-slate-200/70 rounded-full overflow-hidden mb-1.5">
                        <div
                          className="h-full bg-emerald-600 rounded-full transition-all duration-300"
                          style={{ width: `${pct}%` }}
                        />
                      </div>

                      <div className="flex items-center justify-between text-[10px] text-slate-500 font-medium">
                        <span>{pct}% des participants</span>
                        {z.aide > 0 ? (
                          <span className="font-bold text-teal-800 bg-teal-50 px-2 py-0.2 rounded-md border border-teal-200">
                            🤝 {z.aide} volontaire{z.aide > 1 ? 's' : ''} aide
                          </span>
                        ) : (
                          <span className="text-slate-400">Aucun volontaire</span>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

        </div>
      )}

      {/* ========================================================= */}
      {/* 2. SUBTAB : PARTICIPANTS LIST & FILTERS */}
      {/* ========================================================= */}
      {activeSubTab === 'participants' && (
        <div className="space-y-4">
          
          {/* Filter Bar */}
          <div className="bg-white p-4 rounded-3xl border border-slate-200 shadow-2xs space-y-3">
            <div className="grid grid-cols-1 sm:grid-cols-3 lg:grid-cols-6 gap-2.5 text-xs">
              
              {/* Search */}
              <div className="sm:col-span-2 relative">
                <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Rechercher par nom, email, ville..."
                  className="w-full pl-9 pr-3 py-2 bg-slate-50 rounded-xl border border-slate-200 text-xs font-medium outline-none"
                />
              </div>

              {/* Zone filter */}
              <div>
                <select
                  value={zoneFilter}
                  onChange={(e) => setZoneFilter(e.target.value)}
                  className="w-full px-2.5 py-2 bg-slate-50 rounded-xl border border-slate-200 text-xs font-bold outline-none"
                >
                  <option value="ALL">Toutes les zones</option>
                  {FRENCH_ZONES.map(z => <option key={z} value={z}>{z}</option>)}
                </select>
              </div>

              {/* Participation filter */}
              <div>
                <select
                  value={participationFilter}
                  onChange={(e) => setParticipationFilter(e.target.value)}
                  className="w-full px-2.5 py-2 bg-slate-50 rounded-xl border border-slate-200 text-xs font-bold outline-none"
                >
                  <option value="ALL">Toutes réponses</option>
                  <option value="OUI">Oui (Présents)</option>
                  <option value="NON">Non (Absents)</option>
                  <option value="INCERTAIN">Incertains</option>
                </select>
              </div>

              {/* Durée filter */}
              <div>
                <select
                  value={dureeFilter}
                  onChange={(e) => setDureeFilter(e.target.value)}
                  className="w-full px-2.5 py-2 bg-slate-50 rounded-xl border border-slate-200 text-xs font-bold outline-none"
                >
                  <option value="ALL">Toute durée</option>
                  <option value="TROIS_JOURS">3 jours</option>
                  <option value="WEEK_END">Week-end</option>
                </select>
              </div>

              {/* Aide filter */}
              <div>
                <select
                  value={aideFilter}
                  onChange={(e) => setAideFilter(e.target.value)}
                  className="w-full px-2.5 py-2 bg-slate-50 rounded-xl border border-slate-200 text-xs font-bold outline-none"
                >
                  <option value="ALL">Aide : Tous</option>
                  <option value="YES">Volontaires (Oui)</option>
                  <option value="NO">Non volontaires</option>
                </select>
              </div>

            </div>

            <div className="flex items-center justify-between pt-2 border-t border-slate-100 text-xs text-slate-500">
              <span className="font-semibold">
                Affichage de <strong className="text-slate-900">{filteredResponses.length}</strong> réponse(s) filtrée(s) sur {responses.length} au total
              </span>

              <div className="flex items-center gap-2">
                <button
                  onClick={handleExportExcel}
                  className="px-3 py-1.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-900 rounded-xl text-xs font-bold transition flex items-center gap-1.5 cursor-pointer"
                >
                  <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-600" />
                  <span>Export Excel</span>
                </button>
                <button
                  onClick={handleExportCsv}
                  className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold transition flex items-center gap-1.5 cursor-pointer"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>CSV</span>
                </button>
              </div>
            </div>
          </div>

          {/* Table */}
          <div className="bg-white rounded-3xl border border-slate-200 shadow-2xs overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50/80 border-b border-slate-200 text-slate-500 font-bold uppercase tracking-wider text-[10px]">
                  <tr>
                    <th className="px-4 py-3">Participant</th>
                    <th className="px-4 py-3">Contact</th>
                    <th className="px-4 py-3">Zone & Référent</th>
                    <th className="px-4 py-3 text-center">Participation</th>
                    <th className="px-4 py-3">Durée</th>
                    <th className="px-4 py-3">Aide & Domaines</th>
                    <th className="px-4 py-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredResponses.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="text-center py-10 text-slate-400">
                        Aucun participant ne correspond aux filtres actuels.
                      </td>
                    </tr>
                  ) : (
                    filteredResponses.map((r) => (
                      <tr key={r.id} className="hover:bg-slate-50/80 transition">
                        
                        {/* Name */}
                        <td className="px-4 py-3">
                          <div className="font-extrabold text-slate-900 flex items-center gap-2">
                            <span>{r.prenom} {r.nom}</span>
                            {r.memberId && (
                              <span className="text-[10px] text-emerald-700 bg-emerald-50 px-1.5 py-0.2 rounded font-bold">
                                MDF
                              </span>
                            )}
                          </div>
                          <span className="text-[11px] text-slate-400">{r.ville || 'Ville non précisée'}</span>
                        </td>

                        {/* Contact */}
                        <td className="px-4 py-3 text-[11px]">
                          <div className="text-slate-800 font-medium">{r.email || '-'}</div>
                          <div className="text-slate-500 font-mono">{r.telephone || '-'}</div>
                        </td>

                        {/* Zone */}
                        <td className="px-4 py-3">
                          <div className="font-bold text-slate-800">{r.zone}</div>
                          <div className="text-[11px] text-slate-500">{r.referentName || 'Bureau MDF'}</div>
                        </td>

                        {/* Participation Badge */}
                        <td className="px-4 py-3 text-center">
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-black ${
                            r.participation === 'OUI'
                              ? 'bg-emerald-100 text-emerald-900 border border-emerald-300'
                              : r.participation === 'NON'
                              ? 'bg-rose-100 text-rose-900 border border-rose-300'
                              : 'bg-amber-100 text-amber-900 border border-amber-300'
                          }`}>
                            {r.participation === 'OUI' ? '✓ Oui' : r.participation === 'NON' ? '✕ Non' : '? Incertain'}
                          </span>
                        </td>

                        {/* Durée */}
                        <td className="px-4 py-3 font-semibold text-slate-700">
                          {r.dureePresence === 'TROIS_JOURS' ? (
                            <span className="text-emerald-900 font-bold">3 jours</span>
                          ) : r.dureePresence === 'WEEK_END' ? (
                            <span className="text-teal-900 font-bold">Week-end</span>
                          ) : (
                            <span className="text-slate-400">-</span>
                          )}
                        </td>

                        {/* Aide organisation */}
                        <td className="px-4 py-3">
                          {r.aideOrganisation ? (
                            <div className="space-y-1">
                              <span className="text-[10px] font-extrabold text-teal-800 bg-teal-50 px-2 py-0.5 rounded-full border border-teal-200">
                                🤝 Volontaire
                              </span>
                              {r.domainesAide && r.domainesAide.length > 0 && (
                                <div className="flex flex-wrap gap-1 max-w-xs">
                                  {r.domainesAide.map(d => (
                                    <span key={d} className="text-[9px] bg-slate-100 text-slate-700 px-1.5 py-0.2 rounded font-medium">
                                      {d}
                                    </span>
                                  ))}
                                </div>
                              )}
                              {r.autrePrecision && (
                                <div className="text-[10px] text-slate-500 italic">
                                  "{r.autrePrecision}"
                                </div>
                              )}
                            </div>
                          ) : (
                            <span className="text-slate-400 text-[11px]">Non</span>
                          )}
                        </td>

                        {/* Actions */}
                        <td className="px-4 py-3 text-right">
                          <button
                            onClick={() => handleDeleteResponse(r.id, `${r.prenom} ${r.nom}`)}
                            className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition cursor-pointer"
                            title="Supprimer la réponse"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </td>

                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>

        </div>
      )}

      {/* ========================================================= */}
      {/* 3. SUBTAB : ORGANISATION DES BÉNÉVOLES */}
      {/* ========================================================= */}
      {activeSubTab === 'organisation' && (
        <div className="space-y-6">
          
          <div className="bg-white p-5 rounded-3xl border border-emerald-100 shadow-2xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
            <div>
              <h3 className="text-base font-black text-slate-900 font-['Outfit',sans-serif]">
                Pôles & Équipes d'organisation bénévoles
              </h3>
              <p className="text-xs text-slate-500">
                Membres ayant exprimé leur souhait d'aider à la préparation et au déroulement de la {currentRencontre.nom}.
              </p>
            </div>
            <span className="text-xs font-extrabold text-emerald-800 bg-emerald-50 px-3 py-1 rounded-full border border-emerald-200">
              {stats.aideCount} bénévoles mobilisés
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            
            {[
              { id: 'Logistique', title: 'Logistique & Flux', icon: PackageCheck, color: 'emerald' },
              { id: 'Transport', title: 'Transport & Covoiturage', icon: Truck, color: 'blue' },
              { id: 'Installation / rangement', title: 'Installation & Rangement', icon: Wrench, color: 'amber' },
              { id: 'Cuisine / repas', title: 'Cuisine & Restauration', icon: Utensils, color: 'rose' },
              { id: 'Accueil', title: 'Accueil & Émargement', icon: UserCheck, color: 'purple' },
              { id: 'Communication', title: 'Communication & Médias', icon: Megaphone, color: 'teal' },
              { id: 'Autre', title: 'Autres compétences', icon: HeartHandshake, color: 'slate' },
            ].map((pole) => {
              const Icon = pole.icon;
              const volunteers = stats.domaineMap[pole.id] || [];

              return (
                <div key={pole.id} className="bg-white rounded-3xl p-5 border border-slate-200 shadow-2xs flex flex-col justify-between">
                  <div>
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-xl bg-emerald-50 text-emerald-800 flex items-center justify-center font-bold">
                          <Icon className="w-4 h-4" />
                        </div>
                        <h4 className="font-extrabold text-slate-900 text-xs">{pole.title}</h4>
                      </div>
                      <span className="text-xs font-black text-slate-700 bg-slate-100 px-2 py-0.5 rounded-full">
                        {volunteers.length}
                      </span>
                    </div>

                    <div className="space-y-2 mt-3 divide-y divide-slate-100 text-xs">
                      {volunteers.length === 0 ? (
                        <p className="text-[11px] text-slate-400 italic py-2">
                          Aucun bénévole pour l'instant dans ce pôle.
                        </p>
                      ) : (
                        volunteers.map((v) => (
                          <div key={v.id} className="pt-2">
                            <div className="flex justify-between font-bold text-slate-800">
                              <span>{v.prenom} {v.nom}</span>
                              <span className="text-[10px] text-slate-500">{v.zone}</span>
                            </div>
                            <div className="text-[11px] text-slate-500 flex items-center gap-2">
                              <span>📞 {v.telephone || '-'}</span>
                              <span>✉️ {v.email || '-'}</span>
                            </div>
                            {v.autrePrecision && (
                              <div className="text-[10px] text-emerald-800 italic mt-0.5">
                                Précision : "{v.autrePrecision}"
                              </div>
                            )}
                          </div>
                        ))
                      )}
                    </div>
                  </div>

                  {volunteers.length > 0 && (
                    <div className="pt-3 mt-3 border-t border-slate-100 text-right">
                      <button
                        onClick={() => {
                          const emails = volunteers.map(v => v.email).filter(Boolean).join('; ');
                          navigator.clipboard.writeText(emails);
                          onShowToast(`Emails du pôle ${pole.title} copiés !`);
                        }}
                        className="text-[11px] font-bold text-emerald-800 hover:underline cursor-pointer"
                      >
                        Copier les emails ({volunteers.length})
                      </button>
                    </div>
                  )}
                </div>
              );
            })}

          </div>

        </div>
      )}

      {/* ========================================================= */}
      {/* 4. SUBTAB : GESTION DES RENCONTRES (CYCLE DE VIE) */}
      {/* ========================================================= */}
      {activeSubTab === 'rencontres' && (
        <div className="space-y-4">
          
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-extrabold text-slate-900 uppercase tracking-wider">
              Historique & Programmation des rencontres MDF
            </h3>
            {userRole === 'admin' && (
              <button
                onClick={() => {
                  setRencontreToEdit(null);
                  setIsFormModalOpen(true);
                }}
                className="px-3.5 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold transition flex items-center gap-1.5 shadow-sm cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Créer une rencontre</span>
              </button>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {rencontres.map((r) => {
              const isSelected = r.id === currentRencontre.id;
              const rResponses = RencontreService.getResponses(r.id);
              const rParticipants = rResponses.filter(resp => resp.participation === 'OUI').length;

              return (
                <div
                  key={r.id}
                  className={`bg-white rounded-3xl p-5 border transition shadow-2xs relative ${
                    isSelected ? 'border-emerald-500 ring-2 ring-emerald-500/20' : 'border-slate-200'
                  }`}
                >
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-[10px] font-bold bg-slate-100 text-slate-700 px-2 py-0.5 rounded-full">
                          Édition {r.annee}
                        </span>
                        <span className={`text-[10px] font-black px-2 py-0.5 rounded-full uppercase ${
                          r.statut === 'SONDAGE_OUVERT' ? 'bg-emerald-600 text-white' : 'bg-slate-600 text-white'
                        }`}>
                          {r.statut}
                        </span>
                      </div>
                      <h4 className="text-base font-black text-slate-900">{r.nom}</h4>
                    </div>

                    {r.isDefault && (
                      <span className="text-[10px] font-bold bg-emerald-50 text-emerald-800 border border-emerald-200 px-2 py-0.5 rounded-full">
                        ⭐ Active par défaut
                      </span>
                    )}
                  </div>

                  <p className="text-xs text-slate-600 mb-3">
                    📍 {r.lieu} ({r.adresse}) • 📅 {r.dateAffichage || `${r.dateDebut} au ${r.dateFin}`}
                  </p>

                  <div className="grid grid-cols-2 gap-2 p-3 bg-slate-50 rounded-2xl text-xs mb-4">
                    <div>
                      <span className="text-slate-400 text-[10px] block">Réponses</span>
                      <strong className="text-slate-900">{rResponses.length}</strong>
                    </div>
                    <div>
                      <span className="text-slate-400 text-[10px] block">Participants (Oui)</span>
                      <strong className="text-emerald-800">{rParticipants}</strong>
                    </div>
                  </div>

                  <div className="flex items-center justify-between gap-2 pt-2 border-t border-slate-100 text-xs">
                    <button
                      onClick={() => {
                        setSelectedRencontreId(r.id);
                        setActiveSubTab('dashboard');
                      }}
                      className={`px-3 py-1.5 rounded-xl font-bold transition cursor-pointer ${
                        isSelected ? 'bg-emerald-800 text-white' : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
                      }`}
                    >
                      {isSelected ? '✓ Rencontre active' : 'Sélectionner'}
                    </button>

                    {userRole === 'admin' && (
                      <div className="flex items-center gap-1.5">
                        <button
                          onClick={() => {
                            setRencontreToEdit(r);
                            setIsFormModalOpen(true);
                          }}
                          className="p-1.5 text-slate-500 hover:text-slate-900 rounded-lg hover:bg-slate-100 transition cursor-pointer"
                          title="Modifier"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        {rencontres.length > 1 && (
                          <button
                            onClick={() => handleDeleteRencontre(r.id, r.nom)}
                            className="p-1.5 text-slate-400 hover:text-rose-600 rounded-lg hover:bg-rose-50 transition cursor-pointer"
                            title="Supprimer"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>

        </div>
      )}

      {/* ========================================================= */}
      {/* 5. SUBTAB : EXPORT & PARTAGE */}
      {/* ========================================================= */}
      {activeSubTab === 'export' && (
        <div className="space-y-6 max-w-3xl">
          
          {/* Excel / CSV Box */}
          <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-2xs space-y-4">
            <h3 className="text-base font-black text-slate-900 font-['Outfit',sans-serif] flex items-center gap-2">
              <FileSpreadsheet className="w-5 h-5 text-emerald-700" />
              <span>Export des données des participants</span>
            </h3>
            <p className="text-xs text-slate-500">
              Téléchargez la liste intégrale des réponses du sondage pour la {currentRencontre.nom} incluant coordonnées, présences, logistique et bénévolat.
            </p>

            <div className="flex flex-wrap gap-3 pt-2">
              <button
                onClick={handleExportExcel}
                className="py-3 px-5 bg-emerald-800 hover:bg-emerald-900 text-white rounded-2xl text-xs font-bold transition flex items-center gap-2 shadow-sm cursor-pointer"
              >
                <FileSpreadsheet className="w-4 h-4" />
                <span>Exporter au format Excel (.xlsx)</span>
              </button>

              <button
                onClick={handleExportCsv}
                className="py-3 px-5 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-2xl text-xs font-bold transition flex items-center gap-2 cursor-pointer"
              >
                <Download className="w-4 h-4" />
                <span>Exporter au format CSV (.csv)</span>
              </button>
            </div>
          </div>

          {/* Invitation Message Template Box */}
          <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-2xs space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-base font-black text-slate-900 font-['Outfit',sans-serif] flex items-center gap-2">
                <Share2 className="w-5 h-5 text-teal-700" />
                <span>Modèle de message d'invitation (WhatsApp / Mail)</span>
              </h3>
              <button
                onClick={handleCopyInvitationMessage}
                className="px-3 py-1.5 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold transition flex items-center gap-1.5 cursor-pointer"
              >
                {copiedMessage ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copiedMessage ? 'Message copié' : 'Copier le message'}</span>
              </button>
            </div>

            <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 text-xs font-mono whitespace-pre-line text-slate-700 leading-relaxed">
              {invitationMessage}
            </div>
          </div>

        </div>
      )}

      {/* Form Modal */}
      {isFormModalOpen && (
        <RencontreFormModal
          rencontre={rencontreToEdit}
          isOpen={isFormModalOpen}
          onClose={() => setIsFormModalOpen(false)}
          onSave={handleSaveRencontre}
        />
      )}

      {/* QR Code Modal */}
      {isQrModalOpen && (
        <RencontreQrModal
          rencontre={currentRencontre}
          onClose={() => setIsQrModalOpen(false)}
        />
      )}

    </div>
  );
};

export default RencontresView;
