export interface Member {
  id: string;
  nom: string;
  prenom: string;
  fonction: string;
  organisation: string;
  email: string;
  telephone: string;
  adresse: string;
  codePostal: string;
  ville: string;
  departement: string;
  region: string;
  pays: string;
  latitude: number;
  longitude: number;
  photo?: string;
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

export interface FilterState {
  searchQuery: string;
  ville: string;
  departement: string;
  region: string;
  organisation: string;
  fonction: string;
  zoneId?: string;
  qualityFilter: QualityFilter;
  sortBy: SortOption;
}

export type UserRole = 'user' | 'admin';

