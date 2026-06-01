import { getAuth } from '../config/firebase';
import { isEmailEnabled, sendEmail } from '../config/email';
import { logger } from '../utils/logger';
import { httpError } from '../utils/httpError';
import { buildVerificationHtml, subjectFor, type EmailLocale } from './emailTemplates/verifyEmail';

const ACTION_REDIRECT_URL = 'https://pawly.sk/overenie-emailu';
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

export async function sendVerificationEmailFor(
  uid: string,
  email: string,
  locale: EmailLocale
): Promise<void> {
  // V produkcii bez RESEND_API_KEY by sa endpoint javil ako úspech, hoci mail nedoručíme.
  // Verification mail je core registračný flow — radšej fail-fast než tichý dry-run.
  if (!isEmailEnabled() && process.env.NODE_ENV === 'production') {
    throw httpError(503, 'Odosielanie e-mailov nie je nakonfigurované.', 'EMAIL_NOT_CONFIGURED');
  }

  const link = await withTimeout(
    getAuth().generateEmailVerificationLink(email, {
      url: ACTION_REDIRECT_URL,
      // handleCodeInApp:true → link smeruje priamo na našu /overenie-emailu stránku
      // s ?mode=verifyEmail&oobCode=... namiesto Firebase default action handlera
      // na firebaseapp.com. Naša stránka spracuje verifikáciu sama cez applyActionCode().
      handleCodeInApp: true,
    }),
    FIREBASE_LINK_TIMEOUT_MS,
    'Firebase generateEmailVerificationLink'
  );

  const subject = subjectFor(locale);
  const html = buildVerificationHtml(link, locale);

  await withTimeout(sendEmail(email, subject, html), EMAIL_SEND_TIMEOUT_MS, 'Resend sendEmail');

  // Pozor: link sa NIKDY neloguje (citlivý jednorazový token).
  logger.info('[verifyEmail] odoslané', { uid, locale });
}
