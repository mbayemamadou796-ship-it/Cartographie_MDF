import React, { useState } from 'react';
import { LogoMDF } from './LogoMDF';
import { DemandeMember } from '@shared/types';
import { DemandeService } from '../../../web-cartographie/src/services/demandeService';
import { CheckCircle2, ArrowRight, RotateCcw, ShieldCheck } from 'lucide-react';

interface GoogleFormRegistrationProps {
  onSwitchToBureau?: () => void;
}

export const GoogleFormRegistration: React.FC<GoogleFormRegistrationProps> = ({
  onSwitchToBureau
}) => {
  const [formData, setFormData] = useState({
    prenom: '',
    nom: '',
    telephone: '',
    email: '',
    ville: '',
    departement: '',
    situationProfessionnelle: 'Employé(e)',
    domaineEtude: '',
    organisation: '',
    fonction: '',
    anneeArriveeFrance: new Date().getFullYear().toString()
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submittedDemande, setSubmittedDemande] = useState<DemandeMember | null>(null);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const validate = () => {
    const errs: Record<string, string> = {};
    if (!formData.prenom.trim()) errs.prenom = 'Le prénom est obligatoire';
    if (!formData.nom.trim()) errs.nom = 'Le nom est obligatoire';
    if (!formData.telephone.trim()) errs.telephone = 'Le numéro de téléphone est obligatoire';
    if (!formData.email.trim()) errs.email = 'L’adresse e-mail est obligatoire';
    else if (!formData.email.includes('@')) errs.email = 'Veuillez saisir une adresse e-mail valide';
    if (!formData.ville.trim()) errs.ville = 'La ville de résidence est obligatoire';

    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) {
      // Scroll to top of form or first error
      window.scrollTo({ top: 100, behavior: 'smooth' });
      return;
    }

    setIsSubmitting(true);
    try {
      const created = DemandeService.submitDemande({
        type: 'INSCRIPTION',
        nom: formData.nom.trim(),
        prenom: formData.prenom.trim(),
        email: formData.email.trim(),
        telephone: formData.telephone.trim(),
        ville: formData.ville.trim(),
        departement: formData.departement.trim() || undefined,
        pays: 'France',
        situationProfessionnelle: formData.situationProfessionnelle,
        domaineEtude: formData.domaineEtude.trim() || undefined,
        organisation: formData.organisation.trim() || undefined,
        fonction: formData.fonction.trim() || undefined,
        anneeArriveeFrance: formData.anneeArriveeFrance || undefined
      });

      setSubmittedDemande(created);
      setIsSubmitted(true);
      setIsSubmitting(false);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } catch (err) {
      console.error(err);
      setIsSubmitting(false);
    }
  };

  const handleReset = () => {
    setFormData({
      prenom: '',
      nom: '',
      telephone: '',
      email: '',
      ville: '',
      departement: '',
      situationProfessionnelle: 'Employé(e)',
      domaineEtude: '',
      organisation: '',
      fonction: '',
      anneeArriveeFrance: new Date().getFullYear().toString()
    });
    setErrors({});
  };

  return (
    <div className="min-h-screen bg-[#e8f0d5] text-[#202124] antialiased py-6 px-3 sm:px-6 font-['Roboto',sans-serif]">
      {/* Top Admin Quick Switch Ribbon */}
      {onSwitchToBureau && (
        <div className="max-w-2xl mx-auto mb-4 flex items-center justify-between bg-white/90 backdrop-blur-xs px-4 py-2 rounded-xl border border-[#d2dcb8] shadow-2xs text-xs">
          <span className="text-[#3c4043] font-medium flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-[#80b31d] animate-pulse" />
            Portail Public Mbok de France
          </span>
          <button
            onClick={onSwitchToBureau}
            className="text-[#618a10] hover:text-[#436109] font-bold flex items-center gap-1 hover:underline transition-all"
          >
            <span>Accéder à la Cartographie / Bureau</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {isSubmitted ? (
        /* Confirmation State Page (Google Form Submission Success) */
        <div className="max-w-2xl mx-auto space-y-4">
          <div className="bg-white rounded-xl border border-[#dadce0] shadow-2xs overflow-hidden">
            {/* Top Green Accent Bar */}
            <div className="h-2.5 bg-[#80b31d]" />
            <div className="p-8 space-y-6">
              <div className="flex items-center gap-3">
                <LogoMDF size="sm" showText={false} />
                <h1 className="text-2xl font-normal text-[#202124]">
                  MDF - Refonte Base de Données
                </h1>
              </div>

              <div className="bg-[#f4f8eb] border border-[#d1e3b0] rounded-lg p-4 flex items-start gap-3">
                <CheckCircle2 className="w-6 h-6 text-[#72a118] shrink-0 mt-0.5" />
                <div className="space-y-1 text-sm text-[#3c4043]">
                  <p className="font-semibold text-[#202124]">
                    Votre réponse a été enregistrée avec succès.
                  </p>
                  <p>
                    Merci pour votre contribution au projet de refonte de la base de données Mbok de France.
                  </p>
                  {submittedDemande && (
                    <p className="text-xs text-[#5f6368] pt-1">
                      Numéro de référence : <span className="font-mono font-bold text-[#72a118]">{submittedDemande.id}</span>
                    </p>
                  )}
                </div>
              </div>

              <div className="pt-4 border-t border-[#f1f3f4] flex flex-wrap items-center gap-4 text-xs font-medium">
                <button
                  onClick={() => {
                    setIsSubmitted(false);
                    handleReset();
                  }}
                  className="text-[#72a118] hover:underline flex items-center gap-1.5"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span>Envoyer une autre réponse</span>
                </button>

                {onSwitchToBureau && (
                  <button
                    onClick={onSwitchToBureau}
                    className="text-[#3c4043] hover:text-[#202124] hover:underline flex items-center gap-1.5 ml-auto"
                  >
                    <ShieldCheck className="w-3.5 h-3.5 text-[#72a118]" />
                    <span>Espace administration / Cartographie</span>
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      ) : (
        /* Main Google Form Registration Layout */
        <form onSubmit={handleSubmit} className="max-w-2xl mx-auto space-y-3">
          
          {/* Header Banner Card with Logo & Intro Text */}
          <div className="bg-white rounded-xl border border-[#dadce0] shadow-2xs overflow-hidden">
            {/* Top Thick Olive-Green Line */}
            <div className="h-2.5 bg-[#80b31d]" />

            <div className="p-6 sm:p-8 space-y-5">
              {/* Logo Banner Header */}
              <div className="bg-[#f9fbf4] border border-[#e2ebd0] rounded-xl p-4 flex flex-col sm:flex-row items-center gap-4 text-center sm:text-left">
                <LogoMDF size="lg" showText={false} />
                <div>
                  <h2 className="text-xl font-bold text-[#202124] tracking-tight">
                    Mbok de France
                  </h2>
                  <p className="text-xs font-semibold text-[#618a10] italic">
                    au service de la fraternité !
                  </p>
                  <p className="text-[11px] text-[#5f6368] mt-1">
                    Formulaire officiel d'inscription et de mise à jour des membres.
                  </p>
                </div>
              </div>

              {/* Title */}
              <h1 className="text-2xl sm:text-3xl font-normal text-[#202124]">
                MDF - Refonte Base de Données
              </h1>

              {/* Intro Content */}
              <div className="text-sm text-[#3c4043] leading-relaxed space-y-3">
                <p className="font-semibold text-[#202124]">
                  Assalamu alaykoum warahmatullah,
                </p>
                <p>
                  Vous recevez ce formulaire car vous faites partie du groupe JOTAAYU MDF.
                </p>
                <p>
                  Dans le cadre de la refonte et de la mise à jour de notre base de données, nous vous invitons à bien vouloir prendre quelques minutes pour renseigner vos informations.
                </p>
                <div className="space-y-1 pt-1">
                  <p className="font-medium text-[#202124]">Ce formulaire nous permettra de :</p>
                  <ul className="list-disc list-inside pl-2 space-y-1 text-xs sm:text-sm text-[#4a4d51]">
                    <li>Mettre à jour vos coordonnées et informations personnelles.</li>
                    <li>Améliorer la communication et l'organisation des activités de l'association.</li>
                    <li>Garantir que tous les membres soient correctement informés des événements et projets.</li>
                  </ul>
                </div>
              </div>

              <div className="pt-3 border-t border-[#dadce0] text-xs text-[#d93025] font-medium">
                * Indique une question obligatoire
              </div>
            </div>
          </div>

          {/* Question Card: Prénom */}
          <div className="bg-white rounded-xl border border-[#dadce0] p-6 shadow-2xs space-y-3">
            <label className="block text-sm font-normal text-[#202124]">
              Prénom <span className="text-[#d93025]">*</span>
            </label>
            <input
              type="text"
              placeholder="Votre réponse"
              value={formData.prenom}
              onChange={(e) => setFormData({ ...formData, prenom: e.target.value })}
              className={`w-full max-w-md py-2 border-b text-sm focus:outline-none transition-colors ${
                errors.prenom
                  ? 'border-[#d93025] focus:border-[#d93025]'
                  : 'border-[#dadce0] focus:border-[#80b31d]'
              }`}
            />
            {errors.prenom && (
              <p className="text-xs text-[#d93025] flex items-center gap-1">
                <span>⚠</span> {errors.prenom}
              </p>
            )}
          </div>

          {/* Question Card: Nom */}
          <div className="bg-white rounded-xl border border-[#dadce0] p-6 shadow-2xs space-y-3">
            <label className="block text-sm font-normal text-[#202124]">
              Nom <span className="text-[#d93025]">*</span>
            </label>
            <input
              type="text"
              placeholder="Votre réponse"
              value={formData.nom}
              onChange={(e) => setFormData({ ...formData, nom: e.target.value })}
              className={`w-full max-w-md py-2 border-b text-sm focus:outline-none transition-colors ${
                errors.nom
                  ? 'border-[#d93025] focus:border-[#d93025]'
                  : 'border-[#dadce0] focus:border-[#80b31d]'
              }`}
            />
            {errors.nom && (
              <p className="text-xs text-[#d93025] flex items-center gap-1">
                <span>⚠</span> {errors.nom}
              </p>
            )}
          </div>

          {/* Question Card: Numéro de Téléphone */}
          <div className="bg-white rounded-xl border border-[#dadce0] p-6 shadow-2xs space-y-3">
            <label className="block text-sm font-normal text-[#202124]">
              Numéro de Téléphone <span className="text-[#d93025]">*</span>
            </label>
            <input
              type="tel"
              placeholder="Votre réponse (ex: 07 73 95 90 92)"
              value={formData.telephone}
              onChange={(e) => setFormData({ ...formData, telephone: e.target.value })}
              className={`w-full max-w-md py-2 border-b text-sm focus:outline-none transition-colors ${
                errors.telephone
                  ? 'border-[#d93025] focus:border-[#d93025]'
                  : 'border-[#dadce0] focus:border-[#80b31d]'
              }`}
            />
            {errors.telephone && (
              <p className="text-xs text-[#d93025] flex items-center gap-1">
                <span>⚠</span> {errors.telephone}
              </p>
            )}
          </div>

          {/* Question Card: Adresse e-mail */}
          <div className="bg-white rounded-xl border border-[#dadce0] p-6 shadow-2xs space-y-3">
            <label className="block text-sm font-normal text-[#202124]">
              Adresse e-mail <span className="text-[#d93025]">*</span>
            </label>
            <input
              type="email"
              placeholder="Votre réponse (ex: exemple@gmail.com)"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              className={`w-full max-w-md py-2 border-b text-sm focus:outline-none transition-colors ${
                errors.email
                  ? 'border-[#d93025] focus:border-[#d93025]'
                  : 'border-[#dadce0] focus:border-[#80b31d]'
              }`}
            />
            {errors.email && (
              <p className="text-xs text-[#d93025] flex items-center gap-1">
                <span>⚠</span> {errors.email}
              </p>
            )}
          </div>

          {/* Question Card: Ville de résidence */}
          <div className="bg-white rounded-xl border border-[#dadce0] p-6 shadow-2xs space-y-3">
            <label className="block text-sm font-normal text-[#202124]">
              Ville de résidence <span className="text-[#d93025]">*</span>
            </label>
            <p className="text-xs text-[#5f6368]">
              Indiquez la commune ou ville où vous résidez en France (ex: Rennes, Paris, Lyon, Marseille...)
            </p>
            <input
              type="text"
              placeholder="Votre réponse"
              value={formData.ville}
              onChange={(e) => setFormData({ ...formData, ville: e.target.value })}
              className={`w-full max-w-md py-2 border-b text-sm focus:outline-none transition-colors ${
                errors.ville
                  ? 'border-[#d93025] focus:border-[#d93025]'
                  : 'border-[#dadce0] focus:border-[#80b31d]'
              }`}
            />
            {errors.ville && (
              <p className="text-xs text-[#d93025] flex items-center gap-1">
                <span>⚠</span> {errors.ville}
              </p>
            )}
          </div>

          {/* Question Card: Département */}
          <div className="bg-white rounded-xl border border-[#dadce0] p-6 shadow-2xs space-y-3">
            <label className="block text-sm font-normal text-[#202124]">
              Département <span className="text-xs text-[#5f6368]">(Optionnel)</span>
            </label>
            <input
              type="text"
              placeholder="Votre réponse (ex: 35, 75, 69...)"
              value={formData.departement}
              onChange={(e) => setFormData({ ...formData, departement: e.target.value })}
              className="w-full max-w-md py-2 border-b border-[#dadce0] focus:border-[#80b31d] text-sm focus:outline-none transition-colors"
            />
          </div>

          {/* Question Card: Situation professionnelle */}
          <div className="bg-white rounded-xl border border-[#dadce0] p-6 shadow-2xs space-y-3">
            <label className="block text-sm font-normal text-[#202124]">
              Situation professionnelle
            </label>
            <div className="space-y-2 pt-1">
              {[
                'Employé(e) / Salarié(e)',
                'Étudiant(e)',
                'Entrepreneur / Indépendant',
                'En recherche d\'emploi',
                'Autre'
              ].map((option) => (
                <label key={option} className="flex items-center gap-3 cursor-pointer text-sm text-[#3c4043] hover:text-[#202124]">
                  <input
                    type="radio"
                    name="situationProfessionnelle"
                    value={option}
                    checked={formData.situationProfessionnelle === option}
                    onChange={(e) => setFormData({ ...formData, situationProfessionnelle: e.target.value })}
                    className="w-4 h-4 text-[#80b31d] focus:ring-[#80b31d] border-[#dadce0]"
                  />
                  <span>{option}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Question Card: Domaine d'étude / Spécialité */}
          <div className="bg-white rounded-xl border border-[#dadce0] p-6 shadow-2xs space-y-3">
            <label className="block text-sm font-normal text-[#202124]">
              Domaine d'étude / Spécialité <span className="text-xs text-[#5f6368]">(Optionnel)</span>
            </label>
            <input
              type="text"
              placeholder="Votre réponse (ex: Informatique, Management, Santé, Droit...)"
              value={formData.domaineEtude}
              onChange={(e) => setFormData({ ...formData, domaineEtude: e.target.value })}
              className="w-full max-w-md py-2 border-b border-[#dadce0] focus:border-[#80b31d] text-sm focus:outline-none transition-colors"
            />
          </div>

          {/* Question Card: Organisation / Entreprise / Université */}
          <div className="bg-white rounded-xl border border-[#dadce0] p-6 shadow-2xs space-y-3">
            <label className="block text-sm font-normal text-[#202124]">
              Organisation / Entreprise / Université <span className="text-xs text-[#5f6368]">(Optionnel)</span>
            </label>
            <input
              type="text"
              placeholder="Votre réponse"
              value={formData.organisation}
              onChange={(e) => setFormData({ ...formData, organisation: e.target.value })}
              className="w-full max-w-md py-2 border-b border-[#dadce0] focus:border-[#80b31d] text-sm focus:outline-none transition-colors"
            />
          </div>

          {/* Question Card: Fonction / Poste occupé */}
          <div className="bg-white rounded-xl border border-[#dadce0] p-6 shadow-2xs space-y-3">
            <label className="block text-sm font-normal text-[#202124]">
              Fonction / Poste occupé <span className="text-xs text-[#5f6368]">(Optionnel)</span>
            </label>
            <input
              type="text"
              placeholder="Votre réponse"
              value={formData.fonction}
              onChange={(e) => setFormData({ ...formData, fonction: e.target.value })}
              className="w-full max-w-md py-2 border-b border-[#dadce0] focus:border-[#80b31d] text-sm focus:outline-none transition-colors"
            />
          </div>

          {/* Question Card: Année d'arrivée en France */}
          <div className="bg-white rounded-xl border border-[#dadce0] p-6 shadow-2xs space-y-3">
            <label className="block text-sm font-normal text-[#202124]">
              Année d'arrivée en France <span className="text-xs text-[#5f6368]">(Optionnel)</span>
            </label>
            <input
              type="number"
              min="1950"
              max={new Date().getFullYear()}
              placeholder="Ex: 2021"
              value={formData.anneeArriveeFrance}
              onChange={(e) => setFormData({ ...formData, anneeArriveeFrance: e.target.value })}
              className="w-[#120px] py-2 border-b border-[#dadce0] focus:border-[#80b31d] text-sm focus:outline-none transition-colors"
            />
          </div>

          {/* Bottom Action Section */}
          <div className="pt-2 flex flex-col sm:flex-row items-center justify-between gap-4 pb-12">
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full sm:w-auto px-7 py-2.5 bg-[#80b31d] hover:bg-[#70a017] text-white text-sm font-semibold rounded-md shadow-2xs transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
            >
              {isSubmitting ? (
                <span>Envoi en cours...</span>
              ) : (
                <span>Envoyer</span>
              )}
            </button>

            <button
              type="button"
              onClick={handleReset}
              className="text-xs font-semibold text-[#5f6368] hover:text-[#202124] hover:underline cursor-pointer"
            >
              Effacer le formulaire
            </button>
          </div>

          {/* Google Form Footer Signature */}
          <div className="text-center text-[11px] text-[#5f6368] space-y-1 pb-8">
            <p>Formulaire officiel de recensement Mbok de France — Association Nationale.</p>
            <p className="text-[10px] text-[#80868b]">
              Ne transmettez jamais votre mot de passe via ce formulaire.
            </p>
          </div>
        </form>
      )}
    </div>
  );
};
