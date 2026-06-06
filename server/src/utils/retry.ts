import { logger } from './logger';

interface RetryOptions {
  attempts?: number;
  baseDelayMs?: number;
  label?: string;
}

/**
 * Tranzientná chyba: sieťový timeout, 5xx, ECONNRESET, Supabase „connection
 * terminated". Validačné chyby (4xx, unique constraint, RLS) NEretryujeme.
 */
function isTransient(err: unknown): boolean {
  if (!err || typeof err !== 'object') return false;
  const e = err as { code?: string; status?: number; message?: string };
  if (typeof e.status === 'number' && e.status >= 500 && e.status < 600) return true;
  const code = (e.code ?? '').toString().toUpperCase();
  if (
    code === 'ETIMEDOUT' ||
    code === 'ECONNRESET' ||
    code === 'ECONNREFUSED' ||
    code === 'ENOTFOUND' ||
    code === 'EAI_AGAIN'
  ) {
    return true;
  }
  const msg = (e.message ?? '').toLowerCase();
  return msg.includes('timeout') || msg.includes('fetch failed') || msg.includes('network');
}

const sleep = (ms: number) => new Promise<void>((resolve) => setTimeout(resolve, ms));

export async function withRetry<T>(fn: () => Promise<T>, options: RetryOptions = {}): Promise<T> {
  const attempts = options.attempts ?? 3;
  const baseDelayMs = options.baseDelayMs ?? 200;
  const label = options.label ?? 'op';

  let lastError: unknown;
  for (let attempt = 1; attempt <= attempts; attempt += 1) {
    try {
      return await fn();
    } catch (err) {
      lastError = err;
      if (attempt === attempts || !isTransient(err)) throw err;
      const delay = baseDelayMs * 2 ** (attempt - 1);
      logger.warn('Retry po tranzientnej chybe', {
        label,
        attempt,
        nextDelayMs: delay,
        message: err instanceof Error ? err.message : 'unknown',
      });
      await sleep(delay);
    }
  }
  throw lastError;
}
