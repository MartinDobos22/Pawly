import { logger } from '../utils/logger';
import { httpError } from '../utils/httpError';

export type AiProvider = 'openai' | 'google-vision' | 'local-pdf-parser' | 'mock';

export interface PrivacyGuardContext {
  userId?: string;
  aiProcessingConsent?: boolean;
  processesHealthData?: boolean;
}

export interface AuditAiProcessingInput {
  userId?: string;
  operation: string;
  provider: AiProvider;
  payloadSizeBytes: number;
  timestamp?: string;
}

const HEALTH_DATA_KEYWORDS = [
  'zdravot',
  'veterin',
  'passport',
  'pas',
  'očkov',
  'vaccin',
  'rabies',
  'diagn',
  'laborat',
  'výsled',
  'medication',
  'lieč',
  'symptom',
  'alerg',
  'intoler',
  'chronic',
  'chron',
  'microchip',
];

const IDENTIFIER_KEYS = new Set([
  'uid',
  'userId',
  'appUserId',
  'firebaseUid',
  'email',
  'phone',
  'fileName',
  'photoUrl',
  'microchipNumber',
  'passportNumber',
  'attachmentLabel',
]);

export function looksLikeHealthData(input: unknown): boolean {
  if (typeof input === 'string') {
    const normalized = input.toLowerCase();
    return HEALTH_DATA_KEYWORDS.some((keyword) => normalized.includes(keyword));
  }
  if (Array.isArray(input)) return input.some(looksLikeHealthData);
  if (!input || typeof input !== 'object') return false;
  return Object.entries(input as Record<string, unknown>).some(([key, value]) => {
    if (HEALTH_DATA_KEYWORDS.some((keyword) => key.toLowerCase().includes(keyword))) return true;
    return looksLikeHealthData(value);
  });
}

export function assertAiProcessingAllowed({
  processesHealthData,
  consentGranted,
}: {
  processesHealthData: boolean;
  consentGranted?: boolean;
}): void {
  if (processesHealthData && consentGranted !== true) {
    throw httpError(
      403,
      'Na AI/OCR spracovanie zdravotných údajov je potrebný výslovný súhlas používateľa.',
      'AI_HEALTH_CONSENT_REQUIRED'
    );
  }
}

export function assertPrivacyGuard(context: PrivacyGuardContext, payload?: unknown): void {
  const processesHealthData = context.processesHealthData ?? looksLikeHealthData(payload);
  assertAiProcessingAllowed({
    processesHealthData,
    consentGranted: context.aiProcessingConsent,
  });
}

export function minimizePayloadForAi<T>(payload: T): T {
  return stripIdentifiers(payload) as T;
}

function stripIdentifiers(value: unknown): unknown {
  if (Array.isArray(value)) return value.map(stripIdentifiers);
  if (!value || typeof value !== 'object') return value;

  const output: Record<string, unknown> = {};
  for (const [key, nestedValue] of Object.entries(value as Record<string, unknown>)) {
    if (IDENTIFIER_KEYS.has(key)) continue;
    output[key] = stripIdentifiers(nestedValue);
  }
  return output;
}

export function estimatePayloadSizeBytes(payload: unknown): number {
  if (typeof payload === 'string') return Buffer.byteLength(payload, 'utf8');
  if (Buffer.isBuffer(payload)) return payload.byteLength;
  try {
    return Buffer.byteLength(JSON.stringify(payload), 'utf8');
  } catch {
    return 0;
  }
}

export function auditAiProcessing({
  userId,
  operation,
  provider,
  payloadSizeBytes,
  timestamp = new Date().toISOString(),
}: AuditAiProcessingInput): void {
  logger.info('AI privacy audit', {
    userId: userId ?? 'unknown',
    operation,
    provider,
    payloadSizeBytes,
    timestamp,
  });
}

export function buildPrivacyContext(input: PrivacyGuardContext): PrivacyGuardContext {
  return {
    userId: input.userId,
    aiProcessingConsent: input.aiProcessingConsent,
    processesHealthData: input.processesHealthData,
  };
}
