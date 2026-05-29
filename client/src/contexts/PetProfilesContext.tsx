import { createContext, useCallback, useEffect, useMemo, useState, type ReactNode } from 'react';
import type { PetProfile } from '../types';
import { createPet, deletePet, listPets, updatePet } from '../services/petsApi';
import i18n from '../i18n';

interface PetProfilesContextValue {
  profiles: PetProfile[];
  loading: boolean;
  error: string | null;
  createProfile: (payload: Partial<PetProfile>) => Promise<PetProfile>;
  updateProfile: (id: string, payload: Partial<PetProfile>) => Promise<PetProfile>;
  deleteProfile: (id: string) => Promise<void>;
  refetch: () => Promise<void>;
}

export const PetProfilesContext = createContext<PetProfilesContextValue | null>(null);

export function PetProfilesProvider({ children }: { children: ReactNode }) {
  const [profiles, setProfiles] = useState<PetProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const refetch = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      setProfiles(await listPets());
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : (i18n.t('errors.loadProfilesFailed', { ns: 'common' }) as string)
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void refetch();
  }, [refetch]);

  const createProfile = useCallback(async (payload: Partial<PetProfile>) => {
    const created = await createPet(payload);
    setProfiles((prev) => [...prev, created]);
    return created;
  }, []);

  const updateProfile = useCallback(async (id: string, payload: Partial<PetProfile>) => {
    const updated = await updatePet(id, payload);
    setProfiles((prev) => prev.map((p) => (p.id === id ? updated : p)));
    return updated;
  }, []);

  const deleteProfile = useCallback(async (id: string) => {
    await deletePet(id);
    setProfiles((prev) => prev.filter((p) => p.id !== id));
  }, []);

  const value = useMemo<PetProfilesContextValue>(
    () => ({ profiles, loading, error, createProfile, updateProfile, deleteProfile, refetch }),
    [profiles, loading, error, createProfile, updateProfile, deleteProfile, refetch]
  );

  return <PetProfilesContext.Provider value={value}>{children}</PetProfilesContext.Provider>;
}
