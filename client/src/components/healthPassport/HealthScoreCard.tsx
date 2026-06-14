import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { Card, Stack, Typography, alpha, useTheme } from '@mui/material';
import type { ValidityStatus } from '../../types/petHealth';
import HealthScoreRing, { type ScoreBreakdownItem } from './HealthScoreRing';
import { md3 } from './md3';

interface Props {
  vaccinationStatus: ValidityStatus;
  dewormingStatus: ValidityStatus;
  ectoStatus: ValidityStatus;
  dietStatus: ValidityStatus;
}

const statusToScore = (s: ValidityStatus): number => {
  if (s === 'VALID') return 100;
  if (s === 'EXPIRING_SOON') return 60;
  if (s === 'EXPIRED') return 10;
  return 40;
};

const statusToBreakdown = (s: ValidityStatus): ScoreBreakdownItem['status'] => {
  if (s === 'VALID') return 'good';
  if (s === 'EXPIRING_SOON') return 'soon';
  if (s === 'EXPIRED') return 'bad';
  return 'unknown';
};

export default function HealthScoreCard({
  vaccinationStatus,
  dewormingStatus,
  ectoStatus,
  dietStatus,
}: Props) {
  const { t } = useTranslation('healthPassport');
  const theme = useTheme();
  const m = md3(theme);

  const statusDetail = (s: ValidityStatus): string => {
    if (s === 'VALID') return t('hero.statusValid');
    if (s === 'EXPIRING_SOON') return t('hero.statusExpiringSoon');
    if (s === 'EXPIRED') return t('hero.statusExpired');
    return t('hero.statusUnknown');
  };

  const statuses = [vaccinationStatus, dewormingStatus, ectoStatus, dietStatus];
  const unknownCount = statuses.filter((s) => s === 'UNKNOWN').length;
  const allUnknown = unknownCount === statuses.length;

  const score = useMemo(() => {
    if (allUnknown) return null;
    const values = [vaccinationStatus, dewormingStatus, ectoStatus, dietStatus].map(statusToScore);
    return values.reduce((a, b) => a + b, 0) / values.length;
  }, [vaccinationStatus, dewormingStatus, ectoStatus, dietStatus, allUnknown]);

  const incomplete = unknownCount > 0 && !allUnknown;

  const scoreBreakdown: ScoreBreakdownItem[] = [
    {
      label: t('hero.vaccLabel'),
      shortLabel: t('hero.vaccShort'),
      status: statusToBreakdown(vaccinationStatus),
      detail: statusDetail(vaccinationStatus),
    },
    {
      label: t('hero.dewLabel'),
      shortLabel: t('hero.dewShort'),
      status: statusToBreakdown(dewormingStatus),
      detail: statusDetail(dewormingStatus),
    },
    {
      label: t('hero.ectoLabel'),
      shortLabel: t('hero.ectoShort'),
      status: statusToBreakdown(ectoStatus),
      detail: statusDetail(ectoStatus),
    },
    {
      label: t('hero.dietLabel'),
      shortLabel: t('hero.dietShort'),
      status: statusToBreakdown(dietStatus),
      detail: statusDetail(dietStatus),
    },
  ];

  return (
    <Card
      sx={{
        mb: 1.5,
        p: { xs: 2, md: 3 },
        border: 0,
        borderRadius: 2,
        boxShadow: `0 2px 12px ${alpha(
          theme.palette.common.black,
          theme.palette.mode === 'dark' ? 0.4 : 0.08
        )}`,
      }}
    >
      <Typography sx={{ ...m.type.titleMedium, color: 'text.secondary', mb: 1.5 }}>
        {t('sections.score')}
      </Typography>
      <Stack alignItems="center">
        <HealthScoreRing
          score={score}
          size={150}
          breakdown={scoreBreakdown}
          incomplete={incomplete}
        />
      </Stack>
    </Card>
  );
}
