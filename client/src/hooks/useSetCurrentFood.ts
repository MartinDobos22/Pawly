import { useCallback } from 'react';
import { useHealthData } from './useHealthData';
import type { DietEntry, FoodType } from '../types/petHealth';

export interface SetCurrentFoodInput {
  petId: string;
  foodName: string;
  foodType?: FoodType;
  startedAt: string;
  note?: string;
  suitabilityStatus?: DietEntry['suitabilityStatus'];
  suitabilityReasons?: string[];
}

// Hlavné/mokré krmivo je „singulárne" — naraz môže byť len jedno aktuálne.
// Pamlsky/doplnky môžu koexistovať (zoznam).
const SINGULAR_TYPES: FoodType[] = ['main', 'wet'];

export function useSetCurrentFood() {
  const { dietEntries, addDietEntry, updateDietEntry } = useHealthData();

  return useCallback(
    async (input: SetCurrentFoodInput): Promise<DietEntry> => {
      const foodType: FoodType = input.foodType ?? 'main';

      if (SINGULAR_TYPES.includes(foodType)) {
        // Uzavri VŠETKY otvorené záznamy daného typu (oprava: predtým len jeden).
        const openSameType = dietEntries.filter(
          (d) => d.petId === input.petId && (d.foodType ?? 'main') === foodType && !d.endedAt
        );
        for (const entry of openSameType) {
          await updateDietEntry(entry.id, { endedAt: input.startedAt });
        }
      }

      return addDietEntry({
        petId: input.petId,
        foodName: input.foodName,
        foodType,
        startedAt: input.startedAt,
        reactionNotes: input.note,
        suitabilityStatus: input.suitabilityStatus,
        suitabilityReasons: input.suitabilityReasons,
      });
    },
    [dietEntries, addDietEntry, updateDietEntry]
  );
}
