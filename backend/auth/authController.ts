import { Router, Response } from 'express';
import { supabaseAdmin, supabaseAnon } from '../database/db';
import { appUserFromDb } from '../utils/mappers';
import { loginSchema, refreshSchema } from '../utils/validation';
import { requireAuth, AuthedRequest } from './authMiddleware';
import { loginRateLimiter } from './rateLimit';
import { logger } from '../utils/logger';

export const authRouter = Router();

function nowLoginLabel(): string {
  const time = new Date().toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' });
  return `Aujourd'hui ${time}`;
}

/**
 * POST /api/auth/login — { identifier, password }
 * identifier = username OU email. La résolution username -> email passe par
 * app_users, puis l'authentification est déléguée à Supabase Auth.
 */
authRouter.post('/login', loginRateLimiter, async (req, res: Response) => {
  const parsed = loginSchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: 'Identifiant et mot de passe requis.' });
    return;
  }
  const { identifier, password } = parsed.data;
  const supabase = supabaseAdmin();

  const { data: rows, error: lookupError } = await supabase
    .from('app_users')
    .select('*')
    .or(`username.ilike.${identifier},email.ilike.${identifier}`)
    .limit(1);
  if (lookupError) {
    logger.error(`login lookup: ${lookupError.message}`);
    res.status(500).json({ error: 'Erreur interne.' });
    return;
  }
  if (!rows || rows.length === 0) {
    res.status(401).json({ error: 'Identifiant ou mot de passe incorrect.' });
    return;
  }

  const row = rows[0];
  const appUser = appUserFromDb(row);
  if (!appUser.active) {
    res.status(403).json({ error: 'Compte désactivé.', reason: 'disabled' });
    return;
  }

  const { data: session, error: signInError } = await supabaseAnon().auth.signInWithPassword({
    email: appUser.email,
    password
  });
  if (signInError || !session.session) {
    res.status(401).json({ error: 'Identifiant ou mot de passe incorrect.' });
    return;
  }

  // Backfill du lien auth_user_id si absent + mise à jour de last_login
  const lastLogin = nowLoginLabel();
  const updates: Record<string, unknown> = { last_login: lastLogin };
  if (!row.auth_user_id) updates.auth_user_id = session.session.user.id;
  await supabase.from('app_users').update(updates).eq('id', appUser.id);

  res.json({
    user: { ...appUser, lastLogin },
    accessToken: session.session.access_token,
    refreshToken: session.session.refresh_token
  });
});

/**
 * POST /api/auth/refresh — { refreshToken }
 */
authRouter.post('/refresh', async (req, res: Response) => {
  const parsed = refreshSchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: 'refreshToken requis.' });
    return;
  }
  const { data, error } = await supabaseAnon().auth.refreshSession({
    refresh_token: parsed.data.refreshToken
  });
  if (error || !data.session) {
    res.status(401).json({ error: 'Session expirée, reconnexion nécessaire.' });
    return;
  }
  res.json({
    accessToken: data.session.access_token,
    refreshToken: data.session.refresh_token
  });
});

/**
 * POST /api/auth/logout — révoque la session Supabase du token présenté.
 */
authRouter.post('/logout', requireAuth, async (req: AuthedRequest, res: Response) => {
  const header = req.headers.authorization ?? '';
  const token = header.startsWith('Bearer ') ? header.slice(7) : '';
  try {
    await supabaseAdmin().auth.admin.signOut(token);
  } catch {
    // Révocation best-effort : la session expirera d'elle-même.
  }
  res.status(204).end();
});
