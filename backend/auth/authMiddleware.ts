import { Request, Response, NextFunction } from 'express';
import { AppUser, UserRole } from '../../shared/types/index';
import { supabaseAdmin } from '../database/db';
import { appUserFromDb } from '../utils/mappers';

export interface AuthedRequest extends Request {
  appUser?: AppUser;
}

/**
 * Vérifie le JWT Supabase (header Authorization: Bearer <token>) puis charge
 * le profil applicatif app_users correspondant dans req.appUser.
 * 401 : token absent/invalide — 403 : compte désactivé.
 */
export async function requireAuth(req: AuthedRequest, res: Response, next: NextFunction): Promise<void> {
  const header = req.headers.authorization ?? '';
  const token = header.startsWith('Bearer ') ? header.slice(7) : null;
  if (!token) {
    res.status(401).json({ error: 'Authentification requise.' });
    return;
  }

  try {
    const supabase = supabaseAdmin();
    const { data, error } = await supabase.auth.getUser(token);
    if (error || !data.user) {
      res.status(401).json({ error: 'Session invalide ou expirée.' });
      return;
    }

    const { data: rows, error: dbError } = await supabase
      .from('app_users')
      .select('*')
      .eq('auth_user_id', data.user.id)
      .limit(1);
    if (dbError) {
      res.status(500).json({ error: 'Erreur interne lors du chargement du profil.' });
      return;
    }
    if (!rows || rows.length === 0) {
      res.status(401).json({ error: 'Aucun profil applicatif associé à ce compte.' });
      return;
    }

    const appUser = appUserFromDb(rows[0]);
    if (!appUser.active) {
      res.status(403).json({ error: 'Compte désactivé.', reason: 'disabled' });
      return;
    }

    req.appUser = appUser;
    next();
  } catch {
    res.status(401).json({ error: 'Session invalide ou expirée.' });
  }
}

/**
 * Restreint la route aux rôles listés. Toujours placé APRÈS requireAuth.
 */
export function requireRole(...roles: UserRole[]) {
  return (req: AuthedRequest, res: Response, next: NextFunction): void => {
    if (!req.appUser || !roles.includes(req.appUser.role)) {
      res.status(403).json({ error: 'Accès refusé : privilèges insuffisants.' });
      return;
    }
    next();
  };
}
