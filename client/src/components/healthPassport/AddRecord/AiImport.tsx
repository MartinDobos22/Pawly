import { createContext, useContext, type ReactNode } from 'react';

import type { VisitBundle } from '../../../utils/vetVisitHelper';
import type { AiDetectedDraftRecord } from '../hpTypes';
import type { AiFormState, AiStep, AiVisitDraftValues } from './formTypes';
import { useAiImport as useAiImportInternal } from './useAiImport';

interface AiImportContextValue {
  state: AiFormState;
  petId: string;
  maxAttachments: number;
  setStep: (step: AiStep) => void;
  addAttachments: (files: File[]) => Promise<void>;
  removeAttachment: (id: string) => void;
  clearAttachments: () => void;
  restartUpload: () => void;
  setAttachmentLabel: (value: string) => void;
  setMainCategory: (value: string) => void;
  setSubcategory: (value: string) => void;
  setAiProcessingConsent: (value: boolean) => void;
  updateAiRecord: (id: string, patch: Partial<AiDetectedDraftRecord>) => void;
  setVisitDraftField: (field: keyof AiVisitDraftValues, value: string) => void;
  analyze: () => Promise<void>;
  clearProfilePatch: () => void;
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
  petId: string;
  onSave: (bundle: VisitBundle) => void;
  onCancel: () => void;
  children: ReactNode;
}

export default function AiImportProvider({
  petId,
  onSave,
  onCancel,
  children,
}: AiImportProviderProps) {
  const {
    state,
    maxAttachments,
    setStep,
    addAttachments,
    removeAttachment,
    clearAttachments,
    restartUpload,
    setAttachmentLabel,
    setMainCategory,
    setSubcategory,
    updateAiRecord,
    setAiProcessingConsent,
    setVisitDraftField,
    analyze,
    buildBundle,
    clearProfilePatch,
    reset,
  } = useAiImportInternal(petId);

  const submit = () => {
    const bundle = buildBundle({ petId });
    onSave(bundle);
    reset();
  };

  const value: AiImportContextValue = {
    state,
    petId,
    maxAttachments,
    setStep,
    addAttachments,
    removeAttachment,
    clearAttachments,
    restartUpload,
    setAttachmentLabel,
    setMainCategory,
    setSubcategory,
    updateAiRecord,
    setAiProcessingConsent,
    setVisitDraftField,
    analyze,
    clearProfilePatch,
    submit,
    cancel: onCancel,
  };

  return <AiImportContext.Provider value={value}>{children}</AiImportContext.Provider>;
}
