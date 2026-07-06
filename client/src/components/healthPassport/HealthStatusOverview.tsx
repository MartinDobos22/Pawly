import { useTranslation } from 'react-i18next';
import { Box, Card, Stack, Typography, useTheme } from '@mui/material';
import {
  Vaccines as VaccinesIcon,
  Biotech as DewormIcon,
  PestControl as EctoIcon,
} from '@mui/icons-material';
import type { TreatmentRecord, ValidityStatus } from '../../types/petHealth';
import HealthMetricCard from './HealthMetricCard';
import TreatmentMetricCard from './TreatmentMetricCard';

interface HealthStatusOverviewProps {
  vaccinationStatus: ValidityStatus;
  dewormingStatus: ValidityStatus;
  ectoStatus: ValidityStatus;
  treatments: TreatmentRecord[];
  vaccinationNextDate?: string;
  vaccinationLastDate?: string;
  vaccinationDetail?: string;
  vaccinationIntervalDays?: number;
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
  onAddTreatment?: () => void;
  onOpenVaccination?: () => void;
  onOpenDeworming?: () => void;
  onOpenEcto?: () => void;
  onOpenTreatment?: (id: string) => void;
  onHistoryVaccination?: () => void;
  onHistoryDeworming?: () => void;
  onHistoryEcto?: () => void;
}

export default function HealthStatusOverview(props: HealthStatusOverviewProps) {
  const { t } = useTranslation('healthPassport');
  const theme = useTheme();
  const {
    vaccinationStatus,
    dewormingStatus,
    ectoStatus,
    treatments,
    vaccinationNextDate,
    vaccinationLastDate,
    vaccinationDetail,
    vaccinationIntervalDays,
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
    onAddTreatment,
    onOpenVaccination,
    onOpenDeworming,
    onOpenEcto,
    onOpenTreatment,
    onHistoryVaccination,
    onHistoryDeworming,
    onHistoryEcto,
  } = props;

  return (
    <Card
      sx={{
        p: { xs: 2, md: 3 },
        mb: 2.5,
        borderRadius: 0,
        borderTopWidth: 0,
        borderBottomWidth: 0,
        bgcolor: 'background.default',
      }}
    >
      <Stack
        direction="row"
        alignItems="flex-start"
        justifyContent="space-between"
        sx={{ mb: 2.5 }}
      >
        <Box>
          <Typography variant="h3" sx={{ fontSize: '1.2rem', fontWeight: 700 }}>
            {t('overviewCard.title')}
          </Typography>
          <Typography variant="body2" sx={{ color: 'text.secondary', mt: 0.25 }}>
            {t('overviewCard.subtitle')}
          </Typography>
        </Box>
      </Stack>

      <Box
        sx={{
          display: 'grid',
          gridTemplateColumns: {
            xs: '1fr',
            sm: 'repeat(2, 1fr)',
            lg: 'repeat(4, 1fr)',
          },
          alignItems: 'stretch',
          gap: 2,
        }}
      >
        <HealthMetricCard
          icon={<VaccinesIcon />}
          label={t('overview.vaccination')}
          hint={t('hints.vaccination')}
          status={vaccinationStatus}
          accentColor={theme.palette.success.main}
          nextDate={vaccinationNextDate}
          lastDate={vaccinationLastDate}
          detail={vaccinationDetail}
          intervalDays={vaccinationIntervalDays}
          primaryActionLabel={
            vaccinationStatus === 'UNKNOWN' ? t('overview.add') : t('overview.viewSchedule')
          }
          onPrimaryAction={onAddVaccination}
          onOpen={vaccinationStatus !== 'UNKNOWN' ? onOpenVaccination : undefined}
          onHistory={vaccinationStatus !== 'UNKNOWN' ? onHistoryVaccination : undefined}
        />
        <HealthMetricCard
          icon={<DewormIcon />}
          label={t('overview.deworming')}
          hint={t('hints.deworming')}
          status={dewormingStatus}
          accentColor={theme.palette.secondary.main}
          nextDate={dewormingNextDate}
          lastDate={dewormingLastDate}
          intervalDays={dewormingIntervalDays}
          detail={dewormingPreparation}
          primaryActionLabel={
            dewormingStatus === 'UNKNOWN' ? t('overview.add') : t('overview.schedule')
          }
          onPrimaryAction={onAddDeworming}
          onOpen={dewormingStatus !== 'UNKNOWN' ? onOpenDeworming : undefined}
          onHistory={dewormingStatus !== 'UNKNOWN' ? onHistoryDeworming : undefined}
        />
        <HealthMetricCard
          icon={<EctoIcon />}
          label={t('overview.ecto')}
          hint={t('hints.ectoparasite')}
          status={ectoStatus}
          accentColor={theme.palette.info.main}
          nextDate={ectoNextDate}
          lastDate={ectoLastDate}
          intervalDays={ectoIntervalDays}
          detail={ectoPreparation}
          primaryActionLabel={ectoStatus === 'UNKNOWN' ? t('overview.add') : t('overview.schedule')}
          onPrimaryAction={onAddEcto}
          onOpen={ectoStatus !== 'UNKNOWN' ? onOpenEcto : undefined}
          onHistory={ectoStatus !== 'UNKNOWN' ? onHistoryEcto : undefined}
        />
        <TreatmentMetricCard
          treatments={treatments}
          hint={t('hints.treatment')}
          accentColor={theme.palette.warning.main}
          onAdd={onAddTreatment}
          onOpen={onOpenTreatment}
        />
      </Box>
    </Card>
  );
}
