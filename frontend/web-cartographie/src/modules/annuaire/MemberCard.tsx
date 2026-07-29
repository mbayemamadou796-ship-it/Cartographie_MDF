import React from 'react';
import { Member, UserRole } from '../../types';
import { MapPin, Phone, Mail, Eye, Edit3, Trash2, Navigation, Briefcase, GraduationCap, Compass } from 'lucide-react';

interface MemberCardProps {
  member: Member;
  isSelected: boolean;
  userRole: UserRole;
  onSelect: (member: Member) => void;
  onViewDetails: (member: Member) => void;
  onEdit?: (member: Member) => void;
  onDelete?: (member: Member) => void;
}

export const MemberCard: React.FC<MemberCardProps> = ({
  member,
  isSelected,
  userRole,
  onSelect,
  onViewDetails,
  onEdit,
  onDelete
}) => {
  const zoneLabel = member.zone || member.region || 'Île-de-France';
  const situation = member.situationProfessionnelle || member.fonction || 'Membre MDF';
  const domaine = member.domaineEtude || member.organisation || 'Mbok de France';

  return (
    <div
      onClick={() => onSelect(member)}
      className={`group relative bg-white rounded-2xl p-4 border transition-all duration-200 cursor-pointer flex flex-col justify-between shadow-xs ${
        isSelected
          ? 'border-emerald-500 ring-2 ring-emerald-400/40 shadow-md bg-emerald-50/40'
          : 'border-emerald-100 hover:border-emerald-400 hover:shadow-md hover:bg-emerald-50/20'
      }`}
    >
      <div>
        {/* Top Header Row with Photo & Details */}
        <div className="flex items-start gap-3.5 mb-3">
          {/* Avatar Photo */}
          {member.photo ? (
            <img
              src={member.photo}
              alt={`${member.prenom} ${member.nom}`}
              className="w-13 h-13 rounded-2xl object-cover border-2 border-emerald-200 group-hover:border-emerald-500 shadow-xs transition-colors shrink-0"
            />
          ) : (
            <div className="w-13 h-13 rounded-2xl bg-gradient-to-tr from-[#2ee6a8] via-[#4cc82d] to-[#88e02d] text-emerald-950 flex items-center justify-center font-extrabold text-base shadow-xs shrink-0 font-['Outfit']">
              {(member.prenom?.[0] || '').toUpperCase()}{(member.nom?.[0] || '').toUpperCase()}
            </div>
          )}

          {/* Identity */}
          <div className="min-w-0 flex-1">
            <div className="flex items-center justify-between gap-1">
              <h3 className="text-sm font-bold text-slate-800 truncate leading-tight group-hover:text-emerald-700 transition-colors">
                {member.prenom} {member.nom}
              </h3>
              <span className="shrink-0 text-[10px] font-extrabold text-emerald-800 bg-emerald-100 px-2 py-0.5 rounded-full border border-emerald-200">
                {zoneLabel}
              </span>
            </div>

            <div className="flex items-center gap-1 text-xs font-semibold text-emerald-900 truncate mt-1">
              <Briefcase className="w-3 h-3 text-emerald-600 shrink-0" />
              <span className="truncate">{situation}</span>
            </div>

            <div className="flex items-center gap-1 text-xs text-slate-500 mt-0.5 truncate">
              <GraduationCap className="w-3 h-3 text-emerald-600 shrink-0" />
              <span className="truncate">{domaine}</span>
            </div>
          </div>
        </div>

        {/* Info Rows */}
        <div className="space-y-1.5 text-xs text-slate-600 bg-emerald-50/60 rounded-xl p-2.5 border border-emerald-100/80">
          <div className="flex items-center gap-2 text-slate-800 font-medium">
            <MapPin className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
            <span className="truncate">{member.ville || member.adresse || 'Ville non spécifiée'} {member.codePostal ? `(${member.codePostal})` : ''}</span>
          </div>

          {member.telephone && (
            <div className="flex items-center gap-2">
              <Phone className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
              <a
                href={`tel:${member.telephone}`}
                onClick={(e) => e.stopPropagation()}
                className="hover:text-emerald-700 hover:underline truncate font-medium text-slate-700"
              >
                {member.telephone}
              </a>
            </div>
          )}

          {member.email && (
            <div className="flex items-center gap-2">
              <Mail className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
              <a
                href={`mailto:${member.email}`}
                onClick={(e) => e.stopPropagation()}
                className="hover:text-emerald-700 hover:underline truncate text-slate-700"
              >
                {member.email}
              </a>
            </div>
          )}

          {member.anneeArriveeFrance && (
            <div className="flex items-center justify-between pt-1 border-t border-emerald-100/60 text-[11px] text-slate-500">
              <span>Arrivée en France :</span>
              <span className="font-bold text-emerald-900">{member.anneeArriveeFrance}</span>
            </div>
          )}

          {member.champsPersonnalises && member.champsPersonnalises.length > 0 && (
            <div className="pt-1 border-t border-emerald-100/60 flex items-center gap-1.5 flex-wrap">
              {member.champsPersonnalises.slice(0, 2).map((f) => (
                <span key={f.id} className="text-[10px] bg-white border border-emerald-200 text-emerald-900 px-1.5 py-0.5 rounded-md font-medium truncate max-w-[140px]">
                  <strong>{f.label}:</strong> {f.value}
                </span>
              ))}
              {member.champsPersonnalises.length > 2 && (
                <span className="text-[10px] text-emerald-700 font-bold">
                  +{member.champsPersonnalises.length - 2}
                </span>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Action Footer */}
      <div className="mt-3 pt-3 border-t border-emerald-100 flex items-center justify-between gap-2">
        <div className="flex items-center gap-1.5">
          <button
            onClick={(e) => {
              e.stopPropagation();
              onViewDetails(member);
            }}
            className="inline-flex items-center gap-1 px-2.5 py-1.5 bg-emerald-100/70 hover:bg-emerald-200/80 text-emerald-900 text-xs font-semibold rounded-lg border border-emerald-200 transition-colors"
          >
            <Eye className="w-3.5 h-3.5" />
            <span>Fiche</span>
          </button>

          <button
            onClick={(e) => {
              e.stopPropagation();
              onSelect(member);
            }}
            className="inline-flex items-center gap-1 px-2 py-1.5 bg-slate-50 hover:bg-slate-100 text-slate-700 text-xs font-medium rounded-lg border border-slate-200 transition-colors"
            title="Centrer la carte sur ce membre"
          >
            <Navigation className="w-3.5 h-3.5 text-emerald-600" />
            <span className="hidden sm:inline">Carte</span>
          </button>
        </div>

        {/* Admin Quick Buttons */}
        {userRole === 'admin' && (
          <div className="flex items-center gap-1">
            <button
              onClick={(e) => {
                e.stopPropagation();
                onEdit?.(member);
              }}
              className="p-1.5 text-slate-400 hover:text-emerald-700 hover:bg-emerald-50 rounded-lg transition-colors"
              title="Modifier"
            >
              <Edit3 className="w-3.5 h-3.5" />
            </button>

            <button
              onClick={(e) => {
                e.stopPropagation();
                onDelete?.(member);
              }}
              className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
              title="Supprimer"
            >
              <Trash2 className="w-3.5 h-3.5" />
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
