import { Router, type Request, type Response, type NextFunction } from 'express';
import {
  computeUpcoming,
  getPreferences,
  upsertPreferences,
  type NotificationPreferences,
} from '../services/notificationsService';
import { httpError } from '../utils/httpError';

const router = Router();

function parsePreferencesBody(body: unknown): Partial<NotificationPreferences> {
  if (!body || typeof body !== 'object') {
    throw httpError(400, 'Neplatné telo požiadavky.', 'INVALID_INPUT');
  }
  const b = body as Record<string, unknown>;
  const patch: Partial<NotificationPreferences> = {};

  if ('emailEnabled' in b) {
    if (typeof b.emailEnabled !== 'boolean')
      throw httpError(400, 'emailEnabled musí byť boolean.', 'INVALID_INPUT');
    patch.emailEnabled = b.emailEnabled;
  }
  if ('leadDays' in b) {
    if (!Array.isArray(b.leadDays) || b.leadDays.some((n) => typeof n !== 'number'))
      throw httpError(400, 'leadDays musí byť pole čísel.', 'INVALID_INPUT');
    patch.leadDays = b.leadDays as number[];
  }
  for (const key of [
    'notifyVaccinations',
    'notifyDewormings',
    'notifyEctoparasites',
    'notifyVetChecks',
    'notifyTreatments',
    'notifyMedications',
  ] as const) {
    if (key in b) {
      if (typeof b[key] !== 'boolean')
        throw httpError(400, `${key} musí byť boolean.`, 'INVALID_INPUT');
      patch[key] = b[key] as boolean;
    }
  }
  return patch;
}

router.get('/preferences', async (req: Request, res: Response, next: NextFunction) => {
  try {
    res.json(await getPreferences(req.appUserId as string));
  } catch (err) {
    next(err);
  }
});

router.put('/preferences', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const patch = parsePreferencesBody(req.body);
    res.json(await upsertPreferences(req.appUserId as string, patch));
  } catch (err) {
    next(err);
  }
});

router.get('/upcoming', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const petIdRaw = req.query.petId;
    const petId = typeof petIdRaw === 'string' && petIdRaw ? petIdRaw : undefined;
    res.json({ items: await computeUpcoming(req.appUserId as string, petId) });
  } catch (err) {
    next(err);
  }
});

export default router;
