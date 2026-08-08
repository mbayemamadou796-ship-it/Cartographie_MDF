import React, { useState } from 'react';
import { DemandeMember, Member, UserRole, CustomZone } from '@shared/types';
import { SITUATION_PROFESSIONNELLE_OPTIONS } from '../membres/AdminMemberFormModal';
import { 
  FileText, CheckCircle2, XCircle, Clock, Search, Filter, 
  UserCheck, MapPin, Briefcase, GraduationCap, Calendar, Phone, Mail, Building,
  AlertCircle, Edit, Check, X, ShieldAlert, ArrowUpRight
} from 'lucide-react';

interface DemandesViewProps {
  demandes: DemandeMember[];
  members: Member[];
  customZones: CustomZone[];
  userRole: UserRole;
  onValiderDemande: (demandeId: string, updatedData?: Partial<DemandeMember>) => void;
  onRefuserDemande: (demandeId: string, reason?: string) => void;
  onDeleteDemande?: (demandeId: string) => void;
}

export const DemandesView: React.FC<DemandesViewProps> = ({
  demandes,
  members,
  customZones,
  userRole,
  onValiderDemande,
  onRefuserDemande,
  onDeleteDemande
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'ALL' | 'EN_ATTENTE' | 'VALIDEE' | 'REFUSEE'>('EN_ATTENTE');
  const [typeFilter, setTypeFilter] = useState<'ALL' | 'INSCRIPTION' | 'MISE_A_JOUR'>('ALL');
  
  // Selected demande for modal review
  const [selectedDemande, setSelectedDemande] = useState<DemandeMember | null>(null);
  const [editForm, setEditForm] = useState<Partial<DemandeMember>>({});
  const [rejectionModalOpen, setRejectionModalOpen] = useState(false);
  const [rejectionReason, setRejectionReason] = useState('');

  const pendingCount = demandes.filter(d => d.status === 'EN_ATTENTE').length;
  const validatedCount = demandes.filter(d => d.status === 'VALIDEE').length;
  const rejectedCount = demandes.filter(d => d.status === 'REFUSEE').length;

  const filteredDemandes = demandes.filter(d => {
    const matchesStatus = statusFilter === 'ALL' || d.status === statusFilter;
    const matchesType = typeFilter === 'ALL' || d.type === typeFilter;
    const q = searchQuery.toLowerCase();
    const matchesSearch = 
      !q || 
      d.nom?.toLowerCase().includes(q) ||
      d.prenom?.toLowerCase().includes(q) ||
      d.email?.toLowerCase().includes(q) ||
      d.ville?.toLowerCase().includes(q) ||
      d.organisation?.toLowerCase().includes(q);
      
    return matchesStatus && matchesType && matchesSearch;
  });

  const handleOpenReview = (demande: DemandeMember) => {
    setSelectedDemande(demande);
    setEditForm({ ...demande });
    setRejectionReason('');
    setRejectionModalOpen(false);
  };

  const handleConfirmValidation = () => {
    if (!selectedDemande) return;
    onValiderDemande(selectedDemande.id, editForm);
    setSelectedDemande(null);
  };

  const handleConfirmRejection = () => {
    if (!selectedDemande) return;
    onRefuserDemande(selectedDemande.id, rejectionReason || 'Information incomplète ou non conforme.');
    setSelectedDemande(null);
    setRejectionModalOpen(false);
  };

  return (
    <div className="space-[#111] pb-12 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-emerald-900 via-teal-900 to-slate-900 text-white rounded-2xl p-6 shadow-xl mb-6 border border-emerald-800/40 relative overflow-hidden">
        <div className="absolute right-0 top-0 bottom-0 w-1/3 bg-radial from-emerald-500/10 to-transparent pointer-events-none" />
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 text-emerald-400 text-xs font-bold uppercase tracking-wider mb-1">
              <FileText className="w-4 h-4" />
              <span>Modération & Inscriptions</span>
            </div>
            <h1 className="text-2xl font-black font-['Outfit']">Demandes d'inscription & Mises à jour</h1>
            <p className="text-emerald-100/80 text-sm mt-1 max-w-2xl">
              Examinez, validez et intégrez les nouvelles demandes d'inscription ou demandes de modification soumises par les membres via le formulaire externe.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2 self-start md:self-auto">
            <span className="bg-emerald-400/20 text-emerald-300 border border-emerald-400/30 px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-2 shadow-xs">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
              <span>Synchro en direct active</span>
            </span>
            <span className="bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-2">
              <Clock className="w-4 h-4 text-emerald-400" />
              {pendingCount} demande{pendingCount > 1 ? 's' : ''} en attente
            </span>
          </div>
        </div>
      </div>

      {/* Live Sync Information Banner */}
      <div className="bg-emerald-500/10 border border-emerald-500/30 rounded-2xl p-4 mb-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs text-emerald-950 font-medium shadow-xs">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-emerald-600 text-white rounded-xl shrink-0 shadow-xs">
            <CheckCircle2 className="w-5 h-5" />
          </div>
          <div>
            <p className="font-bold text-sm text-emerald-900">Synchronisation automatique avec le Formulaire Public</p>
            <p className="text-emerald-800/80">Toute inscription ou mise à jour renseignée sur l'application Formulaire est immédiatement transmise en temps réel ici dans la liste des attentes.</p>
          </div>
        </div>
      </div>

      {/* KPI Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 mb-6">
        <button
          onClick={() => setStatusFilter('ALL')}
          className={`p-4 rounded-xl border text-left transition-all ${
            statusFilter === 'ALL'
              ? 'bg-slate-900 text-white border-slate-700 shadow-md ring-2 ring-emerald-500/20'
              : 'bg-white text-slate-800 border-slate-200 hover:border-slate-300'
          }`}
        >
          <div className="text-xs font-bold uppercase text-slate-400 mb-1">Toutes les demandes</div>
          <div className="text-2xl font-black">{demandes.length}</div>
        </button>

        <button
          onClick={() => setStatusFilter('EN_ATTENTE')}
          className={`p-4 rounded-xl border text-left transition-all ${
            statusFilter === 'EN_ATTENTE'
              ? 'bg-amber-500/10 border-amber-500/40 text-amber-950 ring-2 ring-amber-500/30 shadow-md'
              : 'bg-white text-slate-800 border-slate-200 hover:border-amber-200'
          }`}
        >
          <div className="text-xs font-bold uppercase text-amber-700 mb-1 flex items-center justify-between">
            <span>En attente</span>
            <Clock className="w-4 h-4 text-amber-500" />
          </div>
          <div className="text-2xl font-black text-amber-600">{pendingCount}</div>
        </button>

        <button
          onClick={() => setStatusFilter('VALIDEE')}
          className={`p-4 rounded-xl border text-left transition-all ${
            statusFilter === 'VALIDEE'
              ? 'bg-emerald-50 border-emerald-300 text-emerald-950 ring-2 ring-emerald-500/20 shadow-md'
              : 'bg-white text-slate-800 border-slate-200 hover:border-emerald-200'
          }`}
        >
          <div className="text-xs font-bold uppercase text-emerald-700 mb-1 flex items-center justify-between">
            <span>Validées</span>
            <CheckCircle2 className="w-4 h-4 text-emerald-500" />
          </div>
          <div className="text-2xl font-black text-emerald-600">{validatedCount}</div>
        </button>

        <button
          onClick={() => setStatusFilter('REFUSEE')}
          className={`p-4 rounded-xl border text-left transition-all ${
            statusFilter === 'REFUSEE'
              ? 'bg-rose-50 border-rose-300 text-rose-950 ring-2 ring-rose-500/20 shadow-md'
              : 'bg-white text-slate-800 border-slate-200 hover:border-rose-200'
          }`}
        >
          <div className="text-xs font-bold uppercase text-rose-700 mb-1 flex items-center justify-between">
            <span>Refusées</span>
            <XCircle className="w-4 h-4 text-rose-500" />
          </div>
          <div className="text-2xl font-black text-rose-600">{rejectedCount}</div>
        </button>
      </div>

      {/* Filters Bar */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs mb-6 flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="relative w-full md:w-96">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Rechercher par nom, ville, email, organisation..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium focus:outline-none focus:ring-2 focus:ring-emerald-500"
          />
        </div>

        <div className="flex items-center gap-2 w-full md:w-auto overflow-x-auto pb-1 md:pb-0">
          <span className="text-xs font-bold text-slate-500 flex items-center gap-1 shrink-0">
            <Filter className="w-3.5 h-3.5" /> Type :
          </span>
          <button
            onClick={() => setTypeFilter('ALL')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold shrink-0 transition-all ${
              typeFilter === 'ALL'
                ? 'bg-emerald-800 text-white'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            Tous les types
          </button>
          <button
            onClick={() => setTypeFilter('INSCRIPTION')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold shrink-0 transition-all ${
              typeFilter === 'INSCRIPTION'
                ? 'bg-emerald-600 text-white'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            Inscriptions
          </button>
          <button
            onClick={() => setTypeFilter('MISE_A_JOUR')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold shrink-0 transition-all ${
              typeFilter === 'MISE_A_JOUR'
                ? 'bg-blue-600 text-white'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            Mises à jour
          </button>
        </div>
      </div>

      {/* Demandes List */}
      {filteredDemandes.length === 0 ? (
        <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center shadow-xs">
          <FileText className="w-12 h-12 text-slate-300 mx-auto mb-3" />
          <h3 className="text-lg font-bold text-slate-800">Aucune demande trouvée</h3>
          <p className="text-xs text-slate-500 mt-1 max-w-md mx-auto">
            {searchQuery
              ? "Aucun résultat ne correspond à votre recherche actuelle."
              : "Aucune demande d'inscription ou de mise à jour n'est enregistrée pour ce filtre."}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4">
          {filteredDemandes.map((demande) => {
            const isPending = demande.status === 'EN_ATTENTE';
            const isValidated = demande.status === 'VALIDEE';
            const isRejected = demande.status === 'REFUSEE';
            const isUpdate = demande.type === 'MISE_A_JOUR';

            return (
              <div
                key={demande.id}
                className={`bg-white rounded-2xl border transition-all duration-200 hover:shadow-md p-5 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 ${
                  isPending
                    ? 'border-amber-300 bg-amber-50/20'
                    : isValidated
                    ? 'border-emerald-200'
                    : 'border-slate-200 opacity-80'
                }`}
              >
                <div className="flex items-start gap-4 flex-1">
                  {/* Avatar / Icon */}
                  <div className="relative shrink-0">
                    <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-700 text-white font-black text-lg flex items-center justify-center shadow-xs">
                      {demande.prenom?.[0] || 'M'}{demande.nom?.[0] || 'D'}
                    </div>
                    {isUpdate ? (
                      <span className="absolute -bottom-1 -right-1 bg-blue-600 text-white p-1 rounded-full text-[9px] shadow-xs" title="Mise à jour">
                        <Edit className="w-3 h-3" />
                      </span>
                    ) : (
                      <span className="absolute -bottom-1 -right-1 bg-emerald-600 text-white p-1 rounded-full text-[9px] shadow-xs" title="Nouvelle Inscription">
                        <UserCheck className="w-3 h-3" />
                      </span>
                    )}
                  </div>

                  {/* Details */}
                  <div className="space-y-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <h3 className="font-bold text-slate-900 text-base">
                        {demande.prenom} {demande.nom}
                      </h3>
                      
                      {/* Type Badge */}
                      <span
                        className={`text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-md ${
                          isUpdate
                            ? 'bg-blue-100 text-blue-800 border border-blue-200'
                            : 'bg-emerald-100 text-emerald-800 border border-emerald-200'
                        }`}
                      >
                        {isUpdate ? 'Mise à jour' : 'Inscription'}
                      </span>

                      {/* Status Badge */}
                      <span
                        className={`text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-md flex items-center gap-1 ${
                          isPending
                            ? 'bg-amber-100 text-amber-800 border border-amber-300'
                            : isValidated
                            ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                            : 'bg-rose-100 text-rose-800 border border-rose-300'
                        }`}
                      >
                        {isPending && <Clock className="w-3 h-3 text-amber-600" />}
                        {isValidated && <CheckCircle2 className="w-3 h-3 text-emerald-600" />}
                        {isRejected && <XCircle className="w-3 h-3 text-rose-600" />}
                        {isPending ? 'En attente' : isValidated ? 'Validée' : 'Refusée'}
                      </span>
                    </div>

                    <div className="flex items-center gap-4 text-xs text-slate-600 flex-wrap pt-0.5">
                      <span className="flex items-center gap-1 font-medium">
                        <MapPin className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                        {demande.ville}{demande.departement ? ` (${demande.departement})` : ''}
                      </span>
                      {demande.telephone && (
                        <span className="flex items-center gap-1 font-medium">
                          <Phone className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                          {demande.telephone}
                        </span>
                      )}
                      <span className="flex items-center gap-1 font-medium">
                        <Mail className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                        {demande.email}
                      </span>
                    </div>

                    <div className="flex items-center gap-4 text-xs text-slate-500 flex-wrap">
                      {demande.situationProfessionnelle && (
                        <span className="flex items-center gap-1">
                          <Briefcase className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                          {demande.situationProfessionnelle}
                        </span>
                      )}
                      {demande.organisation && (
                        <span className="flex items-center gap-1">
                          <Building className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                          {demande.organisation} {demande.fonction ? `(${demande.fonction})` : ''}
                        </span>
                      )}
                      <span className="text-[11px] text-slate-400">
                        Soumis le : {new Date(demande.createdAt).toLocaleDateString('fr-FR', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>

                    {isRejected && demande.rejectionReason && (
                      <p className="text-xs text-rose-700 bg-rose-50 p-2 rounded-lg border border-rose-200 mt-1">
                        <strong>Motif du refus :</strong> {demande.rejectionReason}
                      </p>
                    )}
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex items-center gap-2 self-end md:self-center shrink-0">
                  <button
                    onClick={() => handleOpenReview(demande)}
                    className="px-4 py-2 bg-slate-900 text-white rounded-xl text-xs font-bold hover:bg-slate-800 transition-all flex items-center gap-1.5 shadow-xs"
                  >
                    <Edit className="w-3.5 h-3.5" />
                    Examiner & Traiter
                  </button>

                  {userRole === 'admin' && onDeleteDemande && (
                    <button
                      onClick={() => onDeleteDemande(demande.id)}
                      title="Supprimer la demande de la liste"
                      className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition-all"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Review & Validate Modal */}
      {selectedDemande && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl max-w-2xl w-full p-6 shadow-2xl border border-slate-200 relative my-8">
            <button
              onClick={() => setSelectedDemande(null)}
              className="absolute right-4 top-4 text-slate-400 hover:text-slate-600 p-1 rounded-lg"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-3 mb-4 border-b border-slate-100 pb-3">
              <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-800 font-bold flex items-center justify-center">
                <FileText className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-slate-900">
                  Examen de la demande : {selectedDemande.prenom} {selectedDemande.nom}
                </h3>
                <p className="text-xs text-slate-500">
                  Vérifiez ou corrigez les informations saisies avant de valider l'intégration automatique.
                </p>
              </div>
            </div>

            {/* Editable Fields Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs mb-6">
              <div>
                <label className="block text-[11px] font-bold text-slate-600 mb-1">Prénom</label>
                <input
                  type="text"
                  value={editForm.prenom || ''}
                  onChange={(e) => setEditForm({ ...editForm, prenom: e.target.value })}
                  className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg text-xs font-semibold"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-600 mb-1">Nom</label>
                <input
                  type="text"
                  value={editForm.nom || ''}
                  onChange={(e) => setEditForm({ ...editForm, nom: e.target.value })}
                  className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg text-xs font-semibold"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-600 mb-1">Email</label>
                <input
                  type="email"
                  value={editForm.email || ''}
                  onChange={(e) => setEditForm({ ...editForm, email: e.target.value })}
                  className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg text-xs font-semibold"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-600 mb-1">Téléphone</label>
                <input
                  type="text"
                  value={editForm.telephone || ''}
                  onChange={(e) => setEditForm({ ...editForm, telephone: e.target.value })}
                  className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg text-xs font-semibold"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-600 mb-1">Ville de résidence</label>
                <input
                  type="text"
                  value={editForm.ville || ''}
                  onChange={(e) => setEditForm({ ...editForm, ville: e.target.value })}
                  className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg text-xs font-semibold"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-600 mb-1">Département (optionnel)</label>
                <input
                  type="text"
                  value={editForm.departement || ''}
                  onChange={(e) => setEditForm({ ...editForm, departement: e.target.value })}
                  className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg text-xs font-semibold"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-600 mb-1">Situation Professionnelle</label>
                <select
                  value={editForm.situationProfessionnelle || ''}
                  onChange={(e) => setEditForm({ ...editForm, situationProfessionnelle: e.target.value })}
                  className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg text-xs font-semibold cursor-pointer"
                >
                  <option value="" disabled>-- Sélectionner une situation --</option>
                  {SITUATION_PROFESSIONNELLE_OPTIONS.map((opt) => (
                    <option key={opt} value={opt}>{opt}</option>
                  ))}
                  {editForm.situationProfessionnelle && !SITUATION_PROFESSIONNELLE_OPTIONS.includes(editForm.situationProfessionnelle) && (
                    <option value={editForm.situationProfessionnelle}>{editForm.situationProfessionnelle}</option>
                  )}
                </select>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-600 mb-1">Domaine d'étude / Spécialité</label>
                <input
                  type="text"
                  value={editForm.domaineEtude || ''}
                  onChange={(e) => setEditForm({ ...editForm, domaineEtude: e.target.value })}
                  className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg text-xs font-semibold"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-600 mb-1">Organisation / Entreprise</label>
                <input
                  type="text"
                  value={editForm.organisation || ''}
                  onChange={(e) => setEditForm({ ...editForm, organisation: e.target.value })}
                  className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg text-xs font-semibold"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-600 mb-1">Fonction</label>
                <input
                  type="text"
                  value={editForm.fonction || ''}
                  onChange={(e) => setEditForm({ ...editForm, fonction: e.target.value })}
                  className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg text-xs font-semibold"
                />
              </div>
            </div>

            {/* Automatic Processing Information Box */}
            <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-3 text-xs text-emerald-900 mb-6 flex items-start gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
              <div>
                <strong>Traitement automatique lors de la validation :</strong>
                <ul className="list-disc list-inside mt-1 text-[11px] text-emerald-800 space-y-0.5">
                  <li>Géocodage automatique des coordonnées GPS de la ville ({editForm.ville || 'Saisie'}).</li>
                  <li>Calcul du décalage aléatoire stable pour le marqueur cartographique.</li>
                  <li>Affectation automatique à la Zone géographique MDF correspondante.</li>
                  <li>Intégration immédiate dans l'Annuaire, la Cartographie et les recherches.</li>
                </ul>
              </div>
            </div>

            {/* Modal Actions */}
            {rejectionModalOpen ? (
              <div className="bg-rose-50 border border-rose-200 rounded-xl p-4 text-xs space-y-3">
                <div className="flex items-center gap-2 text-rose-800 font-bold">
                  <ShieldAlert className="w-4 h-4 text-rose-600" />
                  <span>Confirmer le refus de cette demande</span>
                </div>
                <textarea
                  rows={2}
                  placeholder="Motif du refus (optionnel, ex: informations incorrectes...)"
                  value={rejectionReason}
                  onChange={(e) => setRejectionReason(e.target.value)}
                  className="w-full p-2 bg-white border border-rose-300 rounded-lg text-xs focus:outline-none"
                />
                <div className="flex items-center justify-end gap-2">
                  <button
                    onClick={() => setRejectionModalOpen(false)}
                    className="px-3 py-1.5 bg-slate-200 text-slate-700 rounded-lg font-bold text-xs"
                  >
                    Annuler
                  </button>
                  <button
                    onClick={handleConfirmRejection}
                    className="px-3 py-1.5 bg-rose-600 text-white rounded-lg font-bold text-xs hover:bg-rose-700"
                  >
                    Confirmer le Refus
                  </button>
                </div>
              </div>
            ) : (
              <div className="flex items-center justify-between gap-3 pt-2 border-t border-slate-100">
                <button
                  onClick={() => setRejectionModalOpen(true)}
                  className="px-4 py-2 bg-rose-50 text-rose-700 hover:bg-rose-100 border border-rose-200 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5"
                >
                  <XCircle className="w-4 h-4 text-rose-600" />
                  Refuser la demande
                </button>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setSelectedDemande(null)}
                    className="px-4 py-2 bg-slate-100 text-slate-700 rounded-xl text-xs font-bold hover:bg-slate-200"
                  >
                    Fermer
                  </button>
                  <button
                    onClick={handleConfirmValidation}
                    className="px-5 py-2 bg-gradient-to-r from-emerald-600 to-teal-600 text-white rounded-xl text-xs font-bold hover:from-emerald-700 hover:to-teal-700 transition-all shadow-md flex items-center gap-1.5"
                  >
                    <CheckCircle2 className="w-4 h-4" />
                    Valider & Intégrer au membre
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
