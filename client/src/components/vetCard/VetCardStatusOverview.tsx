import { Box, Card, Stack, Typography } from '@mui/material';
import {
  Coronavirus as RabiesIcon,
  Vaccines as VaccinesIcon,
  Biotech as DewormIcon,
  PestControl as EctoIcon,
  ShieldOutlined as ShieldIcon,
} from '@mui/icons-material';
import type { ValidityStatus } from '../../types/dogHealth';
import VetCardStatusCell from './VetCardStatusCell';

interface Props {
  rabies: { status: ValidityStatus; detail?: string };
  combined: { status: ValidityStatus; detail?: string };
  deworming: { status: ValidityStatus; detail?: string };
  ecto: { status: ValidityStatus; detail?: string };
}

export default function VetCardStatusOverview({ rabies, combined, deworming, ecto }: Props) {
  return (
    <Card variant="outlined" sx={{ p: { xs: 1.75, md: 2 } }}>
      <Stack direction="row" alignItems="center" gap={1} sx={{ mb: 1.5 }}>
        <ShieldIcon sx={{ fontSize: 18, color: 'text.secondary' }} />
        <Typography variant="caption" sx={{ color: 'text.secondary' }}>
          Aktuálny preventívny stav
        </Typography>
      </Stack>
      <Box
        sx={{
          display: 'grid',
          gridTemplateColumns: {
            xs: '1fr',
            sm: 'repeat(2, 1fr)',
            md: 'repeat(4, 1fr)',
          },
          gap: 1,
        }}
      >
        <VetCardStatusCell
          icon={<RabiesIcon />}
          label="Besnota"
          status={rabies.status}
          detail={rabies.detail}
        />
        <VetCardStatusCell
          icon={<VaccinesIcon />}
          label="Kombinovaná"
          status={combined.status}
          detail={combined.detail}
        />
        <VetCardStatusCell
          icon={<DewormIcon />}
          label="Odčervenie"
          status={deworming.status}
          detail={deworming.detail}
        />
        <VetCardStatusCell
          icon={<EctoIcon />}
          label="Antiparazitikum"
          status={ecto.status}
          detail={ecto.detail}
        />
      </Box>
    </Card>
  );
}
