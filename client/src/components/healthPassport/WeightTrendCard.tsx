import { useMemo, useState } from 'react';
import {
  Box,
  Button,
  Card,
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
import { useLocalStorage } from '../../hooks/useLocalStorage';
import { formatDateShort } from '../../utils/relativeDate';
import DateField from '../DateField';

export interface WeightLog {
  id: string;
  dogId: string;
  date: string;
  kg: number;
}

interface Props {
  dogId: string;
  fallbackWeightKg?: number;
}

const STORAGE_KEY = 'dog-health-weight-logs';

const todayIso = () => new Date().toISOString().slice(0, 10);

export default function WeightTrendCard({ dogId, fallbackWeightKg }: Props) {
  const theme = useTheme();
  const [logs, setLogs] = useLocalStorage<WeightLog[]>(STORAGE_KEY, []);
  const [open, setOpen] = useState(false);
  const [draftKg, setDraftKg] = useState<string>(fallbackWeightKg ? String(fallbackWeightKg) : '');
  const [draftDate, setDraftDate] = useState<string>(todayIso());

  const series = useMemo(
    () => logs.filter((l) => l.dogId === dogId).sort((a, b) => a.date.localeCompare(b.date)),
    [logs, dogId]
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

  const handleSave = () => {
    const kg = parseFloat(draftKg.replace(',', '.'));
    if (!Number.isFinite(kg) || kg <= 0) return;
    const entry: WeightLog = {
      id: `weight-${Date.now()}`,
      dogId,
      date: draftDate || todayIso(),
      kg,
    };
    setLogs((prev) => [...prev, entry]);
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
        trend.dir === 'flat' ? 'stabilná' : `${trend.kg > 0 ? '+' : ''}${trend.kg.toFixed(1)} kg`
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
      <Card sx={{ p: 2 }}>
        <Stack direction="row" alignItems="center" gap={1} sx={{ mb: 1.5 }}>
          <ScaleIcon sx={{ fontSize: 18, color: 'text.secondary' }} />
          <Typography variant="subtitle2" sx={{ fontWeight: 700, flex: 1 }}>
            Hmotnosť
          </Typography>
          <IconButton
            size="small"
            onClick={() => setOpen(true)}
            aria-label="Pridať váženie"
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
              Pridaj prvé váženie aby si videl trend hmotnosti v čase.
            </Typography>
            <Button size="small" startIcon={<AddIcon />} onClick={() => setOpen(true)}>
              Pridať váženie
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
              Posledné {formatDateShort(last.date)}
              {series.length > 1 ? ` · ${series.length} záznamov` : ''}
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
                      formatter={(v) => [`${Number(v).toFixed(1)} kg`, 'Hmotnosť']}
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
      </Card>

      <Dialog open={open} onClose={() => setOpen(false)} maxWidth="xs" fullWidth>
        <DialogTitle sx={{ pr: 6 }}>
          Pridať váženie
          <IconButton
            aria-label="Zavrieť"
            onClick={() => setOpen(false)}
            sx={{ position: 'absolute', right: 8, top: 8 }}
          >
            <CloseIcon />
          </IconButton>
        </DialogTitle>
        <DialogContent>
          <Stack spacing={2} sx={{ mt: 0.5 }}>
            <DateField label="Dátum" value={draftDate} onChange={setDraftDate} fullWidth />
            <TextField
              label="Hmotnosť (kg)"
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
          <Button onClick={() => setOpen(false)}>Zrušiť</Button>
          <Button variant="contained" onClick={handleSave} disabled={!draftKg.trim()}>
            Uložiť
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
}
