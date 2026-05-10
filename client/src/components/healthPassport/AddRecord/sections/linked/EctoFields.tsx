import { FormControl, InputLabel, MenuItem, Select, Stack, TextField } from '@mui/material';

import type { EctoparasiteRecord } from '../../../../../types/dogHealth';
import type { EctoFieldsValues } from '../../formTypes';

interface EctoFieldsProps {
  values: EctoFieldsValues;
  errorProduct?: string;
  onChange: <K extends keyof EctoFieldsValues>(field: K, value: EctoFieldsValues[K]) => void;
}

export default function EctoFields({ values, errorProduct, onChange }: EctoFieldsProps) {
  return (
    <Stack spacing={1.5}>
      <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1.5}>
        <TextField
          size="small"
          label="Názov prípravku"
          value={values.product}
          onChange={(e) => onChange('product', e.target.value)}
          error={Boolean(errorProduct)}
          helperText={errorProduct}
          fullWidth
        />
        <FormControl size="small" sx={{ minWidth: 160 }}>
          <InputLabel>Forma</InputLabel>
          <Select
            label="Forma"
            value={values.form}
            onChange={(e) => onChange('form', e.target.value as EctoparasiteRecord['form'])}
          >
            <MenuItem value="TABLET">Tableta</MenuItem>
            <MenuItem value="SPOT_ON">Spot-on</MenuItem>
            <MenuItem value="COLLAR">Obojok</MenuItem>
          </Select>
        </FormControl>
      </Stack>
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
