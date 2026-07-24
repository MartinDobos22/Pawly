import { Router, type Request, type Response, type NextFunction } from 'express';
import { timingSafeEqual } from 'node:crypto';
import { runSweep } from '../services/notificationsService';
import { runArticleSchedule } from '../services/articleScheduleService';
import { triggerNetlifyBuildSafe } from '../services/netlifyPublishService';
import { logger } from '../utils/logger';

const router = Router();

function safeEqual(a: string, b: string): boolean {
  const bufA = Buffer.from(a);
  const bufB = Buffer.from(b);
  if (bufA.length !== bufB.length) return false;
  return timingSafeEqual(bufA, bufB);
}

function requireCronSecret(req: Request, res: Response, next: NextFunction): void {
  const secret = process.env.CRON_SECRET;
  if (!secret || !secret.trim()) {
    res
      .status(503)
      .json({ error: { message: 'Cron nie je nakonfigurovaný.', code: 'CRON_DISABLED' } });
    return;
  }
  const provided = req.header('x-cron-secret') ?? '';
  if (!provided || !safeEqual(provided, secret)) {
    res.status(401).json({ error: { message: 'Neplatný cron token.', code: 'UNAUTHORIZED' } });
    return;
  }
  next();
}

router.post(
  '/notifications',
  requireCronSecret,
  async (_req: Request, res: Response, next: NextFunction) => {
    try {
      logger.info('Cron: spúšťam notifikačný sweep');
      const summary = await runSweep();
      res.json(summary);
    } catch (err) {
      next(err);
    }
  }
);

router.post(
  '/articles-schedule',
  requireCronSecret,
  async (_req: Request, res: Response, next: NextFunction) => {
    try {
      const summary = await runArticleSchedule();
      let buildTriggered = false;
      if (summary.published || summary.unpublished) {
        logger.info('Cron: naplánované články spracované', summary);
        buildTriggered = await triggerNetlifyBuildSafe({ source: 'articles-schedule', ...summary });
      }
      res.json({ ...summary, buildTriggered });
    } catch (err) {
      next(err);
    }
  }
);

export default router;
