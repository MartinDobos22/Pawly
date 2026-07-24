import { type ReactElement } from 'react';
import { useTranslation } from 'react-i18next';
import {
  Box,
  Button,
  Card,
  LinearProgress,
  Stack,
  Typography,
  alpha,
  useTheme,
} from '@mui/material';
import { HistoryOutlined as HistoryIcon } from '@mui/icons-material';
import type { ValidityStatus } from '../../types/petHealth';
import { relativeDate, formatDateShort } from '../../utils/relativeDate';
import HelpHint from '../HelpHint';

interface Props {
  icon: ReactElement;
  label: string;
  hint?: string;
  status: ValidityStatus;
  /** Overrides the computed headline for statuses without a due date (e.g. active diet). */
  headline?: string;
  /** Resolved theme color used for the icon tile, progress bar and action button. */
  accentColor: string;
  nextDate?: string;
  lastDate?: string;
  detail?: string;
  intervalDays?: number;
  primaryActionLabel?: string;
  onPrimaryAction?: () => void;
  onOpen?: () => void;
  onHistory?: () => void;
}

export default function HealthMetricCard({
  icon,
  label,
  hint,
  status,
  headline: headlineOverride,
  accentColor,
  nextDate,
  lastDate,
  detail,
  intervalDays,
  primaryActionLabel,
  onPrimaryAction,
  onOpen,
  onHistory,
}: Props) {
  const theme = useTheme();
  const { t } = useTranslation('healthPassport');
  const rel = nextDate ? relativeDate(nextDate) : null;

  const isEmpty = status === 'UNKNOWN';
  const isOverdue = status === 'EXPIRED';

  let progress: number | null = null;
  if (nextDate && intervalDays && intervalDays > 0 && rel) {
    const used = intervalDays - rel.diffDays;
    progress = Math.max(0, Math.min(100, (used / intervalDays) * 100));
  } else if (status === 'VALID' && !nextDate) {
    progress = 100; // e.g. current diet — present and active
  }

  const overdueDays = isOverdue && rel ? Math.abs(rel.diffDays) : 0;
  const headline = isEmpty
    ? t('status.notSetHeadline')
    : isOverdue
      ? t('status.overdueHeadline', { count: overdueDays })
      : rel
        ? rel.text
        : (headlineOverride ?? detail) || t('status.valid');

  const headlineColor = isEmpty ? 'text.secondary' : isOverdue ? 'error.main' : 'text.primary';
  const subtitle = lastDate
    ? `${t('detail.last', { date: formatDateShort(lastDate) })}${detail ? ` · ${detail}` : ''}`
    : detail;

  const barColor = isOverdue ? theme.palette.error.main : accentColor;

  return (
    <Card
      onClick={onOpen}
      sx={{
        p: 2,
        height: '100%',
        borderRadius: 2,
        cursor: onOpen ? 'pointer' : 'default',
        borderStyle: isEmpty ? 'dashed' : 'solid',
        display: 'flex',
        flexDirection: 'column',
        gap: 1.5,
        transition: 'transform 120ms ease, box-shadow 120ms ease, border-color 120ms ease',
        '@media (prefers-reduced-motion: reduce)': { transition: 'none' },
        '&:hover': onOpen
          ? { transform: 'translateY(-1px)', boxShadow: theme.shadows[2] }
          : undefined,
      }}
    >
      <Stack direction="row" gap={1.5} alignItems="flex-start">
        <Box
          sx={{
            width: 40,
            height: 40,
            borderRadius: 2,
            bgcolor: isEmpty ? alpha(theme.palette.text.secondary, 0.08) : alpha(accentColor, 0.12),
            color: isEmpty ? 'text.secondary' : accentColor,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexShrink: 0,
            '& svg': { fontSize: 21 },
          }}
        >
          {icon}
        </Box>
        <Box sx={{ minWidth: 0, flex: 1 }}>
          <Stack direction="row" alignItems="center" gap={0.25} sx={{ minWidth: 0 }}>
            <Typography
              variant="caption"
              sx={{ color: 'text.secondary', textTransform: 'none', letterSpacing: 0 }}
              noWrap
            >
              {label}
            </Typography>
            {hint && <HelpHint text={hint} size={14} />}
          </Stack>
          <Typography
            sx={{ fontSize: '1.125rem', fontWeight: 700, lineHeight: 1.2, color: headlineColor }}
            noWrap
          >
            {headline}
          </Typography>
          {!isEmpty && nextDate && rel && (
            <Typography variant="caption" sx={{ color: 'text.secondary' }} noWrap>
              {formatDateShort(nextDate)}
            </Typography>
          )}
        </Box>
      </Stack>

      {subtitle && (
        <Typography variant="body2" sx={{ color: 'text.secondary' }} noWrap>
          {subtitle}
        </Typography>
      )}

      <Box sx={{ flex: 1 }} />

      {progress !== null && (
        <LinearProgress
          variant="determinate"
          value={progress}
          sx={{
            height: 6,
            borderRadius: 999,
            bgcolor: alpha(barColor, theme.palette.mode === 'light' ? 0.14 : 0.22),
            '& .MuiLinearProgress-bar': { bgcolor: barColor, borderRadius: 999 },
          }}
        />
      )}

      {(onPrimaryAction || onOpen) && (
        <Button
          fullWidth
          variant="outlined"
          onClick={(e) => {
            e.stopPropagation();
            (onPrimaryAction ?? onOpen)?.();
          }}
          sx={{
            color: accentColor,
            borderColor: alpha(accentColor, 0.35),
            '&:hover': { borderColor: accentColor, bgcolor: alpha(accentColor, 0.06) },
          }}
        >
          {primaryActionLabel ?? t('status.schedule')}
        </Button>
      )}

      {onHistory && (
        <Button
          fullWidth
          variant="text"
          size="small"
          startIcon={<HistoryIcon sx={{ fontSize: 18 }} />}
          onClick={(e) => {
            e.stopPropagation();
            onHistory();
          }}
          sx={{ color: 'text.secondary', mt: -0.5 }}
        >
          {t('history.button')}
        </Button>
      )}
    </Card>
  );
}
