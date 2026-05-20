import { Box, Stack, TextField } from '@mui/material';
import { ReceiptLong as ReceiptIcon } from '@mui/icons-material';

import type { ErrorMap, ExpensesValues } from '../formTypes';
import SectionCard from './SectionCard';
import DateField from '../../../DateField';

interface ExpensesProps {
  values: ExpensesValues;
  errors: ErrorMap;
  expanded: boolean;
  onExpand: (next: boolean) => void;
  onChange: <K extends keyof ExpensesValues>(field: K, value: ExpensesValues[K]) => void;
}

export default function Expenses({ values, errors, expanded, onExpand, onChange }: ExpensesProps) {
  return (
    <SectionCard
      title="Výdavky a ďalší termín"
      icon={<ReceiptIcon />}
      collapsible
      expanded={expanded}
      onExpandChange={onExpand}
    >
      <Stack spacing={1.5}>
        <DateField
          label="Dátum ďalšej kontroly"
          value={values.nextCheckDate}
          onChange={(v) => onChange('nextCheckDate', v)}
          sx={{ width: { xs: '100%', sm: 240 } }}
        />
        <Box
          sx={{
            display: 'grid',
            gridTemplateColumns: { xs: '1fr', sm: 'repeat(3, 1fr)' },
            gap: 1.5,
          }}
        >
          <TextField
            size="small"
            type="number"
            label="Celkový výdavok (€)"
            value={values.totalExpense}
            onChange={(e) => onChange('totalExpense', e.target.value)}
            error={Boolean(errors['expenses.totalExpense'])}
            helperText={errors['expenses.totalExpense']}
            inputProps={{ min: 0, step: 0.01 }}
          />
          <TextField
            size="small"
            type="number"
            label="Z toho lieky (€)"
            value={values.extraMedicationExpense}
            onChange={(e) => onChange('extraMedicationExpense', e.target.value)}
            error={Boolean(errors['expenses.extraMedicationExpense'])}
            helperText={errors['expenses.extraMedicationExpense']}
            inputProps={{ min: 0, step: 0.01 }}
          />
          <TextField
            size="small"
            type="number"
            label="Z toho krmivo (€)"
            value={values.extraFoodExpense}
            onChange={(e) => onChange('extraFoodExpense', e.target.value)}
            error={Boolean(errors['expenses.extraFoodExpense'])}
            helperText={errors['expenses.extraFoodExpense']}
            inputProps={{ min: 0, step: 0.01 }}
          />
        </Box>
      </Stack>
    </SectionCard>
  );
}
