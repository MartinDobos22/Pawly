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
  petProfiles: PetProfile[];
  allProfiles: PetProfile[];
  loading: boolean;
}

export const ActivePetContext = createContext<ActivePetContextValue | null>(null);

export function ActivePetProvider({ children }: { children: ReactNode }) {
  const { profiles, loading } = usePetProfiles();
  const [activePetId, setActivePetIdState] = useState<string>(readInitialActivePetId);

  useEffect(() => {
    if (!profiles.length) return;
    const exists = profiles.some((p) => p.id === activePetId);
    if (!exists) {
      const nextId = profiles[0].id;
      setActivePetIdState(nextId);
      writeActivePetId(nextId);
    }
  }, [profiles, activePetId]);

  const selectPet = useCallback((id: string) => {
    setActivePetIdState(id);
    writeActivePetId(id);
  }, []);

  const activePet = useMemo(
    () => profiles.find((p) => p.id === activePetId) ?? null,
    [profiles, activePetId]
  );

  const value = useMemo<ActivePetContextValue>(
    () => ({
      activePet,
      activePetId,
      selectPet,
      petProfiles: profiles,
      allProfiles: profiles,
      loading,
    }),
    [activePet, activePetId, selectPet, profiles, loading]
  );

  return <ActivePetContext.Provider value={value}>{children}</ActivePetContext.Provider>;
}
