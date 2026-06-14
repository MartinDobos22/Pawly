import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import type { ValidityStatus } from '../../types/petHealth';
import HealthScoreRing, { type ScoreBreakdownItem } from './HealthScoreRing';

interface Props {
  vaccinationStatus: ValidityStatus;
  dewormingStatus: ValidityStatus;
  ectoStatus: ValidityStatus;
  dietStatus: ValidityStatus;
  size?: number;
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

export default function HealthScoreCluster({
  vaccinationStatus,
  dewormingStatus,
  ectoStatus,
  dietStatus,
  size = 120,
}: Props) {
  const { t } = useTranslation('healthPassport');

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
    <HealthScoreRing score={score} size={size} breakdown={scoreBreakdown} incomplete={incomplete} />
  );
}
