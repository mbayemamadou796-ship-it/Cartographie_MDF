import React, { useState, useEffect } from 'react';
import { MandatRealisation, RealisationCategory, RealisationStatus, MandatDocument } from '../../types';
import { X, Award, Check, Paperclip, Plus, Trash2 } from 'lucide-react';

interface RealisationFormModalProps {
  isOpen: boolean;
  mandatId: string;
  realisationToEdit: MandatRealisation | null;
  onClose: () => void;
  onSave: (real: Omit<MandatRealisation, 'id' | 'mandatId' | 'createdAt'> & { id?: string }) => void;
}

export const RealisationFormModal: React.FC<RealisationFormModalProps> = ({
  isOpen,
  mandatId,
  realisationToEdit,
  onClose,
  onSave
}) => {
  const [titre, setTitre] = useState('');
  const [description, setDescription] = useState('');
  const [date, setDate] = useState('');
  const [categorie, setCategorie] = useState<RealisationCategory>('PROJETS_NUMERIQUES');
  const [responsable, setResponsable] = useState('');
  const [statut, setStatut] = useState<RealisationStatus>('A_FAIRE');
  const [indicateurs, setIndicateurs] = useState('');
  const [documents, setDocuments] = useState<MandatDocument[]>([]);

  // Temp doc inputs
  const [newDocName, setNewDocName] = useState('');

  useEffect(() => {
    if (realisationToEdit) {
      setTitre(realisationToEdit.titre);
      setDescription(realisationToEdit.description);
      setDate(realisationToEdit.date);
      setCategorie(realisationToEdit.categorie);
      setResponsable(realisationToEdit.responsable);
      setStatut(realisationToEdit.statut);
      setIndicateurs(realisationToEdit.indicateurs || '');
      setDocuments(realisationToEdit.documents || []);
    } else {
      setTitre('');
      setDescription('');
      setDate(new Date().toISOString().split('T')[0]);
      setCategorie('PROJETS_NUMERIQUES');
      setResponsable('Bureau National');
      setStatut('EN_COURS');
      setIndicateurs('');
      setDocuments([]);
    }
  }, [realisationToEdit, isOpen]);

  if (!isOpen) return null;

  const handleAddDoc = () => {
    if (!newDocName.trim()) return;
    const doc: MandatDocument = {
      id: `doc-r-${Date.now()}`,
      name: newDocName.trim(),
      category: 'PROJET',
      dateAjout: new Date().toLocaleDateString('fr-FR')
    };
    setDocuments([...documents, doc]);
    setNewDocName('');
  };

  const handleRemoveDoc = (id: string) => {
    setDocuments(documents.filter((d) => d.id !== id));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!titre.trim()) return;

    onSave({
      id: realisationToEdit ? realisationToEdit.id : undefined,
      titre: titre.trim(),
      description: description.trim(),
      date,
      categorie,
      responsable: responsable.trim() || 'Bureau National',
      statut,
      indicateurs: indicateurs.trim() || undefined,
      documents
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs animate-in fade-in duration-150">
      <div className="bg-white rounded-3xl max-w-xl w-full p-6 sm:p-8 shadow-2xl border border-emerald-200 max-h-[90vh] overflow-y-auto relative">
        <div className="flex items-center justify-between pb-4 mb-6 border-b border-emerald-100">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-emerald-100 text-emerald-800">
              <Award className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-extrabold text-slate-900">
                {realisationToEdit ? 'Modifier la Réalisation' : 'Ajouter une Réalisation'}
              </h3>
              <p className="text-xs text-slate-500">
                Catégorisez l'action, définissez le responsable et suivez son cycle
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
              Titre de la Réalisation *
            </label>
            <input
              type="text"
              required
              placeholder="Ex: Lancement de l'annuaire cartographique"
              value={titre}
              onChange={(e) => setTitre(e.target.value)}
              className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs font-semibold text-slate-900 focus:bg-white focus:ring-2 focus:ring-emerald-500 outline-hidden"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
                Catégorie *
              </label>
              <select
                value={categorie}
                onChange={(e) => setCategorie(e.target.value as RealisationCategory)}
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs font-semibold text-slate-900 focus:bg-white focus:ring-2 focus:ring-emerald-500 outline-hidden"
              >
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
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
                Cycle / Statut *
              </label>
              <select
                value={statut}
                onChange={(e) => setStatut(e.target.value as RealisationStatus)}
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs font-semibold text-slate-900 focus:bg-white focus:ring-2 focus:ring-emerald-500 outline-hidden"
              >
                <option value="A_FAIRE">À faire</option>
                <option value="EN_COURS">En cours</option>
                <option value="TERMINE">Terminé</option>
                <option value="ARCHIVE">Archivé</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
                Responsable de l'action *
              </label>
              <input
                type="text"
                required
                placeholder="Ex: Amina Diop"
                value={responsable}
                onChange={(e) => setResponsable(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs font-semibold text-slate-900 focus:bg-white focus:ring-2 focus:ring-emerald-500 outline-hidden"
              />
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
                Date (ou date de réalisation) *
              </label>
              <input
                type="date"
                required
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs font-semibold text-slate-900 focus:bg-white focus:ring-2 focus:ring-emerald-500 outline-hidden"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
              Description & Objectifs
            </label>
            <textarea
              rows={3}
              placeholder="Détaillez le contenu de la réalisation, le contexte et les livrables..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs text-slate-900 focus:bg-white focus:ring-2 focus:ring-emerald-500 outline-hidden"
            />
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
              Résultats & Indicateurs Chiffrés (Optionnel)
            </label>
            <input
              type="text"
              placeholder="Ex: 350 membres inscrits, 12 régions couvertes"
              value={indicateurs}
              onChange={(e) => setIndicateurs(e.target.value)}
              className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs font-semibold text-slate-900 focus:bg-white focus:ring-2 focus:ring-emerald-500 outline-hidden"
            />
          </div>

          {/* Attachments Section */}
          <div className="pt-2">
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
              Documents & Pièces Jointes
            </label>
            <div className="flex gap-2 mb-2">
              <input
                type="text"
                placeholder="Nom du fichier (ex: Bilan_Rencontre_Paris.pdf)"
                value={newDocName}
                onChange={(e) => setNewDocName(e.target.value)}
                className="flex-1 px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs outline-hidden"
              />
              <button
                type="button"
                onClick={handleAddDoc}
                className="px-3 py-2 bg-emerald-100 text-emerald-800 rounded-xl text-xs font-bold hover:bg-emerald-200"
              >
                + Ajouter
              </button>
            </div>

            {documents.length > 0 && (
              <div className="space-y-1.5 bg-slate-50 p-2.5 rounded-xl border border-slate-200">
                {documents.map((d) => (
                  <div key={d.id} className="flex items-center justify-between text-xs bg-white p-2 rounded-lg border border-slate-200">
                    <span className="flex items-center gap-1.5 font-medium text-slate-800">
                      <Paperclip className="w-3.5 h-3.5 text-emerald-600" />
                      {d.name}
                    </span>
                    <button
                      type="button"
                      onClick={() => handleRemoveDoc(d.id)}
                      className="text-rose-500 hover:text-rose-700"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-200">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 rounded-xl border border-slate-300 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition-colors"
            >
              Annuler
            </button>
            <button
              type="submit"
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-emerald-800 text-white text-xs font-bold hover:bg-emerald-900 shadow-md transition-colors"
            >
              <Check className="w-4 h-4" />
              {realisationToEdit ? 'Mettre à Jour' : 'Ajouter la Réalisation'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
