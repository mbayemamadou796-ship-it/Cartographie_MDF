import React, { useState, useEffect } from 'react';
import { Mandat, MandatStatus } from '../../types';
import { X, Landmark, Calendar, Users, FileText, Check } from 'lucide-react';

interface MandatFormModalProps {
  isOpen: boolean;
  mandatToEdit: Mandat | null;
  onClose: () => void;
  onSave: (mandat: Omit<Mandat, 'id' | 'createdAt' | 'realisations' | 'documents'> & { id?: string }) => void;
}

export const MandatFormModal: React.FC<MandatFormModalProps> = ({
  isOpen,
  mandatToEdit,
  onClose,
  onSave
}) => {
  const [intitule, setIntitule] = useState('');
  const [dateDebut, setDateDebut] = useState('');
  const [dateFin, setDateFin] = useState('');
  const [description, setDescription] = useState('');
  const [responsablesStr, setResponsablesStr] = useState('');
  const [statut, setStatut] = useState<MandatStatus>('EN_COURS');

  useEffect(() => {
    if (mandatToEdit) {
      setIntitule(mandatToEdit.intitule);
      setDateDebut(mandatToEdit.dateDebut);
      setDateFin(mandatToEdit.dateFin);
      setDescription(mandatToEdit.description);
      setResponsablesStr((mandatToEdit.responsables || []).join('\n'));
      setStatut(mandatToEdit.statut);
    } else {
      setIntitule('Mandat 2028 — 2030');
      setDateDebut('2028-01-01');
      setDateFin('2030-12-31');
      setDescription('');
      setResponsablesStr('Mamadou Mbaye (Président)\nAmina Diop (Secrétaire Générale)');
      setStatut('EN_PREPARATION');
    }
  }, [mandatToEdit, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!intitule.trim()) return;

    const responsables = responsablesStr
      .split('\n')
      .map((s) => s.trim())
      .filter(Boolean);

    onSave({
      id: mandatToEdit ? mandatToEdit.id : undefined,
      intitule: intitule.trim(),
      dateDebut,
      dateFin,
      description: description.trim(),
      responsables,
      statut
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs animate-in fade-in duration-150">
      <div className="bg-white rounded-3xl max-w-xl w-full p-6 sm:p-8 shadow-2xl border border-emerald-200 overflow-hidden relative">
        <div className="flex items-center justify-between pb-4 mb-6 border-b border-emerald-100">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-emerald-100 text-emerald-800">
              <Landmark className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-extrabold text-slate-900">
                {mandatToEdit ? 'Modifier le Mandat' : 'Créer un Nouveau Mandat'}
              </h3>
              <p className="text-xs text-slate-500">
                Définissez la temporalité, le bureau et la vision du mandat
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
              Intitulé du Mandat *
            </label>
            <input
              type="text"
              required
              placeholder="Ex: Mandat 2026 — 2028"
              value={intitule}
              onChange={(e) => setIntitule(e.target.value)}
              className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs font-semibold text-slate-900 focus:bg-white focus:ring-2 focus:ring-emerald-500 outline-hidden"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
                Date de Début *
              </label>
              <input
                type="date"
                required
                value={dateDebut}
                onChange={(e) => setDateDebut(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs font-semibold text-slate-900 focus:bg-white focus:ring-2 focus:ring-emerald-500 outline-hidden"
              />
            </div>
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
                Date de Fin *
              </label>
              <input
                type="date"
                required
                value={dateFin}
                onChange={(e) => setDateFin(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs font-semibold text-slate-900 focus:bg-white focus:ring-2 focus:ring-emerald-500 outline-hidden"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
                Statut du Mandat *
              </label>
              <select
                value={statut}
                onChange={(e) => setStatut(e.target.value as MandatStatus)}
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs font-semibold text-slate-900 focus:bg-white focus:ring-2 focus:ring-emerald-500 outline-hidden"
              >
                <option value="EN_PREPARATION">En préparation</option>
                <option value="EN_COURS">En cours (Actif)</option>
                <option value="TERMINE">Terminé</option>
                <option value="ARCHIVE">Archivé</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
                Membres du Bureau (1 par ligne)
              </label>
              <textarea
                rows={2}
                placeholder="Ex: Jean Dupont (Président)"
                value={responsablesStr}
                onChange={(e) => setResponsablesStr(e.target.value)}
                className="w-full px-3.5 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs text-slate-900 focus:bg-white focus:ring-2 focus:ring-emerald-500 outline-hidden"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
              Description & Orientations Stratégiques
            </label>
            <textarea
              rows={3}
              placeholder="Décrivez les grands axes et la vision de ce mandat..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs text-slate-900 focus:bg-white focus:ring-2 focus:ring-emerald-500 outline-hidden"
            />
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
              {mandatToEdit ? 'Enregistrer les Modifications' : 'Créer le Mandat'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
