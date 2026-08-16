import React, { useState, useMemo } from 'react';
import { Member } from '@shared/types';
import { Search, Phone, Mail, MapPin, Building, Briefcase, Eye } from 'lucide-react';

interface ReferentMembersViewProps {
  members: Member[];
  currentZone: string;
  onSelectMember: (member: Member) => void;
}

export const ReferentMembersView: React.FC<ReferentMembersViewProps> = ({
  members,
  currentZone,
  onSelectMember
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCity, setSelectedCity] = useState('all');

  const cities = useMemo(() => {
    return Array.from(new Set(members.map(m => m.ville).filter(Boolean))).sort();
  }, [members]);

  const filteredMembers = useMemo(() => {
    return members.filter(m => {
      const matchSearch = 
        `${m.nom} ${m.prenom} ${m.ville} ${m.email} ${m.organisation} ${m.telephone}`
          .toLowerCase()
          .includes(searchTerm.toLowerCase());
      
      const matchCity = selectedCity === 'all' || m.ville === selectedCity;

      return matchSearch && matchCity;
    });
  }, [members, searchTerm, selectedCity]);

  return (
    <div className="space-y-6">
      {/* Header & Filters */}
      <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-2xs">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-xl font-extrabold text-slate-900">Membres de votre Antenne ({filteredMembers.length})</h1>
            <p className="text-xs text-slate-500">Consultez l'annuaire de proximité et gérez les prises de contact</p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            {/* Search Input */}
            <div className="relative min-w-[240px]">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Rechercher par nom, ville, profession..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-9 pr-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-emerald-600 focus:bg-white transition"
              />
            </div>

            {/* City Filter */}
            <select
              value={selectedCity}
              onChange={(e) => setSelectedCity(e.target.value)}
              className="py-2 px-3 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-emerald-600 font-medium text-slate-700"
            >
              <option value="all">Toutes les villes ({cities.length})</option>
              {cities.map(c => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Grid of Members */}
      {filteredMembers.length === 0 ? (
        <div className="bg-white rounded-2xl border border-dashed border-slate-300 p-12 text-center">
          <p className="text-sm font-bold text-slate-700">Aucun membre ne correspond à votre recherche</p>
          <p className="text-xs text-slate-400 mt-1">Modifiez vos critères de recherche ou réinitialisez les filtres.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredMembers.map((member) => (
            <div
              key={member.id}
              className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-2xs hover:border-emerald-300 hover:shadow-md transition flex flex-col justify-between"
            >
              <div>
                <div className="flex items-start justify-between gap-3 mb-3">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-emerald-600 to-teal-800 text-white flex items-center justify-center font-black text-sm shadow-sm shrink-0">
                      {member.prenom?.charAt(0)}{member.nom?.charAt(0)}
                    </div>
                    <div>
                      <h3 className="text-sm font-black text-slate-900 leading-tight">
                        {member.prenom} {member.nom}
                      </h3>
                      <p className="text-xs font-medium text-emerald-700 mt-0.5">
                        {member.fonction || member.situationProfessionnelle || 'Membre MDF'}
                      </p>
                    </div>
                  </div>

                  <button
                    onClick={() => onSelectMember(member)}
                    className="p-1.5 rounded-lg bg-slate-50 hover:bg-emerald-50 text-slate-400 hover:text-emerald-700 transition"
                    title="Voir la fiche complète"
                  >
                    <Eye className="w-4 h-4" />
                  </button>
                </div>

                <div className="space-y-1.5 text-xs text-slate-600 pt-2 border-t border-slate-100">
                  <div className="flex items-center gap-2">
                    <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                    <span className="truncate">{member.ville || 'France'} ({member.codePostal || '—'})</span>
                  </div>

                  {member.organisation && (
                    <div className="flex items-center gap-2">
                      <Building className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                      <span className="truncate">{member.organisation}</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Direct Actions */}
              <div className="flex items-center gap-2 mt-4 pt-3 border-t border-slate-100">
                {member.telephone ? (
                  <a
                    href={`tel:${member.telephone}`}
                    className="flex-1 py-1.5 px-2.5 rounded-xl bg-emerald-50 hover:bg-emerald-100 text-emerald-800 text-xs font-bold flex items-center justify-center gap-1.5 transition"
                  >
                    <Phone className="w-3 h-3 text-emerald-600" />
                    <span>Appeler</span>
                  </a>
                ) : (
                  <span className="flex-1 py-1.5 px-2.5 rounded-xl bg-slate-50 text-slate-400 text-xs font-medium text-center">
                    Pas de tél.
                  </span>
                )}

                {member.email ? (
                  <a
                    href={`mailto:${member.email}`}
                    className="flex-1 py-1.5 px-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-bold flex items-center justify-center gap-1.5 transition"
                  >
                    <Mail className="w-3 h-3 text-slate-600" />
                    <span>Email</span>
                  </a>
                ) : (
                  <span className="flex-1 py-1.5 px-2.5 rounded-xl bg-slate-50 text-slate-400 text-xs font-medium text-center">
                    Pas d'email
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
