import { useTranslation } from 'react-i18next';
import { Button, Stack, Typography, useTheme } from '@mui/material';
import type { CheckInOverallStatus } from '../../types/petHealth';

interface Props {
  petName: string;
  onSelect: (status: CheckInOverallStatus) => void;
}

export default function QuickCheckInStep({ petName, onSelect }: Props) {
  const { t } = useTranslation();
  const theme = useTheme();

  return (
    <Stack spacing={theme.spacing(2)}>
      <Typography variant="h6">{t('checkIn.question', { name: petName })}</Typography>
      <Button variant="contained" size="large" onClick={() => onSelect('ok')}>
        {t('checkIn.optionOk')}
      </Button>
      <Button variant="outlined" size="large" onClick={() => onSelect('changed')}>
        {t('checkIn.optionChanged')}
      </Button>
      <Button variant="outlined" size="large" onClick={() => onSelect('unsure')}>
        {t('checkIn.optionUnsure')}
      </Button>
    </Stack>
  );
}
