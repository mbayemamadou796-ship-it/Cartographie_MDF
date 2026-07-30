import { AppUser, Member } from '../../../shared/types/index';
import { supabaseAdmin } from '../../database/db';
import { memberFromDb, memberToDb } from '../../utils/mappers';
import { logger } from '../../utils/logger';

/**
 * Périmètre d'un référent : zones qui lui sont attribuées (assignedZoneIds ou
 * referent_user_id) + correspondance de nom zone/région (même logique floue
 * que scopedMembers dans le frontend).
 */
async function getReferentScope(user: AppUser): Promise<{ zoneNames: string[]; memberIds: Set<string> }> {
  const supabase = supabaseAdmin();
  const { data: zones, error } = await supabase.from('custom_zones').select('id, name, member_ids, referent_user_id');
  if (error) throw new Error(`Lecture des zones: ${error.message}`);

  const assigned = new Set(user.assignedZoneIds ?? []);
  const scoped = (zones ?? []).filter(z => assigned.has(z.id as string) || z.referent_user_id === user.id);

  const zoneNames = scoped.map(z => (z.name as string) ?? '').filter(Boolean);
  if (user.region) zoneNames.push(user.region);

  const memberIds = new Set<string>();
  for (const z of scoped) {
    for (const id of (z.member_ids as string[]) ?? []) memberIds.add(id);
  }
  return { zoneNames, memberIds };
}

function nameMatches(value: string | undefined, zoneNames: string[]): boolean {
  if (!value) return false;
  const v = value.trim().toLowerCase();
  return zoneNames.some(n => {
    const zn = n.trim().toLowerCase();
    return zn === v || zn.includes(v) || v.includes(zn);
  });
}

function inScope(member: Member, zoneNames: string[], memberIds: Set<string>): boolean {
  return memberIds.has(member.id) || nameMatches(member.zone, zoneNames) || nameMatches(member.region, zoneNames);
}

export const memberService = {
  /** Liste complète, membres récents d'abord (le seed garde son ordre via l'id). */
  async list(): Promise<Member[]> {
    const supabase = supabaseAdmin();
    const { data, error } = await supabase
      .from('members')
      .select('*')
      .order('created_at', { ascending: false })
      .order('id', { ascending: true });
    if (error) throw new Error(`Lecture des membres: ${error.message}`);
    return (data ?? []).map(memberFromDb);
  },

  /**
   * Upsert en masse — ne supprime JAMAIS (les suppressions passent par remove).
   * admin : tout ; referent : uniquement les membres de son périmètre (les
   * autres lignes sont ignorées silencieusement) ; user : no-op.
   */
  async bulkUpsert(members: Member[], actor: AppUser): Promise<void> {
    if (actor.role === 'user') return;

    let allowed = members;
    if (actor.role === 'referent') {
      const { zoneNames, memberIds } = await getReferentScope(actor);
      const { data: currentRows, error } = await supabaseAdmin().from('members').select('*');
      if (error) throw new Error(`Lecture des membres: ${error.message}`);
      const currentById = new Map((currentRows ?? []).map(r => [r.id as string, memberFromDb(r)]));

      allowed = members.filter(m => {
        const current = currentById.get(m.id);
        // Membre existant : autorisé si son état ACTUEL est dans le périmètre.
        // Nouveau membre : autorisé si l'état entrant est dans le périmètre.
        return current
          ? inScope(current, zoneNames, memberIds)
          : inScope(m, zoneNames, memberIds);
      });
      if (allowed.length < members.length) {
        logger.warn(`bulkUpsert members: ${members.length - allowed.length} ligne(s) hors périmètre référent ignorée(s) (${actor.username})`);
      }
    }

    if (allowed.length === 0) return;
    const { error: upsertError } = await supabaseAdmin()
      .from('members')
      .upsert(allowed.map(memberToDb), { onConflict: 'id' });
    if (upsertError) throw new Error(`Upsert des membres: ${upsertError.message}`);
  },

  /** Suppression (admin) + retrait de l'id dans les member_ids de toutes les zones. */
  async remove(id: string): Promise<void> {
    const supabase = supabaseAdmin();
    const { error } = await supabase.from('members').delete().eq('id', id);
    if (error) throw new Error(`Suppression du membre: ${error.message}`);

    const { data: zones, error: zonesError } = await supabase
      .from('custom_zones')
      .select('id, member_ids')
      .contains('member_ids', [id]);
    if (zonesError) throw new Error(`Lecture des zones: ${zonesError.message}`);

    for (const z of zones ?? []) {
      const cleaned = ((z.member_ids as string[]) ?? []).filter(mid => mid !== id);
      const { error: updError } = await supabase.from('custom_zones').update({ member_ids: cleaned }).eq('id', z.id);
      if (updError) throw new Error(`Nettoyage de la zone ${z.id}: ${updError.message}`);
    }
  }
};
