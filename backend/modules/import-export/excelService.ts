/**
 * Le parsing Excel et le géocodage restent côté client (frontend figé) :
 * ce service ne gère que la persistance de l'historique des imports.
 */
import { ImportLog } from '../../../shared/types/index';
import { supabaseAdmin } from '../../database/db';
import { importLogFromDb, importLogToDb } from '../../utils/mappers';

export const excelService = {
  /** Historique des imports, le plus récent d'abord. */
  async listImportLogs(): Promise<ImportLog[]> {
    const { data, error } = await supabaseAdmin()
      .from('import_logs')
      .select('*')
      .order('created_at', { ascending: false });
    if (error) throw new Error(`Lecture de l'historique des imports: ${error.message}`);
    return (data ?? []).map(importLogFromDb);
  },

  /** Upsert en masse — ne supprime jamais. */
  async bulkUpsertImportLogs(logs: ImportLog[]): Promise<void> {
    if (logs.length === 0) return;
    const { error } = await supabaseAdmin()
      .from('import_logs')
      .upsert(logs.map(importLogToDb), { onConflict: 'id' });
    if (error) throw new Error(`Upsert de l'historique des imports: ${error.message}`);
  }
};
