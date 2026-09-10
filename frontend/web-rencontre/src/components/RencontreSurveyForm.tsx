import React, { useState, useEffect, useMemo } from 'react';
import { 
  Rencontre, 
  RencontreResponse, 
  RencontreParticipation, 
  RencontreDureePresence, 
  Member 
} from '@shared/types';
import { RencontreService } from '../../../web-cartographie/src/services/rencontreService';
import { INITIAL_MEMBERS } from '../../../web-cartographie/src/data/initialMembers';
import { FRENCH_ZONES } from '../../../web-cartographie/src/modules/membres/AdminMemberFormModal';
import { 
  UserCheck, 
  CheckCircle2, 
  HelpCircle, 
  XCircle, 
  Search, 
  Calendar, 
  MapPin, 
  HeartHandshake, 
  Send, 
  ArrowLeft, 
  Check, 
  AlertCircle,
  Truck,
  Utensils,
  Megaphone,
  Wrench,
  PackageCheck,
  UserPlus
} from 'lucide-react';

interface RencontreSurveyFormProps {
  rencontre: Rencontre;
  existingResponseToEdit?: RencontreResponse | null;
  onSuccess: (response: RencontreResponse) => void;
  onCancel: () => void;
  onDuplicateFound: (existing: RencontreResponse) => void;
}

export const RencontreSurveyForm: React.FC<RencontreSurveyFormProps> = ({
  rencontre,
  existingResponseToEdit,
  onSuccess,
  onCancel,
  onDuplicateFound
}) => {
  // Members list from localStorage or fallback to initial members
  const [membersList, setMembersList] = useState<Member[]>(() => {
    try {
      const saved = localStorage.getItem('mbok_de_france_members_v1');
      if (saved) return JSON.parse(saved);
    } catch {}
    return INITIAL_MEMBERS;
  });

  // Search query for member autocomplete
  const [memberSearch, setMemberSearch] = useState('');
  const [showMemberDropdown, setShowMemberDropdown] = useState(false);
  const [isNewMemberMode, setIsNewMemberMode] = useState(false);

  // Form state
  const [selectedMemberId, setSelectedMemberId] = useState<string | undefined>(
    existingResponseToEdit?.memberId || undefined
  );
  const [nom, setNom] = useState(existingResponseToEdit?.nom || '');
  const [prenom, setPrenom] = useState(existingResponseToEdit?.prenom || '');
  const [email, setEmail] = useState(existingResponseToEdit?.email || '');
  const [telephone, setTelephone] = useState(existingResponseToEdit?.telephone || '');
  const [zone, setZone] = useState(existingResponseToEdit?.zone || 'Île-de-France');
  const [ville, setVille] = useState(existingResponseToEdit?.ville || '');
  const [referentName, setReferentName] = useState(existingResponseToEdit?.referentName || '');

  // Survey Questions State
  const [participation, setParticipation] = useState<RencontreParticipation>(
    existingResponseToEdit?.participation || 'OUI'
  );
  const [dureePresence, setDureePresence] = useState<RencontreDureePresence>(
    existingResponseToEdit?.dureePresence || 'TROIS_JOURS'
  );
  const [aideOrganisation, setAideOrganisation] = useState<boolean>(
    existingResponseToEdit ? existingResponseToEdit.aideOrganisation : false
  );
  const [domainesAide, setDomainesAide] = useState<string[]>(
    existingResponseToEdit?.domainesAide || []
  );
  const [autrePrecision, setAutrePrecision] = useState(
    existingResponseToEdit?.autrePrecision || ''
  );
  const [remarques, setRemarques] = useState(
    existingResponseToEdit?.remarques || ''
  );

  // Error feedback
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Filtered members for autocomplete
  const filteredMembers = useMemo(() => {
    if (!memberSearch.trim()) return [];
    const q = memberSearch.toLowerCase();
    return membersList.filter(m => 
      `${m.prenom} ${m.nom}`.toLowerCase().includes(q) ||
      m.email.toLowerCase().includes(q) ||
      m.telephone.includes(q) ||
      (m.ville && m.ville.toLowerCase().includes(q))
    ).slice(0, 6);
  }, [memberSearch, membersList]);

  // Handle member selection
  const handleSelectMember = (member: Member) => {
    setSelectedMemberId(member.id);
    setNom(member.nom);
    setPrenom(member.prenom);
    setEmail(member.email || '');
    setTelephone(member.telephone || '');
    setZone(member.zone || member.region || 'Île-de-France');
    setVille(member.ville || '');
    setMemberSearch(`${member.prenom} ${member.nom}`);
    setShowMemberDropdown(false);
    setIsNewMemberMode(false);

    // Check duplicate immediately if not in edit mode
    if (!existingResponseToEdit) {
      const duplicate = RencontreService.checkExistingResponse(rencontre.id, member.id, member.email, member.telephone);
      if (duplicate) {
        onDuplicateFound(duplicate);
      }
    }
  };

  const handleToggleDomaine = (domaine: string) => {
    if (domainesAide.includes(domaine)) {
      setDomainesAide(domainesAide.filter(d => d !== domaine));
    } else {
      setDomainesAide([...domainesAide, domaine]);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    // Validations
    if (!nom.trim() || !prenom.trim()) {
      setErrorMessage('Veuillez indiquer votre nom et prénom.');
      return;
    }

    if (!email.trim() && !telephone.trim()) {
      setErrorMessage('Veuillez renseigner au moins une adresse email ou un numéro de téléphone.');
      return;
    }

    if (aideOrganisation && domainesAide.length === 0 && !autrePrecision.trim()) {
      setErrorMessage("Veuillez sélectionner au moins un domaine d'aide ou préciser dans le champ Autre.");
      return;
    }

    setIsSubmitting(true);

    try {
      const responsePayload = {
        id: existingResponseToEdit?.id,
        rencontreId: rencontre.id,
        memberId: selectedMemberId,
        nom: nom.trim(),
        prenom: prenom.trim(),
        email: email.trim(),
        telephone: telephone.trim(),
        zone: zone || 'Île-de-France',
        ville: ville.trim(),
        referentName: referentName || (zone === 'Bretagne' ? 'Modou Mbaye' : zone === 'Île-de-France' ? 'Aïssatou Diallo' : 'Bureau MDF'),
        participation,
        dureePresence: participation === 'OUI' ? dureePresence : undefined,
        aideOrganisation,
        domainesAide: aideOrganisation ? domainesAide : [],
        autrePrecision: aideOrganisation && domainesAide.includes('Autre') ? autrePrecision.trim() : undefined,
        remarques: remarques.trim()
      };

      const result = RencontreService.submitResponse(responsePayload);

      if (!result.success) {
        if (result.isDuplicate && result.response) {
          onDuplicateFound(result.response);
        } else {
          setErrorMessage(result.error || "Une erreur est survenue lors de l'enregistrement.");
        }
        setIsSubmitting(false);
        return;
      }

      if (result.response) {
        onSuccess(result.response);
      }
    } catch (err: any) {
      setErrorMessage(err.message || 'Erreur inattendue.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const domainOptions = [
    { id: 'Logistique', label: 'Logistique', icon: PackageCheck, desc: 'Matériel, gestion des flux, approvisionnement' },
    { id: 'Transport', label: 'Transport & Covoiturage', icon: Truck, desc: 'Coordination covoiturages, navettes gares/aéroports' },
    { id: 'Installation / rangement', label: 'Installation / rangement', icon: Wrench, desc: 'Aménagement de la salle, sono, rangement final' },
    { id: 'Cuisine / repas', label: 'Cuisine / repas', icon: Utensils, desc: 'Préparation, service des repas et collations' },
    { id: 'Accueil', label: 'Accueil & Émargement', icon: UserCheck, desc: 'Distribution des badges, orientation des participants' },
    { id: 'Communication', label: 'Communication & Médias', icon: Megaphone, desc: 'Photos, vidéos, annonces et couverture de l’événement' },
    { id: 'Autre', label: 'Autre domaine', icon: HeartHandshake, desc: 'Précisez votre compétence spécifique' }
  ];

  return (
    <div className="max-w-2xl mx-auto bg-white rounded-3xl p-6 sm:p-8 border border-emerald-100 shadow-sm animate-in fade-in duration-200">
      
      {/* Header Form */}
      <div className="flex items-center justify-between gap-4 pb-5 mb-6 border-b border-emerald-100">
        <div>
          <button
            type="button"
            onClick={onCancel}
            className="text-xs font-bold text-slate-500 hover:text-slate-800 flex items-center gap-1.5 mb-1 cursor-pointer"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Retour à la présentation</span>
          </button>
          <h2 className="text-xl sm:text-2xl font-black text-slate-900 font-['Outfit',sans-serif]">
            {existingResponseToEdit ? 'Modifier ma réponse' : 'Sondage de participation'}
          </h2>
          <p className="text-xs text-emerald-800 font-semibold">
            {rencontre.nom} ({rencontre.lieu} — {rencontre.dateAffichage})
          </p>
        </div>

        <div className="w-10 h-10 rounded-2xl bg-emerald-50 text-emerald-700 flex items-center justify-center font-black shrink-0">
          ✍️
        </div>
      </div>

      {/* Error Message */}
      {errorMessage && (
        <div className="bg-rose-50 border border-rose-200 text-rose-800 p-4 rounded-2xl text-xs mb-6 flex items-start gap-2.5">
          <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
          <div>{errorMessage}</div>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-8">
        
        {/* SECTION 1: IDENTIFICATION DU MEMBRE */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-extrabold text-slate-900 uppercase tracking-wider flex items-center gap-2">
              <span className="w-5 h-5 rounded-full bg-emerald-100 text-emerald-800 flex items-center justify-center text-xs font-bold">1</span>
              <span>Identification du membre</span>
            </h3>
            {selectedMemberId && (
              <span className="text-[11px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                ✓ Profil rattaché à l’annuaire MDF
              </span>
            )}
          </div>

          {/* Autocomplete Member Search */}
          {!existingResponseToEdit && (
            <div className="relative">
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Rechercher votre profil dans l'annuaire MDF :
              </label>
              <div className="relative">
                <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={memberSearch}
                  onChange={(e) => {
                    setMemberSearch(e.target.value);
                    setShowMemberDropdown(true);
                  }}
                  onFocus={() => setShowMemberDropdown(true)}
                  placeholder="Tapez votre prénom ou nom (ex: Modou, Diallo...)"
                  className="w-full pl-10 pr-4 py-2.5 bg-slate-50 hover:bg-white focus:bg-white rounded-2xl border border-slate-200 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 text-xs font-medium text-slate-900 transition outline-none"
                />
              </div>

              {/* Suggestions Dropdown */}
              {showMemberDropdown && filteredMembers.length > 0 && (
                <div className="absolute z-20 top-full left-0 right-0 mt-1 bg-white rounded-2xl shadow-xl border border-emerald-100 overflow-hidden text-xs">
                  <div className="p-2 bg-emerald-50/70 border-b border-emerald-100 text-[10px] font-bold text-emerald-900 uppercase tracking-wider">
                    Membres trouvés dans l'annuaire MDF (cliquez pour sélectionner) :
                  </div>
                  <div className="max-h-48 overflow-y-auto divide-y divide-slate-100">
                    {filteredMembers.map((m) => (
                      <button
                        key={m.id}
                        type="button"
                        onClick={() => handleSelectMember(m)}
                        className="w-full text-left p-3 hover:bg-emerald-50/80 transition flex items-center justify-between cursor-pointer"
                      >
                        <div>
                          <span className="font-extrabold text-slate-900 block">
                            {m.prenom} {m.nom}
                          </span>
                          <span className="text-[11px] text-slate-500">
                            {m.zone || m.region || 'Zone non renseignée'} {m.ville ? `• ${m.ville}` : ''}
                          </span>
                        </div>
                        <span className="text-[11px] font-bold text-emerald-700">Sélectionner</span>
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Member Details Inputs */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Prénom *</label>
              <input
                type="text"
                required
                value={prenom}
                onChange={(e) => setPrenom(e.target.value)}
                placeholder="Ex: Aïssatou"
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 text-xs font-medium outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Nom *</label>
              <input
                type="text"
                required
                value={nom}
                onChange={(e) => setNom(e.target.value)}
                placeholder="Ex: Diallo"
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 text-xs font-medium outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Email *</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Ex: membre@mbokdefrance.org"
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 text-xs font-medium outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Téléphone *</label>
              <input
                type="tel"
                value={telephone}
                onChange={(e) => setTelephone(e.target.value)}
                placeholder="Ex: 06 12 34 56 78"
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 text-xs font-medium outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Zone géographique *</label>
              <select
                value={zone}
                onChange={(e) => setZone(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 text-xs font-bold bg-white outline-none"
              >
                {FRENCH_ZONES.map((z) => (
                  <option key={z} value={z}>{z}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Ville de résidence</label>
              <input
                type="text"
                value={ville}
                onChange={(e) => setVille(e.target.value)}
                placeholder="Ex: Paris, Rennes, Toulouse..."
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 text-xs font-medium outline-none"
              />
            </div>
          </div>
        </div>

        {/* SECTION 2: QUESTION PRINCIPALE */}
        <div className="space-y-4 pt-4 border-t border-slate-100">
          <h3 className="text-sm font-extrabold text-slate-900 uppercase tracking-wider flex items-center gap-2">
            <span className="w-5 h-5 rounded-full bg-emerald-100 text-emerald-800 flex items-center justify-center text-xs font-bold">2</span>
            <span>Question principale</span>
          </h3>

          <div className="bg-emerald-50/60 p-4 sm:p-5 rounded-2xl border border-emerald-200">
            <label className="block text-sm font-black text-slate-900 mb-3">
              Viendrez-vous à la rencontre ? *
            </label>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
              
              <button
                type="button"
                onClick={() => setParticipation('OUI')}
                className={`p-3.5 rounded-2xl border text-left font-bold transition flex items-center gap-3 cursor-pointer ${
                  participation === 'OUI'
                    ? 'bg-emerald-700 text-white border-emerald-700 shadow-md ring-2 ring-emerald-400'
                    : 'bg-white hover:bg-slate-50 text-slate-800 border-slate-200'
                }`}
              >
                <div className={`w-6 h-6 rounded-full flex items-center justify-center font-bold text-xs ${
                  participation === 'OUI' ? 'bg-white text-emerald-800' : 'bg-emerald-100 text-emerald-800'
                }`}>
                  ✓
                </div>
                <div>
                  <span className="text-xs sm:text-sm font-black block">Oui</span>
                  <span className={`text-[10px] block ${participation === 'OUI' ? 'text-emerald-100' : 'text-slate-400'}`}>
                    Je serai présent
                  </span>
                </div>
              </button>

              <button
                type="button"
                onClick={() => {
                  setParticipation('NON');
                  setAideOrganisation(false);
                }}
                className={`p-3.5 rounded-2xl border text-left font-bold transition flex items-center gap-3 cursor-pointer ${
                  participation === 'NON'
                    ? 'bg-rose-700 text-white border-rose-700 shadow-md ring-2 ring-rose-400'
                    : 'bg-white hover:bg-slate-50 text-slate-800 border-slate-200'
                }`}
              >
                <div className={`w-6 h-6 rounded-full flex items-center justify-center font-bold text-xs ${
                  participation === 'NON' ? 'bg-white text-rose-800' : 'bg-rose-100 text-rose-800'
                }`}>
                  ✕
                </div>
                <div>
                  <span className="text-xs sm:text-sm font-black block">Non</span>
                  <span className={`text-[10px] block ${participation === 'NON' ? 'text-rose-100' : 'text-slate-400'}`}>
                    Je ne pourrai pas
                  </span>
                </div>
              </button>

              <button
                type="button"
                onClick={() => setParticipation('INCERTAIN')}
                className={`p-3.5 rounded-2xl border text-left font-bold transition flex items-center gap-3 cursor-pointer ${
                  participation === 'INCERTAIN'
                    ? 'bg-amber-600 text-white border-amber-600 shadow-md ring-2 ring-amber-300'
                    : 'bg-white hover:bg-slate-50 text-slate-800 border-slate-200'
                }`}
              >
                <div className={`w-6 h-6 rounded-full flex items-center justify-center font-bold text-xs ${
                  participation === 'INCERTAIN' ? 'bg-white text-amber-800' : 'bg-amber-100 text-amber-800'
                }`}>
                  ?
                </div>
                <div>
                  <span className="text-xs sm:text-sm font-black block">Je ne sais pas encore</span>
                  <span className={`text-[10px] block ${participation === 'INCERTAIN' ? 'text-amber-100' : 'text-slate-400'}`}>
                    Décision en cours
                  </span>
                </div>
              </button>

            </div>
          </div>
        </div>

        {/* SECTION 3: DURÉE DE PRÉSENCE (Conditionnelle à "OUI") */}
        {participation === 'OUI' && (
          <div className="space-y-4 pt-4 border-t border-slate-100 animate-in fade-in zoom-in-95 duration-200">
            <h3 className="text-sm font-extrabold text-slate-900 uppercase tracking-wider flex items-center gap-2">
              <span className="w-5 h-5 rounded-full bg-emerald-100 text-emerald-800 flex items-center justify-center text-xs font-bold">3</span>
              <span>Durée de présence</span>
            </h3>

            <div className="bg-slate-50 p-4 sm:p-5 rounded-2xl border border-slate-200">
              <label className="block text-xs sm:text-sm font-black text-slate-900 mb-3">
                Quelle sera votre durée de présence ? *
              </label>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                
                <label className={`p-4 rounded-2xl border font-semibold transition cursor-pointer flex items-center gap-3 ${
                  dureePresence === 'TROIS_JOURS'
                    ? 'bg-emerald-900 text-white border-emerald-900 shadow-md'
                    : 'bg-white text-slate-800 border-slate-200 hover:bg-emerald-50/50'
                }`}>
                  <input
                    type="radio"
                    name="dureePresence"
                    value="TROIS_JOURS"
                    checked={dureePresence === 'TROIS_JOURS'}
                    onChange={() => setDureePresence('TROIS_JOURS')}
                    className="sr-only"
                  />
                  <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                    dureePresence === 'TROIS_JOURS' ? 'border-white bg-emerald-400' : 'border-slate-300 bg-white'
                  }`}>
                    {dureePresence === 'TROIS_JOURS' && <div className="w-2 h-2 rounded-full bg-emerald-950" />}
                  </div>
                  <div>
                    <span className="text-xs sm:text-sm font-bold block">Les trois jours</span>
                    <span className={`text-[11px] block ${dureePresence === 'TROIS_JOURS' ? 'text-emerald-200' : 'text-slate-500'}`}>
                      Du vendredi au dimanche
                    </span>
                  </div>
                </label>

                <label className={`p-4 rounded-2xl border font-semibold transition cursor-pointer flex items-center gap-3 ${
                  dureePresence === 'WEEK_END'
                    ? 'bg-emerald-900 text-white border-emerald-900 shadow-md'
                    : 'bg-white text-slate-800 border-slate-200 hover:bg-emerald-50/50'
                }`}>
                  <input
                    type="radio"
                    name="dureePresence"
                    value="WEEK_END"
                    checked={dureePresence === 'WEEK_END'}
                    onChange={() => setDureePresence('WEEK_END')}
                    className="sr-only"
                  />
                  <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                    dureePresence === 'WEEK_END' ? 'border-white bg-emerald-400' : 'border-slate-300 bg-white'
                  }`}>
                    {dureePresence === 'WEEK_END' && <div className="w-2 h-2 rounded-full bg-emerald-950" />}
                  </div>
                  <div>
                    <span className="text-xs sm:text-sm font-bold block">Le week-end uniquement</span>
                    <span className={`text-[11px] block ${dureePresence === 'WEEK_END' ? 'text-emerald-200' : 'text-slate-500'}`}>
                      Samedi et dimanche uniquement
                    </span>
                  </div>
                </label>

              </div>
            </div>
          </div>
        )}

        {/* SECTION 4: AIDE À L'ORGANISATION */}
        <div className="space-y-4 pt-4 border-t border-slate-100">
          <h3 className="text-sm font-extrabold text-slate-900 uppercase tracking-wider flex items-center gap-2">
            <span className="w-5 h-5 rounded-full bg-emerald-100 text-emerald-800 flex items-center justify-center text-xs font-bold">4</span>
            <span>Aide à l'organisation</span>
          </h3>

          <div className="bg-slate-50 p-4 sm:p-5 rounded-2xl border border-slate-200 space-y-4">
            <label className="block text-xs sm:text-sm font-black text-slate-900">
              Souhaitez-vous aider à l'organisation de la rencontre ? *
            </label>

            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setAideOrganisation(true)}
                className={`py-3 px-4 rounded-xl border text-xs sm:text-sm font-bold transition flex items-center justify-center gap-2 cursor-pointer ${
                  aideOrganisation
                    ? 'bg-emerald-800 text-white border-emerald-800 shadow-md'
                    : 'bg-white hover:bg-slate-100 text-slate-700 border-slate-200'
                }`}
              >
                <span>🤝</span>
                <span>Oui, je souhaite aider</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  setAideOrganisation(false);
                  setDomainesAide([]);
                  setAutrePrecision('');
                }}
                className={`py-3 px-4 rounded-xl border text-xs sm:text-sm font-bold transition flex items-center justify-center gap-2 cursor-pointer ${
                  !aideOrganisation
                    ? 'bg-slate-900 text-white border-slate-900 shadow-md'
                    : 'bg-white hover:bg-slate-100 text-slate-700 border-slate-200'
                }`}
              >
                <span>Non</span>
              </button>
            </div>

            {/* Domaines d'aide (Si OUI) */}
            {aideOrganisation && (
              <div className="pt-3 border-t border-slate-200 space-y-3 animate-in fade-in zoom-in-95 duration-200">
                <label className="block text-xs font-bold text-emerald-900">
                  Dans quel domaine souhaitez-vous aider ? (plusieurs choix possibles) :
                </label>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {domainOptions.map((opt) => {
                    const Icon = opt.icon;
                    const isChecked = domainesAide.includes(opt.id);
                    return (
                      <button
                        key={opt.id}
                        type="button"
                        onClick={() => handleToggleDomaine(opt.id)}
                        className={`p-3 rounded-xl border text-left text-xs transition flex items-start gap-2.5 cursor-pointer ${
                          isChecked
                            ? 'bg-emerald-50 border-emerald-500 text-emerald-950 font-bold shadow-2xs'
                            : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
                        }`}
                      >
                        <div className={`w-4 h-4 rounded mt-0.5 flex items-center justify-center shrink-0 border ${
                          isChecked ? 'bg-emerald-700 border-emerald-700 text-white' : 'border-slate-300 bg-white'
                        }`}>
                          {isChecked && <Check className="w-3 h-3 stroke-[3]" />}
                        </div>
                        <div>
                          <span className="block font-bold leading-tight">{opt.label}</span>
                          <span className="text-[10px] text-slate-500 font-normal leading-tight block mt-0.5">
                            {opt.desc}
                          </span>
                        </div>
                      </button>
                    );
                  })}
                </div>

                {/* Champ autre précision */}
                {domainesAide.includes('Autre') && (
                  <div className="pt-2">
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Précisez votre aide :
                    </label>
                    <input
                      type="text"
                      value={autrePrecision}
                      onChange={(e) => setAutrePrecision(e.target.value)}
                      placeholder="Ex: matériel médical, sonorisation, traduction, atelier spécifique..."
                      className="w-full px-3.5 py-2 rounded-xl border border-slate-200 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 text-xs outline-none bg-white font-medium"
                    />
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* SECTION 5: REMARQUES OU INFORMATIONS COMPLÉMENTAIRES */}
        <div className="space-y-2 pt-2">
          <label className="block text-xs font-bold text-slate-700">
            Remarques / Besoins particuliers (optionnel) :
          </label>
          <textarea
            rows={2}
            value={remarques}
            onChange={(e) => setRemarques(e.target.value)}
            placeholder="Ex: covoiturage proposé avec X places, contraintes horaires, hébergement..."
            className="w-full px-3.5 py-2.5 rounded-2xl border border-slate-200 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 text-xs outline-none bg-slate-50 focus:bg-white transition"
          />
        </div>

        {/* Submit Actions */}
        <div className="pt-4 border-t border-slate-100 flex items-center justify-between gap-3">
          <button
            type="button"
            onClick={onCancel}
            className="py-3 px-4 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-100 transition cursor-pointer"
          >
            Annuler
          </button>

          <button
            type="submit"
            disabled={isSubmitting}
            className="py-3.5 px-6 bg-gradient-to-r from-emerald-700 via-emerald-800 to-teal-800 hover:from-emerald-800 hover:to-teal-900 text-white rounded-2xl text-xs sm:text-sm font-black shadow-md shadow-emerald-800/20 flex items-center gap-2 transition active:scale-98 cursor-pointer disabled:opacity-50"
          >
            <Send className="w-4 h-4" />
            <span>{isSubmitting ? 'Enregistrement...' : 'Enregistrer ma réponse'}</span>
          </button>
        </div>

      </form>

    </div>
  );
};
