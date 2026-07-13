import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Box, Chip, Stack, Typography, alpha, useTheme } from '@mui/material';
import { CalendarMonth as CalendarMonthIcon } from '@mui/icons-material';
import ProsConsCard from '../ProsConsCard';
import type { HealthEpisodeRecord } from '../../types/healthEpisode';
import type { MedicationRecord, VetVisitRecord } from '../../types/petHealth';
import { getHealthAttachmentSignedUrls } from '../../services/healthApi';
import {
  OUTCOME_CHIP_COLOR,
  formatEpisodeDate,
  sortStatusUpdatesNewestFirst,
} from '../../utils/episodeDisplay';
import { logger } from '../../utils/logger';

interface EpisodeDetailContentProps {
  episode: HealthEpisodeRecord;
  medications: MedicationRecord[];
  vetVisits: VetVisitRecord[];
}

export default function EpisodeDetailContent({
  episode,
  medications,
  vetVisits,
}: EpisodeDetailContentProps) {
  const theme = useTheme();
  const { t } = useTranslation('episodes');

  const linkedMeds = episode.medicationIds
    .map((id) => medications.find((m) => m.id === id))
    .map(
      (m, i) =>
        m ?? { id: episode.medicationIds[i], name: t('item.deletedMed'), dose: '', frequency: '' }
    );

  const linkedVisit = episode.vetVisitId
    ? vetVisits.find((v) => v.id === episode.vetVisitId)
    : undefined;

  const [signedUrls, setSignedUrls] = useState<Record<string, string>>({});

  useEffect(() => {
    const objectPaths = episode.attachments?.map((a) => a.objectPath).filter(Boolean) ?? [];
    if (objectPaths.length === 0) {
      setSignedUrls({});
      return;
    }

    let cancelled = false;
    getHealthAttachmentSignedUrls(episode.petId, objectPaths)
      .then((urls) => {
        if (!cancelled) setSignedUrls(urls);
      })
      .catch((err) => {
        logger.warn('Nepodarilo sa vytvoriť signed URL pre prílohy epizódy', {
          error: err instanceof Error ? err.message : 'unknown',
        });
      });

    return () => {
      cancelled = true;
    };
  }, [episode.attachments, episode.petId]);

  const statusUpdates = sortStatusUpdatesNewestFirst(episode.statusUpdates ?? []);

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
      {episode.symptomDescription && (
        <Typography variant="body2" sx={{ whiteSpace: 'pre-wrap' }}>
          {episode.symptomDescription}
        </Typography>
      )}

      {statusUpdates.length > 0 && (
        <Box>
          <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 1 }}>
            {t('item.statusProgressTitle')}
          </Typography>
          <Stack spacing={1}>
            {statusUpdates.map((u, i) => (
              <Box
                key={`${u.createdAt}-${i}`}
                sx={{
                  p: 1.5,
                  borderRadius: 1.5,
                  borderLeft: `3px solid ${theme.palette.primary.main}`,
                  backgroundColor: alpha(theme.palette.primary.main, 0.05),
                }}
              >
                <Stack
                  direction="row"
                  spacing={1}
                  alignItems="center"
                  flexWrap="wrap"
                  sx={{ mb: 0.5 }}
                >
                  <Box sx={{ display: 'inline-flex', alignItems: 'center', gap: 0.5 }}>
                    <CalendarMonthIcon sx={{ fontSize: 14, color: 'text.secondary' }} />
                    <Typography variant="caption" color="text.secondary">
                      {formatEpisodeDate(u.date)}
                    </Typography>
                  </Box>
                  {u.outcome && (
                    <Chip
                      size="small"
                      color={OUTCOME_CHIP_COLOR[u.outcome]}
                      label={t(`outcome.${u.outcome}` as never)}
                    />
                  )}
                </Stack>
                <Typography variant="body2" sx={{ whiteSpace: 'pre-wrap' }}>
                  {u.note}
                </Typography>
              </Box>
            ))}
          </Stack>
        </Box>
      )}

      <ProsConsCard pros={episode.whatWorked} cons={episode.whatDidntWork} />

      {episode.triggers && episode.triggers.length > 0 && (
        <Box>
          <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 0.5 }}>
            {t('form.triggers')}
          </Typography>
          <Stack direction="row" spacing={0.5} flexWrap="wrap" useFlexGap>
            {episode.triggers.map((trigger) => (
              <Chip key={trigger} size="small" label={trigger} variant="outlined" />
            ))}
          </Stack>
        </Box>
      )}

      {(episode.diagnosis || linkedVisit || linkedMeds.length > 0 || episode.treatmentNotes) && (
        <Box>
          <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 0.5 }}>
            {t('form.diagnosisTreatment')}
          </Typography>
          {episode.diagnosis && (
            <Typography variant="body2" sx={{ whiteSpace: 'pre-wrap', mb: 1 }}>
              <strong>{t('form.diagnosis')}:</strong> {episode.diagnosis}
            </Typography>
          )}
          {linkedVisit && (
            <Typography variant="body2" sx={{ mb: 1 }}>
              <strong>{t('form.vetVisit')}:</strong> {linkedVisit.clinicName}
              {linkedVisit.date ? ` (${formatEpisodeDate(linkedVisit.date)})` : ''}
            </Typography>
          )}
          {linkedMeds.length > 0 && (
            <Box sx={{ mb: 1 }}>
              <Typography variant="body2" sx={{ fontWeight: 600 }}>
                {t('item.medsUsed')}:
              </Typography>
              <Stack direction="row" spacing={0.5} flexWrap="wrap" useFlexGap sx={{ mt: 0.5 }}>
                {linkedMeds.map((m) => (
                  <Chip
                    key={m.id}
                    size="small"
                    label={m.dose ? `${m.name} (${m.dose})` : m.name}
                    color={m.name === t('item.deletedMed') ? 'default' : 'primary'}
                    variant="outlined"
                  />
                ))}
              </Stack>
            </Box>
          )}
          {episode.treatmentNotes && (
            <Typography variant="body2" sx={{ whiteSpace: 'pre-wrap' }}>
              <strong>{t('form.treatmentNotes')}:</strong> {episode.treatmentNotes}
            </Typography>
          )}
        </Box>
      )}

      {episode.lessonsLearned && (
        <Box
          sx={{
            p: 2,
            borderRadius: 2,
            backgroundColor: alpha(theme.palette.primary.main, 0.06),
            border: `1px solid ${alpha(theme.palette.primary.main, 0.2)}`,
          }}
        >
          <Typography
            variant="subtitle2"
            sx={{ fontWeight: 700, mb: 0.5, color: theme.palette.primary.main }}
          >
            {t('item.lessonsTitle')}
          </Typography>
          <Typography variant="body2" sx={{ whiteSpace: 'pre-wrap' }}>
            {episode.lessonsLearned}
          </Typography>
        </Box>
      )}

      {episode.attachments && episode.attachments.length > 0 && (
        <Box>
          <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 0.5 }}>
            {t('form.attachments')}
          </Typography>
          <Box
            sx={{
              display: 'grid',
              gap: 1,
              gridTemplateColumns: { xs: 'repeat(2, 1fr)', sm: 'repeat(2, 1fr)' },
            }}
          >
            {episode.attachments.map((a) => (
              <Box
                key={a.objectPath}
                sx={{
                  border: `1px solid ${theme.palette.divider}`,
                  borderRadius: 1.5,
                  overflow: 'hidden',
                }}
              >
                <Box
                  component="img"
                  src={signedUrls[a.objectPath] ?? ''}
                  alt={a.caption ?? t('item.attachment')}
                  sx={{ width: '100%', height: 180, objectFit: 'cover', display: 'block' }}
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
    </Box>
  );
}
