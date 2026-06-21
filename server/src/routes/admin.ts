import { Router, type Request, type Response, type NextFunction } from 'express';
import { isAdminEmail, requireAdmin } from '../middleware/requireAdmin';
import { httpError } from '../utils/httpError';
import {
  createArticle,
  deleteArticle,
  getArticleBySlugAdmin,
  listAllArticles,
  updateArticle,
} from '../services/articleService';
import { uploadArticleImage } from '../services/articleImageService';
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

articles.get('/:slug', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const article = await getArticleBySlugAdmin(String(req.params.slug));
    if (!article) throw httpError(404, 'Článok sa nenašiel.', 'NOT_FOUND');
    res.json({ article });
  } catch (err) {
    next(err);
  }
});

articles.post('/', async (req: Request, res: Response, next: NextFunction) => {
  try {
    res.status(201).json({ article: await createArticle(req.body) });
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
articles.post('/publish', async (_req: Request, res: Response, next: NextFunction) => {
  try {
    const hookUrl = process.env.NETLIFY_BUILD_HOOK_URL;
    if (!hookUrl) {
      throw httpError(503, 'Publikovanie nie je nakonfigurované.', 'PUBLISH_NOT_CONFIGURED');
    }
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
    res.json({ article: await updateArticle(String(req.params.slug), req.body) });
  } catch (err) {
    next(err);
  }
});

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
