import 'dotenv/config';
import { createClient, SupabaseClient } from '@supabase/supabase-js';

const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_ANON_KEY = process.env.SUPABASE_ANON_KEY;
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

function assertEnv(name: string, value: string | undefined): string {
  if (!value || value.startsWith('https://xxxx') || value === 'eyJ...') {
    throw new Error(
      `Variable d'environnement manquante ou invalide : ${name}. ` +
      `Renseignez le fichier .env à la racine (voir .env.example, section Backend API).`
    );
  }
  return value;
}

let adminClient: SupabaseClient | null = null;
let anonClient: SupabaseClient | null = null;

/**
 * Client service_role : bypass RLS. Réservé au backend — ne jamais exposer
 * cette clé au frontend. Toutes les tables ont RLS activé sans policy,
 * donc seul ce client peut lire/écrire.
 */
export function supabaseAdmin(): SupabaseClient {
  if (!adminClient) {
    adminClient = createClient(
      assertEnv('SUPABASE_URL', SUPABASE_URL),
      assertEnv('SUPABASE_SERVICE_ROLE_KEY', SUPABASE_SERVICE_ROLE_KEY),
      { auth: { persistSession: false, autoRefreshToken: false } }
    );
  }
  return adminClient;
}

/**
 * Client anon : utilisé uniquement pour signInWithPassword / refreshSession
 * (l'authentification passe par l'API GoTrue, pas par les tables).
 */
export function supabaseAnon(): SupabaseClient {
  if (!anonClient) {
    anonClient = createClient(
      assertEnv('SUPABASE_URL', SUPABASE_URL),
      assertEnv('SUPABASE_ANON_KEY', SUPABASE_ANON_KEY),
      { auth: { persistSession: false, autoRefreshToken: false } }
    );
  }
  return anonClient;
}
