import { useTranslation } from 'react-i18next';
import { Chip } from '@mui/material';
import type { DietEntry } from '../../types/petHealth';

interface Props {
  status?: DietEntry['suitabilityStatus'];
  size?: 'small' | 'medium';
}

export default function FoodSuitabilityChip({ status, size = 'small' }: Props) {
  const { t } = useTranslation();
  if (status === 'SUITABLE') {
    return <Chip size={size} color="success" variant="outlined" label={t('food.suitable')} />;
  }
  if (status === 'RISKY') {
    return <Chip size={size} color="warning" variant="outlined" label={t('food.risky')} />;
  }
  if (status === 'UNSUITABLE') {
    return <Chip size={size} color="error" variant="outlined" label={t('food.unsuitable')} />;
  }
  return <Chip size={size} variant="outlined" label={t('food.notEvaluated')} />;
}
