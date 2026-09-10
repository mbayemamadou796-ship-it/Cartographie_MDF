import { AppUser, Mandat, UsefulDocument } from '../../../shared/types/index';
import { supabaseAdmin } from '../../database/db';
import { mandatFromDb, mandatToDb, usefulDocumentFromDb, usefulDocumentToDb } from '../../utils/mappers';

function isAdminLevel(role: string | undefined): boolean {
  return role === 'admin' || role === 'super_admin';
}

/**
 * Archives des mandats & bibliothèque « Documents utiles ».
 * Lecture pour tous les rôles authentifiés ; écriture niveaux admin
 * uniquement — jamais de suppression implicite (upsert-only).
 */
export const mandatService = {
  async listMandats(): Promise<Mandat[]> {
    const { data, error } = await supabaseAdmin()
      .from('mandats').select('*').order('date_debut', { ascending: false });
    if (error) throw new Error(`Lecture des mandats: ${error.message}`);
    return (data ?? []).map(mandatFromDb);
  },

  async bulkUpsertMandats(mandats: Mandat[], actor: AppUser): Promise<void> {
    if (!isAdminLevel(actor.role)) return;
    if (mandats.length === 0) return;
    const { error } = await supabaseAdmin()
      .from('mandats')
      .upsert(mandats.map(mandatToDb), { onConflict: 'id' });
    if (error) throw new Error(`Upsert des mandats: ${error.message}`);
  },

  async removeMandat(id: string): Promise<void> {
    const { error } = await supabaseAdmin().from('mandats').delete().eq('id', id);
    if (error) throw new Error(`Suppression du mandat: ${error.message}`);
  },

  async listDocuments(): Promise<UsefulDocument[]> {
    const { data, error } = await supabaseAdmin()
      .from('useful_documents').select('*').order('ordre_affichage', { ascending: true, nullsFirst: false });
    if (error) throw new Error(`Lecture des documents utiles: ${error.message}`);
    return (data ?? []).map(usefulDocumentFromDb);
  },

  async bulkUpsertDocuments(documents: UsefulDocument[], actor: AppUser): Promise<void> {
    if (!isAdminLevel(actor.role)) return;
    if (documents.length === 0) return;
    const { error } = await supabaseAdmin()
      .from('useful_documents')
      .upsert(documents.map(usefulDocumentToDb), { onConflict: 'id' });
    if (error) throw new Error(`Upsert des documents utiles: ${error.message}`);
  },

  async removeDocument(id: string): Promise<void> {
    const { error } = await supabaseAdmin().from('useful_documents').delete().eq('id', id);
    if (error) throw new Error(`Suppression du document: ${error.message}`);
  }
};
