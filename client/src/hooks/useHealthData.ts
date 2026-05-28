import { useContext } from 'react';
import { HealthDataContext } from '../contexts/HealthDataContext';

export function useHealthData() {
  const context = useContext(HealthDataContext);
  if (!context) {
    throw new Error('useHealthData musí byť použitý vnútri <HealthDataProvider>.');
  }
  return context;
}
