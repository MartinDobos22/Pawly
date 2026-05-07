import { useEffect, useState } from 'react';
import {
  Alert,
  Box,
  Button,
  Chip,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Divider,
  Stack,
  Typography,
} from '@mui/material';
import AiFormattedText from '../AiFormattedText';
import {
  EPISODE_CATEGORY_LABEL,
  EPISODE_OUTCOME_LABEL,
  type HealthEpisodeRecord,
  type SimilarEpisodeSummary,
} from '../../types/healthEpisode';
import { fetchSimilarEpisodeSummary } from '../../services/api';
import { logger } from '../../utils/logger';

interface SimilarEpisodesDialogProps {
  open: boolean;
  currentEpisode: HealthEpisodeRecord | null;
  pastEpisodes: HealthEpisodeRecord[];
  onClose: () => void;
  onOpenEpisode?: (id: string) => void;
}

interface State {
  status: 'idle' | 'loading' | 'success' | 'error';
  result?: SimilarEpisodeSummary;
  error?: string;
}

function localFallback(
  current: HealthEpisodeRecord,
  past: HealthEpisodeRecord[]
): HealthEpisodeRecord[] {
  return past
    .filter((e) => e.id !== current.id && e.category === current.category)
    .sort((a, b) => (b.startedAt || b.createdAt).localeCompare(a.startedAt || a.createdAt))
    .slice(0, 5);
}

export default function SimilarEpisodesDialog({
  open,
  currentEpisode,
  pastEpisodes,
  onClose,
  onOpenEpisode,
}: SimilarEpisodesDialogProps) {
  const [state, setState] = useState<State>({ status: 'idle' });

  useEffect(() => {
    if (!open || !currentEpisode) {
      setState({ status: 'idle' });
      return;
    }

    let cancelled = false;
    setState({ status: 'loading' });

    fetchSimilarEpisodeSummary(
      {
        symptomTitle: currentEpisode.symptomTitle,
        symptomDescription: currentEpisode.symptomDescription,
        category: currentEpisode.category,
      },
      pastEpisodes.filter((e) => e.id !== currentEpisode.id)
    )
      .then((result) => {
        if (cancelled) return;
        const whitelist = new Set(pastEpisodes.map((e) => e.id));
        const filteredIds = result.similarEpisodeIds.filter((id) => whitelist.has(id));
        setState({
          status: 'success',
          result: { ...result, similarEpisodeIds: filteredIds },
        });
      })
      .catch((err: unknown) => {
        if (cancelled) return;
        const message = err instanceof Error ? err.message : 'Neznáma chyba';
        logger.warn('AI sumarizácia podobných epizód zlyhala', { error: message });
        setState({ status: 'error', error: message });
      });

    return () => {
      cancelled = true;
    };
  }, [open, currentEpisode, pastEpisodes]);

  const fallback = currentEpisode ? localFallback(currentEpisode, pastEpisodes) : [];

  const renderSimilarList = (ids: string[]) => {
    const matched = ids
      .map((id) => pastEpisodes.find((e) => e.id === id))
      .filter((e): e is HealthEpisodeRecord => Boolean(e));
    if (matched.length === 0) return null;

    return (
      <Box>
        <Typography variant="subtitle2" sx={{ fontWeight: 700, mb: 1 }}>
          Podobné epizódy v minulosti
        </Typography>
        <Stack spacing={1}>
          {matched.map((e) => (
            <Box
              key={e.id}
              sx={{
                p: 1.5,
                border: (theme) => `1px solid ${theme.palette.divider}`,
                borderRadius: 1.5,
                cursor: onOpenEpisode ? 'pointer' : 'default',
              }}
              onClick={() => onOpenEpisode?.(e.id)}
            >
              <Stack
                direction="row"
                spacing={1}
                alignItems="center"
                sx={{ mb: 0.5, flexWrap: 'wrap' }}
              >
                <Typography variant="body2" sx={{ fontWeight: 600 }}>
                  {e.symptomTitle}
                </Typography>
                <Chip size="small" label={EPISODE_CATEGORY_LABEL[e.category]} variant="outlined" />
                <Chip size="small" label={EPISODE_OUTCOME_LABEL[e.outcome]} />
              </Stack>
              {e.whatWorked.length > 0 && (
                <Typography variant="caption" color="text.secondary">
                  Zabralo: {e.whatWorked.join(', ')}
                </Typography>
              )}
            </Box>
          ))}
        </Stack>
      </Box>
    );
  };

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm">
      <DialogTitle>Podobné epizódy z minulosti</DialogTitle>
      <DialogContent dividers>
        {!currentEpisode ? (
          <Typography variant="body2">Žiadna epizóda nie je vybraná.</Typography>
        ) : state.status === 'loading' ? (
          <Stack alignItems="center" spacing={2} sx={{ py: 4 }}>
            <CircularProgress size={32} />
            <Typography variant="body2" color="text.secondary">
              Hľadám podobné epizódy a sumarizujem...
            </Typography>
          </Stack>
        ) : state.status === 'success' && state.result ? (
          <Stack spacing={2}>
            {state.result.summary && (
              <Box>
                <Typography variant="subtitle2" sx={{ fontWeight: 700, mb: 0.5 }}>
                  Zhrnutie
                </Typography>
                <AiFormattedText text={state.result.summary} />
              </Box>
            )}
            {state.result.recommendation && (
              <Box>
                <Typography variant="subtitle2" sx={{ fontWeight: 700, mb: 0.5 }}>
                  Odporúčanie
                </Typography>
                <AiFormattedText text={state.result.recommendation} />
              </Box>
            )}
            {state.result.similarEpisodeIds.length > 0 && (
              <>
                <Divider />
                {renderSimilarList(state.result.similarEpisodeIds)}
              </>
            )}
            {state.result.similarEpisodeIds.length === 0 && fallback.length === 0 && (
              <Alert severity="info">
                Zatiaľ neexistujú žiadne podobné epizódy v histórii. Pri závažnejšom stave
                konzultujte veterinára.
              </Alert>
            )}
          </Stack>
        ) : (
          <Stack spacing={2}>
            <Alert severity="warning">
              AI sumarizáciu sa nepodarilo načítať: {state.error ?? 'neznáma chyba'}. Zobrazujem
              aspoň lokálne podobné epizódy podľa kategórie.
            </Alert>
            {fallback.length > 0 ? (
              renderSimilarList(fallback.map((e) => e.id))
            ) : (
              <Typography variant="body2" color="text.secondary">
                V histórii nie sú žiadne epizódy v rovnakej kategórii.
              </Typography>
            )}
          </Stack>
        )}
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Zavrieť</Button>
      </DialogActions>
    </Dialog>
  );
}
