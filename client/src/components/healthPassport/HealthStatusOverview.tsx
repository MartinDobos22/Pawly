import { useTranslation } from 'react-i18next';
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
  const { t } = useTranslation('healthPassport');
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
        label={t('overview.vaccination')}
        status={vaccinationStatus}
        nextDate={vaccinationNextDate}
        lastDate={vaccinationLastDate}
        primaryActionLabel={
          vaccinationStatus === 'UNKNOWN' ? t('overview.add') : t('overview.schedule')
        }
        onPrimaryAction={onAddVaccination}
        onOpen={vaccinationStatus !== 'UNKNOWN' ? onOpenVaccination : undefined}
      />
      <HealthMetricCard
        icon={<DewormIcon />}
        label={t('overview.deworming')}
        status={dewormingStatus}
        nextDate={dewormingNextDate}
        lastDate={dewormingLastDate}
        intervalDays={dewormingIntervalDays}
        detail={dewormingPreparation}
        primaryActionLabel={
          dewormingStatus === 'UNKNOWN' ? t('overview.add') : t('overview.schedule')
        }
        onPrimaryAction={onAddDeworming}
        onOpen={dewormingStatus !== 'UNKNOWN' ? onOpenDeworming : undefined}
      />
      <HealthMetricCard
        icon={<EctoIcon />}
        label={t('overview.ecto')}
        status={ectoStatus}
        nextDate={ectoNextDate}
        lastDate={ectoLastDate}
        intervalDays={ectoIntervalDays}
        detail={ectoPreparation}
        primaryActionLabel={ectoStatus === 'UNKNOWN' ? t('overview.add') : t('overview.renew')}
        onPrimaryAction={onAddEcto}
        onOpen={ectoStatus !== 'UNKNOWN' ? onOpenEcto : undefined}
      />
      <HealthMetricCard
        icon={<DietIcon />}
        label={t('overview.diet')}
        status={currentDiet ? 'VALID' : 'UNKNOWN'}
        detail={currentDiet?.foodName ?? t('overview.dietNotSet')}
        lastDate={currentDiet?.startedAt}
        primaryActionLabel={currentDiet ? t('overview.edit') : t('overview.setup')}
        onPrimaryAction={onAddDiet}
        onOpen={currentDiet ? onOpenDiet : undefined}
      />
    </Box>
  );
}
