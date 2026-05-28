import { useEffect, useMemo, useState } from 'react';
import {
  Box,
  Chip,
  FormControl,
  IconButton,
  InputAdornment,
  MenuItem,
  Pagination,
  Select,
  Stack,
  TextField,
  Typography,
  useTheme,
} from '@mui/material';
import {
  Clear as ClearIcon,
  Search as SearchIcon,
  TimelineOutlined as TimelineIcon,
} from '@mui/icons-material';

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

const PAGE_SIZE_OPTIONS = [5, 10, 15, 20];

const monthFormatter = new Intl.DateTimeFormat('sk-SK', { month: 'long', year: 'numeric' });
const dayFormatter = new Intl.DateTimeFormat('sk-SK', {
  day: 'numeric',
  month: 'long',
  weekday: 'short',
});

const groupByMonth = (
  events: TimelineEvent[]
): { key: string; label: string; items: TimelineEvent[] }[] => {
  const map = new Map<string, { label: string; items: TimelineEvent[] }>();
  for (const ev of events) {
    const d = new Date(ev.date);
    if (Number.isNaN(d.getTime())) continue;
    const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
    if (!map.has(key)) {
      map.set(key, { label: monthFormatter.format(d), items: [] });
    }
    map.get(key)!.items.push(ev);
  }
  return Array.from(map.entries())
    .sort(([a], [b]) => b.localeCompare(a))
    .map(([key, val]) => ({ key, label: val.label, items: val.items }));
};

interface ClinicalHistoryProps {
  timeline: TimelineEvent[];
}

export default function ClinicalHistory({ timeline }: ClinicalHistoryProps) {
  const theme = useTheme();
  const [filter, setFilter] = useState<Filter>('ALL');
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

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

  const totalPages = Math.max(1, Math.ceil(visible.length / pageSize));

  useEffect(() => {
    if (page > totalPages) setPage(1);
  }, [page, totalPages]);

  useEffect(() => {
    setPage(1);
  }, [filter, search, pageSize]);

  const paged = useMemo(() => {
    const start = (page - 1) * pageSize;
    return visible.slice(start, start + pageSize);
  }, [visible, page, pageSize]);

  const groups = useMemo(() => groupByMonth(paged), [paged]);

  const rangeStart = visible.length === 0 ? 0 : (page - 1) * pageSize + 1;
  const rangeEnd = Math.min(page * pageSize, visible.length);

  return (
    <Box>
      <Stack direction="row" alignItems="center" gap={1} sx={{ mb: 1.5 }}>
        <TimelineIcon sx={{ fontSize: 20, color: 'text.secondary' }} />
        <Box sx={{ flex: 1, minWidth: 0 }}>
          <Typography variant="h3" sx={{ fontSize: '1.05rem', fontWeight: 700 }}>
            Klinická história
          </Typography>
          <Typography
            variant="caption"
            sx={{
              color: 'text.secondary',
              textTransform: 'none',
              letterSpacing: 0,
              fontSize: '0.78rem',
            }}
          >
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
                <IconButton size="small" onClick={() => setSearch('')} aria-label="Vyčistiť">
                  <ClearIcon sx={{ fontSize: 16 }} />
                </IconButton>
              </InputAdornment>
            ) : null,
          }}
          sx={{ width: { xs: 160, sm: 240 } }}
        />
      </Stack>

      <Box
        sx={{
          display: 'flex',
          gap: 0.75,
          mb: 2,
          overflowX: 'auto',
          flexWrap: 'nowrap',
          maskImage:
            'linear-gradient(to right, transparent 0, black 24px, black calc(100% - 24px), transparent 100%)',
          WebkitMaskImage:
            'linear-gradient(to right, transparent 0, black 24px, black calc(100% - 24px), transparent 100%)',
          '&::-webkit-scrollbar': { height: 0 },
          scrollbarWidth: 'none',
          '& > *': { flexShrink: 0 },
        }}
      >
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
        <Box
          sx={{
            textAlign: 'center',
            py: 4,
            color: 'text.secondary',
            border: `1px dashed ${theme.palette.divider}`,
            borderRadius: 2,
          }}
        >
          <Typography variant="body2">
            {clinical.length === 0
              ? 'Zatiaľ žiadne klinické záznamy.'
              : 'Pre zvolený filter sa nenašli žiadne záznamy.'}
          </Typography>
        </Box>
      ) : (
        <>
          <Stack spacing={2}>
            {groups.map((group) => (
              <Box key={group.key}>
                <Typography
                  variant="overline"
                  sx={{
                    display: 'block',
                    color: 'text.secondary',
                    fontSize: '0.7rem',
                    mb: 1,
                  }}
                >
                  {group.label}
                </Typography>
                <Stack spacing={1}>
                  {group.items.map((event) => {
                    const meta = TIMELINE_TYPE_META[event.type];
                    return (
                      <Box
                        key={event.id}
                        sx={{
                          p: 1.25,
                          borderRadius: 2,
                          border: `1px solid ${theme.palette.divider}`,
                          bgcolor: 'background.paper',
                        }}
                      >
                        <Stack direction="row" alignItems="center" gap={1.25} flexWrap="wrap">
                          <Chip
                            icon={TIMELINE_ICON_MAP[event.type]}
                            label={meta.label}
                            size="small"
                            color={meta.color}
                            variant="outlined"
                            sx={{ height: 22, fontSize: '0.7rem' }}
                          />
                          <Typography
                            variant="caption"
                            sx={{
                              color: 'text.secondary',
                              textTransform: 'none',
                              letterSpacing: 0,
                              fontVariantNumeric: 'tabular-nums',
                            }}
                          >
                            {(() => {
                              const d = new Date(event.date);
                              return Number.isNaN(d.getTime())
                                ? event.date
                                : dayFormatter.format(d);
                            })()}
                          </Typography>
                        </Stack>
                        <Typography variant="body2" sx={{ fontWeight: 600, mt: 0.5 }}>
                          {event.title}
                        </Typography>
                        {event.subtitle && (
                          <Typography
                            variant="caption"
                            sx={{
                              display: 'block',
                              color: 'text.secondary',
                              textTransform: 'none',
                              letterSpacing: 0,
                              fontSize: '0.78rem',
                              mt: 0.25,
                            }}
                          >
                            {event.subtitle}
                          </Typography>
                        )}
                      </Box>
                    );
                  })}
                </Stack>
              </Box>
            ))}
          </Stack>

          <Stack
            direction={{ xs: 'column', sm: 'row' }}
            alignItems="center"
            justifyContent="space-between"
            gap={1.5}
            sx={{
              mt: 2,
              pt: 1.5,
              borderTop: `1px solid ${theme.palette.divider}`,
            }}
          >
            <Typography
              variant="caption"
              sx={{
                color: 'text.secondary',
                textTransform: 'none',
                letterSpacing: 0,
                fontSize: '0.78rem',
              }}
            >
              {rangeStart}–{rangeEnd} z {visible.length} záznamov
            </Typography>
            <Stack direction="row" alignItems="center" gap={1.5}>
              <Stack direction="row" alignItems="center" gap={0.75}>
                <Typography
                  variant="caption"
                  sx={{
                    color: 'text.secondary',
                    textTransform: 'none',
                    letterSpacing: 0,
                    fontSize: '0.78rem',
                  }}
                >
                  Na stránku
                </Typography>
                <FormControl size="small">
                  <Select
                    value={pageSize}
                    onChange={(e) => setPageSize(Number(e.target.value))}
                    sx={{ '& .MuiSelect-select': { py: 0.5, fontSize: '0.85rem' } }}
                  >
                    {PAGE_SIZE_OPTIONS.map((opt) => (
                      <MenuItem key={opt} value={opt}>
                        {opt}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Stack>
              <Pagination
                count={totalPages}
                page={page}
                onChange={(_, p) => setPage(p)}
                size="small"
                shape="rounded"
                siblingCount={0}
              />
            </Stack>
          </Stack>
        </>
      )}
    </Box>
  );
}
