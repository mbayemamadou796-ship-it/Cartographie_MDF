import { AppUser, AuditLog } from '../../../shared/types/index';
import { supabaseAdmin } from '../../database/db';
import { auditLogFromDb, auditLogToDb } from '../../utils/mappers';

const MAX_LOGS_RETURNED = 500;

export const auditService = {
  /**
   * Ajoute une entrée de journal. L'identité (userId, userName, userRole) est
   * FORCÉE depuis le token de l'utilisateur authentifié — jamais depuis le
   * payload client (docs/SECURITE.md : ne jamais faire confiance au frontend).
   */
  async append(log: AuditLog, actor: AppUser): Promise<void> {
    const secured: AuditLog = {
      ...log,
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
