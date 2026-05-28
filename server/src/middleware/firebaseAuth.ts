import { Request, Response, NextFunction } from 'express';
import { getAuth } from '../config/firebase';
import { logger } from '../utils/logger';

class AuthError extends Error {
  status: number;
  code: string;

  constructor(message: string, code: string, status = 401) {
    super(message);
    this.code = code;
    this.status = status;
  }
}

export async function firebaseAuth(
  req: Request,
  _res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const header = req.headers.authorization;
    if (!header || !header.startsWith('Bearer ')) {
      throw new AuthError('Prihlásenie je povinné.', 'UNAUTHORIZED');
    }

    const idToken = header.slice('Bearer '.length).trim();
    if (!idToken) {
      throw new AuthError('Prihlásenie je povinné.', 'UNAUTHORIZED');
    }

    const decoded = await getAuth().verifyIdToken(idToken);
    req.user = { uid: decoded.uid, email: decoded.email };
    next();
  } catch (err) {
    if (err instanceof AuthError) {
      next(err);
      return;
    }
    logger.error('Overenie Firebase tokenu zlyhalo', {
      path: req.originalUrl,
      reason: err instanceof Error ? err.message : String(err),
      code: (err as { code?: string }).code,
    });
    next(new AuthError('Neplatný alebo expirovaný prihlasovací token.', 'INVALID_TOKEN'));
  }
}
