import { getOpenAIClient } from '../config/openai';
import { getSupabase } from '../config/supabase';
import { httpError } from '../utils/httpError';
import { logger } from '../utils/logger';
import { sanitizeOcrText } from '../utils/sanitizeOcrText';
import { AI_MODELS, MODEL_PRICING } from './aiService';

export const ARTICLE_AI_TYPES = [
  'outline',
  'rewrite',
  'meta_description',
  'faq',
  'summary',
  'source_check',
] as const;

export type ArticleAiType = (typeof ARTICLE_AI_TYPES)[number];

export interface ArticleAiInput {
  title?: string;
  body?: string;
  instruction?: string;
  category?: string;
  sources?: { label: string; url: string }[];
}

export interface ArticleAiResult {
  generationId: string;
  type: ArticleAiType;
  text?: string;
  faqs?: { q: string; a: string }[];
  headings?: string[];
}

export interface AiGenerationLog {
  id: string;
  type: ArticleAiType;
  model: string;
  inputTokens: number | null;
  outputTokens: number | null;
  estimatedCost: number | null;
  createdAt: string;
  userEmail: string | null;
}

const OPENAI_TIMEOUT_MS = 30_000;
const MAX_BODY = 6000;
const HEALTH_GUARD =
  ' Ide o zdravotný obsah o psoch: nediagnostikuj, neuvádzaj konkrétne dávkovanie liekov a pri rizikových témach odporuč konzultáciu s veterinárom.';

const PROMPTS: Record<ArticleAiType, { system: string; json: boolean; model: string }> = {
  meta_description: {
    system:
      'Si SEO editor. Napíš pútavý meta popis (120–160 znakov) pre článok o starostlivosti o psa. Vráť VÝHRADNE čistý text popisu, bez úvodzoviek a bez markdownu.',
    json: false,
    model: AI_MODELS.articleAuthoring,
  },
  summary: {
    system:
      'Si editor. Napíš stručný úvodný odsek (2–3 vety) ktorý vystihne článok a naláka na čítanie. Vráť VÝHRADNE čistý text, bez markdownu.',
    json: false,
    model: AI_MODELS.articleAuthoring,
  },
  rewrite: {
    system:
      'Si editor. Preformuluj zadaný text tak, aby bol jasnejší, plynulejší a čitateľnejší. Zachovaj význam a fakty, slovenčina, neutrálny tón. Vráť VÝHRADNE preformulovaný text bez komentára.',
    json: false,
    model: AI_MODELS.articleRewrite,
  },
  source_check: {
    system:
      'Si fact-checker. Porovnaj tvrdenia v texte s uvedenými zdrojmi. Upozorni na tvrdenia bez opory v zdrojoch a na tvrdenia ktoré pôsobia neoverene. Vráť stručný zoznam poznámok ako čistý text.',
    json: false,
    model: AI_MODELS.articleAuthoring,
  },
  faq: {
    system:
      'Si editor. Navrhni 3–5 častých otázok a odpovedí k téme článku. Odpovede 1–3 vety, vecné. Vráť VÝHRADNE JSON: {"items":[{"q":"...","a":"..."}]}.',
    json: true,
    model: AI_MODELS.articleAuthoring,
  },
  outline: {
    system:
      'Si editor. Navrhni logickú osnovu článku — 4–7 nadpisov sekcií (H2). Vráť VÝHRADNE JSON: {"headings":["...","..."]}.',
    json: true,
    model: AI_MODELS.articleAuthoring,
  },
};

function buildUserMessage(input: ArticleAiInput): string {
  const parts: string[] = [];
  if (input.title) parts.push(`Titulok: ${sanitizeOcrText(input.title).slice(0, 300)}`);
  if (input.instruction) parts.push(`Pokyn: ${sanitizeOcrText(input.instruction).slice(0, 1000)}`);
  if (input.body) parts.push(`Obsah:\n${sanitizeOcrText(input.body).slice(0, MAX_BODY)}`);
  if (input.sources && input.sources.length > 0) {
    parts.push(
      `Zdroje:\n${input.sources
        .map((s) => `- ${sanitizeOcrText(s.label)} (${sanitizeOcrText(s.url)})`)
        .join('\n')
        .slice(0, 2000)}`
    );
  }
  return parts.join('\n\n') || '(bez kontextu)';
}

function estimateCost(model: string, inTok: number, outTok: number): number | null {
  const price = MODEL_PRICING[model];
  if (!price) return null;
  return (inTok / 1000) * price.input + (outTok / 1000) * price.output;
}

export async function generateArticleAi(
  type: ArticleAiType,
  input: ArticleAiInput,
  userEmail: string | null,
  articleSlug?: string
): Promise<ArticleAiResult> {
  if (!ARTICLE_AI_TYPES.includes(type))
    throw httpError(400, 'Neplatný typ AI akcie.', 'INVALID_INPUT');

  const client = getOpenAIClient();
  if (!client) throw httpError(503, 'AI nie je nakonfigurované.', 'AI_UNAVAILABLE');

  const cfg = PROMPTS[type];
  const system = input.category === 'zdravie' ? cfg.system + HEALTH_GUARD : cfg.system;
  const userMessage = buildUserMessage(input);

  let response;
  try {
    response = await client.chat.completions.create(
      {
        model: cfg.model,
        temperature: 0.4,
        ...(cfg.json ? { response_format: { type: 'json_object' as const } } : {}),
        messages: [
          { role: 'system', content: system },
          { role: 'user', content: userMessage },
        ],
      },
      { timeout: OPENAI_TIMEOUT_MS }
    );
  } catch (err) {
    logger.error('AI generovanie článku zlyhalo', {
      type,
      error: err instanceof Error ? err.message : 'unknown',
    });
    throw httpError(502, 'AI generovanie zlyhalo.', 'AI_FAILED');
  }

  const content = response.choices[0]?.message?.content ?? '';
  const inputTokens = response.usage?.prompt_tokens ?? null;
  const outputTokens = response.usage?.completion_tokens ?? null;
  const estimatedCost =
    inputTokens != null && outputTokens != null
      ? estimateCost(cfg.model, inputTokens, outputTokens)
      : null;

  const { data, error } = await getSupabase()
    .from('ai_generations')
    .insert({
      user_email: userEmail,
      article_slug: articleSlug ?? null,
      type,
      prompt: userMessage.slice(0, 8000),
      response: content.slice(0, 8000),
      model: cfg.model,
      input_tokens: inputTokens,
      output_tokens: outputTokens,
      estimated_cost: estimatedCost,
    })
    .select('id')
    .single();
  if (error) throw error;

  const result: ArticleAiResult = {
    generationId: String((data as { id: string }).id),
    type,
  };

  if (type === 'faq') {
    try {
      const parsed = JSON.parse(content) as { items?: { q?: unknown; a?: unknown }[] };
      result.faqs = (parsed.items ?? [])
        .map((it) => ({ q: String(it.q ?? '').trim(), a: String(it.a ?? '').trim() }))
        .filter((it) => it.q && it.a);
    } catch {
      result.faqs = [];
    }
  } else if (type === 'outline') {
    try {
      const parsed = JSON.parse(content) as { headings?: unknown[] };
      result.headings = (parsed.headings ?? [])
        .map((h) => String(h ?? '').trim())
        .filter((h) => h.length > 0);
    } catch {
      result.headings = [];
    }
  } else {
    result.text = content.trim();
  }

  return result;
}

export async function listAiGenerations(slug: string): Promise<AiGenerationLog[]> {
  const { data, error } = await getSupabase()
    .from('ai_generations')
    .select('id, type, model, input_tokens, output_tokens, estimated_cost, created_at, user_email')
    .eq('article_slug', slug)
    .order('created_at', { ascending: false })
    .limit(100);
  if (error) throw error;
  type Row = Record<string, unknown>;
  return ((data as Row[] | null) ?? []).map((r) => ({
    id: String(r.id),
    type: r.type as ArticleAiType,
    model: String(r.model),
    inputTokens: typeof r.input_tokens === 'number' ? r.input_tokens : null,
    outputTokens: typeof r.output_tokens === 'number' ? r.output_tokens : null,
    estimatedCost:
      typeof r.estimated_cost === 'number' ? r.estimated_cost : Number(r.estimated_cost) || null,
    createdAt: String(r.created_at),
    userEmail: typeof r.user_email === 'string' ? r.user_email : null,
  }));
}

export async function articleHasAiGenerations(slug: string): Promise<boolean> {
  const { count, error } = await getSupabase()
    .from('ai_generations')
    .select('id', { count: 'exact', head: true })
    .eq('article_slug', slug);
  if (error) throw error;
  return (count ?? 0) > 0;
}
