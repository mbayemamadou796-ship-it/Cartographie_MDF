export interface CustomField {
  id: string;
  label: string;
  value: string;
}

export interface Member {
  id: string;
  nom: string;
  prenom: string;
  telephone: string;
  email: string;
  zone?: string;
  situationProfessionnelle?: string;
  domaineEtude?: string;
  anneeArriveeFrance?: string;
  fonction?: string;
  organisation?: string;
  adresse?: string;
  codePostal?: string;
  ville?: string;
  departement?: string;
  region?: string;
  pays?: string;
  latitude?: number;
  longitude?: number;
  photo?: string;
  champsPersonnalises?: CustomField[];
}

export type SortOption = 'nom_asc' | 'nom_desc' | 'ville_asc' | 'organisation_asc';

export type QualityFilter = 'all' | 'no_phone' | 'no_email' | 'no_location' | 'duplicates';

export type ActiveTab = 'dashboard' | 'directory' | 'zones' | 'reportings' | 'rencontres' | 'demandes' | 'mandats' | 'documents' | 'users' | 'quality' | 'import_export' | 'audit_logs' | 'settings';

export type ReportingStatus = 'NOUVEAU' | 'EN_COURS' | 'TRAITE';
export type ReportingType = 'PERIODIQUE' | 'PONCTUEL';
export type ReportingPriority = 'NORMAL' | 'IMPORTANT' | 'URGENT';

export interface ReportAttachment {
  id?: string;
  name: string;
  size?: number;
  type?: string;
  url?: string;
  uploadedAt?: string;
}

export interface ReportResponse {
  id: string;
  authorId?: string;
  authorName: string;
  authorRole: 'bureau' | 'referent' | 'admin';
  content: string;
  createdAt: string;
  piecesJointes?: ReportAttachment[];
}

export interface ReportActionLog {
  id: string;
  date: string;
  authorName: string;
  authorRole?: string;
  action: string;
  previousStatus?: ReportingStatus;
  newStatus?: ReportingStatus;
  details?: string;
}

export interface WeeklyReport {
  id: string;
  caseNumber?: string | number; // Ex: '#125'
  referentId: string;
  referentName: string;
  email: string;
  telephone?: string;
  zone: string;
  zoneId?: string;
  type?: ReportingType; // 'PERIODIQUE' (défaut) ou 'PONCTUEL' (urgence / demande ciblée)
  sujet?: string; // Titre du problème ou objet de la remontée ponctuelle
  priority?: ReportingPriority; // 'NORMAL' | 'IMPORTANT' | 'URGENT'
  semaineLundi: string; // YYYY-MM-DD format (Lundi de la semaine ou date du jour)
  nouveauxContactes?: string;
  situationsPrioritaires?: string;
  activitesLocales?: string;
  besoinRetourBureau: boolean;
  detailsDemandeRetour?: string;
  urgenceLevel: number; // 1 to 5 (1 = Routine, 5 = Urgent)
  status: ReportingStatus;
  bureauNotes?: string;
  piecesJointes?: ReportAttachment[];
  
  // Pilotage, Responsable et cycle de traitement
  responsableId?: string;
  responsableName?: string;
  datePriseEnCharge?: string; // Date à laquelle le statut est passé à EN_COURS
  dateReponse?: string; // Date de la première réponse du Bureau
  dateTraitement?: string; // Date à laquelle le statut est passé à TRAITE
  reponses?: ReportResponse[]; // Historique des échanges / réponses Bureau-Référent
  actionHistory?: ReportActionLog[]; // Traçabilité complète des actions

  createdAt: string;
  updatedAt?: string;
  lastActivityAt?: string; // Date de dernière modification ou réponse Bureau
  reviewedBy?: string;
  reviewedAt?: string;
}

export type DemandeType = 'INSCRIPTION' | 'MISE_A_JOUR';
export type DemandeStatus = 'EN_ATTENTE' | 'VALIDEE' | 'REFUSEE';

export interface DemandeMember {
  id: string;
  type: DemandeType;
  status: DemandeStatus;
  createdAt: string;
  updatedAt?: string;
  validatedAt?: string;
  validatedBy?: string;
  rejectionReason?: string;
  
  // Member fields
  targetMemberId?: string; // If type is MISE_A_JOUR
  nom: string;
  prenom: string;
  email: string;
  telephone: string;
  adresse?: string;
  codePostal?: string;
  ville: string;
  departement?: string;
  region?: string;
  zone?: string;
  pays?: string;
  situationProfessionnelle?: string;
  domaineEtude?: string;
  anneeArriveeFrance?: string;
  organisation?: string;
  fonction?: string;
  photo?: string;
  latitude?: number;
  longitude?: number;
  champsPersonnalises?: CustomField[];
  notes?: string;
}

export type AuditLogCategory = 'auth' | 'member' | 'zone' | 'user' | 'data' | 'system';

export interface AuditLog {
  id: string;
  timestamp: string;
  date?: string;
  time?: string;
  category: AuditLogCategory;
  action: string;
  details: string;
  userId: string;
  userName: string;
  userRole: UserRole;
  targetId?: string;
  targetName?: string;
  targetItem?: string;
  zoneName?: string;
  champModifie?: string;
  ancienneValeur?: string;
  nouvelleValeur?: string;
  severity?: 'info' | 'warning' | 'danger';
}

export interface AppSettings {
  appName: string;
  associationName: string;
  tagline: string;
  defaultCountry: string;
  mapDefaultZoom: number;
  logoUrl?: string;
}

export interface CustomZone {
  id: string;
  name: string;
  description?: string;
  color?: string;
  memberIds: string[];
  /**
   * Référents désignés parmi les MEMBRES de la zone (plusieurs possibles).
   * Distinct du compte utilisateur : le membre existe dans l'annuaire,
   * le compte (rôle referent + assignedZoneIds) donne les droits d'accès.
   */
  referentMemberIds?: string[];
  /** @deprecated ancien référent unique par compte utilisateur (conservé pour compat). */
  referentUserId?: string;
  /** @deprecated ancien nom du référent unique (conservé pour compat). */
  referentName?: string;
  createdAt: string;
}

export interface ImportLog {
  id: string;
  filename: string;
  date: string;
  importedBy: string;
  totalRows: number;
  addedCount: number;
  updatedCount: number;
  locationChangesCount: number;
  errors: string[];
}

export interface LocationChangeAlert {
  memberId: string;
  memberName: string;
  oldVille: string;
  newVille: string;
  zoneId: string;
  zoneName: string;
  actionTaken?: 'keep' | 'change' | 'remove' | 'later';
  targetZoneId?: string;
}

export interface FilterState {
  searchQuery: string;
  ville: string;
  departement: string;
  region: string;
  zone: string;
  situationProfessionnelle: string;
  domaineEtude: string;
  anneeArriveeFrance: string;
  organisation: string;
  fonction: string;
  zoneId?: string;
  qualityFilter: QualityFilter;
  sortBy: SortOption;
}

export type UserRole = 'user' | 'referent' | 'admin' | 'super_admin';

export interface AppUser {
  id: string;
  nom: string;
  prenom: string;
  name?: string;
  email: string;
  username: string;
  password?: string;
  role: UserRole;
  region?: string;
  assignedZoneIds?: string[];
  active: boolean;
  createdAt?: string;
  lastLogin: string;
}

// ==========================================
// 🏛️ ARCHIVES DES MANDATS & RÉALISATIONS
// ==========================================

export type MandatStatus = 'EN_PREPARATION' | 'EN_COURS' | 'TERMINE' | 'ARCHIVE';

export type RealisationCategory = 
  | 'EVENEMENTS' 
  | 'ACTIONS_SOCIALES' 
  | 'COMMUNICATION' 
  | 'ORGANISATION' 
  | 'PARTENARIATS' 
  | 'PROJETS_NUMERIQUES' 
  | 'FORMATION' 
  | 'VIE_ASSOCIATIVE' 
  | 'AUTRE';

export type RealisationStatus = 'A_FAIRE' | 'EN_COURS' | 'TERMINE' | 'ARCHIVE';

export interface MandatDocument {
  id: string;
  name: string;
  category?: 'COMPTE_RENDU' | 'RAPPORT' | 'BILAN' | 'PROCES_VERBAL' | 'PHOTO' | 'PRESENTATION' | 'FEUILLE_DE_ROUTE' | 'PROJET' | 'AUTRE';
  url?: string;
  type?: string;
  size?: number;
  dateAjout: string;
  description?: string;
  uploadedBy?: string;
}

export interface MandatRealisation {
  id: string;
  mandatId: string;
  titre: string;
  description: string;
  date: string;
  categorie: RealisationCategory;
  responsable: string;
  responsableId?: string;
  statut: RealisationStatus;
  documents?: MandatDocument[];
  indicateurs?: string;
  createdAt: string;
  updatedAt?: string;
}

export interface MandatBilan {
  objectifsInitiaux?: string;
  objectifsRealises?: string;
  objectifsNonRealises?: string;
  principalesRealisations?: string;
  difficultes?: string;
  resultats?: string;
  recommandationsSuivant?: string;
  dateBilan?: string;
  redigePar?: string;
  documentsBilan?: MandatDocument[];
}

export interface Mandat {
  id: string;
  intitule: string; // Ex: 'Mandat 2026 — 2028'
  dateDebut: string; // YYYY-MM-DD
  dateFin: string; // YYYY-MM-DD
  description: string;
  responsables: string[]; // Ex: ['Modou Mbaye (Président)', 'Amina Diop (SG)', 'Amadou Sy (Trésorier)']
  statut: MandatStatus;
  realisations: MandatRealisation[];
  documents: MandatDocument[];
  bilan?: MandatBilan;
  createdAt: string;
  updatedAt?: string;
}

// ==========================================
// 📚 DOCUMENTS UTILES (RÉFÉRENTS & ADMIN)
// ==========================================

export type DocumentCategory = 
  | 'PRESENTATION' 
  | 'OFFICIELS' 
  | 'GUIDE_ADHERENT' 
  | 'INFOS_PRATIQUES' 
  | 'FORMULAIRES' 
  | 'AUTRE';

export type DocumentPublishStatus = 'PUBLIE' | 'BROUILLON' | 'ARCHIVE';

export interface DocumentVersion {
  id: string;
  version: string;
  date: string;
  notes?: string;
  fileUrl?: string;
  fileName?: string;
  fileSize?: number;
  authorName?: string;
}

export interface UsefulDocument {
  id: string;
  name: string;
  description: string;
  category: DocumentCategory;
  customCategoryName?: string;
  fileUrl?: string;
  fileName: string;
  fileType: string;
  fileSize?: number;
  version: string; // Ex: '2.1'
  datePublication: string;
  dateMiseAJour: string;
  statut: DocumentPublishStatus;
  ordreAffichage?: number;
  authorName?: string;
  versionsHistorique?: DocumentVersion[];
  tags?: string[];
  content?: string;
}

// ==========================================
// 🕌 RENCONTRES & SONDAGES (MDF RENCONTRES)
// ==========================================

export type RencontreStatut = 
  | 'BROUILLON' 
  | 'SONDAGE_OUVERT' 
  | 'SONDAGE_FERME' 
  | 'PREPARATION' 
  | 'TERMINEE' 
  | 'ARCHIVEE';

export type RencontreParticipation = 'OUI' | 'NON' | 'INCERTAIN';

export type RencontreDureePresence = 'TROIS_JOURS' | 'WEEK_END';

export type RencontreDomaineAide = 
  | 'LOGISTIQUE' 
  | 'TRANSPORT' 
  | 'INSTALLATION_RANGEMENT' 
  | 'CUISINE_REPAS' 
  | 'ACCUEIL' 
  | 'COMMUNICATION' 
  | 'AUTRE';

export interface Rencontre {
  id: string;
  nom: string; // Ex: 'Rencontre MDF 2026'
  annee: number; // Ex: 2026
  description: string;
  messageAccueil?: string;
  dateDebut: string; // YYYY-MM-DD
  dateFin: string; // YYYY-MM-DD
  dateAffichage?: string; // Ex: 'Du 25 au 27 décembre 2026'
  lieu: string; // Ex: 'Toulouse'
  adresse: string; // Ex: '424 Montgay, 31560 Nailloux, Toulouse'
  dateLimite: string; // YYYY-MM-DD (ex: '2026-11-30')
  dateLimiteAffichage?: string; // Ex: '30 novembre 2026'
  statut: RencontreStatut;
  isDefault?: boolean;
  bureauNotes?: string;
  createdAt: string;
  updatedAt?: string;
}

export interface RencontreResponse {
  id: string;
  rencontreId: string;
  memberId?: string; // Linked directly to existing member id
  nom: string;
  prenom: string;
  email: string;
  telephone: string;
  zone: string;
  referentName?: string;
  ville?: string;
  
  // Sondage fields
  participation: RencontreParticipation; // 'OUI' | 'NON' | 'INCERTAIN'
  dureePresence?: RencontreDureePresence; // 'TROIS_JOURS' | 'WEEK_END' (si OUI)
  aideOrganisation: boolean; // true = Oui, false = Non
  domainesAide?: string[]; // ['Logistique', 'Transport', etc.]
  autrePrecision?: string; // Si 'Autre' est sélectionné
  
  remarques?: string;
  dateReponse: string; // ISO string / formatted date
  createdAt: string;
  updatedAt?: string;
}

