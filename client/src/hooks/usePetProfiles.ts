import { useContext } from 'react';
import { PetProfilesContext } from '../contexts/PetProfilesContext';

export function usePetProfiles() {
  const context = useContext(PetProfilesContext);
  if (!context) {
    throw new Error('usePetProfiles musí byť použitý vnútri <PetProfilesProvider>.');
  }
  return context;
}
