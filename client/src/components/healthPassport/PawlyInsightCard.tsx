import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { Box, Card, Stack, Typography, alpha, useTheme } from '@mui/material';
import {
  AutoAwesome as SparkleIcon,
  CheckCircleRounded as GoodIcon,
  InfoRounded as InfoIcon,
  WarningRounded as WarnIcon,
} from '@mui/icons-material';
import type { Insight, InsightInput, InsightTone } from './insight';
import { buildInsight } from './insight';

interface Props {
  input: InsightInput;
}

const toneIcon: Record<InsightTone, React.ReactElement> = {
  good: <GoodIcon sx={{ fontSize: 18 }} />,
  info: <InfoIcon sx={{ fontSize: 18 }} />,
  warn: <WarnIcon sx={{ fontSize: 18 }} />,
};

export default function PawlyInsightCard({ input }: Props) {
  const { t } = useTranslation('healthPassport');
  const theme = useTheme();

  const insight: Insight = useMemo(() => buildInsight(input), [input]);

  const toneColor: Record<InsightTone, string> = {
    good: theme.palette.success.main,
    info: theme.palette.info.main,
    warn: theme.palette.warning.main,
  };

  return (
    <Card
      sx={{
        p: { xs: 2, md: 2.5 },
        height: '100%',
        background: `linear-gradient(135deg, ${alpha(
          theme.palette.primary.main,
          theme.palette.mode === 'light' ? 0.08 : 0.16
        )}, ${alpha(theme.palette.secondary.main, theme.palette.mode === 'light' ? 0.06 : 0.12)})`,
        border: `1px solid ${alpha(theme.palette.primary.main, 0.15)}`,
      }}
    >
      <Stack direction="row" alignItems="center" gap={1} sx={{ mb: 1.5 }}>
        <Box
          sx={{
            width: 32,
            height: 32,
            borderRadius: 2,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            bgcolor: alpha(theme.palette.primary.main, 0.14),
            color: 'primary.main',
          }}
        >
          <SparkleIcon sx={{ fontSize: 18 }} />
        </Box>
        <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>
          {t('insight.title')}
        </Typography>
      </Stack>

      <Typography variant="h3" sx={{ fontSize: '1.15rem', fontWeight: 700, mb: 1.5 }}>
        {t(`insight.headline.${insight.headlineKey}`, { name: input.petName })}
      </Typography>

      <Stack spacing={1.25}>
        {insight.items.map((item) => (
          <Stack key={item.id} direction="row" alignItems="flex-start" gap={1}>
            <Box sx={{ color: toneColor[item.tone], display: 'flex', mt: '1px' }}>
              {toneIcon[item.tone]}
            </Box>
            <Typography variant="body2" sx={{ color: 'text.primary' }}>
              {t(item.key as never, item.params)}
            </Typography>
          </Stack>
        ))}
      </Stack>
    </Card>
  );
}
