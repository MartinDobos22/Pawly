import { type ReactElement } from 'react';
import { useTranslation } from 'react-i18next';
import {
  Box,
  Button,
  Card,
  LinearProgress,
  Stack,
  Tooltip,
  Typography,
  alpha,
  useTheme,
} from '@mui/material';
import {
  ChevronRight as ChevronIcon,
  CheckCircle as CheckIcon,
  WarningAmber as WarningIcon,
  ErrorOutline as ErrorIcon,
  AddCircleOutline as PlusIcon,
} from '@mui/icons-material';
import type { ValidityStatus } from '../../types/petHealth';
import { relativeDate, formatDateShort } from '../../utils/relativeDate';
import HelpHint from '../HelpHint';

interface Props {
  icon: ReactElement;
  label: string;
  hint?: string;
  status: ValidityStatus;
  nextDate?: string;
  lastDate?: string;
  detail?: string;
  intervalDays?: number;
  primaryActionLabel?: string;
  onPrimaryAction?: () => void;
  onOpen?: () => void;
}

const statusIcon = (status: ValidityStatus) => {
  switch (status) {
    case 'VALID':
      return { tone: 'success' as const, Icon: CheckIcon };
    case 'EXPIRING_SOON':
      return { tone: 'warning' as const, Icon: WarningIcon };
    case 'EXPIRED':
      return { tone: 'error' as const, Icon: ErrorIcon };
    default:
      return { tone: 'neutral' as const, Icon: PlusIcon };
  }
};

export default function HealthMetricCard({
  icon,
  label,
  hint,
  status,
  nextDate,
  lastDate,
  detail,
  intervalDays,
  primaryActionLabel,
  onPrimaryAction,
  onOpen,
}: Props) {
  const theme = useTheme();
  const { t } = useTranslation('healthPassport');
  const meta = statusIcon(status);
  const statusLabel =
    status === 'VALID'
      ? t('status.valid')
      : status === 'EXPIRING_SOON'
        ? t('status.expiringSoon')
        : status === 'EXPIRED'
          ? t('status.overdue')
          : t('status.notSet');
  const rel = nextDate ? relativeDate(nextDate) : null;

  const toneColor =
    meta.tone === 'success'
      ? theme.palette.success.main
      : meta.tone === 'warning'
        ? theme.palette.warning.main
        : meta.tone === 'error'
          ? theme.palette.error.main
          : theme.palette.text.disabled;

  const surface =
    meta.tone === 'neutral'
      ? 'transparent'
      : alpha(toneColor, theme.palette.mode === 'light' ? 0.06 : 0.14);

  let progress: number | null = null;
  if (nextDate && intervalDays && intervalDays > 0 && rel) {
    const used = intervalDays - rel.diffDays;
    progress = Math.max(0, Math.min(100, (used / intervalDays) * 100));
  }

  const isEmpty = status === 'UNKNOWN';
  const isOverdue = status === 'EXPIRED';
  const headlineColor = isEmpty ? 'text.secondary' : isOverdue ? 'error.main' : 'text.primary';

  const overdueDays = isOverdue && rel ? Math.abs(rel.diffDays) : 0;
  const headline = isEmpty
    ? t('status.notSetHeadline')
    : isOverdue
      ? t('status.overdueHeadline', { count: overdueDays })
      : rel
        ? rel.text
        : detail || statusLabel;

  if (isEmpty) {
    return (
      <Card
        onClick={onPrimaryAction || onOpen}
        sx={{
          position: 'relative',
          p: 1.75,
          cursor: onPrimaryAction || onOpen ? 'pointer' : 'default',
          borderStyle: 'dashed',
          borderColor: theme.palette.divider,
          bgcolor: 'transparent',
          transition: 'border-color 120ms ease, background-color 120ms ease',
          '&:hover':
            onPrimaryAction || onOpen
              ? {
                  borderColor: alpha(theme.palette.primary.main, 0.5),
                  bgcolor: alpha(theme.palette.primary.main, 0.04),
                }
              : undefined,
        }}
      >
        <Stack direction="row" gap={1.25} alignItems="center">
          <Box
            sx={{
              width: 36,
              height: 36,
              borderRadius: 2,
              bgcolor: alpha(theme.palette.text.secondary, 0.08),
              color: 'text.secondary',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0,
              '& svg': { fontSize: 20 },
            }}
          >
            {icon}
          </Box>
          <Stack sx={{ minWidth: 0, flex: 1 }} spacing={0.25}>
            <Stack direction="row" alignItems="center" gap={0.25} sx={{ minWidth: 0 }}>
              <Typography variant="caption" sx={{ color: 'text.secondary' }} noWrap>
                {label}
              </Typography>
              {hint && <HelpHint text={hint} size={14} />}
            </Stack>
            <Typography
              variant="body2"
              sx={{ color: 'text.secondary', fontStyle: 'italic', opacity: 0.85 }}
              noWrap
            >
              {t('status.notSetHeadline')}
            </Typography>
          </Stack>
          {(onPrimaryAction || onOpen) && (
            <Button
              size="small"
              variant="outlined"
              startIcon={<PlusIcon sx={{ fontSize: 16 }} />}
              onClick={(e) => {
                e.stopPropagation();
                (onPrimaryAction ?? onOpen)?.();
              }}
              sx={{ minHeight: 32, py: 0.5, px: 1.25, fontSize: '0.78rem', flexShrink: 0 }}
            >
              {primaryActionLabel ?? t('actions.add', { ns: 'common' })}
            </Button>
          )}
        </Stack>
      </Card>
    );
  }

  return (
    <Card
      onClick={onOpen}
      sx={{
        position: 'relative',
        p: 2,
        cursor: onOpen ? 'pointer' : 'default',
        borderColor: alpha(toneColor, 0.25),
        bgcolor: surface,
        transition: 'transform 120ms ease, box-shadow 120ms ease, border-color 120ms ease',
        '&:hover': onOpen
          ? {
              transform: 'translateY(-1px)',
              boxShadow: `0 6px 18px ${alpha(
                theme.palette.common.black,
                theme.palette.mode === 'dark' ? 0.4 : 0.12
              )}`,
            }
          : undefined,
      }}
    >
      <Stack spacing={1.25}>
        <Stack direction="row" alignItems="flex-start" justifyContent="space-between" gap={1}>
          <Stack direction="row" gap={1.25} alignItems="center" sx={{ minWidth: 0 }}>
            <Box
              sx={{
                width: 36,
                height: 36,
                borderRadius: 2,
                bgcolor: alpha(toneColor, 0.16),
                color: toneColor,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                '& svg': { fontSize: 20 },
              }}
            >
              {icon}
            </Box>
            <Typography variant="caption" sx={{ color: 'text.secondary' }} noWrap>
              {label}
            </Typography>
            {hint && <HelpHint text={hint} size={14} />}
          </Stack>
          <Tooltip title={statusLabel}>
            <meta.Icon sx={{ fontSize: 18, color: toneColor }} />
          </Tooltip>
        </Stack>

        <Box sx={{ minHeight: 44 }}>
          <Stack direction="row" alignItems="center" gap={1}>
            {isOverdue && <ErrorIcon sx={{ fontSize: 20, color: 'error.main', flexShrink: 0 }} />}
            <Typography
              variant="h3"
              sx={{ fontSize: '1.6rem', fontWeight: 700, color: headlineColor, lineHeight: 1.2 }}
            >
              {headline}
            </Typography>
          </Stack>
          {(lastDate || detail) && (
            <Typography variant="body2" sx={{ color: 'text.secondary', mt: 0.5 }} noWrap>
              {lastDate ? t('detail.last', { date: formatDateShort(lastDate) }) : detail}
              {lastDate && detail ? ` · ${detail}` : ''}
            </Typography>
          )}
        </Box>

        {progress !== null && !isOverdue && (
          <Box>
            <LinearProgress
              variant="determinate"
              value={progress}
              sx={{
                height: 6,
                borderRadius: 3,
                bgcolor: alpha(toneColor, 0.12),
                '& .MuiLinearProgress-bar': {
                  bgcolor: toneColor,
                  borderRadius: 3,
                },
              }}
            />
          </Box>
        )}

        {(onPrimaryAction || onOpen) && (
          <Stack direction="row" justifyContent="space-between" alignItems="center">
            {onPrimaryAction ? (
              <Button
                size="small"
                onClick={(e) => {
                  e.stopPropagation();
                  onPrimaryAction();
                }}
                sx={{
                  px: 1,
                  minHeight: 28,
                  color: toneColor,
                  fontWeight: 600,
                }}
              >
                {primaryActionLabel ?? t('status.schedule')}
              </Button>
            ) : (
              <Box />
            )}
            {onOpen && <ChevronIcon sx={{ color: 'text.disabled', fontSize: 18 }} />}
          </Stack>
        )}
      </Stack>
    </Card>
  );
}
