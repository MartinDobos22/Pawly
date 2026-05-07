import { useCallback, useMemo } from 'react';
import { useLocalStorage } from './useLocalStorage';
import type { HealthEpisodeRecord } from '../types/healthEpisode';

const STORAGE_KEY = 'dog-health-episodes';

const uid = () => Date.now().toString(36) + Math.random().toString(36).slice(2, 8);

export interface UseHealthEpisodesApi {
  episodes: HealthEpisodeRecord[];
  byDog: (dogId: string) => HealthEpisodeRecord[];
  getById: (id: string) => HealthEpisodeRecord | undefined;
  add: (
    payload: Omit<HealthEpisodeRecord, 'id' | 'createdAt' | 'updatedAt'>
  ) => HealthEpisodeRecord;
  update: (id: string, payload: Partial<Omit<HealthEpisodeRecord, 'id' | 'createdAt'>>) => void;
  remove: (id: string) => void;
}

export function useHealthEpisodes(): UseHealthEpisodesApi {
  const [episodes, setEpisodes] = useLocalStorage<HealthEpisodeRecord[]>(STORAGE_KEY, []);

  const byDog = useCallback(
    (dogId: string) => episodes.filter((e) => e.dogId === dogId),
    [episodes]
  );

  const getById = useCallback((id: string) => episodes.find((e) => e.id === id), [episodes]);

  const add: UseHealthEpisodesApi['add'] = useCallback(
    (payload) => {
      const now = new Date().toISOString();
      const record: HealthEpisodeRecord = {
        ...payload,
        id: uid(),
        createdAt: now,
        updatedAt: now,
      };
      setEpisodes((prev) => [record, ...prev]);
      return record;
    },
    [setEpisodes]
  );

  const update: UseHealthEpisodesApi['update'] = useCallback(
    (id, payload) => {
      setEpisodes((prev) =>
        prev.map((e) =>
          e.id === id
            ? {
                ...e,
                ...payload,
                id: e.id,
                createdAt: e.createdAt,
                updatedAt: new Date().toISOString(),
              }
            : e
        )
      );
    },
    [setEpisodes]
  );

  const remove: UseHealthEpisodesApi['remove'] = useCallback(
    (id) => {
      setEpisodes((prev) => prev.filter((e) => e.id !== id));
    },
    [setEpisodes]
  );

  return useMemo(
    () => ({ episodes, byDog, getById, add, update, remove }),
    [episodes, byDog, getById, add, update, remove]
  );
}
