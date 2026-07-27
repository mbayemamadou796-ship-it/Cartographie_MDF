import React, { useState, useEffect } from 'react';
import { Member } from '../types';
import { X, Save, Compass, Loader2 } from 'lucide-react';
import { geocodeLocation } from '../utils/geocoding';

interface AdminMemberFormModalProps {
  memberToEdit?: Member | null;
  targetZoneName?: string | null;
  defaultGeo?: { region?: string; departement?: string; ville?: string } | null;
  isOpen: boolean;
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
    fonction: '',
    organisation: '',
    email: '',
    telephone: '',
    adresse: '',
    codePostal: '',
    ville: '',
    departement: '',
    region: '',
    pays: 'France',
    latitude: 48.8566,
    longitude: 2.3522,
    photo: ''
  });

  const [isGeocoding, setIsGeocoding] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  useEffect(() => {
    if (memberToEdit) {
      setFormData({
        nom: memberToEdit.nom || '',
        prenom: memberToEdit.prenom || '',
        fonction: memberToEdit.fonction || '',
        organisation: memberToEdit.organisation || '',
        email: memberToEdit.email || '',
        telephone: memberToEdit.telephone || '',
        adresse: memberToEdit.adresse || '',
        codePostal: memberToEdit.codePostal || '',
        ville: memberToEdit.ville || '',
        departement: memberToEdit.departement || '',
        region: memberToEdit.region || '',
        pays: memberToEdit.pays || 'France',
        latitude: memberToEdit.latitude || 48.8566,
        longitude: memberToEdit.longitude || 2.3522,
        photo: memberToEdit.photo || ''
      });
    } else {
      setFormData({
        nom: '',
        prenom: '',
        fonction: 'Membre Mbok de France',
        organisation: 'Mbok de France',
        email: '',
        telephone: '',
        adresse: '',
        codePostal: '',
        ville: defaultGeo?.ville || '',
        departement: defaultGeo?.departement || '',
        region: defaultGeo?.region || '',
        pays: 'France',
        latitude: 48.8566,
        longitude: 2.3522,
        photo: ''
      });
    }
    setErrorMsg('');
  }, [memberToEdit, isOpen, defaultGeo]);

  if (!isOpen) return null;

  const handleAutoGeocode = async () => {
    if (!formData.ville && !formData.adresse) {
      setErrorMsg('Veuillez entrer au moins une ville ou une adresse pour géolocaliser.');
      return;
    }
    setIsGeocoding(true);
    setErrorMsg('');
    try {
      const result = await geocodeLocation(
        formData.adresse,
        formData.codePostal,
        formData.ville,
        formData.pays
      );
      setFormData((prev) => ({
        ...prev,
        latitude: result.latitude,
        longitude: result.longitude,
        departement: prev.departement || result.dept || prev.departement,
        region: prev.region || result.region || prev.region
      }));
    } catch {
      setErrorMsg('Impossible de trouver les coordonnées exactes. Vous pouvez les saisir manuellement.');
    } finally {
      setIsGeocoding(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.nom.trim()) {
      setErrorMsg('Le nom du membre est obligatoire.');
      return;
    }
    onSave({
      ...(memberToEdit?.id ? { id: memberToEdit.id } : {}),
      ...formData
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl shadow-2xl border border-emerald-200 w-full max-w-2xl max-h-[90vh] flex flex-col overflow-hidden animate-in zoom-in-95 duration-200 text-slate-800">
        
        {/* Modal Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-emerald-200 bg-emerald-50">
          <div>
            <h3 className="text-base font-bold text-slate-900 font-['Outfit']">
              {memberToEdit ? 'Modifier le membre Mbok de France' : 'Ajouter un membre Mbok de France'}
            </h3>
            <p className="text-xs text-emerald-800 font-medium">
              Complétez les informations pour l'annuaire et la cartographie
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
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 space-y-4 text-xs">
          
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

          {/* Section: Identité */}
          <div className="space-y-3">
            <h4 className="font-bold text-emerald-800 uppercase tracking-wider text-[10px] pb-1 border-b border-emerald-200">
              Identité & Poste
            </h4>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Nom *</label>
                <input
                  type="text"
                  required
                  value={formData.nom}
                  onChange={(e) => setFormData({ ...formData, nom: e.target.value })}
                  placeholder="Ex: Diallo"
                  className="w-full bg-slate-50 border border-emerald-200 rounded-xl px-3 py-2 text-slate-800 placeholder-slate-400 focus:bg-white focus:border-emerald-500 outline-none"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Prénom</label>
                <input
                  type="text"
                  value={formData.prenom}
                  onChange={(e) => setFormData({ ...formData, prenom: e.target.value })}
                  placeholder="Ex: Aïssatou"
                  className="w-full bg-slate-50 border border-emerald-200 rounded-xl px-3 py-2 text-slate-800 placeholder-slate-400 focus:bg-white focus:border-emerald-500 outline-none"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Fonction</label>
                <input
                  type="text"
                  value={formData.fonction}
                  onChange={(e) => setFormData({ ...formData, fonction: e.target.value })}
                  placeholder="Ex: Coordinatrice / Médecin"
                  className="w-full bg-slate-50 border border-emerald-200 rounded-xl px-3 py-2 text-slate-800 placeholder-slate-400 focus:bg-white focus:border-emerald-500 outline-none"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Organisation</label>
                <input
                  type="text"
                  value={formData.organisation}
                  onChange={(e) => setFormData({ ...formData, organisation: e.target.value })}
                  placeholder="Ex: Mbok de France Saint-Denis"
                  className="w-full bg-slate-50 border border-emerald-200 rounded-xl px-3 py-2 text-slate-800 placeholder-slate-400 focus:bg-white focus:border-emerald-500 outline-none"
                />
              </div>
            </div>
          </div>

          {/* Section: Contact */}
          <div className="space-y-3 pt-2">
            <h4 className="font-bold text-emerald-800 uppercase tracking-wider text-[10px] pb-1 border-b border-emerald-200">
              Coordonnées de contact
            </h4>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Téléphone</label>
                <input
                  type="text"
                  value={formData.telephone}
                  onChange={(e) => setFormData({ ...formData, telephone: e.target.value })}
                  placeholder="Ex: 01 48 20 12 34"
                  className="w-full bg-slate-50 border border-emerald-200 rounded-xl px-3 py-2 text-slate-800 placeholder-slate-400 focus:bg-white focus:border-emerald-500 outline-none"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Email</label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  placeholder="Ex: contact@mbok-de-france.org"
                  className="w-full bg-slate-50 border border-emerald-200 rounded-xl px-3 py-2 text-slate-800 placeholder-slate-400 focus:bg-white focus:border-emerald-500 outline-none"
                />
              </div>
            </div>
          </div>

          {/* Section: Localisation & Adresse */}
          <div className="space-y-3 pt-2">
            <div className="flex items-center justify-between pb-1 border-b border-emerald-200">
              <h4 className="font-bold text-emerald-800 uppercase tracking-wider text-[10px]">
                Localisation géographique
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

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className="sm:col-span-2">
                <label className="block font-semibold text-slate-700 mb-1">Adresse</label>
                <input
                  type="text"
                  value={formData.adresse}
                  onChange={(e) => setFormData({ ...formData, adresse: e.target.value })}
                  placeholder="Ex: 12 Rue Gabriel Péri"
                  className="w-full bg-slate-50 border border-emerald-200 rounded-xl px-3 py-2 text-slate-800 placeholder-slate-400 focus:bg-white focus:border-emerald-500 outline-none"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Code Postal</label>
                <input
                  type="text"
                  value={formData.codePostal}
                  onChange={(e) => setFormData({ ...formData, codePostal: e.target.value })}
                  placeholder="Ex: 93200"
                  className="w-full bg-slate-50 border border-emerald-200 rounded-xl px-3 py-2 text-slate-800 placeholder-slate-400 focus:bg-white focus:border-emerald-500 outline-none"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Ville</label>
                <input
                  type="text"
                  value={formData.ville}
                  onChange={(e) => setFormData({ ...formData, ville: e.target.value })}
                  placeholder="Ex: Saint-Denis"
                  className="w-full bg-slate-50 border border-emerald-200 rounded-xl px-3 py-2 text-slate-800 placeholder-slate-400 focus:bg-white focus:border-emerald-500 outline-none"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Département</label>
                <input
                  type="text"
                  value={formData.departement}
                  onChange={(e) => setFormData({ ...formData, departement: e.target.value })}
                  placeholder="Ex: Seine-Saint-Denis (93)"
                  className="w-full bg-slate-50 border border-emerald-200 rounded-xl px-3 py-2 text-slate-800 placeholder-slate-400 focus:bg-white focus:border-emerald-500 outline-none"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Région</label>
                <input
                  type="text"
                  value={formData.region}
                  onChange={(e) => setFormData({ ...formData, region: e.target.value })}
                  placeholder="Ex: Île-de-France"
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

              <div>
                <label className="block font-semibold text-slate-700 mb-1">URL Photo (Optionnel)</label>
                <input
                  type="url"
                  value={formData.photo}
                  onChange={(e) => setFormData({ ...formData, photo: e.target.value })}
                  placeholder="https://..."
                  className="w-full bg-slate-50 border border-emerald-200 rounded-xl px-3 py-2 text-slate-800 placeholder-slate-400 focus:bg-white focus:border-emerald-500 outline-none"
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
              <span>Enregistrer</span>
            </button>
          </div>

        </form>
      </div>
    </div>
  );
};
