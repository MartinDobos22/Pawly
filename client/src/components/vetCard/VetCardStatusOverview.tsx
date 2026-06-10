import { Box, Card, Stack, Typography } from '@mui/material';
import {
  Coronavirus as RabiesIcon,
  Vaccines as VaccinesIcon,
  Biotech as DewormIcon,
  PestControl as EctoIcon,
  ShieldOutlined as ShieldIcon,
} from '@mui/icons-material';
import { useTranslation } from 'react-i18next';
import type { ValidityStatus } from '../../types/petHealth';
import HelpHint from '../HelpHint';
import VetCardStatusCell from './VetCardStatusCell';

interface Props {
  rabies: { status: ValidityStatus; detail?: string };
  combined: { status: ValidityStatus; detail?: string };
  deworming: { status: ValidityStatus; detail?: string };
  ecto: { status: ValidityStatus; detail?: string };
}

export default function VetCardStatusOverview({ rabies, combined, deworming, ecto }: Props) {
  const { t } = useTranslation('vetCard');
  return (
    <Card variant="outlined" sx={{ p: { xs: 1.75, md: 2 } }}>
      <Stack direction="row" alignItems="center" gap={1} sx={{ mb: 1.5 }}>
        <ShieldIcon sx={{ fontSize: 18, color: 'text.secondary' }} />
        <Typography variant="caption" sx={{ color: 'text.secondary' }}>
          {t('statusOverview.preventiveStatus')}
        </Typography>
        <HelpHint text={t('hints.preventiveStatus')} size={14} />
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
          label={t('statusOverview.rabies')}
          status={rabies.status}
          detail={rabies.detail}
        />
        <VetCardStatusCell
          icon={<VaccinesIcon />}
          label={t('statusOverview.combined')}
          status={combined.status}
          detail={combined.detail}
        />
        <VetCardStatusCell
          icon={<DewormIcon />}
          label={t('statusOverview.deworming')}
          status={deworming.status}
          detail={deworming.detail}
        />
        <VetCardStatusCell
          icon={<EctoIcon />}
          label={t('statusOverview.antiparasitic')}
          status={ecto.status}
          detail={ecto.detail}
        />
      </Box>
    </Card>
  );
}
