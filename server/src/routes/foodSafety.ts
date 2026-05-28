import { NextFunction, Request, Response, Router } from 'express';
import { askFoodSafety } from '../services/foodSafetyService';
import type { PetProfile } from '../types';
import type { FoodSafetyRequest } from '../types/foodSafety';
import { logger } from '../utils/logger';

const router = Router();

function validatePetProfile(profile: unknown): PetProfile | undefined {
  if (!profile || typeof profile !== 'object') return undefined;
  const p = profile as Record<string, unknown>;
  if (typeof p.name !== 'string' || !p.name.trim()) return undefined;
  if (!['dog', 'cat', 'other'].includes(p.animalType as string)) return undefined;

  return {
    id: typeof p.id === 'string' ? p.id : '',
    name: (p.name as string).trim(),
    animalType: p.animalType as PetProfile['animalType'],
    breed: typeof p.breed === 'string' ? p.breed : undefined,
    ageYears: typeof p.ageYears === 'number' ? p.ageYears : undefined,
    ageMonths: typeof p.ageMonths === 'number' ? p.ageMonths : undefined,
    weightKg: typeof p.weightKg === 'number' ? p.weightKg : undefined,
    allergies: Array.isArray(p.allergies)
      ? p.allergies.filter((a): a is string => typeof a === 'string')
      : [],
    intolerances: Array.isArray(p.intolerances)
      ? p.intolerances.filter((i): i is string => typeof i === 'string')
      : [],
    healthConditions: Array.isArray(p.healthConditions)
      ? p.healthConditions.filter((h): h is string => typeof h === 'string')
      : [],
    notes: typeof p.notes === 'string' ? p.notes : undefined,
  };
}

router.post(
  '/',
  async (req: Request<object, object, FoodSafetyRequest>, res: Response, next: NextFunction) => {
    try {
      const { query, petProfile } = req.body;

      if (typeof query !== 'string' || !query.trim()) {
        res.status(400).json({
          error: { message: 'Chýba otázka. Napíš potravinu alebo ingredienciu.' },
          status: 400,
        });
        return;
      }

      if (query.length > 200) {
        res.status(400).json({
          error: { message: 'Otázka je príliš dlhá (max 200 znakov).' },
          status: 400,
        });
        return;
      }

      const validatedProfile = validatePetProfile(petProfile);

      logger.info('Food-safety otázka', {
        queryLength: query.length,
        hasPetProfile: Boolean(validatedProfile),
      });

      const result = await askFoodSafety(query, validatedProfile);

      logger.info('Food-safety odpoveď', {
        verdict: result.verdict,
        source: result.source,
      });

      res.json(result);
    } catch (err) {
      next(err);
    }
  }
);

export default router;
