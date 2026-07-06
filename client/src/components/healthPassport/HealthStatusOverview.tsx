import { useTranslation } from 'react-i18next';
import { Box, Card, Stack, Typography, useTheme } from '@mui/material';
import {
  Vaccines as VaccinesIcon,
  Biotech as DewormIcon,
  PestControl as EctoIcon,
  Healing as TreatmentIcon,
} from '@mui/icons-material';
import type { ValidityStatus } from '../../types/petHealth';
import HealthMetricCard from './HealthMetricCard';
import SelectableMetricCard, { type MetricOption } from './SelectableMetricCard';

interface HealthStatusOverviewProps {
  vaccinationOptions: MetricOption[];
  treatmentOptions: MetricOption[];
  dewormingStatus: ValidityStatus;
  ectoStatus: ValidityStatus;
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
  onOpenVaccination?: (id: string) => void;
  onOpenDeworming?: () => void;
  onOpenEcto?: () => void;
  onOpenTreatment?: (id: string) => void;
  onHistoryDeworming?: () => void;
  onHistoryEcto?: () => void;
}

export default function HealthStatusOverview(props: HealthStatusOverviewProps) {
  const { t } = useTranslation('healthPassport');
  const theme = useTheme();
  const {
    vaccinationOptions,
    treatmentOptions,
    dewormingStatus,
    ectoStatus,
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
        <SelectableMetricCard
          icon={<VaccinesIcon />}
          label={t('overview.vaccination')}
          hint={t('hints.vaccination')}
          accentColor={theme.palette.success.main}
          options={vaccinationOptions}
          soonDays={30}
          emptyText={t('overview.vaccinationEmpty')}
          onAdd={onAddVaccination}
          onOpen={onOpenVaccination}
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
        <SelectableMetricCard
          icon={<TreatmentIcon />}
          label={t('overview.treatment')}
          hint={t('hints.treatment')}
          accentColor={theme.palette.warning.main}
          options={treatmentOptions}
          soonDays={7}
          emptyText={t('overview.treatmentEmpty')}
          onAdd={onAddTreatment}
          onOpen={onOpenTreatment}
        />
      </Box>
    </Card>
  );
}
