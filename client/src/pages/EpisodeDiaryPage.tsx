import { useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  FormControl,
  InputLabel,
  MenuItem,
  Select,
  Stack,
  Typography,
} from '@mui/material';
import {
  Add as AddIcon,
  MenuBook as MenuBookIcon,
  EventBusy as EventBusyIcon,
  Pets as PetsIcon,
} from '@mui/icons-material';
import EmptyState from '../components/EmptyState';
import EpisodeFiltersBar from '../components/episodes/EpisodeFiltersBar';
import EpisodeListItem from '../components/episodes/EpisodeListItem';
import EpisodeFormDialog from '../components/episodes/EpisodeFormDialog';
import SimilarEpisodesDialog from '../components/episodes/SimilarEpisodesDialog';
import { useHealthEpisodes } from '../hooks/useHealthEpisodes';
import { useEpisodeStorageSize } from '../hooks/useEpisodeStorageSize';
import { usePetProfiles } from '../hooks/usePetProfiles';
import { useHealthData } from '../hooks/useHealthData';
import { filterEpisodes, sortEpisodesNewestFirst } from '../utils/episodeFilters';
import type { EpisodeCategory, EpisodeOutcome, HealthEpisodeRecord } from '../types/healthEpisode';

export default function EpisodeDiaryPage() {
  const { t } = useTranslation('episodes');
  const navigate = useNavigate();

  const { profiles, loading: petsLoading } = usePetProfiles();
  const dogProfiles = useMemo(() => profiles.filter((p) => p.animalType === 'dog'), [profiles]);

  const [selectedDogId, setSelectedDogId] = useState<string>(dogProfiles[0]?.id ?? '');
  const { medications, visits: vetVisits } = useHealthData();

  const { episodes, byDog, add, update, remove } = useHealthEpisodes();
  const dogEpisodes = byDog(selectedDogId);
  const storage = useEpisodeStorageSize(episodes);

  const [categoryFilter, setCategoryFilter] = useState<EpisodeCategory | 'all'>('all');
  const [outcomeFilter, setOutcomeFilter] = useState<EpisodeOutcome | 'all'>('all');
  const [query, setQuery] = useState('');
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<HealthEpisodeRecord | undefined>(undefined);
  const [similarFor, setSimilarFor] = useState<HealthEpisodeRecord | null>(null);

  const filtered = useMemo(
    () =>
      sortEpisodesNewestFirst(
        filterEpisodes(dogEpisodes, {
          category: categoryFilter,
          outcome: outcomeFilter,
          query,
        })
      ),
    [dogEpisodes, categoryFilter, outcomeFilter, query]
  );

  if (petsLoading) return null;
  if (dogProfiles.length === 0) {
    return (
      <Box sx={{ textAlign: 'center', py: 8 }}>
        <PetsIcon sx={{ fontSize: 80, color: 'text.secondary', opacity: 0.4, mb: 2 }} />
        <Typography variant="h5" sx={{ fontWeight: 600, mb: 1 }}>
          {t('page.noPetsTitle')}
        </Typography>
        <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
          {t('page.noPetsDescription')}
        </Typography>
        <Button variant="contained" onClick={() => navigate('/profily')}>
          {t('page.createProfile')}
        </Button>
      </Box>
    );
  }

  const handleSave = async (
    payload: Omit<HealthEpisodeRecord, 'id' | 'createdAt' | 'updatedAt'>,
    id?: string
  ) => {
    if (id) {
      await update(id, payload);
    } else {
      await add(payload);
    }
    setFormOpen(false);
    setEditing(undefined);
  };

  const handleEdit = (episode: HealthEpisodeRecord) => {
    setEditing(episode);
    setFormOpen(true);
  };

  const handleDelete = (episode: HealthEpisodeRecord) => {
    if (window.confirm(t('delete.confirm', { title: episode.symptomTitle }))) {
      remove(episode.id);
      if (expandedId === episode.id) setExpandedId(null);
    }
  };

  const handleFindSimilar = (episode: HealthEpisodeRecord) => {
    setSimilarFor(episode);
  };

  const storageWarning = storage.isCritical
    ? t('page.storageWarning', { used: storage.megabytes.toFixed(1), limit: storage.limitMb })
    : undefined;

  return (
    <Box>
      <Box
        sx={{
          mb: 2.5,
          position: 'relative',
          overflow: 'hidden',
          borderRadius: 4,
          bgcolor: (theme) =>
            theme.palette.mode === 'light' ? 'rgba(15, 76, 92, 0.05)' : 'rgba(111, 190, 209, 0.10)',
          border: (theme) =>
            `1px solid ${theme.palette.mode === 'light' ? 'rgba(15, 76, 92, 0.12)' : 'rgba(111, 190, 209, 0.18)'}`,
          p: { xs: 2, md: 2.5 },
        }}
      >
        <Stack
          direction={{ xs: 'column', sm: 'row' }}
          alignItems={{ xs: 'flex-start', sm: 'center' }}
          gap={2}
        >
          <Box
            sx={{
              width: 48,
              height: 48,
              borderRadius: 2,
              bgcolor: 'primary.main',
              color: 'primary.contrastText',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 4px 10px rgba(15,76,92,0.18)',
              flexShrink: 0,
            }}
          >
            <MenuBookIcon />
          </Box>
          <Box sx={{ flex: 1, minWidth: 0 }}>
            <Typography
              variant="h1"
              sx={{
                fontSize: { xs: '1.5rem', md: '2rem' },
                fontWeight: 700,
                lineHeight: 1.1,
                letterSpacing: '-0.02em',
              }}
            >
              {t('page.title')}
            </Typography>
            <Typography variant="body2" sx={{ color: 'text.secondary', mt: 0.5, maxWidth: 640 }}>
              {t('page.description')}
            </Typography>
          </Box>
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={() => {
              setEditing(undefined);
              setFormOpen(true);
            }}
            disabled={!selectedDogId}
          >
            {t('page.newEpisode')}
          </Button>
        </Stack>
      </Box>

      <Card sx={{ mb: 2 }}>
        <CardContent>
          <Stack
            direction={{ xs: 'column', sm: 'row' }}
            spacing={2}
            alignItems={{ xs: 'stretch', sm: 'center' }}
          >
            <FormControl size="small" sx={{ minWidth: 220 }}>
              <InputLabel id="episode-dog-select">{t('page.dogSelect')}</InputLabel>
              <Select
                labelId="episode-dog-select"
                label={t('page.dogSelect')}
                value={selectedDogId}
                onChange={(e) => {
                  setSelectedDogId(e.target.value);
                  setExpandedId(null);
                }}
              >
                {dogProfiles.map((p) => (
                  <MenuItem key={p.id} value={p.id}>
                    {p.name}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
            <Box sx={{ flex: 1 }} />
            {storage.isApproachingLimit && (
              <Chip
                size="small"
                color={storage.isCritical ? 'error' : 'warning'}
                label={t('page.storageUsage', {
                  used: storage.megabytes.toFixed(1),
                  limit: storage.limitMb,
                })}
              />
            )}
          </Stack>
        </CardContent>
      </Card>

      <EpisodeFiltersBar
        category={categoryFilter}
        outcome={outcomeFilter}
        query={query}
        onCategoryChange={setCategoryFilter}
        onOutcomeChange={setOutcomeFilter}
        onQueryChange={setQuery}
      />

      {dogEpisodes.length === 0 ? (
        <Box sx={{ pt: 2 }}>
          <EmptyState
            icon={<EventBusyIcon />}
            title={t('empty.noEpisodesTitle')}
            description={t('empty.noEpisodesDescription')}
            primaryAction={{
              label: t('empty.addFirst'),
              icon: <AddIcon />,
              onClick: () => {
                setEditing(undefined);
                setFormOpen(true);
              },
            }}
          />
        </Box>
      ) : filtered.length === 0 ? (
        <Box sx={{ pt: 2 }}>
          <EmptyState
            icon={<EventBusyIcon />}
            title={t('empty.noFilterResultsTitle')}
            description={t('empty.noFilterResultsDescription')}
            variant="inline"
          />
        </Box>
      ) : (
        <Box>
          {filtered.map((episode) => (
            <EpisodeListItem
              key={episode.id}
              episode={episode}
              expanded={expandedId === episode.id}
              onToggle={() => setExpandedId(expandedId === episode.id ? null : episode.id)}
              onEdit={() => handleEdit(episode)}
              onDelete={() => handleDelete(episode)}
              onFindSimilar={() => handleFindSimilar(episode)}
              medications={medications}
              vetVisits={vetVisits}
            />
          ))}
        </Box>
      )}

      <EpisodeFormDialog
        open={formOpen}
        initial={editing}
        dogId={selectedDogId}
        medications={medications}
        vetVisits={vetVisits}
        storageWarning={storageWarning}
        onClose={() => {
          setFormOpen(false);
          setEditing(undefined);
        }}
        onSave={handleSave}
      />

      <SimilarEpisodesDialog
        open={Boolean(similarFor)}
        currentEpisode={similarFor}
        pastEpisodes={dogEpisodes}
        onClose={() => setSimilarFor(null)}
        onOpenEpisode={(id) => {
          setSimilarFor(null);
          setExpandedId(id);
          requestAnimationFrame(() => {
            const el = document.getElementById(`episode-${id}`);
            el?.scrollIntoView({ behavior: 'smooth', block: 'start' });
          });
        }}
      />
    </Box>
  );
}
