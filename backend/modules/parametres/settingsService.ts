import { supabaseAdmin } from '../../database/db';
import { settingsFromDb, settingsToDb, SettingsPayload } from '../../utils/mappers';
import { AppSettings } from '../../../shared/types/index';

/** Paramètres de l'association — ligne unique id = 1 (créée par la migration). */
export const settingsService = {
  async get(): Promise<AppSettings & { lastUpdateDate?: string }> {
    const { data, error } = await supabaseAdmin().from('app_settings').select('*').eq('id', 1).single();
    if (error) throw new Error(`Lecture des paramètres: ${error.message}`);
    return settingsFromDb(data);
  },

  async update(partial: SettingsPayload): Promise<void> {
    const row = settingsToDb(partial);
    if (Object.keys(row).length === 0) return;
    const { error } = await supabaseAdmin().from('app_settings').update(row).eq('id', 1);
    if (error) throw new Error(`Mise à jour des paramètres: ${error.message}`);
  }
};
