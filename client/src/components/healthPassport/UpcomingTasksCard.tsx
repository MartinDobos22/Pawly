import {
  Box,
  Button,
  Card,
  Stack,
  Typography,
} from '@mui/material';
import {
  CalendarToday as CalendarIcon,
  MedicalServices as VetIcon,
  Vaccines as VaccinesIcon,
  Medication as MedIcon,
  PestControl as EctoIcon,
} from '@mui/icons-material';
import type {
  VetVisitRecord,
  DewormingRecord,
  EctoparasiteRecord,
  MedicationRecord,
  MedicationDoseLog,
} from '../../types/dogHealth';
import { formatDate, today } from './utils.ts';

interface TaskItem {
  icon: React.ReactElement;
  label: string;
  date?: string;
}

interface UpcomingTasksCardProps {
  vetVisits: VetVisitRecord[];
  dewormings: DewormingRecord[];
  ectos: EctoparasiteRecord[];
  medications: MedicationRecord[];
  doseLogs: MedicationDoseLog[];
  onToggleDose: (logId: string) => void;
}

export default function UpcomingTasksCard({
  vetVisits,
  dewormings,
  ectos,
  medications,
  doseLogs,
  onToggleDose,
}: UpcomingTasksCardProps) {
  const todayStr = today();

  const tasks: TaskItem[] = [
    ...vetVisits
      .filter((v) => v.nextCheckDate && v.nextCheckDate >= todayStr)
      .sort((a, b) => (a.nextCheckDate ?? '').localeCompare(b.nextCheckDate ?? ''))
      .slice(0, 2)
      .map((v) => ({
        icon: <VetIcon fontSize="small" />,
        label: `Kontrola – ${v.clinicName}`,
        date: v.nextCheckDate,
      })),
    ...dewormings.slice(-1).map((v) => ({
      icon: <VaccinesIcon fontSize="small" />,
      label: 'Odčervenie',
      date: v.nextDueDate,
    })),
    ...ectos.slice(-1).map((v) => ({
      icon: <EctoIcon fontSize="small" />,
      label: 'Antiparazitikum',
      date: v.nextDueDate,
    })),
  ];

  const todayDoseLogs = doseLogs.filter((log) => log.date === todayStr);

  return (
    <Card sx={{ p: 2, height: '100%' }}>
      <Stack direction="row" alignItems="center" gap={1} sx={{ mb: 1.5 }}>
        <CalendarIcon sx={{ fontSize: 18, color: 'text.secondary' }} />
        <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
          Najbližšie úlohy
        </Typography>
      </Stack>

      {tasks.length === 0 && todayDoseLogs.length === 0 ? (
        <Typography variant="body2" color="text.secondary">
          Žiadne plánované úlohy.
        </Typography>
      ) : (
        <Stack spacing={1}>
          {tasks.map((task, i) => (
            <Stack
              key={i}
              direction="row"
              alignItems="center"
              gap={1.25}
              sx={{
                p: 1.25,
                borderRadius: 1,
                border: '1px solid',
                borderColor: 'divider',
              }}
            >
              <Box sx={{ color: 'text.secondary', display: 'flex' }}>{task.icon}</Box>
              <Box sx={{ flex: 1 }}>
                <Typography variant="body2" sx={{ fontWeight: 500 }}>
                  {task.label}
                </Typography>
                {task.date && (
                  <Typography variant="caption" color="text.secondary">
                    do {formatDate(task.date)}
                  </Typography>
                )}
              </Box>
            </Stack>
          ))}

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
                  opacity: log.taken ? 0.75 : 1,
                }}
              >
                {med?.name ?? 'Liek'} ({med?.frequency ?? ''})
              </Button>
            );
          })}
        </Stack>
      )}
    </Card>
  );
}
