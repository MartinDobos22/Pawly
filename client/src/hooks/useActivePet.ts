import { useCallback, useEffect, useMemo } from 'react';
import { useLocalStorage } from './useLocalStorage';
import { usePetProfiles } from './usePetProfiles';

const ACTIVE_PET_KEY = 'granule-check-active-pet-id';

export function useActivePet() {
  const { profiles, loading } = usePetProfiles();
  const [activePetId, setActivePetId] = useLocalStorage<string>(ACTIVE_PET_KEY, '');

  const dogProfiles = useMemo(() => profiles.filter((p) => p.animalType === 'dog'), [profiles]);

  useEffect(() => {
    if (!dogProfiles.length) return;
    const exists = dogProfiles.some((d) => d.id === activePetId);
    if (!exists) {
      setActivePetId(dogProfiles[0].id);
    }
  }, [dogProfiles, activePetId, setActivePetId]);

  const activePet = useMemo(
    () => dogProfiles.find((d) => d.id === activePetId) ?? null,
    [dogProfiles, activePetId]
  );

  const selectPet = useCallback(
    (id: string) => {
      setActivePetId(id);
    },
    [setActivePetId]
  );

  return {
    activePet,
    activePetId,
    selectPet,
    dogProfiles,
    allProfiles: profiles,
    loading,
  };
}
