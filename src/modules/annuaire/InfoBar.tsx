import React from 'react';
import { FilterState, SortOption, CustomZone } from '../../types';
import { Users, ArrowUpDown, X, AlertTriangle, Layers, Search, Filter } from 'lucide-react';

interface InfoBarProps {
  totalCount: number;
  filteredCount: number;
  filters: FilterState;
  customZones?: CustomZone[];
  onFilterChange: (newFilters: Partial<FilterState>) => void;
  onResetFilters: () => void;
  activeFilterCount: number;
  onToggleFiltersPanel: () => void;
  isFiltersOpen: boolean;
}

export const InfoBar: React.FC<InfoBarProps> = ({
  totalCount,
  filteredCount,
  filters,
  customZones = [],
  onFilterChange,
  onResetFilters,
  activeFilterCount,
  onToggleFiltersPanel,
  isFiltersOpen
}) => {
  const activeZone = filters.zoneId
    ? customZones.find((z) => z.id === filters.zoneId)
    : null;

  const activeFilters = [
    { key: 'ville', label: 'Ville', value: filters.ville },
    { key: 'departement', label: 'Département', value: filters.departement },
    { key: 'region', label: 'Région', value: filters.region },
    { key: 'organisation', label: 'Organisation', value: filters.organisation },
    { key: 'fonction', label: 'Fonction', value: filters.fonction }
  ].filter((item) => Boolean(item.value));

  const qualityLabels: Record<string, string> = {
    no_phone: 'Sans téléphone',
    no_email: 'Sans email',
    no_location: 'Non géolocalisés',
    duplicates: 'Doublons détectés'
  };

  const hasQualityFilter = filters.qualityFilter && filters.qualityFilter !== 'all';

  return (
    <div className="bg-white border border-emerald-200 px-4 sm:px-5 py-3 shadow-sm rounded-3xl space-y-3">
      
      {/* Top Main Toolbar: Search Input + Filter Toggle + Counters + Sort */}
      <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
        
        {/* Left: Search Input & Filter Toggle Button */}
        <div className="flex items-center gap-2 flex-1 max-w-xl">
          {/* Search Field */}
          <div className="relative flex-1">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search className="h-4 w-4 text-emerald-600" />
            </div>
            <input
              type="text"
              value={filters.searchQuery}
              onChange={(e) => onFilterChange({ searchQuery: e.target.value })}
              placeholder="Rechercher par nom, ville, fonction, organisation..."
              className="block w-full pl-9 pr-8 py-2 text-xs sm:text-sm bg-emerald-50/50 hover:bg-emerald-50 focus:bg-white text-slate-800 placeholder-slate-400 rounded-xl border border-emerald-200 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-400/20 outline-none transition-all font-medium"
            />
            {filters.searchQuery && (
              <button
                onClick={() => onFilterChange({ searchQuery: '' })}
                className="absolute inset-y-0 right-0 pr-2.5 flex items-center text-slate-400 hover:text-slate-600"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>

          {/* Filter Toggle Button */}
          <button
            onClick={onToggleFiltersPanel}
            className={`relative inline-flex items-center gap-1.5 px-3.5 py-2 text-xs sm:text-sm font-semibold rounded-xl border transition-all cursor-pointer active:scale-95 shrink-0 ${
              isFiltersOpen || activeFilterCount > 0
                ? 'bg-emerald-100 border-emerald-300 text-emerald-900 shadow-xs font-bold'
                : 'bg-emerald-50/70 hover:bg-emerald-100/60 border-emerald-200 text-slate-700'
            }`}
          >
            <Filter className="w-4 h-4 text-emerald-600" />
            <span>Filtres</span>
            {activeFilterCount > 0 && (
              <span className="inline-flex items-center justify-center w-5 h-5 text-[11px] font-bold rounded-full bg-emerald-600 text-white shadow-xs">
                {activeFilterCount}
              </span>
            )}
          </button>
        </div>

        {/* Right: Counter Badge + Sort Selector */}
        <div className="flex items-center justify-between md:justify-end gap-3 shrink-0">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 bg-emerald-50 rounded-xl text-xs font-bold text-emerald-950 border border-emerald-200/80">
            <Users className="w-4 h-4 text-emerald-600" />
            <span>
              {filteredCount} membre{filteredCount > 1 ? 's' : ''}{' '}
              <span className="font-semibold text-slate-500">sur {totalCount}</span>
            </span>
          </div>

          <div className="flex items-center gap-1.5">
            <label className="text-xs font-bold text-slate-600 flex items-center gap-1">
              <ArrowUpDown className="w-3.5 h-3.5 text-emerald-600" /> Tri :
            </label>
            <select
              value={filters.sortBy}
              onChange={(e) => onFilterChange({ sortBy: e.target.value as SortOption })}
              className="text-xs bg-emerald-50/50 border border-emerald-200 rounded-xl px-2.5 py-1.5 font-bold text-slate-800 focus:bg-white focus:border-emerald-500 outline-none"
            >
              <option value="nom_asc">Nom (A → Z)</option>
              <option value="nom_desc">Nom (Z → A)</option>
              <option value="ville_asc">Ville</option>
              <option value="organisation_asc">Organisation</option>
            </select>
          </div>
        </div>

      </div>

      {/* Active Filter Chips & Clear All button */}
      {(activeFilters.length > 0 || hasQualityFilter || Boolean(activeZone) || Boolean(filters.searchQuery)) && (
        <div className="flex flex-wrap items-center gap-1.5 pt-2 border-t border-slate-100">
          <span className="text-[11px] font-bold text-slate-400 mr-1">Filtres actifs :</span>
          
          {filters.searchQuery && (
            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 bg-emerald-100 border border-emerald-300 text-emerald-950 rounded-full text-[11px] font-semibold">
              <span className="text-emerald-700 font-medium">Recherche :</span>
              <span className="truncate max-w-[120px]">{filters.searchQuery}</span>
              <button
                onClick={() => onFilterChange({ searchQuery: '' })}
                className="hover:text-rose-600 p-0.5 rounded-full hover:bg-emerald-200 transition-colors"
              >
                <X className="w-3 h-3" />
              </button>
            </span>
          )}

          {activeZone && (
            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 bg-emerald-800 text-white border border-emerald-900 rounded-full text-[11px] font-bold shadow-2xs">
              <Layers className="w-3 h-3 text-emerald-300" />
              <span>Zone : {activeZone.name} ({activeZone.memberIds.length})</span>
              <button
                onClick={() => onFilterChange({ zoneId: undefined })}
                className="hover:text-rose-300 p-0.5 rounded-full hover:bg-emerald-700 transition-colors ml-0.5"
              >
                <X className="w-3 h-3" />
              </button>
            </span>
          )}

          {hasQualityFilter && (
            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 bg-amber-100 border border-amber-300 text-amber-950 rounded-full text-[11px] font-bold shadow-2xs">
              <AlertTriangle className="w-3 h-3 text-amber-600" />
              <span>Qualité : {qualityLabels[filters.qualityFilter] || filters.qualityFilter}</span>
              <button
                onClick={() => onFilterChange({ qualityFilter: 'all' })}
                className="hover:text-rose-600 p-0.5 rounded-full hover:bg-amber-200 transition-colors"
              >
                <X className="w-3 h-3" />
              </button>
            </span>
          )}

          {activeFilters.map((af) => (
            <span
              key={af.key}
              className="inline-flex items-center gap-1 px-2.5 py-0.5 bg-emerald-100/80 border border-emerald-300 text-emerald-950 rounded-full text-[11px] font-semibold shadow-2xs"
            >
              <span className="text-emerald-700 font-medium">{af.label}:</span>
              <span className="truncate max-w-[120px]">{af.value}</span>
              <button
                onClick={() => onFilterChange({ [af.key]: '' })}
                className="hover:text-rose-600 p-0.5 rounded-full hover:bg-emerald-200 transition-colors"
              >
                <X className="w-3 h-3" />
              </button>
            </span>
          ))}

          <button
            onClick={onResetFilters}
            className="text-[11px] text-rose-600 hover:text-rose-700 underline font-semibold ml-1 cursor-pointer"
          >
            Tout réinitialiser
          </button>
        </div>
      )}

    </div>
  );
};
