import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Alert,
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
import EpisodeFiltersBar from '../components/episodes/EpisodeFiltersBar';
import EpisodeListItem from '../components/episodes/EpisodeListItem';
import EpisodeFormDialog from '../components/episodes/EpisodeFormDialog';
import SimilarEpisodesDialog from '../components/episodes/SimilarEpisodesDialog';
import { useHealthEpisodes } from '../hooks/useHealthEpisodes';
import { useEpisodeStorageSize } from '../hooks/useEpisodeStorageSize';
import { useLocalStorage } from '../hooks/useLocalStorage';
import { filterEpisodes, sortEpisodesNewestFirst } from '../utils/episodeFilters';
import type { EpisodeCategory, EpisodeOutcome, HealthEpisodeRecord } from '../types/healthEpisode';
import type { PetProfile } from '../types';
import type { MedicationRecord, VetVisitRecord } from '../types/dogHealth';

export default function EpisodeDiaryPage() {
  const navigate = useNavigate();

  const [profiles] = useLocalStorage<PetProfile[]>('granule-check-pet-profiles', []);
  const dogProfiles = useMemo(() => profiles.filter((p) => p.animalType === 'dog'), [profiles]);

  const [selectedDogId, setSelectedDogId] = useState<string>(dogProfiles[0]?.id ?? '');
  const [medications] = useLocalStorage<MedicationRecord[]>('dog-health-medications', []);
  const [vetVisits] = useLocalStorage<VetVisitRecord[]>('dog-health-visits', []);

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

  if (dogProfiles.length === 0) {
    return (
      <Box sx={{ textAlign: 'center', py: 8 }}>
        <PetsIcon sx={{ fontSize: 80, color: 'text.secondary', opacity: 0.4, mb: 2 }} />
        <Typography variant="h5" sx={{ fontWeight: 600, mb: 1 }}>
          Najprv vytvorte profil psa
        </Typography>
        <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
          Denník epizód potrebuje aspoň jeden profil zvieraťa.
        </Typography>
        <Button variant="contained" onClick={() => navigate('/profily')}>
          Vytvoriť profil
        </Button>
      </Box>
    );
  }

  const handleSave = (
    payload: Omit<HealthEpisodeRecord, 'id' | 'createdAt' | 'updatedAt'>,
    id?: string
  ) => {
    if (id) {
      update(id, payload);
    } else {
      add(payload);
    }
    setFormOpen(false);
    setEditing(undefined);
  };

  const handleEdit = (episode: HealthEpisodeRecord) => {
    setEditing(episode);
    setFormOpen(true);
  };

  const handleDelete = (episode: HealthEpisodeRecord) => {
    if (window.confirm(`Naozaj zmazať epizódu "${episode.symptomTitle}"?`)) {
      remove(episode.id);
      if (expandedId === episode.id) setExpandedId(null);
    }
  };

  const handleFindSimilar = (episode: HealthEpisodeRecord) => {
    setSimilarFor(episode);
  };

  const storageWarning = storage.isCritical
    ? `Úložisko prílohov sa blíži k limitu (${storage.megabytes.toFixed(1)} MB / ${storage.limitMb} MB). Zvážte zmazanie starších epizód alebo uloženie bez prílohy.`
    : undefined;

  return (
    <Box>
      <Stack
        direction={{ xs: 'column', sm: 'row' }}
        alignItems={{ xs: 'flex-start', sm: 'center' }}
        spacing={2}
        sx={{ mb: 3 }}
      >
        <Stack direction="row" spacing={1.5} alignItems="center" sx={{ flex: 1 }}>
          <MenuBookIcon color="primary" />
          <Typography variant="h4" sx={{ fontWeight: 700 }}>
            Denník epizód
          </Typography>
        </Stack>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => {
            setEditing(undefined);
            setFormOpen(true);
          }}
          disabled={!selectedDogId}
        >
          Nová epizóda
        </Button>
      </Stack>

      <Card sx={{ mb: 2 }}>
        <CardContent>
          <Stack
            direction={{ xs: 'column', sm: 'row' }}
            spacing={2}
            alignItems={{ xs: 'stretch', sm: 'center' }}
          >
            <FormControl size="small" sx={{ minWidth: 220 }}>
              <InputLabel id="episode-dog-select">Pes</InputLabel>
              <Select
                labelId="episode-dog-select"
                label="Pes"
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
                label={`Úložisko: ${storage.megabytes.toFixed(1)} MB / ${storage.limitMb} MB`}
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
        <Box sx={{ textAlign: 'center', py: 8 }}>
          <EventBusyIcon sx={{ fontSize: 80, color: 'text.secondary', opacity: 0.4, mb: 2 }} />
          <Typography variant="h6" sx={{ fontWeight: 600, mb: 1 }}>
            Zatiaľ žiadne epizódy
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
            Zaznamenajte zdravotné stavy psa, čo zabralo a čo nie — pri budúcom výskyte uvidíte
            overené riešenie.
          </Typography>
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={() => {
              setEditing(undefined);
              setFormOpen(true);
            }}
          >
            Pridať prvú epizódu
          </Button>
        </Box>
      ) : filtered.length === 0 ? (
        <Alert severity="info" sx={{ mb: 2 }}>
          Žiadne epizódy nezodpovedajú aktuálnym filtrom.
        </Alert>
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
