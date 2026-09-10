import React, { useState, useMemo, useEffect } from 'react';
import { 
  UsefulDocument, 
  DocumentCategory, 
  DocumentPublishStatus, 
  UserRole, 
  AppUser 
} from '../../types';
import { 
  FileText, 
  Download, 
  Eye, 
  Plus, 
  Search, 
  Filter, 
  FolderOpen, 
  History, 
  RefreshCw, 
  Trash2, 
  Edit3, 
  Tag, 
  BookOpen, 
  ShieldCheck, 
  Sparkles, 
  FileSpreadsheet, 
  HelpCircle, 
  Folder,
  Layers,
  CheckCircle2,
  Calendar,
  Clock,
  Globe
} from 'lucide-react';
import { DocumentService } from '../../services/documentService';
import { DocumentFormModal } from './DocumentFormModal';
import { DocumentReplaceModal } from './DocumentReplaceModal';
import { DocumentPreviewModal } from './DocumentPreviewModal';
import { DocumentHistoryModal } from './DocumentHistoryModal';

interface DocumentsViewProps {
  userRole?: UserRole;
  currentUser?: AppUser | null;
  onShowToast?: (msg: string) => void;
  onLogAudit?: (category: any, action: string, details: string, severity?: any) => void;
}

export const DocumentsView: React.FC<DocumentsViewProps> = ({
  userRole = 'admin',
  currentUser,
  onShowToast = (_msg: string) => {},
  onLogAudit = (_category: any, _action: string, _details: string, _severity?: any) => {}
}) => {
  const [documents, setDocuments] = useState<UsefulDocument[]>(() => DocumentService.getDocuments());
  const [activeCategory, setActiveCategory] = useState<DocumentCategory | 'ALL'>('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTag, setSelectedTag] = useState<string | null>(null);

  // Auto-sync documents across tabs and when updated by admin/referents
  useEffect(() => {
    const handleUpdate = (e: any) => {
      if (e.detail) {
        setDocuments(e.detail);
      } else {
        setDocuments(DocumentService.getDocuments());
      }
    };
    const handleStorage = (e: StorageEvent) => {
      if (e.key === 'mbok_de_france_useful_docs_v1' && e.newValue) {
        try {
          const parsed = JSON.parse(e.newValue);
          if (Array.isArray(parsed)) setDocuments(parsed);
        } catch {}
      }
    };

    window.addEventListener('mbok_documents_updated', handleUpdate);
    window.addEventListener('storage', handleStorage);
    return () => {
      window.removeEventListener('mbok_documents_updated', handleUpdate);
      window.removeEventListener('storage', handleStorage);
    };
  }, []);

  // Modals state
  const [isFormModalOpen, setIsFormModalOpen] = useState(false);
  const [docToEdit, setDocToEdit] = useState<UsefulDocument | null>(null);

  const [isReplaceModalOpen, setIsReplaceModalOpen] = useState(false);
  const [docToReplace, setDocToReplace] = useState<UsefulDocument | null>(null);

  const [isPreviewModalOpen, setIsPreviewModalOpen] = useState(false);
  const [docToPreview, setDocToPreview] = useState<UsefulDocument | null>(null);

  const [isHistoryModalOpen, setIsHistoryModalOpen] = useState(false);
  const [docForHistory, setDocForHistory] = useState<UsefulDocument | null>(null);

  // Categories metadata
  const categoriesConfig: Record<DocumentCategory, { label: string; icon: any; color: string; desc: string }> = {
    PRESENTATION: {
      label: 'Présentation de MDF',
      icon: BookOpen,
      color: 'bg-teal-50 text-teal-800 border-teal-200',
      desc: 'Plaquettes institutionnelles, vision stratégique et présentation globale'
    },
    OFFICIELS: {
      label: 'Documents officiels',
      icon: ShieldCheck,
      color: 'bg-emerald-50 text-emerald-800 border-emerald-200',
      desc: 'Statuts loi 1901, règlement intérieur et chartes éthiques'
    },
    GUIDE_ADHERENT: {
      label: 'Guide du nouvel adhérent',
      icon: Sparkles,
      color: 'bg-amber-50 text-amber-800 border-amber-200',
      desc: 'Livret d\'accueil, kit de parrainage et accompagnement primo-arrivants'
    },
    INFOS_PRATIQUES: {
      label: 'Informations pratiques',
      icon: HelpCircle,
      color: 'bg-blue-50 text-blue-800 border-blue-200',
      desc: 'Permanences, annuaires d\'urgence et démarches administratives'
    },
    FORMULAIRES: {
      label: 'Formulaires & Modèles',
      icon: FileSpreadsheet,
      color: 'bg-purple-50 text-purple-800 border-purple-200',
      desc: 'Bulletins d\'adhésion papier, trames de réunions et dossiers d\'aide'
    },
    AUTRE: {
      label: 'Autres documents',
      icon: Folder,
      color: 'bg-slate-100 text-slate-800 border-slate-200',
      desc: 'Ressources diverses et documents complémentaires'
    }
  };

  // Filtered Documents
  const filteredDocuments = useMemo(() => {
    return documents.filter((doc) => {
      // If referent/user, only show PUBLIE
      if (userRole !== 'admin' && doc.statut !== 'PUBLIE') {
        return false;
      }

      // Category filter
      if (activeCategory !== 'ALL' && doc.category !== activeCategory) {
        return false;
      }

      // Tag filter
      if (selectedTag && (!doc.tags || !doc.tags.includes(selectedTag))) {
        return false;
      }

      // Search query
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchName = doc.name.toLowerCase().includes(q);
        const matchDesc = doc.description.toLowerCase().includes(q);
        const matchFile = doc.fileName.toLowerCase().includes(q);
        const matchContent = doc.content ? doc.content.toLowerCase().includes(q) : false;
        const matchTags = doc.tags?.some((t) => t.toLowerCase().includes(q));
        if (!matchName && !matchDesc && !matchFile && !matchTags && !matchContent) {
          return false;
        }
      }

      return true;
    });
  }, [documents, userRole, activeCategory, selectedTag, searchQuery]);

  // All unique tags
  const allTags = useMemo(() => {
    const set = new Set<string>();
    documents.forEach((d) => {
      d.tags?.forEach((t) => set.add(t));
    });
    return Array.from(set);
  }, [documents]);

  // Handlers for Admin
  const handleSaveDocument = (data: Omit<UsefulDocument, 'id' | 'datePublication' | 'dateMiseAJour'> & { id?: string }) => {
    if (data.id) {
      const updated = DocumentService.updateDocument(data.id, data);
      setDocuments(updated);
      onShowToast(`Document "${data.name}" mis à jour.`);
      onLogAudit('data', 'Modification document utile', `Mise à jour des métadonnées du document : ${data.name}`);
    } else {
      const created = DocumentService.createDocument({
        ...data,
        authorName: currentUser ? `${currentUser.prenom || ''} ${currentUser.nom || currentUser.name}`.trim() : 'Administrateur MDF'
      });
      setDocuments(DocumentService.getDocuments());
      onShowToast(`Nouveau document "${created.name}" publié.`);
      onLogAudit('data', 'Création document utile', `Publication du document : ${created.name}`);
    }
    setIsFormModalOpen(false);
    setDocToEdit(null);
  };

  const handleDeleteDocument = (id: string, name: string) => {
    if (window.confirm(`Confirmez-vous la suppression du document "${name}" ?`)) {
      const updated = DocumentService.deleteDocument(id);
      setDocuments(updated);
      onShowToast(`Document "${name}" supprimé.`);
      onLogAudit('data', 'Suppression document utile', `Suppression du document : ${name}`, 'high');
    }
  };

  const handleTogglePublish = (id: string) => {
    const updated = DocumentService.togglePublishStatus(id);
    setDocuments(updated);
    const target = updated.find((d) => d.id === id);
    onShowToast(`Statut du document : ${target?.statut === 'PUBLIE' ? 'Publié' : 'Brouillon'}`);
  };

  const handleReplaceFile = (fileData: { fileName: string; fileType: string; fileSize?: number; fileUrl?: string; newVersion: string; updateNotes?: string; content?: string }) => {
    if (!docToReplace) return;
    const updated = DocumentService.replaceDocumentFile(docToReplace.id, {
      ...fileData,
      authorName: currentUser ? `${currentUser.prenom || ''} ${currentUser.nom || currentUser.name}`.trim() : 'Administrateur MDF'
    });
    setDocuments(updated);
    onShowToast(`Fichier remplacé (Nouvelle version v${fileData.newVersion} enregistrée).`);
    onLogAudit('data', 'Remplacement fichier document', `Document ${docToReplace.name} passé à la version v${fileData.newVersion}`);
    setIsReplaceModalOpen(false);
    setDocToReplace(null);
  };

  const handleDownload = (doc: UsefulDocument) => {
    DocumentService.downloadDocument(doc);
    onShowToast(`Téléchargement de "${doc.fileName}" (v${doc.version}) démarré.`);
  };

  const getCategoryBadge = (cat: DocumentCategory) => {
    const conf = categoriesConfig[cat] || { label: cat, color: 'bg-slate-100 text-slate-800 border-slate-200' };
    return (
      <span className={`px-2.5 py-1 rounded-md text-[11px] font-bold border ${conf.color}`}>
        {conf.label}
      </span>
    );
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-emerald-900 via-emerald-800 to-teal-900 rounded-3xl p-6 sm:p-8 text-white shadow-lg relative overflow-hidden">
        <div className="absolute right-0 top-0 translate-x-10 -translate-y-10 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none"></div>
        
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 relative z-10">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/20 border border-emerald-400/30 text-emerald-300 text-xs font-semibold mb-3">
              <FolderOpen className="w-3.5 h-3.5" />
              <span>Espace Ressources, Guides & Accompagnement Adhérents</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
              Documents utiles & Guides
            </h1>
            <p className="text-emerald-100/90 text-sm mt-1 max-w-2xl">
              Retrouvez l'ensemble des documents officiels, livrets d'accueil, formulaires et fiches pratiques synchronisés en temps réel pour l'accompagnement et l'orientation des adhérents.
            </p>
          </div>

          {userRole === 'admin' && (
            <button
              onClick={() => {
                setDocToEdit(null);
                setIsFormModalOpen(true);
              }}
              className="inline-flex items-center gap-2 px-5 py-3 rounded-2xl bg-gradient-to-r from-[#2be39d] to-[#8de02d] text-emerald-950 text-xs font-bold shadow-md hover:shadow-lg transition-all active:scale-95 cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              Publier un Document
            </button>
          )}
        </div>
      </div>

      {/* Category Cards Navigation Strip */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        <button
          onClick={() => {
            setActiveCategory('ALL');
            setSelectedTag(null);
          }}
          className={`p-3.5 rounded-2xl border text-left transition-all cursor-pointer ${
            activeCategory === 'ALL'
              ? 'bg-emerald-800 text-white border-emerald-700 shadow-md ring-2 ring-emerald-500'
              : 'bg-white text-slate-700 border-slate-200 hover:border-emerald-300 hover:bg-slate-50'
          }`}
        >
          <div className="flex items-center justify-between mb-1.5">
            <Layers className="w-4 h-4" />
            <span className={`text-xs font-mono font-bold px-1.5 py-0.5 rounded-full ${
              activeCategory === 'ALL' ? 'bg-emerald-700 text-white' : 'bg-slate-100 text-slate-700'
            }`}>
              {userRole === 'admin' ? documents.length : documents.filter(d => d.statut === 'PUBLIE').length}
            </span>
          </div>
          <div className="text-xs font-bold truncate">Tous les documents</div>
        </button>

        {(Object.keys(categoriesConfig) as DocumentCategory[]).map((catKey) => {
          const config = categoriesConfig[catKey];
          const Icon = config.icon;
          const count = documents.filter((d) => d.category === catKey && (userRole === 'admin' || d.statut === 'PUBLIE')).length;
          const isSelected = activeCategory === catKey;

          return (
            <button
              key={catKey}
              onClick={() => {
                setActiveCategory(catKey);
                setSelectedTag(null);
              }}
              className={`p-3.5 rounded-2xl border text-left transition-all cursor-pointer ${
                isSelected
                  ? 'bg-emerald-800 text-white border-emerald-700 shadow-md ring-2 ring-emerald-500'
                  : 'bg-white text-slate-700 border-slate-200 hover:border-emerald-300 hover:bg-slate-50'
              }`}
            >
              <div className="flex items-center justify-between mb-1.5">
                <Icon className="w-4 h-4" />
                <span className={`text-xs font-mono font-bold px-1.5 py-0.5 rounded-full ${
                  isSelected ? 'bg-emerald-700 text-white' : 'bg-slate-100 text-slate-700'
                }`}>
                  {count}
                </span>
              </div>
              <div className="text-xs font-bold truncate">{config.label}</div>
            </button>
          );
        })}
      </div>

      {/* Search & Tags Toolbar */}
      <div className="bg-white rounded-3xl p-4 sm:p-5 border border-emerald-200 shadow-xs flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="flex flex-1 items-center gap-3 w-full md:w-auto">
          <div className="relative flex-1 max-w-md">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Rechercher par titre, description, texte ou mot-clé..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs font-medium text-slate-900 focus:bg-white focus:ring-2 focus:ring-emerald-500 outline-hidden"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-slate-400 hover:text-slate-700"
              >
                ✕
              </button>
            )}
          </div>

          {/* Tag filters pill */}
          {allTags.length > 0 && (
            <div className="hidden lg:flex items-center gap-1.5 overflow-x-auto max-w-md py-1">
              <span className="text-[11px] font-bold text-slate-400 flex items-center gap-1">
                <Tag className="w-3 h-3" />
              </span>
              {allTags.slice(0, 5).map((tag) => (
                <button
                  key={tag}
                  onClick={() => setSelectedTag(selectedTag === tag ? null : tag)}
                  className={`px-2.5 py-1 rounded-lg text-[11px] font-semibold transition-all cursor-pointer ${
                    selectedTag === tag
                      ? 'bg-emerald-700 text-white'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  #{tag}
                </button>
              ))}
              {selectedTag && (
                <button
                  onClick={() => setSelectedTag(null)}
                  className="text-[11px] text-rose-600 font-bold hover:underline ml-1 cursor-pointer"
                >
                  Effacer tag
                </button>
              )}
            </div>
          )}
        </div>

        <div className="text-xs font-bold text-slate-500">
          {filteredDocuments.length} document(s) disponible(s)
        </div>
      </div>

      {/* Documents Grid */}
      {filteredDocuments.length === 0 ? (
        <div className="bg-white rounded-2xl p-12 text-center border border-dashed border-slate-300">
          <FileText className="w-12 h-12 text-slate-400 mx-auto mb-3" />
          <h3 className="text-base font-bold text-slate-800">Aucun document disponible</h3>
          <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
            Aucun document ne correspond à vos critères de recherche ou à la catégorie sélectionnée.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredDocuments.map((doc) => (
            <div
              key={doc.id}
              className="bg-white rounded-3xl p-5 border border-emerald-200 shadow-xs hover:border-emerald-400 hover:shadow-md transition-all flex flex-col justify-between"
            >
              <div>
                {/* Header: Category & Version */}
                <div className="flex items-start justify-between gap-2 mb-3">
                  {getCategoryBadge(doc.category)}
                  
                  <div className="flex items-center gap-1.5">
                    {/* Version Badge */}
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-extrabold bg-slate-900 text-white shadow-2xs">
                      v{doc.version}
                    </span>

                    {/* Status for Admin */}
                    {userRole === 'admin' && (
                      <button
                        onClick={() => handleTogglePublish(doc.id)}
                        className={`px-2 py-0.5 rounded-md text-[10px] font-bold cursor-pointer transition-colors ${
                          doc.statut === 'PUBLIE' 
                            ? 'bg-emerald-100 text-emerald-800 hover:bg-emerald-200' 
                            : 'bg-amber-100 text-amber-800 hover:bg-amber-200'
                        }`}
                        title="Cliquer pour changer le statut de publication"
                      >
                        {doc.statut === 'PUBLIE' ? 'Publié' : 'Brouillon'}
                      </button>
                    )}
                  </div>
                </div>

                {/* Title & Icon */}
                <div className="flex items-start gap-3 mb-2.5">
                  <div className="p-3 rounded-2xl bg-emerald-50 text-emerald-800 border border-emerald-200/80 shrink-0">
                    <FileText className="w-6 h-6 text-emerald-700" />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-slate-900 leading-snug">{doc.name}</h3>
                    <span className="text-[11px] text-slate-500 font-mono block mt-0.5 truncate max-w-[200px]">
                      {doc.fileName}
                    </span>
                  </div>
                </div>

                {/* Description */}
                <p className="text-xs text-slate-600 leading-relaxed bg-slate-50 p-3 rounded-xl border border-slate-200 mb-3 line-clamp-3">
                  {doc.description}
                </p>

                {/* Tags */}
                {doc.tags && doc.tags.length > 0 && (
                  <div className="flex flex-wrap gap-1 mb-3">
                    {doc.tags.map((t, idx) => (
                      <span key={idx} className="px-2 py-0.5 rounded-md text-[10px] font-medium bg-emerald-50/70 text-emerald-800 border border-emerald-200/50">
                        #{t}
                      </span>
                    ))}
                  </div>
                )}

                {/* Metadata Row */}
                <div className="space-y-1 text-[11px] text-slate-500 mb-4 pt-2 border-t border-slate-100">
                  <div className="flex items-center justify-between">
                    <span>Publié le :</span>
                    <strong className="text-slate-700">{doc.datePublication}</strong>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>Dernière mise à jour :</span>
                    <strong className="text-slate-700">{doc.dateMiseAJour}</strong>
                  </div>
                  {doc.fileSize && (
                    <div className="flex items-center justify-between">
                      <span>Taille :</span>
                      <strong className="text-slate-700">{(doc.fileSize / (1024 * 1024)).toFixed(2)} Mo</strong>
                    </div>
                  )}
                </div>
              </div>

              {/* Action Buttons */}
              <div className="pt-3 border-t border-slate-100 flex flex-col gap-2">
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => {
                      setDocToPreview(doc);
                      setIsPreviewModalOpen(true);
                    }}
                    className="flex-1 inline-flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold bg-slate-100 text-slate-800 hover:bg-slate-200 transition-colors cursor-pointer"
                  >
                    <Eye className="w-3.5 h-3.5 text-emerald-800" />
                    <span>Consulter</span>
                  </button>

                  <button
                    onClick={() => handleDownload(doc)}
                    className="flex-1 inline-flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold bg-emerald-800 text-white hover:bg-emerald-900 transition-colors shadow-xs cursor-pointer active:scale-95"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span>Télécharger</span>
                  </button>
                </div>

                {/* Admin Management Bar */}
                {userRole === 'admin' && (
                  <div className="flex items-center justify-between gap-1 pt-2 border-t border-slate-100">
                    <button
                      onClick={() => {
                        setDocToReplace(doc);
                        setIsReplaceModalOpen(true);
                      }}
                      className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-[11px] font-semibold text-emerald-800 hover:bg-emerald-50 cursor-pointer"
                      title="Remplacer le fichier & Incrémenter version"
                    >
                      <RefreshCw className="w-3 h-3" />
                      Remplacer fichier
                    </button>

                    <button
                      onClick={() => {
                        setDocForHistory(doc);
                        setIsHistoryModalOpen(true);
                      }}
                      className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-[11px] font-semibold text-slate-700 hover:bg-slate-100 cursor-pointer"
                      title="Historique des versions"
                    >
                      <History className="w-3 h-3" />
                      Versions ({doc.versionsHistorique?.length || 1})
                    </button>

                    <button
                      onClick={() => {
                        setDocToEdit(doc);
                        setIsFormModalOpen(true);
                      }}
                      className="p-1.5 rounded-lg text-slate-500 hover:bg-slate-100 cursor-pointer"
                      title="Modifier les informations"
                    >
                      <Edit3 className="w-3.5 h-3.5" />
                    </button>

                    <button
                      onClick={() => handleDeleteDocument(doc.id, doc.name)}
                      className="p-1.5 rounded-lg text-rose-500 hover:bg-rose-50 cursor-pointer"
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

      {/* Modals */}
      <DocumentFormModal
        isOpen={isFormModalOpen}
        docToEdit={docToEdit}
        onClose={() => {
          setIsFormModalOpen(false);
          setDocToEdit(null);
        }}
        onSave={handleSaveDocument}
      />

      {docToReplace && (
        <DocumentReplaceModal
          isOpen={isReplaceModalOpen}
          document={docToReplace}
          onClose={() => {
            setIsReplaceModalOpen(false);
            setDocToReplace(null);
          }}
          onSave={handleReplaceFile}
        />
      )}

      {docToPreview && (
        <DocumentPreviewModal
          isOpen={isPreviewModalOpen}
          document={docToPreview}
          onClose={() => {
            setIsPreviewModalOpen(false);
            setDocToPreview(null);
          }}
          onDownload={() => handleDownload(docToPreview)}
        />
      )}

      {docForHistory && (
        <DocumentHistoryModal
          isOpen={isHistoryModalOpen}
          document={docForHistory}
          onClose={() => {
            setIsHistoryModalOpen(false);
            setDocForHistory(null);
          }}
        />
      )}
    </div>
  );
};
