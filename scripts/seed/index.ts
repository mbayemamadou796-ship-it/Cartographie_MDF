/**
 * Seed initial de la base Supabase — idempotent (relançable sans dommage).
 *
 * Prérequis :
 *   1. backend/database/migrations/001_init.sql exécuté dans Supabase SQL Editor
 *   2. .env racine renseigné (SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, ...)
 *
 * Usage : npm run seed
 *
 * Crée :
 *   - l'admin racine unique (Supabase Auth + ligne app_users), cf. docs/claude.md
 *   - les 13 zones régionales par défaut
 *   - les 13 membres de démonstration
 */
import 'dotenv/config';
import { supabaseAdmin } from '../../backend/database/db';
import { ROOT_ADMIN, SEED_ROOT_ADMIN_USER, SEED_ZONES, SEED_MEMBERS } from '../../backend/database/seedData';
import { appUserToDb, memberToDb, zoneToDb } from '../../backend/utils/mappers';
import { logger } from '../../backend/utils/logger';

async function findAuthUserIdByEmail(email: string): Promise<string | null> {
  const supabase = supabaseAdmin();
  let page = 1;
  // listUsers est paginé ; la base ne contiendra que quelques comptes.
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

async function seedRootAdmin(): Promise<void> {
  const supabase = supabaseAdmin();

  let authUserId = await findAuthUserIdByEmail(ROOT_ADMIN.email);
  if (authUserId) {
    logger.info(`Admin racine déjà présent dans Supabase Auth (${ROOT_ADMIN.email})`);
  } else {
    const { data, error } = await supabase.auth.admin.createUser({
      email: ROOT_ADMIN.email,
      password: ROOT_ADMIN.password,
      email_confirm: true
    });
    if (error) throw new Error(`Création admin racine (Auth): ${error.message}`);
    authUserId = data.user.id;
    logger.info(`Admin racine créé dans Supabase Auth (${ROOT_ADMIN.email})`);
  }

  const row = appUserToDb({ ...SEED_ROOT_ADMIN_USER }, authUserId);
  const { error: upsertError } = await supabase.from('app_users').upsert(row, { onConflict: 'id' });
  if (upsertError) throw new Error(`Upsert app_users admin racine: ${upsertError.message}`);
  logger.info(`Ligne app_users '${ROOT_ADMIN.appUserId}' (username: ${ROOT_ADMIN.username}) à jour`);
}

async function seedZones(): Promise<void> {
  const supabase = supabaseAdmin();
  const rows = SEED_ZONES.map(zoneToDb);
  const { error } = await supabase.from('custom_zones').upsert(rows, { onConflict: 'id' });
  if (error) throw new Error(`Upsert custom_zones: ${error.message}`);
  logger.info(`${SEED_ZONES.length} zones régionales upsertées`);
}

async function seedMembers(): Promise<void> {
  const supabase = supabaseAdmin();
  const rows = SEED_MEMBERS.map(memberToDb);
  const { error } = await supabase.from('members').upsert(rows, { onConflict: 'id' });
  if (error) throw new Error(`Upsert members: ${error.message}`);
  logger.info(`${SEED_MEMBERS.length} membres de démonstration upsertés`);
}

async function main(): Promise<void> {
  logger.info('--- Seed Cartographie MDF ---');
  await seedRootAdmin();
  await seedZones();
  await seedMembers();
  logger.info('--- Seed terminé avec succès ---');
  logger.info(`Connexion : identifiant "${ROOT_ADMIN.username}" (ou ${ROOT_ADMIN.email})`);
}

main().catch(err => {
  logger.error(err instanceof Error ? err.message : String(err));
  process.exit(1);
});
