import { getSupabase } from '../config/supabase';
import { httpError } from '../utils/httpError';
import { getUserPetIds } from './petOwnership';

// Zmaže liek (DB cascade odstráni jeho dose-logy) a vyčistí jeho id
// z poľa medication_ids v návštevách daného používateľa.
export async function removeMedicationCascade(appUserId: string, id: string): Promise<void> {
  const supabase = getSupabase();
  const petIds = await getUserPetIds(appUserId);
  if (petIds.length === 0) throw httpError(404, 'Záznam sa nenašiel.', 'NOT_FOUND');

  const { data: deleted, error: delError } = await supabase
    .from('medications')
    .delete()
    .eq('id', id)
    .in('pet_id', petIds)
    .select('id')
    .maybeSingle();
  if (delError) throw delError;
  if (!deleted) throw httpError(404, 'Záznam sa nenašiel.', 'NOT_FOUND');

  const { data: visits, error: visitsError } = await supabase
    .from('vet_visits')
    .select('id, medication_ids')
    .in('pet_id', petIds)
    .contains('medication_ids', [id]);
  if (visitsError) throw visitsError;

  for (const visit of (visits as { id: string; medication_ids: string[] }[]) ?? []) {
    const next = (visit.medication_ids ?? []).filter((mid) => mid !== id);
    const { error: updateError } = await supabase
      .from('vet_visits')
      .update({ medication_ids: next })
      .eq('id', visit.id);
    if (updateError) throw updateError;
  }
}
