import { getSupabase } from '../config/supabase';
import { httpError } from '../utils/httpError';
import type { EntityMapper } from './healthMappers';

type Row = Record<string, unknown>;

export interface Crud<Dto extends { id: string; petId: string }> {
  list: (appUserId: string) => Promise<Dto[]>;
  create: (appUserId: string, dto: Partial<Dto>) => Promise<Dto>;
  update: (appUserId: string, id: string, dto: Partial<Dto>) => Promise<Dto>;
  remove: (appUserId: string, id: string) => Promise<void>;
}

export function makeCrud<Dto extends { id: string; petId: string }>(
  mapper: EntityMapper<Dto>
): Crud<Dto> {
  const supabase = () => getSupabase();

  return {
    async list(appUserId) {
      const { data, error } = await supabase().rpc('app_list_health_rows', {
        p_app_user_id: appUserId,
        p_table: mapper.table,
      });
      if (error) throw error;
      return ((data as Row[] | null) ?? []).map(mapper.toDto);
    },

    async create(appUserId, dto) {
      if (!dto.petId) throw httpError(400, 'Chýba petId.', 'INVALID_INPUT');
      const row = { ...mapper.toRow(dto), pet_id: dto.petId };
      const { data, error } = await supabase().rpc('app_create_health_row', {
        p_app_user_id: appUserId,
        p_table: mapper.table,
        p_payload: row,
      });
      if (error) throw error;
      return mapper.toDto(data as Row);
    },

    async update(appUserId, id, dto) {
      const payload = mapper.toRow(dto);
      const { data, error } = await supabase().rpc('app_update_health_row', {
        p_app_user_id: appUserId,
        p_table: mapper.table,
        p_record_id: id,
        p_payload: payload,
      });
      if (error) throw error;
      if (!data) throw httpError(404, 'Záznam sa nenašiel.', 'NOT_FOUND');
      return mapper.toDto(data as Row);
    },

    async remove(appUserId, id) {
      const { data, error } = await supabase().rpc('app_delete_health_row', {
        p_app_user_id: appUserId,
        p_table: mapper.table,
        p_record_id: id,
      });
      if (error) throw error;
      if (!data) throw httpError(404, 'Záznam sa nenašiel.', 'NOT_FOUND');
    },
  };
}
