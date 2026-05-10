import {
  Accordion,
  AccordionDetails,
  AccordionSummary,
  Box,
  Stack,
  TextField,
  Typography,
} from '@mui/material';
import { ExpandMore as ExpandMoreIcon, ReceiptLong as ReceiptIcon } from '@mui/icons-material';

import type { ErrorMap, ExpensesValues } from '../formTypes';

interface ExpensesProps {
  values: ExpensesValues;
  errors: ErrorMap;
  expanded: boolean;
  onExpand: (next: boolean) => void;
  onChange: <K extends keyof ExpensesValues>(field: K, value: ExpensesValues[K]) => void;
}

export default function Expenses({ values, errors, expanded, onExpand, onChange }: ExpensesProps) {
  return (
    <Accordion
      expanded={expanded}
      onChange={(_, next) => onExpand(next)}
      disableGutters
      sx={{
        border: '1px solid',
        borderColor: 'divider',
        borderRadius: 1,
        '&:before': { display: 'none' },
      }}
    >
      <AccordionSummary expandIcon={<ExpandMoreIcon />}>
        <Stack direction="row" alignItems="center" gap={1}>
          <ReceiptIcon sx={{ fontSize: 18, color: 'text.secondary' }} />
          <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
            Výdavky a ďalší termín
          </Typography>
        </Stack>
      </AccordionSummary>
      <AccordionDetails>
        <Stack spacing={1.5}>
          <TextField
            size="small"
            type="date"
            label="Dátum ďalšej kontroly"
            InputLabelProps={{ shrink: true }}
            value={values.nextCheckDate}
            onChange={(e) => onChange('nextCheckDate', e.target.value)}
            fullWidth
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
      </AccordionDetails>
    </Accordion>
  );
}
