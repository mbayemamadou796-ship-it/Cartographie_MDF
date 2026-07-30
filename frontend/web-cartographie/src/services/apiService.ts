import { Member, AppUser, CustomZone, AuditLog, ImportLog, AppSettings } from '../types';

/**
 * Client HTTP du backend Express + Supabase (couche données uniquement).
 *
 * Principes :
 * - le localStorage reste le cache de démarrage (affichage instantané, mode
 *   offline) : ce client ne fait que synchroniser l'état React vers l'API ;
 * - synchronisation par collection : PUT bulk upsert-only, avec debounce
 *   (500 ms) et snapshot anti-écho (aucun PUT si l'état n'a pas changé depuis
 *   la dernière réponse serveur) ;
 * - les erreurs de synchronisation sont silencieuses (console.warn) pour
 *   préserver le comportement localStorage existant de l'application.
 */

const TOKENS_STORAGE_KEY = 'mbok_de_france_auth_tokens_v1';

const API_URL: string =
  ((import.meta as unknown as { env?: Record<string, string | undefined> }).env?.VITE_API_URL) ??
  'http://localhost:3001';

interface AuthTokens {
  accessToken: string;
  refreshToken: string;
}

export interface BootstrapData {
  settings: AppSettings & { lastUpdateDate?: string };
  members: Member[];
  zones: CustomZone[];
  users: AppUser[];
  importLogs: ImportLog[];
  auditLogs: AuditLog[];
  currentUser: AppUser;
}

export type LoginResult =
  | { status: 'ok'; user: AppUser }
  | { status: 'disabled' }
  | { status: 'invalid' }
  | { status: 'error' };

// ---------------------------------------------------------------------------
// Gestion des tokens (localStorage)
// ---------------------------------------------------------------------------

function loadTokens(): AuthTokens | null {
  try {
    const raw = localStorage.getItem(TOKENS_STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    if (parsed && typeof parsed.accessToken === 'string' && typeof parsed.refreshToken === 'string') {
      return parsed;
    }
  } catch {}
  return null;
}

function saveTokens(tokens: AuthTokens | null): void {
  try {
    if (tokens) {
      localStorage.setItem(TOKENS_STORAGE_KEY, JSON.stringify(tokens));
    } else {
      localStorage.removeItem(TOKENS_STORAGE_KEY);
    }
  } catch {}
}

// ---------------------------------------------------------------------------
// Client HTTP avec rafraîchissement automatique du token (une tentative)
// ---------------------------------------------------------------------------

async function tryRefresh(): Promise<boolean> {
  const tokens = loadTokens();
  if (!tokens) return false;
  try {
    const res = await fetch(`${API_URL}/api/auth/refresh`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ refreshToken: tokens.refreshToken })
    });
    if (!res.ok) {
      saveTokens(null);
      return false;
    }
    const data = await res.json();
    saveTokens({ accessToken: data.accessToken, refreshToken: data.refreshToken });
    return true;
  } catch {
    return false;
  }
}

async function request(path: string, options: { method?: string; body?: unknown } = {}, retrying = false): Promise<Response> {
  const tokens = loadTokens();
  const headers: Record<string, string> = { 'Content-Type': 'application/json' };
  if (tokens) headers.Authorization = `Bearer ${tokens.accessToken}`;

  const res = await fetch(`${API_URL}/api${path}`, {
    method: options.method ?? 'GET',
    headers,
    body: options.body !== undefined ? JSON.stringify(options.body) : undefined
  });

  if (res.status === 401 && !retrying && tokens) {
    const refreshed = await tryRefresh();
    if (refreshed) return request(path, options, true);
  }
  return res;
}

// ---------------------------------------------------------------------------
// Synchronisation par collection : snapshot anti-écho + debounce
// ---------------------------------------------------------------------------

const SYNC_DEBOUNCE_MS = 500;

const snapshots: Record<string, string> = {};
const pendingTimers: Record<string, ReturnType<typeof setTimeout>> = {};
const pendingPayloads: Record<string, unknown> = {};

/**
 * Aucun PUT de synchronisation avant le premier bootstrap réussi : les états
 * initiaux (cache localStorage / données de démo) ne doivent jamais écraser
 * la vérité serveur avant l'hydratation.
 */
let bootstrapped = false;

function scheduleSync(key: string, path: string, payload: unknown): void {
  if (!bootstrapped) return;
  if (!loadTokens()) return; // pas de session API : cache localStorage seulement

  const serialized = JSON.stringify(payload);
  if (snapshots[key] === serialized) return; // aucun changement réel

  pendingPayloads[key] = payload;
  if (pendingTimers[key]) clearTimeout(pendingTimers[key]);

  pendingTimers[key] = setTimeout(async () => {
    delete pendingTimers[key];
    const toSend = pendingPayloads[key];
    delete pendingPayloads[key];
    const body = JSON.stringify(toSend);
    if (snapshots[key] === body) return;
    try {
      const res = await request(path, { method: 'PUT', body: toSend });
      if (res.ok) {
        snapshots[key] = body;
      } else {
        console.warn(`[ApiService] Sync ${key} refusée (${res.status})`);
      }
    } catch (e) {
      console.warn(`[ApiService] Sync ${key} impossible (API hors ligne ?)`, e);
    }
  }, SYNC_DEBOUNCE_MS);
}

// ---------------------------------------------------------------------------
// API publique
// ---------------------------------------------------------------------------

export class ApiService {
  /** Vrai si une session API (tokens) existe. */
  static hasSession(): boolean {
    return loadTokens() !== null;
  }

  static async login(identifier: string, password: string): Promise<LoginResult> {
    try {
      const res = await fetch(`${API_URL}/api/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ identifier, password })
      });
      if (res.ok) {
        const data = await res.json();
        saveTokens({ accessToken: data.accessToken, refreshToken: data.refreshToken });
        return { status: 'ok', user: data.user as AppUser };
      }
      if (res.status === 403) return { status: 'disabled' };
      if (res.status === 401 || res.status === 400) return { status: 'invalid' };
      return { status: 'error' };
    } catch {
      return { status: 'error' };
    }
  }

  static logout(): void {
    request('/auth/logout', { method: 'POST' }).catch(() => {});
    saveTokens(null);
  }

  /**
   * Hydratation complète. Alimente aussi les snapshots anti-écho : les
   * useEffects de persistance déclenchés par l'hydratation ne renverront
   * rien au serveur.
   */
  static async bootstrap(): Promise<BootstrapData> {
    const res = await request('/bootstrap');
    if (!res.ok) throw new Error(`bootstrap: ${res.status}`);
    const data = (await res.json()) as BootstrapData;
    snapshots.members = JSON.stringify(data.members);
    snapshots.zones = JSON.stringify(data.zones);
    snapshots.users = JSON.stringify(data.users);
    snapshots.importLogs = JSON.stringify(data.importLogs);
    bootstrapped = true;
    return data;
  }

  static syncMembers(members: Member[]): void {
    scheduleSync('members', '/members', members);
  }

  /** @deprecated compatibilité avec hooks/useMembers.ts (hook inutilisé) — alias de syncMembers. */
  static async saveMembers(members: Member[]): Promise<void> {
    ApiService.syncMembers(members);
  }

  static syncZones(zones: CustomZone[]): void {
    scheduleSync('zones', '/zones', zones);
  }

  static syncUsers(users: AppUser[]): void {
    scheduleSync('users', '/users', users);
  }

  static syncImportLogs(logs: ImportLog[]): void {
    scheduleSync('importLogs', '/import-logs', logs);
  }

  static deleteMember(id: string): void {
    request(`/members/${encodeURIComponent(id)}`, { method: 'DELETE' }).catch(e =>
      console.warn('[ApiService] deleteMember impossible', e)
    );
  }

  static deleteZone(id: string): void {
    request(`/zones/${encodeURIComponent(id)}`, { method: 'DELETE' }).catch(e =>
      console.warn('[ApiService] deleteZone impossible', e)
    );
  }

  static deleteUser(id: string): void {
    request(`/users/${encodeURIComponent(id)}`, { method: 'DELETE' }).catch(e =>
      console.warn('[ApiService] deleteUser impossible', e)
    );
  }

  static appendAuditLog(log: AuditLog): void {
    request('/audit-logs', { method: 'POST', body: log }).catch(e =>
      console.warn('[ApiService] appendAuditLog impossible', e)
    );
  }

  static saveSettings(partial: Partial<AppSettings> & { lastUpdateDate?: string }): void {
    request('/settings', { method: 'PUT', body: partial }).catch(e =>
      console.warn('[ApiService] saveSettings impossible', e)
    );
  }
}
