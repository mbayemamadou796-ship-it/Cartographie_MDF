/**
 * Schémas zod miroirs des types canoniques shared/types/index.ts.
 * Volontairement tolérants (le frontend figé est la source de vérité) :
 * on valide la forme et les invariants critiques, pas plus.
 */
import { z } from 'zod';

export const loginSchema = z.object({
  identifier: z.string().trim().min(1).max(255),
  password: z.string().min(1).max(255)
});

export const refreshSchema = z.object({
  refreshToken: z.string().min(1)
});

const customFieldSchema = z.object({
  id: z.string(),
  label: z.string(),
  value: z.string()
});

export const memberSchema = z.object({
  id: z.string().min(1).max(120),
  nom: z.string().max(300),
  prenom: z.string().max(300).default(''),
  telephone: z.string().max(100).default(''),
  email: z.string().max(320).default(''),
  zone: z.string().max(200).optional(),
  situationProfessionnelle: z.string().max(300).optional(),
  domaineEtude: z.string().max(300).optional(),
  anneeArriveeFrance: z.string().max(50).optional(),
  fonction: z.string().max(300).optional(),
  organisation: z.string().max(300).optional(),
  adresse: z.string().max(500).optional(),
  codePostal: z.string().max(50).optional(),
  ville: z.string().max(200).optional(),
  departement: z.string().max(200).optional(),
  region: z.string().max(200).optional(),
  pays: z.string().max(200).optional(),
  latitude: z.number().finite().optional(),
  longitude: z.number().finite().optional(),
  photo: z.string().optional(),           // URL ou data-URL base64 (<= 5 Mo)
  champsPersonnalises: z.array(customFieldSchema).optional()
});

export const membersArraySchema = z.array(memberSchema).max(20000);

export const zoneSchema = z.object({
  id: z.string().min(1).max(120),
  name: z.string().min(1).max(200),
  description: z.string().max(1000).optional(),
  color: z.string().max(50).optional(),
  memberIds: z.array(z.string().max(120)).default([]),
  referentUserId: z.string().max(120).optional(),
  referentName: z.string().max(300).optional(),
  createdAt: z.string().max(60).default('')
});

export const zonesArraySchema = z.array(zoneSchema).max(1000);

export const appUserSchema = z.object({
  id: z.string().min(1).max(120),
  nom: z.string().max(300).default(''),
  prenom: z.string().max(300).default(''),
  name: z.string().max(300).optional(),
  email: z.string().trim().min(3).max(320),
  username: z.string().trim().min(1).max(120),
  password: z.string().max(255).optional(),   // write-only -> Supabase Auth
  role: z.enum(['user', 'referent', 'admin', 'super_admin']),
  region: z.string().max(200).optional(),
  assignedZoneIds: z.array(z.string().max(120)).optional(),
  active: z.boolean().default(true),
  createdAt: z.string().max(100).optional(),
  lastLogin: z.string().max(100).default('Nouveau')
});

export const appUsersArraySchema = z.array(appUserSchema).max(2000);

export const auditLogSchema = z.object({
  id: z.string().min(1).max(120),
  timestamp: z.string().max(60),              // "JJ/MM/AAAA HH:mm" — conservé tel quel
  date: z.string().max(20).optional(),        // "JJ/MM/AAAA" (recalculée côté serveur)
  time: z.string().max(20).optional(),        // "HH:MM:SS" (recalculée côté serveur)
  category: z.enum(['auth', 'member', 'zone', 'user', 'data', 'system']),
  action: z.string().max(300),
  details: z.string().max(5000).default(''),
  userId: z.string().max(120).default('sys'),
  userName: z.string().max(300).default('Système'),
  userRole: z.string().max(50).default('admin'),
  targetId: z.string().max(120).optional(),
  targetName: z.string().max(300).optional(),
  targetItem: z.string().max(300).optional(),
  zoneName: z.string().max(200).optional(),
  champModifie: z.string().max(300).optional(),
  ancienneValeur: z.string().max(2000).optional(),
  nouvelleValeur: z.string().max(2000).optional(),
  severity: z.enum(['info', 'warning', 'danger']).optional()
});

export const demandeSchema = z.object({
  id: z.string().min(1).max(120),
  type: z.enum(['INSCRIPTION', 'MISE_A_JOUR']),
  status: z.enum(['EN_ATTENTE', 'VALIDEE', 'REFUSEE']),
  createdAt: z.string().max(60),
  updatedAt: z.string().max(60).optional(),
  validatedAt: z.string().max(60).optional(),
  validatedBy: z.string().max(300).optional(),
  rejectionReason: z.string().max(2000).optional(),
  targetMemberId: z.string().max(120).optional(),
  nom: z.string().max(300),
  prenom: z.string().max(300).default(''),
  email: z.string().max(320).default(''),
  telephone: z.string().max(100).default(''),
  adresse: z.string().max(500).optional(),
  codePostal: z.string().max(50).optional(),
  ville: z.string().max(200).default(''),
  departement: z.string().max(200).optional(),
  region: z.string().max(200).optional(),
  zone: z.string().max(200).optional(),
  pays: z.string().max(200).optional(),
  situationProfessionnelle: z.string().max(300).optional(),
  domaineEtude: z.string().max(300).optional(),
  anneeArriveeFrance: z.string().max(50).optional(),
  organisation: z.string().max(300).optional(),
  fonction: z.string().max(300).optional(),
  photo: z.string().optional(),           // URL ou data-URL base64 (<= 5 Mo)
  latitude: z.number().finite().optional(),
  longitude: z.number().finite().optional(),
  champsPersonnalises: z.array(customFieldSchema).optional(),
  notes: z.string().max(5000).optional()
});

export const demandesArraySchema = z.array(demandeSchema).max(20000);

/**
 * Création via le formulaire public (non authentifié) : le client ne contrôle
 * ni le statut ni les champs de validation — ils sont forcés côté serveur.
 * La photo est bornée (data-URL base64 <= ~5 Mo) car l'endpoint est public.
 */
export const publicDemandeSchema = demandeSchema
  .omit({ status: true, validatedAt: true, validatedBy: true, rejectionReason: true, updatedAt: true })
  .extend({
    nom: z.string().trim().min(1).max(300),
    email: z.string().trim().min(3).max(320),
    photo: z.string().max(7_000_000).optional()
  });

export const importLogSchema = z.object({
  id: z.string().min(1).max(120),
  filename: z.string().max(500),
  date: z.string().max(100),
  importedBy: z.string().max(300),
  totalRows: z.number().int().nonnegative().default(0),
  addedCount: z.number().int().nonnegative().default(0),
  updatedCount: z.number().int().nonnegative().default(0),
  locationChangesCount: z.number().int().nonnegative().default(0),
  errors: z.array(z.string().max(1000)).default([])
});

export const importLogsArraySchema = z.array(importLogSchema).max(5000);

export const settingsSchema = z.object({
  appName: z.string().max(200).optional(),
  associationName: z.string().max(200).optional(),
  tagline: z.string().max(500).optional(),
  defaultCountry: z.string().max(100).optional(),
  mapDefaultZoom: z.number().int().min(1).max(20).optional(),
  logoUrl: z.string().optional(),             // data-URL base64 possible (<= 5 Mo)
  lastUpdateDate: z.string().max(200).optional()
});
