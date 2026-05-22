import { useMemo, useState } from 'react';
import {
  Box,
  Chip,
  IconButton,
  InputAdornment,
  Stack,
  TextField,
  Typography,
  alpha,
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

  const groups = useMemo(() => groupByMonth(visible), [visible]);

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
        <Box sx={{ position: 'relative', pl: { xs: 3, md: 3.5 } }}>
          <Box
            sx={{
              position: 'absolute',
              left: { xs: 8, md: 10 },
              top: 8,
              bottom: 8,
              width: 2,
              bgcolor: alpha(theme.palette.primary.main, 0.18),
              borderRadius: 1,
            }}
          />
          {groups.map((group) => (
            <Box key={group.key} sx={{ mb: 2.5, '&:last-child': { mb: 0 } }}>
              <Typography
                variant="caption"
                sx={{
                  display: 'block',
                  mb: 1,
                  ml: -1.5,
                  pl: 1.5,
                  color: 'text.secondary',
                  fontSize: '0.7rem',
                  fontWeight: 700,
                  position: 'relative',
                  '&::before': {
                    content: '""',
                    position: 'absolute',
                    left: -10,
                    top: '50%',
                    width: 10,
                    height: 10,
                    borderRadius: '50%',
                    bgcolor: 'background.paper',
                    border: `2px solid ${theme.palette.primary.main}`,
                    transform: 'translateY(-50%)',
                  },
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
                        position: 'relative',
                        p: 1.25,
                        borderRadius: 2,
                        border: `1px solid ${theme.palette.divider}`,
                        bgcolor: 'background.paper',
                        '&::before': {
                          content: '""',
                          position: 'absolute',
                          left: -18,
                          top: 18,
                          width: 8,
                          height: 8,
                          borderRadius: '50%',
                          bgcolor: theme.palette.primary.main,
                          opacity: 0.7,
                        },
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
                            return Number.isNaN(d.getTime()) ? event.date : dayFormatter.format(d);
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
        </Box>
      )}
    </Box>
  );
}
