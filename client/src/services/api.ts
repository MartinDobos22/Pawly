import { AnalysisRequest, AnalysisResult, FileExtractionResult, PetProfile } from '../types';
import { logger } from '../utils/logger';
import type {
  EpisodeCategory,
  HealthEpisodeRecord,
  SimilarEpisodeSummary,
} from '../types/healthEpisode';

const BASE_URL = import.meta.env.VITE_API_URL ?? '';

function sanitizePetProfileForAnalyze(petProfile?: PetProfile): PetProfile | undefined {
  if (!petProfile) return undefined;

  return {
    id: petProfile.id,
    name: petProfile.name,
    animalType: petProfile.animalType,
    breed: petProfile.breed,
    dateOfBirth: petProfile.dateOfBirth,
    sex: petProfile.sex,
    ageYears: petProfile.ageYears,
    ageMonths: petProfile.ageMonths,
    weightKg: petProfile.weightKg,
    microchipNumber: petProfile.microchipNumber,
    passportNumber: petProfile.passportNumber,
    size: petProfile.size,
    lifeStage: petProfile.lifeStage,
    activityLevel: petProfile.activityLevel,
    allergies: petProfile.allergies,
    intolerances: petProfile.intolerances,
    healthConditions: petProfile.healthConditions,
    notes: petProfile.notes,
  };
}

export async function analyzeComposition(
  composition: string,
  petProfile?: PetProfile
): Promise<AnalysisResult> {
  const requestPayload: AnalysisRequest = {
    composition,
    sourceType: 'text',
    petProfile: sanitizePetProfileForAnalyze(petProfile),
  };

  logger.info('Odosielam textovú analýzu na backend', {
    compositionLength: composition.length,
    hasPetProfile: Boolean(petProfile),
  });

  const res = await fetch(`${BASE_URL}/api/analyze`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(requestPayload),
  });

  if (!res.ok) {
    logger.error('Textová analýza zlyhala', { status: res.status });
    const body = (await res.json().catch(() => null)) as {
      error?: { message?: string } | string;
    } | null;
    const message =
      typeof body?.error === 'string'
        ? body.error
        : (body?.error?.message ?? `Chyba servera (${res.status})`);
    throw new Error(message);
  }

  const responsePayload = (await res.json()) as AnalysisResult;
  logger.info('Textová analýza úspešne dokončená', {
    score: responsePayload.score,
    ingredientsCount: responsePayload.ingredients.length,
  });

  return responsePayload;
}

export async function analyzeAttachment(
  attachment: AnalysisRequest['attachment'],
  examAlias?: string
): Promise<FileExtractionResult> {
  const requestPayload = {
    sourceType: 'file',
    attachment,
    examAlias,
  } satisfies AnalysisRequest;

  logger.info('Odosielam súbor na analýzu', {
    fileName: attachment?.fileName,
    mimeType: attachment?.mimeType,
    examAlias: examAlias ?? null,
    base64Length: attachment?.base64Data?.length ?? 0,
  });

  const res = await fetch(`${BASE_URL}/api/analyze`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(requestPayload),
  });

  if (!res.ok) {
    logger.error('Súborová analýza zlyhala', { status: res.status });
    const body = (await res.json().catch(() => null)) as {
      error?: { message?: string } | string;
    } | null;
    const message =
      typeof body?.error === 'string'
        ? body.error
        : (body?.error?.message ?? `Chyba servera (${res.status})`);
    throw new Error(message);
  }

  const responsePayload = (await res.json()) as FileExtractionResult;
  logger.info('Súborová analýza úspešne dokončená', {
    source: responsePayload.source,
    extractedTextLength: responsePayload.extractedText.length,
    contextDocumentType: responsePayload.contextAnalysis?.documentType ?? null,
    selectedExamAlias: responsePayload.examAnalysis?.examAlias ?? examAlias ?? null,
    selectedExamType: responsePayload.examAnalysis?.examType ?? null,
  });

  return responsePayload;
}

export async function extractTextFromImage(attachment: {
  fileName: string;
  mimeType: string;
  base64Data: string;
}): Promise<{ extractedText: string; source: 'google-vision' | 'openai' | 'pdf-parser' | 'none' }> {
  logger.info('Odosielam súbor na OCR extrakciu', {
    fileName: attachment.fileName,
    mimeType: attachment.mimeType,
    base64Length: attachment.base64Data.length,
  });

  const res = await fetch(`${BASE_URL}/api/extract-text`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ attachment }),
  });

  if (!res.ok) {
    logger.error('OCR extrakcia zlyhala', { status: res.status });
    const body = (await res.json().catch(() => null)) as { error?: { message?: string } } | null;
    throw new Error(body?.error?.message ?? `Chyba servera (${res.status})`);
  }

  const payload = (await res.json()) as {
    extractedText: string;
    source: 'google-vision' | 'openai' | 'pdf-parser' | 'none';
  };
  logger.info('OCR extrakcia dokončená', {
    source: payload.source,
    extractedTextLength: payload.extractedText.length,
  });
  return payload;
}

export interface PassportInterpretation {
  summary?: string;
  aiUnderstanding?: string;
  vaccinations: Array<{
    disease: string;
    vaccineName: string;
    dateAdministered: string;
    validUntil?: string;
    batchNumber?: string;
    veterinarian?: string;
    manufacturer?: string;
    confidence: 'high' | 'medium' | 'low';
    notes?: string;
  }>;
}

export async function interpretPassportText(text: string): Promise<PassportInterpretation> {
  logger.info('Odosielam text pasu na AI interpretáciu', { textLength: text.length });

  const res = await fetch(`${BASE_URL}/api/interpret-passport`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ text }),
  });

  if (!res.ok) {
    logger.error('Interpretácia pasu zlyhala', { status: res.status });
    const body = (await res.json().catch(() => null)) as { error?: { message?: string } } | null;
    throw new Error(body?.error?.message ?? `Chyba servera (${res.status})`);
  }

  const payload = (await res.json()) as PassportInterpretation;
  logger.info('Interpretácia pasu prijatá', {
    vaccinationsCount: payload.vaccinations?.length ?? 0,
  });
  return payload;
}

interface SimilarSummaryRequest {
  symptomTitle: string;
  symptomDescription: string;
  category: EpisodeCategory;
}

function stripAttachments(episodes: HealthEpisodeRecord[]) {
  return episodes.map((e) => ({
    id: e.id,
    symptomTitle: e.symptomTitle,
    symptomDescription: e.symptomDescription,
    category: e.category,
    startedAt: e.startedAt,
    endedAt: e.endedAt,
    outcome: e.outcome,
    severity: e.severity,
    whatWorked: e.whatWorked,
    whatDidntWork: e.whatDidntWork,
    lessonsLearned: e.lessonsLearned,
  }));
}

export async function fetchSimilarEpisodeSummary(
  currentEpisode: SimilarSummaryRequest,
  pastEpisodes: HealthEpisodeRecord[]
): Promise<SimilarEpisodeSummary> {
  const payload = {
    currentEpisode,
    pastEpisodes: stripAttachments(pastEpisodes),
  };

  logger.info('Odosielam similar-summary na backend', {
    category: currentEpisode.category,
    pastCount: pastEpisodes.length,
  });

  const res = await fetch(`${BASE_URL}/api/episodes/similar-summary`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });

  if (!res.ok) {
    const body = (await res.json().catch(() => null)) as {
      error?: { message?: string; code?: string } | string;
    } | null;
    const message =
      typeof body?.error === 'string'
        ? body.error
        : (body?.error?.message ?? `Chyba servera (${res.status})`);
    logger.error('similar-summary zlyhalo', { status: res.status });
    throw new Error(message);
  }

  return (await res.json()) as SimilarEpisodeSummary;
}
