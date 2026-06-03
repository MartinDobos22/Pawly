import { Alert, type AlertProps, type SxProps, type Theme } from '@mui/material';
import { InfoOutlined } from '@mui/icons-material';
import { useTranslation } from 'react-i18next';

interface Props {
  sx?: SxProps<Theme>;
  variant?: AlertProps['variant'];
}

export default function AiDisclaimer({ sx, variant = 'outlined' }: Props) {
  const { t } = useTranslation('common');
  return (
    <Alert severity="info" variant={variant} icon={<InfoOutlined fontSize="small" />} sx={sx}>
      {t('aiDisclaimer')}
    </Alert>
  );
}
