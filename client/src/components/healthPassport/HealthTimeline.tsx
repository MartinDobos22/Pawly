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
import { TIMELINE_FILTER_VALUES, TIMELINE_ICON_MAP, TIMELINE_TYPE_META } from './constants.ts';
import { statusColor } from './utils.ts';
import { relativeDate } from '../../utils/relativeDate';

const localeTag = (lang: string) => (lang === 'en' ? 'en-US' : 'sk-SK');

interface HealthTimelineProps {
  timeline: TimelineEvent[];
  onOpenDetail: (event: TimelineEvent) => void;
  onExportPdf: () => void;
}

type SelectableType = TimelineEvent['type'];

const monthKey = (iso: string) => iso.slice(0, 7);

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

  const formatMonth = (key: string) => {
    const d = new Date(`${key}-01T00:00:00`);
    if (Number.isNaN(d.getTime())) return key;
    const label = d.toLocaleDateString(lang, { month: 'long', year: 'numeric' });
    return label.charAt(0).toUpperCase() + label.slice(1);
  };

  const formatDay = (iso: string) => {
    const d = new Date(iso);
    if (Number.isNaN(d.getTime())) return iso;
    return d.toLocaleDateString(lang, { day: 'numeric', month: 'short' });
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

  const months = useMemo(() => {
    const map = new Map<string, TimelineEvent[]>();
    for (const e of visible) {
      const k = monthKey(e.date);
      const list = map.get(k);
      if (list) list.push(e);
      else map.set(k, [e]);
    }
    return Array.from(map.entries());
  }, [visible]);

  const isAllActive = selected.size === 0;
  const hoverShadow = `0 6px 18px ${alpha(
    theme.palette.common.black,
    theme.palette.mode === 'dark' ? 0.4 : 0.12
  )}`;

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
          const type = v as SelectableType;
          const isActive = selected.has(type);
          return (
            <Chip
              key={v}
              label={t(`filter.${v}`)}
              size="small"
              clickable
              variant={isActive ? 'filled' : 'outlined'}
              color={isActive ? TIMELINE_TYPE_META[type].color : 'default'}
              onClick={() => toggleType(type)}
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

      {months.length === 0 ? (
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
        <Stack spacing={3}>
          {months.map(([month, events]) => (
            <Box key={month}>
              <Stack direction="row" alignItems="center" gap={1.5} sx={{ mb: 1.5 }}>
                <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>
                  {formatMonth(month)}
                </Typography>
                <Box sx={{ flex: 1, height: '1px', bgcolor: 'divider' }} />
                <Chip
                  label={events.length}
                  size="small"
                  sx={{
                    height: 20,
                    minWidth: 28,
                    fontWeight: 600,
                    bgcolor: alpha(theme.palette.text.secondary, 0.08),
                    color: 'text.secondary',
                  }}
                />
              </Stack>

              <Stack spacing={1}>
                {events.map((event) => {
                  const cat = TIMELINE_TYPE_META[event.type].color;
                  const catColor = theme.palette[cat].main;
                  const sc = event.status ? statusColor(event.status) : 'default';
                  const pillKey = sc === 'default' ? null : sc;
                  const due = event.dueDate ? relativeDate(event.dueDate) : null;
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
                        pl: 2,
                        pr: 1.5,
                        py: 1.25,
                        borderRadius: 2.5,
                        border: `1px solid ${theme.palette.divider}`,
                        bgcolor: 'background.paper',
                        cursor: 'pointer',
                        overflow: 'hidden',
                        transition:
                          'transform 140ms ease, box-shadow 140ms ease, border-color 140ms ease',
                        '&::before': {
                          content: '""',
                          position: 'absolute',
                          left: 0,
                          top: 0,
                          bottom: 0,
                          width: '3px',
                          bgcolor: catColor,
                        },
                        '&:hover': {
                          transform: 'translateY(-1px)',
                          boxShadow: hoverShadow,
                          borderColor: alpha(catColor, 0.4),
                        },
                        '&:focus-visible': {
                          outline: `2px solid ${catColor}`,
                          outlineOffset: 2,
                        },
                      }}
                    >
                      <Box
                        sx={{
                          width: 38,
                          height: 38,
                          borderRadius: 2,
                          bgcolor: alpha(catColor, 0.14),
                          color: catColor,
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
                          sx={{ display: 'block', lineHeight: 1.4, color: catColor }}
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

                      <Stack
                        sx={{ flexShrink: 0, alignItems: 'flex-end', gap: 0.5, textAlign: 'right' }}
                      >
                        <Typography
                          variant="caption"
                          sx={{ color: 'text.secondary', whiteSpace: 'nowrap' }}
                        >
                          {formatDay(event.date)}
                        </Typography>
                        {pillKey && due && (
                          <Box
                            component="span"
                            sx={{
                              px: 0.75,
                              py: 0.25,
                              borderRadius: 1.5,
                              fontSize: '0.7rem',
                              fontWeight: 600,
                              lineHeight: 1.4,
                              whiteSpace: 'nowrap',
                              bgcolor: alpha(theme.palette[pillKey].main, 0.14),
                              color: theme.palette[pillKey].main,
                            }}
                          >
                            {due.short}
                          </Box>
                        )}
                      </Stack>
                    </Box>
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
