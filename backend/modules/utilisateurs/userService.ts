import { randomUUID } from 'node:crypto';
import { AppUser } from '../../../shared/types/index';
import { supabaseAdmin } from '../../database/db';
import { appUserFromDb, appUserToDb } from '../../utils/mappers';
import { logger } from '../../utils/logger';

/** AppUser entrant depuis l'UI : peut transporter un mot de passe (write-only). */
export type IncomingAppUser = AppUser & { password?: string };

async function findAuthUserIdByEmail(email: string): Promise<string | null> {
  const supabase = supabaseAdmin();
  let page = 1;
  for (;;) {
    const { data, error } = await supabase.auth.admin.listUsers({ page, perPage: 200 });
    if (error) throw new Error(`listUsers: ${error.message}`);
    const users = data.users as Array<{ id: string; email?: string | null }>;
    const found = users.find(u => (u.email ?? '').toLowerCase() === email.toLowerCase());
    if (found) return found.id;
    if (users.length < 200) return null;
    page += 1;
  }
}

/**
 * Garantit l'existence d'un compte Supabase Auth pour cet email et applique
 * le mot de passe fourni. Retourne l'auth_user_id.
 * Sans mot de passe fourni pour un nouveau compte, un mot de passe aléatoire
 * est généré : le compte ne pourra pas se connecter tant qu'un administrateur
 * n'aura pas défini un mot de passe (comportement volontaire).
 */
async function ensureAuthUser(email: string, password: string | undefined, existingAuthUserId: string | null): Promise<string> {
  const supabase = supabaseAdmin();

  let authUserId = existingAuthUserId ?? (await findAuthUserIdByEmail(email));
  if (!authUserId) {
    const { data, error } = await supabase.auth.admin.createUser({
      email,
      password: password || `${randomUUID()}Aa1!`,
      email_confirm: true
    });
    if (error) throw new Error(`Création du compte Auth (${email}): ${error.message}`);
    return data.user.id;
  }

  const updates: { email?: string; password?: string } = {};
  const { data: current } = await supabase.auth.admin.getUserById(authUserId);
  if (current?.user && (current.user.email ?? '').toLowerCase() !== email.toLowerCase()) {
    updates.email = email;
  }
  if (password) updates.password = password;
  if (Object.keys(updates).length > 0) {
    const { error } = await supabase.auth.admin.updateUserById(authUserId, updates);
    if (error) throw new Error(`Mise à jour du compte Auth (${email}): ${error.message}`);
  }
  return authUserId;
}

export const userService = {
  /** Liste complète — le mot de passe n'existe pas en base, jamais renvoyé. */
  async list(): Promise<AppUser[]> {
    const supabase = supabaseAdmin();
    const { data, error } = await supabase
      .from('app_users')
      .select('*')
      .order('created_at', { ascending: true });
    if (error) throw new Error(`Lecture des utilisateurs: ${error.message}`);
    return (data ?? []).map(appUserFromDb);
  },

  /**
   * Upsert en masse (admin uniquement — imposé par la route).
   * Les mots de passe entrants sont routés vers l'Auth Admin API de Supabase,
   * jamais stockés dans app_users. Chaque utilisateur est traité isolément :
   * une erreur sur l'un n'empêche pas les autres.
   */
  async bulkUpsert(users: IncomingAppUser[]): Promise<string[]> {
    const supabase = supabaseAdmin();
    const errors: string[] = [];

    const { data: currentRows, error } = await supabase.from('app_users').select('id, auth_user_id, email');
    if (error) throw new Error(`Lecture des utilisateurs: ${error.message}`);
    const currentById = new Map((currentRows ?? []).map(r => [r.id as string, r]));

    for (const incoming of users) {
      try {
        const { password, ...user } = incoming;
        const existing = currentById.get(user.id);
        const authUserId = await ensureAuthUser(
          user.email,
          password,
          (existing?.auth_user_id as string | null) ?? null
        );
        const { error: upsertError } = await supabase
          .from('app_users')
          .upsert(appUserToDb(user, authUserId), { onConflict: 'id' });
        if (upsertError) throw new Error(upsertError.message);
      } catch (e) {
        const msg = `Utilisateur ${incoming.username || incoming.id}: ${e instanceof Error ? e.message : String(e)}`;
        errors.push(msg);
        logger.warn(`bulkUpsert users: ${msg}`);
      }
    }
    return errors;
  },

  /**
   * Suppression (admin). Interdictions : se supprimer soi-même, supprimer le
   * dernier administrateur actif. Supprime aussi le compte Supabase Auth lié.
   */
  async remove(id: string, actor: AppUser): Promise<{ conflict?: string }> {
    if (id === actor.id) {
      return { conflict: 'Impossible de supprimer votre propre compte.' };
    }
    const supabase = supabaseAdmin();
    const { data: rows, error } = await supabase.from('app_users').select('*');
    if (error) throw new Error(`Lecture des utilisateurs: ${error.message}`);

    const target = (rows ?? []).find(r => r.id === id);
    if (!target) return {};

    const adminRoles = ['admin', 'super_admin'];
    const remainingAdmins = (rows ?? []).filter(r => r.id !== id && adminRoles.includes(r.role as string) && r.active !== false);
    if (adminRoles.includes(target.role as string) && remainingAdmins.length === 0) {
      return { conflict: 'Impossible de supprimer le dernier administrateur.' };
    }
    // Un super admin ne peut être supprimé que par un autre super admin.
    if (target.role === 'super_admin' && actor.role !== 'super_admin') {
      return { conflict: 'Seul un super administrateur peut supprimer un super administrateur.' };
    }

    const { error: delError } = await supabase.from('app_users').delete().eq('id', id);
    if (delError) throw new Error(`Suppression de l'utilisateur: ${delError.message}`);

    if (target.auth_user_id) {
      const { error: authError } = await supabase.auth.admin.deleteUser(target.auth_user_id as string);
      if (authError) logger.warn(`Suppression du compte Auth ${target.auth_user_id}: ${authError.message}`);
    }
    return {};
  }
};
