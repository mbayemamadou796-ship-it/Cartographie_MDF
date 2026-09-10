import React, { useState, useEffect } from 'react';
import { UsefulDocument, DocumentCategory, DocumentPublishStatus } from '../../types';
import { X, FileText, Check, Upload, Tag, BookOpen } from 'lucide-react';

interface DocumentFormModalProps {
  isOpen: boolean;
  docToEdit: UsefulDocument | null;
  onClose: () => void;
  onSave: (doc: Omit<UsefulDocument, 'id' | 'datePublication' | 'dateMiseAJour'> & { id?: string }) => void;
}

export const DocumentFormModal: React.FC<DocumentFormModalProps> = ({
  isOpen,
  docToEdit,
  onClose,
  onSave
}) => {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState<DocumentCategory>('OFFICIELS');
  const [fileName, setFileName] = useState('');
  const [fileType, setFileType] = useState('application/pdf');
  const [fileSize, setFileSize] = useState<number>(1500000);
  const [version, setVersion] = useState('1.0');
  const [statut, setStatut] = useState<DocumentPublishStatus>('PUBLIE');
  const [tagsStr, setTagsStr] = useState('');
  const [authorName, setAuthorName] = useState('Bureau National MDF');
  const [content, setContent] = useState('');

  useEffect(() => {
    if (docToEdit) {
      setName(docToEdit.name);
      setDescription(docToEdit.description);
      setCategory(docToEdit.category);
      setFileName(docToEdit.fileName);
      setFileType(docToEdit.fileType);
      setFileSize(docToEdit.fileSize || 1500000);
      setVersion(docToEdit.version);
      setStatut(docToEdit.statut);
      setTagsStr((docToEdit.tags || []).join(', '));
      setAuthorName(docToEdit.authorName || 'Bureau National MDF');
      setContent(docToEdit.content || '');
    } else {
      setName('');
      setDescription('');
      setCategory('GUIDE_ADHERENT');
      setFileName('Nouveau_Document_MDF.pdf');
      setFileType('application/pdf');
      setFileSize(1200000);
      setVersion('1.0');
      setStatut('PUBLIE');
      setTagsStr('Adhérents, Guide, Pratique');
      setAuthorName('Bureau National MDF');
      setContent('');
    }
  }, [docToEdit, isOpen]);

  if (!isOpen) return null;

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setFileName(file.name);
      setFileType(file.type || 'application/pdf');
      setFileSize(file.size);
      if (!name) {
        setName(file.name.replace(/\.[^/.]+$/, "").replace(/_/g, " "));
      }

      // If it's a text/markdown file, read its content automatically
      if (file.type.includes('text') || file.name.endsWith('.txt') || file.name.endsWith('.md')) {
        const reader = new FileReader();
        reader.onload = (event) => {
          if (typeof event.target?.result === 'string') {
            setContent(event.target.result);
          }
        };
        reader.readAsText(file);
      }
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !fileName.trim()) return;

    const tags = tagsStr
      .split(',')
      .map((t) => t.trim())
      .filter(Boolean);

    onSave({
      id: docToEdit ? docToEdit.id : undefined,
      name: name.trim(),
      description: description.trim(),
      category,
      fileName: fileName.trim(),
      fileType,
      fileSize,
      version: version.trim() || '1.0',
      statut,
      tags,
      authorName: authorName.trim(),
      content: content.trim() || undefined
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs animate-in fade-in duration-150">
      <div className="bg-white rounded-3xl max-w-2xl w-full p-6 sm:p-8 shadow-2xl border border-emerald-200 max-h-[90vh] overflow-y-auto relative">
        <div className="flex items-center justify-between pb-4 mb-6 border-b border-emerald-100">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-emerald-100 text-emerald-800">
              <FileText className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-extrabold text-slate-900">
                {docToEdit ? 'Modifier le Document' : 'Publier un Document Utile'}
              </h3>
              <p className="text-xs text-slate-500">
                Visible automatiquement et synchronisé dans l'espace de chaque référent
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* File Upload Box */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
              Fichier Associé (PDF, Word, Excel, Texte) *
            </label>
            <label className="border-2 border-dashed border-slate-300 hover:border-emerald-500 rounded-2xl p-4 flex flex-col items-center justify-center cursor-pointer transition-colors bg-slate-50">
              <Upload className="w-6 h-6 text-slate-400 mb-1.5" />
              <span className="text-xs font-semibold text-slate-800">
                {fileName || 'Cliquez pour sélectionner un fichier'}
              </span>
              <span className="text-[10px] text-slate-400 mt-0.5">
                Le fichier et son contenu seront consultables et téléchargeables par les référents
              </span>
              <input
                type="file"
                className="hidden"
                accept=".pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx,.txt,.md"
                onChange={handleFileUpload}
              />
            </label>
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
              Nom / Titre du Document *
            </label>
            <input
              type="text"
              required
              placeholder="Ex: Livret d'accueil du nouvel adhérent"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs font-semibold text-slate-900 focus:bg-white focus:ring-2 focus:ring-emerald-500 outline-hidden"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
                Catégorie *
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value as DocumentCategory)}
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs font-semibold text-slate-900 focus:bg-white focus:ring-2 focus:ring-emerald-500 outline-hidden"
              >
                <option value="PRESENTATION">Présentation de MDF</option>
                <option value="OFFICIELS">Documents officiels (Statuts, Règlement)</option>
                <option value="GUIDE_ADHERENT">Guide du nouvel adhérent</option>
                <option value="INFOS_PRATIQUES">Informations pratiques & Urgences</option>
                <option value="FORMULAIRES">Formulaires & Modèles</option>
                <option value="AUTRE">Autre catégorie</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
                Version *
              </label>
              <input
                type="text"
                required
                placeholder="Ex: 2.1"
                value={version}
                onChange={(e) => setVersion(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs font-semibold text-slate-900 focus:bg-white focus:ring-2 focus:ring-emerald-500 outline-hidden"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
              Description & Utilité pour le Référent
            </label>
            <textarea
              rows={2}
              placeholder="Expliquez à quoi sert ce document et comment le référent doit l'utiliser auprès des adhérents..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full px-3.5 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs text-slate-900 focus:bg-white focus:ring-2 focus:ring-emerald-500 outline-hidden"
            />
          </div>

          {/* Document Full Text Content (Interactive Reader) */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1 flex items-center justify-between">
              <span className="flex items-center gap-1.5">
                <BookOpen className="w-3.5 h-3.5 text-emerald-700" />
                <span>Contenu Intégral / Texte du Document (Lisible dans l'app)</span>
              </span>
              <span className="text-[10px] text-slate-400 font-normal">Optionnel mais recommandé pour la consultation directe</span>
            </label>
            <textarea
              rows={6}
              placeholder="Collez ici le texte intégral, les articles, le modèle ou les instructions complètes du document qui seront consultables et imprimables directement dans l'application..."
              value={content}
              onChange={(e) => setContent(e.target.value)}
              className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs font-mono text-slate-900 focus:bg-white focus:ring-2 focus:ring-emerald-500 outline-hidden leading-relaxed"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
                Statut de Publication
              </label>
              <select
                value={statut}
                onChange={(e) => setStatut(e.target.value as DocumentPublishStatus)}
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs font-semibold text-slate-900 focus:bg-white focus:ring-2 focus:ring-emerald-500 outline-hidden"
              >
                <option value="PUBLIE">Publié (Visible par les Référents)</option>
                <option value="BROUILLON">Brouillon (Admin seulement)</option>
                <option value="ARCHIVE">Archivé</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
                Auteur / Pôle
              </label>
              <input
                type="text"
                placeholder="Ex: Secrétariat Général"
                value={authorName}
                onChange={(e) => setAuthorName(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs font-semibold text-slate-900 focus:bg-white focus:ring-2 focus:ring-emerald-500 outline-hidden"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
              Mots-clés / Tags (séparés par des virgules)
            </label>
            <input
              type="text"
              placeholder="Ex: Statuts, Juridique, Préfecture, Urgence"
              value={tagsStr}
              onChange={(e) => setTagsStr(e.target.value)}
              className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs font-semibold text-slate-900 focus:bg-white focus:ring-2 focus:ring-emerald-500 outline-hidden"
            />
          </div>

          <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-200">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 rounded-xl border border-slate-300 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition-colors cursor-pointer"
            >
              Annuler
            </button>
            <button
              type="submit"
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-emerald-800 text-white text-xs font-bold hover:bg-emerald-900 shadow-md transition-colors cursor-pointer active:scale-95"
            >
              <Check className="w-4 h-4" />
              {docToEdit ? 'Enregistrer les Modifications' : 'Publier le Document'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
