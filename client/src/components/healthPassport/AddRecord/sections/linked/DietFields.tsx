import { FormControl, InputLabel, MenuItem, Select, Stack, TextField } from '@mui/material';

import type { DietEntry } from '../../../../../types/dogHealth';
import type { DietFieldsValues } from '../../formTypes';

type Suitability = NonNullable<DietEntry['suitabilityStatus']>;

interface DietFieldsProps {
  values: DietFieldsValues;
  errorFoodName?: string;
  onChange: <K extends keyof DietFieldsValues>(field: K, value: DietFieldsValues[K]) => void;
}

export default function DietFields({ values, errorFoodName, onChange }: DietFieldsProps) {
  return (
    <Stack spacing={1.5}>
      <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1.5}>
        <TextField
          size="small"
          label="Názov krmiva"
          value={values.foodName}
          onChange={(e) => onChange('foodName', e.target.value)}
          error={Boolean(errorFoodName)}
          helperText={errorFoodName}
          fullWidth
        />
        <FormControl size="small" sx={{ minWidth: 200 }}>
          <InputLabel>Vhodnosť</InputLabel>
          <Select
            label="Vhodnosť"
            value={values.suitabilityStatus}
            onChange={(e) => onChange('suitabilityStatus', e.target.value as Suitability)}
          >
            <MenuItem value="SUITABLE">Vhodné</MenuItem>
            <MenuItem value="RISKY">Rizikové</MenuItem>
            <MenuItem value="UNSUITABLE">Nevhodné</MenuItem>
          </Select>
        </FormControl>
      </Stack>
      <TextField
        size="small"
        label="Reakcia / poznámky"
        value={values.reactionNotes}
        onChange={(e) => onChange('reactionNotes', e.target.value)}
        multiline
        minRows={2}
        fullWidth
      />
    </Stack>
  );
}
