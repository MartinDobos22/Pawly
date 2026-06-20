import { useTranslation } from 'react-i18next';
import { Chip } from '@mui/material';
import {
  CheckCircle as GreenIcon,
  Warning as OrangeIcon,
  Error as RedIcon,
} from '@mui/icons-material';
import type { CareStatusLevel } from '../../types/petHealth';

interface Props {
  level: CareStatusLevel;
  size?: 'small' | 'medium';
}

export default function CareStatusChip({ level, size = 'small' }: Props) {
  const { t } = useTranslation();
  if (level === 'red') {
    return (
      <Chip size={size} color="error" variant="outlined" icon={<RedIcon />} label={t('overview.statusRed')} />
    );
  }
  if (level === 'orange') {
    return (
      <Chip
        size={size}
        color="warning"
        variant="outlined"
        icon={<OrangeIcon />}
        label={t('overview.statusOrange')}
      />
    );
  }
  return (
    <Chip size={size} color="success" variant="outlined" icon={<GreenIcon />} label={t('overview.statusGreen')} />
  );
}
