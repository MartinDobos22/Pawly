import {
  Box,
  Button,
  Card,
  CardContent,
  Stack,
  Typography,
  alpha,
  useTheme,
} from '@mui/material';
import {
  CalendarToday as CalendarIcon,
  MedicalServices as VetIcon,
  Vaccines as VaccinesIcon,
  Medication as MedIcon,
} from '@mui/icons-material';
import type { VetVisitRecord, DewormingRecord, EctoparasiteRecord, MedicationRecord, MedicationDoseLog } from '../../types/dogHealth';
import { today } from './utils.ts';

interface TaskItem {
  icon: React.ReactElement;
  label: string;
  date?: string;
  accentColor: string;
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
  const theme = useTheme();
  const todayStr = today();

  const tasks: TaskItem[] = [
    ...vetVisits
      .filter((v) => v.nextCheckDate && v.nextCheckDate >= todayStr)
      .sort((a, b) => (a.nextCheckDate ?? '').localeCompare(b.nextCheckDate ?? ''))
      .slice(0, 2)
      .map((v) => ({
        icon: <VetIcon sx={{ fontSize: 16 }} />,
        label: `Kontrola – ${v.clinicName}`,
        date: v.nextCheckDate,
        accentColor: '#3b82f6',
      })),
    ...dewormings.slice(-1).map((v) => ({
      icon: <VaccinesIcon sx={{ fontSize: 16 }} />,
      label: `Odčervenie`,
      date: v.nextDueDate,
      accentColor: '#a855f7',
    })),
    ...ectos.slice(-1).map((v) => ({
      icon: <VaccinesIcon sx={{ fontSize: 16 }} />,
      label: `Antiparazitikum`,
      date: v.nextDueDate,
      accentColor: '#f59e0b',
    })),
  ];

  const todayDoseLogs = doseLogs.filter((log) => log.date === todayStr);

  return (
    <Card
      sx={{
        borderRadius: 3,
        border: '1px solid',
        borderColor: 'divider',
        boxShadow: 'none',
        height: '100%',
      }}
    >
      <CardContent sx={{ p: 2.5 }}>
        <Stack direction="row" alignItems="center" gap={1} sx={{ mb: 2 }}>
          <Box
            sx={{
              width: 32,
              height: 32,
              borderRadius: 2,
              bgcolor: alpha(theme.palette.primary.main, 0.1),
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'primary.main',
            }}
          >
            <CalendarIcon sx={{ fontSize: 16 }} />
          </Box>
          <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>
            Najbližšie úlohy
          </Typography>
        </Stack>

        {tasks.length === 0 && todayDoseLogs.length === 0 ? (
          <Typography variant="body2" color="text.secondary" sx={{ fontStyle: 'italic' }}>
            Žiadne plánované úlohy 🎉
          </Typography>
        ) : (
          <Stack spacing={1}>
            {tasks.map((task, i) => (
              <Box
                key={i}
                sx={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 1.5,
                  p: 1.25,
                  borderRadius: 2,
                  bgcolor: alpha(task.accentColor, 0.06),
                  border: '1px solid',
                  borderColor: alpha(task.accentColor, 0.15),
                }}
              >
                <Box
                  sx={{
                    color: task.accentColor,
                    display: 'flex',
                    alignItems: 'center',
                  }}
                >
                  {task.icon}
                </Box>
                <Box sx={{ flex: 1 }}>
                  <Typography variant="body2" sx={{ fontWeight: 600, fontSize: '0.82rem' }}>
                    {task.label}
                  </Typography>
                  {task.date && (
                    <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                      do {task.date}
                    </Typography>
                  )}
                </Box>
              </Box>
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
                  startIcon={<MedIcon sx={{ fontSize: 15 }} />}
                  sx={{
                    justifyContent: 'flex-start',
                    borderRadius: 2,
                    fontSize: '0.8rem',
                    fontWeight: 600,
                    py: 0.75,
                    textDecoration: log.taken ? 'line-through' : 'none',
                    opacity: log.taken ? 0.7 : 1,
                  }}
                >
                  {log.taken ? '✓ ' : ''}{med?.name ?? 'Liek'} ({med?.frequency ?? ''})
                </Button>
              );
            })}
          </Stack>
        )}
      </CardContent>
    </Card>
  );
}
