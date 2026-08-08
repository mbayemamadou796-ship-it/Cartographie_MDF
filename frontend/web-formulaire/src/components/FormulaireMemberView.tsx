import React, { useState, useEffect, useRef } from 'react';
import { 
  getAllFormFields, 
  FormFieldSchema, 
  FRENCH_ZONES,
  getStoredCustomFieldsSchema 
} from '@shared/config/memberFields';
import { DemandeMember, CustomField } from '@shared/types';
import { DemandeService } from '../../../web-cartographie/src/services/demandeService';
import { LogoMbok } from '../../../web-cartographie/src/modules/parametres/LogoMbok';
import { 
  UserPlus, 
  RefreshCw, 
  Search, 
  CheckCircle2, 
  Clock, 
  XCircle, 
  Upload, 
  Camera, 
  Trash2, 
  Plus, 
  Sliders, 
  Compass, 
  MapPin, 
  Send, 
  ShieldCheck, 
  ExternalLink,
  ArrowRight,
  FileText
} from 'lucide-react';

interface FormulaireMemberViewProps {
  onSwitchToBureau?: () => void;
  logoUrl?: string;
}

export const FormulaireMemberView: React.FC<FormulaireMemberViewProps> = ({
  onSwitchToBureau,
  logoUrl: propLogoUrl
}) => {
  const [activeTab, setActiveTab] = useState<'inscription' | 'update' | 'tracking'>('inscription');
  
  // Synchronized Logo URL state from prop or localStorage settings
  const [effectiveLogoUrl, setEffectiveLogoUrl] = useState<string | undefined>(() => {
    if (propLogoUrl) return propLogoUrl;
    try {
      const saved = localStorage.getItem('mbok_de_france_app_settings_v1');
      if (saved) {
        const parsed = JSON.parse(saved);
        return parsed.logoUrl;
      }
    } catch {}
    return undefined;
  });

  useEffect(() => {
    if (propLogoUrl !== undefined) {
      setEffectiveLogoUrl(propLogoUrl);
    }
  }, [propLogoUrl]);

  useEffect(() => {
    const syncLogoSettings = () => {
      try {
        const saved = localStorage.getItem('mbok_de_france_app_settings_v1');
        if (saved) {
          const parsed = JSON.parse(saved);
          setEffectiveLogoUrl(parsed.logoUrl);
        }
      } catch {}
    };

    window.addEventListener('storage', syncLogoSettings);
    const interval = setInterval(syncLogoSettings, 1000);
    return () => {
      window.removeEventListener('storage', syncLogoSettings);
      clearInterval(interval);
    };
  }, []);

  // Dynamic fields configuration (automatically reloaded to reflect any admin field additions)
  const [fieldsSchema, setFieldsSchema] = useState<FormFieldSchema[]>(() => getAllFormFields());

  useEffect(() => {
    // Listen to local storage changes or periodically sync schema
    const updateSchema = () => {
      setFieldsSchema(getAllFormFields());
    };
    window.addEventListener('storage', updateSchema);
    return () => window.removeEventListener('storage', updateSchema);
  }, []);

  // Form State
  const [formData, setFormData] = useState<Omit<DemandeMember, 'id' | 'status' | 'createdAt' | 'type'>>({
    prenom: '',
    nom: '',
    telephone: '',
    email: '',
    photo: '',
    zone: 'Île-de-France',
    situationProfessionnelle: 'Salarié(e) / Employé(e)',
    domaineEtude: '',
    organisation: '',
    fonction: '',
    anneeArriveeFrance: '',
    ville: '',
    departement: '',
    pays: 'France',
    champsPersonnalises: []
  });

  const [customFields, setCustomFields] = useState<CustomField[]>([]);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submittedDemande, setSubmittedDemande] = useState<DemandeMember | null>(null);
  
  // Tracking Tab State
  const [trackingId, setTrackingId] = useState('');
  const [trackedDemande, setTrackedDemande] = useState<DemandeMember | null>(null);
  const [trackingSearched, setTrackingSearched] = useState(false);

  // Update Tab Search State
  const [searchQuery, setSearchQuery] = useState('');

  const photoInputRef = useRef<HTMLInputElement>(null);

  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        alert("La photo ne doit pas dépasser 5 Mo.");
        return;
      }
      const reader = new FileReader();
      reader.onload = () => {
        if (typeof reader.result === 'string') {
          setFormData((prev) => ({ ...prev, photo: reader.result as string }));
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handleAddCustomField = () => {
    const newField: CustomField = {
      id: `field-${Date.now()}-${Math.random().toString(36).substring(2, 5)}`,
      label: '',
      value: ''
    };
    setCustomFields((prev) => [...prev, newField]);
  };

  const handleUpdateCustomField = (id: string, key: 'label' | 'value', val: string) => {
    setCustomFields((prev) =>
      prev.map((f) => (f.id === id ? { ...f, [key]: val } : f))
    );
  };

  const handleRemoveCustomField = (id: string) => {
    setCustomFields((prev) => prev.filter((f) => f.id !== id));
  };

  const validate = () => {
    const errs: Record<string, string> = {};
    if (!formData.prenom.trim()) errs.prenom = 'Le prénom est obligatoire';
    if (!formData.nom.trim()) errs.nom = 'Le nom est obligatoire';
    if (!formData.telephone.trim()) errs.telephone = 'Le numéro de téléphone est obligatoire';
    if (!formData.email.trim()) errs.email = 'L’adresse e-mail est obligatoire';
    else if (!formData.email.includes('@')) errs.email = 'Saisissez une adresse e-mail valide';
    if (!formData.ville.trim()) errs.ville = 'La ville de résidence est obligatoire';
    if (!formData.zone) errs.zone = 'La zone MDF régionale est obligatoire';

    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) {
      window.scrollTo({ top: 150, behavior: 'smooth' });
      return;
    }

    setIsSubmitting(true);
    try {
      const created = DemandeService.submitDemande({
        type: activeTab === 'update' ? 'MISE_A_JOUR' : 'INSCRIPTION',
        ...formData,
        champsPersonnalises: customFields.filter((cf) => cf.label.trim())
      });

      setSubmittedDemande(created);
      setIsSubmitting(false);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } catch (err) {
      console.error(err);
      setIsSubmitting(false);
    }
  };

  const handleSearchTracking = (e: React.FormEvent) => {
    e.preventDefault();
    if (!trackingId.trim()) return;
    const demandes = DemandeService.getDemandes();
    const found = demandes.find(
      (d) =>
        d.id.toLowerCase() === trackingId.trim().toLowerCase() ||
        d.email.toLowerCase() === trackingId.trim().toLowerCase() ||
        d.telephone.includes(trackingId.trim())
    );
    setTrackedDemande(found || null);
    setTrackingSearched(true);
  };

  const handleResetForm = () => {
    setFormData({
      prenom: '',
      nom: '',
      telephone: '',
      email: '',
      photo: '',
      zone: 'Île-de-France',
      situationProfessionnelle: 'Salarié(e) / Employé(e)',
      domaineEtude: '',
      organisation: '',
      fonction: '',
      anneeArriveeFrance: '',
      ville: '',
      departement: '',
      pays: 'France',
      champsPersonnalises: []
    });
    setCustomFields([]);
    setErrors({});
    setSubmittedDemande(null);
  };

  return (
    <div className="min-h-screen bg-slate-100 text-slate-800 font-['Plus_Jakarta_Sans',sans-serif] antialiased flex flex-col">
      
      {/* Top Admin Switch Ribbon */}
      {onSwitchToBureau && (
        <div className="bg-slate-900 text-slate-300 py-1.5 px-4 text-xs">
          <div className="max-w-6xl mx-auto flex items-center justify-end">
            <button
              onClick={onSwitchToBureau}
              className="text-emerald-400 hover:text-emerald-300 font-bold flex items-center gap-1.5 hover:underline cursor-pointer transition-all"
            >
              <span>Basculer vers la Cartographie / Bureau</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      )}

      {/* Main Brand Header Banner */}
      <header className="bg-white border-b border-emerald-200 shadow-xs sticky top-0 z-30">
        <div className="max-w-6xl mx-auto px-4 py-3 sm:py-4 flex items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <LogoMbok size="md" showText={true} showBadge={false} logoUrl={effectiveLogoUrl} />
          </div>
        </div>
      </header>

      {/* Body Content */}
      <main className="flex-1 max-w-4xl w-full mx-auto px-4 py-6 sm:py-8 space-y-6">

        {/* Successful Submission View */}
        {submittedDemande ? (
          <div className="bg-white rounded-3xl p-6 sm:p-8 border border-emerald-200 shadow-xl space-y-6 text-center max-w-2xl mx-auto animate-in zoom-in-95 duration-200">
            <div className="w-16 h-16 bg-emerald-100 rounded-2xl flex items-center justify-center mx-auto text-emerald-600 shadow-inner">
              <CheckCircle2 className="w-10 h-10 stroke-[2.5]" />
            </div>

            <div className="space-y-3 py-2">
              <p className="text-xl sm:text-2xl font-bold text-emerald-800 font-serif" dir="rtl">
                بارك الله فيك وجزاك الله خيرا
              </p>
              <h2 className="text-xl sm:text-2xl font-bold text-slate-900 font-['Outfit']">
                Tes informations ont bien été enregistrées.
              </h2>
              <p className="text-sm sm:text-base font-semibold text-emerald-900 bg-emerald-50/80 py-2.5 px-5 rounded-2xl border border-emerald-200 inline-block shadow-xs">
                Qu’Allah vous récompense pour votre participation.
              </p>
            </div>

            <div className="bg-emerald-50/80 p-4 rounded-2xl border border-emerald-200 text-left space-y-2 text-xs">
              <p className="font-bold text-emerald-950 pb-2 border-b border-emerald-200 text-sm">
                Informations enregistrées :
              </p>
              <p className="text-slate-700">
                <strong>Nom complet :</strong> {submittedDemande.prenom} {submittedDemande.nom}
              </p>
              <p className="text-slate-700">
                <strong>Zone MDF :</strong> {submittedDemande.zone || submittedDemande.region || 'Île-de-France'}
              </p>
              <p className="text-slate-700">
                <strong>Ville :</strong> {submittedDemande.ville}
              </p>
            </div>

            <div className="pt-2 flex justify-center text-xs">
              <button
                onClick={handleResetForm}
                className="px-6 py-3 bg-gradient-to-r from-[#2be39d] via-[#48c92a] to-[#8de02d] hover:brightness-105 text-emerald-950 font-extrabold rounded-2xl shadow-md transition-all cursor-pointer text-sm"
              >
                Soumettre un autre formulaire
              </button>
            </div>
          </div>
        ) : (
          
          /* Registration or Update Form View (Matching Web-Cartographie Fields & Design) */
          <form onSubmit={handleSubmit} className="space-y-6">

            {/* Intro Header Card */}
            <div className="bg-white rounded-3xl p-6 border border-emerald-200 shadow-sm space-y-4">
              <div className="border-b border-emerald-100 pb-3">
                <h1 className="text-xl sm:text-2xl font-bold text-slate-900 font-['Outfit'] flex items-center gap-2">
                  <UserPlus className="w-6 h-6 text-emerald-600" />
                  <span>MDF - Refonte Base de Données</span>
                </h1>
              </div>

              {/* Text requested by user */}
              <div className="space-y-3 text-slate-700 text-xs sm:text-sm leading-relaxed">
                <p className="text-base sm:text-lg font-bold text-emerald-900 font-serif text-center py-1.5 bg-emerald-50/70 rounded-2xl border border-emerald-200/80" dir="rtl">
                  السلام عليكم ورحمة الله وبركاته
                </p>

                <p className="font-medium text-slate-800">
                  Dans le cadre de la refonte et de la mise à jour de notre base de données, nous vous invitons à bien vouloir prendre quelques minutes pour renseigner vos informations.
                </p>

                <div className="bg-slate-50 p-4 rounded-2xl border border-emerald-100 space-y-2">
                  <p className="font-semibold text-emerald-900">Ce formulaire nous permettra de :</p>
                  <ul className="space-y-1.5 text-slate-700 font-medium list-disc pl-5">
                    <li>Mettre à jour vos coordonnées et informations personnelles.</li>
                    <li>Améliorer la communication et l’organisation des activités de l’association.</li>
                    <li>Garantir que tous les membres soient correctement informés des événements et projets.</li>
                  </ul>
                </div>

                <p className="font-medium text-slate-800">
                  Le formulaire est simple et rapide : il ne vous prendra pas plus de 2 à 3 minutes à compléter.
                </p>

                <p className="text-xs font-medium text-slate-600 bg-amber-50/80 p-3 rounded-xl border border-amber-200 text-slate-700">
                  🔒 Toutes les informations resteront strictement confidentielles et seront utilisées uniquement pour les activités de MDF.
                </p>

                <div className="text-center pt-2 space-y-1">
                  <p className="text-base sm:text-lg font-bold text-emerald-800 font-serif" dir="rtl">
                    بارك الله فيك وجزاك الله خيرا
                  </p>
                  <p className="font-semibold text-slate-700">
                    pour votre temps et votre précieuse collaboration.
                  </p>
                </div>
              </div>

              {errors.submit && (
                <div className="p-3 bg-rose-50 border border-rose-200 text-rose-700 rounded-xl text-xs font-semibold">
                  ⚠️ {errors.submit}
                </div>
              )}
            </div>

            {/* Section 1: Identité & Coordonnées */}
            <div className="bg-white rounded-3xl p-6 border border-emerald-200 shadow-sm space-y-4">
              <h3 className="font-bold text-emerald-800 uppercase tracking-wider text-[11px] pb-1 border-b border-emerald-200 flex items-center gap-2">
                <span>1. Identité & Coordonnées Principales</span>
              </h3>

              {/* Photo Upload Box */}
              <div className="flex flex-col sm:flex-row items-center gap-4 bg-emerald-50/70 p-4 rounded-2xl border border-emerald-200">
                <div className="relative group shrink-0">
                  {formData.photo ? (
                    <img
                      src={formData.photo}
                      alt="Aperçu photo"
                      className="w-16 h-16 rounded-2xl object-cover border-2 border-emerald-500 shadow-xs"
                    />
                  ) : (
                    <div className="w-16 h-16 rounded-2xl bg-white border-2 border-dashed border-emerald-300 flex flex-col items-center justify-center text-emerald-700 shadow-2xs">
                      <Camera className="w-5 h-5 stroke-[2]" />
                      <span className="text-[9px] font-bold mt-0.5">Photo</span>
                    </div>
                  )}
                </div>

                <div className="flex-1 space-y-1.5 w-full">
                  <label className="block text-xs font-bold text-slate-800">
                    Photo de profil du membre (Optionnel)
                  </label>
                  <div className="flex flex-wrap items-center gap-2">
                    <input
                      type="file"
                      ref={photoInputRef}
                      accept="image/*"
                      onChange={handlePhotoUpload}
                      className="hidden"
                    />
                    <button
                      type="button"
                      onClick={() => photoInputRef.current?.click()}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold shadow-xs transition-all cursor-pointer"
                    >
                      <Upload className="w-3.5 h-3.5" />
                      <span>Uploader une photo</span>
                    </button>

                    {formData.photo && (
                      <button
                        type="button"
                        onClick={() => setFormData({ ...formData, photo: '' })}
                        className="inline-flex items-center gap-1 px-2.5 py-1.5 bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 rounded-xl text-xs font-semibold transition-colors cursor-pointer"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                        <span>Supprimer</span>
                      </button>
                    )}
                  </div>
                </div>
              </div>

              {/* Grid: Prénom, Nom, Téléphone, Email */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    Prénom <span className="text-rose-600">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="Ex: Souleymane"
                    value={formData.prenom}
                    onChange={(e) => setFormData({ ...formData, prenom: e.target.value })}
                    className={`w-full bg-slate-50 border rounded-xl px-3.5 py-2.5 text-slate-800 placeholder-slate-400 focus:bg-white focus:border-emerald-500 outline-none font-medium ${
                      errors.prenom ? 'border-rose-300 bg-rose-50' : 'border-emerald-200'
                    }`}
                  />
                  {errors.prenom && <p className="text-[11px] text-rose-600 mt-1 font-semibold">{errors.prenom}</p>}
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    Nom <span className="text-rose-600">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="Ex: Ndiaye"
                    value={formData.nom}
                    onChange={(e) => setFormData({ ...formData, nom: e.target.value })}
                    className={`w-full bg-slate-50 border rounded-xl px-3.5 py-2.5 text-slate-800 placeholder-slate-400 focus:bg-white focus:border-emerald-500 outline-none font-medium ${
                      errors.nom ? 'border-rose-300 bg-rose-50' : 'border-emerald-200'
                    }`}
                  />
                  {errors.nom && <p className="text-[11px] text-rose-600 mt-1 font-semibold">{errors.nom}</p>}
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    Numéro de téléphone <span className="text-rose-600">*</span>
                  </label>
                  <input
                    type="tel"
                    required
                    placeholder="Ex: 06 12 34 56 78"
                    value={formData.telephone}
                    onChange={(e) => setFormData({ ...formData, telephone: e.target.value })}
                    className={`w-full bg-slate-50 border rounded-xl px-3.5 py-2.5 text-slate-800 placeholder-slate-400 focus:bg-white focus:border-emerald-500 outline-none font-medium ${
                      errors.telephone ? 'border-rose-300 bg-rose-50' : 'border-emerald-200'
                    }`}
                  />
                  {errors.telephone && <p className="text-[11px] text-rose-600 mt-1 font-semibold">{errors.telephone}</p>}
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    Adresse e-mail <span className="text-rose-600">*</span>
                  </label>
                  <input
                    type="email"
                    required
                    placeholder="Ex: souleymane.ndiaye@example.com"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className={`w-full bg-slate-50 border rounded-xl px-3.5 py-2.5 text-slate-800 placeholder-slate-400 focus:bg-white focus:border-emerald-500 outline-none font-medium ${
                      errors.email ? 'border-rose-300 bg-rose-50' : 'border-emerald-200'
                    }`}
                  />
                  {errors.email && <p className="text-[11px] text-rose-600 mt-1 font-semibold">{errors.email}</p>}
                </div>
              </div>
            </div>

            {/* Section 2: Zone & Parcours Professionnel/Académique */}
            <div className="bg-white rounded-3xl p-6 border border-emerald-200 shadow-sm space-y-4">
              <h3 className="font-bold text-emerald-800 uppercase tracking-wider text-[11px] pb-1 border-b border-emerald-200">
                2. Zone MDF, Parcours & Situation
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    Zone MDF Régionale <span className="text-rose-600">*</span>
                  </label>
                  <select
                    required
                    value={formData.zone}
                    onChange={(e) => setFormData({ ...formData, zone: e.target.value, region: e.target.value })}
                    className="w-full bg-slate-50 border border-emerald-200 rounded-xl px-3.5 py-2.5 text-slate-800 focus:bg-white focus:border-emerald-500 outline-none font-medium cursor-pointer"
                  >
                    <option value="" disabled>-- Sélectionner une zone --</option>
                    {FRENCH_ZONES.map((z) => (
                      <option key={z} value={z}>{z}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    Situation professionnelle
                  </label>
                  <select
                    value={formData.situationProfessionnelle}
                    onChange={(e) => setFormData({ ...formData, situationProfessionnelle: e.target.value })}
                    className="w-full bg-slate-50 border border-emerald-200 rounded-xl px-3.5 py-2.5 text-slate-800 focus:bg-white focus:border-emerald-500 outline-none font-medium cursor-pointer"
                  >
                    <option value="Salarié(e) / Employé(e)">Salarié(e) / Employé(e)</option>
                    <option value="Étudiant(e)">Étudiant(e)</option>
                    <option value="Entrepreneur / Indépendant">Entrepreneur / Indépendant</option>
                    <option value="En recherche d'emploi">En recherche d'emploi</option>
                    <option value="Cadre / Dirigeant">Cadre / Dirigeant</option>
                    <option value="Autre">Autre</option>
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    Domaine d'étude / Spécialité
                  </label>
                  <input
                    type="text"
                    placeholder="Ex: Informatique, Droit, Santé, Commerce..."
                    value={formData.domaineEtude}
                    onChange={(e) => setFormData({ ...formData, domaineEtude: e.target.value })}
                    className="w-full bg-slate-50 border border-emerald-200 rounded-xl px-3.5 py-2.5 text-slate-800 placeholder-slate-400 focus:bg-white focus:border-emerald-500 outline-none font-medium"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    Organisation / Entreprise / Université
                  </label>
                  <input
                    type="text"
                    placeholder="Ex: Université de Rennes, Capgemini..."
                    value={formData.organisation}
                    onChange={(e) => setFormData({ ...formData, organisation: e.target.value })}
                    className="w-full bg-slate-50 border border-emerald-200 rounded-xl px-3.5 py-2.5 text-slate-800 placeholder-slate-400 focus:bg-white focus:border-emerald-500 outline-none font-medium"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    Fonction / Poste occupé
                  </label>
                  <input
                    type="text"
                    placeholder="Ex: Ingénieur, Analyste, Étudiant M2..."
                    value={formData.fonction}
                    onChange={(e) => setFormData({ ...formData, fonction: e.target.value })}
                    className="w-full bg-slate-50 border border-emerald-200 rounded-xl px-3.5 py-2.5 text-slate-800 placeholder-slate-400 focus:bg-white focus:border-emerald-500 outline-none font-medium"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    Année d'arrivée en France
                  </label>
                  <input
                    type="text"
                    placeholder="Ex: 2018, 2021..."
                    value={formData.anneeArriveeFrance}
                    onChange={(e) => setFormData({ ...formData, anneeArriveeFrance: e.target.value })}
                    className="w-full bg-slate-50 border border-emerald-200 rounded-xl px-3.5 py-2.5 text-slate-800 placeholder-slate-400 focus:bg-white focus:border-emerald-500 outline-none font-medium"
                  />
                </div>
              </div>
            </div>

            {/* Section 3: Ville de Résidence & Localisation Cartographique */}
            <div className="bg-white rounded-3xl p-6 border border-emerald-200 shadow-sm space-y-4">
              <h3 className="font-bold text-emerald-800 uppercase tracking-wider text-[11px] pb-1 border-b border-emerald-200">
                3. Ville de Résidence & Localisation
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    Ville de résidence (Commune) <span className="text-rose-600">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="Ex: Saint-Denis, Rennes, Lyon, Marseille..."
                    value={formData.ville}
                    onChange={(e) => setFormData({ ...formData, ville: e.target.value })}
                    className={`w-full bg-slate-50 border rounded-xl px-3.5 py-2.5 text-slate-800 placeholder-slate-400 focus:bg-white focus:border-emerald-500 outline-none font-medium ${
                      errors.ville ? 'border-rose-300 bg-rose-50' : 'border-emerald-200'
                    }`}
                  />
                  {errors.ville && <p className="text-[11px] text-rose-600 mt-1 font-semibold">{errors.ville}</p>}
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    Département
                  </label>
                  <input
                    type="text"
                    placeholder="Ex: Seine-Saint-Denis (93), Ille-et-Vilaine (35)..."
                    value={formData.departement}
                    onChange={(e) => setFormData({ ...formData, departement: e.target.value })}
                    className="w-full bg-slate-50 border border-emerald-200 rounded-xl px-3.5 py-2.5 text-slate-800 placeholder-slate-400 focus:bg-white focus:border-emerald-500 outline-none font-medium"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    Pays
                  </label>
                  <input
                    type="text"
                    value={formData.pays}
                    disabled
                    className="w-full bg-slate-100 border border-slate-200 rounded-xl px-3.5 py-2.5 text-slate-600 font-medium"
                  />
                </div>
              </div>
            </div>

            {/* Section 4: Champs Personnalisés Dynamiques (Matching Admin-added custom fields) */}
            <div className="bg-white rounded-3xl p-6 border border-emerald-200 shadow-sm space-y-4">
              <div className="flex items-center justify-between pb-1 border-b border-emerald-200">
                <h3 className="font-bold text-emerald-800 uppercase tracking-wider text-[11px] flex items-center gap-1.5">
                  <Sliders className="w-4 h-4 text-emerald-600" />
                  <span>4. Renseignements Personnalisés / Libres</span>
                </h3>

                <button
                  type="button"
                  onClick={handleAddCustomField}
                  className="inline-flex items-center gap-1 px-3 py-1 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg font-bold text-xs shadow-xs transition-all cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Ajouter une information</span>
                </button>
              </div>

              {customFields.length === 0 ? (
                <p className="text-xs text-slate-500 italic bg-slate-50 p-3 rounded-xl border border-slate-200">
                  Avez-vous d'autres informations particulières à préciser (ex: Cotisation, Rôle, Disponibilité) ? Cliquez sur "Ajouter une information".
                </p>
              ) : (
                <div className="space-y-2.5">
                  {customFields.map((cf) => (
                    <div key={cf.id} className="flex items-center gap-2 bg-emerald-50/50 p-2.5 rounded-2xl border border-emerald-200 text-xs">
                      <input
                        type="text"
                        placeholder="Intitulé (ex: Spécialité, Disponibilité...)"
                        value={cf.label}
                        onChange={(e) => handleUpdateCustomField(cf.id, 'label', e.target.value)}
                        className="w-1/2 bg-white border border-emerald-200 rounded-xl px-3 py-2 text-slate-800 focus:border-emerald-500 outline-none font-medium"
                      />
                      <input
                        type="text"
                        placeholder="Valeur"
                        value={cf.value}
                        onChange={(e) => handleUpdateCustomField(cf.id, 'value', e.target.value)}
                        className="w-1/2 bg-white border border-emerald-200 rounded-xl px-3 py-2 text-slate-800 focus:border-emerald-500 outline-none font-medium"
                      />
                      <button
                        type="button"
                        onClick={() => handleRemoveCustomField(cf.id)}
                        className="p-2 text-rose-600 hover:bg-rose-100 rounded-xl transition-colors cursor-pointer shrink-0"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Bottom Actions */}
            <div className="pt-2 flex items-center justify-between gap-4">
              <button
                type="button"
                onClick={handleResetForm}
                className="px-4 py-2.5 text-xs font-semibold text-slate-500 hover:text-slate-800 hover:underline cursor-pointer"
              >
                Réinitialiser le formulaire
              </button>

              <button
                type="submit"
                disabled={isSubmitting}
                className="inline-flex items-center gap-2 px-8 py-3 bg-gradient-to-r from-[#2be39d] via-[#48c92a] to-[#8de02d] hover:brightness-105 text-emerald-950 text-sm font-bold rounded-2xl shadow-md transition-all active:scale-95 cursor-pointer disabled:opacity-50"
              >
                <Send className="w-4 h-4" />
                <span>{isSubmitting ? 'Transmissions en cours...' : 'Envoyer la demande'}</span>
              </button>
            </div>
          </form>
        )}
      </main>

      {/* Footer */}
      <footer className="bg-slate-900 text-slate-400 py-6 border-t border-slate-800 text-xs text-center mt-auto">
        <div className="max-w-6xl mx-auto px-4 space-y-1">
          <p className="font-bold text-slate-300">Mbok de France — Association Nationale</p>
          <p className="text-[11px] text-slate-500">
            Plateforme officielle de recensement, gestion et cartographie des membres en France.
          </p>
        </div>
      </footer>
    </div>
  );
};
