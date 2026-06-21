import { Request, Response, NextFunction } from 'express';
import { httpError } from '../utils/httpError';

// Admin autorizácia cez env allowlist `ADMIN_EMAILS` (comma-separated). Bez DB
// schémy / custom claims — postačuje pre malý počet správcov obsahu. Vyžaduje,
// aby pred týmto middleware bežal firebaseAuth (nastaví req.user.email).

let cachedSet: Set<string> | null = null;

function adminSet(): Set<string> {
  if (cachedSet) return cachedSet;
  const raw = process.env.ADMIN_EMAILS ?? '';
  cachedSet = new Set(
    raw
      .split(',')
      .map((e) => e.trim().toLowerCase())
      .filter((e) => e.length > 0)
  );
  return cachedSet;
}

export function isAdminEmail(email?: string | null): boolean {
  if (!email) return false;
  return adminSet().has(email.toLowerCase());
}

export function requireAdmin(req: Request, _res: Response, next: NextFunction): void {
  if (!isAdminEmail(req.user?.email)) {
    next(httpError(403, 'Nemáš oprávnenie na túto akciu.', 'FORBIDDEN'));
    return;
  }
  next();
}
