import React, { useState } from 'react';
import { Camera, Upload, Link as LinkIcon, RefreshCw, X, Check, Image as ImageIcon } from 'lucide-react';

interface EditLogoModalProps {
  isOpen: boolean;
  currentLogoUrl?: string;
  onClose: () => void;
  onSaveLogo: (newLogoUrl: string | undefined) => void;
}

export const EditLogoModal: React.FC<EditLogoModalProps> = ({
  isOpen,
  currentLogoUrl,
  onClose,
  onSaveLogo
}) => {
  const [activeTab, setActiveTab] = useState<'upload' | 'url'>('upload');
  const [logoInputUrl, setLogoInputUrl] = useState(currentLogoUrl || '');
  const [previewUrl, setPreviewUrl] = useState<string | undefined>(currentLogoUrl);
  const [errorMsg, setErrorMsg] = useState('');

  if (!isOpen) return null;

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setErrorMsg('');
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      setErrorMsg('Veuillez sélectionner un fichier image valide (PNG, JPG, WebP).');
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      setErrorMsg('La taille de la photo ne doit pas dépasser 5 Mo.');
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      const result = reader.result as string;
      setPreviewUrl(result);
      setLogoInputUrl(result);
    };
    reader.readAsDataURL(file);
  };

  const handleApplyUrl = () => {
    if (!logoInputUrl.trim()) {
      setPreviewUrl(undefined);
      return;
    }
    setPreviewUrl(logoInputUrl.trim());
  };

  const handleSave = () => {
    onSaveLogo(previewUrl);
    onClose();
  };

  const handleResetToDefault = () => {
    setPreviewUrl(undefined);
    setLogoInputUrl('');
    onSaveLogo(undefined);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl max-w-lg w-full border border-emerald-200 shadow-2xl overflow-hidden flex flex-col">
        
        {/* Modal Header */}
        <div className="p-5 bg-gradient-to-r from-emerald-800 via-emerald-900 to-slate-900 text-white flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <span className="p-2 rounded-xl bg-white/10 text-emerald-300">
              <Camera className="w-5 h-5" />
            </span>
            <div>
              <h3 className="font-bold text-base font-['Outfit']">
                Modifier la Photo de Profil / Logo
              </h3>
              <p className="text-[11px] text-emerald-200 font-medium">
                Personnalisez le visuel principal de Mbok de France
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

        {/* Modal Body */}
        <div className="p-6 space-y-6">
          
          {/* Live Badge Preview */}
          <div className="flex flex-col items-center justify-center bg-emerald-50/60 p-5 rounded-2xl border border-emerald-100 space-y-2">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
              Aperçu en direct
            </span>

            <div className="relative w-24 h-24 rounded-full bg-gradient-to-tr from-[#31d3ba] via-[#52c234] to-[#bbf055] p-[3px] shadow-lg shadow-emerald-600/20">
              <div className="w-full h-full rounded-full bg-white flex items-center justify-center overflow-hidden relative">
                {previewUrl ? (
                  <img
                    src={previewUrl}
                    alt="Logo personnalisé"
                    className="w-full h-full object-cover"
                    onError={() => {
                      setErrorMsg("Impossible de charger l'image depuis cette URL.");
                    }}
                  />
                ) : (
                  <div className="w-full h-full flex flex-col items-center justify-center text-emerald-700 bg-emerald-50/50 p-2 text-center">
                    <ImageIcon className="w-8 h-8 text-emerald-600 mb-1" />
                    <span className="text-[9px] font-bold leading-tight">Logo par défaut MDF</span>
                  </div>
                )}
              </div>
            </div>

            <p className="text-xs font-semibold text-slate-600">
              {previewUrl ? 'Photo personnalisée active' : 'Logo emblème original Mbok de France'}
            </p>
          </div>

          {/* Upload Method Selector */}
          <div className="flex bg-slate-100 p-1 rounded-2xl border border-slate-200 text-xs font-bold">
            <button
              onClick={() => setActiveTab('upload')}
              className={`flex-1 py-2 rounded-xl transition-all flex items-center justify-center gap-1.5 ${
                activeTab === 'upload'
                  ? 'bg-white text-emerald-950 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Upload className="w-3.5 h-3.5 text-emerald-600" />
              <span>Charger depuis l'ordinateur</span>
            </button>

            <button
              onClick={() => setActiveTab('url')}
              className={`flex-1 py-2 rounded-xl transition-all flex items-center justify-center gap-1.5 ${
                activeTab === 'url'
                  ? 'bg-white text-emerald-950 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <LinkIcon className="w-3.5 h-3.5 text-emerald-600" />
              <span>Lien d'image Web (URL)</span>
            </button>
          </div>

          {/* Option A: File Upload */}
          {activeTab === 'upload' && (
            <div className="space-y-3">
              <label
                htmlFor="profile-logo-file-input"
                className="block border-2 border-dashed border-emerald-300 hover:border-emerald-500 bg-emerald-50/40 hover:bg-emerald-50 p-6 rounded-2xl text-center cursor-pointer transition-all"
              >
                <input
                  type="file"
                  id="profile-logo-file-input"
                  accept="image/png, image/jpeg, image/webp, image/gif"
                  onChange={handleFileChange}
                  className="hidden"
                />
                <div className="w-12 h-12 rounded-2xl bg-emerald-100 text-emerald-800 border border-emerald-200 flex items-center justify-center mx-auto mb-2">
                  <Upload className="w-6 h-6 text-emerald-600" />
                </div>
                <span className="font-bold text-xs text-slate-900 block">
                  Cliquer pour choisir une image
                </span>
                <span className="text-[11px] text-slate-400 mt-0.5 block">
                  PNG, JPG ou WebP (max. 5 Mo)
                </span>
              </label>
            </div>
          )}

          {/* Option B: URL Link */}
          {activeTab === 'url' && (
            <div className="space-y-3">
              <label className="block text-xs font-semibold text-slate-700">
                Adresse URL de l'image (https://...)
              </label>
              <div className="flex gap-2">
                <input
                  type="url"
                  placeholder="https://exemple.com/ma-photo-logo.png"
                  value={logoInputUrl}
                  onChange={(e) => setLogoInputUrl(e.target.value)}
                  className="flex-1 bg-slate-50 border border-emerald-200 rounded-xl px-3 py-2 text-xs text-slate-800 focus:bg-white focus:border-emerald-500 outline-none font-medium"
                />
                <button
                  onClick={handleApplyUrl}
                  className="px-4 py-2 bg-emerald-100 hover:bg-emerald-200 text-emerald-900 rounded-xl font-bold text-xs transition-colors shrink-0"
                >
                  Tester
                </button>
              </div>
            </div>
          )}

          {errorMsg && (
            <div className="p-3 bg-rose-50 border border-rose-200 text-rose-700 rounded-xl text-xs font-semibold">
              {errorMsg}
            </div>
          )}

        </div>

        {/* Modal Footer */}
        <div className="p-4 bg-slate-50 border-t border-slate-100 flex items-center justify-between gap-3">
          <button
            onClick={handleResetToDefault}
            className="inline-flex items-center gap-1.5 px-3 py-2 text-rose-700 hover:bg-rose-50 rounded-xl font-bold text-xs transition-colors"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>Remettre le logo par défaut</span>
          </button>

          <div className="flex items-center gap-2">
            <button
              onClick={onClose}
              className="px-4 py-2 text-slate-600 hover:bg-slate-200 rounded-xl font-bold text-xs transition-colors"
            >
              Annuler
            </button>
            <button
              onClick={handleSave}
              className="inline-flex items-center gap-1.5 px-5 py-2 bg-gradient-to-r from-[#2be39d] via-[#48c92a] to-[#8de02d] hover:brightness-105 text-emerald-950 font-bold rounded-xl shadow-xs transition-all active:scale-95 text-xs"
            >
              <Check className="w-4 h-4" />
              <span>Valider la photo</span>
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};
