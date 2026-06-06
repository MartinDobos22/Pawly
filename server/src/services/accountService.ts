import { getSupabase } from '../config/supabase';
import { getAuth } from '../config/firebase';
import { logger } from '../utils/logger';

// Poradie zámerne: najprv Firebase, potom Supabase.
//
// 1) Firebase je source-of-truth pre prihlásenie. Ak by Supabase zlyhalo prvé
//    a Firebase potom tiež, mali by sme user-bez-DB stav: user vie loginnúť,
//    ensureUser ho vytvorí znova → orphan reštart. Reverzný poradie tento
//    stav odstraňuje.
// 2) deleteUser je idempotentný — opätovné volanie na už zmazaný uid vyhodí
//    auth/user-not-found, ktoré tolerujeme. Vďaka tomu môže klient
//    bezpečne retry-nuť keď druhý krok zlyhá.
// 3) Ak Supabase delete zlyhá po úspešnom Firebase delete, user už nemôže
//    loginnúť (Firebase je preč) — orphan riadky v Supabase sa dajú vymazať
//    cron jobom alebo manuálne. Z pohľadu používateľa je účet zmazaný.
export async function deleteAccount(appUserId: string, firebaseUid: string): Promise<void> {
  try {
    await getAuth().deleteUser(firebaseUid);
  } catch (err) {
    const code = (err as { code?: string } | null)?.code;
    if (code === 'auth/user-not-found') {
      logger.info('deleteAccount: Firebase user už neexistuje, pokračujem s DB', { firebaseUid });
    } else {
      throw err;
    }
  }

  const { error } = await getSupabase().from('users').delete().eq('id', appUserId);
  if (error) {
    logger.error('deleteAccount: Firebase user zmazaný, Supabase delete zlyhalo', {
      appUserId,
      message: error.message,
    });
    throw error;
  }
}

export async function exportUserData(appUserId: string): Promise<unknown> {
  const { data, error } = await getSupabase().rpc('app_export_user_data', {
    p_app_user_id: appUserId,
  });
  if (error) throw error;
  return data;
}

export interface AuditLogEntry {
  id: number;
  action: 'list' | 'create' | 'update' | 'delete' | 'export';
  table_name: string;
  record_id: string | null;
  pet_id: string | null;
  created_at: string;
}

export async function getAuditLog(appUserId: string, limit = 200): Promise<AuditLogEntry[]> {
  const { data, error } = await getSupabase().rpc('app_get_my_audit_log', {
    p_app_user_id: appUserId,
    p_limit: limit,
  });
  if (error) throw error;
  return (data ?? []) as AuditLogEntry[];
}
