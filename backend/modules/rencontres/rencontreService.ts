import { AppUser, Rencontre, RencontreResponse } from '../../../shared/types/index';
import { supabaseAdmin } from '../../database/db';
import { rencontreFromDb, rencontreToDb, rencontreResponseFromDb, rencontreResponseToDb } from '../../utils/mappers';
import { logger } from '../../utils/logger';

/** Id accepté du client public ; tout autre format est remplacé côté serveur. */
const PUBLIC_ID_PATTERN = /^resp-[A-Za-z0-9-]{1,100}$/;

function isAdminLevel(role: string | undefined): boolean {
  return role === 'admin' || role === 'super_admin';
}

export const rencontreService = {
  /** Liste complète des rencontres (bureau), la plus récente d'abord. */
  async listRencontres(): Promise<Rencontre[]> {
    const { data, error } = await supabaseAdmin()
      .from('rencontres').select('*').order('annee', { ascending: false });
    if (error) throw new Error(`Lecture des rencontres: ${error.message}`);
    return (data ?? []).map(rencontreFromDb);
  },

  /**
   * Liste publique pour le sondage web-rencontre : mêmes rencontres mais
   * SANS les notes internes du bureau.
   */
  async listRencontresPublic(): Promise<Rencontre[]> {
    const all = await this.listRencontres();
    return all.map(({ bureauNotes: _bureauNotes, ...rest }) => rest as Rencontre);
  },

  async listResponses(): Promise<RencontreResponse[]> {
    const { data, error } = await supabaseAdmin()
      .from('rencontre_responses').select('*').order('created_at', { ascending: false });
    if (error) throw new Error(`Lecture des réponses au sondage: ${error.message}`);
    return (data ?? []).map(rencontreResponseFromDb);
  },

  /** Upsert en masse des rencontres — niveaux admin uniquement, jamais de suppression. */
  async bulkUpsertRencontres(rencontres: Rencontre[], actor: AppUser): Promise<void> {
    if (!isAdminLevel(actor.role)) return;
    if (rencontres.length === 0) return;
    const { error } = await supabaseAdmin()
      .from('rencontres')
      .upsert(rencontres.map(rencontreToDb), { onConflict: 'id' });
    if (error) throw new Error(`Upsert des rencontres: ${error.message}`);
  },

  /** Upsert en masse des réponses (traitement bureau) — niveaux admin uniquement. */
  async bulkUpsertResponses(responses: RencontreResponse[], actor: AppUser): Promise<void> {
    if (!isAdminLevel(actor.role)) return;
    if (responses.length === 0) return;
    const { error } = await supabaseAdmin()
      .from('rencontre_responses')
      .upsert(responses.map(rencontreResponseToDb), { onConflict: 'id' });
    if (error) throw new Error(`Upsert des réponses au sondage: ${error.message}`);
  },

  /**
   * Vrai si une réponse existe déjà pour cette rencontre et ce membre /
   * e-mail / téléphone (anti-doublon multi-appareils du sondage public).
   */
  async hasExistingResponse(rencontreId: string, memberId?: string, email?: string, telephone?: string): Promise<boolean> {
    const { data, error } = await supabaseAdmin()
      .from('rencontre_responses')
      .select('id, member_id, email, telephone')
      .eq('rencontre_id', rencontreId);
    if (error) throw new Error(`Vérification anti-doublon sondage: ${error.message}`);

    const normEmail = (email || '').trim().toLowerCase();
    const normTel = (telephone || '').replace(/\s/g, '');
    return (data ?? []).some((row) => {
      if (memberId && row.member_id === memberId) return true;
      if (normEmail && ((row.email as string) || '').trim().toLowerCase() === normEmail) return true;
      if (normTel && ((row.telephone as string) || '').replace(/\s/g, '') === normTel) return true;
      return false;
    });
  },

  /**
   * Soumission depuis le sondage public (non authentifié) : insert strict —
   * un id déjà pris ne peut pas écraser la réponse d'un autre membre.
   * Renvoie 'duplicate' si ce membre a déjà répondu à cette rencontre.
   */
  async createPublicResponse(payload: RencontreResponse): Promise<RencontreResponse | 'duplicate'> {
    if (await this.hasExistingResponse(payload.rencontreId, payload.memberId, payload.email, payload.telephone)) {
      return 'duplicate';
    }
    const response: RencontreResponse = {
      ...payload,
      id: PUBLIC_ID_PATTERN.test(payload.id)
        ? payload.id
        : `resp-${Date.now()}-${Math.floor(Math.random() * 100000)}`,
      dateReponse: payload.dateReponse || new Date().toISOString(),
      createdAt: payload.createdAt || new Date().toISOString()
    };
    const { error } = await supabaseAdmin().from('rencontre_responses').insert(rencontreResponseToDb(response));
    if (error) {
      if (error.code === '23505') {
        logger.warn(`createPublicResponse: id déjà existant, soumission ignorée (${response.id})`);
        return response;
      }
      throw new Error(`Enregistrement de la réponse au sondage: ${error.message}`);
    }
    return response;
  },

  /** Suppressions (niveaux admin — imposé par les routes). */
  async removeRencontre(id: string): Promise<void> {
    const supabase = supabaseAdmin();
    const { error: respError } = await supabase.from('rencontre_responses').delete().eq('rencontre_id', id);
    if (respError) throw new Error(`Suppression des réponses de la rencontre: ${respError.message}`);
    const { error } = await supabase.from('rencontres').delete().eq('id', id);
    if (error) throw new Error(`Suppression de la rencontre: ${error.message}`);
  },

  async removeResponse(id: string): Promise<void> {
    const { error } = await supabaseAdmin().from('rencontre_responses').delete().eq('id', id);
    if (error) throw new Error(`Suppression de la réponse: ${error.message}`);
  }
};
