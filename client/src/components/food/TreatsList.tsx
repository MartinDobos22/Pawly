import { useTranslation } from 'react-i18next';
import { Button, Card, Chip, Divider, IconButton, Stack, Typography, useTheme } from '@mui/material';
import { Add as AddIcon, Delete as DeleteIcon, Cookie as CookieIcon } from '@mui/icons-material';
import { useHealthData } from '../../hooks/useHealthData';
import type { DietEntry } from '../../types/petHealth';

interface Props {
  entries: DietEntry[];
  onAdd: () => void;
}

export default function TreatsList({ entries, onAdd }: Props) {
  const { t } = useTranslation();
  const theme = useTheme();
  const { removeDietEntry } = useHealthData();

  const active = entries.filter(
    (d) => (d.foodType === 'treats' || d.foodType === 'supplement') && !d.endedAt
  );

  return (
    <Card sx={{ p: theme.spacing(2.5) }}>
      <Stack direction="row" alignItems="center" spacing={1} sx={{ mb: theme.spacing(1.5) }}>
        <CookieIcon color="action" />
        <Typography variant="h6" sx={{ flex: 1 }}>
          {t('food.treatsTitle')}
        </Typography>
        <Button size="small" startIcon={<AddIcon />} onClick={onAdd}>
          {t('food.addTreat')}
        </Button>
      </Stack>

      {active.length === 0 ? (
        <Typography variant="body2" color="text.secondary">
          {t('food.treatsEmpty')}
        </Typography>
      ) : (
        <Stack divider={<Divider flexItem />} spacing={theme.spacing(0.5)}>
          {active.map((d) => (
            <Stack key={d.id} direction="row" alignItems="center" spacing={1} sx={{ py: 0.5 }}>
              <Typography variant="body2" sx={{ flex: 1, minWidth: 0 }} noWrap>
                {d.foodName}
              </Typography>
              <Chip
                size="small"
                variant="outlined"
                label={d.foodType === 'supplement' ? t('food.typeSupplement') : t('food.typeTreats')}
              />
              <IconButton
                size="small"
                aria-label={t('food.remove')}
                onClick={() => void removeDietEntry(d.id)}
              >
                <DeleteIcon fontSize="small" />
              </IconButton>
            </Stack>
          ))}
        </Stack>
      )}
    </Card>
  );
}
