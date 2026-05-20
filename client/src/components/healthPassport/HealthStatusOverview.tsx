import { Box } from '@mui/material';
import {
  Vaccines as VaccinesIcon,
  Biotech as DewormIcon,
  PestControl as EctoIcon,
  Restaurant as DietIcon,
} from '@mui/icons-material';
import type { ValidityStatus, DietEntry } from '../../types/dogHealth';
import HealthMetricCard from './HealthMetricCard';

interface HealthStatusOverviewProps {
  vaccinationStatus: ValidityStatus;
  dewormingStatus: ValidityStatus;
  ectoStatus: ValidityStatus;
  currentDiet?: DietEntry;
  vaccinationNextDate?: string;
  vaccinationLastDate?: string;
  dewormingNextDate?: string;
  dewormingLastDate?: string;
  dewormingIntervalDays?: number;
  dewormingPreparation?: string;
  ectoNextDate?: string;
  ectoLastDate?: string;
  ectoIntervalDays?: number;
  ectoPreparation?: string;
  onAddVaccination?: () => void;
  onAddDeworming?: () => void;
  onAddEcto?: () => void;
  onAddDiet?: () => void;
  onOpenVaccination?: () => void;
  onOpenDeworming?: () => void;
  onOpenEcto?: () => void;
  onOpenDiet?: () => void;
}

export default function HealthStatusOverview(props: HealthStatusOverviewProps) {
  const {
    vaccinationStatus,
    dewormingStatus,
    ectoStatus,
    currentDiet,
    vaccinationNextDate,
    vaccinationLastDate,
    dewormingNextDate,
    dewormingLastDate,
    dewormingIntervalDays,
    dewormingPreparation,
    ectoNextDate,
    ectoLastDate,
    ectoIntervalDays,
    ectoPreparation,
    onAddVaccination,
    onAddDeworming,
    onAddEcto,
    onAddDiet,
    onOpenVaccination,
    onOpenDeworming,
    onOpenEcto,
    onOpenDiet,
  } = props;

  return (
    <Box
      sx={{
        display: 'grid',
        gridTemplateColumns: {
          xs: '1fr',
          sm: 'repeat(2, 1fr)',
          lg: 'repeat(4, 1fr)',
        },
        alignItems: 'start',
        gap: 1.5,
        mb: 2.5,
      }}
    >
      <HealthMetricCard
        icon={<VaccinesIcon />}
        label="Očkovanie"
        status={vaccinationStatus}
        nextDate={vaccinationNextDate}
        lastDate={vaccinationLastDate}
        primaryActionLabel={vaccinationStatus === 'UNKNOWN' ? 'Pridať' : 'Naplánovať'}
        onPrimaryAction={onAddVaccination}
        onOpen={vaccinationStatus !== 'UNKNOWN' ? onOpenVaccination : undefined}
      />
      <HealthMetricCard
        icon={<DewormIcon />}
        label="Odčervenie"
        status={dewormingStatus}
        nextDate={dewormingNextDate}
        lastDate={dewormingLastDate}
        intervalDays={dewormingIntervalDays}
        detail={dewormingPreparation}
        primaryActionLabel={dewormingStatus === 'UNKNOWN' ? 'Pridať' : 'Naplánovať'}
        onPrimaryAction={onAddDeworming}
        onOpen={dewormingStatus !== 'UNKNOWN' ? onOpenDeworming : undefined}
      />
      <HealthMetricCard
        icon={<EctoIcon />}
        label="Kliešte / blchy"
        status={ectoStatus}
        nextDate={ectoNextDate}
        lastDate={ectoLastDate}
        intervalDays={ectoIntervalDays}
        detail={ectoPreparation}
        primaryActionLabel={ectoStatus === 'UNKNOWN' ? 'Pridať' : 'Obnoviť'}
        onPrimaryAction={onAddEcto}
        onOpen={ectoStatus !== 'UNKNOWN' ? onOpenEcto : undefined}
      />
      <HealthMetricCard
        icon={<DietIcon />}
        label="Aktuálna diéta"
        status={currentDiet ? 'VALID' : 'UNKNOWN'}
        detail={currentDiet?.foodName ?? 'Nie je nastavená'}
        lastDate={currentDiet?.startedAt}
        primaryActionLabel={currentDiet ? 'Upraviť' : 'Nastaviť'}
        onPrimaryAction={onAddDiet}
        onOpen={currentDiet ? onOpenDiet : undefined}
      />
    </Box>
  );
}
