import { Card, Divider, Stack } from '@mui/material';
import {
  Vaccines as VaccinesIcon,
  Biotech as DewormIcon,
  PestControl as EctoIcon,
  Restaurant as DietIcon,
} from '@mui/icons-material';
import type { ValidityStatus, DietEntry } from '../../types/dogHealth';
import StatusItem from './StatusItem';

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
