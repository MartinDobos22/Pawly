import type { PetProfile } from '../types';

const MS_PER_YEAR = 1000 * 60 * 60 * 24 * 365.25;

export function ageInYears(dog: Pick<PetProfile, 'dateOfBirth' | 'ageYears'>): number | null {
  if (dog.dateOfBirth) {
    const born = new Date(dog.dateOfBirth).getTime();
    if (!Number.isNaN(born)) {
      const years = Math.floor((Date.now() - born) / MS_PER_YEAR);
      if (years >= 0) return years;
    }
  }
  return dog.ageYears != null && dog.ageYears >= 0 ? dog.ageYears : null;
}
