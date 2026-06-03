import { Router, Request, Response, NextFunction } from 'express';
import { deleteAccount, exportUserData, getAuditLog } from '../services/accountService';
import { httpError } from '../utils/httpError';

const router = Router();

router.delete('/', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const appUserId = req.appUserId;
    const uid = req.user?.uid;
    if (!appUserId || !uid) {
      throw httpError(401, 'Prihlásenie je povinné.', 'UNAUTHORIZED');
    }
    await deleteAccount(appUserId, uid);
    res.status(204).end();
  } catch (err) {
    next(err);
  }
});

router.get('/export', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const appUserId = req.appUserId;
    if (!appUserId) {
      throw httpError(401, 'Prihlásenie je povinné.', 'UNAUTHORIZED');
    }
    const data = await exportUserData(appUserId);
    const stamp = new Date().toISOString().slice(0, 10);
    res.setHeader('Content-Type', 'application/json; charset=utf-8');
    res.setHeader('Content-Disposition', `attachment; filename="pawly-export-${stamp}.json"`);
    res.status(200).send(JSON.stringify(data, null, 2));
  } catch (err) {
    next(err);
  }
});

router.get('/audit-log', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const appUserId = req.appUserId;
    if (!appUserId) {
      throw httpError(401, 'Prihlásenie je povinné.', 'UNAUTHORIZED');
    }
    const limit = Math.min(Math.max(Number(req.query.limit ?? 200) || 200, 1), 1000);
    const entries = await getAuditLog(appUserId, limit);
    res.status(200).json({ entries });
  } catch (err) {
    next(err);
  }
});

export default router;
