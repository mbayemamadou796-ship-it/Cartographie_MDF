import React from 'react';
import { Member, UserRole } from '../../types';
import { MemberCard } from './MemberCard';
import { SearchX, Plus, RotateCcw } from 'lucide-react';

interface MemberListProps {
  members: Member[];
  selectedMemberId: string | null;
  userRole: UserRole;
  onSelectMember: (member: Member) => void;
  onViewDetails: (member: Member) => void;
  onEditMember?: (member: Member) => void;
  onDeleteMember?: (member: Member) => void;
  onResetFilters?: () => void;
  onOpenAddMember?: () => void;
}

export const MemberList: React.FC<MemberListProps> = ({
  members,
  selectedMemberId,
  userRole,
  onSelectMember,
  onViewDetails,
  onEditMember,
  onDeleteMember,
  onResetFilters,
  onOpenAddMember
}) => {
  if (members.length === 0) {
    return (
      <div className="bg-white rounded-3xl border border-emerald-200 p-8 text-center max-w-lg mx-auto my-8 shadow-sm">
        <div className="w-12 h-12 rounded-2xl bg-emerald-100 text-emerald-800 border border-emerald-200 flex items-center justify-center mx-auto mb-3">
          <SearchX className="w-6 h-6 text-emerald-600" />
        </div>
        <h3 className="text-base font-bold text-slate-900 font-['Outfit']">
          Aucun membre trouvé
        </h3>
        <p className="text-xs text-slate-600 mt-1 mb-4 leading-relaxed">
          Aucun membre de l'annuaire Mbok de France ne correspond à vos critères de recherche ou de filtre actuels.
        </p>
        
        <div className="flex items-center justify-center gap-3">
          {onResetFilters && (
            <button
              onClick={onResetFilters}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-800 border border-slate-200 rounded-xl text-xs font-semibold transition-colors"
            >
              <RotateCcw className="w-3.5 h-3.5 text-emerald-600" />
              <span>Réinitialiser les filtres</span>
            </button>
          )}

          {userRole === 'admin' && onOpenAddMember && (
            <button
              onClick={onOpenAddMember}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-gradient-to-r from-[#2be39d] via-[#48c92a] to-[#8de02d] hover:brightness-105 text-emerald-950 rounded-xl text-xs font-bold transition-all shadow-xs"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Ajouter un membre</span>
            </button>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
      {members.map((member) => (
        <MemberCard
          key={member.id}
          member={member}
          isSelected={member.id === selectedMemberId}
          userRole={userRole}
          onSelect={onSelectMember}
          onViewDetails={onViewDetails}
          onEdit={onEditMember}
          onDelete={onDeleteMember}
        />
      ))}
    </div>
  );
};
