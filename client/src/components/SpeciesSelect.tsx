import { useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  Box,
  IconButton,
  InputAdornment,
  List,
  ListItemButton,
  ListItemText,
  Popover,
  Stack,
  TextField,
  Typography,
} from '@mui/material';
import {
  ArrowDropDown as ArrowDropDownIcon,
  Check as CheckIcon,
  ChevronLeft as ChevronLeftIcon,
  ChevronRight as ChevronRightIcon,
  Search as SearchIcon,
} from '@mui/icons-material';
import { ANIMAL_SPECIES, SPECIES_PAGE_SIZE } from '../constants/animalSpecies';
import type { AnimalType } from '../types';

interface Props {
  value: AnimalType;
  onChange: (value: AnimalType) => void;
  label: string;
  pageSize?: number;
}

export default function SpeciesSelect({
  value,
  onChange,
  label,
  pageSize = SPECIES_PAGE_SIZE,
}: Props) {
  const { t } = useTranslation('healthPassport');
  const speciesLabels = t('profiles.species', { returnObjects: true }) as Record<string, string>;

  const [anchorEl, setAnchorEl] = useState<HTMLElement | null>(null);
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(0);

  const items = useMemo(
    () => ANIMAL_SPECIES.map((key) => ({ key, label: speciesLabels[key] ?? key })),
    [speciesLabels]
  );

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return items;
    return items.filter((it) => it.label.toLowerCase().includes(q));
  }, [items, search]);

  const pageCount = Math.max(1, Math.ceil(filtered.length / pageSize));
  const safePage = Math.min(page, pageCount - 1);
  const pageItems = filtered.slice(safePage * pageSize, safePage * pageSize + pageSize);

  const selectedLabel = speciesLabels[value] ?? value;
  const open = Boolean(anchorEl);

  const handleOpen = (e: React.MouseEvent<HTMLElement>) => {
    setSearch('');
    setPage(0);
    setAnchorEl(e.currentTarget);
  };
  const handleClose = () => setAnchorEl(null);
  const handleSelect = (key: string) => {
    onChange(key as AnimalType);
    handleClose();
  };

  return (
    <>
      <TextField
        label={label}
        value={selectedLabel}
        onClick={handleOpen}
        fullWidth
        InputProps={{
          readOnly: true,
          sx: { cursor: 'pointer' },
          endAdornment: (
            <InputAdornment position="end">
              <ArrowDropDownIcon color="action" />
            </InputAdornment>
          ),
        }}
        inputProps={{ sx: { cursor: 'pointer' } }}
      />

      <Popover
        open={open}
        anchorEl={anchorEl}
        onClose={handleClose}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'left' }}
        transformOrigin={{ vertical: 'top', horizontal: 'left' }}
        slotProps={{
          paper: {
            sx: {
              mt: 1,
              width: anchorEl ? anchorEl.clientWidth : 320,
              borderRadius: 2,
            },
          },
        }}
      >
        <Box sx={{ p: 1.5, pb: 1 }}>
          <TextField
            autoFocus
            fullWidth
            size="small"
            placeholder={t('profiles.speciesSearch')}
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(0);
            }}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon fontSize="small" color="action" />
                </InputAdornment>
              ),
            }}
          />
        </Box>

        {pageItems.length === 0 ? (
          <Box sx={{ px: 2, py: 2 }}>
            <Typography variant="body2" color="text.secondary">
              {t('profiles.speciesNoResults')}
            </Typography>
          </Box>
        ) : (
          <List dense disablePadding>
            {pageItems.map((it) => (
              <ListItemButton
                key={it.key}
                selected={it.key === value}
                onClick={() => handleSelect(it.key)}
              >
                <ListItemText primary={it.label} />
                {it.key === value && <CheckIcon fontSize="small" color="primary" />}
              </ListItemButton>
            ))}
          </List>
        )}

        {pageCount > 1 && (
          <Stack
            direction="row"
            alignItems="center"
            justifyContent="space-between"
            sx={{ px: 1, py: 0.5, borderTop: (theme) => `1px solid ${theme.palette.divider}` }}
          >
            <IconButton
              size="small"
              aria-label={t('profiles.speciesPrevPage')}
              disabled={safePage === 0}
              onClick={() => setPage((p) => Math.max(0, p - 1))}
            >
              <ChevronLeftIcon />
            </IconButton>
            <Typography variant="caption" color="text.secondary">
              {t('profiles.speciesPageOf', { page: safePage + 1, total: pageCount })}
            </Typography>
            <IconButton
              size="small"
              aria-label={t('profiles.speciesNextPage')}
              disabled={safePage >= pageCount - 1}
              onClick={() => setPage((p) => Math.min(pageCount - 1, p + 1))}
            >
              <ChevronRightIcon />
            </IconButton>
          </Stack>
        )}
      </Popover>
    </>
  );
}
