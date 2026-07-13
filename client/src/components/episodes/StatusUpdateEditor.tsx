import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  Box,
  Chip,
  FormControl,
  IconButton,
  InputLabel,
  MenuItem,
  Select,
  Stack,
  TextField,
  Typography,
  useTheme,
} from '@mui/material';
import { Add as AddIcon, DeleteOutline as DeleteIcon } from '@mui/icons-material';
import {
  EPISODE_OUTCOMES,
  type EpisodeOutcome,
  type EpisodeStatusUpdate,
} from '../../types/healthEpisode';
import {
  OUTCOME_CHIP_COLOR,
  formatEpisodeDate,
  sortStatusUpdatesNewestFirst,
} from '../../utils/episodeDisplay';

interface StatusUpdateEditorProps {
  values: EpisodeStatusUpdate[];
  onChange: (next: EpisodeStatusUpdate[]) => void;
}

function todayIso() {
  return new Date().toISOString().slice(0, 10);
}

export default function StatusUpdateEditor({ values, onChange }: StatusUpdateEditorProps) {
  const theme = useTheme();
  const { t } = useTranslation('episodes');
  const [date, setDate] = useState(todayIso());
  const [note, setNote] = useState('');
  const [outcome, setOutcome] = useState<EpisodeOutcome | ''>('');

  const canAdd = note.trim().length > 0;

  const handleAdd = () => {
    if (!canAdd) return;
    const entry: EpisodeStatusUpdate = {
      date: date || todayIso(),
      note: note.trim(),
      outcome: outcome || undefined,
      createdAt: new Date().toISOString(),
    };
    onChange([...values, entry]);
    setDate(todayIso());
    setNote('');
    setOutcome('');
  };

  const handleRemove = (target: EpisodeStatusUpdate) => {
    onChange(values.filter((u) => u !== target));
  };

  const sorted = sortStatusUpdatesNewestFirst(values);

  return (
    <Stack spacing={1.5}>
      {sorted.length > 0 && (
        <Stack spacing={1}>
          {sorted.map((u, i) => (
            <Box
              key={`${u.createdAt}-${i}`}
              sx={{
                display: 'flex',
                alignItems: 'flex-start',
                gap: 1,
                p: 1.5,
                borderRadius: 1.5,
                border: `1px solid ${theme.palette.divider}`,
              }}
            >
              <Box sx={{ flex: 1 }}>
                <Stack
                  direction="row"
                  spacing={1}
                  alignItems="center"
                  sx={{ mb: 0.5 }}
                  flexWrap="wrap"
                >
                  <Typography variant="caption" color="text.secondary">
                    {formatEpisodeDate(u.date)}
                  </Typography>
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
              <IconButton
                size="small"
                onClick={() => handleRemove(u)}
                aria-label={t('form.removeStatusUpdate')}
                color="error"
              >
                <DeleteIcon fontSize="small" />
              </IconButton>
            </Box>
          ))}
        </Stack>
      )}

      <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1.5} alignItems="flex-start">
        <TextField
          label={t('form.statusUpdateDate')}
          type="date"
          size="small"
          value={date}
          onChange={(e) => setDate(e.target.value)}
          InputLabelProps={{ shrink: true }}
          sx={{ minWidth: 160 }}
        />
        <FormControl size="small" sx={{ minWidth: 180 }}>
          <InputLabel id="status-update-outcome">{t('form.statusUpdateOutcome')}</InputLabel>
          <Select
            labelId="status-update-outcome"
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
      <Box sx={{ display: 'flex', gap: 1, alignItems: 'flex-start' }}>
        <TextField
          fullWidth
          size="small"
          multiline
          label={t('form.statusUpdateNote')}
          placeholder={t('form.statusUpdateNotePlaceholder')}
          value={note}
          onChange={(e) => setNote(e.target.value)}
        />
        <IconButton
          onClick={handleAdd}
          disabled={!canAdd}
          color="primary"
          aria-label={t('form.addStatusUpdate')}
        >
          <AddIcon />
        </IconButton>
      </Box>
    </Stack>
  );
}
