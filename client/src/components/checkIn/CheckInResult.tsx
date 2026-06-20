import { useTranslation } from 'react-i18next';
import { Box, Button, Card, Typography, useTheme } from '@mui/material';
import {
  CheckCircle as OkIcon,
  Info as MildIcon,
  Warning as AttentionIcon,
} from '@mui/icons-material';
import type { CheckInSeverity } from '../../types/petHealth';

interface Props {
  severity: CheckInSeverity;
  petName: string;
  onDone: () => void;
}

export default function CheckInResult({ severity, petName, onDone }: Props) {
  const { t } = useTranslation();
  const theme = useTheme();

  const message =
    severity === 'attention'
      ? t('checkIn.resultAttention')
      : severity === 'mild'
        ? t('checkIn.resultMild')
        : t('checkIn.resultNone', { name: petName });

  const color =
    severity === 'attention' ? 'error.main' : severity === 'mild' ? 'warning.main' : 'success.main';
  const Icon = severity === 'attention' ? AttentionIcon : severity === 'mild' ? MildIcon : OkIcon;

  return (
    <Card sx={{ p: theme.spacing(4), textAlign: 'center' }}>
      <Box sx={{ color, mb: theme.spacing(1) }}>
        <Icon sx={{ fontSize: 56 }} />
      </Box>
      <Typography variant="h6" sx={{ mb: theme.spacing(1) }}>
        {t('checkIn.resultTitle')}
      </Typography>
      <Typography variant="body1" color="text.secondary" sx={{ mb: theme.spacing(3) }}>
        {message}
      </Typography>
      <Button variant="contained" onClick={onDone}>
        {t('checkIn.resultDone')}
      </Button>
    </Card>
  );
}
