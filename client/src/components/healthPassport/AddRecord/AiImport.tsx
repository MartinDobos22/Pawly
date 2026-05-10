import { forwardRef, useEffect, useImperativeHandle } from 'react';
import {
  Alert,
  Box,
  Button,
  Card,
  CircularProgress,
  FormControl,
  InputLabel,
  MenuItem,
  Select,
  Stack,
  Step,
  StepLabel,
  Stepper,
  TextField,
  Typography,
} from '@mui/material';

import type { VisitBundle } from '../../../utils/vetVisitHelper';
import { VISIT_CATEGORY_OPTIONS } from '../constants';
import AttachmentUpload from './AttachmentUpload';
import AiRecordsReview from './AiRecordsReview';
import { useAiImport } from './useAiImport';

const STEP_LABELS = ['Nahrať dokument', 'Skontrolovať záznamy', 'Potvrdiť a uložiť'];

export interface AiImportHandle {
  reset: () => void;
}

interface AiImportProps {
  dogId: string;
  onSave: (bundle: VisitBundle) => void;
  onCancel: () => void;
}

function AiImportInner({ dogId, onSave, onCancel }: AiImportProps, ref: React.Ref<AiImportHandle>) {
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
  } = useAiImport();

  const subOptions =
    VISIT_CATEGORY_OPTIONS.find((opt) => opt.main === state.selectedMainCategory)?.sub ?? [];

  useImperativeHandle(ref, () => ({ reset }), [reset]);

  useEffect(() => {
    if (fileResult && state.step === 0) {
      setStep(1);
    }
  }, [fileResult, state.step, setStep]);

  const canAnalyze = Boolean(state.pendingAttachment) && !loadingFile;
  const canAdvanceFromReview = state.aiDetectedRecords.some((r) => r.targetType !== 'SKIP');
  const canSave = Boolean(state.visitDraft.clinicName.trim());

  const handleSave = () => {
    if (!canSave) return;
    const bundle = buildBundle({ dogId });
    onSave(bundle);
    reset();
  };

  return (
    <Stack spacing={1.5}>
      <Stepper activeStep={state.step} alternativeLabel>
        {STEP_LABELS.map((label) => (
          <Step key={label}>
            <StepLabel>{label}</StepLabel>
          </Step>
        ))}
      </Stepper>

      {state.step === 0 && (
        <Card sx={{ p: 2 }}>
          <Stack spacing={1.5}>
            <Typography variant="body2" color="text.secondary">
              Nahraj dokument (zdravotný pas, výsledok testu) a vyber typ vyšetrenia. AI z neho
              extrahuje záznamy.
            </Typography>

            <Box
              sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr' }, gap: 1.5 }}
            >
              <FormControl size="small">
                <InputLabel>Hlavná kategória</InputLabel>
                <Select
                  label="Hlavná kategória"
                  value={state.selectedMainCategory}
                  onChange={(e) => setMainCategory(e.target.value)}
                >
                  <MenuItem value="">
                    <em>Nezvolené</em>
                  </MenuItem>
                  {VISIT_CATEGORY_OPTIONS.map((opt) => (
                    <MenuItem key={opt.main} value={opt.main}>
                      {opt.main}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
              <FormControl size="small" disabled={!state.selectedMainCategory}>
                <InputLabel>Podkategória</InputLabel>
                <Select
                  label="Podkategória"
                  value={state.selectedSubcategory}
                  onChange={(e) => setSubcategory(e.target.value)}
                >
                  <MenuItem value="">
                    <em>Nezvolené</em>
                  </MenuItem>
                  {subOptions.map((sub) => (
                    <MenuItem key={sub} value={sub}>
                      {sub}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Box>

            <AttachmentUpload
              file={state.attachmentFile}
              previewUrl={state.attachmentPreviewUrl}
              error={state.attachmentError}
              label={state.attachmentLabel}
              onLabelChange={setAttachmentLabel}
              onFileChange={(file) => {
                void setAttachmentFile(file);
              }}
            />

            {fileAnalyzeError && <Alert severity="error">{fileAnalyzeError}</Alert>}
          </Stack>
        </Card>
      )}

      {state.step === 1 && (
        <Card sx={{ p: 2 }}>
          <AiRecordsReview records={state.aiDetectedRecords} onChange={updateAiRecord} />
        </Card>
      )}

      {state.step === 2 && (
        <Card sx={{ p: 2 }}>
          <Stack spacing={1.5}>
            <Typography variant="body2" color="text.secondary">
              Doplň informácie o návšteve, ktorá sa vytvorí z extrahovaných záznamov.
            </Typography>
            <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1.5}>
              <TextField
                size="small"
                type="date"
                label="Dátum"
                InputLabelProps={{ shrink: true }}
                value={state.visitDraft.date}
                onChange={(e) => setVisitDraftField('date', e.target.value)}
                fullWidth
              />
              <TextField
                size="small"
                label="Klinika / veterinár"
                value={state.visitDraft.clinicName}
                onChange={(e) => setVisitDraftField('clinicName', e.target.value)}
                fullWidth
                required
              />
            </Stack>
            <TextField
              size="small"
              label="Diagnóza (voliteľné)"
              value={state.visitDraft.diagnosis}
              onChange={(e) => setVisitDraftField('diagnosis', e.target.value)}
              multiline
              minRows={2}
              fullWidth
            />
            <TextField
              size="small"
              label="Odporúčania (voliteľné)"
              value={state.visitDraft.recommendations}
              onChange={(e) => setVisitDraftField('recommendations', e.target.value)}
              multiline
              minRows={2}
              fullWidth
            />
          </Stack>
        </Card>
      )}

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
          justifyContent: 'space-between',
          gap: 1,
        }}
      >
        <Button onClick={onCancel}>Zrušiť</Button>
        <Stack direction="row" gap={1}>
          {state.step > 0 && (
            <Button onClick={() => setStep((state.step - 1) as 0 | 1)}>Späť</Button>
          )}
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
            <Button variant="contained" disabled={!canSave} onClick={handleSave}>
              Uložiť záznamy
            </Button>
          )}
        </Stack>
      </Box>
    </Stack>
  );
}

const AiImport = forwardRef(AiImportInner);
export default AiImport;
