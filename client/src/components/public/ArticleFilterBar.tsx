import {
  Box,
  Button,
  FormControl,
  InputLabel,
  ListItemText,
  MenuItem,
  Paper,
  Select,
  Stack,
  Typography,
  useTheme,
} from '@mui/material';
import { Close as CloseIcon, Pets as PetsIcon, Tune as TuneIcon } from '@mui/icons-material';
import type { SelectChangeEvent } from '@mui/material';
import type { AnimalType } from '../../constants/animalSpecies';
import { CATEGORY_LABELS } from '../../content/poradna/articles';
import type { ArticleCategory } from '../../content/poradna/types';

type CategoryFilter = 'all' | ArticleCategory;
type SpeciesFilter = 'all' | AnimalType;

interface Props {
  category: CategoryFilter;
  species: SpeciesFilter;
  availableSpecies: AnimalType[];
  speciesLabels: Record<string, string>;
  resultCount: number;
  onCategoryChange: (value: CategoryFilter) => void;
  onSpeciesChange: (value: SpeciesFilter) => void;
  onReset: () => void;
}

const CATEGORY_OPTIONS: { value: CategoryFilter; label: string }[] = [
  { value: 'all', label: 'Všetky témy' },
  { value: 'krmivo', label: CATEGORY_LABELS.krmivo },
  { value: 'zdravie', label: CATEGORY_LABELS.zdravie },
];

export default function ArticleFilterBar({
  category,
  species,
  availableSpecies,
  speciesLabels,
  resultCount,
  onCategoryChange,
  onSpeciesChange,
  onReset,
}: Props) {
  const theme = useTheme();
  const isDefault = category === 'all' && species === 'all';

  const handleCategory = (event: SelectChangeEvent) => {
    onCategoryChange(event.target.value as CategoryFilter);
  };

  const handleSpecies = (event: SelectChangeEvent) => {
    onSpeciesChange(event.target.value as SpeciesFilter);
  };

  return (
    <Paper
      variant="outlined"
      sx={{
        p: { xs: theme.spacing(2), md: theme.spacing(2.5) },
        mb: theme.spacing(4),
        borderRadius: theme.spacing(2),
        bgcolor: 'background.paper',
      }}
    >
      <Stack
        direction={{ xs: 'column', md: 'row' }}
        spacing={theme.spacing(2)}
        alignItems={{ xs: 'stretch', md: 'center' }}
      >
        <FormControl size="small" sx={{ minWidth: { xs: '100%', md: 220 } }}>
          <InputLabel id="poradna-category-label">Téma</InputLabel>
          <Select
            labelId="poradna-category-label"
            id="poradna-category"
            label="Téma"
            value={category}
            onChange={handleCategory}
            startAdornment={
              <TuneIcon fontSize="small" sx={{ mr: theme.spacing(1), color: 'text.secondary' }} />
            }
          >
            {CATEGORY_OPTIONS.map((option) => (
              <MenuItem key={option.value} value={option.value}>
                {option.label}
              </MenuItem>
            ))}
          </Select>
        </FormControl>

        {availableSpecies.length > 0 && (
          <FormControl size="small" sx={{ minWidth: { xs: '100%', md: 240 } }}>
            <InputLabel id="poradna-species-label">Druh zvieraťa</InputLabel>
            <Select
              labelId="poradna-species-label"
              id="poradna-species"
              label="Druh zvieraťa"
              value={species}
              onChange={handleSpecies}
              startAdornment={
                <PetsIcon fontSize="small" sx={{ mr: theme.spacing(1), color: 'text.secondary' }} />
              }
            >
              <MenuItem value="all">Všetky druhy</MenuItem>
              {availableSpecies.map((value) => (
                <MenuItem key={value} value={value}>
                  <ListItemText primary={speciesLabels[value] ?? value} />
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        )}

        <Box sx={{ flexGrow: 1 }} />

        <Stack
          direction="row"
          spacing={theme.spacing(1.5)}
          alignItems="center"
          justifyContent={{ xs: 'space-between', md: 'flex-end' }}
        >
          <Typography variant="body2" color="text.secondary">
            {resultCount === 1 ? '1 článok' : `${resultCount} článkov`}
          </Typography>
          {!isDefault && (
            <Button
              size="small"
              variant="text"
              color="inherit"
              startIcon={<CloseIcon />}
              onClick={onReset}
              sx={{ color: 'text.secondary', flexShrink: 0 }}
            >
              Vymazať filtre
            </Button>
          )}
        </Stack>
      </Stack>
    </Paper>
  );
}
