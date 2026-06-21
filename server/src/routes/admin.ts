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
