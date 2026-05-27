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
} from '@mui/icons-material';
import ProsConsCard from '../ProsConsCard';
import {
  EPISODE_CATEGORY_LABEL,
  EPISODE_OUTCOME_LABEL,
  EPISODE_SEVERITY_LABEL,
  type EpisodeOutcome,
  type EpisodeSeverity,
  type HealthEpisodeRecord,
} from '../../types/healthEpisode';
import type { MedicationRecord, VetVisitRecord } from '../../types/dogHealth';

interface EpisodeListItemProps {
  episode: HealthEpisodeRecord;
  expanded: boolean;
  onToggle: () => void;
  onEdit: () => void;
  onDelete: () => void;
  onFindSimilar: () => void;
  medications: MedicationRecord[];
  vetVisits: VetVisitRecord[];
}

const OUTCOME_CHIP_COLOR: Record<EpisodeOutcome, 'success' | 'warning' | 'error'> = {
  resolved: 'success',
  ongoing: 'warning',
  recurring: 'error',
};

const SEVERITY_CHIP_COLOR: Record<EpisodeSeverity, 'info' | 'warning' | 'error'> = {
  mild: 'info',
  moderate: 'warning',
  severe: 'error',
};

function formatDate(iso: string | undefined) {
  if (!iso) return '';
  return new Date(iso).toLocaleDateString('sk-SK', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });
}

export default function EpisodeListItem({
  episode,
  expanded,
  onToggle,
  onEdit,
  onDelete,
  onFindSimilar,
  medications,
  vetVisits,
}: EpisodeListItemProps) {
  const theme = useTheme();

  const linkedMeds = episode.medicationIds
    .map((id) => medications.find((m) => m.id === id))
    .map(
      (m, i) =>
        m ?? { id: episode.medicationIds[i], name: 'Liek bol vymazaný', dose: '', frequency: '' }
    );

  const linkedVisit = episode.vetVisitId
    ? vetVisits.find((v) => v.id === episode.vetVisitId)
    : undefined;

  return (
    <Accordion
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
                label={EPISODE_CATEGORY_LABEL[episode.category]}
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
                  {formatDate(episode.startedAt)}
                  {episode.endedAt ? ` – ${formatDate(episode.endedAt)}` : ''}
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
              label={EPISODE_SEVERITY_LABEL[episode.severity]}
            />
            <Chip
              size="small"
              color={OUTCOME_CHIP_COLOR[episode.outcome]}
              label={EPISODE_OUTCOME_LABEL[episode.outcome]}
            />
          </Stack>
        </Box>
      </AccordionSummary>
      <AccordionDetails sx={{ pt: 0, display: 'flex', flexDirection: 'column', gap: 2 }}>
        <Typography variant="body2" sx={{ whiteSpace: 'pre-wrap' }}>
          {episode.symptomDescription}
        </Typography>

        {episode.triggers && episode.triggers.length > 0 && (
          <Box>
            <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 0.5 }}>
              Spúšťače
            </Typography>
            <Stack direction="row" spacing={0.5} flexWrap="wrap" useFlexGap>
              {episode.triggers.map((t) => (
                <Chip key={t} size="small" label={t} variant="outlined" />
              ))}
            </Stack>
          </Box>
        )}

        {(episode.diagnosis || linkedVisit || linkedMeds.length > 0 || episode.treatmentNotes) && (
          <Box>
            <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 0.5 }}>
              Diagnóza a liečba
            </Typography>
            {episode.diagnosis && (
              <Typography variant="body2" sx={{ whiteSpace: 'pre-wrap', mb: 1 }}>
                <strong>Diagnóza:</strong> {episode.diagnosis}
              </Typography>
            )}
            {linkedVisit && (
              <Typography variant="body2" sx={{ mb: 1 }}>
                <strong>Návšteva veterinára:</strong> {linkedVisit.clinicName}
                {linkedVisit.date ? ` (${formatDate(linkedVisit.date)})` : ''}
              </Typography>
            )}
            {linkedMeds.length > 0 && (
              <Box sx={{ mb: 1 }}>
                <Typography variant="body2" sx={{ fontWeight: 600 }}>
                  Použité lieky:
                </Typography>
                <Stack direction="row" spacing={0.5} flexWrap="wrap" useFlexGap sx={{ mt: 0.5 }}>
                  {linkedMeds.map((m) => (
                    <Chip
                      key={m.id}
                      size="small"
                      label={m.dose ? `${m.name} (${m.dose})` : m.name}
                      color={m.name === 'Liek bol vymazaný' ? 'default' : 'primary'}
                      variant="outlined"
                    />
                  ))}
                </Stack>
              </Box>
            )}
            {episode.treatmentNotes && (
              <Typography variant="body2" sx={{ whiteSpace: 'pre-wrap' }}>
                <strong>Poznámky k liečbe:</strong> {episode.treatmentNotes}
              </Typography>
            )}
          </Box>
        )}

        <ProsConsCard pros={episode.whatWorked} cons={episode.whatDidntWork} />

        {episode.lessonsLearned && (
          <Box
            sx={{
              p: 2,
              borderRadius: 2,
              backgroundColor: theme.palette.primary.main + '0F',
              border: `1px solid ${theme.palette.primary.main}33`,
            }}
          >
            <Typography
              variant="subtitle2"
              sx={{ fontWeight: 700, mb: 0.5, color: theme.palette.primary.main }}
            >
              Poučenie pre budúcnosť
            </Typography>
            <Typography variant="body2" sx={{ whiteSpace: 'pre-wrap' }}>
              {episode.lessonsLearned}
            </Typography>
          </Box>
        )}

        {episode.attachments && episode.attachments.length > 0 && (
          <Box>
            <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 0.5 }}>
              Prílohy
            </Typography>
            <Box
              sx={{
                display: 'grid',
                gap: 1,
                gridTemplateColumns: { xs: 'repeat(2, 1fr)', sm: 'repeat(3, 1fr)' },
              }}
            >
              {episode.attachments.map((a) => (
                <Box
                  key={a.id}
                  sx={{
                    border: `1px solid ${theme.palette.divider}`,
                    borderRadius: 1.5,
                    overflow: 'hidden',
                  }}
                >
                  <Box
                    component="img"
                    src={a.dataUrl}
                    alt={a.caption ?? 'Príloha'}
                    sx={{ width: '100%', height: 100, objectFit: 'cover', display: 'block' }}
                  />
                  {a.caption && (
                    <Typography variant="caption" sx={{ p: 0.5, display: 'block' }}>
                      {a.caption}
                    </Typography>
                  )}
                </Box>
              ))}
            </Box>
          </Box>
        )}

        <Divider />

        <Box sx={{ display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: 1 }}>
          <Button
            size="small"
            variant="outlined"
            startIcon={<AutoAwesomeIcon />}
            onClick={onFindSimilar}
          >
            Nájsť podobné z minulosti
          </Button>
          <Stack direction="row" spacing={0.5}>
            <IconButton size="small" onClick={onEdit} aria-label="Upraviť">
              <EditIcon fontSize="small" />
            </IconButton>
            <IconButton size="small" onClick={onDelete} aria-label="Zmazať" color="error">
              <DeleteIcon fontSize="small" />
            </IconButton>
          </Stack>
        </Box>
      </AccordionDetails>
    </Accordion>
  );
}
