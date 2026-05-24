import { getSupabase } from '../config/supabase';
import { httpError } from '../utils/httpError';
import { assertPetOwned, getUserPetIds } from './petOwnership';
import type { EntityMapper } from './healthMappers';

type Row = Record<string, unknown>;

export interface Crud<Dto extends { id: string; dogId: string }> {
  list: (appUserId: string) => Promise<Dto[]>;
  create: (appUserId: string, dto: Partial<Dto>) => Promise<Dto>;
  update: (appUserId: string, id: string, dto: Partial<Dto>) => Promise<Dto>;
  remove: (appUserId: string, id: string) => Promise<void>;
}

export function makeCrud<Dto extends { id: string; dogId: string }>(
  mapper: EntityMapper<Dto>
): Crud<Dto> {
  const supabase = () => getSupabase();

  return {
    async list(appUserId) {
      const petIds = await getUserPetIds(appUserId);
      if (petIds.length === 0) return [];
      const { data, error } = await supabase()
        .from(mapper.table)
        .select('*')
        .in('pet_id', petIds)
        .order('created_at', { ascending: true });
      if (error) throw error;
      return (data as Row[]).map(mapper.toDto);
    },

    async create(appUserId, dto) {
      if (!dto.dogId) throw httpError(400, 'Chýba dogId.', 'INVALID_INPUT');
      await assertPetOwned(appUserId, dto.dogId);
      const row = { ...mapper.toRow(dto), pet_id: dto.dogId };
      const { data, error } = await supabase().from(mapper.table).insert(row).select('*').single();
      if (error) throw error;
      return mapper.toDto(data as Row);
    },

    async update(appUserId, id, dto) {
      const petIds = await getUserPetIds(appUserId);
      if (petIds.length === 0) throw httpError(404, 'Záznam sa nenašiel.', 'NOT_FOUND');
      const { data, error } = await supabase()
        .from(mapper.table)
        .update(mapper.toRow(dto))
        .eq('id', id)
        .in('pet_id', petIds)
        .select('*')
        .maybeSingle();
      if (error) throw error;
      if (!data) throw httpError(404, 'Záznam sa nenašiel.', 'NOT_FOUND');
      return mapper.toDto(data as Row);
    },

    async remove(appUserId, id) {
      const petIds = await getUserPetIds(appUserId);
      if (petIds.length === 0) throw httpError(404, 'Záznam sa nenašiel.', 'NOT_FOUND');
      const { data, error } = await supabase()
        .from(mapper.table)
        .delete()
        .eq('id', id)
        .in('pet_id', petIds)
        .select('id')
        .maybeSingle();
      if (error) throw error;
      if (!data) throw httpError(404, 'Záznam sa nenašiel.', 'NOT_FOUND');
    },
  };
}
