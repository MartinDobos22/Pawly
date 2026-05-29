import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { Box, Button, Card, Chip, Stack, Typography, alpha, useTheme } from '@mui/material';
import {
  CalendarToday as CalendarIcon,
  MedicalServices as VetIcon,
  Biotech as DewormIcon,
  Medication as MedIcon,
  PestControl as EctoIcon,
  CheckCircleOutline as DoneIcon,
} from '@mui/icons-material';
import type { ReactElement } from 'react';
import type {
  VetVisitRecord,
  DewormingRecord,
  EctoparasiteRecord,
  MedicationRecord,
  MedicationDoseLog,
} from '../../types/dogHealth';
import { today } from './utils.ts';
import { relativeDate } from '../../utils/relativeDate';

interface TaskItem {
  id: string;
  icon: ReactElement;
  label: string;
  date: string;
  diff: number;
}

interface UpcomingTasksCardProps {
  vetVisits: VetVisitRecord[];
  dewormings: DewormingRecord[];
  ectos: EctoparasiteRecord[];
  medications: MedicationRecord[];
  doseLogs: MedicationDoseLog[];
  onToggleDose: (logId: string) => void;
}

type Bucket = 'overdue' | 'thisWeek' | 'thisMonth' | 'later';

const bucketOf = (diff: number): Bucket => {
  if (diff < 0) return 'overdue';
  if (diff <= 7) return 'thisWeek';
  if (diff <= 31) return 'thisMonth';
  return 'later';
};

const BUCKET_TONE: Record<Bucket, 'error' | 'warning' | 'info' | 'success'> = {
  overdue: 'error',
  thisWeek: 'warning',
  thisMonth: 'info',
  later: 'success',
};

export default function UpcomingTasksCard({
  vetVisits,
  dewormings,
  ectos,
  medications,
  doseLogs,
  onToggleDose,
}: UpcomingTasksCardProps) {
  const { t } = useTranslation('healthPassport');
  const theme = useTheme();
  const todayStr = today();

  const tasks = useMemo<TaskItem[]>(() => {
    const items: TaskItem[] = [];
    vetVisits
      .filter((v) => v.nextCheckDate)
      .forEach((v) => {
        const rel = relativeDate(v.nextCheckDate!);
        if (!rel) return;
        items.push({
          id: `visit-${v.id}`,
          icon: <VetIcon fontSize="small" />,
          label: v.clinicName
            ? t('upcoming.checkupClinic', { clinic: v.clinicName })
            : t('upcoming.checkup'),
          date: v.nextCheckDate!,
          diff: rel.diffDays,
        });
      });
    dewormings
      .slice()
      .sort((a, b) => b.nextDueDate.localeCompare(a.nextDueDate))
      .slice(0, 1)
      .forEach((d) => {
        const rel = relativeDate(d.nextDueDate);
        if (!rel) return;
        items.push({
          id: `dew-${d.id}`,
          icon: <DewormIcon fontSize="small" />,
          label: t('upcoming.deworming', { product: d.productName }),
          date: d.nextDueDate,
          diff: rel.diffDays,
        });
      });
    ectos
      .slice()
      .sort((a, b) => b.nextDueDate.localeCompare(a.nextDueDate))
      .slice(0, 1)
      .forEach((e) => {
        const rel = relativeDate(e.nextDueDate);
        if (!rel) return;
        items.push({
          id: `ecto-${e.id}`,
          icon: <EctoIcon fontSize="small" />,
          label: t('upcoming.antiparasitic', { product: e.productName }),
          date: e.nextDueDate,
          diff: rel.diffDays,
        });
      });
    return items.sort((a, b) => a.diff - b.diff);
  }, [vetVisits, dewormings, ectos, t]);

  const grouped = useMemo(() => {
    const map = new Map<Bucket, TaskItem[]>();
    for (const task of tasks) {
      const b = bucketOf(task.diff);
      const arr = map.get(b);
      if (arr) arr.push(task);
      else map.set(b, [task]);
    }
    return (['overdue', 'thisWeek', 'thisMonth', 'later'] as Bucket[])
      .filter((b) => map.has(b))
      .map((b) => ({ bucket: b, items: map.get(b)! }));
  }, [tasks]);

  const todayDoseLogs = doseLogs.filter((log) => log.date === todayStr);

  const toneColor = (tone: 'error' | 'warning' | 'info' | 'success') => theme.palette[tone].main;

  if (tasks.length === 0 && todayDoseLogs.length === 0) {
    return (
      <Card sx={{ p: 2.5 }}>
        <Stack direction="row" alignItems="center" gap={1} sx={{ mb: 1.5 }}>
          <CalendarIcon sx={{ fontSize: 18, color: 'text.secondary' }} />
          <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>
            {t('upcoming.title')}
          </Typography>
        </Stack>
        <Stack alignItems="center" spacing={1} sx={{ py: 2, color: 'text.secondary' }}>
          <DoneIcon sx={{ fontSize: 36, color: 'success.main' }} />
          <Typography variant="body2">{t('upcoming.allGood')}</Typography>
          <Typography variant="caption" sx={{ textTransform: 'none', letterSpacing: 0 }}>
            {t('upcoming.noTasks')}
          </Typography>
        </Stack>
      </Card>
    );
  }

  return (
    <Card sx={{ p: 2 }}>
      <Stack direction="row" alignItems="center" gap={1} sx={{ mb: 1.75 }}>
        <CalendarIcon sx={{ fontSize: 18, color: 'text.secondary' }} />
        <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>
          {t('upcoming.title')}
        </Typography>
      </Stack>

      <Stack spacing={2}>
        {grouped.map(({ bucket, items }) => {
          const tone = BUCKET_TONE[bucket];
          const c = toneColor(tone);
          return (
            <Box key={bucket}>
              <Typography
                variant="caption"
                sx={{ color: c, display: 'block', mb: 0.75, fontWeight: 700 }}
              >
                {t(`upcoming.${bucket}` as never)} · {items.length}
              </Typography>
              <Stack spacing={0.75}>
                {items.map((task) => {
                  const rel = relativeDate(task.date);
                  return (
                    <Stack
                      key={task.id}
                      direction="row"
                      alignItems="center"
                      gap={1.25}
                      sx={{
                        p: 1.25,
                        borderRadius: 2,
                        bgcolor: alpha(c, theme.palette.mode === 'light' ? 0.05 : 0.12),
                        border: `1px solid ${alpha(c, 0.2)}`,
                      }}
                    >
                      <Box
                        sx={{
                          width: 28,
                          height: 28,
                          borderRadius: 1.5,
                          bgcolor: alpha(c, 0.18),
                          color: c,
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          flexShrink: 0,
                        }}
                      >
                        {task.icon}
                      </Box>
                      <Box sx={{ flex: 1, minWidth: 0 }}>
                        <Typography
                          variant="body2"
                          sx={{ fontWeight: 600, color: 'text.primary' }}
                          noWrap
                        >
                          {task.label}
                        </Typography>
                        <Typography
                          variant="caption"
                          sx={{ color: 'text.secondary', textTransform: 'none', letterSpacing: 0 }}
                        >
                          {rel?.text ?? task.date}
                        </Typography>
                      </Box>
                      {rel && (
                        <Chip
                          size="small"
                          label={rel.short}
                          sx={{
                            height: 22,
                            fontSize: '0.7rem',
                            fontWeight: 700,
                            bgcolor: alpha(c, 0.16),
                            color: c,
                          }}
                        />
                      )}
                    </Stack>
                  );
                })}
              </Stack>
            </Box>
          );
        })}

        {todayDoseLogs.length > 0 && (
          <Box>
            <Typography
              variant="caption"
              sx={{ color: 'text.secondary', display: 'block', mb: 0.75 }}
            >
              {t('upcoming.todayDoses')}
            </Typography>
            <Stack spacing={0.75}>
              {todayDoseLogs.map((log) => {
                const med = medications.find((m) => m.id === log.medicationId);
                return (
                  <Button
                    key={log.id}
                    size="small"
                    variant={log.taken ? 'contained' : 'outlined'}
                    color={log.taken ? 'success' : 'primary'}
                    onClick={() => onToggleDose(log.id)}
                    startIcon={<MedIcon fontSize="small" />}
                    sx={{
                      justifyContent: 'flex-start',
                      textDecoration: log.taken ? 'line-through' : 'none',
                      opacity: log.taken ? 0.7 : 1,
                    }}
                  >
                    {med?.name ?? t('upcoming.medicationFallback')}
                    {med?.frequency ? ` · ${med.frequency}` : ''}
                  </Button>
                );
              })}
            </Stack>
          </Box>
        )}
      </Stack>
    </Card>
  );
}
