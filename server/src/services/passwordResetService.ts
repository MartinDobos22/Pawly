import { getAuth } from '../config/firebase';
import { isEmailEnabled, sendEmail } from '../config/email';
import { logger } from '../utils/logger';
import { httpError } from '../utils/httpError';
import { buildAppActionUrl } from './actionLinkBuilder';
import { buildPasswordResetHtml, passwordResetSubjectFor } from './emailTemplates/passwordReset';
import type { EmailLocale } from './emailTemplates/verifyEmail';

const ACTION_REDIRECT_URL = 'https://pawly.sk/login';
const FIREBASE_LINK_TIMEOUT_MS = 10_000;
const EMAIL_SEND_TIMEOUT_MS = 10_000;

function withTimeout<T>(promise: Promise<T>, ms: number, label: string): Promise<T> {
  return new Promise<T>((resolve, reject) => {
    const timer = setTimeout(() => {
      reject(new Error(`${label}: timeout po ${ms} ms`));
    }, ms);
    promise.then(
      (value) => {
        clearTimeout(timer);
        resolve(value);
      },
      (err) => {
        clearTimeout(timer);
        reject(err);
      }
    );
  });
}

/**
 * Pošle password reset email. Anti-enumeration: ak email neexistuje vo Firebase,
 * funkcia tichо vráti void (žiadny error). Caller (route handler) by mal vždy
 * vrátiť `200 { ok: true }` aby útočník nevedel zistiť či účet existuje.
 */
export async function sendPasswordResetEmailFor(email: string, locale: EmailLocale): Promise<void> {
  if (!isEmailEnabled() && process.env.NODE_ENV === 'production') {
    throw httpError(503, 'Odosielanie e-mailov nie je nakonfigurované.', 'EMAIL_NOT_CONFIGURED');
  }

  let firebaseLink: string;
  try {
    firebaseLink = await withTimeout(
      getAuth().generatePasswordResetLink(email, {
        url: ACTION_REDIRECT_URL,
        handleCodeInApp: true,
      }),
      FIREBASE_LINK_TIMEOUT_MS,
      'Firebase generatePasswordResetLink'
    );
  } catch (err) {
    const code = (err as { code?: string }).code;
    // Anti-enumeration — pre neexistujúci email vrátime "success" navonok.
    // Logujeme len že email neexistuje, link sa nikdy neloguje.
    if (code === 'auth/user-not-found' || code === 'auth/email-not-found') {
      logger.info('[passwordReset] email neexistuje — anti-enumeration silent ok');
      return;
    }
    throw err;
  }

  // Re-build URL na pawly.sk doménu.
  const link = buildAppActionUrl(firebaseLink, 'resetPassword');

  const subject = passwordResetSubjectFor(locale);
  const html = buildPasswordResetHtml(link, locale);

  await withTimeout(sendEmail(email, subject, html), EMAIL_SEND_TIMEOUT_MS, 'Resend sendEmail');

  // Pozor: link sa NIKDY neloguje.
  logger.info('[passwordReset] odoslané', { locale });
}
