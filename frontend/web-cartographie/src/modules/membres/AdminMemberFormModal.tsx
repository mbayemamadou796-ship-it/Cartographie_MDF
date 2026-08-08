import React, { useState, useEffect, useRef } from 'react';
import { Member, CustomField } from '../../types';
import { X, Save, Compass, Loader2, Plus, Trash2, Sliders, Upload, Camera } from 'lucide-react';
import { geocodeLocation } from '../../utils/geocoding';

export const FRENCH_ZONES = [
  'Auvergne-Rhône-Alpes',
  'Bourgogne-Franche-Comté',
  'Bretagne',
  'Centre-Val de Loire',
  'Corse',
  'Grand Est',
  'Hauts-de-France',
  'Île-de-France',
  'Normandie',
  'Nouvelle-Aquitaine',
  'Occitanie',
  'Pays de la Loire',
  'Provence-Alpes-Côte d\'Azur'
];

export const SITUATION_PROFESSIONNELLE_OPTIONS = [
  'Salarié(e) / Employé(e)',
  'Étudiant(e)',
  'Entrepreneur / Indépendant',
  'En recherche d\'emploi',
  'Cadre / Dirigeant',
  'Autre'
];

interface AdminMemberFormModalProps {
  memberToEdit?: Member | null;
  targetZoneName?: string | null;
  defaultGeo?: { region?: string; departement?: string; ville?: string } | null;
  isOpen: boolean;
  userRole?: string;
  onClose: () => void;
  onSave: (memberData: Omit<Member, 'id'> & { id?: string }) => void;
}

export const AdminMemberFormModal: React.FC<AdminMemberFormModalProps> = ({
  memberToEdit,
  targetZoneName,
  defaultGeo,
  isOpen,
  onClose,
  onSave
}) => {
  const [formData, setFormData] = useState<Omit<Member, 'id'>>({
    nom: '',
    prenom: '',
    telephone: '',
    email: '',
    zone: '',
    situationProfessionnelle: '',
    domaineEtude: '',
    anneeArriveeFrance: '',
    fonction: '',
    organisation: '',
    ville: '',
    departement: '',
    region: '',
    pays: 'France',
    latitude: 48.8566,
    longitude: 2.3522,
    photo: '',
    champsPersonnalises: []
  });

  const [isGeocoding, setIsGeocoding] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        alert("L'image choisie est trop volumineuse (maximum 5 Mo).");
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

  useEffect(() => {
    if (memberToEdit) {
      setFormData({
        nom: memberToEdit.nom || '',
        prenom: memberToEdit.prenom || '',
        telephone: memberToEdit.telephone || '',
        email: memberToEdit.email || '',
        zone: memberToEdit.zone || memberToEdit.region || '',
        situationProfessionnelle: memberToEdit.situationProfessionnelle || memberToEdit.fonction || '',
        domaineEtude: memberToEdit.domaineEtude || memberToEdit.organisation || '',
        anneeArriveeFrance: memberToEdit.anneeArriveeFrance || '',
        fonction: memberToEdit.fonction || memberToEdit.situationProfessionnelle || '',
        organisation: memberToEdit.organisation || memberToEdit.domaineEtude || '',
        ville: memberToEdit.ville || '',
        departement: memberToEdit.departement || '',
        region: memberToEdit.region || memberToEdit.zone || '',
        pays: memberToEdit.pays || 'France',
        latitude: memberToEdit.latitude || 48.8566,
        longitude: memberToEdit.longitude || 2.3522,
        photo: memberToEdit.photo || '',
        champsPersonnalises: memberToEdit.champsPersonnalises || []
      });
    } else {
      setFormData({
        nom: '',
        prenom: '',
        telephone: '',
        email: '',
        zone: targetZoneName || defaultGeo?.region || '',
        situationProfessionnelle: 'Salarié(e) / Employé(e)',
        domaineEtude: 'Informatique',
        anneeArriveeFrance: '',
        fonction: 'Membre Mbok de France',
        organisation: 'Mbok de France',
        ville: defaultGeo?.ville || '',
        departement: defaultGeo?.departement || '',
        region: defaultGeo?.region || '',
        pays: 'France',
        latitude: 48.8566,
        longitude: 2.3522,
        photo: '',
        champsPersonnalises: []
      });
    }
    setErrorMsg('');
  }, [memberToEdit, isOpen, defaultGeo, targetZoneName]);

  if (!isOpen) return null;

  const handleAddCustomField = () => {
    const newField: CustomField = {
      id: `field-${Date.now()}-${Math.random().toString(36).substring(2, 5)}`,
      label: '',
      value: ''
    };
    setFormData((prev) => ({
      ...prev,
      champsPersonnalises: [...(prev.champsPersonnalises || []), newField]
    }));
  };

  const handleUpdateCustomField = (id: string, key: 'label' | 'value', val: string) => {
    setFormData((prev) => ({
      ...prev,
      champsPersonnalises: (prev.champsPersonnalises || []).map((f) =>
        f.id === id ? { ...f, [key]: val } : f
      )
    }));
  };

  const handleRemoveCustomField = (id: string) => {
    setFormData((prev) => ({
      ...prev,
      champsPersonnalises: (prev.champsPersonnalises || []).filter((f) => f.id !== id)
    }));
  };

  const handleAutoGeocode = async (overrideData?: typeof formData) => {
    const dataToUse = overrideData || formData;
    if (!dataToUse.ville && !dataToUse.zone) {
      setErrorMsg('Veuillez entrer au moins une ville de résidence ou une zone pour géolocaliser.');
      return;
    }
    setIsGeocoding(true);
    setErrorMsg('');
    try {
      const result = await geocodeLocation(
        dataToUse.ville || '',
        dataToUse.departement || '',
        dataToUse.pays || 'France',
        dataToUse.zone || dataToUse.region || ''
      );
      setFormData((prev) => ({
        ...prev,
        latitude: result.latitude,
        longitude: result.longitude,
        departement: prev.departement || result.dept || prev.departement,
        region: prev.region || result.region || prev.region,
        zone: prev.zone || result.region || prev.zone
      }));
    } catch {
      setErrorMsg('Impossible de trouver les coordonnées exactes. Vous pouvez les saisir manuellement.');
    } finally {
      setIsGeocoding(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.nom.trim()) {
      setErrorMsg('Le nom du membre est obligatoire.');
      return;
    }

    setIsGeocoding(true);
    let finalLat = formData.latitude;
    let finalLng = formData.longitude;
    const zoneValue = formData.zone || formData.region || 'Île-de-France';

    // Auto-calculate latitude and longitude from city, department and zone if missing or default
    try {
      const geoResult = await geocodeLocation(
        formData.ville || '',
        formData.departement || '',
        formData.pays || 'France',
        zoneValue
      );
      if (geoResult && geoResult.latitude && geoResult.longitude) {
        finalLat = geoResult.latitude;
        finalLng = geoResult.longitude;
      }
    } catch {
      // Keep existing lat/lng if geocoding fails
    } finally {
      setIsGeocoding(false);
    }

    // Ensure fallback fields match for backwards compatibility
    const fonctionValue = formData.situationProfessionnelle || formData.fonction || 'Membre MDF';
    const orgValue = formData.domaineEtude || formData.organisation || 'MDF';

    onSave({
      ...(memberToEdit?.id ? { id: memberToEdit.id } : {}),
      ...formData,
      latitude: finalLat,
      longitude: finalLng,
      zone: zoneValue,
      region: zoneValue,
      fonction: fonctionValue,
      organisation: orgValue,
      situationProfessionnelle: formData.situationProfessionnelle || fonctionValue,
      domaineEtude: formData.domaineEtude || orgValue
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl shadow-2xl border border-emerald-200 w-full max-w-2xl max-h-[92vh] flex flex-col overflow-hidden animate-in zoom-in-95 duration-200 text-slate-800">
        
        {/* Modal Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-emerald-200 bg-emerald-50">
          <div>
            <h3 className="text-base font-bold text-slate-900 font-['Outfit']">
              {memberToEdit ? 'Modifier la fiche membre MDF' : 'Ajouter un membre dans l\'Annuaire MDF'}
            </h3>
            <p className="text-xs text-emerald-800 font-medium">
              Formulaire de saisie conforme aux caractéristiques des membres MDF
            </p>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-700 p-1.5 rounded-full hover:bg-emerald-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body / Form */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 space-y-5 text-xs">
          
          {targetZoneName && !memberToEdit && (
            <div className="p-3 bg-emerald-100/80 border border-emerald-300 text-emerald-950 rounded-2xl flex items-center justify-between font-bold text-xs shadow-2xs">
              <span className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-600 animate-pulse" />
                <span>Zone Ciblée : <strong>{targetZoneName}</strong> — Ce membre sera automatiquement rattaché à cette zone.</span>
              </span>
            </div>
          )}

          {errorMsg && (
            <div className="p-3 bg-rose-50 border border-rose-200 text-rose-700 rounded-xl text-xs font-semibold">
              ⚠️ {errorMsg}
            </div>
          )}

          {/* Section 1: Identité & Coordonnées */}
          <div className="space-y-3">
            <h4 className="font-bold text-emerald-800 uppercase tracking-wider text-[10px] pb-1 border-b border-emerald-200">
              1. Identité & Coordonnées Principales
            </h4>

            {/* Photo Upload Box */}
            <div className="flex flex-col sm:flex-row items-center gap-3.5 bg-emerald-50/70 p-3 rounded-2xl border border-emerald-200">
              <div className="relative group shrink-0">
                {formData.photo ? (
                  <img
                    src={formData.photo}
                    alt="Aperçu photo"
                    className="w-16 h-16 rounded-2xl object-cover border-2 border-emerald-400 shadow-xs"
                  />
                ) : (
                  <div className="w-16 h-16 rounded-2xl bg-white border-2 border-dashed border-emerald-300 flex flex-col items-center justify-center text-emerald-700 shadow-2xs">
                    <Camera className="w-5 h-5 stroke-[2]" />
                    <span className="text-[9px] font-bold mt-0.5">Photo</span>
                  </div>
                )}
              </div>

              <div className="flex-1 space-y-1.5 w-full">
                <label className="block text-xs font-bold text-slate-800">Photo de profil du membre</label>
                <div className="flex flex-wrap items-center gap-2">
                  <input
                    type="file"
                    ref={fileInputRef}
                    accept="image/*"
                    onChange={handleFileChange}
                    className="hidden"
                  />
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold shadow-xs transition-all active:scale-95 cursor-pointer"
                  >
                    <Upload className="w-3.5 h-3.5" />
                    <span>Uploader une photo</span>
                  </button>

                  {formData.photo && (
                    <button
                      type="button"
                      onClick={() => setFormData({ ...formData, photo: '' })}
                      className="inline-flex items-center gap-1 px-2.5 py-1.5 bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 rounded-xl text-xs font-semibold transition-colors"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                      <span>Supprimer</span>
                    </button>
                  )}
                </div>

                <div className="pt-0.5">
                  <input
                    type="text"
                    value={formData.photo}
                    onChange={(e) => setFormData({ ...formData, photo: e.target.value })}
                    placeholder="Ou lien URL photo (ex: https://...)"
                    className="w-full bg-white border border-emerald-200 rounded-lg px-2.5 py-1 text-[11px] text-slate-700 placeholder-slate-400 focus:border-emerald-500 outline-none"
                  />
                </div>
              </div>
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Prénom *</label>
                <input
                  type="text"
                  required
                  value={formData.prenom}
                  onChange={(e) => setFormData({ ...formData, prenom: e.target.value })}
                  placeholder="Ex: Souleymane"
                  className="w-full bg-slate-50 border border-emerald-200 rounded-xl px-3 py-2 text-slate-800 placeholder-slate-400 focus:bg-white focus:border-emerald-500 outline-none font-medium"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Nom *</label>
                <input
                  type="text"
                  required
                  value={formData.nom}
                  onChange={(e) => setFormData({ ...formData, nom: e.target.value })}
                  placeholder="Ex: Ndiaye"
                  className="w-full bg-slate-50 border border-emerald-200 rounded-xl px-3 py-2 text-slate-800 placeholder-slate-400 focus:bg-white focus:border-emerald-500 outline-none font-medium"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Numéro de téléphone</label>
                <input
                  type="text"
                  value={formData.telephone}
                  onChange={(e) => setFormData({ ...formData, telephone: e.target.value })}
                  placeholder="Ex: 06 12 34 56 78"
                  className="w-full bg-slate-50 border border-emerald-200 rounded-xl px-3 py-2 text-slate-800 placeholder-slate-400 focus:bg-white focus:border-emerald-500 outline-none font-medium"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Adresse e-mail</label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  placeholder="Ex: souleymane.ndiaye@example.com"
                  className="w-full bg-slate-50 border border-emerald-200 rounded-xl px-3 py-2 text-slate-800 placeholder-slate-400 focus:bg-white focus:border-emerald-500 outline-none font-medium"
                />
              </div>
            </div>
          </div>

          {/* Section 2: Zone & Parcours professionnel/académique */}
          <div className="space-y-3 pt-1">
            <h4 className="font-bold text-emerald-800 uppercase tracking-wider text-[10px] pb-1 border-b border-emerald-200">
              2. Zone MDF, Parcours & Situation
            </h4>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Zone MDF *</label>
                <select
                  required
                  value={formData.zone}
                  onChange={(e) => setFormData({ ...formData, zone: e.target.value, region: e.target.value })}
                  className="w-full bg-slate-50 border border-emerald-200 rounded-xl px-3 py-2 text-slate-800 focus:bg-white focus:border-emerald-500 outline-none font-medium cursor-pointer"
                >
                  <option value="" disabled>-- Sélectionner une zone --</option>
                  {FRENCH_ZONES.map((z) => (
                    <option key={z} value={z}>{z}</option>
                  ))}
                  {formData.zone && !FRENCH_ZONES.includes(formData.zone) && (
                    <option value={formData.zone}>{formData.zone}</option>
                  )}
                </select>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Situation professionnelle</label>
                <select
                  value={formData.situationProfessionnelle}
                  onChange={(e) => setFormData({ ...formData, situationProfessionnelle: e.target.value, fonction: e.target.value })}
                  className="w-full bg-slate-50 border border-emerald-200 rounded-xl px-3 py-2 text-slate-800 focus:bg-white focus:border-emerald-500 outline-none font-medium cursor-pointer"
                >
                  <option value="" disabled>-- Sélectionner une situation --</option>
                  {SITUATION_PROFESSIONNELLE_OPTIONS.map((opt) => (
                    <option key={opt} value={opt}>{opt}</option>
                  ))}
                  {formData.situationProfessionnelle && !SITUATION_PROFESSIONNELLE_OPTIONS.includes(formData.situationProfessionnelle) && (
                    <option value={formData.situationProfessionnelle}>{formData.situationProfessionnelle}</option>
                  )}
                </select>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Domaine d'étude / Spécialité</label>
                <input
                  type="text"
                  value={formData.domaineEtude}
                  onChange={(e) => setFormData({ ...formData, domaineEtude: e.target.value, organisation: e.target.value })}
                  placeholder="Ex: Informatique, Droit, Santé / Médecine, Commerce..."
                  className="w-full bg-slate-50 border border-emerald-200 rounded-xl px-3 py-2 text-slate-800 placeholder-slate-400 focus:bg-white focus:border-emerald-500 outline-none font-medium"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Année d'arrivée en France</label>
                <input
                  type="text"
                  value={formData.anneeArriveeFrance}
                  onChange={(e) => setFormData({ ...formData, anneeArriveeFrance: e.target.value })}
                  placeholder="Ex: 2018, 2021..."
                  className="w-full bg-slate-50 border border-emerald-200 rounded-xl px-3 py-2 text-slate-800 placeholder-slate-400 focus:bg-white focus:border-emerald-500 outline-none font-medium"
                />
              </div>
            </div>
          </div>

          {/* Section 3: Champs Personnalisés Dynamiques */}
          <div className="space-y-3 pt-1">
            <div className="flex items-center justify-between pb-1 border-b border-emerald-200">
              <h4 className="font-bold text-emerald-800 uppercase tracking-wider text-[10px] flex items-center gap-1.5">
                <Sliders className="w-3.5 h-3.5 text-emerald-600" />
                <span>3. Champs Personnalisés de la Fiche Membre</span>
              </h4>

              <button
                type="button"
                onClick={handleAddCustomField}
                className="inline-flex items-center gap-1 px-3 py-1 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg font-bold text-[11px] shadow-xs transition-all active:scale-95"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Ajouter un autre champ</span>
              </button>
            </div>

            {(!formData.champsPersonnalises || formData.champsPersonnalises.length === 0) ? (
              <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-500 italic text-[11px] flex items-center justify-between">
                <span>Aucun champ personnalisé spécifique pour ce membre. Cliquez sur le bouton "Ajouter un autre champ" si besoin.</span>
              </div>
            ) : (
              <div className="space-y-2">
                {formData.champsPersonnalises.map((field) => (
                  <div key={field.id} className="flex items-center gap-2 bg-emerald-50/50 p-2 rounded-xl border border-emerald-200">
                    <input
                      type="text"
                      placeholder="Nom du champ (ex: Cotisation, Spécialité...)"
                      value={field.label}
                      onChange={(e) => handleUpdateCustomField(field.id, 'label', e.target.value)}
                      className="w-1/2 bg-white border border-emerald-200 rounded-lg px-2.5 py-1.5 text-slate-800 focus:border-emerald-500 outline-none font-medium"
                    />
                    <input
                      type="text"
                      placeholder="Valeur (ex: À jour 2026, Master 2...)"
                      value={field.value}
                      onChange={(e) => handleUpdateCustomField(field.id, 'value', e.target.value)}
                      className="w-1/2 bg-white border border-emerald-200 rounded-lg px-2.5 py-1.5 text-slate-800 focus:border-emerald-500 outline-none font-medium"
                    />
                    <button
                      type="button"
                      onClick={() => handleRemoveCustomField(field.id)}
                      className="p-1.5 hover:bg-rose-100 text-rose-600 rounded-lg transition-colors shrink-0"
                      title="Supprimer ce champ"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Section 4: Localisation Cartographique (Ville & Département) */}
          <div className="space-y-3 pt-1">
            <div className="flex items-center justify-between pb-1 border-b border-emerald-200">
              <h4 className="font-bold text-emerald-800 uppercase tracking-wider text-[10px]">
                4. Ville de Résidence & Localisation Cartographique
              </h4>

              <button
                type="button"
                onClick={handleAutoGeocode}
                disabled={isGeocoding}
                className="inline-flex items-center gap-1 px-2.5 py-1 bg-emerald-50 hover:bg-emerald-100 text-emerald-900 border border-emerald-300 rounded-lg text-[11px] font-semibold transition-colors disabled:opacity-50"
              >
                {isGeocoding ? (
                  <>
                    <Loader2 className="w-3 h-3 animate-spin text-emerald-600" />
                    <span>Calcul GPS...</span>
                  </>
                ) : (
                  <>
                    <Compass className="w-3 h-3 text-emerald-600" />
                    <span>Obtenir coordonnées GPS</span>
                  </>
                )}
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Ville de résidence (Commune) *</label>
                <input
                  type="text"
                  required
                  value={formData.ville}
                  onChange={(e) => setFormData({ ...formData, ville: e.target.value })}
                  placeholder="Ex: Saint-Denis, Rennes, Nantes, Lyon..."
                  className="w-full bg-slate-50 border border-emerald-200 rounded-xl px-3 py-2 text-slate-800 placeholder-slate-400 focus:bg-white focus:border-emerald-500 outline-none font-medium"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Département</label>
                <input
                  type="text"
                  value={formData.departement}
                  onChange={(e) => setFormData({ ...formData, departement: e.target.value })}
                  placeholder="Ex: Seine-Saint-Denis (93), Ille-et-Vilaine (35)"
                  className="w-full bg-slate-50 border border-emerald-200 rounded-xl px-3 py-2 text-slate-800 placeholder-slate-400 focus:bg-white focus:border-emerald-500 outline-none"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Latitude (GPS)</label>
                <input
                  type="number"
                  step="any"
                  value={formData.latitude}
                  onChange={(e) => setFormData({ ...formData, latitude: parseFloat(e.target.value) || 0 })}
                  className="w-full bg-slate-50 border border-emerald-200 rounded-xl px-3 py-2 text-slate-800 font-mono focus:bg-white focus:border-emerald-500 outline-none"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Longitude (GPS)</label>
                <input
                  type="number"
                  step="any"
                  value={formData.longitude}
                  onChange={(e) => setFormData({ ...formData, longitude: parseFloat(e.target.value) || 0 })}
                  className="w-full bg-slate-50 border border-emerald-200 rounded-xl px-3 py-2 text-slate-800 font-mono focus:bg-white focus:border-emerald-500 outline-none"
                />
              </div>
            </div>
          </div>

          {/* Modal Footer */}
          <div className="pt-4 border-t border-slate-200 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold rounded-xl border border-slate-200 transition-colors"
            >
              Annuler
            </button>
            
            <button
              type="submit"
              className="inline-flex items-center gap-2 px-5 py-2 bg-gradient-to-r from-[#2be39d] via-[#48c92a] to-[#8de02d] hover:brightness-105 text-emerald-950 font-bold rounded-xl shadow-xs transition-all active:scale-95"
            >
              <Save className="w-4 h-4" />
              <span>Enregistrer la fiche membre</span>
            </button>
          </div>

        </form>
      </div>
    </div>
  );
};

