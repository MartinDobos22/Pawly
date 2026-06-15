import { useTranslation } from 'react-i18next';
import { Box, Card, Stack, Tooltip, Typography, alpha, useTheme } from '@mui/material';
import {
  Vaccines as VaccinesIcon,
  Biotech as DewormIcon,
  Restaurant as DietIcon,
  DirectionsRun as ActivityIcon,
} from '@mui/icons-material';
import type { ValidityStatus, DietEntry } from '../../types/petHealth';

interface Props {
  vaccinationStatus: ValidityStatus;
  dewormingStatus: ValidityStatus;
  currentDiet?: DietEntry;
  onOpenVaccination?: () => void;
  onOpenDeworming?: () => void;
  onOpenDiet?: () => void;
}

type RingTone = 'good' | 'soon' | 'bad' | 'unknown';

interface RingItem {
  key: string;
  label: string;
  icon: React.ReactElement;
  percent: number | null;
  tone: RingTone;
  onClick?: () => void;
  note?: string;
}

const statusToPercent = (s: ValidityStatus): number | null => {
  if (s === 'VALID') return 92;
  if (s === 'EXPIRING_SOON') return 60;
  if (s === 'EXPIRED') return 15;
  return null;
};

const statusToTone = (s: ValidityStatus): RingTone => {
  if (s === 'VALID') return 'good';
  if (s === 'EXPIRING_SOON') return 'soon';
  if (s === 'EXPIRED') return 'bad';
  return 'unknown';
};

const ACTIVITY_PLACEHOLDER = 95;

function MetricRing({ item }: { item: RingItem }) {
  const theme = useTheme();
  const size = 96;
  const stroke = 9;
  const radius = (size - stroke) / 2;
  const circumference = 2 * Math.PI * radius;
  const center = size / 2;

  const hasValue = item.percent !== null;
  const value = hasValue ? Math.max(0, Math.min(100, item.percent!)) : 0;
  const dash = (value / 100) * circumference;

  const toneColor: Record<RingTone, string> = {
    good: theme.palette.success.main,
    soon: theme.palette.warning.main,
    bad: theme.palette.error.main,
    unknown: theme.palette.divider,
  };
  const color = toneColor[item.tone];
  const trackColor =
    theme.palette.mode === 'light'
      ? alpha(theme.palette.primary.main, 0.1)
      : alpha(theme.palette.common.white, 0.1);

  const interactive = Boolean(item.onClick);

  const content = (
    <Stack
      alignItems="center"
      spacing={1}
      role={interactive ? 'button' : undefined}
      tabIndex={interactive ? 0 : undefined}
      onClick={item.onClick}
      onKeyDown={
        interactive
          ? (e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                item.onClick?.();
              }
            }
          : undefined
      }
      sx={{
        p: 1,
        borderRadius: 3,
        cursor: interactive ? 'pointer' : 'default',
        transition: 'background-color 120ms ease',
        '&:hover': interactive ? { bgcolor: alpha(theme.palette.primary.main, 0.06) } : undefined,
        '&:focus-visible': interactive
          ? { outline: `2px solid ${theme.palette.primary.main}`, outlineOffset: 2 }
          : undefined,
      }}
    >
      <Box sx={{ position: 'relative', width: size, height: size }}>
        <svg width={size} height={size}>
          <circle
            cx={center}
            cy={center}
            r={radius}
            fill="none"
            stroke={trackColor}
            strokeWidth={stroke}
          />
          {hasValue && (
            <circle
              cx={center}
              cy={center}
              r={radius}
              fill="none"
              stroke={color}
              strokeWidth={stroke}
              strokeLinecap="round"
              strokeDasharray={`${dash} ${circumference - dash}`}
              transform={`rotate(-90 ${center} ${center})`}
              style={{ transition: 'stroke-dasharray 400ms ease' }}
            />
          )}
        </svg>
        <Box
          sx={{
            position: 'absolute',
            inset: 0,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            color: hasValue ? 'text.primary' : 'text.secondary',
          }}
        >
          <Box sx={{ color: 'primary.main', display: 'flex', mb: 0.25 }}>{item.icon}</Box>
          <Typography sx={{ fontSize: '1.05rem', fontWeight: 700, lineHeight: 1 }}>
            {hasValue ? `${Math.round(value)}%` : '—'}
          </Typography>
        </Box>
      </Box>
      <Typography variant="body2" sx={{ fontWeight: 600, color: 'text.primary' }}>
        {item.label}
      </Typography>
    </Stack>
  );

  return item.note ? (
    <Tooltip title={item.note} arrow>
      {content}
    </Tooltip>
  ) : (
    content
  );
}

export default function HealthOverviewRings({
  vaccinationStatus,
  dewormingStatus,
  currentDiet,
  onOpenVaccination,
  onOpenDeworming,
  onOpenDiet,
}: Props) {
  const { t } = useTranslation('healthPassport');

  const items: RingItem[] = [
    {
      key: 'vaccination',
      label: t('overview.vaccination'),
      icon: <VaccinesIcon sx={{ fontSize: 18 }} />,
      percent: statusToPercent(vaccinationStatus),
      tone: statusToTone(vaccinationStatus),
      onClick: vaccinationStatus !== 'UNKNOWN' ? onOpenVaccination : undefined,
    },
    {
      key: 'deworming',
      label: t('overview.deworming'),
      icon: <DewormIcon sx={{ fontSize: 18 }} />,
      percent: statusToPercent(dewormingStatus),
      tone: statusToTone(dewormingStatus),
      onClick: dewormingStatus !== 'UNKNOWN' ? onOpenDeworming : undefined,
    },
    {
      key: 'diet',
      label: t('overview.diet'),
      icon: <DietIcon sx={{ fontSize: 18 }} />,
      percent: currentDiet ? 88 : null,
      tone: currentDiet ? 'good' : 'unknown',
      onClick: currentDiet ? onOpenDiet : undefined,
    },
    {
      key: 'activity',
      label: t('overview.activity'),
      icon: <ActivityIcon sx={{ fontSize: 18 }} />,
      percent: ACTIVITY_PLACEHOLDER,
      tone: 'good',
      note: t('overview.activitySoon'),
    },
  ];

  return (
    <Card sx={{ p: { xs: 2, md: 2.5 }, mb: 2.5 }}>
      <Typography variant="h3" sx={{ fontSize: '1.25rem', fontWeight: 700, mb: 2 }}>
        {t('overview.title')}
      </Typography>
      <Box
        sx={{
          display: 'grid',
          gridTemplateColumns: { xs: 'repeat(2, 1fr)', md: 'repeat(4, 1fr)' },
          gap: 1.5,
          justifyItems: 'center',
        }}
      >
        {items.map((item) => (
          <MetricRing key={item.key} item={item} />
        ))}
      </Box>
    </Card>
  );
}
