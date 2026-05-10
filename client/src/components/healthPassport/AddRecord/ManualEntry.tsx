import { useEffect, useImperativeHandle, useMemo, useState, forwardRef } from 'react';
import { Alert, Box, Button, Stack } from '@mui/material';

import type { VisitBundle } from '../../../utils/vetVisitHelper';
import { sectionsWithErrors, useAddRecordForm, validateManualForm } from './useAddRecordForm';
import VisitBasics from './sections/VisitBasics';
import ClinicalNotes from './sections/ClinicalNotes';
import LinkedRecords from './sections/LinkedRecords';
import Expenses from './sections/Expenses';

export interface ManualEntryHandle {
  reset: () => void;
}

interface ManualEntryProps {
  dogId: string;
  currentDietEntryId?: string;
  onSave: (bundle: VisitBundle) => void;
  onCancel: () => void;
}

function ManualEntryInner(
  { dogId, currentDietEntryId, onSave, onCancel }: ManualEntryProps,
  ref: React.Ref<ManualEntryHandle>
) {
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

  useImperativeHandle(ref, () => ({ reset }), [reset]);

  const handleSubmit = () => {
    markSubmitAttempted();
    const validationErrors = validateManualForm(state);
    if (Object.keys(validationErrors).length > 0) return;
    const bundle = buildBundle({ dogId, currentDietEntryId });
    onSave(bundle);
    reset();
  };

  return (
    <Stack spacing={1.25}>
      {state.submitAttempted && errorCount > 0 && (
        <Alert severity="error">
          Doplňte {errorCount} {errorCount === 1 ? 'povinné pole' : 'povinné polia'}.
        </Alert>
      )}

      <VisitBasics
        values={state.basics}
        errors={errors}
        onChange={(field, value) => dispatch({ type: 'SET_BASICS_FIELD', field, value })}
      />

      <ClinicalNotes
        values={state.clinical}
        expanded={clinicalOpen}
        onExpand={setClinicalOpen}
        onChange={(field, value) => dispatch({ type: 'SET_CLINICAL_FIELD', field, value })}
      />

      <LinkedRecords
        values={state.linked}
        errors={errors}
        expanded={linkedOpen}
        onExpand={setLinkedOpen}
        dispatch={dispatch}
      />

      <Expenses
        values={state.expenses}
        errors={errors}
        expanded={expensesOpen}
        onExpand={setExpensesOpen}
        onChange={(field, value) => dispatch({ type: 'SET_EXPENSE_FIELD', field, value })}
      />

      <Box
        sx={{
          position: 'sticky',
          bottom: 0,
          bgcolor: 'background.paper',
          pt: 1.5,
          mt: 0.5,
          borderTop: '1px solid',
          borderColor: 'divider',
          display: 'flex',
          justifyContent: 'flex-end',
          gap: 1,
        }}
      >
        <Button onClick={onCancel}>Zrušiť</Button>
        <Button variant="contained" onClick={handleSubmit}>
          Uložiť záznam
        </Button>
      </Box>
    </Stack>
  );
}

const ManualEntry = forwardRef(ManualEntryInner);
export default ManualEntry;
