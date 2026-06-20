import { useCallback } from 'react';
import { useHealthData } from './useHealthData';
import type { DietEntry } from '../types/petHealth';

export interface SetCurrentFoodInput {
  petId: string;
  foodName: string;
  startedAt: string;
  note?: string;
  suitabilityStatus?: DietEntry['suitabilityStatus'];
  suitabilityReasons?: string[];
}

/**
 * Jediné miesto pravdy pre „prepni aktuálne krmivo": uzavrie predošlý aktuálny
 * diétny záznam (`endedAt`) a vytvorí nový aktuálny.
 */
export function useSetCurrentFood() {
  const { dietEntries, addDietEntry, updateDietEntry } = useHealthData();

  return useCallback(
    async (input: SetCurrentFoodInput): Promise<DietEntry> => {
      const current = dietEntries
        .filter((d) => d.petId === input.petId && !d.endedAt)
        .sort((a, b) => b.startedAt.localeCompare(a.startedAt))[0];

      if (current && current.startedAt <= input.startedAt) {
        await updateDietEntry(current.id, { endedAt: input.startedAt });
      }

      return addDietEntry({
        petId: input.petId,
        foodName: input.foodName,
        startedAt: input.startedAt,
        reactionNotes: input.note,
        suitabilityStatus: input.suitabilityStatus,
        suitabilityReasons: input.suitabilityReasons,
      });
    },
    [dietEntries, addDietEntry, updateDietEntry]
  );
}
