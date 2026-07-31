/**
 * Mapping explicite entre les lignes Postgres (snake_case) et les types
 * TypeScript canoniques du frontend (camelCase français, shared/types/index.ts).
 *
 * Règles :
 * - les chaînes requises par les types TS (telephone, email...) sont coercées
 *   de NULL vers '' en sortie ;
 * - les champs optionnels NULL deviennent undefined (puis sont retirés) ;
 * - les dates affichées (timestamp fr-FR, lastLogin, createdAt ISO...) sont
 *   des chaînes stockées telles quelles, jamais converties.
 */
import { Member, CustomZone, AppUser, AuditLog, ImportLog, AppSettings, CustomField, UserRole, AuditLogCategory } from '../../shared/types/index';

type Row = Record<string, unknown>;

function str(v: unknown): string {
  return typeof v === 'string' ? v : '';
}

function optStr(v: unknown): string | undefined {
  return typeof v === 'string' && v !== '' ? v : undefined;
}

function optNum(v: unknown): number | undefined {
  return typeof v === 'number' && Number.isFinite(v) ? v : undefined;
}

/** Retire les clés à valeur undefined (payloads JSON propres). */
function compact<T extends Record<string, unknown>>(obj: T): T {
  const out: Record<string, unknown> = {};
  for (const [k, v] of Object.entries(obj)) {
    if (v !== undefined) out[k] = v;
  }
  return out as T;
}

// ---------------------------------------------------------------------------
// Member
// ---------------------------------------------------------------------------

export function memberFromDb(row: Row): Member {
  return compact({
    id: str(row.id),
    nom: str(row.nom),
    prenom: str(row.prenom),
    telephone: str(row.telephone),
    email: str(row.email),
    zone: optStr(row.zone),
    situationProfessionnelle: optStr(row.situation_professionnelle),
    domaineEtude: optStr(row.domaine_etude),
    anneeArriveeFrance: optStr(row.annee_arrivee_france),
    fonction: optStr(row.fonction),
    organisation: optStr(row.organisation),
    adresse: optStr(row.adresse),
    codePostal: optStr(row.code_postal),
    ville: optStr(row.ville),
    departement: optStr(row.departement),
    region: optStr(row.region),
    pays: optStr(row.pays),
    latitude: optNum(row.latitude),
    longitude: optNum(row.longitude),
    photo: optStr(row.photo),
    champsPersonnalises: Array.isArray(row.champs_personnalises) && row.champs_personnalises.length > 0
      ? (row.champs_personnalises as CustomField[])
      : undefined
  }) as Member;
}

export function memberToDb(m: Member): Row {
  return {
    id: m.id,
    nom: m.nom ?? '',
    prenom: m.prenom ?? '',
    telephone: m.telephone ?? '',
    email: m.email || null,
    zone: m.zone ?? null,
    situation_professionnelle: m.situationProfessionnelle ?? null,
    domaine_etude: m.domaineEtude ?? null,
    annee_arrivee_france: m.anneeArriveeFrance ?? null,
    fonction: m.fonction ?? null,
    organisation: m.organisation ?? null,
    adresse: m.adresse ?? null,
    code_postal: m.codePostal ?? null,
    ville: m.ville ?? null,
    departement: m.departement ?? null,
    region: m.region ?? null,
    pays: m.pays ?? null,
    latitude: m.latitude ?? null,
    longitude: m.longitude ?? null,
    photo: m.photo ?? null,
    champs_personnalises: m.champsPersonnalises ?? []
  };
}

// ---------------------------------------------------------------------------
// CustomZone
// ---------------------------------------------------------------------------

export function zoneFromDb(row: Row): CustomZone {
  return compact({
    id: str(row.id),
    name: str(row.name),
    description: optStr(row.description),
    color: optStr(row.color),
    memberIds: Array.isArray(row.member_ids) ? (row.member_ids as string[]) : [],
    referentUserId: optStr(row.referent_user_id),
    referentName: optStr(row.referent_name),
    createdAt: str(row.created_at_iso)
  }) as CustomZone;
}

export function zoneToDb(z: CustomZone): Row {
  return {
    id: z.id,
    name: z.name,
    description: z.description ?? null,
    color: z.color ?? null,
    member_ids: z.memberIds ?? [],
    referent_user_id: z.referentUserId ?? null,
    referent_name: z.referentName ?? null,
    created_at_iso: z.createdAt ?? new Date().toISOString()
  };
}

// ---------------------------------------------------------------------------
// AppUser (password : write-only, jamais stocké ni renvoyé)
// ---------------------------------------------------------------------------

export function appUserFromDb(row: Row): AppUser {
  return compact({
    id: str(row.id),
    nom: str(row.nom),
    prenom: str(row.prenom),
    name: optStr(row.name),
    email: str(row.email),
    username: str(row.username),
    role: (str(row.role) || 'user') as UserRole,
    region: optStr(row.region),
    assignedZoneIds: Array.isArray(row.assigned_zone_ids) ? (row.assigned_zone_ids as string[]) : [],
    active: row.active !== false,
    createdAt: optStr(row.created_at_str),
    lastLogin: str(row.last_login) || 'Nouveau'
  }) as AppUser;
}

export function appUserToDb(u: AppUser, authUserId?: string | null): Row {
  const row: Row = {
    id: u.id,
    nom: u.nom ?? '',
    prenom: u.prenom ?? '',
    name: u.name ?? null,
    email: u.email,
    username: u.username,
    role: u.role,
    region: u.region ?? null,
    assigned_zone_ids: u.assignedZoneIds ?? [],
    active: u.active !== false,
    created_at_str: u.createdAt ?? null,
    last_login: u.lastLogin || 'Nouveau'
  };
  if (authUserId !== undefined) row.auth_user_id = authUserId;
  return row;
}

// ---------------------------------------------------------------------------
// AuditLog
// ---------------------------------------------------------------------------

export function auditLogFromDb(row: Row): AuditLog {
  return compact({
    id: str(row.id),
    timestamp: str(row.timestamp_fr),
    date: optStr(row.date_fr),
    time: optStr(row.time_fr),
    category: str(row.category) as AuditLogCategory,
    action: str(row.action),
    details: str(row.details),
    userId: str(row.user_id),
    userName: str(row.user_name),
    userRole: str(row.user_role) as UserRole,
    targetId: optStr(row.target_id),
    targetName: optStr(row.target_name),
    targetItem: optStr(row.target_name),
    zoneName: optStr(row.zone_name),
    champModifie: optStr(row.champ_modifie),
    ancienneValeur: optStr(row.ancienne_valeur),
    nouvelleValeur: optStr(row.nouvelle_valeur),
    severity: optStr(row.severity) as AuditLog['severity']
  }) as AuditLog;
}

export function auditLogToDb(l: AuditLog): Row {
  return {
    id: l.id,
    timestamp_fr: l.timestamp,
    date_fr: l.date ?? null,
    time_fr: l.time ?? null,
    category: l.category,
    action: l.action,
    details: l.details ?? '',
    user_id: l.userId,
    user_name: l.userName,
    user_role: l.userRole,
    target_id: l.targetId ?? null,
    target_name: l.targetName ?? l.targetItem ?? null,
    zone_name: l.zoneName ?? null,
    champ_modifie: l.champModifie ?? null,
    ancienne_valeur: l.ancienneValeur ?? null,
    nouvelle_valeur: l.nouvelleValeur ?? null,
    severity: l.severity ?? 'info'
  };
}

// ---------------------------------------------------------------------------
// ImportLog
// ---------------------------------------------------------------------------

export function importLogFromDb(row: Row): ImportLog {
  return {
    id: str(row.id),
    filename: str(row.filename),
    date: str(row.date_fr),
    importedBy: str(row.imported_by),
    totalRows: typeof row.total_rows === 'number' ? row.total_rows : 0,
    addedCount: typeof row.added_count === 'number' ? row.added_count : 0,
    updatedCount: typeof row.updated_count === 'number' ? row.updated_count : 0,
    locationChangesCount: typeof row.location_changes_count === 'number' ? row.location_changes_count : 0,
    errors: Array.isArray(row.errors) ? (row.errors as string[]) : []
  };
}

export function importLogToDb(l: ImportLog): Row {
  return {
    id: l.id,
    filename: l.filename,
    date_fr: l.date,
    imported_by: l.importedBy,
    total_rows: l.totalRows ?? 0,
    added_count: l.addedCount ?? 0,
    updated_count: l.updatedCount ?? 0,
    location_changes_count: l.locationChangesCount ?? 0,
    errors: l.errors ?? []
  };
}

// ---------------------------------------------------------------------------
// AppSettings (+ lastUpdateDate, ligne unique id = 1)
// ---------------------------------------------------------------------------

export type SettingsPayload = Partial<AppSettings> & { lastUpdateDate?: string };

export function settingsFromDb(row: Row): AppSettings & { lastUpdateDate?: string } {
  return compact({
    appName: str(row.app_name) || 'Cartographie MDF',
    associationName: str(row.association_name) || 'Mbok de France',
    tagline: str(row.tagline),
    defaultCountry: str(row.default_country) || 'France',
    mapDefaultZoom: typeof row.map_default_zoom === 'number' ? row.map_default_zoom : 6,
    logoUrl: optStr(row.logo_url),
    lastUpdateDate: optStr(row.last_update_date)
  }) as AppSettings & { lastUpdateDate?: string };
}

export function settingsToDb(s: SettingsPayload): Row {
  const row: Row = {};
  if (s.appName !== undefined) row.app_name = s.appName;
  if (s.associationName !== undefined) row.association_name = s.associationName;
  if (s.tagline !== undefined) row.tagline = s.tagline;
  if (s.defaultCountry !== undefined) row.default_country = s.defaultCountry;
  if (s.mapDefaultZoom !== undefined) row.map_default_zoom = s.mapDefaultZoom;
  if (s.logoUrl !== undefined) row.logo_url = s.logoUrl;
  if (s.lastUpdateDate !== undefined) row.last_update_date = s.lastUpdateDate;
  return row;
}
