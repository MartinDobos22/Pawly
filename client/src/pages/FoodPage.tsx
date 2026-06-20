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
import { Add as AddIcon, Science as ScienceIcon } from '@mui/icons-material';
import Seo from '../components/Seo';
import CurrentFoodCard from '../components/food/CurrentFoodCard';
import TreatsList from '../components/food/TreatsList';
import FoodInsightsCard from '../components/food/FoodInsightsCard';
import FoodHistoryList from '../components/food/FoodHistoryList';
import SetCurrentFoodDialog from '../components/food/SetCurrentFoodDialog';
import { useActivePet } from '../hooks/useActivePet';
import { useHealthData } from '../hooks/useHealthData';
import type { FoodType } from '../types/petHealth';

export default function FoodPage() {
  const { t } = useTranslation();
  const theme = useTheme();
  const navigate = useNavigate();

  const { petProfiles, activePetId } = useActivePet();
  const { dietEntries, checkIns } = useHealthData();

  const [selectedPetId, setSelectedPetId] = useState<string>(
    activePetId || petProfiles[0]?.id || ''
  );
  const [dialogOpen, setDialogOpen] = useState(false);
  const [dialogType, setDialogType] = useState<FoodType>('main');

  const petEntries = useMemo(
    () => dietEntries.filter((d) => d.petId === selectedPetId),
    [dietEntries, selectedPetId]
  );
  const petCheckIns = useMemo(
    () => checkIns.filter((c) => c.petId === selectedPetId),
    [checkIns, selectedPetId]
  );
  const current = useMemo(
    () =>
      petEntries
        .filter((d) => (d.foodType ?? 'main') === 'main' && !d.endedAt)
        .sort(
          (a, b) =>
            b.startedAt.localeCompare(a.startedAt) ||
            (b.createdAt ?? '').localeCompare(a.createdAt ?? '')
        )[0],
    [petEntries]
  );

  const openDialog = (type: FoodType) => {
    setDialogType(type);
    setDialogOpen(true);
  };

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
      <Typography variant="body1" color="text.secondary" sx={{ mb: theme.spacing(2) }}>
        {t('food.subtitle')}
      </Typography>

      <Button
        variant="outlined"
        startIcon={<ScienceIcon />}
        onClick={() => navigate('/analyza')}
        sx={{ mb: theme.spacing(3) }}
      >
        {t('food.analyzeCta')}
      </Button>

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
        <CurrentFoodCard current={current} onSetFood={() => openDialog('main')} />
        <TreatsList entries={petEntries} onAdd={() => openDialog('treats')} />
        <FoodInsightsCard dietEntries={petEntries} checkIns={petCheckIns} />
        <FoodHistoryList entries={petEntries} />
      </Stack>

      <SetCurrentFoodDialog
        open={dialogOpen}
        onClose={() => setDialogOpen(false)}
        petId={selectedPetId}
        defaultType={dialogType}
      />
    </Box>
  );
}
