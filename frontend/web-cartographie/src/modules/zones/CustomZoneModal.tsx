import React, { useState, useEffect } from 'react';
import { CustomZone, AppUser } from '../../types';
import { Layers, X, Check, Tag, UserCheck } from 'lucide-react';

interface CustomZoneModalProps {
  isOpen: boolean;
  zoneToEdit?: CustomZone | null;
  users?: AppUser[];
  onClose: () => void;
  onSave: (name: string, description: string, color: string, referentUserId?: string, referentName?: string) => void;
}

const COLOR_OPTIONS = [
  { id: 'emerald', label: 'Émeraude', bg: 'bg-emerald-500', border: 'border-emerald-600', text: 'text-emerald-700', badgeBg: 'bg-emerald-100' },
  { id: 'blue', label: 'Bleu Océan', bg: 'bg-blue-500', border: 'border-blue-600', text: 'text-blue-700', badgeBg: 'bg-blue-100' },
  { id: 'indigo', label: 'Indigo', bg: 'bg-indigo-500', border: 'border-indigo-600', text: 'text-indigo-700', badgeBg: 'bg-indigo-100' },
  { id: 'purple', label: 'Violet', bg: 'bg-purple-500', border: 'border-purple-600', text: 'text-purple-700', badgeBg: 'bg-purple-100' },
  { id: 'amber', label: 'Ambre / Or', bg: 'bg-amber-500', border: 'border-amber-600', text: 'text-amber-700', badgeBg: 'bg-amber-100' },
  { id: 'rose', label: 'Rose Rubis', bg: 'bg-rose-500', border: 'border-rose-600', text: 'text-rose-700', badgeBg: 'bg-rose-100' },
  { id: 'teal', label: 'Sarcelle', bg: 'bg-teal-500', border: 'border-teal-600', text: 'text-teal-700', badgeBg: 'bg-teal-100' },
];

export const CustomZoneModal: React.FC<CustomZoneModalProps> = ({
  isOpen,
  zoneToEdit,
  users = [],
  onClose,
  onSave
}) => {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [color, setColor] = useState('emerald');
  const [referentUserId, setReferentUserId] = useState('');
  const [error, setError] = useState('');

  const potentialReferents = users.filter((u) => u.active && (u.role === 'referent' || u.role === 'admin'));

  useEffect(() => {
    if (zoneToEdit) {
      setName(zoneToEdit.name);
      setDescription(zoneToEdit.description || '');
      setColor(zoneToEdit.color || 'emerald');
      setReferentUserId(zoneToEdit.referentUserId || '');
    } else {
      setName('');
      setDescription('');
      setColor('emerald');
      setReferentUserId('');
    }
    setError('');
  }, [zoneToEdit, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      setError('Veuillez renseigner le nom de la zone.');
      return;
    }

    let selectedReferentName: string | undefined = undefined;
    if (referentUserId) {
      const found = users.find((u) => u.id === referentUserId);
      if (found) {
        selectedReferentName = `${found.prenom} ${found.nom}`.trim() || found.name || found.username;
      }
    }

    onSave(name.trim(), description.trim(), color, referentUserId || undefined, selectedReferentName);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl max-w-md w-full border border-emerald-200 shadow-2xl overflow-hidden flex flex-col">
        
        {/* Header */}
        <div className="p-5 bg-gradient-to-r from-emerald-800 via-emerald-900 to-slate-900 text-white flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <span className="p-2 rounded-xl bg-white/10 text-emerald-300">
              <Layers className="w-5 h-5" />
            </span>
            <div>
              <h3 className="font-bold text-base font-['Outfit']">
                {zoneToEdit ? 'Modifier la Zone / Groupe' : 'Créer une Nouvelle Zone'}
              </h3>
              <p className="text-[11px] text-emerald-200 font-medium">
                Regroupement personnalisé de membres Mbok de France
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-full hover:bg-white/10 text-slate-300 hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1.5">
              Nom de la Zone / Groupe <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              placeholder="Ex: Bretagne, Auvergne-Rhône-Alpes, Occitanie, Normandie..."
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full bg-slate-50 border border-emerald-200 rounded-xl px-3.5 py-2.5 text-xs text-slate-900 focus:bg-white focus:border-emerald-500 outline-none font-semibold transition-all"
              autoFocus
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1.5">
              Description / Objectif (optionnel)
            </label>
            <textarea
              rows={2}
              placeholder="Ex: Regroupement des membres du réseau Sud pour les projets inter-régionaux."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full bg-slate-50 border border-emerald-200 rounded-xl px-3.5 py-2.5 text-xs text-slate-900 focus:bg-white focus:border-emerald-500 outline-none font-medium transition-all"
            />
          </div>

          {/* Referent Assignment */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1.5 flex items-center gap-1.5">
              <UserCheck className="w-3.5 h-3.5 text-emerald-600" />
              <span>Référent de la Zone (Responsable)</span>
            </label>
            <select
              value={referentUserId}
              onChange={(e) => setReferentUserId(e.target.value)}
              className="w-full bg-slate-50 border border-emerald-200 rounded-xl px-3.5 py-2.5 text-xs text-slate-900 focus:bg-white focus:border-emerald-500 outline-none font-semibold transition-all"
            >
              <option value="">-- Aucun référent attribué --</option>
              {potentialReferents.map((u) => (
                <option key={u.id} value={u.id}>
                  {u.prenom} {u.nom} ({u.username}) {u.role === 'admin' ? '[Admin]' : '[Référent]'}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-2 flex items-center gap-1.5">
              <Tag className="w-3.5 h-3.5 text-emerald-600" />
              <span>Couleur de la Zone</span>
            </label>
            <div className="grid grid-cols-4 gap-2">
              {COLOR_OPTIONS.map((c) => (
                <button
                  type="button"
                  key={c.id}
                  onClick={() => setColor(c.id)}
                  className={`p-2 rounded-xl border flex items-center gap-2 text-xs font-bold transition-all ${
                    color === c.id
                      ? `${c.badgeBg} ${c.border} ring-2 ring-emerald-500/30 text-slate-900`
                      : 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100'
                  }`}
                >
                  <span className={`w-3 h-3 rounded-full ${c.bg} shrink-0`} />
                  <span className="truncate text-[11px]">{c.label}</span>
                </button>
              ))}
            </div>
          </div>

          {error && (
            <div className="p-3 bg-rose-50 border border-rose-200 text-rose-700 rounded-xl text-xs font-semibold">
              {error}
            </div>
          )}

          {/* Buttons */}
          <div className="pt-2 flex items-center justify-end gap-2 border-t border-slate-100">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-slate-600 hover:bg-slate-100 rounded-xl font-bold text-xs transition-colors"
            >
              Annuler
            </button>
            <button
              type="submit"
              className="inline-flex items-center gap-1.5 px-5 py-2 bg-gradient-to-r from-[#2be39d] via-[#48c92a] to-[#8de02d] hover:brightness-105 text-emerald-950 font-bold rounded-xl shadow-xs transition-all active:scale-95 text-xs"
            >
              <Check className="w-4 h-4" />
              <span>{zoneToEdit ? 'Enregistrer la zone' : 'Créer la zone'}</span>
            </button>
          </div>
        </form>

      </div>
    </div>
  );
};
