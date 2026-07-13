import { useTranslation } from 'react-i18next';
import {
  Box,
  Button,
  Chip,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Stack,
  Typography,
  useMediaQuery,
  useTheme,
} from '@mui/material';
import { Edit as EditIcon } from '@mui/icons-material';
import EpisodeDetailContent from './EpisodeDetailContent';
import type { HealthEpisodeRecord } from '../../types/healthEpisode';
import type { MedicationRecord, VetVisitRecord } from '../../types/petHealth';
import {
  OUTCOME_CHIP_COLOR,
  SEVERITY_CHIP_COLOR,
  formatEpisodeDate,
} from '../../utils/episodeDisplay';

interface EpisodeDetailDialogProps {
  open: boolean;
  episode: HealthEpisodeRecord | null;
  medications: MedicationRecord[];
  vetVisits: VetVisitRecord[];
  onClose: () => void;
  onEdit: () => void;
}

export default function EpisodeDetailDialog({
  open,
  episode,
  medications,
  vetVisits,
  onClose,
  onEdit,
}: EpisodeDetailDialogProps) {
  const theme = useTheme();
  const fullScreen = useMediaQuery(theme.breakpoints.down('sm'));
  const { t } = useTranslation('episodes');

  if (!episode) return null;

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="md" fullScreen={fullScreen}>
      <DialogTitle sx={{ pb: 1 }}>
        <Stack direction="row" spacing={1} alignItems="center" flexWrap="wrap" sx={{ rowGap: 0.5 }}>
          <Typography variant="h6" sx={{ fontWeight: 700 }}>
            {episode.symptomTitle}
          </Typography>
          <Chip
            size="small"
            label={t(`category.${episode.category}` as never)}
            variant="outlined"
          />
          <Chip
            size="small"
            color={SEVERITY_CHIP_COLOR[episode.severity]}
            label={t(`severity.${episode.severity}` as never)}
          />
          <Chip
            size="small"
            color={OUTCOME_CHIP_COLOR[episode.outcome]}
            label={t(`outcome.${episode.outcome}` as never)}
          />
        </Stack>
        <Box sx={{ mt: 0.5 }}>
          <Typography variant="caption" color="text.secondary">
            {t('form.startedAt')}: {formatEpisodeDate(episode.startedAt)}
            {episode.endedAt ? ` – ${formatEpisodeDate(episode.endedAt)}` : ''}
            {episode.createdAt
              ? ` · ${t('form.recordedOn')}: ${formatEpisodeDate(episode.createdAt)}`
              : ''}
          </Typography>
        </Box>
      </DialogTitle>
      <DialogContent dividers>
        <EpisodeDetailContent episode={episode} medications={medications} vetVisits={vetVisits} />
      </DialogContent>
      <DialogActions>
        <Button startIcon={<EditIcon />} onClick={onEdit}>
          {t('actions.edit', { ns: 'common' })}
        </Button>
        <Button variant="contained" onClick={onClose}>
          {t('actions.close', { ns: 'common' })}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
