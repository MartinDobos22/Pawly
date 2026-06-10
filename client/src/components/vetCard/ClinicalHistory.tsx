import { useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
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

import type { TimelineEvent } from '../../types/petHealth';
import { TIMELINE_ICON_MAP, TIMELINE_TYPE_META } from '../healthPassport/constants';

type ClinicalEventType = Exclude<TimelineEvent['type'], 'EXPENSE'>;
type Filter = 'ALL' | ClinicalEventType;

const FILTER_VALUES: Filter[] = [
  'ALL',
  'VET_VISIT',
  'VACCINATION',
  'DEWORMING',
  'ECTOPARASITE',
  'MEDICATION',
  'DIET',
];

const PAGE_SIZE_OPTIONS = [5, 10, 15, 20];

const groupByMonth = (
  events: TimelineEvent[],
  fmtMonth: (d: Date) => string
): { key: string; label: string; items: TimelineEvent[] }[] => {
  const map = new Map<string, { label: string; items: TimelineEvent[] }>();
  for (const ev of events) {
    const d = new Date(ev.date);
    if (Number.isNaN(d.getTime())) continue;
    const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
    if (!map.has(key)) {
      map.set(key, { label: fmtMonth(d), items: [] });
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
  const { t } = useTranslation('healthPassport');
  const { t: tVc, i18n } = useTranslation('vetCard');
  const lang = i18n.language === 'en' ? 'en-US' : 'sk-SK';
  const monthFmt = useMemo(
    () => new Intl.DateTimeFormat(lang, { month: 'long', year: 'numeric' }),
    [lang]
  );
  const dayFmt = useMemo(
    () => new Intl.DateTimeFormat(lang, { day: 'numeric', month: 'long', weekday: 'short' }),
    [lang]
  );
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

  const groups = useMemo(() => groupByMonth(paged, (d) => monthFmt.format(d)), [paged, monthFmt]);

  const rangeStart = visible.length === 0 ? 0 : (page - 1) * pageSize + 1;
  const rangeEnd = Math.min(page * pageSize, visible.length);

  return (
    <Box>
      <Stack
        direction={{ xs: 'column', sm: 'row' }}
        alignItems={{ xs: 'flex-start', sm: 'center' }}
        gap={1}
        sx={{ mb: 1.5 }}
      >
        <Stack
          direction="row"
          alignItems="center"
          gap={1}
          sx={{ flex: 1, minWidth: 0, width: '100%' }}
        >
          <TimelineIcon sx={{ fontSize: 20, color: 'text.secondary' }} />
          <Box sx={{ flex: 1, minWidth: 0 }}>
            <Typography variant="h3" sx={{ fontSize: '1.05rem', fontWeight: 700 }}>
              {tVc('clinicalHistory.title')}
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
              {tVc('clinicalHistory.subtitle')}
            </Typography>
          </Box>
        </Stack>
        <TextField
          size="small"
          placeholder={tVc('clinicalHistory.searchPlaceholder')}
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
                <IconButton
                  size="small"
                  onClick={() => setSearch('')}
                  aria-label={tVc('clinicalHistory.clearAria')}
                >
                  <ClearIcon sx={{ fontSize: 16 }} />
                </IconButton>
              </InputAdornment>
            ) : null,
          }}
          sx={{ width: { xs: '100%', sm: 240 } }}
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
        {FILTER_VALUES.map((v) => {
          const active = filter === v;
          return (
            <Chip
              key={v}
              label={t(`filter.${v}` as never)}
              size="small"
              clickable
              variant={active ? 'filled' : 'outlined'}
              color={active ? 'primary' : 'default'}
              onClick={() => setFilter(v)}
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
              ? tVc('clinicalHistory.noRecords')
              : tVc('clinicalHistory.noRecordsFilter')}
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
                            label={t(`timeline.${event.type}` as never)}
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
                              return Number.isNaN(d.getTime()) ? event.date : dayFmt.format(d);
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
              {tVc('clinicalHistory.rangeOf', {
                start: rangeStart,
                end: rangeEnd,
                total: visible.length,
              })}
            </Typography>
            <Stack
              direction="row"
              alignItems="center"
              gap={1.5}
              flexWrap="wrap"
              justifyContent="flex-end"
            >
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
                  {tVc('clinicalHistory.perPage')}
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
