import { useTranslation } from 'react-i18next';
import { Box, Stack, Typography, useTheme } from '@mui/material';
import { Cell, Pie, PieChart, ResponsiveContainer } from 'recharts';

interface Slice {
  key: string;
  label: string;
  value: number;
  color: string;
}

interface Props {
  data: Slice[];
  total: number;
  currency?: string;
  size?: number;
}

export default function ExpenseDonut({ data, total, currency = '€', size = 160 }: Props) {
  const { t } = useTranslation('healthPassport');
  const theme = useTheme();
  const filtered = data.filter((s) => s.value > 0);

  if (filtered.length === 0) {
    return (
      <Box
        sx={{
          width: size,
          height: size,
          borderRadius: '50%',
          border: `2px dashed ${theme.palette.divider}`,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <Typography variant="caption" sx={{ color: 'text.secondary' }}>
          {t('expenseCard.noData')}
        </Typography>
      </Box>
    );
  }

  return (
    <Box sx={{ position: 'relative', width: size, height: size }}>
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie
            data={filtered}
            dataKey="value"
            innerRadius={size * 0.35}
            outerRadius={size * 0.48}
            paddingAngle={2}
            stroke="none"
            isAnimationActive={false}
          >
            {filtered.map((s) => (
              <Cell key={s.key} fill={s.color} />
            ))}
          </Pie>
        </PieChart>
      </ResponsiveContainer>
      <Stack
        sx={{
          position: 'absolute',
          inset: 0,
          alignItems: 'center',
          justifyContent: 'center',
          pointerEvents: 'none',
        }}
      >
        <Typography sx={{ fontSize: size * 0.13, fontWeight: 800, lineHeight: 1 }}>
          {currency}
          {total.toFixed(2)}
        </Typography>
        <Typography
          variant="caption"
          sx={{ color: 'text.secondary', textTransform: 'none', letterSpacing: 0 }}
        >
          {t('expenseCard.totalSuffix')}
        </Typography>
      </Stack>
    </Box>
  );
}
