import { AppUser, AuditLog } from '../../../shared/types/index';
import { supabaseAdmin } from '../../database/db';
import { auditLogFromDb, auditLogToDb } from '../../utils/mappers';

const MAX_LOGS_RETURNED = 500;
const AUDIT_TIMEZONE = 'Europe/Paris';

/**
 * Horodatage complet généré CÔTÉ SERVEUR (fuseau Europe/Paris) pour garantir
 * son exactitude — spec Cartographie1.md. Le client peut envoyer ses propres
 * valeurs (affichage optimiste), le serveur les écrase toujours.
 */
function serverTimestamp(): { date: string; time: string; timestamp: string } {
  const now = new Date();
  const date = now.toLocaleDateString('fr-FR', {
    timeZone: AUDIT_TIMEZONE, day: '2-digit', month: '2-digit', year: 'numeric'
  });
  const time = now.toLocaleTimeString('fr-FR', {
    timeZone: AUDIT_TIMEZONE, hour: '2-digit', minute: '2-digit', second: '2-digit'
  });
  return { date, time, timestamp: `${date} ${time.slice(0, 5)}` };
}

export const auditService = {
  /**
   * Ajoute une entrée de journal. L'identité (userId, userName, userRole) et
   * l'horodatage sont FORCÉS côté serveur — jamais depuis le payload client
   * (docs/SECURITE.md : ne jamais faire confiance au frontend).
   */
  async append(log: AuditLog, actor: AppUser): Promise<void> {
    const { date, time, timestamp } = serverTimestamp();
    const secured: AuditLog = {
      ...log,
      timestamp,
      date,
      time,
      userId: actor.id,
      userName: actor.name || `${actor.prenom} ${actor.nom}`.trim() || actor.username,
      userRole: actor.role
    };
    const { error } = await supabaseAdmin()
      .from('audit_logs')
      .upsert(auditLogToDb(secured), { onConflict: 'id', ignoreDuplicates: true });
    if (error) throw new Error(`Écriture du journal d'audit: ${error.message}`);
  },

  /** Journaux les plus récents d'abord (consultation réservée aux admins). */
  async list(): Promise<AuditLog[]> {
    const { data, error } = await supabaseAdmin()
      .from('audit_logs')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(MAX_LOGS_RETURNED);
    if (error) throw new Error(`Lecture des journaux d'audit: ${error.message}`);
    return (data ?? []).map(auditLogFromDb);
  }
};
