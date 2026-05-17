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

export function sanitizeOcrText(raw: string): string {
  if (!raw) return '';

  const withoutFences = raw.replace(CODE_FENCE_RE, ' ');

  const cleanedLines = withoutFences.split(/\r?\n/).map((line) => {
    if (INJECTION_PATTERNS.some((re) => re.test(line))) {
      return '';
    }
    return line;
  });

  const cleaned = cleanedLines.join('\n').replace(/\n{3,}/g, '\n\n').trim();
  return cleaned;
}

export function wrapOcrForPrompt(raw: string): string {
  const cleaned = sanitizeOcrText(raw);
  return `${OCR_DELIM_START}\n${cleaned}\n${OCR_DELIM_END}`;
}
