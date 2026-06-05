import OpenAI from 'openai';
import { logger } from '../utils/logger';
import { AI_MODELS } from './aiService';
import {
  auditAiProcessing,
  assertPrivacyGuard,
  estimatePayloadSizeBytes,
  minimizePayloadForAi,
  type PrivacyGuardContext,
} from './privacyGuard';
import {
  EPISODE_CATEGORIES,
  EPISODE_OUTCOMES,
  EPISODE_SEVERITIES,
  type CurrentEpisodeInput,
  type EpisodeCategory,
  type EpisodeOutcome,
  type EpisodeSeverity,
  type PastEpisodeInput,
  type SimilarEpisodeSummary,
} from '../types/episode';

const SYSTEM_PROMPT = `Si veterinárny analytik ktorý porovnáva zdravotné epizódy psa.
Vstup: aktuálna epizóda (symptóm, popis, kategória) a zoznam minulých epizód toho istého psa.

Tvoja úloha:
1. Identifikuj epizódy podobné aktuálnej (rovnaká kategória + sémantická podobnosť symptómov).
2. Z polí whatWorked a whatDidntWork zhrň čo na podobné epizódy v minulosti zaberalo a čo nie.
3. Navrhni postup pre majiteľa pri aktuálnej epizóde — opatrne, bez stanovenia diagnózy.

Pravidlá:
- Žiadny markdown, žiadny text mimo JSON.
- Nikdy nediagnostikuj. Vždy odporuč konzultáciu s veterinárom pri závažnejších stavoch.
- Ak nie sú žiadne podobné epizódy, vráť prázdne similarEpisodeIds, summary "" a recommendation s odporúčaním navštíviť veterinára.
- Všetky texty v slovenčine.

Vráť VÝHRADNE validný JSON:
{
  "similarEpisodeIds": ["id1", "id2"],
  "summary": "Stručné zhrnutie 2-4 vety: čo v minulosti zabralo a čo nezabralo na podobné prípady.",
  "recommendation": "Konkrétne odporúčanie pre majiteľa 2-4 vety."
}`;

const MAX_PAST_EPISODES = 30;
const MAX_DESCRIPTION_LEN = 800;
const MAX_LESSONS_LEN = 500;
const OPENAI_TIMEOUT_MS = 30_000;

function getOpenAIClient(): OpenAI | null {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey || apiKey === 'your-key-here') return null;
  return new OpenAI({ apiKey });
}

function tokenize(value: string): Set<string> {
  return new Set(
    value
      .toLowerCase()
      .replace(/[^\p{L}\p{N}\s]+/gu, ' ')
      .split(/\s+/)
      .filter((w) => w.length >= 3)
  );
}

function jaccard(a: Set<string>, b: Set<string>): number {
  if (a.size === 0 && b.size === 0) return 0;
  let intersection = 0;
  for (const token of a) {
    if (b.has(token)) intersection += 1;
  }
  const union = a.size + b.size - intersection;
  return union === 0 ? 0 : intersection / union;
}

function preFilterEpisodes(
  current: CurrentEpisodeInput,
  past: PastEpisodeInput[]
): PastEpisodeInput[] {
  const currentTokens = tokenize(`${current.symptomTitle} ${current.symptomDescription ?? ''}`);
  const sameCategory = past.filter((e) => e.category === current.category);

  const scored = sameCategory.map((episode) => {
    const tokens = tokenize(`${episode.symptomTitle} ${episode.symptomDescription ?? ''}`);
    return { episode, score: jaccard(currentTokens, tokens) };
  });

  scored.sort((a, b) => b.score - a.score);

  return scored.slice(0, MAX_PAST_EPISODES).map((s) => s.episode);
}

function truncate(value: string | undefined, max: number): string {
  if (!value) return '';
  return value.length > max ? `${value.slice(0, max)}…` : value;
}

function shrinkEpisode(episode: PastEpisodeInput) {
  return {
    id: episode.id,
    symptomTitle: episode.symptomTitle,
    symptomDescription: truncate(episode.symptomDescription, MAX_DESCRIPTION_LEN),
    category: episode.category,
    severity: episode.severity ?? null,
    outcome: episode.outcome ?? null,
    whatWorked: episode.whatWorked ?? [],
    whatDidntWork: episode.whatDidntWork ?? [],
    lessonsLearned: truncate(episode.lessonsLearned, MAX_LESSONS_LEN),
    startedAt: episode.startedAt ?? null,
    endedAt: episode.endedAt ?? null,
  };
}

export function isEpisodeCategory(value: unknown): value is EpisodeCategory {
  return typeof value === 'string' && EPISODE_CATEGORIES.includes(value as EpisodeCategory);
}

function isEpisodeOutcome(value: unknown): value is EpisodeOutcome {
  return typeof value === 'string' && EPISODE_OUTCOMES.includes(value as EpisodeOutcome);
}

function isEpisodeSeverity(value: unknown): value is EpisodeSeverity {
  return typeof value === 'string' && EPISODE_SEVERITIES.includes(value as EpisodeSeverity);
}

export function validateCurrentEpisode(input: unknown): CurrentEpisodeInput | null {
  if (!input || typeof input !== 'object') return null;
  const i = input as Record<string, unknown>;
  if (typeof i.symptomTitle !== 'string' || !i.symptomTitle.trim()) return null;
  if (!isEpisodeCategory(i.category)) return null;
  return {
    symptomTitle: i.symptomTitle.trim(),
    symptomDescription: typeof i.symptomDescription === 'string' ? i.symptomDescription : '',
    category: i.category,
  };
}

export function validatePastEpisodes(input: unknown): PastEpisodeInput[] {
  if (!Array.isArray(input)) return [];
  const result: PastEpisodeInput[] = [];
  for (const entry of input) {
    if (!entry || typeof entry !== 'object') continue;
    const e = entry as Record<string, unknown>;
    if (typeof e.id !== 'string' || !e.id) continue;
    if (typeof e.symptomTitle !== 'string' || !e.symptomTitle.trim()) continue;
    if (!isEpisodeCategory(e.category)) continue;

    const record: PastEpisodeInput = {
      id: e.id,
      symptomTitle: e.symptomTitle.trim(),
      symptomDescription: typeof e.symptomDescription === 'string' ? e.symptomDescription : '',
      category: e.category,
      startedAt: typeof e.startedAt === 'string' ? e.startedAt : undefined,
      endedAt: typeof e.endedAt === 'string' ? e.endedAt : undefined,
      outcome: isEpisodeOutcome(e.outcome) ? e.outcome : undefined,
      severity: isEpisodeSeverity(e.severity) ? e.severity : undefined,
      whatWorked: Array.isArray(e.whatWorked)
        ? e.whatWorked.filter((x): x is string => typeof x === 'string')
        : [],
      whatDidntWork: Array.isArray(e.whatDidntWork)
        ? e.whatDidntWork.filter((x): x is string => typeof x === 'string')
        : [],
      lessonsLearned: typeof e.lessonsLearned === 'string' ? e.lessonsLearned : undefined,
    };
    result.push(record);
  }
  return result;
}

function buildFallbackResult(
  candidates: PastEpisodeInput[],
  reason: string
): SimilarEpisodeSummary {
  return {
    similarEpisodeIds: candidates.map((e) => e.id).slice(0, 5),
    summary: '',
    recommendation: `${reason} Pri závažnejšom alebo opakujúcom sa stave sa poraď s veterinárom.`,
  };
}

export async function summarizeSimilarEpisodes(
  current: CurrentEpisodeInput,
  past: PastEpisodeInput[],
  privacy?: PrivacyGuardContext
): Promise<SimilarEpisodeSummary> {
  const candidates = preFilterEpisodes(current, past);

  if (candidates.length === 0) {
    return {
      similarEpisodeIds: [],
      summary: '',
      recommendation:
        'V histórii nie sú žiadne podobné epizódy. Pri závažnejšom stave sa poraď s veterinárom.',
    };
  }

  const client = getOpenAIClient();
  if (!client) {
    logger.warn('OpenAI API kľúč chýba, vraciam lokálnu sumarizáciu podobných epizód');
    return buildFallbackResult(candidates, 'AI sumarizácia nie je dostupná.');
  }

  const userMessage = JSON.stringify(
    minimizePayloadForAi({
      currentEpisode: {
        symptomTitle: current.symptomTitle,
        symptomDescription: truncate(current.symptomDescription, MAX_DESCRIPTION_LEN),
        category: current.category,
      },
      pastEpisodes: candidates.map(shrinkEpisode),
    })
  );
  assertPrivacyGuard(privacy ?? { processesHealthData: false }, userMessage);

  try {
    const response = await client.chat.completions.create(
      {
        model: AI_MODELS.episodeSummary,
        temperature: 0.2,
        response_format: { type: 'json_object' },
        messages: [
          { role: 'system', content: SYSTEM_PROMPT },
          { role: 'user', content: userMessage },
        ],
      },
      { timeout: OPENAI_TIMEOUT_MS }
    );

    auditAiProcessing({
      userId: privacy?.userId,
      operation: 'episodes.similar_summary',
      provider: 'openai',
      payloadSizeBytes: estimatePayloadSizeBytes(userMessage),
    });

    const content = response.choices[0]?.message?.content;
    if (!content) {
      return buildFallbackResult(candidates, 'AI vrátila prázdnu odpoveď.');
    }

    const parsed = JSON.parse(content) as Record<string, unknown>;
    const allowedIds = new Set(candidates.map((c) => c.id));
    const similarEpisodeIds = Array.isArray(parsed.similarEpisodeIds)
      ? parsed.similarEpisodeIds.filter(
          (id): id is string => typeof id === 'string' && allowedIds.has(id)
        )
      : [];
    const summary = typeof parsed.summary === 'string' ? parsed.summary : '';
    const recommendation = typeof parsed.recommendation === 'string' ? parsed.recommendation : '';

    return { similarEpisodeIds, summary, recommendation };
  } catch (err) {
    logger.error('AI sumarizácia epizód zlyhala', {
      error: err instanceof Error ? err.message : 'unknown',
    });
    throw err;
  }
}
