import { useCallback, useReducer } from 'react';

import { useLocalStorage } from '../../../hooks/useLocalStorage';
import { extractTextFromImage, interpretPassportText } from '../../../services/api';
import type { VaccinationRecord } from '../../../types/dogHealth';
import { VetVisitHelper, type VisitBundle } from '../../../utils/vetVisitHelper';
import type { PetProfilePatch } from '../../../utils/petProfileMerge';
import type { AiDetectedDraftRecord } from '../hpTypes';
import { MAX_FILE_SIZE_BYTES, SUPPORTED_FILE_TYPES } from '../constants';
import {
  inferAiTargetType,
  isDuplicateVaccination,
  normalizeDateInput,
  plusDays,
  today,
  uid,
} from '../utils';

import type {
  AiAttachmentEntry,
  AiFormState,
  AiStep,
  AiVisitDraftValues,
  AnalyzeProgress,
} from './formTypes';

const MAX_ATTACHMENTS = 8;

const INITIAL_VISIT_DRAFT: AiVisitDraftValues = {
  date: today(),
  clinicName: '',
  diagnosis: '',
  recommendations: '',
};

export const INITIAL_AI_STATE: AiFormState = {
  step: 0,
  attachments: [],
  attachmentError: '',
  attachmentLabel: '',
  analyzeError: '',
  analyzeProgress: null,
  selectedMainCategory: '',
  selectedSubcategory: '',
  aiDetectedRecords: [],
  useVisitDetailsFromManual: false,
  visitDraft: INITIAL_VISIT_DRAFT,
  feedback: null,
  detectedProfilePatch: null,
};

type AiAction =
  | { type: 'SET_STEP'; step: AiStep }
  | { type: 'ADD_ATTACHMENTS'; entries: AiAttachmentEntry[] }
  | { type: 'REMOVE_ATTACHMENT'; id: string }
  | { type: 'CLEAR_ATTACHMENTS' }
  | { type: 'SET_ATTACHMENT_ERROR'; message: string }
  | { type: 'SET_ATTACHMENT_LABEL'; label: string }
  | { type: 'SET_ANALYZE_PROGRESS'; progress: AnalyzeProgress | null }
  | { type: 'SET_ANALYZE_ERROR'; message: string }
  | { type: 'SET_MAIN_CATEGORY'; value: string }
  | { type: 'SET_SUBCATEGORY'; value: string }
  | { type: 'SET_AI_RECORDS'; records: AiDetectedDraftRecord[] }
  | { type: 'UPDATE_AI_RECORD'; id: string; patch: Partial<AiDetectedDraftRecord> }
  | { type: 'SET_VISIT_DRAFT_FIELD'; field: keyof AiVisitDraftValues; value: string }
  | { type: 'SET_FEEDBACK'; message: string | null }
  | { type: 'SET_PROFILE_PATCH'; patch: PetProfilePatch | null }
  | { type: 'RESET' };

function reducer(state: AiFormState, action: AiAction): AiFormState {
  switch (action.type) {
    case 'SET_STEP':
      return { ...state, step: action.step };
    case 'ADD_ATTACHMENTS': {
      const next = [...state.attachments, ...action.entries].slice(0, MAX_ATTACHMENTS);
      return { ...state, attachments: next, attachmentError: '' };
    }
    case 'REMOVE_ATTACHMENT':
      return {
        ...state,
        attachments: state.attachments.filter((a) => a.id !== action.id),
      };
    case 'CLEAR_ATTACHMENTS':
      return { ...state, attachments: [], attachmentError: '' };
    case 'SET_ATTACHMENT_ERROR':
      return { ...state, attachmentError: action.message };
    case 'SET_ATTACHMENT_LABEL':
      return { ...state, attachmentLabel: action.label };
    case 'SET_ANALYZE_PROGRESS':
      return { ...state, analyzeProgress: action.progress };
    case 'SET_ANALYZE_ERROR':
      return { ...state, analyzeError: action.message, analyzeProgress: null };
    case 'SET_MAIN_CATEGORY':
      return { ...state, selectedMainCategory: action.value, selectedSubcategory: '' };
    case 'SET_SUBCATEGORY':
      return { ...state, selectedSubcategory: action.value };
    case 'SET_AI_RECORDS':
      return { ...state, aiDetectedRecords: action.records };
    case 'UPDATE_AI_RECORD':
      return {
        ...state,
        aiDetectedRecords: state.aiDetectedRecords.map((r) =>
          r.id === action.id ? { ...r, ...action.patch } : r
        ),
      };
    case 'SET_VISIT_DRAFT_FIELD':
      return { ...state, visitDraft: { ...state.visitDraft, [action.field]: action.value } };
    case 'SET_FEEDBACK':
      return { ...state, feedback: action.message };
    case 'SET_PROFILE_PATCH':
      return { ...state, detectedProfilePatch: action.patch };
    case 'RESET':
      return { ...INITIAL_AI_STATE, visitDraft: { ...INITIAL_VISIT_DRAFT, date: today() } };
    default: {
      const exhaustive: never = action;
      return exhaustive;
    }
  }
}

const readFileAsBase64 = (file: File) =>
  new Promise<{ previewUrl: string; base64: string }>((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const raw = typeof reader.result === 'string' ? reader.result : '';
      const base64 = raw.split(',')[1] ?? '';
      if (!base64) {
        reject(new Error('Nepodarilo sa načítať súbor.'));
        return;
      }
      resolve({ previewUrl: raw, base64 });
    };
    reader.onerror = () => reject(new Error('Nepodarilo sa načítať súbor.'));
    reader.readAsDataURL(file);
  });

interface BuildContext {
  dogId: string;
  examType?: string;
}

export function useAiImport(dogId: string) {
  const [state, dispatch] = useReducer(reducer, INITIAL_AI_STATE);
  const [existingVaccinations] = useLocalStorage<VaccinationRecord[]>(
    'dog-health-vaccinations',
    []
  );

  const setStep = useCallback((step: AiStep) => dispatch({ type: 'SET_STEP', step }), []);

  const addAttachmentFiles = useCallback(async (files: File[], currentCount: number) => {
    if (files.length === 0) return;

    if (currentCount >= MAX_ATTACHMENTS) {
      dispatch({
        type: 'SET_ATTACHMENT_ERROR',
        message: `Maximálne ${MAX_ATTACHMENTS} strán pasu.`,
      });
      return;
    }

    const available = MAX_ATTACHMENTS - currentCount;
    const toProcess = files.slice(0, available);
    const accepted: AiAttachmentEntry[] = [];
    let lastError = '';

    for (const file of toProcess) {
      if (!SUPPORTED_FILE_TYPES.includes(file.type)) {
        lastError = `Nepodporovaný typ súboru: ${file.name}`;
        continue;
      }
      if (file.size > MAX_FILE_SIZE_BYTES) {
        lastError = `Súbor je príliš veľký (max 5 MB): ${file.name}`;
        continue;
      }
      try {
        const { previewUrl, base64 } = await readFileAsBase64(file);
        accepted.push({
          id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
          file,
          previewUrl,
          pending: { fileName: file.name, mimeType: file.type, base64Data: base64 },
        });
      } catch (err) {
        lastError = err instanceof Error ? err.message : 'Nepodarilo sa načítať súbor.';
      }
    }

    if (accepted.length > 0) {
      dispatch({ type: 'ADD_ATTACHMENTS', entries: accepted });
    }
    if (lastError) {
      dispatch({ type: 'SET_ATTACHMENT_ERROR', message: lastError });
    }
    if (files.length > available) {
      dispatch({
        type: 'SET_ATTACHMENT_ERROR',
        message: `Maximum ${MAX_ATTACHMENTS} strán pasu — nadbytočné súbory boli ignorované.`,
      });
    }
  }, []);

  const addAttachments = useCallback(
    (files: File[]) => addAttachmentFiles(files, state.attachments.length),
    [addAttachmentFiles, state.attachments.length]
  );

  const removeAttachment = useCallback(
    (id: string) => dispatch({ type: 'REMOVE_ATTACHMENT', id }),
    []
  );

  const clearAttachments = useCallback(() => dispatch({ type: 'CLEAR_ATTACHMENTS' }), []);

  const setAttachmentLabel = useCallback(
    (label: string) => dispatch({ type: 'SET_ATTACHMENT_LABEL', label }),
    []
  );
  const setMainCategory = useCallback(
    (value: string) => dispatch({ type: 'SET_MAIN_CATEGORY', value }),
    []
  );
  const setSubcategory = useCallback(
    (value: string) => dispatch({ type: 'SET_SUBCATEGORY', value }),
    []
  );
  const updateAiRecord = useCallback(
    (id: string, patch: Partial<AiDetectedDraftRecord>) =>
      dispatch({ type: 'UPDATE_AI_RECORD', id, patch }),
    []
  );
  const setVisitDraftField = useCallback(
    (field: keyof AiVisitDraftValues, value: string) =>
      dispatch({ type: 'SET_VISIT_DRAFT_FIELD', field, value }),
    []
  );

  const analyze = useCallback(async () => {
    if (state.attachments.length === 0) return;

    dispatch({ type: 'SET_ANALYZE_ERROR', message: '' });

    try {
      const texts: string[] = [];
      for (let i = 0; i < state.attachments.length; i++) {
        dispatch({
          type: 'SET_ANALYZE_PROGRESS',
          progress: { done: i, total: state.attachments.length, stage: 'ocr' },
        });
        const { extractedText } = await extractTextFromImage(state.attachments[i].pending);
        if (extractedText.trim()) texts.push(extractedText.trim());
      }

      if (texts.length === 0) {
        dispatch({
          type: 'SET_ANALYZE_ERROR',
          message: 'Z dokumentov sa nepodarilo extrahovať žiadny text.',
        });
        return;
      }

      dispatch({
        type: 'SET_ANALYZE_PROGRESS',
        progress: {
          done: state.attachments.length,
          total: state.attachments.length,
          stage: 'interpret',
        },
      });

      const combined = texts.join('\n\n---\n\n');
      const interpretation = await interpretPassportText(combined);
      const { vaccinations, petIdentifiers, healthFlags } = interpretation;

      const patch: PetProfilePatch | null =
        (petIdentifiers &&
          (petIdentifiers.name ||
            petIdentifiers.breed ||
            petIdentifiers.dateOfBirth ||
            petIdentifiers.sex ||
            petIdentifiers.microchipNumber ||
            petIdentifiers.passportNumber)) ||
        (healthFlags &&
          ((healthFlags.allergies?.length ?? 0) > 0 ||
            (healthFlags.chronicConditions?.length ?? 0) > 0))
          ? {
              identifiers: petIdentifiers,
              allergies: healthFlags?.allergies ?? [],
              chronicConditions: healthFlags?.chronicConditions ?? [],
            }
          : null;
      dispatch({ type: 'SET_PROFILE_PATCH', patch });

      const drafts: AiDetectedDraftRecord[] = (vaccinations ?? []).map((item, index) => {
        const inferredType = inferAiTargetType(item.disease, item.vaccineName);
        const date = normalizeDateInput(item.dateAdministered);
        const fallback = inferredType === 'VACCINATION' ? plusDays(date, 365) : plusDays(date, 90);
        const productName = item.vaccineName || item.disease || 'Neznámy záznam';
        const isDuplicate =
          inferredType === 'VACCINATION' &&
          dogId !== '' &&
          isDuplicateVaccination({
            productName,
            sourceDisease: item.disease,
            date,
            existing: existingVaccinations,
            dogId,
          });
        return {
          id: `${Date.now()}-${index}`,
          sourceConfidence: item.confidence,
          sourceDisease: item.disease,
          targetType: isDuplicate ? 'SKIP' : inferredType,
          productName,
          date,
          validUntil: normalizeDateInput(item.validUntil ?? fallback),
          batchNumber: item.batchNumber ?? '',
          intervalDays: inferredType === 'ECTOPARASITE' ? 30 : 90,
          isDuplicate,
        };
      });

      dispatch({ type: 'SET_AI_RECORDS', records: drafts });
      dispatch({ type: 'SET_ANALYZE_PROGRESS', progress: null });
      dispatch({ type: 'SET_STEP', step: 1 });
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Analýza pasu zlyhala.';
      dispatch({ type: 'SET_ANALYZE_ERROR', message });
    }
  }, [state.attachments, dogId, existingVaccinations]);

  const buildBundle = useCallback(
    (ctx: BuildContext): VisitBundle => {
      const selectedRecords = state.aiDetectedRecords
        .filter((r) => r.targetType !== 'SKIP')
        .map((r) => ({
          targetType: r.targetType,
          sourceDisease: r.sourceDisease,
          productName: r.productName,
          date: r.date,
          validUntil: r.validUntil,
          batchNumber: r.batchNumber,
          intervalDays: r.intervalDays || (r.targetType === 'ECTOPARASITE' ? 30 : 90),
        }));

      const aiSummary = state.attachments.length
        ? `AI import zo ${state.attachments.length} ${
            state.attachments.length === 1 ? 'strany' : 'strán'
          } zdravotného pasu`
        : '';

      const attachmentDrafts = state.attachments.map((entry, idx) => ({
        attachmentLabel:
          state.attachments.length > 1
            ? `${state.attachmentLabel || 'Zdravotný pas'} — strana ${idx + 1}`
            : state.attachmentLabel || entry.pending.fileName,
        attachmentUrl: '',
        attachmentPreviewUrl: entry.previewUrl,
        attachmentFileName: entry.pending.fileName,
      }));

      return VetVisitHelper.createAiVisitBundle({
        dogId: ctx.dogId,
        draft: state.visitDraft,
        selectedVisitMainCategory: state.selectedMainCategory,
        selectedVisitSubcategory: state.selectedSubcategory,
        examType: ctx.examType,
        aiSummary,
        selectedRecords,
        attachmentDrafts,
        plusDays,
        uid,
      });
    },
    [
      state.aiDetectedRecords,
      state.attachments,
      state.attachmentLabel,
      state.selectedMainCategory,
      state.selectedSubcategory,
      state.visitDraft,
    ]
  );

  const reset = useCallback(() => dispatch({ type: 'RESET' }), []);

  const clearProfilePatch = useCallback(
    () => dispatch({ type: 'SET_PROFILE_PATCH', patch: null }),
    []
  );

  return {
    state,
    maxAttachments: MAX_ATTACHMENTS,
    setStep,
    addAttachments,
    removeAttachment,
    clearAttachments,
    setAttachmentLabel,
    setMainCategory,
    setSubcategory,
    updateAiRecord,
    setVisitDraftField,
    analyze,
    buildBundle,
    clearProfilePatch,
    reset,
  };
}
