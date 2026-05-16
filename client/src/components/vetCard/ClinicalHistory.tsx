import { useMemo, useState } from 'react';
import {
  Alert,
  Box,
  Chip,
  IconButton,
  InputAdornment,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
  Typography,
} from '@mui/material';
import { Clear as ClearIcon, Search as SearchIcon } from '@mui/icons-material';

import type { TimelineEvent } from '../../types/dogHealth';
import { TIMELINE_ICON_MAP, TIMELINE_TYPE_META } from '../healthPassport/constants';

type ClinicalEventType = Exclude<TimelineEvent['type'], 'EXPENSE'>;
type Filter = 'ALL' | ClinicalEventType;

const FILTER_OPTIONS: Array<{ value: Filter; label: string }> = [
  { value: 'ALL', label: 'Všetko' },
  { value: 'VET_VISIT', label: 'Návštevy' },
  { value: 'VACCINATION', label: 'Vakcíny' },
  { value: 'DEWORMING', label: 'Odčervenie' },
  { value: 'ECTOPARASITE', label: 'Ektoparazity' },
  { value: 'MEDICATION', label: 'Lieky' },
  { value: 'DIET', label: 'Diéta' },
];

const formatDateShort = (value: string): string => {
  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) return value;
  return parsed.toLocaleDateString('sk-SK', { day: 'numeric', month: 'short', year: 'numeric' });
};

interface ClinicalHistoryProps {
  timeline: TimelineEvent[];
}

export default function ClinicalHistory({ timeline }: ClinicalHistoryProps) {
  const [filter, setFilter] = useState<Filter>('ALL');
  const [search, setSearch] = useState('');

  const clinical = useMemo(
    () =>
      timeline.filter(
        (e): e is TimelineEvent & { type: ClinicalEventType } => e.type !== 'EXPENSE'
      ),
    [timeline]
  );

  const visible = useMemo(() => {
    const byType = filter === 'ALL' ? clinical : clinical.filter((x) => x.type === filter);
    const q = search.trim().toLowerCase();
    if (!q) return byType;
    return byType.filter((x) => `${x.title} ${x.subtitle ?? ''}`.toLowerCase().includes(q));
  }, [clinical, filter, search]);

  return (
    <Box>
      <Stack
        direction={{ xs: 'column', sm: 'row' }}
        alignItems={{ xs: 'flex-start', sm: 'center' }}
        justifyContent="space-between"
        gap={1.5}
        sx={{ mb: 2 }}
      >
        <Box>
          <Typography variant="h6" sx={{ fontWeight: 600 }}>
            Klinická história
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Vakcíny, návštevy, lieky a preventívne ošetrenia v jednom prehľade.
          </Typography>
        </Box>
        <TextField
          size="small"
          placeholder="Hľadať…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon sx={{ fontSize: 18, color: 'text.secondary' }} />
              </InputAdornment>
            ),
            endAdornment: search ? (
              <InputAdornment position="end">
                <IconButton size="small" onClick={() => setSearch('')}>
                  <ClearIcon sx={{ fontSize: 16 }} />
                </IconButton>
              </InputAdornment>
            ) : null,
          }}
          sx={{ width: { xs: '100%', sm: 240 } }}
        />
      </Stack>

      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.75, mb: 2 }}>
        {FILTER_OPTIONS.map((opt) => {
          const active = filter === opt.value;
          return (
            <Chip
              key={opt.value}
              label={opt.label}
              size="small"
              clickable
              variant={active ? 'filled' : 'outlined'}
              color={active ? 'primary' : 'default'}
              onClick={() => setFilter(opt.value)}
            />
          );
        })}
      </Box>

      {visible.length === 0 ? (
        <Alert severity="info">
          {clinical.length === 0
            ? 'Zatiaľ žiadne klinické záznamy.'
            : 'Pre zvolený filter sa nenašli žiadne záznamy.'}
        </Alert>
      ) : (
        <TableContainer sx={{ border: '1px solid', borderColor: 'divider', borderRadius: 1 }}>
          <Table size="small">
            <TableHead>
              <TableRow sx={{ bgcolor: 'action.hover' }}>
                <TableCell sx={{ width: { xs: 110, md: 140 } }}>Dátum</TableCell>
                <TableCell sx={{ width: { xs: 130, md: 160 } }}>Typ</TableCell>
                <TableCell>Detail</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {visible.map((event) => {
                const meta = TIMELINE_TYPE_META[event.type];
                return (
                  <TableRow key={event.id} hover sx={{ '&:last-child td': { border: 0 } }}>
                    <TableCell
                      sx={{
                        color: 'text.secondary',
                        whiteSpace: 'nowrap',
                        fontVariantNumeric: 'tabular-nums',
                      }}
                    >
                      {formatDateShort(event.date)}
                    </TableCell>
                    <TableCell>
                      <Chip
                        icon={TIMELINE_ICON_MAP[event.type]}
                        label={meta.label}
                        size="small"
                        color={meta.color}
                        variant="outlined"
                      />
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2" sx={{ fontWeight: 500 }}>
                        {event.title}
                      </Typography>
                      {event.subtitle && (
                        <Typography
                          variant="caption"
                          color="text.secondary"
                          sx={{ display: 'block' }}
                        >
                          {event.subtitle}
                        </Typography>
                      )}
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </TableContainer>
      )}
    </Box>
  );
}
