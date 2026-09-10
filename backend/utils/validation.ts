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
  referentMemberIds: z.array(z.string().max(120)).optional(),
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

const reportAttachmentSchema = z.object({
  id: z.string().max(120).optional(),
  name: z.string().max(500),
  size: z.number().nonnegative().optional(),
  type: z.string().max(200).optional(),
  url: z.string().optional(),               // data-URL possible
  uploadedAt: z.string().max(60).optional()
});

const reportResponseSchema = z.object({
  id: z.string().max(120),
  authorId: z.string().max(120).optional(),
  authorName: z.string().max(300),
  authorRole: z.enum(['bureau', 'referent', 'admin']),
  content: z.string().max(10000),
  createdAt: z.string().max(60),
  piecesJointes: z.array(reportAttachmentSchema).max(20).optional()
});

const reportActionLogSchema = z.object({
  id: z.string().max(120),
  date: z.string().max(60),
  authorName: z.string().max(300),
  authorRole: z.string().max(50).optional(),
  action: z.string().max(300),
  previousStatus: z.enum(['NOUVEAU', 'EN_COURS', 'TRAITE']).optional(),
  newStatus: z.enum(['NOUVEAU', 'EN_COURS', 'TRAITE']).optional(),
  details: z.string().max(5000).optional()
});

export const weeklyReportSchema = z.object({
  id: z.string().min(1).max(120),
  caseNumber: z.union([z.string().max(60), z.number()]).optional(),
  referentId: z.string().max(120).default(''),
  referentName: z.string().max(300).default(''),
  email: z.string().max(320).default(''),
  telephone: z.string().max(100).optional(),
  zone: z.string().max(200).default(''),
  zoneId: z.string().max(120).optional(),
  type: z.enum(['PERIODIQUE', 'PONCTUEL']).optional(),
  sujet: z.string().max(500).optional(),
  priority: z.enum(['NORMAL', 'IMPORTANT', 'URGENT']).optional(),
  semaineLundi: z.string().max(60).default(''),
  nouveauxContactes: z.string().max(10000).optional(),
  situationsPrioritaires: z.string().max(10000).optional(),
  activitesLocales: z.string().max(10000).optional(),
  besoinRetourBureau: z.boolean().default(false),
  detailsDemandeRetour: z.string().max(10000).optional(),
  urgenceLevel: z.number().int().min(1).max(5).default(1),
  status: z.enum(['NOUVEAU', 'EN_COURS', 'TRAITE']),
  bureauNotes: z.string().max(10000).optional(),
  piecesJointes: z.array(reportAttachmentSchema).max(20).optional(),
  responsableId: z.string().max(120).optional(),
  responsableName: z.string().max(300).optional(),
  datePriseEnCharge: z.string().max(60).optional(),
  dateReponse: z.string().max(60).optional(),
  dateTraitement: z.string().max(60).optional(),
  reponses: z.array(reportResponseSchema).max(200).optional(),
  actionHistory: z.array(reportActionLogSchema).max(500).optional(),
  createdAt: z.string().max(60),
  updatedAt: z.string().max(60).optional(),
  lastActivityAt: z.string().max(60).optional(),
  reviewedBy: z.string().max(300).optional(),
  reviewedAt: z.string().max(60).optional()
});

export const weeklyReportsArraySchema = z.array(weeklyReportSchema).max(20000);

export const rencontreSchema = z.object({
  id: z.string().min(1).max(120),
  nom: z.string().min(1).max(300),
  annee: z.number().int().min(2000).max(2100),
  description: z.string().max(5000).default(''),
  messageAccueil: z.string().max(10000).optional(),
  dateDebut: z.string().max(60).default(''),
  dateFin: z.string().max(60).default(''),
  dateAffichage: z.string().max(200).optional(),
  lieu: z.string().max(300).default(''),
  adresse: z.string().max(500).default(''),
  dateLimite: z.string().max(60).default(''),
  dateLimiteAffichage: z.string().max(200).optional(),
  statut: z.enum(['BROUILLON', 'SONDAGE_OUVERT', 'SONDAGE_FERME', 'PREPARATION', 'TERMINEE', 'ARCHIVEE']),
  isDefault: z.boolean().optional(),
  bureauNotes: z.string().max(10000).optional(),
  createdAt: z.string().max(60),
  updatedAt: z.string().max(60).optional()
});

export const rencontresArraySchema = z.array(rencontreSchema).max(500);

export const rencontreResponseSchema = z.object({
  id: z.string().min(1).max(120),
  rencontreId: z.string().min(1).max(120),
  memberId: z.string().max(120).optional(),
  nom: z.string().max(300).default(''),
  prenom: z.string().max(300).default(''),
  email: z.string().max(320).default(''),
  telephone: z.string().max(100).default(''),
  zone: z.string().max(200).default(''),
  referentName: z.string().max(300).optional(),
  ville: z.string().max(200).optional(),
  participation: z.enum(['OUI', 'NON', 'INCERTAIN']),
  dureePresence: z.enum(['TROIS_JOURS', 'WEEK_END']).optional(),
  aideOrganisation: z.boolean().default(false),
  domainesAide: z.array(z.string().max(200)).max(30).optional(),
  autrePrecision: z.string().max(1000).optional(),
  remarques: z.string().max(5000).optional(),
  dateReponse: z.string().max(60).default(''),
  createdAt: z.string().max(60),
  updatedAt: z.string().max(60).optional()
});

export const rencontreResponsesArraySchema = z.array(rencontreResponseSchema).max(20000);

/** Soumission du sondage public : identité minimale exigée. */
export const publicRencontreResponseSchema = rencontreResponseSchema.extend({
  nom: z.string().trim().min(1).max(300),
  telephone: z.string().trim().min(1).max(100)
});

const mandatDocumentSchema = z.object({
  id: z.string().max(120),
  name: z.string().max(500),
  category: z.enum(['COMPTE_RENDU', 'RAPPORT', 'BILAN', 'PROCES_VERBAL', 'PHOTO', 'PRESENTATION', 'FEUILLE_DE_ROUTE', 'PROJET', 'AUTRE']).optional(),
  url: z.string().optional(),               // data-URL possible
  type: z.string().max(200).optional(),
  size: z.number().nonnegative().optional(),
  dateAjout: z.string().max(60),
  description: z.string().max(2000).optional(),
  uploadedBy: z.string().max(300).optional()
});

const mandatRealisationSchema = z.object({
  id: z.string().max(120),
  mandatId: z.string().max(120),
  titre: z.string().max(500),
  description: z.string().max(10000),
  date: z.string().max(60),
  categorie: z.enum(['EVENEMENTS', 'ACTIONS_SOCIALES', 'COMMUNICATION', 'ORGANISATION', 'PARTENARIATS', 'PROJETS_NUMERIQUES', 'FORMATION', 'VIE_ASSOCIATIVE', 'AUTRE']),
  responsable: z.string().max(300),
  responsableId: z.string().max(120).optional(),
  statut: z.enum(['A_FAIRE', 'EN_COURS', 'TERMINE', 'ARCHIVE']),
  documents: z.array(mandatDocumentSchema).max(50).optional(),
  indicateurs: z.string().max(5000).optional(),
  createdAt: z.string().max(60),
  updatedAt: z.string().max(60).optional()
});

const mandatBilanSchema = z.object({
  objectifsInitiaux: z.string().max(20000).optional(),
  objectifsRealises: z.string().max(20000).optional(),
  objectifsNonRealises: z.string().max(20000).optional(),
  principalesRealisations: z.string().max(20000).optional(),
  difficultes: z.string().max(20000).optional(),
  resultats: z.string().max(20000).optional(),
  recommandationsSuivant: z.string().max(20000).optional(),
  dateBilan: z.string().max(60).optional(),
  redigePar: z.string().max(300).optional(),
  documentsBilan: z.array(mandatDocumentSchema).max(50).optional()
});

export const mandatSchema = z.object({
  id: z.string().min(1).max(120),
  intitule: z.string().min(1).max(300),
  dateDebut: z.string().max(60).default(''),
  dateFin: z.string().max(60).default(''),
  description: z.string().max(10000).default(''),
  responsables: z.array(z.string().max(300)).max(50).default([]),
  statut: z.enum(['EN_PREPARATION', 'EN_COURS', 'TERMINE', 'ARCHIVE']),
  realisations: z.array(mandatRealisationSchema).max(500).default([]),
  documents: z.array(mandatDocumentSchema).max(200).default([]),
  bilan: mandatBilanSchema.optional(),
  createdAt: z.string().max(60),
  updatedAt: z.string().max(60).optional()
});

export const mandatsArraySchema = z.array(mandatSchema).max(200);

const documentVersionSchema = z.object({
  id: z.string().max(120),
  version: z.string().max(60),
  date: z.string().max(60).default('')
}).passthrough();

export const usefulDocumentSchema = z.object({
  id: z.string().min(1).max(120),
  name: z.string().min(1).max(500),
  description: z.string().max(5000).default(''),
  category: z.enum(['PRESENTATION', 'OFFICIELS', 'GUIDE_ADHERENT', 'INFOS_PRATIQUES', 'FORMULAIRES', 'AUTRE']),
  customCategoryName: z.string().max(300).optional(),
  fileUrl: z.string().optional(),           // data-URL possible
  fileName: z.string().max(500).default(''),
  fileType: z.string().max(200).default(''),
  fileSize: z.number().nonnegative().optional(),
  version: z.string().max(60).default('1.0'),
  datePublication: z.string().max(60).default(''),
  dateMiseAJour: z.string().max(60).default(''),
  statut: z.enum(['PUBLIE', 'BROUILLON', 'ARCHIVE']),
  ordreAffichage: z.number().int().optional(),
  authorName: z.string().max(300).optional(),
  versionsHistorique: z.array(documentVersionSchema).max(200).optional(),
  tags: z.array(z.string().max(100)).max(50).optional(),
  content: z.string().max(500000).optional()
});

export const usefulDocumentsArraySchema = z.array(usefulDocumentSchema).max(2000);

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
