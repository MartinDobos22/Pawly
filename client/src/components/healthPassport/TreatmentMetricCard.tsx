import { useMemo, useState } from 'react';
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
import { Healing as TreatmentIcon, Add as AddIcon } from '@mui/icons-material';

import type { TreatmentRecord } from '../../types/petHealth';
import { relativeDate, formatDateShort } from '../../utils/relativeDate';
import { statusByDate } from './utils.ts';
import HelpHint from '../HelpHint';

interface Props {
  treatments: TreatmentRecord[];
  hint?: string;
  accentColor: string;
  onAdd?: () => void;
  onOpen?: (id: string) => void;
}

export default function TreatmentMetricCard({ treatments, hint, accentColor, onAdd, onOpen }: Props) {
  const theme = useTheme();
  const { t } = useTranslation('healthPassport');

  // Zoradené podľa najbližšieho termínu (bez termínu na koniec) — default je najurgentnejšia.
  const sorted = useMemo(
    () =>
      [...treatments].sort((a, b) => {
        if (!a.nextDueDate) return 1;
        if (!b.nextDueDate) return -1;
        return a.nextDueDate.localeCompare(b.nextDueDate);
      }),
    [treatments]
  );

  const [selectedId, setSelectedId] = useState<string | null>(null);
  const selected = sorted.find((x) => x.id === selectedId) ?? sorted[0];

  const isEmpty = !selected;
  const rel = selected?.nextDueDate ? relativeDate(selected.nextDueDate) : null;
  const status = selected?.nextDueDate ? statusByDate(selected.nextDueDate, 7) : 'UNKNOWN';
  const isOverdue = status === 'EXPIRED';
  const overdueDays = isOverdue && rel ? Math.abs(rel.diffDays) : 0;

  let progress: number | null = null;
  if (selected?.nextDueDate && selected.intervalDays && selected.intervalDays > 0 && rel) {
    const used = selected.intervalDays - rel.diffDays;
    progress = Math.max(0, Math.min(100, (used / selected.intervalDays) * 100));
  }

  const headlineColor = isEmpty ? 'text.secondary' : isOverdue ? 'error.main' : 'text.primary';
  const headline = isEmpty
    ? t('status.notSetHeadline')
    : isOverdue
      ? t('status.overdueHeadline', { count: overdueDays })
      : (rel?.text ?? t('status.valid'));
  const barColor = isOverdue ? theme.palette.error.main : accentColor;

  const optionLabel = (trt: TreatmentRecord) =>
    `${t(`treatmentCategories.${trt.category}`)} · ${trt.name}`;

  return (
    <Card
      sx={{
        p: 2,
        height: '100%',
        borderRadius: 2,
        borderStyle: isEmpty ? 'dashed' : 'solid',
        display: 'flex',
        flexDirection: 'column',
        gap: 1.5,
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
          <TreatmentIcon />
        </Box>
        <Box sx={{ minWidth: 0, flex: 1 }}>
          <Stack direction="row" alignItems="center" gap={0.25} sx={{ minWidth: 0 }}>
            <Typography variant="caption" sx={{ color: 'text.secondary' }} noWrap>
              {t('overview.treatment')}
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
          {t('overview.treatmentEmpty')}
        </Typography>
      ) : (
        <>
          <Select
            size="small"
            value={selected.id}
            onChange={(e) => setSelectedId(e.target.value)}
            sx={{ '& .MuiSelect-select': { py: 0.75, fontSize: '0.85rem' } }}
          >
            {sorted.map((trt) => (
              <MenuItem key={trt.id} value={trt.id} sx={{ fontSize: '0.85rem' }}>
                {optionLabel(trt)}
              </MenuItem>
            ))}
          </Select>
          <Typography variant="body2" sx={{ color: 'text.secondary' }} noWrap>
            {t('detail.last', { date: formatDateShort(selected.dateGiven) })}
          </Typography>
        </>
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
        {isEmpty ? t('overview.add') : t('overview.schedule')}
      </Button>

      {!isEmpty && onAdd && (
        <Button
          fullWidth
          variant="text"
          size="small"
          startIcon={<AddIcon sx={{ fontSize: 18 }} />}
          onClick={onAdd}
          sx={{ color: 'text.secondary', mt: -0.5 }}
        >
          {t('overview.treatmentAddMore')}
        </Button>
      )}
    </Card>
  );
}
