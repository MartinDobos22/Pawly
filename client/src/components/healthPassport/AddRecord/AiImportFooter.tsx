import { Box, Button, CircularProgress, Stack } from '@mui/material';

import { useAiImportContext } from './AiImport';

export default function AiImportFooter() {
  const { state, loadingFile, setStep, analyze, submit, cancel } = useAiImportContext();

  const canAnalyze = Boolean(state.pendingAttachment) && !loadingFile;
  const canAdvanceFromReview = state.aiDetectedRecords.some((r) => r.targetType !== 'SKIP');
  const canSave = Boolean(state.visitDraft.clinicName.trim());

  return (
    <Box sx={{ width: '100%', display: 'flex', justifyContent: 'space-between' }}>
      <Button onClick={cancel}>Zrušiť</Button>
      <Stack direction="row" gap={1}>
        {state.step > 0 && <Button onClick={() => setStep((state.step - 1) as 0 | 1)}>Späť</Button>}
        {state.step === 0 && (
          <Button
            variant="contained"
            disabled={!canAnalyze}
            onClick={() => {
              void analyze();
            }}
            startIcon={loadingFile ? <CircularProgress size={16} color="inherit" /> : null}
          >
            {loadingFile ? 'Analyzujem…' : 'Analyzovať'}
          </Button>
        )}
        {state.step === 1 && (
          <Button variant="contained" disabled={!canAdvanceFromReview} onClick={() => setStep(2)}>
            Pokračovať
          </Button>
        )}
        {state.step === 2 && (
          <Button variant="contained" disabled={!canSave} onClick={submit}>
            Uložiť záznamy
          </Button>
        )}
      </Stack>
    </Box>
  );
}
