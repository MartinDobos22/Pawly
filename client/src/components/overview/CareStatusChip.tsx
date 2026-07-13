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
  /** Počet otvorených podnetov — keď je zadaný (a stav nie je zelený), chip
   * ukáže konkrétny počet namiesto všeobecného stavu. */
  count?: number;
  size?: 'small' | 'medium';
}

const CHIP_SX = {
  pl: 0.75,
  '& .MuiChip-icon': { ml: 0, mr: 0.5 },
} as const;

export default function CareStatusChip({ level, count, size = 'small' }: Props) {
  const { t } = useTranslation();

  if (level === 'green') {
    return (
      <Chip
        size={size}
        color="success"
        variant="outlined"
        icon={<GreenIcon />}
        label={t('overview.statusGreen')}
        sx={CHIP_SX}
      />
    );
  }

  const label =
    typeof count === 'number'
      ? t('overview.openItems', { count })
      : level === 'red'
        ? t('overview.statusRed')
        : t('overview.statusOrange');

  if (level === 'red') {
    return (
      <Chip
        size={size}
        color="error"
        variant="outlined"
        icon={<RedIcon />}
        label={label}
        sx={CHIP_SX}
      />
    );
  }

  return (
    <Chip
      size={size}
      color="warning"
      variant="outlined"
      icon={<OrangeIcon />}
      label={label}
      sx={CHIP_SX}
    />
  );
}
