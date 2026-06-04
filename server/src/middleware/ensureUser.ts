import { Request, Response, NextFunction } from 'express';
import { getSupabase } from '../config/supabase';

const uidToAppUserId = new Map<string, string>();

export async function ensureUser(req: Request, _res: Response, next: NextFunction): Promise<void> {
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

    const { data: existing, error: selectError } = await supabase
      .from('users')
      .select('id')
      .eq('firebase_uid', req.user.uid)
      .maybeSingle();

    if (selectError) throw selectError;

    if (existing) {
      uidToAppUserId.set(req.user.uid, existing.id);
      req.appUserId = existing.id;
      next();
      return;
    }

    const { data: inserted, error: upsertError } = await supabase
      .from('users')
      .upsert(
        { firebase_uid: req.user.uid, email: req.user.email ?? null },
        { onConflict: 'firebase_uid' }
      )
      .select('id')
      .single();

    if (upsertError) throw upsertError;

    uidToAppUserId.set(req.user.uid, inserted.id);
    req.appUserId = inserted.id;
    next();
  } catch (err) {
    next(err);
  }
}
