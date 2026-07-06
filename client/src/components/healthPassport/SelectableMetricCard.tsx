import { useMemo, useState, type ReactElement } from 'react';
import { useTranslation } from 'react-i18next';
import {
  Box,
  Button,
  Card,
  LinearProgress,
  MenuItem,
  Select,
  Stack,
  Typography,
  alpha,
  useTheme,
} from '@mui/material';

import { relativeDate } from '../../utils/relativeDate';
import { statusByDate } from './utils.ts';
import HelpHint from '../HelpHint';

export interface MetricOption {
  id: string;
  label: string;
  /** Due date the status/headline is derived from (validUntil / nextDueDate). */
  dueDate?: string;
  intervalDays?: number;
}

interface Props {
  icon: ReactElement;
  label: string;
  hint?: string;
  accentColor: string;
  options: MetricOption[];
  soonDays: number;
  emptyText: string;
  onAdd?: () => void;
  onOpen?: (id: string) => void;
}

export default function SelectableMetricCard({
  icon,
  label,
  hint,
  accentColor,
  options,
  soonDays,
  emptyText,
  onAdd,
  onOpen,
}: Props) {
  const theme = useTheme();
  const { t } = useTranslation('healthPassport');

  // Zoradené podľa najbližšieho termínu (bez termínu na koniec) — default je najurgentnejší.
  const sorted = useMemo(
    () =>
      [...options].sort((a, b) => {
        if (!a.dueDate) return 1;
        if (!b.dueDate) return -1;
        return a.dueDate.localeCompare(b.dueDate);
      }),
    [options]
  );

  const [selectedId, setSelectedId] = useState<string | null>(null);
  const selected = sorted.find((o) => o.id === selectedId) ?? sorted[0];
  const isEmpty = !selected;

  const rel = selected?.dueDate ? relativeDate(selected.dueDate) : null;
  const status = selected?.dueDate ? statusByDate(selected.dueDate, soonDays) : 'UNKNOWN';
  const isOverdue = status === 'EXPIRED';
  const overdueDays = isOverdue && rel ? Math.abs(rel.diffDays) : 0;

  let progress: number | null = null;
  if (selected?.dueDate && selected.intervalDays && selected.intervalDays > 0 && rel) {
    const used = selected.intervalDays - rel.diffDays;
    progress = Math.max(0, Math.min(100, (used / selected.intervalDays) * 100));
  }

  const headline = isEmpty
    ? t('status.notSetHeadline')
    : isOverdue
      ? t('status.overdueHeadline', { count: overdueDays })
      : (rel?.text ?? t('status.valid'));
  const headlineColor = isEmpty ? 'text.secondary' : isOverdue ? 'error.main' : 'text.primary';
  const barColor = isOverdue ? theme.palette.error.main : accentColor;

  return (
    <Card
      sx={{
        p: 2,
        height: '100%',
        borderRadius: 2,
        borderStyle: isEmpty ? 'dashed' : 'solid',
        display: 'flex',
        flexDirection: 'column',
        gap: 1.25,
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
            <Typography variant="caption" sx={{ color: 'text.secondary' }} noWrap>
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
        </Box>
      </Stack>

      {isEmpty ? (
        <Typography variant="body2" sx={{ color: 'text.secondary' }}>
          {emptyText}
        </Typography>
      ) : sorted.length > 1 ? (
        <Select
          variant="standard"
          disableUnderline
          value={selected.id}
          onChange={(e) => setSelectedId(e.target.value)}
          sx={{
            fontSize: '0.9rem',
            fontWeight: 600,
            color: accentColor,
            '& .MuiSelect-select': { py: 0, pr: '20px !important' },
            '& .MuiSvgIcon-root': { color: accentColor },
          }}
        >
          {sorted.map((o) => (
            <MenuItem key={o.id} value={o.id} sx={{ fontSize: '0.9rem' }}>
              {o.label}
            </MenuItem>
          ))}
        </Select>
      ) : (
        <Typography variant="body2" sx={{ fontWeight: 600 }} noWrap>
          {selected.label}
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

      <Button
        fullWidth
        variant="outlined"
        onClick={() => (isEmpty ? onAdd?.() : onOpen?.(selected.id))}
        sx={{
          color: accentColor,
          borderColor: alpha(accentColor, 0.35),
          '&:hover': { borderColor: accentColor, bgcolor: alpha(accentColor, 0.06) },
        }}
      >
        {isEmpty ? t('overview.add') : t('overview.viewSchedule')}
      </Button>
    </Card>
  );
}
