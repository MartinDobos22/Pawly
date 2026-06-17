import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { Box, Card, Chip, Stack, Typography, alpha, useTheme } from '@mui/material';
import {
  ReceiptLong as ReceiptIcon,
  ArrowUpward as UpIcon,
  ArrowDownward as DownIcon,
  RemoveCircleOutline as FlatIcon,
} from '@mui/icons-material';
import type { ExpenseRecord } from '../../types/petHealth';
import { today } from './utils.ts';
import { formatDateShort } from '../../utils/relativeDate';
import ExpenseDonut from './ExpenseDonut';

interface ExpenseSummaryCardProps {
  expenses: ExpenseRecord[];
}

type CategoryKey = 'VET_VISIT' | 'MEDICATION' | 'FOOD' | 'OTHER';

const monthKey = (iso: string) => iso.slice(0, 7);
const prevMonthKey = (iso: string) => {
  const d = new Date(`${iso}-01`);
  d.setMonth(d.getMonth() - 1);
  return d.toISOString().slice(0, 7);
};

export default function ExpenseSummaryCard({ expenses }: ExpenseSummaryCardProps) {
  const { t } = useTranslation('healthPassport');
  const theme = useTheme();
  const todayStr = today();

  const CATEGORY_LABELS: Record<CategoryKey, string> = {
    VET_VISIT: t('expenseCard.categoryVet'),
    MEDICATION: t('expenseCard.categoryMed'),
    FOOD: t('expenseCard.categoryFood'),
    OTHER: t('expenseCard.categoryOther'),
  };

  const thisMonthKey = monthKey(todayStr);
  const lastMonthKey = prevMonthKey(thisMonthKey);

  const thisMonthTotal = useMemo(
    () =>
      expenses
        .filter((e) => monthKey(e.date) === thisMonthKey)
        .reduce((acc, x) => acc + x.amount, 0),
    [expenses, thisMonthKey]
  );

  const lastMonthTotal = useMemo(
    () =>
      expenses
        .filter((e) => monthKey(e.date) === lastMonthKey)
        .reduce((acc, x) => acc + x.amount, 0),
    [expenses, lastMonthKey]
  );

  const trend = useMemo(() => {
    if (lastMonthTotal === 0 && thisMonthTotal === 0) return null;
    if (lastMonthTotal === 0) return { pct: null, dir: 'up' as const };
    const diff = thisMonthTotal - lastMonthTotal;
    const pct = (diff / lastMonthTotal) * 100;
    if (Math.abs(pct) < 1) return { pct, dir: 'flat' as const };
    return { pct, dir: (pct > 0 ? 'up' : 'down') as 'up' | 'down' };
  }, [thisMonthTotal, lastMonthTotal]);

  const palette: Record<CategoryKey, string> = {
    VET_VISIT: theme.palette.primary.main,
    MEDICATION: theme.palette.info.main,
    FOOD: theme.palette.secondary.main,
    OTHER: theme.palette.diet.main,
  };

  const slices = useMemo(() => {
    const map: Record<CategoryKey, number> = {
      VET_VISIT: 0,
      MEDICATION: 0,
      FOOD: 0,
      OTHER: 0,
    };
    for (const e of expenses) {
      const k = (CATEGORY_LABELS[e.category as CategoryKey] ? e.category : 'OTHER') as CategoryKey;
      map[k] += e.amount;
    }
    return (Object.keys(map) as CategoryKey[]).map((key) => ({
      key,
      label: CATEGORY_LABELS[key],
      value: map[key],
      color: palette[key],
    }));
  }, [expenses, palette, CATEGORY_LABELS]);

  const totalAll = useMemo(() => expenses.reduce((acc, e) => acc + e.amount, 0), [expenses]);

  const recentTop = useMemo(() => {
    const cutoff = new Date();
    cutoff.setDate(cutoff.getDate() - 90);
    const cutoffIso = cutoff.toISOString().slice(0, 10);
    return [...expenses]
      .filter((e) => e.date >= cutoffIso)
      .sort((a, b) => b.amount - a.amount)
      .slice(0, 3);
  }, [expenses]);

  const trendChip = trend && (
    <Chip
      size="small"
      icon={
        trend.dir === 'up' ? (
          <UpIcon sx={{ fontSize: 14 }} />
        ) : trend.dir === 'down' ? (
          <DownIcon sx={{ fontSize: 14 }} />
        ) : (
          <FlatIcon sx={{ fontSize: 14 }} />
        )
      }
      label={
        trend.pct === null
          ? t('expenseCard.trendNew')
          : t('expenseCard.trendVsLastMonth', {
              sign: trend.pct > 0 ? '+' : '',
              pct: Math.abs(trend.pct).toFixed(0),
            })
      }
      sx={{
        height: 22,
        fontSize: '0.7rem',
        fontWeight: 600,
        bgcolor: alpha(
          trend.dir === 'up'
            ? theme.palette.warning.main
            : trend.dir === 'down'
              ? theme.palette.success.main
              : theme.palette.text.secondary,
          0.14
        ),
        color:
          trend.dir === 'up'
            ? theme.palette.warning.dark
            : trend.dir === 'down'
              ? theme.palette.success.dark
              : 'text.secondary',
        '& .MuiChip-icon': { color: 'inherit', ml: 0.5 },
      }}
    />
  );

  return (
    <Card
      sx={{
        p: { xs: 2, md: 3 },
        height: '100%',
        borderRadius: 0,
        borderTopWidth: 0,
        borderBottomWidth: 0,
      }}
    >
      <Stack direction="row" alignItems="center" gap={1} sx={{ mb: 1.5 }}>
        <ReceiptIcon sx={{ fontSize: 21, color: 'primary.main' }} />
        <Typography variant="h3" sx={{ fontSize: '1.2rem', fontWeight: 700 }}>
          {t('expenseCard.title')}
        </Typography>
      </Stack>

      <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2.5} alignItems="center">
        <ExpenseDonut data={slices} total={totalAll} size={140} />

        <Box sx={{ flex: 1, minWidth: 0 }}>
          <Typography
            variant="caption"
            sx={{ color: 'text.secondary', textTransform: 'none', letterSpacing: 0 }}
          >
            {t('expenseCard.thisMonth')}
          </Typography>
          <Stack direction="row" alignItems="baseline" gap={0.5} sx={{ mt: 0.25 }}>
            <Typography
              sx={{
                fontSize: '1.875rem',
                fontWeight: 800,
                lineHeight: 1,
                letterSpacing: '-0.02em',
              }}
            >
              €{thisMonthTotal.toFixed(2)}
            </Typography>
          </Stack>
          {trendChip && <Box sx={{ mt: 1 }}>{trendChip}</Box>}

          <Stack spacing={0.5} sx={{ mt: 1.5 }}>
            {slices
              .filter((s) => s.value > 0)
              .map((s) => (
                <Stack key={s.key} direction="row" alignItems="center" gap={1}>
                  <Box
                    sx={{
                      width: 8,
                      height: 8,
                      borderRadius: '50%',
                      bgcolor: s.color,
                      flexShrink: 0,
                    }}
                  />
                  <Typography
                    variant="caption"
                    sx={{
                      color: 'text.secondary',
                      textTransform: 'none',
                      letterSpacing: 0,
                      flex: 1,
                    }}
                    noWrap
                  >
                    {s.label}
                  </Typography>
                  <Typography variant="caption" sx={{ fontWeight: 700, color: 'text.primary' }}>
                    €{s.value.toFixed(2)}
                  </Typography>
                </Stack>
              ))}
          </Stack>
        </Box>
      </Stack>

      {recentTop.length > 0 && (
        <Box sx={{ mt: 2, pt: 1.5, borderTop: `1px solid ${theme.palette.divider}` }}>
          <Typography
            variant="caption"
            sx={{ color: 'text.secondary', display: 'block', mb: 0.75 }}
          >
            {t('expenseCard.topExpenses')}
          </Typography>
          <Stack spacing={0.5}>
            {recentTop.map((e) => (
              <Stack key={e.id} direction="row" alignItems="center" gap={1}>
                <Box
                  sx={{
                    width: 6,
                    height: 6,
                    borderRadius: '50%',
                    bgcolor:
                      palette[
                        (CATEGORY_LABELS[e.category as CategoryKey]
                          ? e.category
                          : 'OTHER') as CategoryKey
                      ],
                  }}
                />
                <Typography variant="body2" sx={{ flex: 1, fontWeight: 500 }} noWrap>
                  {e.note || CATEGORY_LABELS[(e.category as CategoryKey) ?? 'OTHER']}
                </Typography>
                <Typography
                  variant="caption"
                  sx={{ color: 'text.secondary', textTransform: 'none', letterSpacing: 0 }}
                >
                  {formatDateShort(e.date)}
                </Typography>
                <Typography variant="body2" sx={{ fontWeight: 700, ml: 1 }}>
                  €{e.amount.toFixed(2)}
                </Typography>
              </Stack>
            ))}
          </Stack>
        </Box>
      )}
    </Card>
  );
}
