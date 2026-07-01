import { Router, type Request, type Response, type NextFunction } from 'express';
import { generateArticleAi, type ArticleAiType } from '../services/articleAiService';

// /api/admin/ai/* — AI generovanie obsahu článkov. Middleware (auth, admin gate,
// aiHeavyLimiter, requireAiQuota) sa pripája pri mount-e v index.ts.
const router = Router();

router.post('/article', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const body = (req.body ?? {}) as {
      type?: unknown;
      articleSlug?: unknown;
      title?: unknown;
      bodyText?: unknown;
      instruction?: unknown;
      category?: unknown;
      sources?: unknown;
    };
    const result = await generateArticleAi(
      body.type as ArticleAiType,
      {
        title: typeof body.title === 'string' ? body.title : undefined,
        body: typeof body.bodyText === 'string' ? body.bodyText : undefined,
        instruction: typeof body.instruction === 'string' ? body.instruction : undefined,
        category: typeof body.category === 'string' ? body.category : undefined,
        sources: Array.isArray(body.sources)
          ? (body.sources as { label?: unknown; url?: unknown }[])
              .map((s) => ({ label: String(s.label ?? ''), url: String(s.url ?? '') }))
              .filter((s) => s.url)
          : undefined,
      },
      req.user?.email ?? null,
      typeof body.articleSlug === 'string' ? body.articleSlug : undefined
    );
    res.json(result);
  } catch (err) {
    next(err);
  }
});

export default router;
