import { Router, Request, Response, NextFunction } from 'express';
import { deleteAccount } from '../services/accountService';
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

export default router;
