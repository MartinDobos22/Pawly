import { Request, Response, NextFunction, RequestHandler } from 'express';
import { getSupabase } from '../config/supabase';
import { logger } from '../utils/logger';

const ENV_LIMIT = Number(process.env.AI_DAILY_LIMIT);
const DEFAULT_DAILY_LIMIT = Number.isFinite(ENV_LIMIT) && ENV_LIMIT > 0 ? ENV_LIMIT : 50;

type QuotaRow = {
  exceeded: boolean;
  current_count: number;
  limit_value: number;
};

export function requireAiQuota(limit: number = DEFAULT_DAILY_LIMIT): RequestHandler {
  return async function aiQuotaMiddleware(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      if (!req.appUserId) {
        const err = new Error('Prihlásenie je povinné.') as Error & {
          status: number;
          code: string;
        };
        err.status = 401;
        err.code = 'UNAUTHORIZED';
        throw err;
      }

      const supabase = getSupabase();
      const { data, error } = await supabase.rpc('app_increment_ai_quota', {
        p_app_user_id: req.appUserId,
        p_limit: limit,
      });

      if (error) throw error;

      const result: QuotaRow | undefined = Array.isArray(data) ? data[0] : data;

      if (result?.exceeded) {
        logger.warn('Denný AI limit prekročený', {
          appUserId: req.appUserId,
          count: result.current_count,
          limit: result.limit_value,
          path: req.originalUrl,
        });
        res.status(429).json({
          error: {
            message: `Denný limit AI volaní (${result.limit_value}) bol vyčerpaný. Skús to znova zajtra.`,
            code: 'DAILY_AI_LIMIT',
          },
        });
        return;
      }

      next();
    } catch (err) {
      next(err);
    }
  };
}
