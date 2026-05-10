import { useCallback, useEffect, useReducer } from 'react';

import { useAnalyze } from '../../../hooks/useAnalyze';
import { VetVisitHelper, type VisitBundle } from '../../../utils/vetVisitHelper';
import type { AiDetectedDraftRecord } from '../hpTypes';
import { EXAM_SUBCATEGORY_TO_ALIAS, MAX_FILE_SIZE_BYTES, SUPPORTED_FILE_TYPES } from '../constants';
import { inferAiTargetType, normalizeDateInput, plusDays, today, uid } from '../utils';

import type { AiAttachmentDraft, AiFormState, AiStep, AiVisitDraftValues } from './formTypes';

const INITIAL_VISIT_DRAFT: AiVisitDraftValues = {
  date: today(),
  clinicName: '',
  diagnosis: '',
  recommendations: '',
};

export const INITIAL_AI_STATE: AiFormState = {
  step: 0,
  attachmentFile: null,
  attachmentError: '',
  attachmentPreviewUrl: '',
  attachmentLabel: '',
  pendingAttachment: null,
  selectedMainCategory: '',
  selectedSubcategory: '',
  aiDetectedRecords: [],
  useVisitDetailsFromManual: false,
  visitDraft: INITIAL_VISIT_DRAFT,
  feedback: null,
};

type AiAction =
  | { type: 'SET_STEP'; step: AiStep }
  | {
      type: 'SET_ATTACHMENT';
      file: File | null;
      previewUrl: string;
      pending: AiAttachmentDraft | null;
    }
  | { type: 'SET_ATTACHMENT_ERROR'; message: string }
  | { type: 'SET_ATTACHMENT_LABEL'; label: string }
  | { type: 'SET_MAIN_CATEGORY'; value: string }
  | { type: 'SET_SUBCATEGORY'; value: string }
  | { type: 'SET_AI_RECORDS'; records: AiDetectedDraftRecord[] }
  | { type: 'UPDATE_AI_RECORD'; id: string; patch: Partial<AiDetectedDraftRecord> }
  | { type: 'SET_VISIT_DRAFT_FIELD'; field: keyof AiVisitDraftValues; value: string }
  | { type: 'SET_FEEDBACK'; message: string | null }
  | { type: 'RESET' };

function reducer(state: AiFormState, action: AiAction): AiFormState {
  switch (action.type) {
    case 'SET_STEP':
      return { ...state, step: action.step };
    case 'SET_ATTACHMENT':
      return {
        ...state,
        attachmentFile: action.file,
        attachmentPreviewUrl: action.previewUrl,
        pendingAttachment: action.pending,
        attachmentError: '',
      };
    case 'SET_ATTACHMENT_ERROR':
      return {
        ...state,
        attachmentError: action.message,
        attachmentFile: null,
        attachmentPreviewUrl: '',
        pendingAttachment: null,
      };
    case 'SET_ATTACHMENT_LABEL':
      return { ...state, attachmentLabel: action.label };
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

export function useAiImport() {
  const [state, dispatch] = useReducer(reducer, INITIAL_AI_STATE);
  const { analyzeFile, fileResult, loadingFile, error: fileAnalyzeError } = useAnalyze();

  useEffect(() => {
    const records = fileResult?.healthPassportInterpretation?.vaccinations;
    if (!records || records.length === 0) {
      return;
    }
    const drafts: AiDetectedDraftRecord[] = records.map((item, index) => {
      const targetType = inferAiTargetType(item.disease, item.vaccineName);
      const date = normalizeDateInput(item.dateAdministered);
      const fallback = targetType === 'VACCINATION' ? plusDays(date, 365) : plusDays(date, 90);
      return {
        id: `${Date.now()}-${index}`,
        sourceConfidence: item.confidence,
        sourceDisease: item.disease,
        targetType,
        productName: item.vaccineName || item.disease || 'Neznámy záznam',
        date,
        validUntil: normalizeDateInput(item.validUntil ?? fallback),
        batchNumber: item.batchNumber ?? '',
        intervalDays: targetType === 'ECTOPARASITE' ? 30 : 90,
      };
    });
    dispatch({ type: 'SET_AI_RECORDS', records: drafts });
  }, [fileResult]);

  const setStep = useCallback((step: AiStep) => dispatch({ type: 'SET_STEP', step }), []);

  const setAttachmentFile = useCallback(async (file: File | null) => {
    if (!file) {
      dispatch({ type: 'SET_ATTACHMENT', file: null, previewUrl: '', pending: null });
      return;
    }
    if (!SUPPORTED_FILE_TYPES.includes(file.type)) {
      dispatch({ type: 'SET_ATTACHMENT_ERROR', message: 'Nepodporovaný typ súboru.' });
      return;
    }
    if (file.size > MAX_FILE_SIZE_BYTES) {
      dispatch({ type: 'SET_ATTACHMENT_ERROR', message: 'Súbor je príliš veľký (max 5 MB).' });
      return;
    }
    try {
      const { previewUrl, base64 } = await readFileAsBase64(file);
      dispatch({
        type: 'SET_ATTACHMENT',
        file,
        previewUrl,
        pending: { fileName: file.name, mimeType: file.type, base64Data: base64 },
      });
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Nepodarilo sa načítať súbor.';
      dispatch({ type: 'SET_ATTACHMENT_ERROR', message });
    }
  }, []);

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
    if (!state.pendingAttachment) return;
    const examAlias = state.selectedSubcategory
      ? EXAM_SUBCATEGORY_TO_ALIAS[state.selectedSubcategory]
      : undefined;
    await analyzeFile(state.pendingAttachment, examAlias);
  }, [analyzeFile, state.pendingAttachment, state.selectedSubcategory]);

  const buildBundle = useCallback(
    (ctx: BuildContext): VisitBundle => {
      const aiSummary = [
        fileResult?.contextAnalysis?.summary
          ? `Kontext: ${fileResult.contextAnalysis.summary}`
          : '',
        fileResult?.examAnalysis?.analysis ? `AI analýza: ${fileResult.examAnalysis.analysis}` : '',
      ]
        .filter(Boolean)
        .join('\n\n');

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

      return VetVisitHelper.createAiVisitBundle({
        dogId: ctx.dogId,
        draft: state.visitDraft,
        selectedVisitMainCategory: state.selectedMainCategory,
        selectedVisitSubcategory: state.selectedSubcategory,
        examType: ctx.examType ?? fileResult?.examAnalysis?.examType,
        aiSummary,
        selectedRecords,
        attachmentDraft: {
          attachmentLabel: state.attachmentLabel || state.pendingAttachment?.fileName || '',
          attachmentUrl: '',
          attachmentPreviewUrl: state.attachmentPreviewUrl,
          attachmentFileName: state.pendingAttachment?.fileName,
        },
        plusDays,
        uid,
      });
    },
    [
      fileResult,
      state.aiDetectedRecords,
      state.attachmentLabel,
      state.attachmentPreviewUrl,
      state.pendingAttachment,
      state.selectedMainCategory,
      state.selectedSubcategory,
      state.visitDraft,
    ]
  );

  const reset = useCallback(() => dispatch({ type: 'RESET' }), []);

  return {
    state,
    setStep,
    setAttachmentFile,
    setAttachmentLabel,
    setMainCategory,
    setSubcategory,
    updateAiRecord,
    setVisitDraftField,
    analyze,
    buildBundle,
    reset,
    loadingFile,
    fileAnalyzeError,
    fileResult,
  };
}
