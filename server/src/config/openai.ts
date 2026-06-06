import OpenAI from 'openai';

const OPENAI_TIMEOUT_MS = 45_000;

let cachedClient: OpenAI | null = null;

function readApiKey(): string | null {
  const raw = process.env.OPENAI_API_KEY?.trim();
  if (!raw || raw === 'your-key-here') return null;
  return raw;
}

/**
 * Volá sa raz pri štarte (index.ts). Vyhodí ak kľúč chýba — v produkcii to
 * nechceme tichú degradáciu, lebo všetky AI endpointy by potom vracali 502
 * bez varovania v deploy logoch.
 */
export function assertOpenAIConfigured(): void {
  if (!readApiKey()) {
    throw new Error(
      'Chýba povinná premenná prostredia: OPENAI_API_KEY. Pozri server/.env.example.'
    );
  }
}

/**
 * Vracia null ak kľúč nie je nakonfigurovaný. Service vrstva sa rozhoduje
 * sama, či graceful degradovať (napr. vrátiť prázdny string z OCR) alebo
 * 502. Po `assertOpenAIConfigured()` v startup ceste by null nemal nikdy
 * nastať okrem misconfigurovaného testovacieho prostredia.
 */
export function getOpenAIClient(): OpenAI | null {
  const apiKey = readApiKey();
  if (!apiKey) return null;
  if (!cachedClient) {
    cachedClient = new OpenAI({ apiKey, timeout: OPENAI_TIMEOUT_MS, maxRetries: 1 });
  }
  return cachedClient;
}
