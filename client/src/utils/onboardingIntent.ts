export type OnboardingIntent = 'food' | 'passport';

const STORAGE_KEY = 'granule-check-onboarding-intent';
const TTL_MS = 30 * 60 * 1000; // 30 min — bráni únosu navigácie starým intentom

const isBrowser = typeof window !== 'undefined';

interface StoredIntent {
  intent: OnboardingIntent;
  ts: number;
}

function isOnboardingIntent(value: unknown): value is OnboardingIntent {
  return value === 'food' || value === 'passport';
}

export function setOnboardingIntent(intent: OnboardingIntent): void {
  if (!isBrowser) return;
  try {
    const payload: StoredIntent = { intent, ts: Date.now() };
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(payload));
  } catch {
    /* localStorage nedostupné (private mode) — onboarding intent je best-effort */
  }
}

export function getOnboardingIntent(): OnboardingIntent | null {
  if (!isBrowser) return null;
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as Partial<StoredIntent>;
    if (!isOnboardingIntent(parsed.intent) || typeof parsed.ts !== 'number') {
      clearOnboardingIntent();
      return null;
    }
    if (Date.now() - parsed.ts > TTL_MS) {
      clearOnboardingIntent();
      return null;
    }
    return parsed.intent;
  } catch {
    return null;
  }
}

export function clearOnboardingIntent(): void {
  if (!isBrowser) return;
  try {
    window.localStorage.removeItem(STORAGE_KEY);
  } catch {
    /* ignore */
  }
}

export function intentActionRoute(intent: OnboardingIntent): string {
  return intent === 'food' ? '/analyza' : '/zdravotny-pas';
}
