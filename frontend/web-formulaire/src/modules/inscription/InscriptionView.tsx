import React, { useState } from 'react';
import { UserCheck, MapPin, Phone, Mail, Briefcase, GraduationCap, Calendar, Building, Send, AlertCircle, ArrowLeft } from 'lucide-react';
import { DemandeMember } from '@shared/types';
import { DemandeService } from '../../../../web-cartographie/src/services/demandeService';

interface InscriptionViewProps {
  onNavigate: (tab: 'accueil' | 'inscription' | 'mise-a-jour' | 'confirmation' | 'informations', submittedDemande?: DemandeMember) => void;
}

export const InscriptionView: React.FC<InscriptionViewProps> = ({ onNavigate }) => {
  const [formData, setFormData] = useState({
    nom: '',
    prenom: '',
    email: '',
    telephone: '',
    ville: '',
    departement: '',
    pays: 'France',
    situationProfessionnelle: 'Employé(e)',
    domaineEtude: '',
    anneeArriveeFrance: new Date().getFullYear().toString(),
    organisation: '',
    fonction: '',
    photo: '',
    notes: ''
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const validate = () => {
    const errs: Record<string, string> = {};
    if (!formData.nom.trim()) errs.nom = 'Le nom est obligatoire';
    if (!formData.prenom.trim()) errs.prenom = 'Le prénom est obligatoire';
    if (!formData.email.trim()) errs.email = 'L’email est obligatoire';
    else if (!formData.email.includes('@')) errs.email = 'Adresse email invalide';
    if (!formData.telephone.trim()) errs.telephone = 'Le téléphone est obligatoire';
    if (!formData.ville.trim()) errs.ville = 'La ville de résidence est obligatoire';

    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    setIsSubmitting(true);
    try {
      const createdDemande = DemandeService.submitDemande({
        type: 'INSCRIPTION',
        nom: formData.nom.trim(),
        prenom: formData.prenom.trim(),
        email: formData.email.trim(),
        telephone: formData.telephone.trim(),
        ville: formData.ville.trim(),
        departement: formData.departement.trim() || undefined,
        pays: formData.pays || 'France',
        situationProfessionnelle: formData.situationProfessionnelle,
        domaineEtude: formData.domaineEtude.trim() || undefined,
        anneeArriveeFrance: formData.anneeArriveeFrance || undefined,
        organisation: formData.organisation.trim() || undefined,
        fonction: formData.fonction.trim() || undefined,
        photo: formData.photo.trim() || undefined,
        notes: formData.notes.trim() || undefined
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
      <div className="bg-gradient-to-r from-emerald-800 to-teal-900 text-white rounded-2xl p-6 shadow-md border border-emerald-700/50">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-xl bg-emerald-500/20 border border-emerald-400/30 flex items-center justify-center font-bold text-emerald-300">
            <UserCheck className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-2xl font-black font-['Outfit']">Formulaire d'inscription Membre</h1>
            <p className="text-xs text-emerald-100/80 mt-0.5">
              Rejoignez l'annuaire de l'association Mbok de France en complétant les champs ci-dessous.
            </p>
          </div>
        </div>
      </div>

      {/* Form Card */}
      <form onSubmit={handleSubmit} className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-6">
        {/* Section 1: Identité */}
        <div className="space-y-4">
          <h2 className="text-xs font-black uppercase text-emerald-800 tracking-wider pb-2 border-b border-slate-100 flex items-center gap-2">
            <UserCheck className="w-4 h-4 text-emerald-600" />
            1. Identité & Coordonnées principales
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Prénom <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                placeholder="Ex: Modou"
                value={formData.prenom}
                onChange={(e) => setFormData({ ...formData, prenom: e.target.value })}
                className={`w-full p-2.5 bg-slate-50 border rounded-xl text-xs font-medium focus:outline-none focus:ring-2 ${
                  errors.prenom ? 'border-rose-400 ring-rose-200' : 'border-slate-200 focus:ring-emerald-500'
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
                placeholder="Ex: Mbaye"
                value={formData.nom}
                onChange={(e) => setFormData({ ...formData, nom: e.target.value })}
                className={`w-full p-2.5 bg-slate-50 border rounded-xl text-xs font-medium focus:outline-none focus:ring-2 ${
                  errors.nom ? 'border-rose-400 ring-rose-200' : 'border-slate-200 focus:ring-emerald-500'
                }`}
              />
              {errors.nom && <p className="text-[11px] text-rose-500 mt-1">{errors.nom}</p>}
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Adresse Email <span className="text-rose-500">*</span>
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="email"
                  placeholder="modou.mbaye@exemple.fr"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className={`w-full pl-9 pr-3 py-2.5 bg-slate-50 border rounded-xl text-xs font-medium focus:outline-none focus:ring-2 ${
                    errors.email ? 'border-rose-400 ring-rose-200' : 'border-slate-200 focus:ring-emerald-500'
                  }`}
                />
              </div>
              {errors.email && <p className="text-[11px] text-rose-500 mt-1">{errors.email}</p>}
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Numéro de Téléphone <span className="text-rose-500">*</span>
              </label>
              <div className="relative">
                <Phone className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="tel"
                  placeholder="06 12 34 56 78"
                  value={formData.telephone}
                  onChange={(e) => setFormData({ ...formData, telephone: e.target.value })}
                  className={`w-full pl-9 pr-3 py-2.5 bg-slate-50 border rounded-xl text-xs font-medium focus:outline-none focus:ring-2 ${
                    errors.telephone ? 'border-rose-400 ring-rose-200' : 'border-slate-200 focus:ring-emerald-500'
                  }`}
                />
              </div>
              {errors.telephone && <p className="text-[11px] text-rose-500 mt-1">{errors.telephone}</p>}
            </div>
          </div>
        </div>

        {/* Section 2: Résidence & Localisation */}
        <div className="space-y-4">
          <h2 className="text-xs font-black uppercase text-emerald-800 tracking-wider pb-2 border-b border-slate-100 flex items-center gap-2">
            <MapPin className="w-4 h-4 text-emerald-600" />
            2. Résidence & Géolocalisation
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="sm:col-span-1">
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Ville de Résidence <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                placeholder="Ex: Rennes, Paris, Lyon..."
                value={formData.ville}
                onChange={(e) => setFormData({ ...formData, ville: e.target.value })}
                className={`w-full p-2.5 bg-slate-50 border rounded-xl text-xs font-medium focus:outline-none focus:ring-2 ${
                  errors.ville ? 'border-rose-400 ring-rose-200' : 'border-slate-200 focus:ring-emerald-500'
                }`}
              />
              {errors.ville && <p className="text-[11px] text-rose-500 mt-1">{errors.ville}</p>}
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Département <span className="text-slate-400 font-normal">(Optionnel)</span>
              </label>
              <input
                type="text"
                placeholder="Ex: 35, 75, 69..."
                value={formData.departement}
                onChange={(e) => setFormData({ ...formData, departement: e.target.value })}
                className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Pays</label>
              <input
                type="text"
                value={formData.pays}
                onChange={(e) => setFormData({ ...formData, pays: e.target.value })}
                className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>
          </div>
          <p className="text-[11px] text-slate-500 italic">
            Note : Vous ne choisissez pas votre zone MDF. L’application affecte automatiquement votre fiche à la zone régionale correspondante dès la validation.
          </p>
        </div>

        {/* Section 3: Parcours Professionnel & Profil */}
        <div className="space-y-4">
          <h2 className="text-xs font-black uppercase text-emerald-800 tracking-wider pb-2 border-b border-slate-100 flex items-center gap-2">
            <Briefcase className="w-4 h-4 text-emerald-600" />
            3. Profil Professionnel & Parcours
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Situation Professionnelle</label>
              <select
                value={formData.situationProfessionnelle}
                onChange={(e) => setFormData({ ...formData, situationProfessionnelle: e.target.value })}
                className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium focus:outline-none focus:ring-2 focus:ring-emerald-500"
              >
                <option value="Employé(e)">Employé(e) / Salarié(e)</option>
                <option value="Étudiant(e)">Étudiant(e)</option>
                <option value="Entrepreneur / Indépendant">Entrepreneur / Indépendant</option>
                <option value="Recherche d'emploi">En recherche d'emploi</option>
                <option value="Autre">Autre</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Domaine d'étude / Spécialité</label>
              <input
                type="text"
                placeholder="Ex: Informatique, Droit, Santé..."
                value={formData.domaineEtude}
                onChange={(e) => setFormData({ ...formData, domaineEtude: e.target.value })}
                className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Organisation / Entreprise / Université</label>
              <input
                type="text"
                placeholder="Ex: Université de Rennes, Orange..."
                value={formData.organisation}
                onChange={(e) => setFormData({ ...formData, organisation: e.target.value })}
                className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Fonction / Poste occupé</label>
              <input
                type="text"
                placeholder="Ex: Ingénieur logiciel, Doctorant..."
                value={formData.fonction}
                onChange={(e) => setFormData({ ...formData, fonction: e.target.value })}
                className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Année d'arrivée en France</label>
              <input
                type="number"
                min="1950"
                max={new Date().getFullYear()}
                value={formData.anneeArriveeFrance}
                onChange={(e) => setFormData({ ...formData, anneeArriveeFrance: e.target.value })}
                className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Lien vers photo de profil <span className="text-slate-400 font-normal">(Optionnel)</span></label>
              <input
                type="url"
                placeholder="https://exemple.com/ma-photo.jpg"
                value={formData.photo}
                onChange={(e) => setFormData({ ...formData, photo: e.target.value })}
                className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>
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
            className="px-6 py-2.5 bg-gradient-to-r from-emerald-600 to-teal-600 text-white rounded-xl text-xs font-bold hover:from-emerald-700 hover:to-teal-700 transition-all shadow-md flex items-center gap-2"
          >
            <Send className="w-4 h-4" />
            <span>Soumettre ma demande d'inscription</span>
          </button>
        </div>
      </form>
    </div>
  );
};
