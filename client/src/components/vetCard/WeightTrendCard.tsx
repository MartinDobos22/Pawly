import { Box, Card, Stack, Typography, useTheme } from '@mui/material';
import {
  MonitorWeightOutlined as WeightIcon,
  TrendingUp as UpIcon,
  TrendingDown as DownIcon,
  TrendingFlat as FlatIcon,
} from '@mui/icons-material';
import { useTranslation } from 'react-i18next';
import type { WeightTrend } from '../../utils/weightTrend';
import { sparklinePath } from '../../utils/weightTrend';

interface Props {
  trend: WeightTrend;
}

const SPARK_W = 120;
const SPARK_H = 36;

export default function WeightTrendCard({ trend }: Props) {
  const theme = useTheme();
  const { t, i18n } = useTranslation('vetCard');
  const lang = i18n.language === 'en' ? 'en-US' : 'sk-SK';
  const nf = new Intl.NumberFormat(lang, { maximumFractionDigits: 1 });

  const { direction, latest, deltaKg, deltaPct, points } = trend;
  // A drop in body weight is the clinically concerning direction — flag it red.
  const toneColor =
    direction === 'down'
      ? theme.palette.error.main
      : direction === 'up'
        ? theme.palette.warning.main
        : theme.palette.success.main;
  const TrendIcon = direction === 'down' ? DownIcon : direction === 'up' ? UpIcon : FlatIcon;

  const path = sparklinePath(
    points.map((p) => p.kg),
    SPARK_W,
    SPARK_H
  );
  const deltaSign = deltaKg > 0 ? '+' : '';
  const deltaLabel =
    direction === 'flat'
      ? t('weightTrend.stable')
      : `${deltaSign}${nf.format(deltaKg)} kg (${deltaSign}${nf.format(deltaPct)} %)`;

  return (
    <Card
      variant="outlined"
      sx={{
        p: { xs: 1.75, md: 2 },
        bgcolor: 'background.default',
        borderRadius: 0,
        borderTopWidth: 0,
        borderBottomWidth: 0,
      }}
    >
      <Stack direction="row" alignItems="center" gap={1} sx={{ mb: 1.5 }}>
        <WeightIcon sx={{ fontSize: 18, color: 'text.secondary' }} />
        <Typography variant="caption" sx={{ color: 'text.secondary' }}>
          {t('weightTrend.title')}
        </Typography>
      </Stack>

      <Stack
        direction="row"
        alignItems="center"
        justifyContent="space-between"
        flexWrap="wrap"
        gap={1.5}
      >
        <Box>
          <Typography variant="h3" sx={{ fontSize: '1.4rem', fontWeight: 700, lineHeight: 1.1 }}>
            {nf.format(latest)} kg
          </Typography>
          <Stack direction="row" alignItems="center" gap={0.5} sx={{ mt: 0.5, color: toneColor }}>
            <TrendIcon sx={{ fontSize: 16 }} />
            <Typography variant="caption" sx={{ fontWeight: 600, color: toneColor }}>
              {deltaLabel}
            </Typography>
          </Stack>
        </Box>

        <Box
          component="svg"
          viewBox={`0 0 ${SPARK_W} ${SPARK_H}`}
          width={SPARK_W}
          height={SPARK_H}
          sx={{ overflow: 'visible' }}
          role="img"
          aria-label={t('weightTrend.title')}
        >
          <path
            d={path}
            fill="none"
            stroke={toneColor}
            strokeWidth={1.75}
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </Box>
      </Stack>
    </Card>
  );
}
