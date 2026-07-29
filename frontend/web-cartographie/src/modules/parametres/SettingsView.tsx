import React, { useState } from 'react';
import { AppSettings, UserRole } from '../../types';
import { Settings, Save, RefreshCw, CheckCircle2, Shield, Info, Map, Camera, Upload, Trash2 } from 'lucide-react';
import { LogoMbok } from './LogoMbok';

interface SettingsViewProps {
  settings: AppSettings;
  userRole: UserRole;
  onUpdateSettings: (newSettings: Partial<AppSettings>) => void;
  onResetToInitialMembers: () => void;
  onOpenEditLogoModal?: () => void;
}

export const SettingsView: React.FC<SettingsViewProps> = ({
  settings,
  userRole,
  onUpdateSettings,
  onResetToInitialMembers,
  onOpenEditLogoModal
}) => {
  const [formData, setFormData] = useState<AppSettings>(settings);
  const [savedMsg, setSavedMsg] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onUpdateSettings(formData);
    setSavedMsg('Paramètres enregistrés avec succès !');
    setTimeout(() => setSavedMsg(''), 3000);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      alert('Veuillez choisir un fichier de type image (PNG, JPG, WebP).');
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      const result = reader.result as string;
      const updated = { ...formData, logoUrl: result };
      setFormData(updated);
      onUpdateSettings({ logoUrl: result });
      setSavedMsg('Photo de profil mise à jour !');
      setTimeout(() => setSavedMsg(''), 3000);
    };
    reader.readAsDataURL(file);
  };

  const handleRemovePhoto = () => {
    const updated = { ...formData, logoUrl: undefined };
    setFormData(updated);
    onUpdateSettings({ logoUrl: undefined });
    setSavedMsg('Photo réinitialisée vers le logo par défaut.');
    setTimeout(() => setSavedMsg(''), 3000);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6 animate-in fade-in duration-200">
      
      {/* Header */}
      <div className="bg-white rounded-3xl p-6 border border-emerald-200 shadow-sm flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-3 rounded-2xl bg-emerald-100 text-emerald-800 border border-emerald-200 shrink-0">
            <Settings className="w-6 h-6 text-emerald-600" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-slate-900 font-['Outfit']">
              Paramètres de l'Application Mbok de France
            </h2>
            <p className="text-xs text-slate-500 font-medium">
              Personnalisez les informations de l'association, le logo / photo de profil et la carte
            </p>
          </div>
        </div>
      </div>

      {savedMsg && (
        <div className="p-4 bg-emerald-50 border border-emerald-200 text-emerald-900 font-bold rounded-2xl text-xs flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          <span>{savedMsg}</span>
        </div>
      )}

      {/* Logo & Profile Photo Section */}
      <div className="bg-white rounded-3xl p-6 border border-emerald-200 shadow-sm space-y-4">
        <h3 className="font-bold text-slate-900 text-sm font-['Outfit'] flex items-center gap-2 border-b border-emerald-100 pb-3">
          <Camera className="w-4 h-4 text-emerald-600" />
          <span>Photo de Profil & Logo de l'Association</span>
        </h3>

        <div className="flex flex-col sm:flex-row items-center justify-between gap-6 p-4 bg-emerald-50/50 rounded-2xl border border-emerald-100">
          <div className="flex items-center gap-4">
            <LogoMbok
              size="lg"
              showText={false}
              logoUrl={formData.logoUrl}
              editable={true}
              onEditClick={onOpenEditLogoModal}
            />

            <div>
              <h4 className="font-bold text-slate-900 text-sm font-['Outfit']">
                {formData.associationName}
              </h4>
              <p className="text-xs text-slate-500 font-medium mt-0.5">
                {formData.logoUrl ? 'Photo personnalisée active' : 'Logo emblème officiel Mbok de France'}
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2 shrink-0">
            <label className="inline-flex items-center gap-1.5 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold text-xs cursor-pointer shadow-xs transition-all active:scale-95">
              <Upload className="w-3.5 h-3.5" />
              <span>Changer la photo</span>
              <input
                type="file"
                accept="image/*"
                onChange={handleFileUpload}
                className="hidden"
              />
            </label>

            {formData.logoUrl && (
              <button
                type="button"
                onClick={handleRemovePhoto}
                className="inline-flex items-center gap-1.5 px-3 py-2 bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 rounded-xl font-bold text-xs transition-colors"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Revenir au logo officiel</span>
              </button>
            )}
          </div>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        
        {/* Association Parameters */}
        <div className="bg-white rounded-3xl p-6 border border-emerald-200 shadow-sm space-y-4">
          <h3 className="font-bold text-slate-900 text-sm font-['Outfit'] flex items-center gap-2 border-b border-emerald-100 pb-3">
            <Info className="w-4 h-4 text-emerald-600" />
            <span>Informations sur l'Association MDF</span>
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Nom de l'application</label>
              <input
                type="text"
                value={formData.appName}
                onChange={(e) => setFormData({ ...formData, appName: e.target.value })}
                className="w-full bg-slate-50 border border-emerald-200 rounded-xl px-3 py-2 text-slate-800 focus:bg-white focus:border-emerald-500 outline-none font-medium"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">Nom de l'Organisation</label>
              <input
                type="text"
                value={formData.associationName}
                onChange={(e) => setFormData({ ...formData, associationName: e.target.value })}
                className="w-full bg-slate-50 border border-emerald-200 rounded-xl px-3 py-2 text-slate-800 focus:bg-white focus:border-emerald-500 outline-none font-medium"
              />
            </div>

            <div className="sm:col-span-2">
              <label className="block font-semibold text-slate-700 mb-1">Devise / Slogan</label>
              <input
                type="text"
                value={formData.tagline}
                onChange={(e) => setFormData({ ...formData, tagline: e.target.value })}
                className="w-full bg-slate-50 border border-emerald-200 rounded-xl px-3 py-2 text-slate-800 focus:bg-white focus:border-emerald-500 outline-none font-medium"
              />
            </div>
          </div>
        </div>

        {/* Map Parameters */}
        <div className="bg-white rounded-3xl p-6 border border-emerald-200 shadow-sm space-y-4">
          <h3 className="font-bold text-slate-900 text-sm font-['Outfit'] flex items-center gap-2 border-b border-emerald-100 pb-3">
            <Map className="w-4 h-4 text-emerald-600" />
            <span>Paramètres de la Cartographie Interactive</span>
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Pays par défaut</label>
              <input
                type="text"
                value={formData.defaultCountry}
                onChange={(e) => setFormData({ ...formData, defaultCountry: e.target.value })}
                className="w-full bg-slate-50 border border-emerald-200 rounded-xl px-3 py-2 text-slate-800 focus:bg-white focus:border-emerald-500 outline-none font-medium"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">Niveau de Zoom initial (1-18)</label>
              <input
                type="number"
                min="3"
                max="18"
                value={formData.mapDefaultZoom}
                onChange={(e) => setFormData({ ...formData, mapDefaultZoom: parseInt(e.target.value) || 6 })}
                className="w-full bg-slate-50 border border-emerald-200 rounded-xl px-3 py-2 text-slate-800 focus:bg-white focus:border-emerald-500 outline-none font-medium"
              />
            </div>
          </div>
        </div>

        {/* Database & Reset Zone */}
        <div className="bg-white rounded-3xl p-6 border border-rose-200 shadow-sm space-y-4">
          <h3 className="font-bold text-rose-900 text-sm font-['Outfit'] flex items-center gap-2 border-b border-rose-100 pb-3">
            <Shield className="w-4 h-4 text-rose-600" />
            <span>Réinitialisation & Base de Données</span>
          </h3>

          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs">
            <div>
              <p className="font-bold text-slate-900">Restaurer les données exemple initiales Mbok de France</p>
              <p className="text-slate-500 text-[11px] mt-0.5">
                Recharge les membres témoins pré-configurés dans l'application.
              </p>
            </div>

            {userRole === 'admin' ? (
              <button
                type="button"
                onClick={() => {
                  if (window.confirm("Voulez-vous vraiment recharger l'annuaire de départ ?")) {
                    onResetToInitialMembers();
                    setSavedMsg("Annuaire de départ rechargé.");
                  }
                }}
                className="inline-flex items-center gap-1.5 px-4 py-2 bg-rose-50 hover:bg-rose-100 text-rose-800 border border-rose-200 rounded-xl font-bold text-xs transition-colors shrink-0"
              >
                <RefreshCw className="w-3.5 h-3.5 text-rose-600" />
                <span>Recharger les données par défaut</span>
              </button>
            ) : (
              <span className="text-[11px] text-slate-400 italic">Connexion Admin requise</span>
            )}
          </div>
        </div>

        {/* Submit Button */}
        <div className="flex justify-end">
          <button
            type="submit"
            className="inline-flex items-center gap-2 px-6 py-2.5 bg-gradient-to-r from-[#2be39d] via-[#48c92a] to-[#8de02d] hover:brightness-105 text-emerald-950 font-bold rounded-2xl shadow-xs transition-all active:scale-95 text-xs"
          >
            <Save className="w-4 h-4" />
            <span>Enregistrer les paramètres</span>
          </button>
        </div>

      </form>

    </div>
  );
};
