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
  Tooltip,
  Typography,
} from '@mui/material';
import {
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
  const [filter, setFilter] = useState<'ALL' | TimelineEvent['type']>('ALL');
  const [search, setSearch] = useState('');

  const visible = useMemo(() => {
    return (filter === 'ALL' ? timeline : timeline.filter((x) => x.type === filter)).filter((x) =>
      `${x.title} ${x.subtitle ?? ''}`.toLowerCase().includes(search.trim().toLowerCase()),
    );
  }, [timeline, filter, search]);

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
          <Typography variant="h6" sx={{ fontWeight: 600 }}>Timeline</Typography>
          <Typography variant="body2" color="text.secondary">
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
            sx={{ width: { xs: '100%', sm: 220 } }}
          />
          <Tooltip title="Exportovať PDF">
            <IconButton onClick={onExportPdf} size="small" sx={{ border: '1px solid', borderColor: 'divider' }}>
              <PdfIcon sx={{ fontSize: 18 }} />
            </IconButton>
          </Tooltip>
        </Stack>
      </Stack>

      {/* Filter chips */}
      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.75, mb: 2 }}>
        {TIMELINE_FILTER_OPTIONS.map((opt) => {
          const isActive = filter === opt.value;
          return (
            <Chip
              key={opt.value}
              label={opt.label}
              size="small"
              clickable
              variant={isActive ? 'filled' : 'outlined'}
              color={isActive ? 'primary' : 'default'}
              onClick={() => setFilter(opt.value)}
            />
          );
        })}
      </Box>

      {/* Table */}
      {visible.length === 0 ? (
        <Alert severity="info">
          Nenašli sa žiadne záznamy pre zvolený filter.
        </Alert>
      ) : (
        <TableContainer sx={{ border: '1px solid', borderColor: 'divider', borderRadius: 1 }}>
          <Table size="small">
            <TableHead>
              <TableRow sx={{ bgcolor: 'action.hover' }}>
                <TableCell sx={{ width: { xs: 110, md: 140 } }}>Dátum</TableCell>
                <TableCell sx={{ width: { xs: 130, md: 160 } }}>Typ</TableCell>
                <TableCell>Detail</TableCell>
                <TableCell align="right" sx={{ width: 56 }} />
              </TableRow>
            </TableHead>
            <TableBody>
              {visible.map((event) => {
                const meta = TIMELINE_TYPE_META[event.type];
                return (
                  <TableRow
                    key={event.id}
                    hover
                    onClick={() => onOpenDetail(event)}
                    sx={{ cursor: 'pointer', '&:last-child td': { border: 0 } }}
                  >
                    <TableCell sx={{ color: 'text.secondary', whiteSpace: 'nowrap', fontVariantNumeric: 'tabular-nums' }}>
                      {formatDate(event.date)}
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
                        <Typography variant="caption" color="text.secondary" sx={{ display: 'block' }}>
                          {event.subtitle}
                        </Typography>
                      )}
                    </TableCell>
                    <TableCell align="right">
                      <OpenIcon sx={{ fontSize: 16, color: 'text.disabled' }} />
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
