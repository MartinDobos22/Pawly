import { useMemo, useState } from 'react';
import {
  Box,
  Button,
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
  Search as SearchIcon,
  PictureAsPdf as PdfIcon,
  Clear as ClearIcon,
  ChevronRight as ChevronIcon,
  TuneOutlined as TuneIcon,
} from '@mui/icons-material';
import type { TimelineEvent } from '../../types/dogHealth';
import { TIMELINE_FILTER_OPTIONS, TIMELINE_ICON_MAP, TIMELINE_TYPE_META } from './constants.ts';

interface HealthTimelineProps {
  timeline: TimelineEvent[];
  onOpenDetail: (event: TimelineEvent) => void;
  onExportPdf: () => void;
}

type SelectableType = TimelineEvent['type'];

const dayKey = (iso: string) => iso.slice(0, 10);

const formatDayHeader = (iso: string) => {
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return iso;
  return date.toLocaleDateString('sk-SK', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });
};

const weekdayName = (iso: string) => {
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return '';
  return date.toLocaleDateString('sk-SK', { weekday: 'long' });
};

const dayDiffFromToday = (iso: string) => {
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return Number.NaN;
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  date.setHours(0, 0, 0, 0);
  return Math.round((date.getTime() - today.getTime()) / 86_400_000);
};

const dayMeta = (iso: string) => {
  const diff = dayDiffFromToday(iso);
  if (Number.isNaN(diff)) return null;
  if (diff === 0) return { label: 'Dnes', tone: 'today' as const };
  if (diff === -1) return { label: 'Včera', tone: 'recent' as const };
  if (diff > 0 && diff < 14) return { label: `o ${diff} dní`, tone: 'future' as const };
  return null;
};

export default function HealthTimeline({
  timeline,
  onOpenDetail,
  onExportPdf,
}: HealthTimelineProps) {
  const theme = useTheme();
  const [selected, setSelected] = useState<Set<SelectableType>>(new Set());
  const [search, setSearch] = useState('');

  const toggleType = (type: SelectableType | 'ALL') => {
    if (type === 'ALL') {
      setSelected(new Set());
      return;
    }
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(type)) next.delete(type);
      else next.add(type);
      return next;
    });
  };

  const clearFilters = () => setSelected(new Set());

  const visible = useMemo(() => {
    const q = search.trim().toLowerCase();
    return timeline
      .filter((x) => (selected.size === 0 ? true : selected.has(x.type)))
      .filter((x) => (q ? `${x.title} ${x.subtitle ?? ''}`.toLowerCase().includes(q) : true))
      .sort((a, b) => b.date.localeCompare(a.date));
  }, [timeline, selected, search]);

  const groups = useMemo(() => {
    const map = new Map<string, TimelineEvent[]>();
    for (const e of visible) {
      const k = dayKey(e.date);
      const list = map.get(k);
      if (list) list.push(e);
      else map.set(k, [e]);
    }
    return Array.from(map.entries());
  }, [visible]);

  const isAllActive = selected.size === 0;
  const railColor = alpha(theme.palette.primary.main, 0.18);

  return (
    <Box>
      <Stack
        direction={{ xs: 'column', sm: 'row' }}
        alignItems={{ xs: 'flex-start', sm: 'flex-end' }}
        justifyContent="space-between"
        gap={1.5}
        sx={{ mb: 2 }}
      >
        <Box>
          <Typography variant="h3" sx={{ fontSize: '1.25rem', fontWeight: 700 }}>
            Timeline
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Chronologický prehľad zdravotnej histórie
          </Typography>
        </Box>
        <Stack
          direction="row"
          gap={1}
          sx={{ width: { xs: '100%', sm: 'auto' }, alignItems: 'center' }}
        >
          <TextField
            placeholder="Hľadať v zdravotnom zázname…"
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
                    aria-label="Vyčistiť vyhľadávanie"
                    onClick={() => setSearch('')}
                  >
                    <ClearIcon sx={{ fontSize: 16 }} />
                  </IconButton>
                </InputAdornment>
              ) : null,
            }}
            sx={{
              flex: { xs: 1, sm: 'unset' },
              minWidth: { sm: 280 },
            }}
          />
          <Button
            variant="outlined"
            startIcon={<PdfIcon sx={{ fontSize: 18 }} />}
            onClick={onExportPdf}
            aria-label="Exportovať timeline do PDF"
            sx={{ flexShrink: 0 }}
          >
            Export PDF
          </Button>
        </Stack>
      </Stack>

      <Stack
        direction="row"
        alignItems="center"
        gap={0.75}
        sx={{
          mb: 2.5,
          pb: 1.5,
          borderBottom: `1px solid ${theme.palette.divider}`,
          overflowX: 'auto',
          flexWrap: 'nowrap',
          scrollSnapType: 'x proximity',
          maskImage:
            'linear-gradient(to right, transparent 0, black 24px, black calc(100% - 24px), transparent 100%)',
          WebkitMaskImage:
            'linear-gradient(to right, transparent 0, black 24px, black calc(100% - 24px), transparent 100%)',
          '&::-webkit-scrollbar': { height: 0 },
          scrollbarWidth: 'none',
          '& > *': { scrollSnapAlign: 'start', flexShrink: 0 },
        }}
      >
        <TuneIcon sx={{ fontSize: 16, color: 'text.secondary', mr: 0.5 }} />
        <Chip
          label="Všetko"
          size="small"
          clickable
          variant={isAllActive ? 'filled' : 'outlined'}
          color={isAllActive ? 'primary' : 'default'}
          onClick={() => toggleType('ALL')}
        />
        {TIMELINE_FILTER_OPTIONS.filter((o) => o.value !== 'ALL').map((opt) => {
          const isActive = selected.has(opt.value as SelectableType);
          return (
            <Chip
              key={opt.value}
              label={opt.label}
              size="small"
              clickable
              variant={isActive ? 'filled' : 'outlined'}
              color={isActive ? 'primary' : 'default'}
              onClick={() => toggleType(opt.value as SelectableType)}
            />
          );
        })}
        {selected.size > 0 && (
          <Button
            size="small"
            onClick={clearFilters}
            sx={{ ml: 0.5, color: 'text.secondary', minHeight: 28 }}
          >
            Vymazať filtre
          </Button>
        )}
      </Stack>

      {groups.length === 0 ? (
        <Box
          sx={{
            textAlign: 'center',
            py: 6,
            color: 'text.secondary',
            border: `1px dashed ${theme.palette.divider}`,
            borderRadius: 3,
          }}
        >
          <Typography variant="body2">Žiadne záznamy pre zvolený filter.</Typography>
        </Box>
      ) : (
        <Box
          sx={{
            position: 'relative',
            pl: { xs: 3.25, md: 4 },
            '&::before': {
              content: '""',
              position: 'absolute',
              left: { xs: 10, md: 14 },
              top: 8,
              bottom: 8,
              width: 2,
              bgcolor: railColor,
              borderRadius: 2,
            },
          }}
        >
          {groups.map(([day, events]) => {
            const meta = dayMeta(day);
            return (
              <Box key={day} sx={{ position: 'relative', mb: 3 }}>
                <Box
                  sx={{
                    position: 'absolute',
                    left: { xs: -22, md: -27 },
                    top: 2,
                    width: 14,
                    height: 14,
                    borderRadius: '50%',
                    bgcolor: 'background.paper',
                    border: `2px solid ${theme.palette.primary.main}`,
                    boxShadow:
                      meta?.tone === 'today'
                        ? `0 0 0 4px ${alpha(theme.palette.primary.main, 0.18)}`
                        : 'none',
                  }}
                />
                <Stack direction="row" alignItems="baseline" gap={1} sx={{ mb: 1 }}>
                  <Typography variant="subtitle2" sx={{ fontWeight: 700, color: 'text.primary' }}>
                    {formatDayHeader(day)}
                  </Typography>
                  <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                    {weekdayName(day)}
                  </Typography>
                  {meta && (
                    <Chip
                      label={meta.label}
                      size="small"
                      sx={{
                        height: 20,
                        fontSize: '0.7rem',
                        bgcolor:
                          meta.tone === 'today'
                            ? alpha(theme.palette.primary.main, 0.14)
                            : alpha(theme.palette.text.secondary, 0.08),
                        color: meta.tone === 'today' ? 'primary.main' : 'text.secondary',
                        fontWeight: 600,
                      }}
                    />
                  )}
                </Stack>

                <Stack spacing={1}>
                  {events.map((event) => {
                    const typeMeta = TIMELINE_TYPE_META[event.type];
                    return (
                      <Box
                        key={event.id}
                        role="button"
                        tabIndex={0}
                        onClick={() => onOpenDetail(event)}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter' || e.key === ' ') {
                            e.preventDefault();
                            onOpenDetail(event);
                          }
                        }}
                        sx={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: 1.5,
                          p: 1.25,
                          borderRadius: 2.5,
                          border: `1px solid ${theme.palette.divider}`,
                          bgcolor: 'background.paper',
                          cursor: 'pointer',
                          transition:
                            'border-color 120ms ease, transform 120ms ease, box-shadow 120ms ease',
                          '&:hover': {
                            borderColor: alpha(theme.palette.primary.main, 0.4),
                            boxShadow: '0 4px 12px rgba(15,76,92,0.08)',
                          },
                          '&:focus-visible': {
                            outline: `2px solid ${theme.palette.primary.main}`,
                            outlineOffset: 2,
                          },
                        }}
                      >
                        <Box
                          sx={{
                            width: 36,
                            height: 36,
                            borderRadius: 2,
                            bgcolor: alpha(theme.palette.primary.main, 0.08),
                            color: 'primary.main',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            flexShrink: 0,
                          }}
                        >
                          {TIMELINE_ICON_MAP[event.type]}
                        </Box>
                        <Box sx={{ flex: 1, minWidth: 0 }}>
                          <Stack direction="row" alignItems="center" gap={0.75} sx={{ mb: 0.25 }}>
                            <Chip
                              label={typeMeta.label}
                              size="small"
                              variant="outlined"
                              sx={{
                                height: 20,
                                fontSize: '0.68rem',
                                fontWeight: 600,
                                borderColor: alpha(theme.palette.primary.main, 0.25),
                                color: 'primary.main',
                              }}
                            />
                            <Typography
                              variant="body2"
                              sx={{ fontWeight: 600, color: 'text.primary' }}
                              noWrap
                            >
                              {event.title}
                            </Typography>
                          </Stack>
                          {event.subtitle && (
                            <Typography
                              variant="caption"
                              sx={{
                                color: 'text.secondary',
                                letterSpacing: 0,
                                textTransform: 'none',
                              }}
                              noWrap
                            >
                              {event.subtitle}
                            </Typography>
                          )}
                        </Box>
                        <ChevronIcon sx={{ color: 'text.disabled', fontSize: 20 }} />
                      </Box>
                    );
                  })}
                </Stack>
              </Box>
            );
          })}
        </Box>
      )}
    </Box>
  );
}
