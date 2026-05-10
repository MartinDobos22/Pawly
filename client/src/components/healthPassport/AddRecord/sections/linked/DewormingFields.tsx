import { Stack, TextField } from '@mui/material';

import type { DewormingFieldsValues } from '../../formTypes';

interface DewormingFieldsProps {
  values: DewormingFieldsValues;
  errorProduct?: string;
  onChange: <K extends keyof DewormingFieldsValues>(
    field: K,
    value: DewormingFieldsValues[K]
  ) => void;
}

export default function DewormingFields({ values, errorProduct, onChange }: DewormingFieldsProps) {
  return (
    <Stack spacing={1.5}>
      <TextField
        size="small"
        label="Názov prípravku"
        value={values.product}
        onChange={(e) => onChange('product', e.target.value)}
        error={Boolean(errorProduct)}
        helperText={errorProduct}
        fullWidth
      />
      <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1.5}>
        <TextField
          size="small"
          type="date"
          label="Ďalší termín"
          InputLabelProps={{ shrink: true }}
          value={values.validUntil}
          onChange={(e) => onChange('validUntil', e.target.value)}
          fullWidth
        />
        <TextField
          size="small"
          type="number"
          label="Interval (dni)"
          value={values.intervalDays}
          onChange={(e) => onChange('intervalDays', Number(e.target.value) || 0)}
          inputProps={{ min: 1, step: 1 }}
          fullWidth
        />
      </Stack>
    </Stack>
  );
}
