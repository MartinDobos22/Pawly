import { getSupabase } from '../config/supabase';
import { getAuth } from '../config/firebase';

// Zmaže používateľa z DB (pets a zdravotné záznamy padnú cez ON DELETE CASCADE)
// a následne z Firebase Authentication.
export async function deleteAccount(appUserId: string, firebaseUid: string): Promise<void> {
  const { error } = await getSupabase().from('users').delete().eq('id', appUserId);
  if (error) throw error;
  await getAuth().deleteUser(firebaseUid);
}
