import { Router, type Request, type Response, type NextFunction } from 'express';
import { recordArticleEvent } from '../services/articleAnalyticsService';

// Verejný tracking endpoint (bez auth, mountuje sa PRED firebaseAuth). Rate limit
// sa pripája v index.ts. Fire-and-forget — vždy 204, aby tracking nerušil UX.
const router = Router();

router.post('/article-event', async (req: Request, res: Response, next: NextFunction) => {
  try {
    await recordArticleEvent(req.body);
    res.status(204).end();
  } catch (err) {
    next(err);
  }
});

export default router;
