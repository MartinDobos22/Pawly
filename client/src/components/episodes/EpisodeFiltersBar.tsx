import { useTranslation } from 'react-i18next';
import { Box, FormControl, InputLabel, MenuItem, Select, Stack, TextField } from '@mui/material';
import {
  EPISODE_CATEGORIES,
  EPISODE_OUTCOMES,
  type EpisodeCategory,
  type EpisodeOutcome,
} from '../../types/healthEpisode';

interface EpisodeFiltersBarProps {
  category: EpisodeCategory | 'all';
  outcome: EpisodeOutcome | 'all';
  query: string;
  onCategoryChange: (next: EpisodeCategory | 'all') => void;
  onOutcomeChange: (next: EpisodeOutcome | 'all') => void;
  onQueryChange: (next: string) => void;
}

export default function EpisodeFiltersBar({
  category,
  outcome,
  query,
  onCategoryChange,
  onOutcomeChange,
  onQueryChange,
}: EpisodeFiltersBarProps) {
  const { t } = useTranslation('episodes');

  return (
    <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} sx={{ mb: 2 }}>
      <FormControl size="small" sx={{ minWidth: 160 }}>
        <InputLabel id="episode-category-filter">{t('form.category')}</InputLabel>
        <Select
          labelId="episode-category-filter"
          label={t('form.category')}
          value={category}
          onChange={(e) => onCategoryChange(e.target.value as EpisodeCategory | 'all')}
        >
          <MenuItem value="all">{t('filter.all')}</MenuItem>
          {EPISODE_CATEGORIES.map((c) => (
            <MenuItem key={c} value={c}>
              {t(`category.${c}` as never)}
            </MenuItem>
          ))}
        </Select>
      </FormControl>

      <FormControl size="small" sx={{ minWidth: 160 }}>
        <InputLabel id="episode-outcome-filter">{t('form.outcome')}</InputLabel>
        <Select
          labelId="episode-outcome-filter"
          label={t('form.outcome')}
          value={outcome}
          onChange={(e) => onOutcomeChange(e.target.value as EpisodeOutcome | 'all')}
        >
          <MenuItem value="all">{t('filter.all')}</MenuItem>
          {EPISODE_OUTCOMES.map((o) => (
            <MenuItem key={o} value={o}>
              {t(`outcome.${o}` as never)}
            </MenuItem>
          ))}
        </Select>
      </FormControl>

      <Box sx={{ flex: 1 }}>
        <TextField
          fullWidth
          size="small"
          placeholder={t('filter.searchPlaceholder')}
          value={query}
          onChange={(e) => onQueryChange(e.target.value)}
        />
      </Box>
    </Stack>
  );
}
