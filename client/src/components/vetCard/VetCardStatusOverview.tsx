import { Card, Divider, Stack } from '@mui/material';
import {
  Coronavirus as RabiesIcon,
  Vaccines as VaccinesIcon,
  Biotech as DewormIcon,
  PestControl as EctoIcon,
} from '@mui/icons-material';
import type { ValidityStatus } from '../../types/dogHealth';
import StatusItem from '../healthPassport/StatusItem';

interface Props {
  rabies: { status: ValidityStatus; detail?: string };
  combined: { status: ValidityStatus; detail?: string };
  deworming: { status: ValidityStatus; detail?: string };
  ecto: { status: ValidityStatus; detail?: string };
}

export default function VetCardStatusOverview({ rabies, combined, deworming, ecto }: Props) {
  return (
    <Card variant="outlined" sx={{ p: 1.5 }}>
      <Stack
        direction={{ xs: 'column', md: 'row' }}
        divider={
          <Divider orientation="vertical" flexItem sx={{ display: { xs: 'none', md: 'block' } }} />
        }
        spacing={{ xs: 1.5, md: 2 }}
        alignItems="stretch"
      >
        <StatusItem
          icon={<RabiesIcon />}
          title="Besnota"
          status={rabies.status}
          detail={rabies.detail}
        />
        <StatusItem
          icon={<VaccinesIcon />}
          title="Kombinovaná"
          status={combined.status}
          detail={combined.detail}
        />
        <StatusItem
          icon={<DewormIcon />}
          title="Odčervenie"
          status={deworming.status}
          detail={deworming.detail}
        />
        <StatusItem
          icon={<EctoIcon />}
          title="Antiparazitikum"
          status={ecto.status}
          detail={ecto.detail}
        />
      </Stack>
    </Card>
  );
}
