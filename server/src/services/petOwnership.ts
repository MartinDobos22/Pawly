import { getSupabase } from '../config/supabase';
import { httpError } from '../utils/httpError';

export async function getUserPetIds(appUserId: string): Promise<string[]> {
  const { data, error } = await getSupabase().from('pets').select('id').eq('user_id', appUserId);
  if (error) throw error;
  return (data as { id: string }[]).map((r) => r.id);
}

export async function assertPetOwned(appUserId: string, petId: string): Promise<void> {
  const { data, error } = await getSupabase()
    .from('pets')
    .select('id')
    .eq('user_id', appUserId)
    .eq('id', petId)
    .maybeSingle();
  if (error) throw error;
  if (!data) throw httpError(404, 'Zviera sa nenašlo.', 'NOT_FOUND');
}
