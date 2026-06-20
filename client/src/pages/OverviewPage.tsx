import { useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import {
  Alert,
  Box,
  Button,
  Card,
  CircularProgress,
  Stack,
  Typography,
  useTheme,
} from '@mui/material';
import { Add as AddIcon, ArrowForward as ArrowForwardIcon } from '@mui/icons-material';
import Seo from '../components/Seo';
import PetStatusCard from '../components/overview/PetStatusCard';
import CareStatusChip from '../components/overview/CareStatusChip';
import { usePetProfiles } from '../hooks/usePetProfiles';
import { useHealthData } from '../hooks/useHealthData';
import { useCareStatus } from '../hooks/useCareStatus';
import { notificationsApi, type UpcomingItem } from '../services/notificationsApi';
import type { CareStatusLevel } from '../types/petHealth';

const LEVEL_PRIORITY: Record<CareStatusLevel, number> = { red: 0, orange: 1, green: 2 };

export default function OverviewPage() {
  const { t } = useTranslation();
  const theme = useTheme();
  const navigate = useNavigate();

  const { profiles, loading: profilesLoading } = usePetProfiles();
  const { dietEntries } = useHealthData();
  const { statuses, loading: statusLoading, error } = useCareStatus();
  const [upcoming, setUpcoming] = useState<UpcomingItem[]>([]);

  useEffect(() => {
    let active = true;
    notificationsApi
      .getUpcoming()
      .then((res) => {
        if (active) setUpcoming(res.items);
      })
      .catch(() => {
        /* dashboard funguje aj bez pripomienok */
      });
    return () => {
      active = false;
    };
  }, []);

  const statusByPet = useMemo(
    () => new Map(statuses.map((s) => [s.petId, s])),
    [statuses]
  );

  const currentFoodByPet = useMemo(() => {
    const map = new Map<string, (typeof dietEntries)[number]>();
    for (const d of dietEntries) {
      if (d.endedAt) continue;
      const prev = map.get(d.petId);
      if (!prev || d.startedAt > prev.startedAt) map.set(d.petId, d);
    }
    return map;
  }, [dietEntries]);

  const nextReminderByPet = useMemo(() => {
    const map = new Map<string, UpcomingItem>();
    for (const item of upcoming) {
      const prev = map.get(item.petId);
      if (!prev || item.daysUntil < prev.daysUntil) map.set(item.petId, item);
    }
    return map;
  }, [upcoming]);

  const topAction = useMemo(() => {
    const withAction = statuses
      .filter((s) => s.recommendedAction)
      .sort((a, b) => LEVEL_PRIORITY[a.status] - LEVEL_PRIORITY[b.status]);
    const top = withAction[0];
    if (!top) return null;
    const pet = profiles.find((p) => p.id === top.petId);
    if (!pet) return null;
    return { pet, status: top };
  }, [statuses, profiles]);

  const loading = profilesLoading || statusLoading;

  return (
    <Box sx={{ maxWidth: 720, mx: 'auto' }}>
      <Seo title={`${t('overview.title')} — Pawly`} noindex />

      <Typography variant="h4" sx={{ mb: theme.spacing(0.5) }}>
        {t('overview.title')}
      </Typography>
      <Typography variant="body1" color="text.secondary" sx={{ mb: theme.spacing(3) }}>
        {t('overview.subtitle')}
      </Typography>

      {error && (
        <Alert severity="error" sx={{ mb: theme.spacing(2) }}>
          {error}
        </Alert>
      )}

      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', py: theme.spacing(6) }}>
          <CircularProgress />
        </Box>
      ) : profiles.length === 0 ? (
        <Card sx={{ p: theme.spacing(4), textAlign: 'center' }}>
          <Typography variant="h6" sx={{ mb: theme.spacing(1) }}>
            {t('overview.emptyTitle')}
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: theme.spacing(2) }}>
            {t('overview.emptySubtitle')}
          </Typography>
          <Button variant="contained" startIcon={<AddIcon />} onClick={() => navigate('/profily')}>
            {t('overview.emptyAction')}
          </Button>
        </Card>
      ) : (
        <Stack spacing={theme.spacing(2)}>
          {topAction?.status.recommendedAction && (
            <Card
              sx={{
                p: theme.spacing(2.5),
                bgcolor: 'primary.main',
                color: 'primary.contrastText',
              }}
            >
              <Stack direction="row" alignItems="center" spacing={1} sx={{ mb: theme.spacing(1) }}>
                <CareStatusChip level={topAction.status.status} />
                <Typography variant="overline">{t('overview.nextAction')}</Typography>
              </Stack>
              <Typography variant="h6" sx={{ mb: theme.spacing(1.5) }}>
                {topAction.pet.name}: {topAction.status.reasons[0]}
              </Typography>
              <Button
                variant="contained"
                color="secondary"
                endIcon={<ArrowForwardIcon />}
                onClick={() => navigate(topAction.status.recommendedAction!.route)}
              >
                {topAction.status.recommendedAction.label}
              </Button>
            </Card>
          )}

          {profiles.map((pet) => (
            <PetStatusCard
              key={pet.id}
              pet={pet}
              status={statusByPet.get(pet.id)}
              currentFood={currentFoodByPet.get(pet.id)}
              nextReminder={nextReminderByPet.get(pet.id)}
            />
          ))}
        </Stack>
      )}
    </Box>
  );
}
