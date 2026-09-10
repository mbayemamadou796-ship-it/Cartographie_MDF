import React, { useState } from 'react';
import { Rencontre, RencontreStatut } from '@shared/types';
import { X, Calendar, MapPin, Clock, Save, FileText, Sparkles } from 'lucide-react';

interface RencontreFormModalProps {
  rencontre?: Rencontre | null;
  isOpen: boolean;
  onClose: () => void;
  onSave: (rencontre: Rencontre) => void;
}

export const RencontreFormModal: React.FC<RencontreFormModalProps> = ({
  rencontre,
  isOpen,
  onClose,
  onSave
}) => {
  const [nom, setNom] = useState(rencontre?.nom || 'Rencontre MDF 2027');
  const [annee, setAnnee] = useState<number>(rencontre?.annee || new Date().getFullYear() + 1);
  const [description, setDescription] = useState(
    rencontre?.description || "Grande rencontre annuelle des membres de l'association Mbok de France (MDF)."
  );
  const [messageAccueil, setMessageAccueil] = useState(
    rencontre?.messageAccueil || `Assalamou 3aleykoum wa rahmatoullahi wa barakatouh ya Ikhwa,

Nous avons le plaisir de vous annoncer la prochaine rencontre MDF.
Afin de bien préparer l'événement, nous vous invitons à répondre à ce sondage de participation.`
  );
  const [dateDebut, setDateDebut] = useState(rencontre?.dateDebut || '2027-12-24');
  const [dateFin, setDateFin] = useState(rencontre?.dateFin || '2027-12-26');
  const [dateAffichage, setDateAffichage] = useState(rencontre?.dateAffichage || 'Du 24 au 26 décembre 2027');
  const [lieu, setLieu] = useState(rencontre?.lieu || 'Toulouse');
  const [adresse, setAdresse] = useState(rencontre?.adresse || '424 Montgay, 31560 Nailloux, Toulouse');
  const [dateLimite, setDateLimite] = useState(rencontre?.dateLimite || '2027-11-30');
  const [dateLimiteAffichage, setDateLimiteAffichage] = useState(rencontre?.dateLimiteAffichage || '30 novembre 2027');
  const [statut, setStatut] = useState<RencontreStatut>(rencontre?.statut || 'SONDAGE_OUVERT');
  const [isDefault, setIsDefault] = useState<boolean>(rencontre?.isDefault || false);
  const [bureauNotes, setBureauNotes] = useState(rencontre?.bureauNotes || '');

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const payload: Rencontre = {
      id: rencontre?.id || `rencontre-${annee}-${Date.now().toString(36).substring(2, 6)}`,
      nom: nom.trim(),
      annee: Number(annee),
      description: description.trim(),
      messageAccueil: messageAccueil.trim(),
      dateDebut,
      dateFin,
      dateAffichage: dateAffichage.trim(),
      lieu: lieu.trim(),
      adresse: adresse.trim(),
      dateLimite,
      dateLimiteAffichage: dateLimiteAffichage.trim(),
      statut,
      isDefault,
      bureauNotes: bureauNotes.trim(),
      createdAt: rencontre?.createdAt || new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    onSave(payload);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl shadow-2xl border border-emerald-100 max-w-2xl w-full max-h-[90vh] overflow-y-auto p-6 relative">
        
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-5 right-5 p-2 rounded-full text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-3 mb-6 pb-4 border-b border-slate-100">
          <div className="w-10 h-10 rounded-2xl bg-emerald-50 text-emerald-800 flex items-center justify-center font-black">
            🗓️
          </div>
          <div>
            <h3 className="text-lg font-black text-slate-900 font-['Outfit',sans-serif]">
              {rencontre ? 'Modifier la Rencontre' : 'Créer une nouvelle Rencontre'}
            </h3>
            <p className="text-xs text-slate-500 font-medium">
              Paramètres de l'événement, dates, lieu et textes du sondage membre
            </p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="sm:col-span-2">
              <label className="block font-bold text-slate-700 mb-1">Nom de l'événement *</label>
              <input
                type="text"
                required
                value={nom}
                onChange={(e) => setNom(e.target.value)}
                placeholder="Ex: Rencontre MDF 2026"
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 text-xs font-semibold outline-none"
              />
            </div>
            <div>
              <label className="block font-bold text-slate-700 mb-1">Année *</label>
              <input
                type="number"
                required
                value={annee}
                onChange={(e) => setAnnee(Number(e.target.value))}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 text-xs font-semibold outline-none"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block font-bold text-slate-700 mb-1">Lieu / Ville *</label>
              <input
                type="text"
                required
                value={lieu}
                onChange={(e) => setLieu(e.target.value)}
                placeholder="Ex: Toulouse"
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 text-xs font-medium outline-none"
              />
            </div>
            <div>
              <label className="block font-bold text-slate-700 mb-1">Statut du cycle de vie *</label>
              <select
                value={statut}
                onChange={(e) => setStatut(e.target.value as RencontreStatut)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 text-xs font-bold bg-white outline-none"
              >
                <option value="BROUILLON">Brouillon (Non visible)</option>
                <option value="SONDAGE_OUVERT">Sondage ouvert (Actif)</option>
                <option value="SONDAGE_FERME">Sondage fermé (Date limite passée)</option>
                <option value="PREPARATION">Préparation / Logistique</option>
                <option value="TERMINEE">Rencontre terminée</option>
                <option value="ARCHIVEE">Archivée</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block font-bold text-slate-700 mb-1">Adresse complète</label>
            <input
              type="text"
              value={adresse}
              onChange={(e) => setAdresse(e.target.value)}
              placeholder="Ex: 424 Montgay, 31560 Nailloux, Toulouse"
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 text-xs font-medium outline-none"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block font-bold text-slate-700 mb-1">Date début</label>
              <input
                type="date"
                value={dateDebut}
                onChange={(e) => setDateDebut(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs font-medium outline-none"
              />
            </div>
            <div>
              <label className="block font-bold text-slate-700 mb-1">Date fin</label>
              <input
                type="date"
                value={dateFin}
                onChange={(e) => setDateFin(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs font-medium outline-none"
              />
            </div>
            <div>
              <label className="block font-bold text-slate-700 mb-1">Date limite réponse</label>
              <input
                type="date"
                value={dateLimite}
                onChange={(e) => setDateLimite(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs font-medium outline-none"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block font-bold text-slate-700 mb-1">Dates affichées</label>
              <input
                type="text"
                value={dateAffichage}
                onChange={(e) => setDateAffichage(e.target.value)}
                placeholder="Ex: Du 25 au 27 décembre 2026"
                className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-xs outline-none"
              />
            </div>
            <div>
              <label className="block font-bold text-slate-700 mb-1">Date limite affichée</label>
              <input
                type="text"
                value={dateLimiteAffichage}
                onChange={(e) => setDateLimiteAffichage(e.target.value)}
                placeholder="Ex: 30 novembre 2026"
                className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-xs outline-none"
              />
            </div>
          </div>

          <div>
            <label className="block font-bold text-slate-700 mb-1">Message d'accueil du sondage</label>
            <textarea
              rows={4}
              value={messageAccueil}
              onChange={(e) => setMessageAccueil(e.target.value)}
              className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-xs outline-none focus:border-emerald-500"
            />
          </div>

          <div>
            <label className="block font-bold text-slate-700 mb-1">Notes internes Bureau (optionnel)</label>
            <textarea
              rows={2}
              value={bureauNotes}
              onChange={(e) => setBureauNotes(e.target.value)}
              placeholder="Ex: Objectifs logistiques, référents en charge..."
              className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-xs outline-none"
            />
          </div>

          <div className="flex items-center gap-2 pt-2">
            <input
              type="checkbox"
              id="isDefaultRencontre"
              checked={isDefault}
              onChange={(e) => setIsDefault(e.target.checked)}
              className="w-4 h-4 text-emerald-600 rounded border-slate-300"
            />
            <label htmlFor="isDefaultRencontre" className="font-bold text-slate-700 cursor-pointer">
              Définir comme Rencontre active par défaut pour les sondages publics
            </label>
          </div>

          {/* Action buttons */}
          <div className="pt-4 border-t border-slate-100 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 rounded-xl font-bold text-slate-600 hover:bg-slate-100 transition cursor-pointer"
            >
              Annuler
            </button>
            <button
              type="submit"
              className="px-5 py-2.5 bg-emerald-800 hover:bg-emerald-900 text-white rounded-xl font-bold flex items-center gap-2 transition shadow-sm cursor-pointer"
            >
              <Save className="w-4 h-4" />
              <span>Enregistrer la Rencontre</span>
            </button>
          </div>

        </form>

      </div>
    </div>
  );
};
