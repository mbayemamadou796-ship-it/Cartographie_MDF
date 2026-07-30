import { Router, Request, Response, NextFunction, RequestHandler } from 'express';
import { authRouter } from '../auth/authController';
import { requireAuth, requireRole, AuthedRequest } from '../auth/authMiddleware';
import { memberService } from '../modules/membres/memberService';
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
  settingsSchema
} from '../utils/validation';
import { AppUser, AuditLog, CustomZone, Member } from '../../shared/types/index';

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
  const isAdmin = actor.role === 'admin';

  const [settings, members, zones, users, importLogs, auditLogs] = await Promise.all([
    settingsService.get(),
    memberService.list(),
    zoneService.list(),
    isAdmin ? userService.list() : Promise.resolve([] as AppUser[]),
    isAdmin ? excelService.listImportLogs() : Promise.resolve([]),
    isAdmin ? auditService.list() : Promise.resolve([])
  ]);

  res.json({ settings, members, zones, users, importLogs, auditLogs, currentUser: actor });
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
  if ((req.appUser as AppUser).role !== 'admin') {
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

apiRouter.delete('/users/:id', requireAuth, requireRole('admin'), asyncHandler(async (req, res) => {
  const result = await userService.remove(req.params.id as string, req.appUser as AppUser);
  if (result.conflict) {
    res.status(409).json({ error: result.conflict });
    return;
  }
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
  if ((req.appUser as AppUser).role !== 'admin') {
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
apiRouter.put('/settings', requireAuth, asyncHandler(async (req, res) => {
  if ((req.appUser as AppUser).role !== 'admin') {
    res.status(204).end();
    return;
  }
  const parsed = settingsSchema.safeParse(req.body);
  if (!parsed.success) return badRequest(res, 'Payload paramètres invalide.');
  await settingsService.update(parsed.data);
  res.status(204).end();
}));
