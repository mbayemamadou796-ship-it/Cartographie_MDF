import React, { useState, useMemo, useEffect } from 'react';
import { 
  Mandat, 
  MandatRealisation, 
  MandatDocument, 
  MandatStatus, 
  RealisationCategory, 
  RealisationStatus, 
  UserRole,
  AppUser
} from '../../types';
import { MandatService } from '../../services/mandatService';
import { 
  Landmark, 
  Calendar, 
  Users, 
  CheckCircle2, 
  Clock, 
  Archive, 
  Plus, 
  FileText, 
  FileCheck, 
  AlertCircle, 
  Download, 
  Search, 
  Filter, 
  Edit3, 
  Trash2, 
  ChevronRight, 
  Sparkles, 
  FolderArchive,
  Award,
  ArrowRight,
  TrendingUp,
  FileSpreadsheet,
  Layers,
  ShieldCheck,
  Eye,
  Paperclip,
  CheckCircle
} from 'lucide-react';
import { MandatFormModal } from './MandatFormModal';
import { RealisationFormModal } from './RealisationFormModal';
import { MandatBilanModal } from './MandatBilanModal';
import { MandatDocModal } from './MandatDocModal';

interface MandatsViewProps {
  userRole: UserRole;
  users?: AppUser[];
  onShowToast?: (msg: string) => void;
  onLogAudit?: (category: any, action: string, details: string, severity?: any) => void;
}

export const MandatsView: React.FC<MandatsViewProps> = ({
  userRole,
  users = [],
  onShowToast = (_msg: string) => {},
  onLogAudit = (_category: any, _action: string, _details: string, _severity?: any) => {}
}) => {
  const [mandats, setMandats] = useState<Mandat[]>(() => MandatService.getMandats());

  // Synchronisation : recharge quand la liste change ailleurs (autre onglet,
  // rafraîchissement serveur Supabase via mbok_mandats_updated).
  useEffect(() => {
    const handleSync = () => setMandats(MandatService.getMandats());
    window.addEventListener('mbok_mandats_updated', handleSync);
    window.addEventListener('storage', handleSync);
    return () => {
      window.removeEventListener('mbok_mandats_updated', handleSync);
      window.removeEventListener('storage', handleSync);
    };
  }, []);
  const [selectedMandatId, setSelectedMandatId] = useState<string>(() => {
    const list = MandatService.getMandats();
    const active = list.find((m) => m.statut === 'EN_COURS');
    return active ? active.id : (list[0]?.id || '');
  });

  const [activeSubTab, setActiveSubTab] = useState<'realisations' | 'documents' | 'bilan' | 'gouvernance'>('realisations');
  
  // Realisation Filters
  const [realisationCategoryFilter, setRealisationCategoryFilter] = useState<string>('ALL');
  const [realisationStatusFilter, setRealisationStatusFilter] = useState<string>('ALL');
  const [realisationSearch, setRealisationSearch] = useState<string>('');

  // Modals state
  const [isMandatModalOpen, setIsMandatModalOpen] = useState(false);
  const [mandatToEdit, setMandatToEdit] = useState<Mandat | null>(null);

  const [isRealisationModalOpen, setIsRealisationModalOpen] = useState(false);
  const [realisationToEdit, setRealisationToEdit] = useState<MandatRealisation | null>(null);

  const [isBilanModalOpen, setIsBilanModalOpen] = useState(false);
  const [isDocModalOpen, setIsDocModalOpen] = useState(false);
  const [selectedRealisationForDoc, setSelectedRealisationForDoc] = useState<MandatRealisation | null>(null);

  // Sync with service updates
  const reloadMandats = () => {
    const list = MandatService.getMandats();
    setMandats(list);
  };

  const currentMandat = useMemo(() => {
    return mandats.find((m) => m.id === selectedMandatId) || mandats[0];
  }, [mandats, selectedMandatId]);

  // Realisations filtering
  const filteredRealisations = useMemo(() => {
    if (!currentMandat || !currentMandat.realisations) return [];
    return currentMandat.realisations.filter((r) => {
      if (realisationCategoryFilter !== 'ALL' && r.categorie !== realisationCategoryFilter) {
        return false;
      }
      if (realisationStatusFilter !== 'ALL' && r.statut !== realisationStatusFilter) {
        return false;
      }
      if (realisationSearch.trim()) {
        const q = realisationSearch.toLowerCase();
        const matchTitle = r.titre.toLowerCase().includes(q);
        const matchDesc = r.description.toLowerCase().includes(q);
        const matchResp = r.responsable.toLowerCase().includes(q);
        if (!matchTitle && !matchDesc && !matchResp) return false;
      }
      return true;
    });
  }, [currentMandat, realisationCategoryFilter, realisationStatusFilter, realisationSearch]);

  // Handlers for Mandats
  const handleSaveMandat = (mandatData: Omit<Mandat, 'id' | 'createdAt' | 'realisations' | 'documents'> & { id?: string }) => {
    if (mandatData.id) {
      const updated = MandatService.updateMandat(mandatData.id, mandatData);
      setMandats(updated);
      onShowToast(`Mandat "${mandatData.intitule}" mis à jour avec succès.`);
      onLogAudit('system', 'Mise à jour mandat', `Modification du mandat ${mandatData.intitule}`);
    } else {
      const created = MandatService.createMandat(mandatData);
      const updated = MandatService.getMandats();
      setMandats(updated);
      setSelectedMandatId(created.id);
      onShowToast(`Nouveau mandat "${created.intitule}" créé.`);
      onLogAudit('system', 'Création mandat', `Création du mandat ${created.intitule}`);
    }
    setIsMandatModalOpen(false);
    setMandatToEdit(null);
  };

  const handleDeleteMandat = (id: string, intitule: string) => {
    if (confirm(`Êtes-vous certain de vouloir supprimer le mandat "${intitule}" et l'ensemble de ses réalisations ?`)) {
      const updated = MandatService.deleteMandat(id);
      setMandats(updated);
      if (selectedMandatId === id) {
        setSelectedMandatId(updated[0]?.id || '');
      }
      onShowToast(`Mandat "${intitule}" supprimé.`);
      onLogAudit('system', 'Suppression mandat', `Suppression du mandat ${intitule}`, 'warning');
    }
  };

  // Handlers for Realisations
  const handleSaveRealisation = (realData: Omit<MandatRealisation, 'id' | 'mandatId' | 'createdAt'> & { id?: string }) => {
    if (!currentMandat) return;
    if (realData.id) {
      const updated = MandatService.updateRealisation(currentMandat.id, realData.id, realData);
      setMandats(updated);
      onShowToast(`Réalisation "${realData.titre}" mise à jour.`);
    } else {
      const updated = MandatService.addRealisation(currentMandat.id, realData);
      setMandats(updated);
      onShowToast(`Nouvelle réalisation "${realData.titre}" ajoutée au mandat.`);
    }
    setIsRealisationModalOpen(false);
    setRealisationToEdit(null);
  };

  const handleDeleteRealisation = (realId: string, titre: string) => {
    if (!currentMandat) return;
    if (confirm(`Supprimer la réalisation "${titre}" ?`)) {
      const updated = MandatService.deleteRealisation(currentMandat.id, realId);
      setMandats(updated);
      onShowToast('Réalisation supprimée.');
    }
  };

  const handleUpdateRealisationStatus = (realId: string, newStatus: RealisationStatus) => {
    if (!currentMandat) return;
    const updated = MandatService.updateRealisation(currentMandat.id, realId, { statut: newStatus });
    setMandats(updated);
    onShowToast(`Statut mis à jour : ${getStatusLabel(newStatus)}`);
  };

  // Handlers for Mandat Documents
  const handleAddMandatDoc = (doc: Omit<MandatDocument, 'id' | 'dateAjout'>) => {
    if (!currentMandat) return;
    const updated = MandatService.addDocumentToMandat(currentMandat.id, doc);
    setMandats(updated);
    onShowToast(`Document "${doc.name}" joint au mandat.`);
    setIsDocModalOpen(false);
  };

  const handleDeleteMandatDoc = (docId: string, name: string) => {
    if (!currentMandat) return;
    if (confirm(`Retirer le document "${name}" du mandat ?`)) {
      const updated = MandatService.deleteDocumentFromMandat(currentMandat.id, docId);
      setMandats(updated);
      onShowToast('Document retiré.');
    }
  };

  // Status Helpers
  const getStatusBadge = (status: MandatStatus) => {
    switch (status) {
      case 'EN_COURS':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800 border border-emerald-300">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
            En cours (Actif)
          </span>
        );
      case 'ARCHIVE':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-slate-100 text-slate-700 border border-slate-300">
            <Archive className="w-3.5 h-3.5 text-slate-500" />
            Archivé
          </span>
        );
      case 'TERMINE':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-blue-100 text-blue-800 border border-blue-300">
            <CheckCircle2 className="w-3.5 h-3.5 text-blue-600" />
            Terminé
          </span>
        );
      case 'EN_PREPARATION':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-amber-100 text-amber-800 border border-amber-300">
            <Clock className="w-3.5 h-3.5 text-amber-600" />
            En préparation
          </span>
        );
      default:
        return null;
    }
  };

  const getRealisationStatusBadge = (status: RealisationStatus) => {
    switch (status) {
      case 'TERMINE':
        return <span className="px-2.5 py-1 rounded-lg text-xs font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">Terminé</span>;
      case 'EN_COURS':
        return <span className="px-2.5 py-1 rounded-lg text-xs font-bold bg-amber-50 text-amber-700 border border-amber-200">En cours</span>;
      case 'A_FAIRE':
        return <span className="px-2.5 py-1 rounded-lg text-xs font-bold bg-blue-50 text-blue-700 border border-blue-200">À faire</span>;
      case 'ARCHIVE':
        return <span className="px-2.5 py-1 rounded-lg text-xs font-bold bg-slate-100 text-slate-600 border border-slate-200">Archivé</span>;
    }
  };

  const getStatusLabel = (status: RealisationStatus) => {
    switch (status) {
      case 'A_FAIRE': return 'À faire';
      case 'EN_COURS': return 'En cours';
      case 'TERMINE': return 'Terminé';
      case 'ARCHIVE': return 'Archivé';
    }
  };

  const getCategoryBadge = (cat: RealisationCategory) => {
    const map: Record<RealisationCategory, { label: string; color: string }> = {
      EVENEMENTS: { label: 'Événements', color: 'bg-purple-50 text-purple-700 border-purple-200' },
      ACTIONS_SOCIALES: { label: 'Actions sociales', color: 'bg-rose-50 text-rose-700 border-rose-200' },
      COMMUNICATION: { label: 'Communication', color: 'bg-sky-50 text-sky-700 border-sky-200' },
      ORGANISATION: { label: 'Organisation', color: 'bg-slate-100 text-slate-700 border-slate-200' },
      PARTENARIATS: { label: 'Partenariats', color: 'bg-indigo-50 text-indigo-700 border-indigo-200' },
      PROJETS_NUMERIQUES: { label: 'Projets numériques', color: 'bg-emerald-50 text-emerald-700 border-emerald-200' },
      FORMATION: { label: 'Formation', color: 'bg-amber-50 text-amber-700 border-amber-200' },
      VIE_ASSOCIATIVE: { label: 'Vie associative', color: 'bg-teal-50 text-teal-700 border-teal-200' },
      AUTRE: { label: 'Autre', color: 'bg-gray-100 text-gray-700 border-gray-200' }
    };
    const item = map[cat] || { label: cat, color: 'bg-gray-100 text-gray-700 border-gray-200' };
    return (
      <span className={`px-2 py-0.5 rounded-md text-[11px] font-semibold border ${item.color}`}>
        {item.label}
      </span>
    );
  };

  // Stats calculation
  const totalRealisations = currentMandat?.realisations?.length || 0;
  const termineesCount = currentMandat?.realisations?.filter((r) => r.statut === 'TERMINE').length || 0;
  const enCoursCount = currentMandat?.realisations?.filter((r) => r.statut === 'EN_COURS').length || 0;
  const aFaireCount = currentMandat?.realisations?.filter((r) => r.statut === 'A_FAIRE').length || 0;
  const completionRate = totalRealisations > 0 ? Math.round((termineesCount / totalRealisations) * 100) : 0;

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-emerald-900 via-emerald-800 to-teal-900 rounded-3xl p-6 sm:p-8 text-white shadow-lg relative overflow-hidden">
        <div className="absolute right-0 top-0 translate-x-10 -translate-y-10 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none"></div>
        
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 relative z-10">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/20 border border-emerald-400/30 text-emerald-300 text-xs font-semibold mb-3">
              <FolderArchive className="w-3.5 h-3.5" />
              <span>Mémoire Numérique & Gouvernance MDF</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
              Archives & Réalisations des Mandats
            </h1>
            <p className="text-emerald-100/90 text-sm mt-1 max-w-2xl">
              Conservez l'historique exhaustif des mandats successifs de l'association, suivez le cycle des réalisations et transmettez les bilans au mandat suivant.
            </p>
          </div>

          {userRole === 'admin' && (
            <div className="flex flex-wrap items-center gap-3">
              <button
                onClick={() => {
                  setMandatToEdit(null);
                  setIsMandatModalOpen(true);
                }}
                className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-[#2be39d] to-[#8de02d] text-emerald-950 text-xs font-bold shadow-md hover:shadow-lg transition-all active:scale-95"
              >
                <Plus className="w-4 h-4" />
                Nouveau Mandat
              </button>
            </div>
          )}
        </div>

        {/* Mandat Selectors Strip */}
        <div className="mt-8 pt-6 border-t border-emerald-700/50 flex flex-wrap items-center gap-3">
          <span className="text-xs text-emerald-200 font-semibold uppercase tracking-wider">Mandats enregistrés :</span>
          <div className="flex flex-wrap items-center gap-2">
            {mandats.map((m) => {
              const isSelected = m.id === selectedMandatId;
              return (
                <button
                  key={m.id}
                  onClick={() => setSelectedMandatId(m.id)}
                  className={`inline-flex items-center gap-2 px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all ${
                    isSelected
                      ? 'bg-white text-emerald-950 shadow-md ring-2 ring-emerald-400'
                      : 'bg-emerald-800/60 text-emerald-100 hover:bg-emerald-700/70 border border-emerald-600/50'
                  }`}
                >
                  <Landmark className="w-3.5 h-3.5" />
                  <span>{m.intitule}</span>
                  {m.statut === 'ARCHIVE' && (
                    <span className="text-[10px] px-1.5 py-0.2 rounded bg-slate-700 text-slate-200">Archivé</span>
                  )}
                  {m.statut === 'EN_COURS' && (
                    <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
                  )}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {currentMandat && (
        <>
          {/* Active Mandat Banner & Meta Information */}
          <div className="bg-white rounded-2xl p-6 border border-emerald-200 shadow-xs">
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-6 border-b border-emerald-100">
              <div>
                <div className="flex flex-wrap items-center gap-3 mb-2">
                  <h2 className="text-xl font-bold text-slate-900">{currentMandat.intitule}</h2>
                  {getStatusBadge(currentMandat.statut)}
                </div>
                <div className="flex flex-wrap items-center gap-4 text-xs text-slate-600">
                  <div className="flex items-center gap-1.5">
                    <Calendar className="w-4 h-4 text-emerald-600" />
                    <span>Période : <strong>{currentMandat.dateDebut}</strong> au <strong>{currentMandat.dateFin}</strong></span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <Layers className="w-4 h-4 text-emerald-600" />
                    <span>{currentMandat.realisations?.length || 0} réalisation(s)</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <FileText className="w-4 h-4 text-emerald-600" />
                    <span>{currentMandat.documents?.length || 0} document(s)</span>
                  </div>
                </div>
              </div>

              {userRole === 'admin' && (
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => {
                      setMandatToEdit(currentMandat);
                      setIsMandatModalOpen(true);
                    }}
                    className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold bg-emerald-50 text-emerald-800 hover:bg-emerald-100 border border-emerald-200 transition-colors"
                  >
                    <Edit3 className="w-3.5 h-3.5" />
                    Modifier Mandat
                  </button>
                  <button
                    onClick={() => handleDeleteMandat(currentMandat.id, currentMandat.intitule)}
                    className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold bg-rose-50 text-rose-700 hover:bg-rose-100 border border-rose-200 transition-colors"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    Supprimer
                  </button>
                </div>
              )}
            </div>

            {/* Description and Responsables */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-6">
              <div className="lg:col-span-2">
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-1">Vision & Description du Mandat</h4>
                <p className="text-sm text-slate-700 leading-relaxed bg-slate-50 p-3.5 rounded-xl border border-slate-200">
                  {currentMandat.description || "Aucune description détaillée renseignée."}
                </p>
              </div>

              <div>
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-1">Bureau & Responsables</h4>
                <div className="bg-emerald-50/50 p-3.5 rounded-xl border border-emerald-200/80 space-y-1.5">
                  {currentMandat.responsables && currentMandat.responsables.length > 0 ? (
                    currentMandat.responsables.map((resp, idx) => (
                      <div key={idx} className="flex items-center gap-2 text-xs font-medium text-slate-800">
                        <Users className="w-3.5 h-3.5 text-emerald-700 shrink-0" />
                        <span>{resp}</span>
                      </div>
                    ))
                  ) : (
                    <span className="text-xs text-slate-500 italic">Aucun responsable listé.</span>
                  )}
                </div>
              </div>
            </div>

            {/* Mandat Mini KPI Bar - Interactive Filters */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-6 pt-6 border-t border-emerald-100">
              <button
                type="button"
                onClick={() => {
                  setActiveSubTab('realisations');
                  setRealisationStatusFilter('ALL');
                }}
                className={`p-3 rounded-2xl border text-left transition-all cursor-pointer ${
                  activeSubTab === 'realisations' && realisationStatusFilter === 'ALL'
                    ? 'bg-slate-900 text-white border-slate-900 shadow-md ring-2 ring-emerald-500'
                    : 'bg-slate-50 hover:bg-slate-100 text-slate-900 border-slate-200'
                }`}
                title="Cliquer pour afficher toutes les réalisations"
              >
                <span className={`text-[11px] font-semibold block ${
                  activeSubTab === 'realisations' && realisationStatusFilter === 'ALL' ? 'text-slate-300' : 'text-slate-500'
                }`}>
                  Total Réalisations
                </span>
                <span className="text-xl font-black">{totalRealisations}</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  setActiveSubTab('realisations');
                  setRealisationStatusFilter('TERMINE');
                }}
                className={`p-3 rounded-2xl border text-left transition-all cursor-pointer ${
                  activeSubTab === 'realisations' && realisationStatusFilter === 'TERMINE'
                    ? 'bg-emerald-800 text-white border-emerald-700 shadow-md ring-2 ring-emerald-400'
                    : 'bg-emerald-50 hover:bg-emerald-100 text-emerald-950 border-emerald-200'
                }`}
                title="Cliquer pour filtrer les réalisations terminées"
              >
                <span className={`text-[11px] font-semibold block ${
                  activeSubTab === 'realisations' && realisationStatusFilter === 'TERMINE' ? 'text-emerald-200' : 'text-emerald-700'
                }`}>
                  Terminées ({completionRate}%)
                </span>
                <span className="text-xl font-black">{termineesCount}</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  setActiveSubTab('realisations');
                  setRealisationStatusFilter('EN_COURS');
                }}
                className={`p-3 rounded-2xl border text-left transition-all cursor-pointer ${
                  activeSubTab === 'realisations' && realisationStatusFilter === 'EN_COURS'
                    ? 'bg-amber-700 text-white border-amber-600 shadow-md ring-2 ring-amber-400'
                    : 'bg-amber-50 hover:bg-amber-100 text-amber-950 border-amber-200'
                }`}
                title="Cliquer pour filtrer les réalisations en cours"
              >
                <span className={`text-[11px] font-semibold block ${
                  activeSubTab === 'realisations' && realisationStatusFilter === 'EN_COURS' ? 'text-amber-200' : 'text-amber-700'
                }`}>
                  En cours
                </span>
                <span className="text-xl font-black">{enCoursCount}</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  setActiveSubTab('realisations');
                  setRealisationStatusFilter('A_FAIRE');
                }}
                className={`p-3 rounded-2xl border text-left transition-all cursor-pointer ${
                  activeSubTab === 'realisations' && realisationStatusFilter === 'A_FAIRE'
                    ? 'bg-blue-700 text-white border-blue-600 shadow-md ring-2 ring-blue-400'
                    : 'bg-blue-50 hover:bg-blue-100 text-blue-950 border-blue-200'
                }`}
                title="Cliquer pour filtrer les réalisations à faire"
              >
                <span className={`text-[11px] font-semibold block ${
                  activeSubTab === 'realisations' && realisationStatusFilter === 'A_FAIRE' ? 'text-blue-200' : 'text-blue-700'
                }`}>
                  À faire
                </span>
                <span className="text-xl font-black">{aFaireCount}</span>
              </button>
            </div>
          </div>

          {/* Sub Navigation Tabs */}
          <div className="flex items-center gap-2 border-b border-emerald-200 pb-2 overflow-x-auto no-scrollbar">
            <button
              onClick={() => setActiveSubTab('realisations')}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
                activeSubTab === 'realisations'
                  ? 'bg-emerald-800 text-white shadow-sm'
                  : 'bg-white text-slate-700 hover:bg-emerald-50 border border-emerald-200'
              }`}
            >
              <Award className="w-4 h-4" />
              <span>1. Réalisations & Actions ({totalRealisations})</span>
            </button>

            <button
              onClick={() => setActiveSubTab('documents')}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
                activeSubTab === 'documents'
                  ? 'bg-emerald-800 text-white shadow-sm'
                  : 'bg-white text-slate-700 hover:bg-emerald-50 border border-emerald-200'
              }`}
            >
              <FileText className="w-4 h-4" />
              <span>2. Comptes rendus & Documents ({currentMandat.documents?.length || 0})</span>
            </button>

            <button
              onClick={() => setActiveSubTab('bilan')}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
                activeSubTab === 'bilan'
                  ? 'bg-emerald-800 text-white shadow-sm'
                  : 'bg-white text-slate-700 hover:bg-emerald-50 border border-emerald-200'
              }`}
            >
              <FileCheck className="w-4 h-4" />
              <span>3. Bilan de fin de mandat</span>
              {currentMandat.bilan?.dateBilan && (
                <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
              )}
            </button>
          </div>

          {/* SUBTAB 1: RÉALISATIONS */}
          {activeSubTab === 'realisations' && (
            <div className="space-y-4">
              {/* Filter & Action Toolbar */}
              <div className="bg-white p-4 rounded-2xl border border-emerald-200 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="flex flex-wrap items-center gap-3 flex-1">
                  {/* Search */}
                  <div className="relative min-w-[200px] flex-1 max-w-sm">
                    <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                    <input
                      type="text"
                      placeholder="Rechercher une réalisation..."
                      value={realisationSearch}
                      onChange={(e) => setRealisationSearch(e.target.value)}
                      className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs focus:ring-2 focus:ring-emerald-500 focus:bg-white outline-hidden"
                    />
                  </div>

                  {/* Category Filter */}
                  <select
                    value={realisationCategoryFilter}
                    onChange={(e) => setRealisationCategoryFilter(e.target.value)}
                    className="px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs font-medium text-slate-700 outline-hidden"
                  >
                    <option value="ALL">Toutes les catégories</option>
                    <option value="EVENEMENTS">Événements</option>
                    <option value="ACTIONS_SOCIALES">Actions sociales</option>
                    <option value="COMMUNICATION">Communication</option>
                    <option value="ORGANISATION">Organisation</option>
                    <option value="PARTENARIATS">Partenariats</option>
                    <option value="PROJETS_NUMERIQUES">Projets numériques</option>
                    <option value="FORMATION">Formation</option>
                    <option value="VIE_ASSOCIATIVE">Vie associative</option>
                    <option value="AUTRE">Autre</option>
                  </select>

                  {/* Status Filter */}
                  <select
                    value={realisationStatusFilter}
                    onChange={(e) => setRealisationStatusFilter(e.target.value)}
                    className="px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs font-medium text-slate-700 outline-hidden"
                  >
                    <option value="ALL">Tous les statuts</option>
                    <option value="A_FAIRE">À faire</option>
                    <option value="EN_COURS">En cours</option>
                    <option value="TERMINE">Terminé</option>
                    <option value="ARCHIVE">Archivé</option>
                  </select>
                </div>

                {userRole === 'admin' && (
                  <button
                    onClick={() => {
                      setRealisationToEdit(null);
                      setIsRealisationModalOpen(true);
                    }}
                    className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl bg-emerald-800 text-white text-xs font-bold hover:bg-emerald-900 transition-colors shadow-xs"
                  >
                    <Plus className="w-4 h-4" />
                    Ajouter une Réalisation
                  </button>
                )}
              </div>

              {/* Realisations Cards List */}
              {filteredRealisations.length === 0 ? (
                <div className="bg-white rounded-2xl p-12 text-center border border-dashed border-slate-300">
                  <Award className="w-12 h-12 text-slate-400 mx-auto mb-3" />
                  <h3 className="text-base font-bold text-slate-800">Aucune réalisation trouvée</h3>
                  <p className="text-xs text-slate-500 mt-1">
                    {realisationSearch || realisationCategoryFilter !== 'ALL' || realisationStatusFilter !== 'ALL'
                      ? 'Aucun élément ne correspond à vos filtres.'
                      : 'Commencez par ajouter les réalisations majeures de ce mandat.'}
                  </p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {filteredRealisations.map((real) => (
                    <div
                      key={real.id}
                      className="bg-white rounded-2xl p-5 border border-emerald-200 shadow-xs hover:border-emerald-400 transition-all flex flex-col justify-between"
                    >
                      <div>
                        <div className="flex items-start justify-between gap-3 mb-2">
                          <div className="flex flex-wrap items-center gap-2">
                            {getCategoryBadge(real.categorie)}
                            {getRealisationStatusBadge(real.statut)}
                          </div>
                          <span className="text-[11px] text-slate-500 font-medium whitespace-nowrap">
                            {real.date}
                          </span>
                        </div>

                        <h3 className="text-sm font-bold text-slate-900 mb-1.5">{real.titre}</h3>
                        <p className="text-xs text-slate-600 leading-relaxed line-clamp-3 mb-3">
                          {real.description}
                        </p>

                        {real.indicateurs && (
                          <div className="bg-emerald-50/60 p-2.5 rounded-xl border border-emerald-200/70 text-xs text-emerald-900 mb-3 flex items-start gap-2">
                            <TrendingUp className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                            <div>
                              <strong className="font-semibold">Résultats & Indicateurs : </strong>
                              {real.indicateurs}
                            </div>
                          </div>
                        )}

                        {/* Documents attached to this realisation */}
                        {real.documents && real.documents.length > 0 && (
                          <div className="space-y-1 mb-3">
                            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500">Pièces jointes :</span>
                            <div className="flex flex-wrap gap-1.5">
                              {real.documents.map((d) => (
                                <span key={d.id} className="inline-flex items-center gap-1 px-2 py-1 rounded-md text-[11px] bg-slate-100 text-slate-700 border border-slate-200">
                                  <Paperclip className="w-3 h-3 text-slate-500" />
                                  <span className="truncate max-w-[150px]">{d.name}</span>
                                </span>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>

                      {/* Footer & Actions */}
                      <div className="pt-3 border-t border-slate-100 flex items-center justify-between gap-2 mt-2">
                        <div className="flex items-center gap-1.5 text-xs text-slate-500">
                          <Users className="w-3.5 h-3.5 text-slate-400" />
                          <span>Resp: <strong className="text-slate-700">{real.responsable}</strong></span>
                        </div>

                        {userRole === 'admin' && (
                          <div className="flex items-center gap-1">
                            {/* Cycle Statut Quick Switch */}
                            <select
                              value={real.statut}
                              onChange={(e) => handleUpdateRealisationStatus(real.id, e.target.value as RealisationStatus)}
                              className="px-2 py-1 bg-slate-50 border border-slate-200 rounded-lg text-[11px] font-bold text-slate-700 outline-hidden"
                            >
                              <option value="A_FAIRE">À faire</option>
                              <option value="EN_COURS">En cours</option>
                              <option value="TERMINE">Terminé</option>
                              <option value="ARCHIVE">Archivé</option>
                            </select>

                            <button
                              onClick={() => {
                                setRealisationToEdit(real);
                                setIsRealisationModalOpen(true);
                              }}
                              className="p-1.5 rounded-lg text-slate-500 hover:bg-slate-100 transition-colors"
                              title="Modifier"
                            >
                              <Edit3 className="w-3.5 h-3.5" />
                            </button>

                            <button
                              onClick={() => handleDeleteRealisation(real.id, real.titre)}
                              className="p-1.5 rounded-lg text-rose-500 hover:bg-rose-50 transition-colors"
                              title="Supprimer"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* SUBTAB 2: DOCUMENTS & ACTES DU MANDAT */}
          {activeSubTab === 'documents' && (
            <div className="space-y-4">
              <div className="bg-white p-4 rounded-2xl border border-emerald-200 shadow-xs flex items-center justify-between gap-4">
                <div>
                  <h3 className="text-sm font-bold text-slate-900">Documents Officiels, Comptes Rendus & Bilans du Mandat</h3>
                  <p className="text-xs text-slate-500">Procès-verbaux, rapports moraux, feuilles de route et présentations d'assemblée générale.</p>
                </div>

                {userRole === 'admin' && (
                  <button
                    onClick={() => setIsDocModalOpen(true)}
                    className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl bg-emerald-800 text-white text-xs font-bold hover:bg-emerald-900 transition-colors"
                  >
                    <Plus className="w-4 h-4" />
                    Joindre un Document
                  </button>
                )}
              </div>

              {currentMandat.documents && currentMandat.documents.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {currentMandat.documents.map((doc) => (
                    <div
                      key={doc.id}
                      className="bg-white rounded-2xl p-5 border border-emerald-200 shadow-xs flex flex-col justify-between hover:border-emerald-400 transition-all"
                    >
                      <div>
                        <div className="flex items-start justify-between gap-2 mb-3">
                          <span className="px-2.5 py-1 rounded-md text-[10px] font-bold bg-emerald-50 text-emerald-800 border border-emerald-200">
                            {doc.category || 'DOCUMENT'}
                          </span>
                          <span className="text-[11px] text-slate-400 font-medium">{doc.dateAjout}</span>
                        </div>

                        <div className="flex items-start gap-3 mb-3">
                          <div className="p-2.5 rounded-xl bg-slate-100 text-slate-700 shrink-0">
                            <FileText className="w-5 h-5 text-emerald-700" />
                          </div>
                          <div>
                            <h4 className="text-xs font-bold text-slate-900 leading-snug line-clamp-2">{doc.name}</h4>
                            {doc.size && (
                              <span className="text-[11px] text-slate-500 block mt-0.5">
                                {(doc.size / (1024 * 1024)).toFixed(2)} Mo
                              </span>
                            )}
                          </div>
                        </div>

                        {doc.description && (
                          <p className="text-xs text-slate-600 bg-slate-50 p-2.5 rounded-xl border border-slate-200 mb-3 line-clamp-3">
                            {doc.description}
                          </p>
                        )}
                      </div>

                      <div className="pt-3 border-t border-slate-100 flex items-center justify-between gap-2">
                        <button
                          onClick={() => onShowToast(`Téléchargement de "${doc.name}" initié...`)}
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold bg-emerald-50 text-emerald-800 hover:bg-emerald-100 border border-emerald-200 transition-colors"
                        >
                          <Download className="w-3.5 h-3.5" />
                          Télécharger
                        </button>

                        {userRole === 'admin' && (
                          <button
                            onClick={() => handleDeleteMandatDoc(doc.id, doc.name)}
                            className="p-1.5 rounded-lg text-rose-500 hover:bg-rose-50 transition-colors"
                            title="Supprimer"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="bg-white rounded-2xl p-12 text-center border border-dashed border-slate-300">
                  <FileText className="w-12 h-12 text-slate-400 mx-auto mb-3" />
                  <h3 className="text-base font-bold text-slate-800">Aucun document joint</h3>
                  <p className="text-xs text-slate-500 mt-1">
                    Les administrateurs peuvent verser les PV, rapports et bilans au format PDF.
                  </p>
                </div>
              )}
            </div>
          )}

          {/* SUBTAB 3: BILAN DE FIN DE MANDAT */}
          {activeSubTab === 'bilan' && (
            <div className="bg-white rounded-2xl p-6 sm:p-8 border border-emerald-200 shadow-xs space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-emerald-100">
                <div>
                  <h3 className="text-lg font-bold text-slate-900">Bilan Exécutif & Transmission du Mandat</h3>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Synthèse des objectifs initiaux, résultats obtenus, difficultés et recommandations pour l'équipe suivante.
                  </p>
                </div>

                {userRole === 'admin' && (
                  <button
                    onClick={() => setIsBilanModalOpen(true)}
                    className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-emerald-800 text-white text-xs font-bold hover:bg-emerald-900 transition-colors shadow-xs"
                  >
                    <Edit3 className="w-4 h-4" />
                    Rédiger / Modifier le Bilan
                  </button>
                )}
              </div>

              {currentMandat.bilan ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Objectifs Initiaux */}
                  <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200">
                    <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-slate-700 mb-2">
                      <Layers className="w-4 h-4 text-slate-600" />
                      <span>Objectifs Initiaux du Mandat</span>
                    </div>
                    <p className="text-xs text-slate-700 whitespace-pre-line leading-relaxed">
                      {currentMandat.bilan.objectifsInitiaux || "Non spécifié"}
                    </p>
                  </div>

                  {/* Objectifs Réalisés */}
                  <div className="p-5 rounded-2xl bg-emerald-50 border border-emerald-200">
                    <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-emerald-800 mb-2">
                      <CheckCircle className="w-4 h-4 text-emerald-600" />
                      <span>Objectifs Réalisés & Victoires</span>
                    </div>
                    <p className="text-xs text-emerald-950 whitespace-pre-line leading-relaxed">
                      {currentMandat.bilan.objectifsRealises || "Non spécifié"}
                    </p>
                  </div>

                  {/* Objectifs Non Réalisés & Difficultés */}
                  <div className="p-5 rounded-2xl bg-amber-50 border border-amber-200">
                    <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-amber-800 mb-2">
                      <AlertCircle className="w-4 h-4 text-amber-600" />
                      <span>Difficultés & Objectifs Non Réalisés</span>
                    </div>
                    <p className="text-xs text-amber-950 whitespace-pre-line leading-relaxed">
                      {currentMandat.bilan.objectifsNonRealises || currentMandat.bilan.difficultes || "Non spécifié"}
                    </p>
                  </div>

                  {/* Résultats & Indicateurs Clés */}
                  <div className="p-5 rounded-2xl bg-blue-50 border border-blue-200">
                    <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-blue-800 mb-2">
                      <TrendingUp className="w-4 h-4 text-blue-600" />
                      <span>Résultats & Impact Chiffré</span>
                    </div>
                    <p className="text-xs text-blue-950 whitespace-pre-line leading-relaxed">
                      {currentMandat.bilan.resultats || "Non spécifié"}
                    </p>
                  </div>

                  {/* Recommandations pour le mandat suivant (Full width) */}
                  <div className="md:col-span-2 p-5 rounded-2xl bg-gradient-to-br from-emerald-50 via-teal-50 to-emerald-50 border border-emerald-300">
                    <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-emerald-900 mb-2">
                      <Sparkles className="w-4 h-4 text-emerald-700" />
                      <span>Recommandations Clés pour le Mandat Suivant</span>
                    </div>
                    <p className="text-xs text-emerald-950 whitespace-pre-line leading-relaxed font-medium">
                      {currentMandat.bilan.recommandationsSuivant || "Aucune recommandation formulée pour le moment."}
                    </p>
                    
                    {currentMandat.bilan.redigePar && (
                      <div className="mt-4 pt-3 border-t border-emerald-200 text-[11px] text-emerald-800 flex items-center justify-between">
                        <span>Rédigé par : <strong>{currentMandat.bilan.redigePar}</strong></span>
                        {currentMandat.bilan.dateBilan && <span>Date : {currentMandat.bilan.dateBilan}</span>}
                      </div>
                    )}
                  </div>
                </div>
              ) : (
                <div className="p-8 rounded-2xl bg-slate-50 border border-dashed border-slate-300 text-center">
                  <FileCheck className="w-10 h-10 text-slate-400 mx-auto mb-2" />
                  <h4 className="text-sm font-bold text-slate-800">Bilan non encore formalisé</h4>
                  <p className="text-xs text-slate-500 mt-1 max-w-md mx-auto">
                    Le bilan peut être rédigé à tout moment par les administrateurs pour synthétiser les résultats et préparer la passation.
                  </p>
                </div>
              )}
            </div>
          )}
        </>
      )}

      {/* MODALS */}
      {isMandatModalOpen && (
        <MandatFormModal
          isOpen={isMandatModalOpen}
          mandatToEdit={mandatToEdit}
          onClose={() => {
            setIsMandatModalOpen(false);
            setMandatToEdit(null);
          }}
          onSave={handleSaveMandat}
        />
      )}

      {isRealisationModalOpen && currentMandat && (
        <RealisationFormModal
          isOpen={isRealisationModalOpen}
          mandatId={currentMandat.id}
          realisationToEdit={realisationToEdit}
          onClose={() => {
            setIsRealisationModalOpen(false);
            setRealisationToEdit(null);
          }}
          onSave={handleSaveRealisation}
        />
      )}

      {isBilanModalOpen && currentMandat && (
        <MandatBilanModal
          isOpen={isBilanModalOpen}
          mandat={currentMandat}
          onClose={() => setIsBilanModalOpen(false)}
          onSave={(bilan) => {
            const updated = MandatService.saveBilan(currentMandat.id, bilan);
            setMandats(updated);
            setIsBilanModalOpen(false);
            onShowToast("Bilan du mandat enregistré avec succès.");
          }}
        />
      )}

      {isDocModalOpen && currentMandat && (
        <MandatDocModal
          isOpen={isDocModalOpen}
          mandatIntitule={currentMandat.intitule}
          onClose={() => setIsDocModalOpen(false)}
          onSave={handleAddMandatDoc}
        />
      )}
    </div>
  );
};
