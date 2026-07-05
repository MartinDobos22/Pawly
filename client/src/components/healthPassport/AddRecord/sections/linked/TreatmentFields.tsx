import { useTranslation } from 'react-i18next';
import { Stack, TextField } from '@mui/material';

import type { TreatmentFieldsValues } from '../../formTypes';
import { formatDate, plusDays } from '../../../utils';

interface TreatmentFieldsProps {
  values: TreatmentFieldsValues;
  baseDate: string;
  errorName?: string;
  onChange: <K extends keyof TreatmentFieldsValues>(
    field: K,
    value: TreatmentFieldsValues[K]
  ) => void;
}

export default function TreatmentFields({
  values,
  baseDate,
  errorName,
  onChange,
}: TreatmentFieldsProps) {
  const { t, i18n } = useTranslation('healthPassport');
  const locale = i18n.language === 'en' ? 'en-GB' : 'sk-SK';
  const nextDue =
    baseDate && values.intervalDays > 0
      ? formatDate(plusDays(baseDate, values.intervalDays), locale)
      : '—';

  return (
    <Stack spacing={1.5}>
      <TextField
        size="small"
        label={t('treatment.name')}
        placeholder={t('treatment.namePlaceholder')}
        value={values.name}
        onChange={(e) => onChange('name', e.target.value)}
        error={Boolean(errorName)}
        helperText={errorName}
        fullWidth
      />
      <TextField
        size="small"
        label={t('treatment.reason')}
        placeholder={t('treatment.reasonPlaceholder')}
        value={values.reason}
        onChange={(e) => onChange('reason', e.target.value)}
        fullWidth
      />
      <TextField
        size="small"
        type="number"
        label={t('treatment.intervalDays')}
        value={values.intervalDays}
        onChange={(e) => onChange('intervalDays', Number(e.target.value) || 0)}
        inputProps={{ min: 0, step: 1 }}
        helperText={t('treatment.nextDue', { date: nextDue })}
        fullWidth
      />
    </Stack>
  );
}
