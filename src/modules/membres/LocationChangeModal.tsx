import React, { useState } from 'react';
import { LocationChangeAlert, CustomZone } from '../../types';
import { MapPin, ArrowRight, Layers, CheckCircle2, ShieldAlert, X } from 'lucide-react';

interface LocationChangeModalProps {
  isOpen: boolean;
  alerts: LocationChangeAlert[];
  customZones: CustomZone[];
  onClose: () => void;
  onApplyDecisions: (decisions: Array<{ memberId: string; currentZoneId: string; action: 'keep' | 'change' | 'remove' | 'later'; targetZoneId?: string }>) => void;
}

export const LocationChangeModal: React.FC<LocationChangeModalProps> = ({
  isOpen,
  alerts,
  customZones,
  onClose,
  onApplyDecisions
}) => {
  if (!isOpen || alerts.length === 0) return null;

  // Local state tracking decisions for each alert key (memberId + zoneId)
  const [decisions, setDecisions] = useState<Record<string, { action: 'keep' | 'change' | 'remove' | 'later'; targetZoneId?: string }>>(() => {
    const initial: Record<string, { action: 'keep' | 'change' | 'remove' | 'later'; targetZoneId?: string }> = {};
    alerts.forEach((alert) => {
      const key = `${alert.memberId}-${alert.zoneId}`;
      initial[key] = { action: 'keep' };
    });
    return initial;
  });

  const handleActionChange = (memberId: string, zoneId: string, action: 'keep' | 'change' | 'remove' | 'later', targetZoneId?: string) => {
    const key = `${memberId}-${zoneId}`;
    setDecisions((prev) => ({
      ...prev,
      [key]: { action, targetZoneId: targetZoneId || prev[key]?.targetZoneId }
    }));
  };

  const handleConfirm = () => {
    const formattedDecisions = alerts.map((alert) => {
      const key = `${alert.memberId}-${alert.zoneId}`;
      const decision = decisions[key] || { action: 'keep' };
      return {
        memberId: alert.memberId,
        currentZoneId: alert.zoneId,
        action: decision.action,
        targetZoneId: decision.targetZoneId
      };
    });
    onApplyDecisions(formattedDecisions);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-200 overflow-y-auto">
      <div className="bg-white rounded-3xl max-w-2xl w-full p-6 shadow-2xl border border-emerald-200 my-8 space-y-5 animate-in zoom-in-95 duration-200">
        
        {/* Header */}
        <div className="flex items-start justify-between border-b border-slate-100 pb-4">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-amber-100 text-amber-800 rounded-2xl border border-amber-200 shrink-0">
              <MapPin className="w-6 h-6 text-amber-600" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-slate-900 font-['Outfit'] flex items-center gap-2">
                <span>Changements de localisation détectés</span>
                <span className="text-xs font-bold px-2.5 py-0.5 bg-amber-100 text-amber-900 rounded-full">
                  {alerts.length} alerte{alerts.length > 1 ? 's' : ''}
                </span>
              </h3>
              <p className="text-xs text-slate-500 font-medium">
                Des membres répertoriés dans vos zones ont changé de ville lors du dernier import Excel.
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-full hover:bg-slate-100 text-slate-400 hover:text-slate-600 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Informative Note */}
        <div className="p-3.5 bg-amber-50/80 border border-amber-200/80 rounded-2xl text-xs text-amber-950 flex items-start gap-2.5 leading-relaxed">
          <ShieldAlert className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
          <div>
            <strong>L'importation Excel a mis à jour les coordonnées des membres sans altérer vos zones.</strong> Vous pouvez maintenant choisir si ces membres restent dans leur zone d'origine ou sont réaffectés.
          </div>
        </div>

        {/* Alert List */}
        <div className="space-y-4 max-h-[50vh] overflow-y-auto pr-1">
          {alerts.map((alert) => {
            const key = `${alert.memberId}-${alert.zoneId}`;
            const currentDecision = decisions[key] || { action: 'keep' };

            return (
              <div
                key={key}
                className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-3 hover:border-emerald-300 transition-colors"
              >
                {/* Member Info & Zone */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-200/80 pb-2.5">
                  <div>
                    <span className="font-bold text-slate-900 text-sm block font-['Outfit']">
                      👤 {alert.memberName}
                    </span>
                    <span className="text-xs text-slate-500 font-medium inline-flex items-center gap-1 mt-0.5">
                      <Layers className="w-3.5 h-3.5 text-emerald-600" />
                      <span>Zone actuelle : <strong className="text-emerald-900">{alert.zoneName}</strong></span>
                    </span>
                  </div>

                  {/* Location Change Badge */}
                  <div className="inline-flex items-center gap-2 px-3 py-1 bg-white rounded-xl border border-slate-200 text-xs font-semibold shadow-2xs">
                    <span className="text-slate-500 line-through">{alert.oldVille || 'Inconnue'}</span>
                    <ArrowRight className="w-3.5 h-3.5 text-emerald-600" />
                    <span className="text-emerald-950 font-bold">{alert.newVille}</span>
                  </div>
                </div>

                {/* Options */}
                <div className="space-y-2 text-xs">
                  <span className="font-bold text-slate-700 block">Souhaitez-vous modifier son affectation ?</span>
                  
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {/* Option Keep */}
                    <label
                      className={`p-2.5 rounded-xl border cursor-pointer flex items-center gap-2 transition-all ${
                        currentDecision.action === 'keep'
                          ? 'bg-emerald-50 border-emerald-300 ring-1 ring-emerald-400 font-bold text-emerald-950'
                          : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-100'
                      }`}
                    >
                      <input
                        type="radio"
                        name={`action-${key}`}
                        checked={currentDecision.action === 'keep'}
                        onChange={() => handleActionChange(alert.memberId, alert.zoneId, 'keep')}
                        className="accent-emerald-600"
                      />
                      <span>Conserver dans {alert.zoneName}</span>
                    </label>

                    {/* Option Later */}
                    <label
                      className={`p-2.5 rounded-xl border cursor-pointer flex items-center gap-2 transition-all ${
                        currentDecision.action === 'later'
                          ? 'bg-amber-50 border-amber-300 ring-1 ring-amber-400 font-bold text-amber-950'
                          : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-100'
                      }`}
                    >
                      <input
                        type="radio"
                        name={`action-${key}`}
                        checked={currentDecision.action === 'later'}
                        onChange={() => handleActionChange(alert.memberId, alert.zoneId, 'later')}
                        className="accent-amber-600"
                      />
                      <span>Décider plus tard</span>
                    </label>

                    {/* Option Remove */}
                    <label
                      className={`p-2.5 rounded-xl border cursor-pointer flex items-center gap-2 transition-all ${
                        currentDecision.action === 'remove'
                          ? 'bg-rose-50 border-rose-300 ring-1 ring-rose-400 font-bold text-rose-950'
                          : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-100'
                      }`}
                    >
                      <input
                        type="radio"
                        name={`action-${key}`}
                        checked={currentDecision.action === 'remove'}
                        onChange={() => handleActionChange(alert.memberId, alert.zoneId, 'remove')}
                        className="accent-rose-600"
                      />
                      <span>Retirer de cette zone</span>
                    </label>

                    {/* Option Change */}
                    <label
                      className={`p-2.5 rounded-xl border cursor-pointer flex items-center gap-2 transition-all ${
                        currentDecision.action === 'change'
                          ? 'bg-blue-50 border-blue-300 ring-1 ring-blue-400 font-bold text-blue-950'
                          : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-100'
                      }`}
                    >
                      <input
                        type="radio"
                        name={`action-${key}`}
                        checked={currentDecision.action === 'change'}
                        onChange={() => handleActionChange(alert.memberId, alert.zoneId, 'change')}
                        className="accent-blue-600"
                      />
                      <span>Changer de zone</span>
                    </label>
                  </div>

                  {/* If 'change' is selected, show target zone selector */}
                  {currentDecision.action === 'change' && (
                    <div className="pt-2">
                      <select
                        value={currentDecision.targetZoneId || ''}
                        onChange={(e) => handleActionChange(alert.memberId, alert.zoneId, 'change', e.target.value)}
                        className="w-full text-xs bg-white border border-blue-300 rounded-xl p-2 font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-400"
                      >
                        <option value="">-- Choisir la nouvelle zone destination --</option>
                        {customZones
                          .filter((z) => z.id !== alert.zoneId)
                          .map((z) => (
                            <option key={z.id} value={z.id}>
                              {z.name} ({z.memberIds.length} membres)
                            </option>
                          ))}
                      </select>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {/* Footer Actions */}
        <div className="flex items-center justify-end gap-3 border-t border-slate-100 pt-4">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-2xl transition-colors cursor-pointer"
          >
            Passer / Ignorer
          </button>

          <button
            type="button"
            onClick={handleConfirm}
            className="inline-flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-[#2be39d] via-[#48c92a] to-[#8de02d] hover:brightness-105 text-emerald-950 text-xs font-extrabold rounded-2xl shadow-sm transition-all cursor-pointer active:scale-95"
          >
            <CheckCircle2 className="w-4 h-4 text-emerald-950" />
            <span>Valider les décisions d'affectation</span>
          </button>
        </div>

      </div>
    </div>
  );
};
