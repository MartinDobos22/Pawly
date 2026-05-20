import { FormControl, InputLabel, MenuItem, Select, Stack, TextField } from '@mui/material';

import type { VaccinationRecord } from '../../../../../types/dogHealth';
import type { VaccinationFieldsValues } from '../../formTypes';
import DateField from '../../../../DateField';

interface VaccinationFieldsProps {
  values: VaccinationFieldsValues;
  errorName?: string;
  onChange: <K extends keyof VaccinationFieldsValues>(
    field: K,
    value: VaccinationFieldsValues[K]
  ) => void;
}

export default function VaccinationFields({ values, errorName, onChange }: VaccinationFieldsProps) {
  return (
    <Stack spacing={1.5}>
      <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1.5}>
        <TextField
          size="small"
          label="Názov vakcíny"
          value={values.name}
          onChange={(e) => onChange('name', e.target.value)}
          error={Boolean(errorName)}
          helperText={errorName}
          fullWidth
        />
        <FormControl size="small" sx={{ minWidth: 160 }}>
          <InputLabel>Typ</InputLabel>
          <Select
            label="Typ"
            value={values.type}
            onChange={(e) => onChange('type', e.target.value as VaccinationRecord['type'])}
          >
            <MenuItem value="RABIES">Besnota</MenuItem>
            <MenuItem value="COMBINED">Kombinovaná</MenuItem>
            <MenuItem value="OTHER">Iná</MenuItem>
          </Select>
        </FormControl>
      </Stack>
      <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1.5}>
        <DateField
          label="Platnosť do"
          value={values.validUntil}
          onChange={(v) => onChange('validUntil', v)}
          fullWidth
        />
        <TextField
          size="small"
          label="Šarža (voliteľné)"
          value={values.batchNumber}
          onChange={(e) => onChange('batchNumber', e.target.value)}
          fullWidth
        />
      </Stack>
    </Stack>
  );
}
