import { useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  Box,
  Button,
  Chip,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  IconButton,
  Stack,
  TextField,
  Typography,
  alpha,
  useTheme,
} from '@mui/material';
import {
  Add as AddIcon,
  MonitorWeight as ScaleIcon,
  TrendingUp as UpIcon,
  TrendingDown as DownIcon,
  TrendingFlat as FlatIcon,
  Close as CloseIcon,
} from '@mui/icons-material';
import { Line, LineChart, ResponsiveContainer, Tooltip as RTooltip, XAxis, YAxis } from 'recharts';
import { useHealthData } from '../../hooks/useHealthData';
import { formatDateShort } from '../../utils/relativeDate';
import DateField from '../DateField';
import DashboardTile from './DashboardTile';

interface Props {
  petId: string;
  fallbackWeightKg?: number;
}

const todayIso = () => new Date().toISOString().slice(0, 10);

export default function WeightTrendCard({ petId, fallbackWeightKg }: Props) {
  const { t } = useTranslation('healthPassport');
  const theme = useTheme();
  const { weightLogs: logs, addWeightLog } = useHealthData();
  const [open, setOpen] = useState(false);
  const [draftKg, setDraftKg] = useState<string>(fallbackWeightKg ? String(fallbackWeightKg) : '');
  const [draftDate, setDraftDate] = useState<string>(todayIso());

  const series = useMemo(
    () => logs.filter((l) => l.petId === petId).sort((a, b) => a.date.localeCompare(b.date)),
    [logs, petId]
  );

  const last = series[series.length - 1];
  const first = series[0];

  const trend = useMemo(() => {
    if (series.length < 2) return null;
    const diff = last.kg - first.kg;
    if (Math.abs(diff) < 0.05) return { kg: 0, dir: 'flat' as const };
    return { kg: diff, dir: (diff > 0 ? 'up' : 'down') as 'up' | 'down' };
  }, [series, first, last]);

  const minY = useMemo(() => {
    if (series.length === 0) return 0;
    return Math.floor(Math.min(...series.map((s) => s.kg)) * 0.95);
  }, [series]);

  const maxY = useMemo(() => {
    if (series.length === 0) return 1;
    return Math.ceil(Math.max(...series.map((s) => s.kg)) * 1.05);
  }, [series]);

  const handleSave = async () => {
    const kg = parseFloat(draftKg.replace(',', '.'));
    if (!Number.isFinite(kg) || kg <= 0) return;
    await addWeightLog({ petId, date: draftDate || todayIso(), kg });
    setOpen(false);
    setDraftKg('');
    setDraftDate(todayIso());
  };

  const trendChip = trend && (
    <Chip
      size="small"
      icon={
        trend.dir === 'up' ? (
          <UpIcon sx={{ fontSize: 14 }} />
        ) : trend.dir === 'down' ? (
          <DownIcon sx={{ fontSize: 14 }} />
        ) : (
          <FlatIcon sx={{ fontSize: 14 }} />
        )
      }
      label={
        trend.dir === 'flat'
          ? t('weightCard.stable')
          : `${trend.kg > 0 ? '+' : ''}${trend.kg.toFixed(1)} kg`
      }
      sx={{
        height: 22,
        fontSize: '0.72rem',
        fontWeight: 600,
        bgcolor: alpha(
          trend.dir === 'up'
            ? theme.palette.warning.main
            : trend.dir === 'down'
              ? theme.palette.info.main
              : theme.palette.text.secondary,
          0.14
        ),
        color:
          trend.dir === 'up'
            ? theme.palette.warning.dark
            : trend.dir === 'down'
              ? theme.palette.info.dark
              : 'text.secondary',
        '& .MuiChip-icon': { color: 'inherit', ml: 0.5 },
      }}
    />
  );

  return (
    <>
      <DashboardTile sx={{ p: 2.5 }}>
        <Stack direction="row" alignItems="center" gap={1} sx={{ mb: 1.5 }}>
          <ScaleIcon sx={{ fontSize: 18, color: 'text.secondary' }} />
          <Typography variant="subtitle2" sx={{ fontWeight: 700, flex: 1 }}>
            {t('weightCard.title')}
          </Typography>
          <IconButton
            size="small"
            onClick={() => setOpen(true)}
            aria-label={t('weightCard.addLogAria')}
            sx={{
              border: `1px solid ${theme.palette.divider}`,
              borderRadius: 2,
            }}
          >
            <AddIcon sx={{ fontSize: 16 }} />
          </IconButton>
        </Stack>

        {series.length === 0 ? (
          <Stack alignItems="center" spacing={1} sx={{ py: 2.5, textAlign: 'center' }}>
            <Box
              sx={{
                width: 44,
                height: 44,
                borderRadius: '50%',
                bgcolor: alpha(theme.palette.primary.main, 0.1),
                color: 'primary.main',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <ScaleIcon />
            </Box>
            <Typography variant="body2" sx={{ color: 'text.secondary', maxWidth: 240 }}>
              {t('weightCard.emptyDescription')}
            </Typography>
            <Button size="small" startIcon={<AddIcon />} onClick={() => setOpen(true)}>
              {t('weightCard.addLog')}
            </Button>
          </Stack>
        ) : (
          <>
            <Stack direction="row" alignItems="baseline" gap={1.25} sx={{ mb: 1 }}>
              <Typography sx={{ fontSize: '1.75rem', fontWeight: 700, lineHeight: 1 }}>
                {last.kg.toFixed(1)}
              </Typography>
              <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                kg
              </Typography>
              {trendChip}
            </Stack>
            <Typography variant="caption" sx={{ color: 'text.secondary' }}>
              {t('weightCard.lastEntry', { date: formatDateShort(last.date) })}
              {series.length > 1
                ? ` · ${t('weightCard.seriesCount', { count: series.length })}`
                : ''}
            </Typography>

            {series.length >= 2 && (
              <Box sx={{ height: 96, mt: 1.5, mx: -1 }}>
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={series} margin={{ top: 8, right: 8, bottom: 0, left: 0 }}>
                    <XAxis dataKey="date" hide />
                    <YAxis domain={[minY, maxY]} hide />
                    <RTooltip
                      cursor={{ stroke: theme.palette.divider }}
                      contentStyle={{
                        borderRadius: 8,
                        border: `1px solid ${theme.palette.divider}`,
                        fontSize: 12,
                      }}
                      formatter={(v) => [
                        `${Number(v).toFixed(1)} kg`,
                        t('weightCard.tooltipLabel'),
                      ]}
                      labelFormatter={(v) => formatDateShort(String(v))}
                    />
                    <Line
                      type="monotone"
                      dataKey="kg"
                      stroke={theme.palette.primary.main}
                      strokeWidth={2}
                      dot={{ fill: theme.palette.primary.main, r: 3 }}
                      activeDot={{ r: 5 }}
                      isAnimationActive={false}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </Box>
            )}
          </>
        )}
      </DashboardTile>

      <Dialog open={open} onClose={() => setOpen(false)} maxWidth="xs" fullWidth>
        <DialogTitle sx={{ pr: 6 }}>
          {t('weightCard.dialogTitle')}
          <IconButton
            aria-label={t('weightCard.closeAria')}
            onClick={() => setOpen(false)}
            sx={{ position: 'absolute', right: 8, top: 8 }}
          >
            <CloseIcon />
          </IconButton>
        </DialogTitle>
        <DialogContent>
          <Stack spacing={2} sx={{ mt: 0.5 }}>
            <DateField
              label={t('weightCard.dateLabel')}
              value={draftDate}
              onChange={setDraftDate}
              fullWidth
            />
            <TextField
              label={t('weightCard.weightLabel')}
              type="number"
              value={draftKg}
              onChange={(e) => setDraftKg(e.target.value)}
              inputProps={{ step: '0.1', min: '0' }}
              fullWidth
              autoFocus
            />
          </Stack>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button onClick={() => setOpen(false)}>{t('weightCard.cancel')}</Button>
          <Button variant="contained" onClick={handleSave} disabled={!draftKg.trim()}>
            {t('weightCard.save')}
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
}
