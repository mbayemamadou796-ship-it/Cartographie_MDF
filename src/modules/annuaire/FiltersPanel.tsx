import React from 'react';
import { Member, FilterState, QualityFilter, CustomZone } from '../../types';
import { RotateCcw, X, MapPin, Building, Briefcase, Compass, Layers, AlertTriangle } from 'lucide-react';

interface FiltersPanelProps {
  members: Member[];
  customZones?: CustomZone[];
  filters: FilterState;
  onFilterChange: (newFilters: Partial<FilterState>) => void;
  onResetFilters: () => void;
  onClose: () => void;
}

export const FiltersPanel: React.FC<FiltersPanelProps> = ({
  members,
  customZones = [],
  filters,
  onFilterChange,
  onResetFilters,
  onClose
}) => {
  // Extract unique values for filters
  const getUniqueOptions = (key: keyof Member) => {
    const map = new Map<string, number>();
    members.forEach((m) => {
      const val = String(m[key] || '').trim();
      if (val) {
        map.set(val, (map.get(val) || 0) + 1);
      }
    });
    return Array.from(map.entries())
      .map(([value, count]) => ({ value, count }))
      .sort((a, b) => a.value.localeCompare(b.value, 'fr'));
  };

  const villeOptions = getUniqueOptions('ville');
  const deptOptions = getUniqueOptions('departement');
  const regionOptions = getUniqueOptions('region');
  const orgOptions = getUniqueOptions('organisation');
  const fonctionOptions = getUniqueOptions('fonction');

  const hasActiveFilters = Boolean(
    filters.ville ||
      filters.departement ||
      filters.region ||
      filters.organisation ||
      filters.fonction ||
      filters.zoneId ||
      filters.qualityFilter !== 'all'
  );

  return (
    <div className="bg-emerald-50/90 border-b border-emerald-200 shadow-sm transition-all animate-in slide-in-from-top-2 duration-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
        <div className="flex items-center justify-between pb-3 mb-3 border-b border-emerald-200/70">
          <div className="flex items-center gap-2">
            <Layers className="w-4 h-4 text-emerald-700" />
            <h3 className="text-sm font-bold text-emerald-950 font-['Outfit']">Filtres multicritères des membres</h3>
          </div>
          
          <div className="flex items-center gap-3">
            {hasActiveFilters && (
              <button
                onClick={onResetFilters}
                className="inline-flex items-center gap-1.5 text-xs text-rose-600 hover:text-rose-700 font-semibold transition-colors"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Réinitialiser tous les filtres</span>
              </button>
            )}
            <button
              onClick={onClose}
              className="text-slate-500 hover:text-slate-800 p-1 rounded-lg hover:bg-emerald-100 transition-colors"
              title="Fermer les filtres"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Filter Dropdowns Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-7 gap-3">
          
          {/* Custom Zone */}
          <div>
            <label className="block text-[11px] font-bold text-emerald-800 uppercase tracking-wider mb-1 flex items-center gap-1">
              <Layers className="w-3 h-3 text-emerald-600" /> Zone MDF
            </label>
            <select
              value={filters.zoneId || ''}
              onChange={(e) => onFilterChange({ zoneId: e.target.value || undefined })}
              className="w-full text-xs bg-emerald-100/70 border border-emerald-300 rounded-xl px-2.5 py-2 text-emerald-950 font-bold focus:border-emerald-600 outline-none shadow-2xs"
            >
              <option value="">Toutes les zones ({customZones.length})</option>
              {customZones.map((z) => (
                <option key={z.id} value={z.id}>
                  {z.name} ({z.memberIds.length})
                </option>
              ))}
            </select>
          </div>
          
          {/* Ville */}
          <div>
            <label className="block text-[11px] font-bold text-emerald-800 uppercase tracking-wider mb-1 flex items-center gap-1">
              <MapPin className="w-3 h-3 text-emerald-600" /> Ville
            </label>
            <select
              value={filters.ville}
              onChange={(e) => onFilterChange({ ville: e.target.value })}
              className="w-full text-xs bg-white border border-emerald-200 rounded-xl px-2.5 py-2 text-slate-800 font-medium focus:border-emerald-500 outline-none shadow-2xs"
            >
              <option value="" className="text-slate-700">Toutes les villes ({villeOptions.length})</option>
              {villeOptions.map((opt) => (
                <option key={opt.value} value={opt.value} className="text-slate-700">
                  {opt.value} ({opt.count})
                </option>
              ))}
            </select>
          </div>

          {/* Département */}
          <div>
            <label className="block text-[11px] font-bold text-emerald-800 uppercase tracking-wider mb-1 flex items-center gap-1">
              <Compass className="w-3 h-3 text-emerald-600" /> Département
            </label>
            <select
              value={filters.departement}
              onChange={(e) => onFilterChange({ departement: e.target.value })}
              className="w-full text-xs bg-white border border-emerald-200 rounded-xl px-2.5 py-2 text-slate-800 font-medium focus:border-emerald-500 outline-none shadow-2xs"
            >
              <option value="" className="text-slate-700">Tous départements ({deptOptions.length})</option>
              {deptOptions.map((opt) => (
                <option key={opt.value} value={opt.value} className="text-slate-700">
                  {opt.value} ({opt.count})
                </option>
              ))}
            </select>
          </div>

          {/* Région */}
          <div>
            <label className="block text-[11px] font-bold text-emerald-800 uppercase tracking-wider mb-1 flex items-center gap-1">
              <Compass className="w-3 h-3 text-emerald-600" /> Région
            </label>
            <select
              value={filters.region}
              onChange={(e) => onFilterChange({ region: e.target.value })}
              className="w-full text-xs bg-white border border-emerald-200 rounded-xl px-2.5 py-2 text-slate-800 font-medium focus:border-emerald-500 outline-none shadow-2xs"
            >
              <option value="" className="text-slate-700">Toutes régions ({regionOptions.length})</option>
              {regionOptions.map((opt) => (
                <option key={opt.value} value={opt.value} className="text-slate-700">
                  {opt.value} ({opt.count})
                </option>
              ))}
            </select>
          </div>

          {/* Organisation */}
          <div>
            <label className="block text-[11px] font-bold text-emerald-800 uppercase tracking-wider mb-1 flex items-center gap-1">
              <Building className="w-3 h-3 text-emerald-600" /> Organisation
            </label>
            <select
              value={filters.organisation}
              onChange={(e) => onFilterChange({ organisation: e.target.value })}
              className="w-full text-xs bg-white border border-emerald-200 rounded-xl px-2.5 py-2 text-slate-800 font-medium focus:border-emerald-500 outline-none shadow-2xs"
            >
              <option value="" className="text-slate-700">Toutes organisations ({orgOptions.length})</option>
              {orgOptions.map((opt) => (
                <option key={opt.value} value={opt.value} className="text-slate-700">
                  {opt.value} ({opt.count})
                </option>
              ))}
            </select>
          </div>

          {/* Fonction */}
          <div>
            <label className="block text-[11px] font-bold text-emerald-800 uppercase tracking-wider mb-1 flex items-center gap-1">
              <Briefcase className="w-3 h-3 text-emerald-600" /> Fonction
            </label>
            <select
              value={filters.fonction}
              onChange={(e) => onFilterChange({ fonction: e.target.value })}
              className="w-full text-xs bg-white border border-emerald-200 rounded-xl px-2.5 py-2 text-slate-800 font-medium focus:border-emerald-500 outline-none shadow-2xs"
            >
              <option value="" className="text-slate-700">Toutes fonctions ({fonctionOptions.length})</option>
              {fonctionOptions.map((opt) => (
                <option key={opt.value} value={opt.value} className="text-slate-700">
                  {opt.value} ({opt.count})
                </option>
              ))}
            </select>
          </div>

          {/* Quality Filter */}
          <div>
            <label className="block text-[11px] font-bold text-emerald-800 uppercase tracking-wider mb-1 flex items-center gap-1">
              <AlertTriangle className="w-3 h-3 text-amber-600" /> Statut Qualité
            </label>
            <select
              value={filters.qualityFilter}
              onChange={(e) => onFilterChange({ qualityFilter: e.target.value as QualityFilter })}
              className="w-full text-xs bg-amber-50 border border-amber-200 rounded-xl px-2.5 py-2 text-slate-900 font-bold focus:border-amber-500 outline-none shadow-2xs"
            >
              <option value="all">Tous les membres</option>
              <option value="no_phone">⚠️ Sans téléphone</option>
              <option value="no_email">⚠️ Sans email</option>
              <option value="no_location">📍 Non géolocalisés</option>
              <option value="duplicates">👯 Doublons potentiels</option>
            </select>
          </div>

        </div>
      </div>
    </div>
  );
};
