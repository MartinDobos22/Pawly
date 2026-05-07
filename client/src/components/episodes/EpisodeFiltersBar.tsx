import { Box, FormControl, InputLabel, MenuItem, Select, Stack, TextField } from '@mui/material';
import {
  EPISODE_CATEGORIES,
  EPISODE_CATEGORY_LABEL,
  EPISODE_OUTCOMES,
  EPISODE_OUTCOME_LABEL,
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
  return (
    <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} sx={{ mb: 2 }}>
      <FormControl size="small" sx={{ minWidth: 160 }}>
        <InputLabel id="episode-category-filter">Kategória</InputLabel>
        <Select
          labelId="episode-category-filter"
          label="Kategória"
          value={category}
          onChange={(e) => onCategoryChange(e.target.value as EpisodeCategory | 'all')}
        >
          <MenuItem value="all">Všetky</MenuItem>
          {EPISODE_CATEGORIES.map((c) => (
            <MenuItem key={c} value={c}>
              {EPISODE_CATEGORY_LABEL[c]}
            </MenuItem>
          ))}
        </Select>
      </FormControl>

      <FormControl size="small" sx={{ minWidth: 160 }}>
        <InputLabel id="episode-outcome-filter">Stav</InputLabel>
        <Select
          labelId="episode-outcome-filter"
          label="Stav"
          value={outcome}
          onChange={(e) => onOutcomeChange(e.target.value as EpisodeOutcome | 'all')}
        >
          <MenuItem value="all">Všetky</MenuItem>
          {EPISODE_OUTCOMES.map((o) => (
            <MenuItem key={o} value={o}>
              {EPISODE_OUTCOME_LABEL[o]}
            </MenuItem>
          ))}
        </Select>
      </FormControl>

      <Box sx={{ flex: 1 }}>
        <TextField
          fullWidth
          size="small"
          placeholder="Hľadať v symptómoch, lekárstve, poznámkach..."
          value={query}
          onChange={(e) => onQueryChange(e.target.value)}
        />
      </Box>
    </Stack>
  );
}
