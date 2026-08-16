import React, { useState, useMemo } from 'react';
import { Member, CustomZone } from '@shared/types';
import { Search, Filter, Phone, Mail, MapPin, Building, Briefcase, GraduationCap, Users } from 'lucide-react';

interface MesMembresViewProps {
  zone: CustomZone | null;
  members: Member[];
  onSelectMember: (member: Member) => void;
}

export const MesMembresView: React.FC<MesMembresViewProps> = ({
  zone,
  members,
  onSelectMember
}) => {
  const [search, setSearch] = useState('');
  const [selectedCity, setSelectedCity] = useState('');

  const availableCities = useMemo(() => {
    const cities = new Set<string>();
    members.forEach((m) => {
      if (m.ville) cities.add(m.ville.trim());
    });
    return Array.from(cities).sort();
  }, [members]);

  const filteredMembers = useMemo(() => {
    return members.filter((m) => {
      const matchSearch =
        !search ||
        `${m.prenom} ${m.nom}`.toLowerCase().includes(search.toLowerCase()) ||
        (m.ville && m.ville.toLowerCase().includes(search.toLowerCase())) ||
        (m.organisation && m.organisation.toLowerCase().includes(search.toLowerCase())) ||
        (m.telephone && m.telephone.includes(search)) ||
        (m.email && m.email.toLowerCase().includes(search.toLowerCase()));

      const matchCity = !selectedCity || m.ville?.toLowerCase() === selectedCity.toLowerCase();

      return matchSearch && matchCity;
    });
  }, [members, search, selectedCity]);

  return (
    <div className="space-y-6">
      
      {/* Top Header & Search Bar */}
      <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-sm space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h2 className="text-xl font-black text-slate-900 font-['Outfit'] flex items-center gap-2">
              <Users className="w-5 h-5 text-emerald-600" />
              <span>Membres de mon antenne ({members.length})</span>
            </h2>
            <p className="text-xs text-slate-500">
              Coordonnées et profils des adhérents Mbok de France rattachés à votre zone.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {/* Search Input */}
            <div className="relative min-w-[240px]">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Rechercher nom, ville, métier..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-9 pr-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs font-medium focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500 transition-all"
              />
            </div>

            {/* City Filter */}
            {availableCities.length > 0 && (
              <select
                value={selectedCity}
                onChange={(e) => setSelectedCity(e.target.value)}
                className="px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs font-semibold text-slate-700 focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
              >
                <option value="">Toutes les villes ({availableCities.length})</option>
                {availableCities.map((city) => (
                  <option key={city} value={city}>
                    {city}
                  </option>
                ))}
              </select>
            )}
          </div>
        </div>
      </div>

      {/* Member Cards Grid */}
      {filteredMembers.length === 0 ? (
        <div className="bg-white rounded-3xl p-12 text-center border border-slate-100 shadow-sm space-y-3">
          <p className="text-sm font-bold text-slate-700">Aucun membre ne correspond à votre recherche.</p>
          <p className="text-xs text-slate-400">Essayez de modifier vos filtres ou termes de recherche.</p>
          {(search || selectedCity) && (
            <button
              onClick={() => {
                setSearch('');
                setSelectedCity('');
              }}
              className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-xs font-bold text-slate-700 transition-colors"
            >
              Réinitialiser les filtres
            </button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredMembers.map((member) => (
            <div
              key={member.id}
              onClick={() => onSelectMember(member)}
              className="bg-white rounded-3xl p-5 border border-slate-100 hover:border-emerald-300 hover:shadow-md transition-all cursor-pointer space-y-3 group flex flex-col justify-between"
            >
              <div className="space-y-2">
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-2xl bg-emerald-100 text-emerald-800 flex items-center justify-center font-black text-sm shadow-inner group-hover:scale-105 transition-transform">
                      {member.prenom?.charAt(0)}{member.nom?.charAt(0)}
                    </div>
                    <div>
                      <h3 className="text-sm font-black text-slate-900 group-hover:text-emerald-800 transition-colors">
                        {member.prenom} {member.nom}
                      </h3>
                      <p className="text-[11px] text-slate-500 font-medium flex items-center gap-1">
                        <MapPin className="w-3 h-3 text-slate-400" />
                        <span>{member.ville || 'Ville non précisée'}</span>
                      </p>
                    </div>
                  </div>
                </div>

                {/* Profession / Role */}
                <div className="text-xs text-slate-700 bg-slate-50 p-2.5 rounded-xl border border-slate-100 space-y-1">
                  {member.fonction && (
                    <div className="flex items-center gap-1.5 font-bold text-slate-800">
                      <Briefcase className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                      <span className="truncate">{member.fonction}</span>
                    </div>
                  )}
                  {member.organisation && (
                    <div className="flex items-center gap-1.5 text-[11px] text-slate-600">
                      <Building className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                      <span className="truncate">{member.organisation}</span>
                    </div>
                  )}
                  {!member.fonction && !member.organisation && (
                    <p className="text-[11px] text-slate-500 italic">
                      {member.situationProfessionnelle || 'Membre Mbok de France'}
                    </p>
                  )}
                </div>
              </div>

              {/* Contacts */}
              <div className="pt-2 border-t border-slate-100 flex items-center justify-between gap-2 text-xs">
                {member.telephone ? (
                  <a
                    href={`tel:${member.telephone}`}
                    onClick={(e) => e.stopPropagation()}
                    className="flex items-center gap-1 text-emerald-700 font-bold hover:underline bg-emerald-50 px-2.5 py-1 rounded-lg"
                  >
                    <Phone className="w-3 h-3" />
                    <span>{member.telephone}</span>
                  </a>
                ) : (
                  <span className="text-[10px] text-slate-300">Pas de tél</span>
                )}

                {member.email ? (
                  <a
                    href={`mailto:${member.email}`}
                    onClick={(e) => e.stopPropagation()}
                    className="flex items-center gap-1 text-blue-700 font-bold hover:underline bg-blue-50 px-2.5 py-1 rounded-lg truncate max-w-[140px]"
                  >
                    <Mail className="w-3 h-3" />
                    <span className="truncate">Email</span>
                  </a>
                ) : (
                  <span className="text-[10px] text-slate-300">Pas d'email</span>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

    </div>
  );
};
