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

export type ActiveTab = 'dashboard' | 'directory' | 'zones' | 'reportings' | 'demandes' | 'users' | 'quality' | 'import_export' | 'audit_logs' | 'settings';

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
  referentUserId?: string;
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
