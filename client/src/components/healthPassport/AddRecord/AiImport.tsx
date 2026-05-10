import { createContext, useContext, useEffect, type ReactNode } from 'react';

import type { VisitBundle } from '../../../utils/vetVisitHelper';
import type { AiDetectedDraftRecord } from '../hpTypes';
import type { AiFormState, AiStep, AiVisitDraftValues } from './formTypes';
import { useAiImport as useAiImportInternal } from './useAiImport';

interface AiImportContextValue {
  state: AiFormState;
  loadingFile: boolean;
  fileAnalyzeError: string | null;
  setStep: (step: AiStep) => void;
  setAttachmentFile: (file: File | null) => Promise<void>;
  setAttachmentLabel: (value: string) => void;
  setMainCategory: (value: string) => void;
  setSubcategory: (value: string) => void;
  updateAiRecord: (id: string, patch: Partial<AiDetectedDraftRecord>) => void;
  setVisitDraftField: (field: keyof AiVisitDraftValues, value: string) => void;
  analyze: () => Promise<void>;
  submit: () => void;
  cancel: () => void;
}

const AiImportContext = createContext<AiImportContextValue | null>(null);

export function useAiImportContext(): AiImportContextValue {
  const ctx = useContext(AiImportContext);
  if (!ctx) throw new Error('useAiImportContext must be used inside AiImportProvider');
  return ctx;
}

interface AiImportProviderProps {
  dogId: string;
  onSave: (bundle: VisitBundle) => void;
  onCancel: () => void;
  children: ReactNode;
}

export default function AiImportProvider({
  dogId,
  onSave,
  onCancel,
  children,
}: AiImportProviderProps) {
  const {
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
  } = useAiImportInternal();

  useEffect(() => {
    if (fileResult && state.step === 0) {
      setStep(1);
    }
  }, [fileResult, state.step, setStep]);

  const submit = () => {
    if (!state.visitDraft.clinicName.trim()) return;
    const bundle = buildBundle({ dogId });
    onSave(bundle);
    reset();
  };

  const value: AiImportContextValue = {
    state,
    loadingFile,
    fileAnalyzeError,
    setStep,
    setAttachmentFile,
    setAttachmentLabel,
    setMainCategory,
    setSubcategory,
    updateAiRecord,
    setVisitDraftField,
    analyze,
    submit,
    cancel: onCancel,
  };

  return <AiImportContext.Provider value={value}>{children}</AiImportContext.Provider>;
}
