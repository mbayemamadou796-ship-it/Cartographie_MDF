import { AppUser, DemandeMember } from '../../../shared/types/index';
import { supabaseAdmin } from '../../database/db';
import { demandeFromDb, demandeToDb } from '../../utils/mappers';
import { logger } from '../../utils/logger';

/** Id accepté du client public ; tout autre format est remplacé côté serveur. */
const PUBLIC_ID_PATTERN = /^dem-[A-Za-z0-9-]{1,100}$/;

export const demandeService = {
  /** Liste complète, la plus récente d'abord (même ordre que le frontend). */
  async list(): Promise<DemandeMember[]> {
    const supabase = supabaseAdmin();
    const { data, error } = await supabase.from('demandes').select('*').order('created_at', { ascending: false });
    if (error) throw new Error(`Lecture des demandes: ${error.message}`);
    return (data ?? []).map(demandeFromDb);
  },

  /**
   * Suivi public par identifiant exact ('dem-...') : renvoie uniquement les
   * champs utiles au suivi — jamais la photo ni les champs personnalisés.
   */
  async trackById(id: string): Promise<Partial<DemandeMember> | null> {
    const { data, error } = await supabaseAdmin().from('demandes').select('*').eq('id', id).maybeSingle();
    if (error) throw new Error(`Suivi de la demande: ${error.message}`);
    if (!data) return null;
    const d = demandeFromDb(data);
    return {
      id: d.id,
      type: d.type,
      status: d.status,
      createdAt: d.createdAt,
      updatedAt: d.updatedAt,
      validatedAt: d.validatedAt,
      rejectionReason: d.rejectionReason,
      nom: d.nom,
      prenom: d.prenom,
      email: d.email,
      telephone: d.telephone,
      ville: d.ville
    };
  },

  /**
   * Création depuis le formulaire public (non authentifié) : le statut et les
   * champs de validation sont forcés — seul un admin peut les faire évoluer
   * ensuite via bulkUpsert. Renvoie la demande telle qu'enregistrée.
   */
  async createPublic(payload: Omit<DemandeMember, 'status'> & { status?: string }): Promise<DemandeMember> {
    const demande: DemandeMember = {
      ...(payload as DemandeMember),
      id: PUBLIC_ID_PATTERN.test(payload.id)
        ? payload.id
        : `dem-${Date.now()}-${Math.floor(Math.random() * 100000)}`,
      status: 'EN_ATTENTE',
      createdAt: payload.createdAt || new Date().toISOString(),
      updatedAt: undefined,
      validatedAt: undefined,
      validatedBy: undefined,
      rejectionReason: undefined
    };

    // Insert (pas d'upsert) : un id déjà pris ne doit pas permettre d'écraser
    // une demande existante depuis l'endpoint public.
    const { error } = await supabaseAdmin().from('demandes').insert(demandeToDb(demande));
    if (error) {
      if (error.code === '23505') {
        // Collision d'id (re-soumission du même formulaire) : idempotent.
        logger.warn(`createPublic demande: id déjà existant, soumission ignorée (${demande.id})`);
        return demande;
      }
      throw new Error(`Création de la demande: ${error.message}`);
    }
    return demande;
  },

  /**
   * Upsert en masse depuis l'espace bureau — ne supprime jamais.
   * admin uniquement ; les autres rôles sont des no-op silencieux (la synchro
   * automatique du frontend peut les déclencher sans intention).
   */
  async bulkUpsert(demandes: DemandeMember[], actor: AppUser): Promise<void> {
    if (actor.role !== 'admin' && actor.role !== 'super_admin') return;
    if (demandes.length === 0) return;
    const { error } = await supabaseAdmin()
      .from('demandes')
      .upsert(demandes.map(demandeToDb), { onConflict: 'id' });
    if (error) throw new Error(`Upsert des demandes: ${error.message}`);
  }
};
