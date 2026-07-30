import { AppUser, CustomZone } from '../../../shared/types/index';
import { supabaseAdmin } from '../../database/db';
import { zoneFromDb, zoneToDb } from '../../utils/mappers';
import { logger } from '../../utils/logger';

export const zoneService = {
  /** Liste complète, triée par nom (même ordre que les zones par défaut du frontend). */
  async list(): Promise<CustomZone[]> {
    const supabase = supabaseAdmin();
    const { data, error } = await supabase.from('custom_zones').select('*').order('name', { ascending: true });
    if (error) throw new Error(`Lecture des zones: ${error.message}`);
    return (data ?? []).map(zoneFromDb);
  },

  /**
   * Upsert en masse — ne supprime JAMAIS.
   * admin : tout ; referent : uniquement ses zones attribuées (les autres sont
   * ignorées, pas de création de zone) ; user : no-op.
   */
  async bulkUpsert(zones: CustomZone[], actor: AppUser): Promise<void> {
    if (actor.role === 'user') return;

    let allowed = zones;
    if (actor.role === 'referent') {
      const { data: currentRows, error } = await supabaseAdmin().from('custom_zones').select('id, referent_user_id');
      if (error) throw new Error(`Lecture des zones: ${error.message}`);
      const assigned = new Set(actor.assignedZoneIds ?? []);
      const currentIds = new Set((currentRows ?? []).map(r => r.id as string));
      const ownedIds = new Set(
        (currentRows ?? [])
          .filter(r => assigned.has(r.id as string) || r.referent_user_id === actor.id)
          .map(r => r.id as string)
      );
      // Zones existantes de son périmètre uniquement ; pas de création.
      allowed = zones.filter(z => currentIds.has(z.id) && ownedIds.has(z.id));
      if (allowed.length < zones.length) {
        logger.warn(`bulkUpsert zones: ${zones.length - allowed.length} zone(s) hors périmètre référent ignorée(s) (${actor.username})`);
      }
    }

    if (allowed.length === 0) return;
    const { error: upsertError } = await supabaseAdmin()
      .from('custom_zones')
      .upsert(allowed.map(zoneToDb), { onConflict: 'id' });
    if (upsertError) throw new Error(`Upsert des zones: ${upsertError.message}`);
  },

  /** Suppression d'une zone (admin). Les membres ne sont jamais supprimés avec elle. */
  async remove(id: string): Promise<void> {
    const { error } = await supabaseAdmin().from('custom_zones').delete().eq('id', id);
    if (error) throw new Error(`Suppression de la zone: ${error.message}`);
  }
};
