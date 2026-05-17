import { Box, Card, Chip, Divider, Stack, Typography } from '@mui/material';
import {
  Vaccines as VaccinesIcon,
  Biotech as DewormIcon,
  PestControl as EctoIcon,
  Restaurant as DietIcon,
  CheckCircle as CheckIcon,
  Warning as WarningIcon,
  Cancel as ExpiredIcon,
  HelpOutline as UnknownIcon,
} from '@mui/icons-material';
import type { ValidityStatus, DietEntry } from '../../types/dogHealth';
import { statusColor, statusLabel } from './utils.ts';

interface StatusItemProps {
  icon: React.ReactElement;
  title: string;
  status: ValidityStatus;
  detail?: string;
}

function StatusItem({ icon, title, status, detail }: StatusItemProps) {
  const color = statusColor(status);
  const StatusIcon =
    status === 'VALID'
      ? CheckIcon
      : status === 'EXPIRING_SOON'
        ? WarningIcon
        : status === 'UNKNOWN'
          ? UnknownIcon
          : ExpiredIcon;

  return (
    <Stack direction="row" alignItems="center" gap={1.25} sx={{ minWidth: 0, flex: 1 }}>
      <Box
        sx={{
          width: 36,
          height: 36,
          borderRadius: 1,
          bgcolor: 'action.hover',
          color: 'text.secondary',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          flexShrink: 0,
          '& svg': { fontSize: 20 },
        }}
      >
        {icon}
      </Box>
      <Box sx={{ minWidth: 0, flex: 1 }}>
        <Typography
          variant="overline"
          sx={{ display: 'block', color: 'text.secondary', lineHeight: 1.2, mb: 0.25 }}
          noWrap
        >
          {title}
        </Typography>
        <Stack direction="row" alignItems="center" gap={0.75} sx={{ minWidth: 0 }}>
          <Chip
            icon={<StatusIcon />}
            label={detail ?? statusLabel(status)}
            size="small"
            color={color}
            variant="outlined"
            sx={{ maxWidth: '100%' }}
          />
        </Stack>
      </Box>
    </Stack>
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
    <Card sx={{ p: 1.5, mb: 1.5 }}>
      <Stack
        direction={{ xs: 'column', md: 'row' }}
        divider={
          <Divider orientation="vertical" flexItem sx={{ display: { xs: 'none', md: 'block' } }} />
        }
        spacing={{ xs: 1.5, md: 2 }}
        alignItems="stretch"
      >
        <StatusItem icon={<VaccinesIcon />} title="Očkovanie" status={vaccinationStatus} />
        <StatusItem icon={<DewormIcon />} title="Odčervenie" status={dewormingStatus} />
        <StatusItem icon={<EctoIcon />} title="Kliešte / blchy" status={ectoStatus} />
        <StatusItem
          icon={<DietIcon />}
          title="Aktuálna diéta"
          status="VALID"
          detail={currentDiet ? currentDiet.foodName : 'Nie je nastavená'}
        />
      </Stack>
    </Card>
  );
}
