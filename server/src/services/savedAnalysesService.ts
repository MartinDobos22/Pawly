import { getSupabase } from '../config/supabase';
import { httpError } from '../utils/httpError';
import { assertPetOwned } from './petOwnership';
import type { AnalysisResult, SavedAnalysis } from '../types';

type Row = Record<string, unknown>;

function toDto(r: Row): SavedAnalysis {
  return {
    id: String(r.id),
    date: r.date == null ? '' : String(r.date),
    composition: r.composition == null ? '' : String(r.composition),
    sourceLabel: r.source_label == null ? undefined : String(r.source_label),
    result: r.result as AnalysisResult,
    petProfileId: r.pet_id == null ? undefined : String(r.pet_id),
    petProfileName: r.pet_profile_name == null ? undefined : String(r.pet_profile_name),
  };
}

export async function listSavedAnalyses(appUserId: string): Promise<SavedAnalysis[]> {
  const { data, error } = await getSupabase()
    .from('saved_analyses')
    .select('*')
    .eq('user_id', appUserId)
    .order('created_at', { ascending: false });
  if (error) throw error;
  return (data as Row[]).map(toDto);
}

export async function createSavedAnalysis(
  appUserId: string,
  dto: Partial<SavedAnalysis>
): Promise<SavedAnalysis> {
  if (!dto.result) throw httpError(400, 'Chýba výsledok analýzy.', 'INVALID_INPUT');
  if (dto.petProfileId) await assertPetOwned(appUserId, dto.petProfileId);

  const row = {
    user_id: appUserId,
    pet_id: dto.petProfileId ?? null,
    date: dto.date ?? null,
    composition: dto.composition ?? null,
    source_label: dto.sourceLabel ?? null,
    result: dto.result,
    pet_profile_name: dto.petProfileName ?? null,
  };
  const { data, error } = await getSupabase()
    .from('saved_analyses')
    .insert(row)
    .select('*')
    .single();
  if (error) throw error;
  return toDto(data as Row);
}

export async function removeSavedAnalysis(appUserId: string, id: string): Promise<void> {
  const { data, error } = await getSupabase()
    .from('saved_analyses')
    .delete()
    .eq('id', id)
    .eq('user_id', appUserId)
    .select('id')
    .maybeSingle();
  if (error) throw error;
  if (!data) throw httpError(404, 'Záznam sa nenašiel.', 'NOT_FOUND');
}

export async function clearSavedAnalyses(appUserId: string): Promise<void> {
  const { error } = await getSupabase().from('saved_analyses').delete().eq('user_id', appUserId);
  if (error) throw error;
}
