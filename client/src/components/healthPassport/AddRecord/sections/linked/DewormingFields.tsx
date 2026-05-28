import { useTranslation } from 'react-i18next';
import { Stack, TextField } from '@mui/material';

import type { DewormingFieldsValues } from '../../formTypes';
import { formatDate, plusDays } from '../../../utils';

interface DewormingFieldsProps {
  values: DewormingFieldsValues;
  baseDate: string;
  errorProduct?: string;
  onChange: <K extends keyof DewormingFieldsValues>(
    field: K,
    value: DewormingFieldsValues[K]
  ) => void;
}

export default function DewormingFields({
  values,
  baseDate,
  errorProduct,
  onChange,
}: DewormingFieldsProps) {
  const { t } = useTranslation('healthPassport');
  const nextDue =
    baseDate && values.intervalDays > 0 ? formatDate(plusDays(baseDate, values.intervalDays)) : '—';

  return (
    <Stack spacing={1.5}>
      <TextField
        size="small"
        label={t('deworming.product')}
        value={values.product}
        onChange={(e) => onChange('product', e.target.value)}
        error={Boolean(errorProduct)}
        helperText={errorProduct}
        fullWidth
      />
      <TextField
        size="small"
        type="number"
        label={t('deworming.intervalDays')}
        value={values.intervalDays}
        onChange={(e) => onChange('intervalDays', Number(e.target.value) || 0)}
        inputProps={{ min: 1, step: 1 }}
        helperText={t('deworming.nextDue', { date: nextDue })}
        fullWidth
      />
    </Stack>
  );
}
