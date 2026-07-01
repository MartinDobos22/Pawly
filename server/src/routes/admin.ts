import { Router, type Request, type Response, type NextFunction } from 'express';
import { isAdminEmail, requireAdmin } from '../middleware/requireAdmin';
import { httpError } from '../utils/httpError';
import {
  changeArticleStatus,
  createArticle,
  deleteArticle,
  getArticleBySlugAdmin,
  getExistingSlugs,
  listAllArticles,
  updateArticle,
} from '../services/articleService';
import { groupValidation, validateArticleForPublish } from '../services/articleValidation';
import { getArticleMetric, getArticleMetrics } from '../services/articleAnalyticsService';
import { listAiGenerations } from '../services/articleAiService';
import type { ArticleStatus } from '../types/article';
import { uploadArticleImage } from '../services/articleImageService';
import {
  getArticleVersion,
  listArticleVersions,
  recordArticleVersionBySlug,
  recordAutosaveVersion,
  restoreArticleVersion,
  snapshotPublishedArticles,
} from '../services/articleVersionService';
import { logger } from '../utils/logger';

// /api/admin/* — vyžaduje Firebase auth (globálny firebaseAuth) + ensureUser
// (mount v index.ts). `status` je dostupný každému prihlásenému (vráti isAdmin);
// `articles/*` je gated cez requireAdmin (env allowlist ADMIN_EMAILS).
const router = Router();

router.get('/status', (req: Request, res: Response) => {
  res.json({ isAdmin: isAdminEmail(req.user?.email) });
});

const articles = Router();

articles.get('/', async (_req: Request, res: Response, next: NextFunction) => {
  try {
    res.json({ articles: await listAllArticles() });
  } catch (err) {
    next(err);
  }
});

articles.get('/metrics', async (_req: Request, res: Response, next: NextFunction) => {
  try {
    res.json({ metrics: await getArticleMetrics(30) });
  } catch (err) {
    next(err);
  }
});

articles.get('/:slug', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const article = await getArticleBySlugAdmin(String(req.params.slug));
    if (!article) throw httpError(404, 'Článok sa nenašiel.', 'NOT_FOUND');
    res.json({ article });
  } catch (err) {
    next(err);
  }
});

articles.get('/:slug/metrics', async (req: Request, res: Response, next: NextFunction) => {
  try {
    res.json({ metrics: await getArticleMetric(String(req.params.slug), 30) });
  } catch (err) {
    next(err);
  }
});

articles.get('/:slug/ai-log', async (req: Request, res: Response, next: NextFunction) => {
  try {
    res.json({ generations: await listAiGenerations(String(req.params.slug)) });
  } catch (err) {
    next(err);
  }
});

articles.post('/', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const article = await createArticle(req.body);
    await recordArticleVersionBySlug({
      slug: article.slug,
      data: article,
      kind: 'manual',
      createdBy: req.user?.email ?? null,
      changeSummary: 'Vytvorené',
    });
    res.status(201).json({ article });
  } catch (err) {
    next(err);
  }
});

articles.post('/upload-image', async (req: Request, res: Response, next: NextFunction) => {
  try {
    res.json(await uploadArticleImage(req.body));
  } catch (err) {
    next(err);
  }
});

// Spustí Netlify build hook → rebuild verejného webu (prerender z DB).
articles.post('/publish', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const hookUrl = process.env.NETLIFY_BUILD_HOOK_URL;
    if (!hookUrl) {
      throw httpError(503, 'Publikovanie nie je nakonfigurované.', 'PUBLISH_NOT_CONFIGURED');
    }
    await snapshotPublishedArticles(req.user?.email ?? null);
    let ok = false;
    let status = 0;
    try {
      const hookRes = await fetch(hookUrl, { method: 'POST', signal: AbortSignal.timeout(15000) });
      ok = hookRes.ok;
      status = hookRes.status;
    } catch {
      throw httpError(502, 'Spustenie buildu zlyhalo.', 'PUBLISH_FAILED');
    }
    if (!ok) {
      logger.error('Netlify build hook vrátil chybu', { status });
      throw httpError(502, 'Spustenie buildu zlyhalo.', 'PUBLISH_FAILED');
    }
    res.json({ triggered: true });
  } catch (err) {
    next(err);
  }
});

articles.put('/:slug', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const slug = String(req.params.slug);
    const article = await updateArticle(slug, req.body);
    const summary =
      typeof req.body?.changeSummary === 'string' && req.body.changeSummary.trim().length > 0
        ? req.body.changeSummary.trim()
        : 'Upravené';
    await recordArticleVersionBySlug({
      slug,
      data: article,
      kind: 'manual',
      createdBy: req.user?.email ?? null,
      changeSummary: summary,
    });
    res.json({ article });
  } catch (err) {
    next(err);
  }
});

articles.get('/:slug/validation', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const article = await getArticleBySlugAdmin(String(req.params.slug));
    if (!article) throw httpError(404, 'Článok sa nenašiel.', 'NOT_FOUND');
    const existingSlugs = await getExistingSlugs();
    res.json(groupValidation(validateArticleForPublish(article, { existingSlugs })));
  } catch (err) {
    next(err);
  }
});

articles.post('/:slug/status', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const slug = String(req.params.slug);
    const body = (req.body ?? {}) as { status?: unknown; note?: unknown; scheduledFor?: unknown };
    const target = body.status as ArticleStatus;
    const by = req.user?.email ?? null;

    // Tvrdý blok: publikovať sa nedá, ak validácia nájde errory.
    if (target === 'published') {
      const candidate = await getArticleBySlugAdmin(slug);
      if (!candidate) throw httpError(404, 'Článok sa nenašiel.', 'NOT_FOUND');
      const existingSlugs = await getExistingSlugs();
      const validation = groupValidation(validateArticleForPublish(candidate, { existingSlugs }));
      if (!validation.canPublish) {
        res.status(400).json({
          error: { message: 'Článok nemožno publikovať.', code: 'NOT_PUBLISHABLE' },
          validation,
        });
        return;
      }
    }

    const article = await changeArticleStatus(slug, target, {
      by,
      scheduledFor: body.scheduledFor,
    });

    const note =
      typeof body.note === 'string' && body.note.trim().length > 0 ? ` — ${body.note.trim()}` : '';
    await recordArticleVersionBySlug({
      slug,
      data: article,
      kind: target === 'published' ? 'publish' : 'manual',
      createdBy: by,
      changeSummary: `Stav: ${target}${note}`,
    });

    res.json({ article });
  } catch (err) {
    next(err);
  }
});

articles.post('/:slug/autosave', async (req: Request, res: Response, next: NextFunction) => {
  try {
    if (!req.body || typeof req.body !== 'object') {
      throw httpError(400, 'Telo požiadavky musí byť objekt.', 'INVALID_INPUT');
    }
    const result = await recordAutosaveVersion({
      slug: String(req.params.slug),
      data: req.body,
      createdBy: req.user?.email ?? null,
    });
    res.json(result);
  } catch (err) {
    next(err);
  }
});

articles.get('/:slug/versions', async (req: Request, res: Response, next: NextFunction) => {
  try {
    res.json({ versions: await listArticleVersions(String(req.params.slug)) });
  } catch (err) {
    next(err);
  }
});

articles.get(
  '/:slug/versions/:versionId',
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const version = await getArticleVersion(
        String(req.params.slug),
        String(req.params.versionId)
      );
      res.json({ version });
    } catch (err) {
      next(err);
    }
  }
);

articles.post(
  '/:slug/versions/:versionId/restore',
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const article = await restoreArticleVersion(
        String(req.params.slug),
        String(req.params.versionId),
        req.user?.email ?? null
      );
      res.json({ article });
    } catch (err) {
      next(err);
    }
  }
);

articles.delete('/:slug', async (req: Request, res: Response, next: NextFunction) => {
  try {
    await deleteArticle(String(req.params.slug));
    res.status(204).end();
  } catch (err) {
    next(err);
  }
});

router.use('/articles', requireAdmin, articles);

export default router;
