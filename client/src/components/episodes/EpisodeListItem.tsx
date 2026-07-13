import { useTranslation } from 'react-i18next';
import {
  Accordion,
  AccordionDetails,
  AccordionSummary,
  Box,
  Button,
  Chip,
  Divider,
  IconButton,
  Stack,
  Typography,
  useTheme,
} from '@mui/material';
import {
  ExpandMore as ExpandMoreIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  AutoAwesome as AutoAwesomeIcon,
  PlaceOutlined as PlaceIcon,
  CalendarMonth as CalendarMonthIcon,
  Timeline as TimelineIcon,
  Article as ArticleIcon,
} from '@mui/icons-material';
import EpisodeDetailContent from './EpisodeDetailContent';
import { type HealthEpisodeRecord } from '../../types/healthEpisode';
import type { MedicationRecord, VetVisitRecord } from '../../types/petHealth';
import {
  OUTCOME_CHIP_COLOR,
  SEVERITY_CHIP_COLOR,
  formatEpisodeDate,
} from '../../utils/episodeDisplay';

interface EpisodeListItemProps {
  episode: HealthEpisodeRecord;
  expanded: boolean;
  onToggle: () => void;
  onEdit: () => void;
  onDelete: () => void;
  onFindSimilar: () => void;
  onViewFull: () => void;
  onQuickStatus: () => void;
  medications: MedicationRecord[];
  vetVisits: VetVisitRecord[];
}

export default function EpisodeListItem({
  episode,
  expanded,
  onToggle,
  onEdit,
  onDelete,
  onFindSimilar,
  onViewFull,
  onQuickStatus,
  medications,
  vetVisits,
}: EpisodeListItemProps) {
  const theme = useTheme();
  const { t } = useTranslation('episodes');

  return (
    <Accordion
      id={`episode-${episode.id}`}
      expanded={expanded}
      onChange={onToggle}
      sx={{
        mb: 1.5,
        borderRadius: '8px !important',
        '&:before': { display: 'none' },
        boxShadow: theme.shadows[1],
      }}
    >
      <AccordionSummary expandIcon={<ExpandMoreIcon />}>
        <Box
          sx={{ display: 'flex', alignItems: 'center', gap: 2, flex: 1, mr: 1, flexWrap: 'wrap' }}
        >
          <Box sx={{ flex: 1, minWidth: 200 }}>
            <Stack
              direction="row"
              spacing={1}
              alignItems="center"
              sx={{ mb: 0.5, flexWrap: 'wrap' }}
            >
              <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>
                {episode.symptomTitle}
              </Typography>
              <Chip
                size="small"
                label={t(`category.${episode.category}` as never)}
                variant="outlined"
              />
            </Stack>
            <Stack
              direction="row"
              spacing={1}
              alignItems="center"
              flexWrap="wrap"
              sx={{ rowGap: 0.5 }}
            >
              <Box sx={{ display: 'inline-flex', alignItems: 'center', gap: 0.5 }}>
                <CalendarMonthIcon sx={{ fontSize: 14, color: 'text.secondary' }} />
                <Typography variant="caption" color="text.secondary">
                  {formatEpisodeDate(episode.startedAt)}
                  {episode.endedAt ? ` – ${formatEpisodeDate(episode.endedAt)}` : ''}
                </Typography>
              </Box>
              {episode.location && (
                <Box sx={{ display: 'inline-flex', alignItems: 'center', gap: 0.5 }}>
                  <PlaceIcon sx={{ fontSize: 14, color: 'text.secondary' }} />
                  <Typography variant="caption" color="text.secondary">
                    {episode.location}
                  </Typography>
                </Box>
              )}
            </Stack>
          </Box>
          <Stack direction="row" spacing={0.75}>
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
        </Box>
      </AccordionSummary>
      <AccordionDetails sx={{ pt: 0, display: 'flex', flexDirection: 'column', gap: 2 }}>
        <EpisodeDetailContent episode={episode} medications={medications} vetVisits={vetVisits} />

        <Divider />

        <Box sx={{ display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: 1 }}>
          <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
            <Button
              size="small"
              variant="outlined"
              startIcon={<ArticleIcon />}
              onClick={onViewFull}
            >
              {t('item.viewFull')}
            </Button>
            <Button
              size="small"
              variant="outlined"
              startIcon={<TimelineIcon />}
              onClick={onQuickStatus}
            >
              {t('item.quickStatusUpdate')}
            </Button>
            <Button
              size="small"
              variant="outlined"
              startIcon={<AutoAwesomeIcon />}
              onClick={onFindSimilar}
            >
              {t('similar.findSimilar')}
            </Button>
          </Stack>
          <Stack direction="row" spacing={0.5}>
            <IconButton
              size="small"
              onClick={onEdit}
              aria-label={t('actions.edit', { ns: 'common' })}
            >
              <EditIcon fontSize="small" />
            </IconButton>
            <IconButton
              size="small"
              onClick={onDelete}
              aria-label={t('actions.delete', { ns: 'common' })}
              color="error"
            >
              <DeleteIcon fontSize="small" />
            </IconButton>
          </Stack>
        </Box>
      </AccordionDetails>
    </Accordion>
  );
}
