import { AppUser, WeeklyReport } from '../../../shared/types/index';
import { supabaseAdmin } from '../../database/db';
import { reportFromDb, reportToDb } from '../../utils/mappers';
import { logger } from '../../utils/logger';

/** Vrai si le reporting appartient à l'acteur (référent). */
function ownsReport(actor: AppUser, referentId?: string, email?: string): boolean {
  if (referentId && referentId === actor.id) return true;
  const actorEmail = (actor.email || '').trim().toLowerCase();
  return !!actorEmail && (email || '').trim().toLowerCase() === actorEmail;
}

export const reportingService = {
  /** Liste complète (niveaux admin), la plus récente d'abord. */
  async list(): Promise<WeeklyReport[]> {
    const { data, error } = await supabaseAdmin()
      .from('weekly_reports').select('*').order('created_at', { ascending: false });
    if (error) throw new Error(`Lecture des reportings: ${error.message}`);
    return (data ?? []).map(reportFromDb);
  },

  /** Remontées d'un référent uniquement (les siennes, par id de compte ou e-mail). */
  async listForReferent(actor: AppUser): Promise<WeeklyReport[]> {
    const all = await this.list();
    return all.filter((r) => ownsReport(actor, r.referentId, r.email));
  },

  /**
   * Upsert en masse — ne supprime jamais.
   * admin/super_admin : tout (traitement, réponses, statuts) ;
   * referent : uniquement SES remontées — et un id existant appartenant à un
   * autre référent ne peut pas être écrasé ;
   * user : no-op.
   */
  async bulkUpsert(reports: WeeklyReport[], actor: AppUser): Promise<void> {
    if (actor.role === 'user') return;

    let allowed = reports;
    if (actor.role === 'referent') {
      allowed = reports.filter((r) => ownsReport(actor, r.referentId, r.email));

      // Défense contre le détournement d'id : les lignes existantes doivent
      // déjà appartenir au référent.
      if (allowed.length > 0) {
        const { data: existing, error } = await supabaseAdmin()
          .from('weekly_reports')
          .select('id, referent_id, email')
          .in('id', allowed.map((r) => r.id));
        if (error) throw new Error(`Lecture des reportings: ${error.message}`);
        const foreign = new Set(
          (existing ?? [])
            .filter((row) => !ownsReport(actor, row.referent_id as string, row.email as string))
            .map((row) => row.id as string)
        );
        allowed = allowed.filter((r) => !foreign.has(r.id));
      }

      if (allowed.length < reports.length) {
        logger.warn(`bulkUpsert reportings: ${reports.length - allowed.length} remontée(s) hors périmètre référent ignorée(s) (${actor.username})`);
      }
    }

    if (allowed.length === 0) return;
    const { error } = await supabaseAdmin()
      .from('weekly_reports')
      .upsert(allowed.map(reportToDb), { onConflict: 'id' });
    if (error) throw new Error(`Upsert des reportings: ${error.message}`);
  },

  /** Suppression d'un reporting (niveaux admin uniquement — imposé par la route). */
  async remove(id: string): Promise<void> {
    const { error } = await supabaseAdmin().from('weekly_reports').delete().eq('id', id);
    if (error) throw new Error(`Suppression du reporting: ${error.message}`);
  }
};
