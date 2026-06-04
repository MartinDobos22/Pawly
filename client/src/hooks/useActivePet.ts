import { useContext } from 'react';
import { ActivePetContext } from '../contexts/ActivePetContext';

export function useActivePet() {
  const ctx = useContext(ActivePetContext);
  if (!ctx) {
    throw new Error('useActivePet musí byť použitý vnútri <ActivePetProvider>.');
  }
  return ctx;
}
