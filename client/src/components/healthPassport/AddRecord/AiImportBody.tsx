import {
  Alert,
  Box,
  Card,
  Checkbox,
  FormControl,
  FormControlLabel,
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

import { useTranslation } from 'react-i18next';

import { VISIT_CATEGORY_OPTIONS } from '../constants';
import { useAiImportContext } from './AiImport';
import AttachmentUpload from './AttachmentUpload';
import AiRecordsReview from './AiRecordsReview';
import AiProfileMergeReview from './AiProfileMergeReview';
import AiDisclaimer from '../../AiDisclaimer';

export default function AiImportBody() {
  const { t } = useTranslation('healthPassport');
  const {
    state,
    dogId,
    maxAttachments,
    addAttachments,
    removeAttachment,
    setAttachmentLabel,
    setMainCategory,
    setSubcategory,
    setAiProcessingConsent,
    updateAiRecord,
    setVisitDraftField,
    clearProfilePatch,
  } = useAiImportContext();

  const subOptions =
    VISIT_CATEGORY_OPTIONS.find((opt) => opt.key === state.selectedMainCategory)?.sub ?? [];

  const STEP_LABELS = [
    t('addRecord.stepUpload'),
    t('addRecord.stepReview'),
    t('addRecord.stepConfirm'),
  ];

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
              {t('addRecord.aiImport.uploadDescription')}
            </Typography>

            <Box
              sx={{
                display: 'grid',
                gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr' },
                gap: 1.5,
              }}
            >
              <FormControl size="small">
                <InputLabel>{t('addRecord.basics.mainCategoryOptional')}</InputLabel>
                <Select
                  label={t('addRecord.basics.mainCategoryOptional')}
                  value={state.selectedMainCategory}
                  onChange={(e) => setMainCategory(e.target.value)}
                >
                  <MenuItem value="">
                    <em>{t('visitCategory.notSelected')}</em>
                  </MenuItem>
                  {VISIT_CATEGORY_OPTIONS.map((opt) => (
                    <MenuItem key={opt.key} value={opt.key}>
                      {t(`visitCategory.${opt.key}` as never)}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
              <FormControl size="small" disabled={!state.selectedMainCategory}>
                <InputLabel>{t('addRecord.basics.subcategory')}</InputLabel>
                <Select
                  label={t('addRecord.basics.subcategory')}
                  value={state.selectedSubcategory}
                  onChange={(e) => setSubcategory(e.target.value)}
                >
                  <MenuItem value="">
                    <em>{t('visitCategory.notSelected')}</em>
                  </MenuItem>
                  {subOptions.map((sub) => (
                    <MenuItem key={sub.key} value={sub.key}>
                      {t(`visitCategory.${sub.key}` as never)}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Box>

            <Alert severity="info">{t('addRecord.aiImport.privacyNotice')}</Alert>

            <FormControlLabel
              control={
                <Checkbox
                  checked={state.aiProcessingConsent}
                  onChange={(event) => setAiProcessingConsent(event.target.checked)}
                />
              }
              label={t('addRecord.aiImport.aiProcessingConsent')}
            />

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
                    ? t('addRecord.progressOcr', {
                        done: Math.min(progress.done + 1, progress.total),
                        total: progress.total,
                      })
                    : t('addRecord.progressInterpret')}
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
        <>
          <AiDisclaimer />
          {state.detectedProfilePatch && dogId !== '' && (
            <AiProfileMergeReview
              dogId={dogId}
              patch={state.detectedProfilePatch}
              onDone={() => clearProfilePatch()}
              onSkip={() => clearProfilePatch()}
            />
          )}
          <Card sx={{ p: 2 }}>
            <AiRecordsReview
              records={state.aiDetectedRecords}
              onChange={updateAiRecord}
              hasProfileData={state.detectedProfileAvailable}
            />
          </Card>
        </>
      )}

      {state.step === 2 && (
        <Card sx={{ p: 2 }}>
          <Stack spacing={1.5}>
            <Typography variant="body2" color="text.secondary">
              {t('addRecord.confirmVisitHint')}
            </Typography>
            <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1.5}>
              <TextField
                size="small"
                type="date"
                label={t('addRecord.basics.date')}
                InputLabelProps={{ shrink: true }}
                value={state.visitDraft.date}
                onChange={(e) => setVisitDraftField('date', e.target.value)}
                fullWidth
              />
              <TextField
                size="small"
                label={t('addRecord.clinicOptional')}
                value={state.visitDraft.clinicName}
                onChange={(e) => setVisitDraftField('clinicName', e.target.value)}
                fullWidth
              />
            </Stack>
            <TextField
              size="small"
              label={t('addRecord.diagnosisOptional')}
              value={state.visitDraft.diagnosis}
              onChange={(e) => setVisitDraftField('diagnosis', e.target.value)}
              multiline
              minRows={2}
              fullWidth
            />
            <TextField
              size="small"
              label={t('addRecord.recommendationsOptional')}
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
