import React, { useState } from 'react';
import { RefreshCw, Phone, Mail, MapPin, Briefcase, Send, ArrowLeft, Search } from 'lucide-react';
import { DemandeMember } from '@shared/types';
import { DemandeService } from '../../../../web-cartographie/src/services/demandeService';

interface MiseAJourViewProps {
  onNavigate: (tab: 'accueil' | 'inscription' | 'mise-a-jour' | 'confirmation' | 'informations', submittedDemande?: DemandeMember) => void;
}

export const MiseAJourView: React.FC<MiseAJourViewProps> = ({ onNavigate }) => {
  const [formData, setFormData] = useState({
    nom: '',
    prenom: '',
    email: '',
    telephone: '',
    ville: '',
    departement: '',
    situationProfessionnelle: 'Employé(e)',
    domaineEtude: '',
    organisation: '',
    fonction: '',
    notes: ''
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const validate = () => {
    const errs: Record<string, string> = {};
    if (!formData.nom.trim()) errs.nom = 'Le nom est obligatoire';
    if (!formData.prenom.trim()) errs.prenom = 'Le prénom est obligatoire';
    if (!formData.email.trim()) errs.email = 'L’email est obligatoire';
    if (!formData.telephone.trim()) errs.telephone = 'Le téléphone est obligatoire';

    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    setIsSubmitting(true);
    try {
      const createdDemande = DemandeService.submitDemande({
        type: 'MISE_A_JOUR',
        nom: formData.nom.trim(),
        prenom: formData.prenom.trim(),
        email: formData.email.trim(),
        telephone: formData.telephone.trim(),
        ville: formData.ville.trim(),
        departement: formData.departement.trim() || undefined,
        situationProfessionnelle: formData.situationProfessionnelle,
        domaineEtude: formData.domaineEtude.trim() || undefined,
        organisation: formData.organisation.trim() || undefined,
        fonction: formData.fonction.trim() || undefined,
        notes: formData.notes.trim() || 'Demande de modification des informations personnelles'
      });

      setIsSubmitting(false);
      onNavigate('confirmation', createdDemande);
    } catch (err) {
      console.error(err);
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      <button
        onClick={() => onNavigate('accueil')}
        className="text-slate-500 hover:text-slate-800 text-xs font-bold flex items-center gap-1 transition-colors"
      >
        <ArrowLeft className="w-4 h-4" />
        Retour à l'accueil
      </button>

      {/* Header */}
      <div className="bg-gradient-to-r from-blue-900 to-slate-900 text-white rounded-2xl p-6 shadow-md border border-blue-800/50">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-xl bg-blue-500/20 border border-blue-400/30 flex items-center justify-center font-bold text-blue-300">
            <RefreshCw className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-2xl font-black font-['Outfit']">Demande de Mise à Jour de vos Informations</h1>
            <p className="text-xs text-blue-100/80 mt-0.5">
              Renseignez vos coordonnées à jour. Le bureau validera les changements avant mise à jour dans l'annuaire.
            </p>
          </div>
        </div>
      </div>

      {/* Form Card */}
      <form onSubmit={handleSubmit} className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-6">
        {/* Section 1: Identification */}
        <div className="space-y-4">
          <h2 className="text-xs font-black uppercase text-blue-800 tracking-wider pb-2 border-b border-slate-100 flex items-center gap-2">
            <Search className="w-4 h-4 text-blue-600" />
            1. Identification du membre
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Prénom <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                placeholder="Votre prénom enregistré"
                value={formData.prenom}
                onChange={(e) => setFormData({ ...formData, prenom: e.target.value })}
                className={`w-full p-2.5 bg-slate-50 border rounded-xl text-xs font-medium focus:outline-none focus:ring-2 ${
                  errors.prenom ? 'border-rose-400 ring-rose-200' : 'border-slate-200 focus:ring-blue-500'
                }`}
              />
              {errors.prenom && <p className="text-[11px] text-rose-500 mt-1">{errors.prenom}</p>}
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Nom <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                placeholder="Votre nom enregistré"
                value={formData.nom}
                onChange={(e) => setFormData({ ...formData, nom: e.target.value })}
                className={`w-full p-2.5 bg-slate-50 border rounded-xl text-xs font-medium focus:outline-none focus:ring-2 ${
                  errors.nom ? 'border-rose-400 ring-rose-200' : 'border-slate-200 focus:ring-blue-500'
                }`}
              />
              {errors.nom && <p className="text-[11px] text-rose-500 mt-1">{errors.nom}</p>}
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Email de contact <span className="text-rose-500">*</span>
              </label>
              <input
                type="email"
                placeholder="votre.email@exemple.fr"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className={`w-full p-2.5 bg-slate-50 border rounded-xl text-xs font-medium focus:outline-none focus:ring-2 ${
                  errors.email ? 'border-rose-400 ring-rose-200' : 'border-slate-200 focus:ring-blue-500'
                }`}
              />
              {errors.email && <p className="text-[11px] text-rose-500 mt-1">{errors.email}</p>}
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Nouveau Téléphone <span className="text-rose-500">*</span>
              </label>
              <input
                type="tel"
                placeholder="06 12 34 56 78"
                value={formData.telephone}
                onChange={(e) => setFormData({ ...formData, telephone: e.target.value })}
                className={`w-full p-2.5 bg-slate-50 border rounded-xl text-xs font-medium focus:outline-none focus:ring-2 ${
                  errors.telephone ? 'border-rose-400 ring-rose-200' : 'border-slate-200 focus:ring-blue-500'
                }`}
              />
              {errors.telephone && <p className="text-[11px] text-rose-500 mt-1">{errors.telephone}</p>}
            </div>
          </div>
        </div>

        {/* Section 2: Nouveaux renseignements */}
        <div className="space-y-4">
          <h2 className="text-xs font-black uppercase text-blue-800 tracking-wider pb-2 border-b border-slate-100 flex items-center gap-2">
            <MapPin className="w-4 h-4 text-blue-600" />
            2. Nouvelles coordonnées & situation
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Nouvelle Ville de Résidence</label>
              <input
                type="text"
                placeholder="Ex: Lyon, Marseille..."
                value={formData.ville}
                onChange={(e) => setFormData({ ...formData, ville: e.target.value })}
                className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Département</label>
              <input
                type="text"
                placeholder="Ex: 69, 13..."
                value={formData.departement}
                onChange={(e) => setFormData({ ...formData, departement: e.target.value })}
                className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Nouvelle Organisation / Entreprise</label>
              <input
                type="text"
                placeholder="Ex: Société Générale..."
                value={formData.organisation}
                onChange={(e) => setFormData({ ...formData, organisation: e.target.value })}
                className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Nouvelle Fonction</label>
              <input
                type="text"
                placeholder="Ex: Chef de projet..."
                value={formData.fonction}
                onChange={(e) => setFormData({ ...formData, fonction: e.target.value })}
                className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Explication / Remarques pour l'administrateur</label>
            <textarea
              rows={2}
              placeholder="Précisez ce qui a changé (ex: déménagement à Lyon pour nouvel emploi...)"
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>

        {/* Submit */}
        <div className="pt-4 border-t border-slate-100 flex items-center justify-end gap-3">
          <button
            type="button"
            onClick={() => onNavigate('accueil')}
            className="px-5 py-2.5 bg-slate-100 text-slate-700 rounded-xl text-xs font-bold hover:bg-slate-200"
          >
            Annuler
          </button>
          <button
            type="submit"
            disabled={isSubmitting}
            className="px-6 py-2.5 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl text-xs font-bold hover:from-blue-700 hover:to-indigo-700 transition-all shadow-md flex items-center gap-2"
          >
            <Send className="w-4 h-4" />
            <span>Soumettre la demande de modification</span>
          </button>
        </div>
      </form>
    </div>
  );
};
