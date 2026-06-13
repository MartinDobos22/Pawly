import { Router, Request, Response, NextFunction } from 'express';
import { makeCrud, type Crud } from '../services/healthCrud';
import {
  dewormingMapper,
  dietEntryMapper,
  doseLogMapper,
  ectoparasiteMapper,
  episodeMapper,
  expenseMapper,
  medicationMapper,
  vaccinationMapper,
  vetVisitMapper,
  weightLogMapper,
} from '../services/healthMappers';
import { removeMedicationCascade } from '../services/medicationsService';
import { createVisitBundle } from '../services/visitBundleService';
import {
  clearSavedAnalyses,
  createSavedAnalysis,
  listSavedAnalyses,
  removeSavedAnalysis,
} from '../services/savedAnalysesService';
import { httpError } from '../utils/httpError';
import {
  createHealthAttachmentSignedUrls,
  deleteHealthAttachment,
  uploadHealthAttachment,
} from '../services/healthAttachmentsService';

const router = Router();

function requireUserId(req: Request): string {
  const id = req.appUserId;
  if (!id) throw httpError(401, 'Prihlásenie je povinné.', 'UNAUTHORIZED');
  return id;
}

function isInvalidDateRange(startIso: unknown, endIso: unknown): boolean {
  if (typeof startIso !== 'string' || typeof endIso !== 'string') return false;
  if (!startIso.trim() || !endIso.trim()) return false;
  const start = new Date(startIso).getTime();
  const end = new Date(endIso).getTime();
  if (Number.isNaN(start) || Number.isNaN(end)) return false;
  return end < start;
}

function assertDateRange(
  body: unknown,
  startField: string,
  endField: string,
  message: string
): void {
  if (!body || typeof body !== 'object') return;
  const record = body as Record<string, unknown>;
  if (isInvalidDateRange(record[startField], record[endField])) {
    throw httpError(400, message, 'INVALID_DATE_RANGE');
  }
}

function registerCrud<Dto extends { id: string; petId: string }>(
  path: string,
  crud: Crud<Dto>,
  options: { skipDelete?: boolean } = {}
): void {
  router.get(`/${path}`, async (req: Request, res: Response, next: NextFunction) => {
    try {
      res.json(await crud.list(requireUserId(req)));
    } catch (err) {
      next(err);
    }
  });

  router.post(`/${path}`, async (req: Request, res: Response, next: NextFunction) => {
    try {
      res.status(201).json(await crud.create(requireUserId(req), req.body));
    } catch (err) {
      next(err);
    }
  });

  router.patch(`/${path}/:id`, async (req: Request, res: Response, next: NextFunction) => {
    try {
      res.json(await crud.update(requireUserId(req), String(req.params.id), req.body));
    } catch (err) {
      next(err);
    }
  });

  if (!options.skipDelete) {
    router.delete(`/${path}/:id`, async (req: Request, res: Response, next: NextFunction) => {
      try {
        await crud.remove(requireUserId(req), String(req.params.id));
        res.status(204).end();
      } catch (err) {
        next(err);
      }
    });
  }
}

function dateRangeGuard(
  startField: string,
  endField: string,
  message: string
): (req: Request, _res: Response, next: NextFunction) => void {
  return (req, _res, next) => {
    if (req.method !== 'POST' && req.method !== 'PATCH') return next();
    try {
      assertDateRange(req.body, startField, endField, message);
      next();
    } catch (err) {
      next(err);
    }
  };
}

router.use(
  '/vaccinations',
  dateRangeGuard(
    'dateApplied',
    'validUntil',
    'Dátum platnosti vakcinácie musí byť rovnaký alebo neskôr ako dátum aplikácie.'
  )
);
router.use(
  '/dewormings',
  dateRangeGuard(
    'dateGiven',
    'nextDueDate',
    'Ďalšia dávka odčervenia musí byť rovnaká alebo neskôr ako dátum podania.'
  )
);
router.use(
  '/ectoparasites',
  dateRangeGuard(
    'dateGiven',
    'nextDueDate',
    'Ďalšia dávka antiparazitika musí byť rovnaká alebo neskôr ako dátum podania.'
  )
);

router.post('/attachments/upload', async (req: Request, res: Response, next: NextFunction) => {
  try {
    res.status(201).json(await uploadHealthAttachment(requireUserId(req), req.body));
  } catch (err) {
    next(err);
  }
});

router.post('/attachments/signed-urls', async (req: Request, res: Response, next: NextFunction) => {
  try {
    res.json(await createHealthAttachmentSignedUrls(requireUserId(req), req.body));
  } catch (err) {
    next(err);
  }
});

router.post('/attachments/download', async (req: Request, res: Response, next: NextFunction) => {
  try {
    res.json(await createHealthAttachmentSignedUrls(requireUserId(req), req.body));
  } catch (err) {
    next(err);
  }
});

router.delete('/attachments', async (req: Request, res: Response, next: NextFunction) => {
  try {
    await deleteHealthAttachment(requireUserId(req), req.body);
    res.status(204).end();
  } catch (err) {
    next(err);
  }
});

registerCrud('vaccinations', makeCrud(vaccinationMapper));
registerCrud('dewormings', makeCrud(dewormingMapper));
registerCrud('ectoparasites', makeCrud(ectoparasiteMapper));
registerCrud('vet-visits', makeCrud(vetVisitMapper));
registerCrud('medications', makeCrud(medicationMapper), { skipDelete: true });
registerCrud('dose-logs', makeCrud(doseLogMapper));
registerCrud('diet-entries', makeCrud(dietEntryMapper));
registerCrud('expenses', makeCrud(expenseMapper));
registerCrud('episodes', makeCrud(episodeMapper));
registerCrud('weight-logs', makeCrud(weightLogMapper));

router.delete('/medications/:id', async (req: Request, res: Response, next: NextFunction) => {
  try {
    await removeMedicationCascade(requireUserId(req), String(req.params.id));
    res.status(204).end();
  } catch (err) {
    next(err);
  }
});

router.post('/visit-bundle', async (req: Request, res: Response, next: NextFunction) => {
  try {
    res.status(201).json(await createVisitBundle(requireUserId(req), req.body));
  } catch (err) {
    next(err);
  }
});

router.get('/saved-analyses', async (req: Request, res: Response, next: NextFunction) => {
  try {
    res.json(await listSavedAnalyses(requireUserId(req)));
  } catch (err) {
    next(err);
  }
});

router.post('/saved-analyses', async (req: Request, res: Response, next: NextFunction) => {
  try {
    res.status(201).json(await createSavedAnalysis(requireUserId(req), req.body));
  } catch (err) {
    next(err);
  }
});

router.delete('/saved-analyses', async (req: Request, res: Response, next: NextFunction) => {
  try {
    await clearSavedAnalyses(requireUserId(req));
    res.status(204).end();
  } catch (err) {
    next(err);
  }
});

router.delete('/saved-analyses/:id', async (req: Request, res: Response, next: NextFunction) => {
  try {
    await removeSavedAnalysis(requireUserId(req), String(req.params.id));
    res.status(204).end();
  } catch (err) {
    next(err);
  }
});

export default router;
