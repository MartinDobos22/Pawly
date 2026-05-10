import { Alert, Stack } from '@mui/material';

import { useManualEntry } from './ManualEntry';
import VisitBasics from './sections/VisitBasics';
import ClinicalNotes from './sections/ClinicalNotes';
import LinkedRecords from './sections/LinkedRecords';
import Expenses from './sections/Expenses';

export default function ManualEntryBody() {
  const {
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
  } = useManualEntry();

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
    </Stack>
  );
}
