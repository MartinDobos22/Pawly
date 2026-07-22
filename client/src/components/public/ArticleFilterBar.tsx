import {
  Box,
  Button,
  Chip,
  Divider,
  Paper,
  Stack,
  ToggleButton,
  ToggleButtonGroup,
  Typography,
  useTheme,
} from '@mui/material';
import {
  Check as CheckIcon,
  Close as CloseIcon,
  Pets as PetsIcon,
  Tune as TuneIcon,
} from '@mui/icons-material';
import type { SxProps, Theme } from '@mui/material/styles';
import type { MouseEvent } from 'react';
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
  { value: 'all', label: 'Všetko' },
  { value: 'krmivo', label: CATEGORY_LABELS.krmivo },
  { value: 'zdravie', label: CATEGORY_LABELS.zdravie },
];

function GroupLabel({ icon, children }: { icon: React.ReactNode; children: React.ReactNode }) {
  const theme = useTheme();
  return (
    <Stack direction="row" spacing={0.75} alignItems="center" sx={{ color: 'text.secondary' }}>
      <Box sx={{ display: 'inline-flex', fontSize: theme.typography.body2.fontSize }}>{icon}</Box>
      <Typography variant="caption" component="span">
        {children}
      </Typography>
    </Stack>
  );
}

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

  const handleCategory = (_event: MouseEvent<HTMLElement>, value: CategoryFilter | null) => {
    if (value !== null) onCategoryChange(value);
  };

  const speciesChipSx = (selected: boolean): SxProps<Theme> => ({
    flexShrink: 0,
    borderRadius: 999,
    fontWeight: 600,
    ...(selected
      ? {}
      : {
          bgcolor: 'transparent',
          color: 'text.secondary',
          border: `1px solid ${theme.palette.divider}`,
          '&:hover': { bgcolor: 'action.hover', color: 'text.primary' },
        }),
  });

  const segmentedSx: SxProps<Theme> = {
    maxWidth: '100%',
    overflowX: 'auto',
    bgcolor: 'background.default',
    borderRadius: 999,
    p: theme.spacing(0.5),
    scrollbarWidth: 'none',
    '&::-webkit-scrollbar': { display: 'none' },
    '& .MuiToggleButtonGroup-grouped': {
      m: 0,
      border: 0,
      borderRadius: '999px !important',
      textTransform: 'none',
      fontWeight: 600,
      fontSize: '0.82rem',
      whiteSpace: 'nowrap',
      color: 'text.secondary',
      px: theme.spacing(2),
      py: theme.spacing(0.75),
      '&:hover': { bgcolor: 'action.hover' },
      '&.Mui-selected': {
        bgcolor: 'primary.main',
        color: 'primary.contrastText',
        boxShadow: theme.shadows[1],
        '&:hover': { bgcolor: 'primary.dark' },
      },
    },
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
      <Stack spacing={theme.spacing(2)} divider={<Divider flexItem />}>
        <Stack spacing={theme.spacing(1.25)} alignItems="flex-start">
          <GroupLabel icon={<TuneIcon fontSize="inherit" />}>Téma</GroupLabel>
          <ToggleButtonGroup value={category} exclusive onChange={handleCategory} sx={segmentedSx}>
            {CATEGORY_OPTIONS.map((option) => (
              <ToggleButton key={option.value} value={option.value} disableRipple>
                {option.label}
              </ToggleButton>
            ))}
          </ToggleButtonGroup>
        </Stack>

        {availableSpecies.length > 0 && (
          <Stack spacing={theme.spacing(1.25)}>
            <GroupLabel icon={<PetsIcon fontSize="inherit" />}>Druh zvieraťa</GroupLabel>
            <Box
              sx={{
                display: 'flex',
                gap: theme.spacing(1),
                overflowX: 'auto',
                pb: theme.spacing(0.5),
                scrollbarWidth: 'none',
                '&::-webkit-scrollbar': { display: 'none' },
                maskImage:
                  'linear-gradient(to right, transparent 0, #000 16px, #000 calc(100% - 28px), transparent 100%)',
                WebkitMaskImage:
                  'linear-gradient(to right, transparent 0, #000 16px, #000 calc(100% - 28px), transparent 100%)',
              }}
            >
              <Chip
                label="Všetky druhy"
                icon={species === 'all' ? <CheckIcon /> : undefined}
                onClick={() => onSpeciesChange('all')}
                color={species === 'all' ? 'primary' : 'default'}
                variant={species === 'all' ? 'filled' : 'outlined'}
                sx={speciesChipSx(species === 'all')}
              />
              {availableSpecies.map((value) => {
                const selected = species === value;
                return (
                  <Chip
                    key={value}
                    label={speciesLabels[value] ?? value}
                    icon={selected ? <CheckIcon /> : undefined}
                    onClick={() => onSpeciesChange(value)}
                    color={selected ? 'primary' : 'default'}
                    variant={selected ? 'filled' : 'outlined'}
                    sx={speciesChipSx(selected)}
                  />
                );
              })}
            </Box>
          </Stack>
        )}

        <Stack
          direction="row"
          spacing={theme.spacing(1)}
          alignItems="center"
          justifyContent="space-between"
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
              sx={{ color: 'text.secondary' }}
            >
              Vymazať filtre
            </Button>
          )}
        </Stack>
      </Stack>
    </Paper>
  );
}
