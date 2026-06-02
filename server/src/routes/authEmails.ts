import { Router, type Request, type Response, type NextFunction } from 'express';
import rateLimit, { ipKeyGenerator } from 'express-rate-limit';
import { sendVerificationEmailFor } from '../services/emailVerificationService';
import { sendPasswordResetEmailFor } from '../services/passwordResetService';
import type { EmailLocale } from '../services/emailTemplates/verifyEmail';
import { firebaseAuth } from '../middleware/firebaseAuth';
import { logger } from '../utils/logger';
import { httpError } from '../utils/httpError';

const router = Router();

function parseLocale(value: unknown): EmailLocale {
  return value === 'en' ? 'en' : 'sk';
}

function parseEmail(value: unknown): string | null {
  if (typeof value !== 'string') return null;
  const trimmed = value.trim().toLowerCase();
  // jednoduchá validácia formátu — full validation rieši Firebase pri lookup
  if (trimmed.length < 5 || trimmed.length > 320 || !trimmed.includes('@')) return null;
  return trimmed;
}

const rateLimitedError = (message: string) => ({
  error: { message, code: 'RATE_LIMITED' },
});

// ─── /send-verification (AUTHENTICATED) ───────────────────────────
// Per-user rate limit by uid (firebaseAuth middleware sa stará o auth).
// Pre IP fallback (pred auth) treba ipKeyGenerator helper aby IPv6 useri
// neobehli limit (express-rate-limit v8+ enforced).
function uidOrIpKey(req: Request): string {
  return req.user?.uid ?? ipKeyGenerator(req.ip ?? '');
}

const verifyLimiter60s = rateLimit({
  windowMs: 60 * 1000,
  limit: 1,
  keyGenerator: uidOrIpKey,
  standardHeaders: 'draft-7',
  legacyHeaders: false,
  message: rateLimitedError('Počkaj chvíľu pred ďalším pokusom.'),
});
const verifyLimiterHour = rateLimit({
  windowMs: 60 * 60 * 1000,
  limit: 5,
  keyGenerator: uidOrIpKey,
  standardHeaders: 'draft-7',
  legacyHeaders: false,
  message: rateLimitedError('Prekročený hodinový limit, skús neskôr.'),
});

router.post(
  '/send-verification',
  firebaseAuth({ allowUnverified: true }),
  verifyLimiter60s,
  verifyLimiterHour,
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const user = req.user;
      if (!user) {
        throw httpError(401, 'Prihlásenie je povinné.', 'UNAUTHORIZED');
      }
      if (user.emailVerified === true) {
        throw httpError(400, 'E-mail je už overený.', 'ALREADY_VERIFIED');
      }
      if (!user.email) {
        throw httpError(400, 'Účet nemá priradenú e-mailovú adresu.', 'NO_EMAIL');
      }

      const locale = parseLocale((req.body as { locale?: unknown } | undefined)?.locale);

      try {
        await sendVerificationEmailFor(user.uid, user.email, locale);
      } catch (err) {
        logger.error('[authEmails] sendVerificationEmailFor zlyhalo', {
          uid: user.uid,
          reason: err instanceof Error ? err.message : String(err),
        });
        throw httpError(
          502,
          'Odoslanie overovacieho e-mailu zlyhalo. Skús to o chvíľu znova.',
          'EMAIL_SEND_FAILED'
        );
      }

      res.json({ ok: true });
    } catch (err) {
      next(err);
    }
  }
);

// ─── /send-password-reset (UNAUTHENTICATED) ──────────────────────
// User pri password reset nemá session — auth ho zaheslovaného neprihlasuje.
// Rate-limit by IP. Anti-enumeration: vraciame {ok:true} aj pre neexistujúce
// emaily aby útočník nevedel testovať validné účty.
const resetLimiter60s = rateLimit({
  windowMs: 60 * 1000,
  limit: 1,
  standardHeaders: 'draft-7',
  legacyHeaders: false,
  message: rateLimitedError('Počkaj chvíľu pred ďalším pokusom.'),
});
const resetLimiterHour = rateLimit({
  windowMs: 60 * 60 * 1000,
  limit: 5,
  standardHeaders: 'draft-7',
  legacyHeaders: false,
  message: rateLimitedError('Prekročený hodinový limit, skús neskôr.'),
});

router.post(
  '/send-password-reset',
  resetLimiter60s,
  resetLimiterHour,
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const body = (req.body ?? {}) as { email?: unknown; locale?: unknown };
      const email = parseEmail(body.email);
      if (!email) {
        throw httpError(400, 'Neplatný formát e-mailu.', 'INVALID_EMAIL');
      }
      const locale = parseLocale(body.locale);

      try {
        await sendPasswordResetEmailFor(email, locale);
      } catch (err) {
        logger.error('[authEmails] sendPasswordResetEmailFor zlyhalo', {
          // Email v logu OK (nie je secret), uid nemáme
          email,
          reason: err instanceof Error ? err.message : String(err),
        });
        // Anti-enumeration: na vonkajšok 200 OK, len logujeme.
        // Reálny mail provider/firebase issue nevidieť navonok.
      }

      res.json({ ok: true });
    } catch (err) {
      next(err);
    }
  }
);

export default router;
