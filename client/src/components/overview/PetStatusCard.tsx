import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import {
  Avatar,
  Box,
  Button,
  Card,
  Divider,
  Stack,
  Typography,
  useTheme,
} from '@mui/material';
import { Pets as PetsIcon, Restaurant as FoodIcon, Event as EventIcon } from '@mui/icons-material';
import type { PetProfile } from '../../types';
import type { DietEntry, PetCareStatus } from '../../types/petHealth';
import type { UpcomingItem } from '../../services/notificationsApi';
import CareStatusChip from './CareStatusChip';

interface Props {
  pet: PetProfile;
  status?: PetCareStatus;
  currentFood?: DietEntry;
  nextReminder?: UpcomingItem;
}

export default function PetStatusCard({ pet, status, currentFood, nextReminder }: Props) {
  const { t } = useTranslation();
  const theme = useTheme();
  const navigate = useNavigate();
  const action = status?.recommendedAction;

  const formatDays = (days: number): string => {
    if (days < 0) return t('overview.overdue', { days: Math.abs(days) });
    if (days === 0) return t('overview.today');
    return t('overview.inDays', { days });
  };

  return (
    <Card sx={{ p: theme.spacing(2.5), display: 'flex', flexDirection: 'column', gap: theme.spacing(1.5) }}>
      <Stack direction="row" alignItems="center" spacing={1.5}>
        <Avatar src={pet.photoUrl} sx={{ bgcolor: 'primary.main', width: 48, height: 48 }}>
          {pet.photoUrl ? null : <PetsIcon />}
        </Avatar>
        <Box sx={{ flex: 1, minWidth: 0 }}>
          <Typography variant="h6" noWrap>
            {pet.name}
          </Typography>
          {pet.breed && (
            <Typography variant="body2" color="text.secondary" noWrap>
              {pet.breed}
            </Typography>
          )}
        </Box>
        {status && <CareStatusChip level={status.status} />}
      </Stack>

      {status && status.reasons.length > 0 && (
        <Stack component="ul" sx={{ m: 0, pl: theme.spacing(2.5) }} spacing={0.25}>
          {status.reasons.map((reason, i) => (
            <Typography key={i} component="li" variant="body2" color="text.secondary">
              {reason}
            </Typography>
          ))}
        </Stack>
      )}

      <Divider />

      <Stack direction="row" alignItems="center" spacing={1}>
        <FoodIcon fontSize="small" color="action" />
        <Typography variant="body2" color="text.secondary" sx={{ flexShrink: 0 }}>
          {t('overview.currentFood')}:
        </Typography>
        <Typography variant="body2" noWrap sx={{ fontWeight: 500 }}>
          {currentFood ? currentFood.foodName : t('overview.noCurrentFood')}
        </Typography>
      </Stack>

      <Stack direction="row" alignItems="center" spacing={1}>
        <EventIcon fontSize="small" color="action" />
        <Typography variant="body2" color="text.secondary" sx={{ flexShrink: 0 }}>
          {t('overview.nextReminder')}:
        </Typography>
        <Typography variant="body2" noWrap sx={{ fontWeight: 500 }}>
          {nextReminder
            ? `${nextReminder.typeLabel} — ${formatDays(nextReminder.daysUntil)}`
            : t('overview.noReminders')}
        </Typography>
      </Stack>

      {action && (
        <Button
          variant="contained"
          size="small"
          onClick={() => navigate(action.route)}
          sx={{ alignSelf: 'flex-start', mt: theme.spacing(0.5) }}
        >
          {action.label}
        </Button>
      )}
    </Card>
  );
}
