import { Box, Chip, Stack, Typography, useTheme, alpha } from '@mui/material';
import {
  Vaccines as VaccinesIcon,
  Biotech as DewormIcon,
  PestControl as EctoIcon,
  Restaurant as DietIcon,
  CheckCircle as CheckIcon,
  Warning as WarningIcon,
  Cancel as ExpiredIcon,
} from '@mui/icons-material';
import type { ValidityStatus } from '../../types/dogHealth';
import type { DietEntry } from '../../types/dogHealth';
import { statusColor, statusLabel } from './utils.ts';

interface StatusCardProps {
  icon: React.ReactElement;
  title: string;
  status: ValidityStatus;
  detail?: string;
  accentColor: string;
}

function StatusCard({ icon, title, status, detail, accentColor }: StatusCardProps) {
  const theme = useTheme();
  const color = statusColor(status);
  const paletteColor = theme.palette[color].main;

  const StatusIcon =
    status === 'VALID' ? CheckIcon :
    status === 'EXPIRING_SOON' ? WarningIcon :
    ExpiredIcon;

  return (
    <Box
      sx={{
        position: 'relative',
        bgcolor: 'background.paper',
        borderRadius: 3,
        p: 2.5,
        overflow: 'hidden',
        border: '1px solid',
        borderColor: alpha(paletteColor, 0.2),
        transition: 'box-shadow 0.2s',
        '&:hover': {
          boxShadow: `0 4px 20px ${alpha(paletteColor, 0.15)}`,
        },
      }}
    >
      {/* Top accent bar */}
      <Box
        sx={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          height: 3,
          background: `linear-gradient(90deg, ${accentColor}, ${alpha(accentColor, 0.5)})`,
          borderRadius: '12px 12px 0 0',
        }}
      />

      {/* Icon */}
      <Box
        sx={{
          width: 44,
          height: 44,
          borderRadius: 2.5,
          bgcolor: alpha(accentColor, 0.12),
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: accentColor,
          mb: 2,
          '& svg': { fontSize: 22 },
        }}
      >
        {icon}
      </Box>

      <Typography
        variant="caption"
        sx={{
          display: 'block',
          fontWeight: 700,
          letterSpacing: '0.08em',
          textTransform: 'uppercase',
          color: 'text.secondary',
          mb: 0.75,
          fontSize: '0.7rem',
        }}
      >
        {title}
      </Typography>

      <Stack direction="row" alignItems="center" gap={0.75}>
        <StatusIcon sx={{ fontSize: 14, color: paletteColor }} />
        <Chip
          label={statusLabel(status)}
          size="small"
          sx={{
            fontSize: '0.72rem',
            fontWeight: 700,
            height: 22,
            bgcolor: alpha(paletteColor, 0.12),
            color: paletteColor,
            border: 'none',
            '& .MuiChip-label': { px: 1 },
          }}
        />
      </Stack>

      {detail && (
        <Typography variant="caption" sx={{ display: 'block', color: 'text.secondary', mt: 0.5, fontSize: '0.72rem' }}>
          {detail}
        </Typography>
      )}
    </Box>
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
      <StatusCard
        icon={<VaccinesIcon />}
        title="Očkovanie"
        status={vaccinationStatus}
        accentColor="#22c55e"
      />
      <StatusCard
        icon={<DewormIcon />}
        title="Odčervenie"
        status={dewormingStatus}
        accentColor="#a855f7"
      />
      <StatusCard
        icon={<EctoIcon />}
        title="Kliešte / blchy"
        status={ectoStatus}
        accentColor="#f59e0b"
      />
      <StatusCard
        icon={<DietIcon />}
        title="Aktuálna diéta"
        status="VALID"
        detail={currentDiet ? currentDiet.foodName : 'Nie je nastavená'}
        accentColor="#10b981"
      />
    </Box>
  );
}
