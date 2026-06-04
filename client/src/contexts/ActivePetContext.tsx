import { createContext, useCallback, useEffect, useMemo, useState, type ReactNode } from 'react';
import type { PetProfile } from '../types';
import { usePetProfiles } from '../hooks/usePetProfiles';

const ACTIVE_PET_KEY = 'granule-check-active-pet-id';

const readInitialActivePetId = (): string => {
  if (typeof window === 'undefined') return '';
  try {
    const raw = window.localStorage.getItem(ACTIVE_PET_KEY);
    if (!raw) return '';
    return JSON.parse(raw) as string;
  } catch {
    return '';
  }
};

const writeActivePetId = (id: string) => {
  if (typeof window === 'undefined') return;
  try {
    window.localStorage.setItem(ACTIVE_PET_KEY, JSON.stringify(id));
  } catch {
    /* ignore */
  }
};

export interface ActivePetContextValue {
  activePet: PetProfile | null;
  activePetId: string;
  selectPet: (id: string) => void;
  dogProfiles: PetProfile[];
  allProfiles: PetProfile[];
  loading: boolean;
}

export const ActivePetContext = createContext<ActivePetContextValue | null>(null);

export function ActivePetProvider({ children }: { children: ReactNode }) {
  const { profiles, loading } = usePetProfiles();
  const [activePetId, setActivePetIdState] = useState<string>(readInitialActivePetId);

  const dogProfiles = useMemo(() => profiles.filter((p) => p.animalType === 'dog'), [profiles]);

  useEffect(() => {
    if (!dogProfiles.length) return;
    const exists = dogProfiles.some((d) => d.id === activePetId);
    if (!exists) {
      const nextId = dogProfiles[0].id;
      setActivePetIdState(nextId);
      writeActivePetId(nextId);
    }
  }, [dogProfiles, activePetId]);

  const selectPet = useCallback((id: string) => {
    setActivePetIdState(id);
    writeActivePetId(id);
  }, []);

  const activePet = useMemo(
    () => dogProfiles.find((d) => d.id === activePetId) ?? null,
    [dogProfiles, activePetId]
  );

  const value = useMemo<ActivePetContextValue>(
    () => ({
      activePet,
      activePetId,
      selectPet,
      dogProfiles,
      allProfiles: profiles,
      loading,
    }),
    [activePet, activePetId, selectPet, dogProfiles, profiles, loading]
  );

  return <ActivePetContext.Provider value={value}>{children}</ActivePetContext.Provider>;
}
