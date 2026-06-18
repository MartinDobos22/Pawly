import { Router, Request, Response, NextFunction } from 'express';
import { createPet, deletePet, getPet, listPets, updatePet } from '../services/petsService';
import { uploadPetPhoto } from '../services/petPhotoService';
import { isAnimalType } from '../constants/animalSpecies';

const router = Router();

function requireUserId(req: Request): string {
  const id = req.appUserId;
  if (!id) {
    const err = new Error('Prihlásenie je povinné.') as Error & { status: number; code: string };
    err.status = 401;
    err.code = 'UNAUTHORIZED';
    throw err;
  }
  return id;
}

router.get('/', async (req: Request, res: Response, next: NextFunction) => {
  try {
    res.json(await listPets(requireUserId(req)));
  } catch (err) {
    next(err);
  }
});

router.post('/', async (req: Request, res: Response, next: NextFunction) => {
  try {
    if (!req.body?.name || !req.body?.animalType) {
      res
        .status(400)
        .json({ error: { message: 'Chýba meno alebo typ zvieraťa.', code: 'INVALID_INPUT' } });
      return;
    }
    if (!isAnimalType(req.body.animalType)) {
      res.status(400).json({ error: { message: 'Neznámy typ zvieraťa.', code: 'INVALID_INPUT' } });
      return;
    }
    res.status(201).json(await createPet(requireUserId(req), req.body));
  } catch (err) {
    next(err);
  }
});

router.post('/photo', async (req: Request, res: Response, next: NextFunction) => {
  try {
    res.json(await uploadPetPhoto(requireUserId(req), req.body));
  } catch (err) {
    next(err);
  }
});

router.get('/:petId', async (req: Request, res: Response, next: NextFunction) => {
  try {
    res.json(await getPet(requireUserId(req), String(req.params.petId)));
  } catch (err) {
    next(err);
  }
});

router.patch('/:petId', async (req: Request, res: Response, next: NextFunction) => {
  try {
    res.json(await updatePet(requireUserId(req), String(req.params.petId), req.body));
  } catch (err) {
    next(err);
  }
});

router.delete('/:petId', async (req: Request, res: Response, next: NextFunction) => {
  try {
    await deletePet(requireUserId(req), String(req.params.petId));
    res.status(204).end();
  } catch (err) {
    next(err);
  }
});

export default router;
