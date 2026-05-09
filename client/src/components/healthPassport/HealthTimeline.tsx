import {
  Alert,
  Box,
  Card,
  CardContent,
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
  CalendarMonth as CalendarIcon,
  Search as SearchIcon,
  PictureAsPdf as PdfIcon,
  OpenInNew as OpenIcon,
  Clear as ClearIcon,
} from '@mui/icons-material';
import { useMemo, useState } from 'react';
import type { TimelineEvent } from '../../types/dogHealth';
import {
  TIMELINE_FILTER_OPTIONS,
  TIMELINE_ICON_MAP,
  TIMELINE_TYPE_META,
} from './constants.ts';
import { formatDate } from './utils.ts';

interface HealthTimelineProps {
  timeline: TimelineEvent[];
  onOpenDetail: (event: TimelineEvent) => void;
  onExportPdf: () => void;
}

export default function HealthTimeline({ timeline, onOpenDetail, onExportPdf }: HealthTimelineProps) {
  const theme = useTheme();
  const [filter, setFilter] = useState<'ALL' | TimelineEvent['type']>('ALL');
  const [search, setSearch] = useState('');

  const visible = useMemo(() => {
    return (filter === 'ALL' ? timeline : timeline.filter((x) => x.type === filter)).filter((x) =>
      `${x.title} ${x.subtitle ?? ''}`.toLowerCase().includes(search.trim().toLowerCase()),
    );
  }, [timeline, filter, search]);

  const grouped = useMemo(() => {
    return visible.reduce<Record<string, TimelineEvent[]>>((acc, event) => {
      if (!acc[event.date]) acc[event.date] = [];
      acc[event.date].push(event);
      return acc;
    }, {});
  }, [visible]);

  return (
    <Box>
      {/* Header row */}
      <Stack
        direction={{ xs: 'column', sm: 'row' }}
        alignItems={{ xs: 'flex-start', sm: 'center' }}
        justifyContent="space-between"
        gap={1.5}
        sx={{ mb: 2 }}
      >
        <Box>
          <Typography variant="h6" sx={{ fontWeight: 700 }}>Timeline</Typography>
          <Typography variant="body2" color="text.secondary" sx={{ fontSize: '0.8rem' }}>
            Chronologický prehľad zdravotnej histórie
          </Typography>
        </Box>
        <Stack direction="row" gap={1}>
          <TextField
            size="small"
            placeholder="Hľadať…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            InputProps={{
              startAdornment: <InputAdornment position="start"><SearchIcon sx={{ fontSize: 16, color: 'text.secondary' }} /></InputAdornment>,
              endAdornment: search ? (
                <InputAdornment position="end">
                  <IconButton size="small" onClick={() => setSearch('')}><ClearIcon sx={{ fontSize: 14 }} /></IconButton>
                </InputAdornment>
              ) : null,
            }}
            sx={{
              width: { xs: '100%', sm: 220 },
              '& .MuiOutlinedInput-root': { borderRadius: 2.5 },
            }}
          />
          <IconButton
            onClick={onExportPdf}
            size="small"
            sx={{
              borderRadius: 2,
              border: '1px solid',
              borderColor: 'divider',
              px: 1.5,
              gap: 0.5,
              fontSize: '0.8rem',
              fontWeight: 600,
              color: 'text.secondary',
              '&:hover': { bgcolor: alpha(theme.palette.primary.main, 0.08), borderColor: 'primary.main', color: 'primary.main' },
            }}
          >
            <PdfIcon sx={{ fontSize: 16 }} />
          </IconButton>
        </Stack>
      </Stack>

      {/* Filter chips - M3 style */}
      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.75, mb: 2.5 }}>
        {TIMELINE_FILTER_OPTIONS.map((opt) => {
          const isActive = filter === opt.value;
          const meta = opt.value !== 'ALL' ? TIMELINE_TYPE_META[opt.value] : null;
          return (
            <Chip
              key={opt.value}
              label={opt.label}
              size="small"
              onClick={() => setFilter(opt.value)}
              sx={{
                borderRadius: 2,
                fontWeight: isActive ? 700 : 500,
                fontSize: '0.78rem',
                height: 28,
                cursor: 'pointer',
                transition: 'all 0.15s',
                bgcolor: isActive
                  ? (meta ? alpha(meta.hex, 0.15) : alpha(theme.palette.primary.main, 0.12))
                  : alpha(theme.palette.action.selected, 0.5),
                color: isActive
                  ? (meta ? meta.hex : theme.palette.primary.main)
                  : 'text.secondary',
                border: isActive
                  ? `1px solid ${alpha(meta?.hex ?? theme.palette.primary.main, 0.3)}`
                  : '1px solid transparent',
                '&:hover': {
                  bgcolor: alpha(meta?.hex ?? theme.palette.primary.main, 0.1),
                },
              }}
            />
          );
        })}
      </Box>

      {/* Timeline content */}
      {visible.length === 0 ? (
        <Alert severity="info" sx={{ borderRadius: 2.5 }}>
          Nenašli sa žiadne záznamy pre zvolený filter.
        </Alert>
      ) : (
        <Stack spacing={3}>
          {Object.entries(grouped).map(([date, events]) => (
            <Box key={date}>
              {/* Date group header */}
              <Stack direction="row" alignItems="center" gap={1} sx={{ mb: 1.5 }}>
                <CalendarIcon sx={{ fontSize: 14, color: 'text.secondary' }} />
                <Typography
                  variant="caption"
                  sx={{
                    fontWeight: 700,
                    fontSize: '0.75rem',
                    textTransform: 'uppercase',
                    letterSpacing: '0.08em',
                    color: 'text.secondary',
                  }}
                >
                  {formatDate(date)}
                </Typography>
                <Box sx={{ flex: 1, height: 1, bgcolor: 'divider' }} />
                <Chip
                  label={events.length}
                  size="small"
                  sx={{
                    height: 18,
                    fontSize: '0.7rem',
                    fontWeight: 700,
                    bgcolor: alpha(theme.palette.action.selected, 0.8),
                    color: 'text.secondary',
                    '& .MuiChip-label': { px: 0.75 },
                  }}
                />
              </Stack>

              {/* Events for this date */}
              <Stack spacing={1}>
                {events.map((event) => {
                  const meta = TIMELINE_TYPE_META[event.type];
                  return (
                    <Card
                      key={event.id}
                      variant="outlined"
                      sx={{
                        borderRadius: 2.5,
                        border: '1px solid',
                        borderColor: alpha(meta.hex, 0.2),
                        bgcolor: alpha(meta.hex, 0.03),
                        cursor: 'pointer',
                        transition: 'all 0.15s ease',
                        '&:hover': {
                          borderColor: alpha(meta.hex, 0.5),
                          bgcolor: alpha(meta.hex, 0.07),
                          transform: 'translateX(2px)',
                          boxShadow: `0 2px 12px ${alpha(meta.hex, 0.15)}`,
                        },
                      }}
                      onClick={() => onOpenDetail(event)}
                    >
                      <CardContent sx={{ p: '12px 14px !important' }}>
                        <Stack direction="row" alignItems="flex-start" gap={1.5}>
                          {/* Colored icon */}
                          <Box
                            sx={{
                              width: 32,
                              height: 32,
                              borderRadius: 1.5,
                              bgcolor: alpha(meta.hex, 0.12),
                              color: meta.hex,
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              flexShrink: 0,
                              mt: 0.1,
                            }}
                          >
                            {TIMELINE_ICON_MAP[event.type]}
                          </Box>

                          {/* Content */}
                          <Box sx={{ flex: 1, minWidth: 0 }}>
                            <Typography
                              variant="body2"
                              sx={{ fontWeight: 600, fontSize: '0.85rem', lineHeight: 1.3 }}
                              noWrap
                            >
                              {event.title}
                            </Typography>
                            {event.subtitle && (
                              <Typography
                                variant="caption"
                                sx={{ color: 'text.secondary', fontSize: '0.75rem', display: 'block', mt: 0.25 }}
                                noWrap
                              >
                                {event.subtitle}
                              </Typography>
                            )}
                          </Box>

                          {/* Right side: type chip + open icon */}
                          <Stack direction="row" alignItems="center" gap={0.75} sx={{ flexShrink: 0 }}>
                            <Chip
                              label={meta.label}
                              size="small"
                              sx={{
                                fontSize: '0.68rem',
                                fontWeight: 700,
                                height: 20,
                                bgcolor: alpha(meta.hex, 0.12),
                                color: meta.hex,
                                border: 'none',
                                '& .MuiChip-label': { px: 0.75 },
                              }}
                            />
                            <OpenIcon sx={{ fontSize: 14, color: 'text.disabled' }} />
                          </Stack>
                        </Stack>
                      </CardContent>
                    </Card>
                  );
                })}
              </Stack>
            </Box>
          ))}
        </Stack>
      )}
    </Box>
  );
}
