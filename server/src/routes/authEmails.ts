import { Router, type Request, type Response, type NextFunction } from 'express';
import { sendVerificationEmailFor } from '../services/emailVerificationService';
import type { EmailLocale } from '../services/emailTemplates/verifyEmail';
import { logger } from '../utils/logger';
import { httpError } from '../utils/httpError';

const router = Router();

function parseLocale(value: unknown): EmailLocale {
  return value === 'en' ? 'en' : 'sk';
}

router.post('/send-verification', async (req: Request, res: Response, next: NextFunction) => {
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
});

export default router;
