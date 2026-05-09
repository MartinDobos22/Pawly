import { Box, Card, Chip, Stack, Typography } from '@mui/material';
import {
  Vaccines as VaccinesIcon,
  Biotech as DewormIcon,
  PestControl as EctoIcon,
  Restaurant as DietIcon,
  CheckCircle as CheckIcon,
  Warning as WarningIcon,
  Cancel as ExpiredIcon,
} from '@mui/icons-material';
import type { ValidityStatus, DietEntry } from '../../types/dogHealth';
import { statusColor, statusLabel } from './utils.ts';

interface StatusCardProps {
  icon: React.ReactElement;
  title: string;
  status: ValidityStatus;
  detail?: string;
}

function StatusCard({ icon, title, status, detail }: StatusCardProps) {
  const color = statusColor(status);

  const StatusIcon =
    status === 'VALID' ? CheckIcon :
    status === 'EXPIRING_SOON' ? WarningIcon :
    ExpiredIcon;

  return (
    <Card sx={{ p: 2 }}>
      <Stack direction="row" alignItems="center" gap={1.25} sx={{ mb: 1.25 }}>
        <Box
          sx={{
            width: 32,
            height: 32,
            borderRadius: 1,
            bgcolor: 'action.hover',
            color: 'text.secondary',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            '& svg': { fontSize: 18 },
          }}
        >
          {icon}
        </Box>
        <Typography
          variant="overline"
          sx={{ color: 'text.secondary', lineHeight: 1.2 }}
        >
          {title}
        </Typography>
      </Stack>

      <Chip
        icon={<StatusIcon />}
        label={statusLabel(status)}
        size="small"
        color={color}
        variant="outlined"
      />

      {detail && (
        <Typography variant="caption" sx={{ display: 'block', color: 'text.secondary', mt: 1 }}>
          {detail}
        </Typography>
      )}
    </Card>
  );
}

interface HealthStatusOverviewProps {
  vaccinationStatus: ValidityStatus;
  dewormingStatus: ValidityStatus;
  ectoStatus: ValidityStatus;
  currentDiet?: DietEntry;
}

export default function HealthStatusOverview({
  vaccinationStatus,
  dewormingStatus,
  ectoStatus,
  currentDiet,
}: HealthStatusOverviewProps) {
  return (
    <Box
      sx={{
        display: 'grid',
        gridTemplateColumns: { xs: '1fr 1fr', md: 'repeat(4, 1fr)' },
        gap: 1.5,
        mb: 2,
      }}
    >
      <StatusCard icon={<VaccinesIcon />} title="Očkovanie" status={vaccinationStatus} />
      <StatusCard icon={<DewormIcon />} title="Odčervenie" status={dewormingStatus} />
      <StatusCard icon={<EctoIcon />} title="Kliešte / blchy" status={ectoStatus} />
      <StatusCard
        icon={<DietIcon />}
        title="Aktuálna diéta"
        status="VALID"
        detail={currentDiet ? currentDiet.foodName : 'Nie je nastavená'}
      />
    </Box>
  );
}
