import { useTranslation } from 'react-i18next';
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
  const { t } = useTranslation('healthPassport');
  return (
    <Stack spacing={1.5}>
      <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1.5}>
        <TextField
          size="small"
          label={t('diet.foodName')}
          value={values.foodName}
          onChange={(e) => onChange('foodName', e.target.value)}
          error={Boolean(errorFoodName)}
          helperText={errorFoodName}
          fullWidth
        />
        <FormControl size="small" sx={{ minWidth: 200 }}>
          <InputLabel>{t('diet.suitability')}</InputLabel>
          <Select
            label={t('diet.suitability')}
            value={values.suitabilityStatus}
            onChange={(e) => onChange('suitabilityStatus', e.target.value as Suitability)}
          >
            <MenuItem value="SUITABLE">{t('detail.suitableSuitable')}</MenuItem>
            <MenuItem value="RISKY">{t('detail.suitableRisky')}</MenuItem>
            <MenuItem value="UNSUITABLE">{t('detail.suitableUnsuitable')}</MenuItem>
          </Select>
        </FormControl>
      </Stack>
      <TextField
        size="small"
        label={t('diet.reactionNotes')}
        value={values.reactionNotes}
        onChange={(e) => onChange('reactionNotes', e.target.value)}
        multiline
        minRows={2}
        fullWidth
      />
    </Stack>
  );
}
