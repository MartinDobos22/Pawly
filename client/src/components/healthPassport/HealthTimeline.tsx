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
  TuneOutlined as TuneIcon,
} from '@mui/icons-material';
import { useTranslation } from 'react-i18next';
import type { TimelineEvent } from '../../types/petHealth';
import { TIMELINE_FILTER_VALUES, TIMELINE_ICON_MAP } from './constants.ts';

const localeTag = (lang: string) => (lang === 'en' ? 'en-US' : 'sk-SK');

interface HealthTimelineProps {
  timeline: TimelineEvent[];
  onOpenDetail: (event: TimelineEvent) => void;
  onExportPdf: () => void;
}

type SelectableType = TimelineEvent['type'];

const dayKey = (iso: string) => iso.slice(0, 10);

const dayDiffFromToday = (iso: string) => {
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return Number.NaN;
  const now = new Date();
  now.setHours(0, 0, 0, 0);
  date.setHours(0, 0, 0, 0);
  return Math.round((date.getTime() - now.getTime()) / 86_400_000);
};

export default function HealthTimeline({
  timeline,
  onOpenDetail,
  onExportPdf,
}: HealthTimelineProps) {
  const theme = useTheme();
  const { t, i18n } = useTranslation('healthPassport');
  const [selected, setSelected] = useState<Set<SelectableType>>(new Set());
  const [search, setSearch] = useState('');

  const lang = localeTag(i18n.language);

  const formatDayHeader = (iso: string) => {
    const date = new Date(iso);
    if (Number.isNaN(date.getTime())) return iso;
    return date.toLocaleDateString(lang, { day: 'numeric', month: 'long', year: 'numeric' });
  };

  const weekdayName = (iso: string) => {
    const date = new Date(iso);
    if (Number.isNaN(date.getTime())) return '';
    return date.toLocaleDateString(lang, { weekday: 'long' });
  };

  const dayMeta = (iso: string) => {
    const diff = dayDiffFromToday(iso);
    if (Number.isNaN(diff)) return null;
    if (diff === 0) return { label: t('timeline.today'), tone: 'today' as const };
    if (diff === -1) return { label: t('timeline.yesterday'), tone: 'recent' as const };
    if (diff > 0 && diff < 14)
      return { label: t('timeline.inDays', { count: diff }), tone: 'future' as const };
    return null;
  };

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
  const railColor = alpha(theme.palette.primary.main, 0.12);

  return (
    <Box>
      <Box
        sx={{
          mb: 2,
          display: 'flex',
          flexWrap: 'wrap',
          alignItems: 'flex-end',
          justifyContent: 'space-between',
          columnGap: 2,
          rowGap: 1.5,
        }}
      >
        <Box sx={{ flex: '1 1 auto', minWidth: 180 }}>
          <Typography variant="h3" sx={{ fontSize: '1.25rem', fontWeight: 700 }}>
            {t('timeline.title')}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            {t('timeline.chronologicalOverview')}
          </Typography>
        </Box>
        <Stack
          direction="row"
          gap={1}
          sx={{ flex: '1 1 320px', minWidth: 0, alignItems: 'center', justifyContent: 'flex-end' }}
        >
          <TextField
            placeholder={t('timeline.searchPlaceholder')}
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
                    aria-label={t('timeline.clearSearch')}
                    onClick={() => setSearch('')}
                  >
                    <ClearIcon sx={{ fontSize: 16 }} />
                  </IconButton>
                </InputAdornment>
              ) : null,
            }}
            sx={{ flex: 1, minWidth: 0 }}
          />
          <Button
            variant="outlined"
            startIcon={<PdfIcon sx={{ fontSize: 18 }} />}
            onClick={onExportPdf}
            aria-label={t('timeline.exportPdfAriaLabel')}
            sx={{ flexShrink: 0 }}
          >
            {t('timeline.exportPdf')}
          </Button>
        </Stack>
      </Box>

      <Stack
        direction="row"
        alignItems="center"
        gap={0.75}
        sx={{
          mb: 2.5,
          pb: 1.5,
          borderBottom: `1px solid ${theme.palette.divider}`,
          flexWrap: 'wrap',
          rowGap: 0.75,
        }}
      >
        <TuneIcon sx={{ fontSize: 16, color: 'text.secondary', mr: 0.5 }} />
        <Chip
          label={t('filter.ALL')}
          size="small"
          clickable
          variant={isAllActive ? 'filled' : 'outlined'}
          color={isAllActive ? 'primary' : 'default'}
          onClick={() => toggleType('ALL')}
        />
        {TIMELINE_FILTER_VALUES.filter((v) => v !== 'ALL').map((v) => {
          const isActive = selected.has(v as SelectableType);
          return (
            <Chip
              key={v}
              label={t(`filter.${v}`)}
              size="small"
              clickable
              variant={isActive ? 'filled' : 'outlined'}
              color={isActive ? 'primary' : 'default'}
              onClick={() => toggleType(v as SelectableType)}
            />
          );
        })}
        {selected.size > 0 && (
          <Button
            size="small"
            onClick={clearFilters}
            sx={{ ml: 0.5, color: 'text.secondary', minHeight: 28 }}
          >
            {t('timeline.clearFilters')}
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
          <Typography variant="body2">{t('timeline.noRecords')}</Typography>
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
              top: 0,
              bottom: 0,
              width: '1px',
              background: `linear-gradient(to bottom, transparent 0, ${railColor} 32px, ${railColor} calc(100% - 32px), transparent 100%)`,
            },
          }}
        >
          {groups.map(([day, events]) => {
            const meta = dayMeta(day);
            return (
              <Box key={day} sx={{ position: 'relative', mb: { xs: 3.5, md: 4 } }}>
                <Stack
                  direction="row"
                  alignItems="baseline"
                  gap={1}
                  flexWrap="wrap"
                  rowGap={0.25}
                  sx={{ mb: 1.5 }}
                >
                  <Typography variant="subtitle2" sx={{ fontWeight: 600, color: 'text.secondary' }}>
                    {formatDayHeader(day)}
                  </Typography>
                  <Typography variant="caption" sx={{ color: 'text.disabled' }}>
                    {weekdayName(day)}
                  </Typography>
                  {meta && (
                    <Typography
                      variant="caption"
                      sx={{
                        fontWeight: 600,
                        color: meta.tone === 'today' ? 'primary.main' : 'text.secondary',
                      }}
                    >
                      {meta.label}
                    </Typography>
                  )}
                </Stack>

                <Stack spacing={0.5}>
                  {events.map((event) => {
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
                          position: 'relative',
                          display: 'flex',
                          alignItems: 'center',
                          gap: 1.5,
                          px: 1.25,
                          py: 1,
                          borderRadius: 2,
                          cursor: 'pointer',
                          transition: 'background-color 140ms ease',
                          '&:hover': {
                            bgcolor: alpha(theme.palette.primary.main, 0.04),
                          },
                          '&:hover .timelineNode, &:focus-visible .timelineNode': {
                            bgcolor: theme.palette.primary.main,
                            borderColor: theme.palette.primary.main,
                          },
                          '&:focus-visible': {
                            outline: `2px solid ${theme.palette.primary.main}`,
                            outlineOffset: 2,
                          },
                        }}
                      >
                        <Box
                          className="timelineNode"
                          sx={{
                            position: 'absolute',
                            left: { xs: -19, md: -22 },
                            top: '50%',
                            transform: 'translateY(-50%)',
                            width: 8,
                            height: 8,
                            borderRadius: '50%',
                            bgcolor: 'background.paper',
                            border: `2px solid ${alpha(theme.palette.primary.main, 0.45)}`,
                            transition: 'background-color 140ms ease, border-color 140ms ease',
                          }}
                        />
                        <Box
                          sx={{
                            color: 'text.secondary',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            flexShrink: 0,
                          }}
                        >
                          {TIMELINE_ICON_MAP[event.type]}
                        </Box>
                        <Box sx={{ flex: 1, minWidth: 0 }}>
                          <Typography
                            variant="overline"
                            sx={{ display: 'block', lineHeight: 1.4, color: 'text.secondary' }}
                          >
                            {t(`timeline.${event.type}`)}
                          </Typography>
                          <Typography
                            variant="body2"
                            sx={{ fontWeight: 600, color: 'text.primary' }}
                            noWrap
                          >
                            {event.title}
                          </Typography>
                          {event.subtitle && (
                            <Typography
                              variant="caption"
                              sx={{
                                display: 'block',
                                color: 'text.secondary',
                                textTransform: 'none',
                              }}
                              noWrap
                            >
                              {event.subtitle}
                            </Typography>
                          )}
                        </Box>
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
