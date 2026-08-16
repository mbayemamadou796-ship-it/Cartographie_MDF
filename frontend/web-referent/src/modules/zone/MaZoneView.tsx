import React from 'react';
import { CustomZone, Member, AppUser } from '@shared/types';
import { MapPin, Users, Building, ShieldCheck, Mail, Phone, Calendar } from 'lucide-react';

interface MaZoneViewProps {
  zone: CustomZone | null;
  members: Member[];
  currentUser: AppUser | null;
  onSelectMember: (member: Member) => void;
}

export const MaZoneView: React.FC<MaZoneViewProps> = ({
  zone,
  members,
  currentUser,
  onSelectMember
}) => {
  const zoneName = zone?.name || currentUser?.region || 'Ma Zone';

  // Extract cities in this zone
  const citiesMap = new Map<string, number>();
  members.forEach((m) => {
    const v = m.ville?.trim();
    if (v) {
      citiesMap.set(v, (citiesMap.get(v) || 0) + 1);
    }
  });

  const sortedCities = Array.from(citiesMap.entries()).sort((a, b) => b[1] - a[1]);

  return (
    <div className="space-y-6">
      
      {/* Header card */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-100 shadow-sm space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3.5">
            <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center text-2xl font-black shadow-inner">
              📍
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-xl sm:text-2xl font-black text-slate-900 font-['Outfit']">
                  Antenne Régionale : {zoneName}
                </h2>
                <span className="px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[11px] font-extrabold">
                  Active
                </span>
              </div>
              <p className="text-xs text-slate-500 mt-0.5">
                {zone?.description || `Périmètre géographique et animation des membres de ${zoneName}.`}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="bg-slate-50 px-4 py-2 rounded-2xl border border-slate-100 text-right">
              <span className="text-[10px] uppercase font-bold text-slate-400 block">Effectif rattaché</span>
              <span className="text-lg font-black text-slate-900 font-['Outfit']">{members.length} adhérents</span>
            </div>
          </div>
        </div>
      </div>

      {/* Grid: Cities distribution & Referent Mission */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Cities representation (1 col) */}
        <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-slate-900 font-['Outfit'] flex items-center gap-2">
              <Building className="w-4 h-4 text-emerald-600" />
              <span>Villes représentées ({sortedCities.length})</span>
            </h3>
          </div>

          {sortedCities.length === 0 ? (
            <p className="text-xs text-slate-400">Aucune ville renseignée pour les membres de cette zone.</p>
          ) : (
            <div className="space-y-2.5 max-h-80 overflow-y-auto pr-1">
              {sortedCities.map(([ville, count]) => (
                <div key={ville} className="flex items-center justify-between p-2.5 rounded-xl bg-slate-50 border border-slate-100 text-xs">
                  <span className="font-bold text-slate-800 truncate max-w-[170px]">{ville}</span>
                  <span className="font-black text-emerald-800 bg-emerald-100 px-2 py-0.5 rounded-md text-[11px]">
                    {count} {count > 1 ? 'membres' : 'membre'}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Members preview in zone (2 cols) */}
        <div className="lg:col-span-2 bg-white rounded-3xl p-6 border border-slate-100 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-slate-900 font-['Outfit'] flex items-center gap-2">
              <Users className="w-4 h-4 text-emerald-600" />
              <span>Membres de l'antenne ({members.length})</span>
            </h3>
          </div>

          {members.length === 0 ? (
            <div className="text-center py-10 border border-dashed border-slate-200 rounded-2xl">
              <p className="text-xs text-slate-400 font-medium">Aucun membre rattaché à cette zone pour le moment.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-h-96 overflow-y-auto pr-1">
              {members.map((m) => (
                <div
                  key={m.id}
                  onClick={() => onSelectMember(m)}
                  className="p-3 rounded-2xl border border-slate-100 hover:border-emerald-200 hover:bg-emerald-50/20 transition-all cursor-pointer space-y-1.5"
                >
                  <div className="flex items-center justify-between">
                    <h4 className="text-xs font-bold text-slate-900 truncate">
                      {m.prenom} {m.nom}
                    </h4>
                    <span className="text-[10px] font-bold text-slate-400 bg-slate-100 px-1.5 py-0.5 rounded">
                      {m.ville || 'Ville non renseignée'}
                    </span>
                  </div>

                  <p className="text-[11px] text-slate-500 truncate">
                    {m.organisation || m.profession || m.situationProfessionnelle || 'Membre actif'}
                  </p>

                  <div className="flex items-center gap-3 text-[10px] text-slate-400 pt-1">
                    {m.telephone && (
                      <span className="flex items-center gap-1">
                        <Phone className="w-3 h-3 text-emerald-600" />
                        <span>{m.telephone}</span>
                      </span>
                    )}
                    {m.email && (
                      <span className="flex items-center gap-1 truncate max-w-[130px]">
                        <Mail className="w-3 h-3 text-blue-600" />
                        <span>{m.email}</span>
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

      </div>

    </div>
  );
};
