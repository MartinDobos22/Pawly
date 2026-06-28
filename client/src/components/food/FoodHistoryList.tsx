import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { Card, Divider, Stack, Typography, useTheme } from '@mui/material';
import { History as HistoryIcon } from '@mui/icons-material';
import FoodSuitabilityChip from './FoodSuitabilityChip';
import FoodCardHeader from './FoodCardHeader';
import type { DietEntry } from '../../types/petHealth';

interface Props {
  entries: DietEntry[];
}

export default function FoodHistoryList({ entries }: Props) {
  const { t } = useTranslation();
  const theme = useTheme();

  const sorted = useMemo(
    () => [...entries].sort((a, b) => b.startedAt.localeCompare(a.startedAt)),
    [entries]
  );

  const typeLabel = (ty?: DietEntry['foodType']): string =>
    ty === 'wet'
      ? t('food.typeWet')
      : ty === 'treats'
        ? t('food.typeTreats')
        : ty === 'supplement'
          ? t('food.typeSupplement')
          : t('food.typeMain');

  return (
    <Card sx={{ p: theme.spacing(2.5), borderRadius: 2 }}>
      <FoodCardHeader
        icon={<HistoryIcon />}
        accent={theme.palette.primary.main}
        title={t('food.history')}
      />
      {sorted.length === 0 ? (
        <Typography variant="body2" color="text.secondary">
          {t('food.historyEmpty')}
        </Typography>
      ) : (
        <Stack divider={<Divider flexItem />} spacing={theme.spacing(1)}>
          {sorted.map((d) => (
            <Stack
              key={d.id}
              direction="row"
              alignItems="center"
              spacing={theme.spacing(1)}
              sx={{ py: theme.spacing(0.5) }}
            >
              <Stack sx={{ flex: 1, minWidth: 0 }}>
                <Typography variant="body2" sx={{ fontWeight: 600 }} noWrap>
                  {d.foodName}
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  {typeLabel(d.foodType)} · {d.startedAt} → {d.endedAt ?? t('food.ongoing')}
                </Typography>
              </Stack>
              <FoodSuitabilityChip status={d.suitabilityStatus} />
            </Stack>
          ))}
        </Stack>
      )}
    </Card>
  );
}
