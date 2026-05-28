import { Stack, TextField } from '@mui/material';

import type { MedicationFieldsValues } from '../../formTypes';
import DateField from '../../../../DateField';

interface MedicationFieldsProps {
  values: MedicationFieldsValues;
  errorName?: string;
  onChange: <K extends keyof MedicationFieldsValues>(
    field: K,
    value: MedicationFieldsValues[K]
  ) => void;
}

export default function MedicationFields({ values, errorName, onChange }: MedicationFieldsProps) {
  return (
    <Stack spacing={1.5}>
      <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1.5}>
        <TextField
          size="small"
          label="Názov lieku"
          value={values.name}
          onChange={(e) => onChange('name', e.target.value)}
          error={Boolean(errorName)}
          helperText={errorName}
          fullWidth
        />
        <TextField
          size="small"
          label="Dávkovanie"
          placeholder="napr. 1 tableta"
          value={values.dose}
          onChange={(e) => onChange('dose', e.target.value)}
          fullWidth
        />
      </Stack>
      <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1.5}>
        <TextField
          size="small"
          label="Frekvencia"
          placeholder="napr. 2x denne"
          value={values.frequency}
          onChange={(e) => onChange('frequency', e.target.value)}
          fullWidth
        />
        <DateField
          label="Koniec liečby"
          value={values.endDate}
          onChange={(v) => onChange('endDate', v)}
          fullWidth
        />
      </Stack>
      <TextField
        size="small"
        label="Dôvod / indikácia (voliteľné)"
        value={values.reason}
        onChange={(e) => onChange('reason', e.target.value)}
        fullWidth
      />
    </Stack>
  );
}
