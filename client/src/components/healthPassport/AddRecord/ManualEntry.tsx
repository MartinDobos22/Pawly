import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
  type Dispatch,
  type ReactNode,
} from 'react';

import type { VisitBundle } from '../../../utils/vetVisitHelper';
import type { ErrorMap, ManualFormState } from './formTypes';
import {
  sectionsWithErrors,
  useAddRecordForm,
  validateManualForm,
  type ManualFormAction,
} from './useAddRecordForm';

interface ManualEntryContextValue {
  state: ManualFormState;
  dispatch: Dispatch<ManualFormAction>;
  errors: ErrorMap;
  errorCount: number;
  clinicalOpen: boolean;
  setClinicalOpen: (next: boolean) => void;
  linkedOpen: boolean;
  setLinkedOpen: (next: boolean) => void;
  expensesOpen: boolean;
  setExpensesOpen: (next: boolean) => void;
  submit: () => void;
  cancel: () => void;
}

const ManualEntryContext = createContext<ManualEntryContextValue | null>(null);

export function useManualEntry(): ManualEntryContextValue {
  const ctx = useContext(ManualEntryContext);
  if (!ctx) throw new Error('useManualEntry must be used inside ManualEntryProvider');
  return ctx;
}

interface ManualEntryProviderProps {
  dogId: string;
  currentDietEntryId?: string;
  onSave: (bundle: VisitBundle) => void;
  onCancel: () => void;
  children: ReactNode;
}

export default function ManualEntryProvider({
  dogId,
  currentDietEntryId,
  onSave,
  onCancel,
  children,
}: ManualEntryProviderProps) {
  const { state, dispatch, errors, buildBundle, reset, markSubmitAttempted } = useAddRecordForm();
  const [clinicalOpen, setClinicalOpen] = useState(true);
  const [linkedOpen, setLinkedOpen] = useState(false);
  const [expensesOpen, setExpensesOpen] = useState(false);

  const sectionErrors = useMemo(() => sectionsWithErrors(errors), [errors]);
  const errorCount = useMemo(() => Object.keys(errors).length, [errors]);

  useEffect(() => {
    if (!state.submitAttempted) return;
    if (sectionErrors.linked) setLinkedOpen(true);
    if (sectionErrors.expenses) setExpensesOpen(true);
  }, [state.submitAttempted, sectionErrors.linked, sectionErrors.expenses]);

  const submit = () => {
    markSubmitAttempted();
    const validationErrors = validateManualForm(state);
    if (Object.keys(validationErrors).length > 0) return;
    const bundle = buildBundle({ dogId, currentDietEntryId });
    onSave(bundle);
    reset();
  };

  const value: ManualEntryContextValue = {
    state,
    dispatch,
    errors,
    errorCount,
    clinicalOpen,
    setClinicalOpen,
    linkedOpen,
    setLinkedOpen,
    expensesOpen,
    setExpensesOpen,
    submit,
    cancel: onCancel,
  };

  return <ManualEntryContext.Provider value={value}>{children}</ManualEntryContext.Provider>;
}
