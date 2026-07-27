import React from 'react';
import { FilterState, SortOption, CustomZone } from '../types';
import { Users, ArrowUpDown, X, AlertTriangle, Layers } from 'lucide-react';

interface InfoBarProps {
  totalCount: number;
  filteredCount: number;
  filters: FilterState;
  customZones?: CustomZone[];
  onFilterChange: (newFilters: Partial<FilterState>) => void;
  onResetFilters: () => void;
}

export const InfoBar: React.FC<InfoBarProps> = ({
  totalCount,
  filteredCount,
  filters,
  customZones = [],
  onFilterChange,
  onResetFilters
}) => {
  const activeZone = filters.zoneId
    ? customZones.find((z) => z.id === filters.zoneId)
    : null;

  const activeFilters = [
    { key: 'ville', label: 'Ville', value: filters.ville },
    { key: 'departement', label: 'Département', value: filters.departement },
    { key: 'region', label: 'Région', value: filters.region },
    { key: 'organisation', label: 'Organisation', value: filters.organisation },
    { key: 'fonction', label: 'Fonction', value: filters.fonction },
    { key: 'searchQuery', label: 'Recherche', value: filters.searchQuery }
  ].filter((item) => Boolean(item.value));

  const qualityLabels: Record<string, string> = {
    no_phone: 'Sans téléphone',
    no_email: 'Sans email',
    no_location: 'Non géolocalisés',
    duplicates: 'Doublons détectés'
  };

  const hasQualityFilter = filters.qualityFilter && filters.qualityFilter !== 'all';

  return (
    <div className="bg-white border-y border-emerald-200 px-4 sm:px-6 py-2.5 shadow-2xs rounded-2xl">
      <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 sm:gap-4">
        
        {/* Counter & Active Filter Pills */}
        <div className="flex flex-wrap items-center gap-2 flex-1">
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-emerald-50/80 rounded-lg text-xs font-bold text-emerald-950 border border-emerald-200">
            <Users className="w-3.5 h-3.5 text-emerald-600" />
            <span>
              {filteredCount} membre{filteredCount > 1 ? 's' : ''}{' '}
              <span className="font-normal text-slate-500">sur {totalCount}</span>
            </span>
          </div>

          {/* Active Filter Chips */}
          {(activeFilters.length > 0 || hasQualityFilter || Boolean(activeZone)) && (
            <div className="flex flex-wrap items-center gap-1.5">
              {activeZone && (
                <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-emerald-800 text-white border border-emerald-900 rounded-full text-[11px] font-bold shadow-2xs">
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
                <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-amber-100 border border-amber-300 text-amber-950 rounded-full text-[11px] font-bold shadow-2xs">
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
                  className="inline-flex items-center gap-1 px-2.5 py-1 bg-emerald-100/80 border border-emerald-300 text-emerald-950 rounded-full text-[11px] font-semibold shadow-2xs"
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
                className="text-[11px] text-rose-600 hover:text-rose-700 underline font-semibold ml-1"
              >
                Tout effacer
              </button>
            </div>
          )}
        </div>

        {/* Sort Selector */}
        <div className="flex items-center gap-2 self-end sm:self-auto">
          <label className="text-xs font-semibold text-slate-600 flex items-center gap-1">
            <ArrowUpDown className="w-3.5 h-3.5 text-emerald-600" /> Tri :
          </label>
          <select
            value={filters.sortBy}
            onChange={(e) => onFilterChange({ sortBy: e.target.value as SortOption })}
            className="text-xs bg-emerald-50/50 border border-emerald-200 rounded-lg px-2.5 py-1.5 font-medium text-slate-800 focus:bg-white focus:border-emerald-500 outline-none"
          >
            <option value="nom_asc" className="bg-white text-slate-800">Nom (A → Z)</option>
            <option value="nom_desc" className="bg-white text-slate-800">Nom (Z → A)</option>
            <option value="ville_asc" className="bg-white text-slate-800">Ville</option>
            <option value="organisation_asc" className="bg-white text-slate-800">Organisation</option>
          </select>
        </div>

      </div>
    </div>
  );
};
