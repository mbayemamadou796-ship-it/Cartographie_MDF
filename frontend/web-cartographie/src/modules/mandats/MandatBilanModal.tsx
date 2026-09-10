import React, { useState, useEffect } from 'react';
import { Mandat, MandatBilan } from '../../types';
import { X, FileCheck, Check, Sparkles } from 'lucide-react';

interface MandatBilanModalProps {
  isOpen: boolean;
  mandat: Mandat;
  onClose: () => void;
  onSave: (bilan: MandatBilan) => void;
}

export const MandatBilanModal: React.FC<MandatBilanModalProps> = ({
  isOpen,
  mandat,
  onClose,
  onSave
}) => {
  const [objectifsInitiaux, setObjectifsInitiaux] = useState('');
  const [objectifsRealises, setObjectifsRealises] = useState('');
  const [objectifsNonRealises, setObjectifsNonRealises] = useState('');
  const [principalesRealisations, setPrincipalesRealisations] = useState('');
  const [difficultes, setDifficultes] = useState('');
  const [resultats, setResultats] = useState('');
  const [recommandationsSuivant, setRecommandationsSuivant] = useState('');
  const [redigePar, setRedigePar] = useState('');
  const [dateBilan, setDateBilan] = useState('');

  useEffect(() => {
    if (mandat.bilan) {
      setObjectifsInitiaux(mandat.bilan.objectifsInitiaux || '');
      setObjectifsRealises(mandat.bilan.objectifsRealises || '');
      setObjectifsNonRealises(mandat.bilan.objectifsNonRealises || '');
      setPrincipalesRealisations(mandat.bilan.principalesRealisations || '');
      setDifficultes(mandat.bilan.difficultes || '');
      setResultats(mandat.bilan.resultats || '');
      setRecommandationsSuivant(mandat.bilan.recommandationsSuivant || '');
      setRedigePar(mandat.bilan.redigePar || 'Bureau Exécutif National');
      setDateBilan(mandat.bilan.dateBilan || new Date().toISOString().split('T')[0]);
    } else {
      setObjectifsInitiaux('• Structuration territoriale et désignation des référents régionaux\n• Mise en place d\'outils numériques partagés\n• Accueil et suivi des primo-arrivants');
      setObjectifsRealises('');
      setObjectifsNonRealises('');
      setPrincipalesRealisations('');
      setDifficultes('');
      setResultats('');
      setRecommandationsSuivant('');
      setRedigePar('Bureau Exécutif National');
      setDateBilan(new Date().toISOString().split('T')[0]);
    }
  }, [mandat, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave({
      objectifsInitiaux,
      objectifsRealises,
      objectifsNonRealises,
      principalesRealisations,
      difficultes,
      resultats,
      recommandationsSuivant,
      redigePar,
      dateBilan
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs animate-in fade-in duration-150">
      <div className="bg-white rounded-3xl max-w-2xl w-full p-6 sm:p-8 shadow-2xl border border-emerald-200 max-h-[90vh] overflow-y-auto relative">
        <div className="flex items-center justify-between pb-4 mb-6 border-b border-emerald-100">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-emerald-100 text-emerald-800">
              <FileCheck className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-extrabold text-slate-900">
                Bilan & Transmission — {mandat.intitule}
              </h3>
              <p className="text-xs text-slate-500">
                Formalisez les réussites, difficultés et préconisations pour le prochain mandat
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
                Rédigé par / Commission
              </label>
              <input
                type="text"
                value={redigePar}
                onChange={(e) => setRedigePar(e.target.value)}
                placeholder="Ex: Bureau Exécutif Sortant"
                className="w-full px-3.5 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs text-slate-900 focus:bg-white focus:ring-2 focus:ring-emerald-500 outline-hidden"
              />
            </div>
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
                Date de Clôture du Bilan
              </label>
              <input
                type="date"
                value={dateBilan}
                onChange={(e) => setDateBilan(e.target.value)}
                className="w-full px-3.5 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs text-slate-900 focus:bg-white focus:ring-2 focus:ring-emerald-500 outline-hidden"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
              1. Objectifs Initiaux Fixés en Début de Mandat
            </label>
            <textarea
              rows={3}
              value={objectifsInitiaux}
              onChange={(e) => setObjectifsInitiaux(e.target.value)}
              placeholder="Quels étaient les engagements pris lors de l'assemblée élective ?"
              className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs text-slate-900 focus:bg-white focus:ring-2 focus:ring-emerald-500 outline-hidden"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-emerald-800 mb-1">
                2. Objectifs Réalisés & Succès
              </label>
              <textarea
                rows={4}
                value={objectifsRealises}
                onChange={(e) => setObjectifsRealises(e.target.value)}
                placeholder="Projets aboutis, partenariats signés..."
                className="w-full px-3.5 py-2 bg-emerald-50/40 border border-emerald-300 rounded-xl text-xs text-emerald-950 focus:bg-white focus:ring-2 focus:ring-emerald-500 outline-hidden"
              />
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-amber-800 mb-1">
                3. Objectifs Non Réalisés & Freins
              </label>
              <textarea
                rows={4}
                value={objectifsNonRealises}
                onChange={(e) => setObjectifsNonRealises(e.target.value)}
                placeholder="Projets reportés, difficultés rencontrées..."
                className="w-full px-3.5 py-2 bg-amber-50/40 border border-amber-300 rounded-xl text-xs text-amber-950 focus:bg-white focus:ring-2 focus:ring-emerald-500 outline-hidden"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
              4. Résultats Chiffrés & Impact Global
            </label>
            <textarea
              rows={2}
              value={resultats}
              onChange={(e) => setResultats(e.target.value)}
              placeholder="Ex: 350 membres actifs, 12 régions, budget équilibré de 15 000 €..."
              className="w-full px-3.5 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs text-slate-900 focus:bg-white focus:ring-2 focus:ring-emerald-500 outline-hidden"
            />
          </div>

          <div className="bg-emerald-50 p-4 rounded-2xl border border-emerald-200">
            <label className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-emerald-900 mb-1.5">
              <Sparkles className="w-4 h-4 text-emerald-600" />
              <span>5. Recommandations Clés pour le Mandat Suivant</span>
            </label>
            <textarea
              rows={4}
              value={recommandationsSuivant}
              onChange={(e) => setRecommandationsSuivant(e.target.value)}
              placeholder="Conseils de gouvernance, priorités immédiates à reprendre, vigilance particulière..."
              className="w-full px-3.5 py-2.5 bg-white border border-emerald-300 rounded-xl text-xs text-emerald-950 focus:ring-2 focus:ring-emerald-500 outline-hidden font-medium"
            />
          </div>

          <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-200">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 rounded-xl border border-slate-300 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition-colors"
            >
              Annuler
            </button>
            <button
              type="submit"
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-emerald-800 text-white text-xs font-bold hover:bg-emerald-900 shadow-md transition-colors"
            >
              <Check className="w-4 h-4" />
              Enregistrer le Bilan
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
