import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  FormControl,
  InputLabel,
  MenuItem,
  Select,
  Stack,
  TextField,
  Typography,
} from '@mui/material';
import {
  EPISODE_OUTCOMES,
  type EpisodeOutcome,
  type EpisodeStatusUpdate,
  type HealthEpisodeRecord,
} from '../../types/healthEpisode';

interface QuickStatusUpdateDialogProps {
  open: boolean;
  episode: HealthEpisodeRecord | null;
  onClose: () => void;
  onSave: (update: EpisodeStatusUpdate) => Promise<void> | void;
}

function todayIso() {
  return new Date().toISOString().slice(0, 10);
}

export default function QuickStatusUpdateDialog({
  open,
  episode,
  onClose,
  onSave,
}: QuickStatusUpdateDialogProps) {
  const { t } = useTranslation('episodes');
  const [date, setDate] = useState(todayIso());
  const [note, setNote] = useState('');
  const [outcome, setOutcome] = useState<EpisodeOutcome | ''>('');
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (open) {
      setDate(todayIso());
      setNote('');
      setOutcome('');
    }
  }, [open]);

  const canSave = note.trim().length > 0 && !isSaving;

  const handleSave = async () => {
    if (!canSave) return;
    setIsSaving(true);
    try {
      await onSave({
        date: date || todayIso(),
        note: note.trim(),
        outcome: outcome || undefined,
        createdAt: new Date().toISOString(),
      });
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm">
      <DialogTitle>{t('quickStatus.title')}</DialogTitle>
      <DialogContent dividers>
        <Stack spacing={2} sx={{ mt: 0.5 }}>
          {episode && (
            <Typography variant="body2" color="text.secondary">
              {episode.symptomTitle}
            </Typography>
          )}
          <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
            <TextField
              label={t('form.statusUpdateDate')}
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              InputLabelProps={{ shrink: true }}
              fullWidth
            />
            <FormControl fullWidth>
              <InputLabel id="quick-status-outcome">{t('form.statusUpdateOutcome')}</InputLabel>
              <Select
                labelId="quick-status-outcome"
                label={t('form.statusUpdateOutcome')}
                value={outcome}
                onChange={(e) => setOutcome(e.target.value as EpisodeOutcome | '')}
              >
                <MenuItem value="">
                  <em>{t('form.statusUpdateOutcomeNone')}</em>
                </MenuItem>
                {EPISODE_OUTCOMES.map((o) => (
                  <MenuItem key={o} value={o}>
                    {t(`outcome.${o}` as never)}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Stack>
          <TextField
            label={t('form.statusUpdateNote')}
            placeholder={t('form.statusUpdateNotePlaceholder')}
            value={note}
            onChange={(e) => setNote(e.target.value)}
            multiline
            minRows={3}
            fullWidth
            required
          />
        </Stack>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} disabled={isSaving}>
          {t('actions.cancel', { ns: 'common' })}
        </Button>
        <Button variant="contained" onClick={() => void handleSave()} disabled={!canSave}>
          {isSaving ? t('saving', { ns: 'common' }) : t('actions.save', { ns: 'common' })}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
