import { createContext, useContext, type ReactNode } from 'react';

import type { VisitBundle } from '../../../utils/vetVisitHelper';
import type { AiDetectedDraftRecord } from '../hpTypes';
import type { AiFormState, AiStep, AiVisitDraftValues } from './formTypes';
import { useAiImport as useAiImportInternal } from './useAiImport';

interface AiImportContextValue {
  state: AiFormState;
  maxAttachments: number;
  setStep: (step: AiStep) => void;
  addAttachments: (files: File[]) => Promise<void>;
  removeAttachment: (id: string) => void;
  clearAttachments: () => void;
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
    maxAttachments,
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
    reset,
  } = useAiImportInternal(dogId);

  const submit = () => {
    if (!state.visitDraft.clinicName.trim()) return;
    const bundle = buildBundle({ dogId });
    onSave(bundle);
    reset();
  };

  const value: AiImportContextValue = {
    state,
    maxAttachments,
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
    submit,
    cancel: onCancel,
  };

  return <AiImportContext.Provider value={value}>{children}</AiImportContext.Provider>;
}
