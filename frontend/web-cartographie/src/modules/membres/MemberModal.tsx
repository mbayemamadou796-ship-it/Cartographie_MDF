import React from 'react';
import { Member, CustomZone, UserRole } from '../../types';
import { X, MapPin, Phone, Mail, Navigation, Edit3, Trash2, Globe, Compass, Layers, Briefcase, GraduationCap, Calendar, Sliders } from 'lucide-react';

interface MemberModalProps {
  member: Member | null;
  customZones?: CustomZone[];
  userRole: UserRole;
  onClose: () => void;
  onSelectOnMap: (member: Member) => void;
  onEdit?: (member: Member) => void;
  onDelete?: (member: Member) => void;
}

export const MemberModal: React.FC<MemberModalProps> = ({
  member,
  customZones = [],
  userRole,
  onClose,
  onSelectOnMap,
  onEdit,
  onDelete
}) => {
  if (!member) return null;

  // Find custom zones this member belongs to
  const assignedZones = customZones.filter((z) => z.memberIds.includes(member.id));

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl shadow-2xl border border-emerald-200 w-full max-w-lg max-h-[92vh] flex flex-col overflow-hidden animate-in zoom-in-95 duration-200 text-slate-800">
        
        {/* Banner Header */}
        <div className="relative bg-gradient-to-r from-[#2be39d] via-[#48c92a] to-[#8de02d] px-6 pt-6 pb-12 text-emerald-950 shadow-inner shrink-0">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 text-emerald-950/80 hover:text-emerald-950 p-1.5 rounded-full hover:bg-black/10 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="text-[11px] font-extrabold uppercase tracking-wider text-emerald-950/90 font-['Outfit'] mb-0.5">
            Fiche Membre Mbok de France
          </div>
          <h2 className="text-xl font-bold tracking-tight text-emerald-950 font-['Outfit']">
            {member.prenom} {member.nom}
          </h2>
          <p className="text-xs text-emerald-900 font-bold italic mt-0.5 font-['Kalam',cursive]">
            Zone MDF : {member.zone || member.region || 'Île-de-France'}
          </p>
        </div>

        {/* Floating Photo & Quick Info Body */}
        <div className="px-6 pb-6 relative overflow-y-auto flex-1">
          
          {/* Avatar Photo & Action */}
          <div className="flex justify-between items-end -mt-8 mb-4">
            {member.photo ? (
              <img
                src={member.photo}
                alt={`${member.prenom} ${member.nom}`}
                className="w-20 h-20 rounded-2xl object-cover border-4 border-white shadow-lg bg-emerald-50"
              />
            ) : (
              <div className="w-20 h-20 rounded-2xl bg-gradient-to-tr from-[#2be39d] via-[#48c92a] to-[#8de02d] text-emerald-950 flex items-center justify-center font-extrabold text-2xl border-4 border-white shadow-lg font-['Outfit']">
                {(member.prenom?.[0] || '').toUpperCase()}{(member.nom?.[0] || '').toUpperCase()}
              </div>
            )}

            <button
              onClick={() => {
                onSelectOnMap(member);
                onClose();
              }}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-gradient-to-r from-[#2be39d] via-[#48c92a] to-[#8de02d] hover:brightness-105 text-emerald-950 rounded-xl text-xs font-bold shadow-xs transition-all"
            >
              <Navigation className="w-3.5 h-3.5" />
              <span>Voir sur la carte</span>
            </button>
          </div>

          {/* Detailed Info Sections (Synchronized with Add/Edit Form) */}
          <div className="space-y-3.5 text-xs">
            
            {/* SECTION 1: Identité & Coordonnées Principales */}
            <div className="bg-emerald-50/60 p-3.5 rounded-2xl border border-emerald-100 space-y-2.5">
              <div className="text-[10px] font-extrabold uppercase tracking-wider text-emerald-800 font-['Outfit'] border-b border-emerald-100 pb-1 flex items-center justify-between">
                <span>1. Identité & Coordonnées Principales</span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 pt-0.5">
                <div>
                  <span className="text-[10px] text-slate-500 font-bold uppercase block">Prénom</span>
                  <span className="font-bold text-sm text-slate-900">{member.prenom || 'Non renseigné'}</span>
                </div>

                <div>
                  <span className="text-[10px] text-slate-500 font-bold uppercase block">Nom</span>
                  <span className="font-bold text-sm text-slate-900">{member.nom || 'Non renseigné'}</span>
                </div>

                <div>
                  <span className="text-[10px] text-slate-500 font-bold uppercase block">Numéro de téléphone</span>
                  {member.telephone ? (
                    <a href={`tel:${member.telephone}`} className="font-bold text-emerald-800 hover:underline flex items-center gap-1.5 mt-0.5">
                      <Phone className="w-3.5 h-3.5 text-emerald-600" />
                      <span>{member.telephone}</span>
                    </a>
                  ) : (
                    <span className="text-slate-400 italic">Non renseigné</span>
                  )}
                </div>

                <div>
                  <span className="text-[10px] text-slate-500 font-bold uppercase block">Adresse e-mail</span>
                  {member.email ? (
                    <a href={`mailto:${member.email}`} className="font-bold text-emerald-800 hover:underline flex items-center gap-1.5 mt-0.5 truncate">
                      <Mail className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                      <span className="truncate">{member.email}</span>
                    </a>
                  ) : (
                    <span className="text-slate-400 italic">Non renseignée</span>
                  )}
                </div>
              </div>
            </div>

            {/* SECTION 2: Zone MDF, Parcours & Situation */}
            <div className="bg-emerald-50/60 p-3.5 rounded-2xl border border-emerald-100 space-y-2.5">
              <div className="text-[10px] font-extrabold uppercase tracking-wider text-emerald-800 font-['Outfit'] border-b border-emerald-100 pb-1">
                2. Zone MDF, Parcours & Situation
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 pt-0.5">
                <div>
                  <span className="text-[10px] text-slate-500 font-bold uppercase block">Zone MDF</span>
                  <span className="inline-block mt-0.5 px-2.5 py-0.5 bg-emerald-100 text-emerald-900 font-extrabold rounded-md text-xs border border-emerald-200">
                    {member.zone || member.region || 'Île-de-France'}
                  </span>
                </div>

                <div>
                  <span className="text-[10px] text-slate-500 font-bold uppercase block">Ville de résidence</span>
                  <span className="font-bold text-slate-900 flex items-center gap-1 mt-0.5">
                    <MapPin className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                    <span>{member.ville || 'Non renseignée'}</span>
                  </span>
                </div>

                <div>
                  <span className="text-[10px] text-slate-500 font-bold uppercase block">Situation Professionnelle</span>
                  <span className="font-bold text-slate-900 flex items-center gap-1 mt-0.5">
                    <Briefcase className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                    <span>{member.situationProfessionnelle || member.fonction || 'Non renseignée'}</span>
                  </span>
                </div>

                <div>
                  <span className="text-[10px] text-slate-500 font-bold uppercase block">Domaine d'étude / Spécialité</span>
                  <span className="font-semibold text-slate-800 flex items-center gap-1 mt-0.5">
                    <GraduationCap className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                    <span>{member.domaineEtude || member.organisation || 'Non renseigné'}</span>
                  </span>
                </div>

                <div>
                  <span className="text-[10px] text-slate-500 font-bold uppercase block">Année d'arrivée en France</span>
                  <span className="font-bold text-emerald-900 flex items-center gap-1 mt-0.5">
                    <Calendar className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                    <span>{member.anneeArriveeFrance || 'Non renseignée'}</span>
                  </span>
                </div>
              </div>
            </div>

            {/* SECTION 3: Champs Personnalisés */}
            {member.champsPersonnalises && member.champsPersonnalises.length > 0 && (
              <div className="bg-emerald-50/60 p-3.5 rounded-2xl border border-emerald-100 space-y-2">
                <div className="text-[10px] font-extrabold uppercase tracking-wider text-emerald-800 font-['Outfit'] border-b border-emerald-100 pb-1 flex items-center gap-1.5">
                  <Sliders className="w-3.5 h-3.5 text-emerald-600" />
                  <span>3. Champs Personnalisés ({member.champsPersonnalises.length})</span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1">
                  {member.champsPersonnalises.map((f) => (
                    <div key={f.id} className="p-2 bg-white rounded-xl border border-emerald-200 shadow-2xs">
                      <span className="text-[10px] text-slate-400 font-bold uppercase block">{f.label || 'Champ'}</span>
                      <span className="font-bold text-slate-900 text-xs">{f.value || '-'}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* SECTION 4: Ville de Résidence & Géolocalisation Cartographique */}
            <div className="bg-emerald-50/60 p-3.5 rounded-2xl border border-emerald-100 space-y-2">
              <div className="text-[10px] font-extrabold uppercase tracking-wider text-emerald-800 font-['Outfit'] border-b border-emerald-100 pb-1 flex items-center gap-1.5">
                <MapPin className="w-3.5 h-3.5 text-emerald-600" />
                <span>4. Ville de Résidence & Géolocalisation</span>
              </div>

              <div className="space-y-1 pt-0.5">
                <p className="font-bold text-slate-900">{member.ville || 'Ville non spécifiée'} {member.departement ? `(${member.departement})` : ''}</p>
              </div>

              <div className="pt-2 border-t border-emerald-100 flex items-center justify-between text-slate-500 text-[11px]">
                <span className="flex items-center gap-1">
                  <Globe className="w-3 h-3 text-emerald-600" /> Pays: {member.pays || 'France'}
                </span>
                {member.latitude && member.longitude ? (
                  <span className="flex items-center gap-1 font-mono text-[10px]">
                    <Compass className="w-3 h-3 text-emerald-600" /> {member.latitude.toFixed(4)}, {member.longitude.toFixed(4)}
                  </span>
                ) : null}
              </div>
            </div>

          </div>

          {/* Admin Bar in Modal */}
          {userRole === 'admin' && (
            <div className="mt-5 pt-4 border-t border-slate-200 flex items-center justify-end gap-2">
              <button
                onClick={() => {
                  onEdit?.(member);
                  onClose();
                }}
                className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 rounded-xl text-xs font-semibold border border-emerald-200 transition-colors"
              >
                <Edit3 className="w-3.5 h-3.5 text-emerald-600" />
                <span>Modifier la fiche</span>
              </button>

              <button
                onClick={() => {
                  onDelete?.(member);
                  onClose();
                }}
                className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-rose-50 hover:bg-rose-100 text-rose-700 rounded-xl text-xs font-semibold border border-rose-200 transition-colors"
              >
                <Trash2 className="w-3.5 h-3.5 text-rose-600" />
                <span>Supprimer</span>
              </button>
            </div>
          )}

        </div>
      </div>
    </div>
  );
};
