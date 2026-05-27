import { Resend } from 'resend';
import { logger } from '../utils/logger';

let cached: Resend | null = null;

/** Feature-flag: e-mail je aktívny len ak je nastavený RESEND_API_KEY. */
export function isEmailEnabled(): boolean {
  return Boolean(process.env.RESEND_API_KEY && process.env.RESEND_API_KEY.trim());
}

function getClient(): Resend | null {
  if (!isEmailEnabled()) return null;
  if (!cached) cached = new Resend(process.env.RESEND_API_KEY);
  return cached;
}

/**
 * Pošle e-mail cez Resend. Ak chýba kľúč, len zaloguje (dry-run) — appka funguje aj bez
 * nakonfigurovaného providera.
 */
export async function sendEmail(to: string, subject: string, html: string): Promise<void> {
  const client = getClient();
  const from = process.env.NOTIFY_FROM_EMAIL ?? 'Pawport <onboarding@resend.dev>';

  if (!client) {
    logger.info('[email] dry-run — RESEND_API_KEY nie je nastavený, e-mail sa neodoslal', {
      to,
      subject,
    });
    return;
  }

  const { error } = await client.emails.send({ from, to, subject, html });
  if (error) {
    throw new Error(`Odoslanie e-mailu zlyhalo: ${error.message}`);
  }
}
