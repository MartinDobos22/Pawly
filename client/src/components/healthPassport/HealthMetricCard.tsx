import { type ReactElement } from 'react';
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
import type { ValidityStatus } from '../../types/dogHealth';
import { relativeDate, formatDateShort } from '../../utils/relativeDate';

interface Props {
  icon: ReactElement;
  label: string;
  status: ValidityStatus;
  nextDate?: string;
  lastDate?: string;
  detail?: string;
  intervalDays?: number;
  primaryActionLabel?: string;
  onPrimaryAction?: () => void;
  onOpen?: () => void;
}

const statusMeta = (status: ValidityStatus) => {
  switch (status) {
    case 'VALID':
      return { tone: 'success' as const, label: 'Platné', Icon: CheckIcon };
    case 'EXPIRING_SOON':
      return { tone: 'warning' as const, label: 'Vyprší čoskoro', Icon: WarningIcon };
    case 'EXPIRED':
      return { tone: 'error' as const, label: 'Po termíne', Icon: ErrorIcon };
    default:
      return { tone: 'neutral' as const, label: 'Nezadané', Icon: PlusIcon };
  }
};

export default function HealthMetricCard({
  icon,
  label,
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
  const meta = statusMeta(status);
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
    ? 'Ešte nezadané'
    : isOverdue
      ? `Po termíne ${overdueDays} ${overdueDays === 1 ? 'deň' : overdueDays >= 2 && overdueDays <= 4 ? 'dni' : 'dní'}`
      : rel
        ? rel.text
        : detail || meta.label;

  return (
    <Card
      onClick={onOpen}
      sx={{
        position: 'relative',
        p: 2,
        cursor: onOpen ? 'pointer' : 'default',
        borderColor: isEmpty ? theme.palette.divider : alpha(toneColor, 0.35),
        bgcolor: surface,
        transition: 'transform 120ms ease, box-shadow 120ms ease, border-color 120ms ease',
        '&:hover': onOpen
          ? {
              transform: 'translateY(-1px)',
              boxShadow: '0 6px 18px rgba(15,76,92,0.10)',
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
          </Stack>
          <Tooltip title={meta.label}>
            <meta.Icon sx={{ fontSize: 18, color: toneColor }} />
          </Tooltip>
        </Stack>

        <Box sx={{ minHeight: 56 }}>
          <Stack direction="row" alignItems="center" gap={1}>
            {isOverdue && <ErrorIcon sx={{ fontSize: 20, color: 'error.main', flexShrink: 0 }} />}
            <Typography
              variant="h3"
              sx={{ fontSize: '1.4rem', fontWeight: 700, color: headlineColor, lineHeight: 1.2 }}
            >
              {headline}
            </Typography>
          </Stack>
          {isEmpty ? (
            <Typography
              variant="body2"
              sx={{ color: 'text.secondary', mt: 0.5, fontStyle: 'italic', opacity: 0.85 }}
            >
              Pridaj prvý záznam a uvidíš pripomienky
            </Typography>
          ) : (
            (lastDate || detail) && (
              <Typography variant="body2" sx={{ color: 'text.secondary', mt: 0.5 }} noWrap>
                {lastDate ? `Posledné ${formatDateShort(lastDate)}` : detail}
                {lastDate && detail ? ` · ${detail}` : ''}
              </Typography>
            )
          )}
        </Box>

        {progress !== null && !isEmpty && !isOverdue && (
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
                  color: meta.tone === 'neutral' ? 'primary.main' : toneColor,
                  fontWeight: 600,
                }}
              >
                {primaryActionLabel ?? (isEmpty ? 'Pridať' : 'Naplánovať')}
              </Button>
            ) : (
              <Box />
            )}
            {onOpen && !isEmpty && <ChevronIcon sx={{ color: 'text.disabled', fontSize: 18 }} />}
          </Stack>
        )}
      </Stack>
    </Card>
  );
}
