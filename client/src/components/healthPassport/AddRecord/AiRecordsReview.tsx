import { useTranslation } from 'react-i18next';
import {
  Alert,
  AlertTitle,
  Box,
  Card,
  CardContent,
  Chip,
  FormControl,
  InputLabel,
  MenuItem,
  Select,
  Stack,
  TextField,
  Typography,
} from '@mui/material';
import { FactCheck as FactCheckIcon } from '@mui/icons-material';

import type { AiDetectedDraftRecord, AiDetectedRecordType } from '../hpTypes';

interface AiRecordsReviewProps {
  records: AiDetectedDraftRecord[];
  onChange: (id: string, patch: Partial<AiDetectedDraftRecord>) => void;
  hasProfileData?: boolean;
}

const CONFIDENCE_COLOR: Record<
  AiDetectedDraftRecord['sourceConfidence'],
  'success' | 'warning' | 'error'
> = {
  high: 'success',
  medium: 'warning',
  low: 'error',
};

const TARGET_TYPES: AiDetectedRecordType[] = [
  'VACCINATION',
  'DEWORMING',
  'ECTOPARASITE',
  'MEDICATION',
  'NOTE',
  'SKIP',
];

export default function AiRecordsReview({
  records,
  onChange,
  hasProfileData,
}: AiRecordsReviewProps) {
  const { t } = useTranslation('healthPassport');

  if (records.length === 0) {
    return (
      <Typography variant="body2" color="text.secondary">
        {hasProfileData ? t('aiRecordsReview.emptyWithProfile') : t('aiRecordsReview.empty')}
      </Typography>
    );
  }

  return (
    <Stack spacing={1.5}>
      <Alert severity="info" icon={<FactCheckIcon />}>
        <AlertTitle sx={{ fontWeight: 600 }}>{t('aiRecordsReview.headerTitle')}</AlertTitle>
        {t('aiRecordsReview.hint')}
      </Alert>
      {records.map((record) => {
        const needsVerify = record.sourceConfidence !== 'high';
        return (
        <Card
          key={record.id}
          variant={needsVerify ? 'outlined' : undefined}
          sx={needsVerify ? { borderColor: 'warning.main' } : undefined}
        >
          <CardContent sx={{ p: 1.5, '&:last-child': { pb: 1.5 } }}>
            <Stack direction="row" alignItems="center" gap={1} sx={{ mb: 1 }} flexWrap="wrap">
              <Typography variant="subtitle2" sx={{ fontWeight: 600, flex: 1, minWidth: 0 }} noWrap>
                {record.sourceDisease || record.productName || t('aiRecordsReview.recordFallback')}
              </Typography>
              {record.isDuplicate && (
                <Chip
                  size="small"
                  label={t('aiRecordsReview.duplicate')}
                  color="warning"
                  variant="filled"
                />
              )}
              <Chip
                size="small"
                label={t('aiRecordsReview.confidence', {
                  level: t(`aiRecordsReview.confidenceLevel.${record.sourceConfidence}` as never),
                })}
                color={CONFIDENCE_COLOR[record.sourceConfidence]}
                variant="outlined"
              />
            </Stack>

            <Box
              sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr' }, gap: 1.25 }}
            >
              <FormControl size="small">
                <InputLabel>{t('aiRecordsReview.targetTypeLabel')}</InputLabel>
                <Select
                  label={t('aiRecordsReview.targetTypeLabel')}
                  value={record.targetType}
                  onChange={(e) =>
                    onChange(record.id, { targetType: e.target.value as AiDetectedRecordType })
                  }
                >
                  {TARGET_TYPES.map((key) => (
                    <MenuItem key={key} value={key}>
                      {t(`aiRecordsReview.type.${key}` as never)}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
              <TextField
                size="small"
                label={t('aiRecordsReview.fieldName')}
                value={record.productName}
                onChange={(e) => onChange(record.id, { productName: e.target.value })}
              />
              <TextField
                size="small"
                type="date"
                label={t('aiRecordsReview.fieldDate')}
                InputLabelProps={{ shrink: true }}
                value={record.date}
                onChange={(e) => onChange(record.id, { date: e.target.value })}
                color={needsVerify ? 'warning' : undefined}
                helperText={needsVerify ? t('aiRecordsReview.verifyDateHint') : undefined}
                FormHelperTextProps={needsVerify ? { sx: { color: 'warning.main', mx: 0 } } : undefined}
              />
              <TextField
                size="small"
                type="date"
                label={t('aiRecordsReview.fieldValidUntil')}
                InputLabelProps={{ shrink: true }}
                value={record.validUntil}
                onChange={(e) => onChange(record.id, { validUntil: e.target.value })}
                color={needsVerify ? 'warning' : undefined}
                helperText={needsVerify ? t('aiRecordsReview.verifyDateHint') : undefined}
                FormHelperTextProps={needsVerify ? { sx: { color: 'warning.main', mx: 0 } } : undefined}
              />
              <TextField
                size="small"
                label={t('aiRecordsReview.fieldBatch')}
                value={record.batchNumber}
                onChange={(e) => onChange(record.id, { batchNumber: e.target.value })}
              />
            </Box>
          </CardContent>
        </Card>
        );
      })}
    </Stack>
  );
}
