import {
  Box,
  Card,
  CardContent,
  LinearProgress,
  Stack,
  Typography,
  alpha,
  useTheme,
} from '@mui/material';
import { ReceiptLong as ReceiptIcon } from '@mui/icons-material';
import type { ExpenseRecord } from '../../types/dogHealth';
import { today } from './utils.ts';

interface ExpenseSummaryCardProps {
  expenses: ExpenseRecord[];
}

const CATEGORY_META: Record<string, { label: string; color: string }> = {
  VET_VISIT: { label: 'Veterinár', color: '#3b82f6' },
  MEDICATION: { label: 'Lieky', color: '#06b6d4' },
  FOOD: { label: 'Krmivo', color: '#22c55e' },
  OTHER: { label: 'Ostatné', color: '#94a3b8' },
};

export default function ExpenseSummaryCard({ expenses }: ExpenseSummaryCardProps) {
  const theme = useTheme();
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
    <Card
      sx={{
        borderRadius: 3,
        border: '1px solid',
        borderColor: 'divider',
        boxShadow: 'none',
        height: '100%',
      }}
    >
      <CardContent sx={{ p: 2.5 }}>
        <Stack direction="row" alignItems="center" gap={1} sx={{ mb: 2 }}>
          <Box
            sx={{
              width: 32,
              height: 32,
              borderRadius: 2,
              bgcolor: alpha('#f43f5e', 0.1),
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#f43f5e',
            }}
          >
            <ReceiptIcon sx={{ fontSize: 16 }} />
          </Box>
          <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>
            Výdavky
          </Typography>
        </Stack>

        {/* Month / Year totals */}
        <Box
          sx={{
            display: 'grid',
            gridTemplateColumns: '1fr 1fr',
            gap: 1.5,
            mb: 2,
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
                borderRadius: 2,
                bgcolor: alpha(theme.palette.primary.main, 0.05),
                border: '1px solid',
                borderColor: alpha(theme.palette.primary.main, 0.1),
              }}
            >
              <Typography variant="caption" sx={{ color: 'text.secondary', display: 'block', fontSize: '0.68rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.06em', mb: 0.25 }}>
                {label}
              </Typography>
              <Typography sx={{ fontWeight: 800, fontSize: '1.15rem', color: 'text.primary', lineHeight: 1 }}>
                {value.toFixed(0)}
                <Typography component="span" sx={{ fontWeight: 500, fontSize: '0.75rem', color: 'text.secondary', ml: 0.5 }}>
                  €
                </Typography>
              </Typography>
            </Box>
          ))}
        </Box>

        {/* Category breakdown */}
        <Stack spacing={1.25}>
          {categorySums.map(({ label, color, amount }) => (
            <Box key={label}>
              <Stack direction="row" justifyContent="space-between" sx={{ mb: 0.5 }}>
                <Typography variant="caption" sx={{ fontWeight: 600, fontSize: '0.75rem', color: 'text.secondary' }}>
                  {label}
                </Typography>
                <Typography variant="caption" sx={{ fontWeight: 700, fontSize: '0.75rem', color: 'text.primary' }}>
                  {amount.toFixed(0)} €
                </Typography>
              </Stack>
              <LinearProgress
                variant="determinate"
                value={(amount / maxAmount) * 100}
                sx={{
                  height: 5,
                  borderRadius: 3,
                  bgcolor: alpha(color, 0.12),
                  '& .MuiLinearProgress-bar': {
                    bgcolor: color,
                    borderRadius: 3,
                  },
                }}
              />
            </Box>
          ))}
        </Stack>
      </CardContent>
    </Card>
  );
}
