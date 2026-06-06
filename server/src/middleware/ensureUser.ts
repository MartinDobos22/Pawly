import { Request, Response, NextFunction } from 'express';
import { getSupabase } from '../config/supabase';
import { withRetry } from '../utils/retry';

const uidToAppUserId = new Map<string, string>();

function detectLocale(header: string | undefined): 'sk' | 'en' {
  if (!header) return 'sk';
  const first = header.split(',')[0]?.trim().toLowerCase() ?? '';
  return first.startsWith('en') ? 'en' : 'sk';
}

export async function ensureUser(req: Request, _res: Response, next: NextFunction): Promise<void> {
  const locale = detectLocale(req.headers['accept-language'] as string | undefined);
  try {
    if (!req.user) {
      const err = new Error('Prihlásenie je povinné.') as Error & { status: number; code: string };
      err.status = 401;
      err.code = 'UNAUTHORIZED';
      throw err;
    }

    const cached = uidToAppUserId.get(req.user.uid);
    if (cached) {
      req.appUserId = cached;
      next();
      return;
    }

    const supabase = getSupabase();

    const existing = await withRetry(
      async () => {
        const { data, error } = await supabase
          .from('users')
          .select('id, locale')
          .eq('firebase_uid', req.user!.uid)
          .maybeSingle();
        if (error) throw error;
        return data;
      },
      { label: 'ensureUser.select' }
    );

    if (existing) {
      uidToAppUserId.set(req.user.uid, existing.id);
      req.appUserId = existing.id;
      if (existing.locale !== locale) {
        void supabase
          .from('users')
          .update({ locale })
          .eq('id', existing.id)
          .then(({ error }) => {
            if (error) {
              // Best-effort: locale update nemá blokovať request.
            }
          });
      }
      next();
      return;
    }

    // Upsert s ON CONFLICT zaručuje, že súbežný registrácia request neskončí
    // unique-constraint chybou — druhý request len načíta existujúci id.
    const inserted = await withRetry(
      async () => {
        const { data, error } = await supabase
          .from('users')
          .upsert(
            { firebase_uid: req.user!.uid, email: req.user!.email ?? null, locale },
            { onConflict: 'firebase_uid' }
          )
          .select('id')
          .single();
        if (error) throw error;
        return data;
      },
      { label: 'ensureUser.upsert' }
    );

    uidToAppUserId.set(req.user.uid, inserted.id);
    req.appUserId = inserted.id;
    next();
  } catch (err) {
    next(err);
  }
}
