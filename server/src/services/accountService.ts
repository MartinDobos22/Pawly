import { getSupabase } from '../config/supabase';
import { getAuth } from '../config/firebase';

// Zmaže používateľa z DB (pets a zdravotné záznamy padnú cez ON DELETE CASCADE)
// a následne z Firebase Authentication.
export async function deleteAccount(appUserId: string, firebaseUid: string): Promise<void> {
  const { error } = await getSupabase().from('users').delete().eq('id', appUserId);
  if (error) throw error;
  await getAuth().deleteUser(firebaseUid);
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
