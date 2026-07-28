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
  zone?: string; // Ex: Bretagne, Île-de-France, Grand Ouest, etc.
  situationProfessionnelle?: string; // Ex: Salarié, Étudiant, Indépendant, Cadre...
  domaineEtude?: string; // Ex: Informatique, Droit, Commerce, Santé...
  anneeArriveeFrance?: string; // Ex: 2018, 2020...
  
  // Champs de localisation & rétrocompatibilité
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

  // Champs personnalisés dynamiques
  champsPersonnalises?: CustomField[];
}

export type SortOption = 'nom_asc' | 'nom_desc' | 'ville_asc' | 'organisation_asc';

export type QualityFilter = 'all' | 'no_phone' | 'no_email' | 'no_location' | 'duplicates';

export type ActiveTab = 'dashboard' | 'directory' | 'zones' | 'users' | 'quality' | 'import_export' | 'settings';

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

export type UserRole = 'user' | 'admin';

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
  active: boolean;
  createdAt?: string;
  lastLogin: string;
}

