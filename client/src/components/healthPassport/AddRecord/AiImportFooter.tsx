import { Box, Button, CircularProgress, Stack } from '@mui/material';

import { useAiImportContext } from './AiImport';

export default function AiImportFooter() {
  const { state, setStep, restartUpload, analyze, submit, cancel } = useAiImportContext();

  const analyzing = state.analyzeProgress !== null;
  const canAnalyze = state.attachments.length > 0 && !analyzing;
  const canAdvanceFromReview =
    state.aiDetectedRecords.some((r) => r.targetType !== 'SKIP') || state.detectedProfileAvailable;

  return (
    <Box sx={{ width: '100%', display: 'flex', justifyContent: 'space-between' }}>
      <Button onClick={cancel}>Zrušiť</Button>
      <Stack direction="row" gap={1}>
        {state.step > 0 && !analyzing && (
          <Button onClick={() => (state.step === 1 ? restartUpload() : setStep(1))}>Späť</Button>
        )}
        {state.step === 0 && (
          <Button
            variant="contained"
            disabled={!canAnalyze}
            onClick={() => {
              void analyze();
            }}
            startIcon={analyzing ? <CircularProgress size={16} color="inherit" /> : null}
          >
            {analyzing ? 'Analyzujem…' : 'Analyzovať'}
          </Button>
        )}
        {state.step === 1 && (
          <Button variant="contained" disabled={!canAdvanceFromReview} onClick={() => setStep(2)}>
            Pokračovať
          </Button>
        )}
        {state.step === 2 && (
          <Button variant="contained" onClick={submit}>
            Uložiť záznamy
          </Button>
        )}
      </Stack>
    </Box>
  );
}
