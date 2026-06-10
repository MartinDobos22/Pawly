import { useTranslation } from 'react-i18next';
import { FormControl, InputLabel, MenuItem, Select, Stack, TextField } from '@mui/material';

import type { VaccinationRecord } from '../../../../../types/petHealth';
import type { VaccinationFieldsValues } from '../../formTypes';
import DateField from '../../../../DateField';

interface VaccinationFieldsProps {
  values: VaccinationFieldsValues;
  errorName?: string;
  errorValidUntil?: string;
  onChange: <K extends keyof VaccinationFieldsValues>(
    field: K,
    value: VaccinationFieldsValues[K]
  ) => void;
}

export default function VaccinationFields({
  values,
  errorName,
  errorValidUntil,
  onChange,
}: VaccinationFieldsProps) {
  const { t } = useTranslation('healthPassport');
  return (
    <Stack spacing={1.5}>
      <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1.5}>
        <TextField
          size="small"
          label={t('vaccination.name')}
          value={values.name}
          onChange={(e) => onChange('name', e.target.value)}
          error={Boolean(errorName)}
          helperText={errorName}
          fullWidth
        />
        <FormControl size="small" sx={{ minWidth: 160 }}>
          <InputLabel>{t('vaccination.type')}</InputLabel>
          <Select
            label={t('vaccination.type')}
            value={values.type}
            onChange={(e) => onChange('type', e.target.value as VaccinationRecord['type'])}
          >
            <MenuItem value="RABIES">{t('vaccination.typeRabies')}</MenuItem>
            <MenuItem value="COMBINED">{t('vaccination.typeCombined')}</MenuItem>
            <MenuItem value="OTHER">{t('vaccination.typeOther')}</MenuItem>
          </Select>
        </FormControl>
      </Stack>
      <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1.5}>
        <DateField
          label={t('vaccination.validUntil')}
          value={values.validUntil}
          onChange={(v) => onChange('validUntil', v)}
          error={Boolean(errorValidUntil)}
          helperText={errorValidUntil}
          fullWidth
        />
        <TextField
          size="small"
          label={t('vaccination.batchNumber')}
          value={values.batchNumber}
          onChange={(e) => onChange('batchNumber', e.target.value)}
          fullWidth
        />
      </Stack>
    </Stack>
  );
}
