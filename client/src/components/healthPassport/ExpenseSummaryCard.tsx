import { Box, Card, LinearProgress, Stack, Typography } from '@mui/material';
import { ReceiptLong as ReceiptIcon } from '@mui/icons-material';
import type { ExpenseRecord } from '../../types/dogHealth';
import { today } from './utils.ts';

interface ExpenseSummaryCardProps {
  expenses: ExpenseRecord[];
}

type CategoryColor = 'primary' | 'info' | 'success' | 'warning';

const CATEGORY_META: Record<string, { label: string; color: CategoryColor }> = {
  VET_VISIT: { label: 'Veterinár', color: 'primary' },
  MEDICATION: { label: 'Lieky', color: 'info' },
  FOOD: { label: 'Krmivo', color: 'success' },
  OTHER: { label: 'Ostatné', color: 'warning' },
};

export default function ExpenseSummaryCard({ expenses }: ExpenseSummaryCardProps) {
  const todayStr = today();

  const monthly = expenses
    .filter((e) => e.date.slice(0, 7) === todayStr.slice(0, 7))
    .reduce((acc, x) => acc + x.amount, 0);

  const yearly = expenses
    .filter((e) => e.date.slice(0, 4) === todayStr.slice(0, 4))
    .reduce((acc, x) => acc + x.amount, 0);

  const categorySums = Object.entries(CATEGORY_META).map(([category, meta]) => ({
    ...meta,
    category,
    amount: expenses.filter((e) => e.category === category).reduce((acc, x) => acc + x.amount, 0),
  }));

  const maxAmount = Math.max(...categorySums.map((c) => c.amount), 1);

  return (
    <Card sx={{ p: 1.5, height: '100%' }}>
      <Stack direction="row" alignItems="center" gap={1} sx={{ mb: 1.25 }}>
        <ReceiptIcon sx={{ fontSize: 18, color: 'text.secondary' }} />
        <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
          Výdavky
        </Typography>
      </Stack>

      <Box
        sx={{
          display: 'grid',
          gridTemplateColumns: '1fr 1fr',
          gap: 1,
          mb: 1.5,
        }}
      >
        {[
          { label: 'Tento mesiac', value: monthly },
          { label: 'Tento rok', value: yearly },
        ].map(({ label, value }) => (
          <Box
            key={label}
            sx={{
              p: 1.5,
              borderRadius: 1,
              border: '1px solid',
              borderColor: 'divider',
            }}
          >
            <Typography
              variant="overline"
              sx={{ color: 'text.secondary', display: 'block', lineHeight: 1.2 }}
            >
              {label}
            </Typography>
            <Typography sx={{ fontWeight: 700, fontSize: '1.15rem', lineHeight: 1.4 }}>
              {value.toFixed(0)}
              <Typography
                component="span"
                sx={{ fontWeight: 400, fontSize: '0.8rem', color: 'text.secondary', ml: 0.5 }}
              >
                €
              </Typography>
            </Typography>
          </Box>
        ))}
      </Box>

      <Stack spacing={1.25}>
        {categorySums.map(({ label, color, amount }) => (
          <Box key={label}>
            <Stack direction="row" justifyContent="space-between" sx={{ mb: 0.5 }}>
              <Typography variant="caption" sx={{ color: 'text.secondary', fontWeight: 500 }}>
                {label}
              </Typography>
              <Typography variant="caption" sx={{ fontWeight: 600 }}>
                {amount.toFixed(0)} €
              </Typography>
            </Stack>
            <LinearProgress
              variant="determinate"
              value={(amount / maxAmount) * 100}
              color={color}
              sx={{ height: 4, borderRadius: 1 }}
            />
          </Box>
        ))}
      </Stack>
    </Card>
  );
}
