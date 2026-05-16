import {
  Alert,
  Box,
  Card,
  FormControl,
  InputLabel,
  LinearProgress,
  MenuItem,
  Select,
  Stack,
  Step,
  StepLabel,
  Stepper,
  TextField,
  Typography,
} from '@mui/material';

import { VISIT_CATEGORY_OPTIONS } from '../constants';
import { useAiImportContext } from './AiImport';
import AttachmentUpload from './AttachmentUpload';
import AiRecordsReview from './AiRecordsReview';

const STEP_LABELS = ['Nahrať strany', 'Skontrolovať záznamy', 'Potvrdiť a uložiť'];

export default function AiImportBody() {
  const {
    state,
    maxAttachments,
    addAttachments,
    removeAttachment,
    setAttachmentLabel,
    setMainCategory,
    setSubcategory,
    updateAiRecord,
    setVisitDraftField,
  } = useAiImportContext();

  const subOptions =
    VISIT_CATEGORY_OPTIONS.find((opt) => opt.main === state.selectedMainCategory)?.sub ?? [];

  const progress = state.analyzeProgress;
  const progressPercent = progress
    ? progress.stage === 'interpret'
      ? 100
      : Math.round((progress.done / progress.total) * 100)
    : 0;

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
              Nahraj viacero strán zdravotného pasu (alebo iný dokument). AI z nich extrahuje
              všetky očkovania naraz a v ďalšom kroku ti dá unified zoznam na schválenie.
            </Typography>

            <Box
              sx={{
                display: 'grid',
                gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr' },
                gap: 1.5,
              }}
            >
              <FormControl size="small">
                <InputLabel>Hlavná kategória (voliteľné)</InputLabel>
                <Select
                  label="Hlavná kategória (voliteľné)"
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
              attachments={state.attachments}
              error={state.attachmentError}
              label={state.attachmentLabel}
              maxFiles={maxAttachments}
              onLabelChange={setAttachmentLabel}
              onAddFiles={(files) => {
                void addAttachments(files);
              }}
              onRemove={removeAttachment}
            />

            {progress && (
              <Box>
                <Typography variant="body2" sx={{ mb: 0.5 }}>
                  {progress.stage === 'ocr'
                    ? `Spracovávam stranu ${Math.min(progress.done + 1, progress.total)} z ${progress.total}…`
                    : 'Interpretujem záznamy…'}
                </Typography>
                <LinearProgress
                  variant={progress.stage === 'interpret' ? 'indeterminate' : 'determinate'}
                  value={progressPercent}
                />
              </Box>
            )}

            {state.analyzeError && <Alert severity="error">{state.analyzeError}</Alert>}
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
    </Stack>
  );
}
