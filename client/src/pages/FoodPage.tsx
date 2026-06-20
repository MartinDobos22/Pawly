import { useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Button,
  Card,
  FormControl,
  InputLabel,
  MenuItem,
  Select,
  Stack,
  Typography,
  useTheme,
} from '@mui/material';
import { Add as AddIcon } from '@mui/icons-material';
import Seo from '../components/Seo';
import CurrentFoodCard from '../components/food/CurrentFoodCard';
import FoodHistoryList from '../components/food/FoodHistoryList';
import SetCurrentFoodDialog from '../components/food/SetCurrentFoodDialog';
import { useActivePet } from '../hooks/useActivePet';
import { useHealthData } from '../hooks/useHealthData';

export default function FoodPage() {
  const { t } = useTranslation();
  const theme = useTheme();
  const navigate = useNavigate();

  const { petProfiles, activePetId } = useActivePet();
  const { dietEntries } = useHealthData();

  const [selectedPetId, setSelectedPetId] = useState<string>(
    activePetId || petProfiles[0]?.id || ''
  );
  const [dialogOpen, setDialogOpen] = useState(false);

  const petEntries = useMemo(
    () => dietEntries.filter((d) => d.petId === selectedPetId),
    [dietEntries, selectedPetId]
  );
  const current = useMemo(
    () =>
      petEntries
        .filter((d) => !d.endedAt)
        .sort((a, b) => b.startedAt.localeCompare(a.startedAt))[0],
    [petEntries]
  );

  if (petProfiles.length === 0) {
    return (
      <Box sx={{ maxWidth: 640, mx: 'auto' }}>
        <Seo title={`${t('food.title')} — Pawly`} noindex />
        <Card sx={{ p: theme.spacing(4), textAlign: 'center' }}>
          <Typography variant="h6" sx={{ mb: theme.spacing(2) }}>
            {t('overview.emptyTitle')}
          </Typography>
          <Button variant="contained" startIcon={<AddIcon />} onClick={() => navigate('/profily')}>
            {t('overview.emptyAction')}
          </Button>
        </Card>
      </Box>
    );
  }

  return (
    <Box sx={{ maxWidth: 640, mx: 'auto' }}>
      <Seo title={`${t('food.title')} — Pawly`} noindex />

      <Typography variant="h4" sx={{ mb: theme.spacing(0.5) }}>
        {t('food.title')}
      </Typography>
      <Typography variant="body1" color="text.secondary" sx={{ mb: theme.spacing(3) }}>
        {t('food.subtitle')}
      </Typography>

      {petProfiles.length > 1 && (
        <FormControl fullWidth sx={{ mb: theme.spacing(3) }}>
          <InputLabel id="food-pet-label">{t('checkIn.selectPet')}</InputLabel>
          <Select
            labelId="food-pet-label"
            label={t('checkIn.selectPet')}
            value={selectedPetId}
            onChange={(e) => setSelectedPetId(e.target.value)}
          >
            {petProfiles.map((p) => (
              <MenuItem key={p.id} value={p.id}>
                {p.name}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
      )}

      <Stack spacing={theme.spacing(2)}>
        <CurrentFoodCard current={current} onSetFood={() => setDialogOpen(true)} />
        <FoodHistoryList entries={petEntries} />
      </Stack>

      <SetCurrentFoodDialog
        open={dialogOpen}
        onClose={() => setDialogOpen(false)}
        petId={selectedPetId}
      />
    </Box>
  );
}
