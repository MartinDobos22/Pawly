import { useMemo, useState } from 'react';
import {
  Box,
  Button,
  Chip,
  IconButton,
  InputAdornment,
  Stack,
  TextField,
  Tooltip,
  Typography,
  alpha,
  useTheme,
} from '@mui/material';
import {
  Search as SearchIcon,
  PictureAsPdf as PdfIcon,
  Clear as ClearIcon,
  ChevronRight as ChevronIcon,
  ExpandMore as ExpandMoreIcon,
} from '@mui/icons-material';
import { useTranslation } from 'react-i18next';
import type { TimelineEvent } from '../../types/petHealth';
import {
  TIMELINE_FILTER_VALUES,
  TIMELINE_ICON_MAP,
  TIMELINE_TYPE_META,
  type TimelineTypeColor,
} from './constants.ts';

const localeTag = (lang: string) => (lang === 'en' ? 'en-US' : 'sk-SK');

interface HealthTimelineProps {
  timeline: TimelineEvent[];
  onOpenDetail: (event: TimelineEvent) => void;
  onExportPdf: () => void;
}

type SelectableType = TimelineEvent['type'];

const INITIAL_VISIBLE = 6;

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
  const [expanded, setExpanded] = useState(false);

  const lang = localeTag(i18n.language);

  const colorFor = (c: TimelineTypeColor) => theme.palette[c].main;

  const formatDate = (iso: string) => {
    const date = new Date(iso);
    if (Number.isNaN(date.getTime())) return iso;
    return date.toLocaleDateString(lang, { day: 'numeric', month: 'short', year: 'numeric' });
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

  const visible = useMemo(() => {
    const q = search.trim().toLowerCase();
    return timeline
      .filter((x) => (selected.size === 0 ? true : selected.has(x.type)))
      .filter((x) => (q ? `${x.title} ${x.subtitle ?? ''}`.toLowerCase().includes(q) : true))
      .sort((a, b) => b.date.localeCompare(a.date));
  }, [timeline, selected, search]);

  const shown = expanded ? visible : visible.slice(0, INITIAL_VISIBLE);
  const isAllActive = selected.size === 0;

  return (
    <Box>
      <Box
        sx={{
          mb: 2.5,
          display: 'flex',
          flexWrap: 'wrap',
          alignItems: 'flex-end',
          justifyContent: 'space-between',
          columnGap: 2,
          rowGap: 1.5,
        }}
      >
        <Box sx={{ flex: '1 1 auto', minWidth: 180 }}>
          <Typography variant="h3" sx={{ fontSize: '1.35rem', fontWeight: 700 }}>
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
            sx={{ flex: 1, minWidth: 0, maxWidth: 280 }}
          />
          <Tooltip title={t('timeline.exportPdf')}>
            <IconButton
              onClick={onExportPdf}
              aria-label={t('timeline.exportPdfAriaLabel')}
              sx={{ border: `1px solid ${theme.palette.divider}`, flexShrink: 0 }}
            >
              <PdfIcon sx={{ fontSize: 20 }} />
            </IconButton>
          </Tooltip>
        </Stack>
      </Box>

      <Stack
        direction="row"
        alignItems="center"
        gap={0.75}
        sx={{ mb: 3, flexWrap: 'wrap', rowGap: 0.75 }}
      >
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
      </Stack>

      {shown.length === 0 ? (
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
        <Box sx={{ position: 'relative' }}>
          {/* continuous vertical rail */}
          <Box
            sx={{
              position: 'absolute',
              left: { xs: 70, sm: 80 },
              top: 24,
              bottom: 24,
              width: 2,
              bgcolor: 'divider',
            }}
          />
          <Stack spacing={1.75}>
            {shown.map((event) => {
              const color = colorFor(TIMELINE_TYPE_META[event.type].color);
              const isToday = dayDiffFromToday(event.date) === 0;
              return (
                <Stack key={event.id} direction="row" alignItems="flex-start">
                  {/* date / Today column */}
                  <Box
                    sx={{
                      width: { xs: 56, sm: 64 },
                      flexShrink: 0,
                      display: 'flex',
                      justifyContent: 'flex-end',
                      pt: 2,
                    }}
                  >
                    {isToday ? (
                      <Chip
                        label={t('timeline.today')}
                        size="small"
                        sx={{
                          height: 22,
                          bgcolor: 'success.main',
                          color: 'success.contrastText',
                          fontWeight: 700,
                          fontSize: '0.68rem',
                        }}
                      />
                    ) : (
                      <Typography
                        variant="caption"
                        sx={{
                          color: 'text.secondary',
                          textTransform: 'none',
                          letterSpacing: 0,
                          textAlign: 'right',
                        }}
                      >
                        {formatDate(event.date)}
                      </Typography>
                    )}
                  </Box>

                  {/* dot */}
                  <Box
                    sx={{
                      width: 32,
                      flexShrink: 0,
                      display: 'flex',
                      justifyContent: 'center',
                      pt: 2.5,
                      position: 'relative',
                      zIndex: 1,
                    }}
                  >
                    <Box
                      sx={{
                        width: 14,
                        height: 14,
                        borderRadius: '50%',
                        bgcolor: isToday ? color : 'background.paper',
                        border: isToday ? 'none' : `3px solid ${color}`,
                        boxShadow: `0 0 0 3px ${theme.palette.background.paper}`,
                      }}
                    />
                  </Box>

                  {/* event card */}
                  <Box
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
                      flex: 1,
                      minWidth: 0,
                      display: 'flex',
                      alignItems: 'center',
                      gap: 1.75,
                      p: 1.5,
                      borderRadius: 3,
                      border: `1px solid ${theme.palette.divider}`,
                      bgcolor: 'background.paper',
                      cursor: 'pointer',
                      transition: 'border-color 120ms ease, box-shadow 120ms ease',
                      '@media (prefers-reduced-motion: reduce)': { transition: 'none' },
                      '&:hover': {
                        borderColor: alpha(color, 0.5),
                        boxShadow: theme.shadows[2],
                      },
                      '&:focus-visible': {
                        outline: `2px solid ${color}`,
                        outlineOffset: 2,
                      },
                    }}
                  >
                    <Box
                      sx={{
                        width: 40,
                        height: 40,
                        borderRadius: 2,
                        bgcolor: alpha(color, 0.12),
                        color,
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
                        sx={{ color, display: 'block', lineHeight: 1.4 }}
                      >
                        {t(`timeline.${event.type}`)}
                      </Typography>
                      <Typography
                        variant="body2"
                        sx={{ fontWeight: 700, color: 'text.primary' }}
                        noWrap
                      >
                        {event.title}
                      </Typography>
                      {event.subtitle && (
                        <Typography
                          variant="caption"
                          sx={{ color: 'text.secondary', textTransform: 'none', letterSpacing: 0 }}
                          noWrap
                        >
                          {event.subtitle}
                        </Typography>
                      )}
                    </Box>
                    <ChevronIcon sx={{ color: 'text.disabled', fontSize: 22 }} />
                  </Box>
                </Stack>
              );
            })}
          </Stack>
        </Box>
      )}

      {visible.length > INITIAL_VISIBLE && (
        <Stack alignItems="center" sx={{ mt: 2.5 }}>
          <Button
            variant="outlined"
            endIcon={
              <ExpandMoreIcon
                sx={{ transform: expanded ? 'rotate(180deg)' : 'none', transition: 'transform 120ms ease' }}
              />
            }
            onClick={() => setExpanded((v) => !v)}
          >
            {expanded ? t('timeline.showLess') : t('timeline.viewAllEvents')}
          </Button>
        </Stack>
      )}
    </Box>
  );
}
