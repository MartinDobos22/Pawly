import { useCallback, useMemo } from 'react';
import { useHealthData } from './useHealthData';
import type { HealthEpisodeRecord } from '../types/healthEpisode';

export interface UseHealthEpisodesApi {
  episodes: HealthEpisodeRecord[];
  byDog: (dogId: string) => HealthEpisodeRecord[];
  getById: (id: string) => HealthEpisodeRecord | undefined;
  add: (
    payload: Omit<HealthEpisodeRecord, 'id' | 'createdAt' | 'updatedAt'>
  ) => Promise<HealthEpisodeRecord>;
  update: (
    id: string,
    payload: Partial<Omit<HealthEpisodeRecord, 'id' | 'createdAt'>>
  ) => Promise<void>;
  remove: (id: string) => Promise<void>;
}

export function useHealthEpisodes(): UseHealthEpisodesApi {
  const { episodes, addEpisode, updateEpisode, removeEpisode } = useHealthData();

  const byDog = useCallback(
    (dogId: string) => episodes.filter((e) => e.dogId === dogId),
    [episodes]
  );

  const getById = useCallback((id: string) => episodes.find((e) => e.id === id), [episodes]);

  const add: UseHealthEpisodesApi['add'] = useCallback(
    (payload) => addEpisode(payload as Partial<HealthEpisodeRecord>),
    [addEpisode]
  );

  const update: UseHealthEpisodesApi['update'] = useCallback(
    async (id, payload) => {
      await updateEpisode(id, payload as Partial<HealthEpisodeRecord>);
    },
    [updateEpisode]
  );

  const remove: UseHealthEpisodesApi['remove'] = useCallback(
    (id) => removeEpisode(id),
    [removeEpisode]
  );

  return useMemo(
    () => ({ episodes, byDog, getById, add, update, remove }),
    [episodes, byDog, getById, add, update, remove]
  );
}
