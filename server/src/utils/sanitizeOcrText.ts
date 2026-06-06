/**
 * Sanitizuje OCR text predtým než pôjde ako user message do LLM.
 * Bráni prompt injection: OCR z dokumentu by sa nemal interpretovať ako pokyny.
 *
 * Stripneme riadky ktoré sa podobajú na pokusy o injection a obalíme text
 * do explicitných delimiterov aby AI vedela rozlíšiť dáta od inštrukcií.
 */

const INJECTION_PATTERNS: RegExp[] = [
  /^\s*ignore\s+(all\s+)?(previous|prior|above)/i,
  /^\s*disregard\s+(the\s+)?(previous|prior|above)/i,
  /^\s*forget\s+(everything|all|the)/i,
  /^\s*you\s+(are\s+)?(now|currently)\b/i,
  /^\s*system\s*:/i,
  /^\s*assistant\s*:/i,
  /^\s*###\s*(system|instruction|prompt)/i,
  /^\s*instructions?\s*:/i,
  /^\s*new\s+(instructions?|task|role)/i,
  /^\s*act\s+as\b/i,
  /^\s*pretend\s+(you|to)/i,
  /^\s*output\s*:?\s*just/i,
  /^\s*respond\s+(only\s+)?with\b/i,
];

const CODE_FENCE_RE = /```[\s\S]*?```/g;

export const OCR_DELIM_START = '<<<OCR_DATA>>>';
export const OCR_DELIM_END = '<<<END_OCR_DATA>>>';

export const USER_QUERY_DELIM_START = '<<<USER_QUERY>>>';
export const USER_QUERY_DELIM_END = '<<<END_USER_QUERY>>>';

const MAX_USER_QUERY_LEN = 500;

export function sanitizeOcrText(raw: string): string {
  if (!raw) return '';

  const withoutFences = raw.replace(CODE_FENCE_RE, ' ');

  const cleanedLines = withoutFences.split(/\r?\n/).map((line) => {
    if (INJECTION_PATTERNS.some((re) => re.test(line))) {
      return '';
    }
    return line;
  });

  const cleaned = cleanedLines
    .join('\n')
    .replace(/\n{3,}/g, '\n\n')
    .trim();
  return cleaned;
}

export function wrapOcrForPrompt(raw: string): string {
  const cleaned = sanitizeOcrText(raw);
  return `${OCR_DELIM_START}\n${cleaned}\n${OCR_DELIM_END}`;
}

/**
 * Obalí krátky user-typed dotaz (napr. food-safety query) do delimiterov
 * podobne ako OCR text. Truncate na 500 znakov — typický food-safety dotaz
 * má < 50 znakov, viac značí pokus o injection padding alebo legitímny
 * paste-spam ktorý nemá zmysel posielať do AI.
 */
export function wrapUserQueryForPrompt(raw: string): string {
  const truncated = raw.slice(0, MAX_USER_QUERY_LEN);
  const cleaned = sanitizeOcrText(truncated);
  return `${USER_QUERY_DELIM_START}\n${cleaned}\n${USER_QUERY_DELIM_END}`;
}
