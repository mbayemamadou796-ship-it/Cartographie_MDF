import React from 'react';
import { Member, CustomZone, UserRole } from '../types';
import { X, MapPin, Phone, Mail, Building, Briefcase, Navigation, Edit3, Trash2, Globe, Compass, Layers } from 'lucide-react';

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
      <div className="bg-white rounded-3xl shadow-2xl border border-emerald-200 w-full max-w-lg overflow-hidden animate-in zoom-in-95 duration-200 text-slate-800">
        
        {/* Banner Header */}
        <div className="relative bg-gradient-to-r from-[#2be39d] via-[#48c92a] to-[#8de02d] px-6 pt-6 pb-12 text-emerald-950 shadow-inner">
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
            {member.fonction} — "au service de la fraternité !"
          </p>
        </div>

        {/* Floating Photo & Quick Info Body */}
        <div className="px-6 pb-6 relative">
          
          {/* Avatar Photo */}
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

          {/* Detailed Info Sections */}
          <div className="space-y-4 text-xs">
            
            {/* Organisation & Function */}
            <div className="bg-emerald-50/60 p-3.5 rounded-2xl border border-emerald-100 space-y-2">
              <div className="flex items-center gap-2.5 text-slate-800">
                <Building className="w-4 h-4 text-emerald-600 shrink-0" />
                <div>
                  <span className="text-[10px] text-slate-500 font-bold uppercase block">Organisation</span>
                  <span className="font-bold text-sm text-slate-900">{member.organisation}</span>
                </div>
              </div>

              <div className="flex items-center gap-2.5 text-slate-800 pt-2 border-t border-emerald-100">
                <Briefcase className="w-4 h-4 text-emerald-600 shrink-0" />
                <div>
                  <span className="text-[10px] text-slate-500 font-bold uppercase block">Fonction</span>
                  <span className="font-semibold text-slate-800">{member.fonction}</span>
                </div>
              </div>
            </div>

            {/* Address & Geographic Hierarchy */}
            <div className="bg-emerald-50/60 p-3.5 rounded-2xl border border-emerald-100 space-y-2">
              <div className="flex items-start gap-2.5 text-slate-800">
                <MapPin className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                <div>
                  <span className="text-[10px] text-slate-500 font-bold uppercase block">Adresse</span>
                  <p className="font-semibold text-slate-900">{member.adresse || 'Adresse non spécifiée'}</p>
                  <p className="text-slate-600">{member.codePostal} {member.ville}</p>
                </div>
              </div>

              <div className="pt-2 border-t border-emerald-100 grid grid-cols-2 gap-2 text-slate-700">
                <div>
                  <span className="text-[10px] text-slate-500 font-bold uppercase block">Département</span>
                  <span className="font-medium text-slate-800">{member.departement || '-'}</span>
                </div>
                <div>
                  <span className="text-[10px] text-slate-500 font-bold uppercase block">Région</span>
                  <span className="font-medium text-slate-800">{member.region || '-'}</span>
                </div>
              </div>

              <div className="pt-2 border-t border-emerald-100 flex items-center justify-between text-slate-500 text-[11px]">
                <span className="flex items-center gap-1">
                  <Globe className="w-3 h-3 text-emerald-600" /> Pays: {member.pays || 'France'}
                </span>
                <span className="flex items-center gap-1 font-mono text-[10px]">
                  <Compass className="w-3 h-3 text-emerald-600" /> {member.latitude.toFixed(4)}, {member.longitude.toFixed(4)}
                </span>
              </div>
            </div>

            {/* Assigned Custom Zones */}
            <div className="bg-emerald-50/60 p-3.5 rounded-2xl border border-emerald-100 space-y-2">
              <div className="flex items-center gap-2">
                <Layers className="w-4 h-4 text-emerald-600 shrink-0" />
                <span className="text-[10px] text-slate-500 font-bold uppercase">Zones d'appartenance ({assignedZones.length})</span>
              </div>

              {assignedZones.length === 0 ? (
                <p className="text-slate-400 italic text-[11px]">Rattaché à aucune zone personnalisée pour le moment.</p>
              ) : (
                <div className="flex flex-wrap gap-1.5 pt-1">
                  {assignedZones.map((z) => (
                    <span
                      key={z.id}
                      className="px-2.5 py-1 bg-white border border-emerald-200 text-emerald-950 rounded-xl font-bold text-[11px] shadow-2xs"
                    >
                      {z.name}
                    </span>
                  ))}
                </div>
              )}
            </div>

            {/* Contact Actions */}
            <div className="grid grid-cols-2 gap-2">
              {member.telephone ? (
                <a
                  href={`tel:${member.telephone}`}
                  className="flex items-center justify-center gap-2 p-2.5 bg-white hover:bg-emerald-50 text-slate-800 border border-emerald-200 rounded-xl font-bold transition-colors shadow-2xs"
                >
                  <Phone className="w-3.5 h-3.5 text-emerald-600" />
                  <span>Appeler ({member.telephone})</span>
                </a>
              ) : (
                <div className="p-2.5 bg-slate-50 text-slate-400 rounded-xl border border-slate-200 text-center font-medium">
                  Sans téléphone
                </div>
              )}

              {member.email ? (
                <a
                  href={`mailto:${member.email}`}
                  className="flex items-center justify-center gap-2 p-2.5 bg-white hover:bg-emerald-50 text-slate-800 border border-emerald-200 rounded-xl font-bold transition-colors shadow-2xs truncate"
                >
                  <Mail className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                  <span className="truncate">Email</span>
                </a>
              ) : (
                <div className="p-2.5 bg-slate-50 text-slate-400 rounded-xl border border-slate-200 text-center font-medium">
                  Sans email
                </div>
              )}
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
                <span>Modifier</span>
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
