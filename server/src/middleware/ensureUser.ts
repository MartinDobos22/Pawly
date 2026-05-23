import { Request, Response, NextFunction } from 'express';
import { getSupabase } from '../config/supabase';

export async function ensureUser(req: Request, _res: Response, next: NextFunction): Promise<void> {
  try {
    if (!req.user) {
      const err = new Error('Prihlásenie je povinné.') as Error & { status: number; code: string };
      err.status = 401;
      err.code = 'UNAUTHORIZED';
      throw err;
    }

    const supabase = getSupabase();
    const { data, error } = await supabase
      .from('users')
      .upsert(
        { firebase_uid: req.user.uid, email: req.user.email ?? null },
        { onConflict: 'firebase_uid' }
      )
      .select('id')
      .single();

    if (error) throw error;

    req.appUserId = data.id;
    next();
  } catch (err) {
    next(err);
  }
}
