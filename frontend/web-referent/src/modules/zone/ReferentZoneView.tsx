import React, { useMemo } from 'react';
import { Member, CustomZone } from '@shared/types';
import { MapPin, Users, Building, Phone, Mail, Award, CheckCircle } from 'lucide-react';

interface ReferentZoneViewProps {
  currentZone: string;
  zoneMembers: Member[];
  customZones: CustomZone[];
}

export const ReferentZoneView: React.FC<ReferentZoneViewProps> = ({
  currentZone,
  zoneMembers,
  customZones
}) => {
  // Cities breakdown
  const citiesBreakdown = useMemo(() => {
    const map = new Map<string, number>();
    zoneMembers.forEach(m => {
      const city = m.ville?.trim() || 'Non renseignée';
      map.set(city, (map.get(city) || 0) + 1);
    });
    return Array.from(map.entries())
      .map(([name, count]) => ({ name, count }))
      .sort((a, b) => b.count - a.count);
  }, [zoneMembers]);

  // Matching custom zone configuration if any
  const matchedCustomZone = customZones.find(z => z.name.toLowerCase() === currentZone.toLowerCase());

  return (
    <div className="space-y-6">
      {/* Zone Overview Banner */}
      <div className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-2xs">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-emerald-100 text-emerald-800 rounded-full text-xs font-bold mb-2">
              <MapPin className="w-3.5 h-3.5" /> Antenne Territoriale
            </div>
            <h1 className="text-2xl font-black text-slate-900">Zone : {currentZone}</h1>
            <p className="text-xs text-slate-500 mt-1">
              Vue d'ensemble territoriale, effectifs par ville et composition de la communauté locale.
            </p>
          </div>

          <div className="flex items-center gap-3 bg-slate-50 p-4 rounded-xl border border-slate-200">
            <div className="text-center px-3">
              <span className="block text-2xl font-black text-emerald-700">{zoneMembers.length}</span>
              <span className="text-[11px] font-bold text-slate-500 uppercase">Membres</span>
            </div>
            <div className="w-px h-8 bg-slate-200" />
            <div className="text-center px-3">
              <span className="block text-2xl font-black text-slate-800">{citiesBreakdown.length}</span>
              <span className="text-[11px] font-bold text-slate-500 uppercase">Villes</span>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Cities list (1 col) */}
        <div className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-2xs">
          <h2 className="text-base font-bold text-slate-900 mb-1">Répartition par Ville</h2>
          <p className="text-xs text-slate-500 mb-4">Villes couvertes dans votre zone</p>

          <div className="space-y-2 max-h-[450px] overflow-y-auto pr-1">
            {citiesBreakdown.map((city, idx) => {
              const pct = Math.round((city.count / (zoneMembers.length || 1)) * 100);
              return (
                <div key={city.name} className="p-3 rounded-xl bg-slate-50 border border-slate-100 hover:border-emerald-200 transition">
                  <div className="flex items-center justify-between text-xs font-bold text-slate-800 mb-1">
                    <span className="flex items-center gap-1.5">
                      <span className="w-5 h-5 rounded-md bg-white border border-slate-200 flex items-center justify-center text-[10px] text-slate-500">
                        {idx + 1}
                      </span>
                      {city.name}
                    </span>
                    <span className="text-emerald-700">{city.count} adh. ({pct}%)</span>
                  </div>
                  <div className="w-full bg-slate-200 rounded-full h-1.5 overflow-hidden">
                    <div className="bg-emerald-600 h-1.5 rounded-full" style={{ width: `${pct}%` }} />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Members Sample / Details (2 cols) */}
        <div className="lg:col-span-2 bg-white rounded-2xl border border-slate-200/80 p-6 shadow-2xs space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-base font-bold text-slate-900">Adhérents de l'Antenne ({zoneMembers.length})</h2>
              <p className="text-xs text-slate-500">Aperçu direct des coordonnées pour prise de contact rapide</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 max-h-[450px] overflow-y-auto pr-1">
            {zoneMembers.slice(0, 12).map((member) => (
              <div
                key={member.id}
                className="p-3.5 rounded-xl border border-slate-100 bg-slate-50/50 hover:bg-white hover:border-emerald-200 hover:shadow-2xs transition"
              >
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 rounded-full bg-emerald-700 text-white flex items-center justify-center font-bold text-xs shrink-0">
                    {member.prenom?.charAt(0)}{member.nom?.charAt(0)}
                  </div>
                  <div className="min-w-0 flex-1">
                    <h4 className="text-xs font-bold text-slate-900 truncate">
                      {member.prenom} {member.nom}
                    </h4>
                    <p className="text-[11px] text-slate-500 truncate flex items-center gap-1 mt-0.5">
                      <MapPin className="w-3 h-3 text-slate-400 shrink-0" />
                      {member.ville || 'France'}
                    </p>

                    <div className="flex items-center gap-2 mt-2 pt-2 border-t border-slate-200/60">
                      {member.telephone && (
                        <a
                          href={`tel:${member.telephone}`}
                          className="p-1 rounded bg-white border border-slate-200 text-slate-700 hover:text-emerald-700 text-[10px] flex items-center gap-1 px-2 font-medium"
                        >
                          <Phone className="w-2.5 h-2.5 text-emerald-600" />
                          <span>Appeler</span>
                        </a>
                      )}
                      {member.email && (
                        <a
                          href={`mailto:${member.email}`}
                          className="p-1 rounded bg-white border border-slate-200 text-slate-700 hover:text-emerald-700 text-[10px] flex items-center gap-1 px-2 font-medium"
                        >
                          <Mail className="w-2.5 h-2.5 text-emerald-600" />
                          <span>Email</span>
                        </a>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
