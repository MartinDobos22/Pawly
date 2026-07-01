import { Router, type Request, type Response, type NextFunction } from 'express';
import { httpError } from '../utils/httpError';
import { getPublishedArticleBySlug, listPublishedArticles } from '../services/articleService';

// Verejné články poradne — read-only, BEZ Firebase auth (mountuje sa pred
// firebaseAuth v index.ts). Obsah je verejný; zápis/editácia rieši samostatná
// admin cesta (zatiaľ neimplementované).
const router = Router();

router.get('/', async (_req: Request, res: Response, next: NextFunction) => {
  try {
    const articles = await listPublishedArticles();
    res.json({ articles });
  } catch (err) {
    next(err);
  }
});

router.get('/:slug', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const slug = String(req.params.slug);
    const article = await getPublishedArticleBySlug(slug);
    if (!article) {
      throw httpError(404, 'Článok sa nenašiel.', 'NOT_FOUND');
    }
    res.json({ article });
  } catch (err) {
    next(err);
  }
});

export default router;
