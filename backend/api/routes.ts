import { Router, Request, Response, NextFunction, RequestHandler } from 'express';
import { authRouter } from '../auth/authController';
import { requireAuth, requireRole, isAdminLevel, AuthedRequest } from '../auth/authMiddleware';
import { publicDemandeRateLimiter, publicTrackingRateLimiter } from '../auth/rateLimit';
import { logger } from '../utils/logger';
import { memberService } from '../modules/membres/memberService';
import { demandeService } from '../modules/demandes/demandeService';
import { reportingService } from '../modules/reportings/reportingService';
import { zoneService } from '../modules/zones/zoneService';
import { userService, IncomingAppUser } from '../modules/utilisateurs/userService';
import { auditService } from '../modules/journaux/auditService';
import { excelService } from '../modules/import-export/excelService';
import { settingsService } from '../modules/parametres/settingsService';
import {
  membersArraySchema,
  zonesArraySchema,
  appUsersArraySchema,
  auditLogSchema,
  importLogsArraySchema,
  settingsSchema,
  demandesArraySchema,
  publicDemandeSchema,
  weeklyReportsArraySchema
} from '../utils/validation';
import { AppUser, AuditLog, CustomZone, DemandeMember, Member, WeeklyReport } from '../../shared/types/index';

/** Express 4 ne remonte pas les rejets de promesses : wrapper systématique. */
function asyncHandler(fn: (req: AuthedRequest, res: Response) => Promise<void>): RequestHandler {
  return (req: Request, res: Response, next: NextFunction) => {
    fn(req as AuthedRequest, res).catch(next);
  };
}

function badRequest(res: Response, message: string): void {
  res.status(400).json({ error: message });
}

export const apiRouter = Router();

// --------------------------------------------------------------------------
// Santé & authentification
// --------------------------------------------------------------------------
apiRouter.get('/health', (_req, res) => {
  res.json({ status: 'ok', service: 'Cartographie MDF Backend API', version: '1.0.0 MVP' });
});

apiRouter.use('/auth', authRouter);

// --------------------------------------------------------------------------
// Bootstrap : hydratation complète du frontend en un seul appel
// --------------------------------------------------------------------------
apiRouter.get('/bootstrap', requireAuth, asyncHandler(async (req, res) => {
  const actor = req.appUser as AppUser;
  const isSuper = actor.role === 'super_admin';
  const adminLevel = isAdminLevel(actor.role);

  const [settings, members, zones, demandes, reports, users, importLogs, auditLogs] = await Promise.all([
    settingsService.get(),
    memberService.list(),
    zoneService.list(),
    // Tolérant : si la migration 003_demandes.sql n'a pas encore été exécutée,
    // le reste de l'hydratation doit continuer à fonctionner (demandes: null
    // => le frontend conserve son cache local sans l'écraser).
    demandeService.list().catch((e: Error) => {
      logger.error(`bootstrap demandes indisponibles: ${e.message}`);
      return null;
    }),
    // Reportings hebdomadaires : tout pour les niveaux admin, uniquement les
    // siennes pour un référent. Tolérant tant que 006_weekly_reports.sql
    // n'a pas été exécutée (reports: null => cache local conservé).
    (adminLevel
      ? reportingService.list()
      : actor.role === 'referent'
      ? reportingService.listForReferent(actor)
      : Promise.resolve([] as WeeklyReport[])
    ).catch((e: Error) => {
      logger.error(`bootstrap reportings indisponibles: ${e.message}`);
      return null;
    }),
    // Gestion des utilisateurs : liste complète pour le super admin ; liste
    // MINIMALE (identité/rôle/actif, jamais de secret) pour l'admin, afin de
    // fiabiliser la liaison membre <-> compte (désignation des référents).
    isSuper
      ? userService.list()
      : adminLevel
      ? userService.listMinimal()
      : Promise.resolve([] as AppUser[]),
    adminLevel ? excelService.listImportLogs() : Promise.resolve([]),
    isSuper ? auditService.list() : Promise.resolve([])
  ]);

  res.json({ settings, members, zones, demandes, reports, users, importLogs, auditLogs, currentUser: actor });
}));

// --------------------------------------------------------------------------
// Membres
// --------------------------------------------------------------------------
apiRouter.put('/members', requireAuth, asyncHandler(async (req, res) => {
  const parsed = membersArraySchema.safeParse(req.body);
  if (!parsed.success) return badRequest(res, 'Payload membres invalide.');
  await memberService.bulkUpsert(parsed.data as Member[], req.appUser as AppUser);
  res.status(204).end();
}));

apiRouter.delete('/members/:id', requireAuth, requireRole('admin'), asyncHandler(async (req, res) => {
  await memberService.remove(req.params.id as string);
  res.status(204).end();
}));

// --------------------------------------------------------------------------
// Zones
// --------------------------------------------------------------------------
apiRouter.put('/zones', requireAuth, asyncHandler(async (req, res) => {
  const parsed = zonesArraySchema.safeParse(req.body);
  if (!parsed.success) return badRequest(res, 'Payload zones invalide.');
  await zoneService.bulkUpsert(parsed.data as CustomZone[], req.appUser as AppUser);
  res.status(204).end();
}));

apiRouter.delete('/zones/:id', requireAuth, requireRole('admin'), asyncHandler(async (req, res) => {
  await zoneService.remove(req.params.id as string);
  res.status(204).end();
}));

// --------------------------------------------------------------------------
// Utilisateurs (admin) — les PUT des non-admins sont des no-op silencieux :
// la synchro automatique du frontend peut les déclencher sans intention.
// --------------------------------------------------------------------------
apiRouter.put('/users', requireAuth, asyncHandler(async (req, res) => {
  if ((req.appUser as AppUser).role !== 'super_admin') {
    res.status(204).end();
    return;
  }
  const parsed = appUsersArraySchema.safeParse(req.body);
  if (!parsed.success) return badRequest(res, 'Payload utilisateurs invalide.');
  const errors = await userService.bulkUpsert(parsed.data as IncomingAppUser[]);
  if (errors.length > 0) {
    res.status(207).json({ errors });
    return;
  }
  res.status(204).end();
}));

apiRouter.delete('/users/:id', requireAuth, requireRole('super_admin'), asyncHandler(async (req, res) => {
  const result = await userService.remove(req.params.id as string, req.appUser as AppUser);
  if (result.conflict) {
    res.status(409).json({ error: result.conflict });
    return;
  }
  res.status(204).end();
}));

// --------------------------------------------------------------------------
// Demandes d'adhésion / mise à jour
// --------------------------------------------------------------------------

// Soumission depuis le formulaire public : PAS d'authentification, mais
// rate-limiting par IP et statut forcé à EN_ATTENTE côté service.
apiRouter.post('/public/demandes', publicDemandeRateLimiter, asyncHandler(async (req, res) => {
  const parsed = publicDemandeSchema.safeParse(req.body);
  if (!parsed.success) return badRequest(res, 'Payload demande invalide.');
  // Anti-doublon : une seule demande EN_ATTENTE par e-mail/téléphone.
  if (await demandeService.hasPendingDemande(parsed.data.email, parsed.data.telephone)) {
    res.status(409).json({ error: 'Vous avez déjà envoyé votre demande. Elle est en cours de traitement.' });
    return;
  }
  const created = await demandeService.createPublic(parsed.data as DemandeMember);
  res.status(201).json(created);
}));

// Suivi public d'une demande par son identifiant exact ('dem-...').
apiRouter.get('/public/demandes/:id', publicTrackingRateLimiter, asyncHandler(async (req, res) => {
  const demande = await demandeService.trackById(req.params.id as string);
  if (!demande) {
    res.status(404).json({ error: 'Demande introuvable.' });
    return;
  }
  res.json(demande);
}));

apiRouter.get('/demandes', requireAuth, asyncHandler(async (_req, res) => {
  res.json(await demandeService.list());
}));

apiRouter.put('/demandes', requireAuth, asyncHandler(async (req, res) => {
  const parsed = demandesArraySchema.safeParse(req.body);
  if (!parsed.success) return badRequest(res, 'Payload demandes invalide.');
  await demandeService.bulkUpsert(parsed.data as DemandeMember[], req.appUser as AppUser);
  res.status(204).end();
}));

// --------------------------------------------------------------------------
// Reportings hebdomadaires des référents
// --------------------------------------------------------------------------
apiRouter.get('/reportings', requireAuth, asyncHandler(async (req, res) => {
  const actor = req.appUser as AppUser;
  if (isAdminLevel(actor.role)) {
    res.json(await reportingService.list());
    return;
  }
  if (actor.role === 'referent') {
    res.json(await reportingService.listForReferent(actor));
    return;
  }
  res.json([]);
}));

apiRouter.put('/reportings', requireAuth, asyncHandler(async (req, res) => {
  const parsed = weeklyReportsArraySchema.safeParse(req.body);
  if (!parsed.success) return badRequest(res, 'Payload reportings invalide.');
  await reportingService.bulkUpsert(parsed.data as WeeklyReport[], req.appUser as AppUser);
  res.status(204).end();
}));

apiRouter.delete('/reportings/:id', requireAuth, requireRole('admin'), asyncHandler(async (req, res) => {
  await reportingService.remove(req.params.id as string);
  res.status(204).end();
}));

// --------------------------------------------------------------------------
// Journal d'audit
// --------------------------------------------------------------------------
apiRouter.post('/audit-logs', requireAuth, asyncHandler(async (req, res) => {
  const parsed = auditLogSchema.safeParse(req.body);
  if (!parsed.success) return badRequest(res, 'Payload journal invalide.');
  await auditService.append(parsed.data as AuditLog, req.appUser as AppUser);
  res.status(201).end();
}));

// --------------------------------------------------------------------------
// Historique des imports Excel
// --------------------------------------------------------------------------
apiRouter.put('/import-logs', requireAuth, asyncHandler(async (req, res) => {
  if (!isAdminLevel((req.appUser as AppUser).role)) {
    res.status(204).end();
    return;
  }
  const parsed = importLogsArraySchema.safeParse(req.body);
  if (!parsed.success) return badRequest(res, 'Payload historique d\'imports invalide.');
  await excelService.bulkUpsertImportLogs(parsed.data);
  res.status(204).end();
}));

// --------------------------------------------------------------------------
// Paramètres de l'association
// --------------------------------------------------------------------------
// Paramètres : réservés au super admin (l'admin n'a plus l'onglet Paramètres).
// Exception : lastUpdateDate est un horodatage technique déclenché par les
// actions membres — les admins peuvent le mettre à jour.
apiRouter.put('/settings', requireAuth, asyncHandler(async (req, res) => {
  const role = (req.appUser as AppUser).role;
  if (!isAdminLevel(role)) {
    res.status(204).end();
    return;
  }
  const parsed = settingsSchema.safeParse(req.body);
  if (!parsed.success) return badRequest(res, 'Payload paramètres invalide.');
  const payload = role === 'super_admin' ? parsed.data : { lastUpdateDate: parsed.data.lastUpdateDate };
  await settingsService.update(payload);
  res.status(204).end();
}));
