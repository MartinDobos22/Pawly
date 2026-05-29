import { useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  Autocomplete,
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Divider,
  FormControl,
  IconButton,
  InputLabel,
  MenuItem,
  Select,
  Stack,
  TextField,
  Typography,
} from '@mui/material';
import {
  Add as AddIcon,
  Delete as DeleteIcon,
  Edit as EditIcon,
  Pets as PetsIcon,
} from '@mui/icons-material';
import { useLocalStorage } from '../hooks/useLocalStorage';
import { usePetProfiles } from '../hooks/usePetProfiles';
import { useHealthData } from '../hooks/useHealthData';
import type { PetProfile, AnimalType, AnimalSize, AnimalLifeStage, ActivityLevel } from '../types';

const EMPTY_PROFILE: Omit<PetProfile, 'id'> = {
  name: '',
  animalType: 'dog',
  breed: '',
  dateOfBirth: '',
  dateOfBirthPrecision: 'full',
  birthYear: undefined,
  birthMonth: undefined,
  sex: 'UNKNOWN',
  ageYears: undefined,
  ageMonths: undefined,
  weightKg: undefined,
  photoUrl: '',
  microchipNumber: '',
  passportNumber: '',
  size: undefined,
  lifeStage: undefined,
  activityLevel: undefined,
  allergies: [],
  intolerances: [],
  healthConditions: [],
  chronicConditions: [],
  procedures: [],
  notes: '',
};

const uid = () => Date.now().toString(36) + Math.random().toString(36).slice(2, 8);

export default function PetProfilePage() {
  const { t } = useTranslation('healthPassport');
  const ALLERGY_SUGGESTIONS = t('profiles.allergySuggestions', { returnObjects: true }) as string[];
  const INTOLERANCE_SUGGESTIONS = t('profiles.intoleranceSuggestions', {
    returnObjects: true,
  }) as string[];
  const HEALTH_SUGGESTIONS = t('profiles.healthSuggestions', { returnObjects: true }) as string[];
  const {
    profiles,
    loading: petsLoading,
    createProfile,
    updateProfile,
    deleteProfile,
  } = usePetProfiles();
  const {
    vaccinations,
    dewormings,
    ectos,
    visits,
    medications,
    doseLogs,
    dietEntries,
    expenses,
    episodes,
    savedAnalyses,
  } = useHealthData();
  const [, setLastClinicByDog] = useLocalStorage<Record<string, string>>(
    'granule-check-last-clinic-by-dog',
    {}
  );

  const [pendingDelete, setPendingDelete] = useState<{
    id: string;
    name: string;
    counts: Array<{ label: string; count: number }>;
    total: number;
  } | null>(null);

  const requestDelete = (profile: PetProfile) => {
    const id = profile.id;
    const counts = [
      {
        label: t('profiles.recordVaccinations'),
        count: vaccinations.filter((x) => x.dogId === id).length,
      },
      {
        label: t('profiles.recordDewormings'),
        count: dewormings.filter((x) => x.dogId === id).length,
      },
      { label: t('profiles.recordEctos'), count: ectos.filter((x) => x.dogId === id).length },
      { label: t('profiles.recordVisits'), count: visits.filter((x) => x.dogId === id).length },
      {
        label: t('profiles.recordMedications'),
        count: medications.filter((x) => x.dogId === id).length,
      },
      { label: t('profiles.recordDoseLogs'), count: doseLogs.filter((x) => x.dogId === id).length },
      {
        label: t('profiles.recordDietEntries'),
        count: dietEntries.filter((x) => x.dogId === id).length,
      },
      { label: t('profiles.recordExpenses'), count: expenses.filter((x) => x.dogId === id).length },
      { label: t('profiles.recordEpisodes'), count: episodes.filter((x) => x.dogId === id).length },
      {
        label: t('profiles.recordAnalyses'),
        count: savedAnalyses.filter((x) => x.petProfileId === id).length,
      },
    ].filter((c) => c.count > 0);
    const total = counts.reduce((acc, c) => acc + c.count, 0);
    setPendingDelete({ id, name: profile.name, counts, total });
  };

  const confirmDelete = async () => {
    if (!pendingDelete) return;
    const id = pendingDelete.id;
    await deleteProfile(id);
    setLastClinicByDog((prev) => {
      const next = { ...prev };
      delete next[id];
      return next;
    });
    setPendingDelete(null);
  };

  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState<Omit<PetProfile, 'id'>>(EMPTY_PROFILE);
  const [dobError, setDobError] = useState('');
  const [nameError, setNameError] = useState('');
  const [conditionDraft, setConditionDraft] = useState('');
  const [procedureDraft, setProcedureDraft] = useState('');

  const dogProfiles = useMemo(() => profiles.filter((p) => p.animalType === 'dog'), [profiles]);

  const openNew = () => {
    setEditingId(null);
    setForm({ ...EMPTY_PROFILE });
    setConditionDraft('');
    setProcedureDraft('');
    setDobError('');
    setNameError('');
    setDialogOpen(true);
  };

  const openEdit = (profile: PetProfile) => {
    setEditingId(profile.id);
    setForm({
      ...EMPTY_PROFILE,
      ...profile,
      allergies: [...profile.allergies],
      intolerances: [...profile.intolerances],
      healthConditions: [...profile.healthConditions],
      chronicConditions: [...(profile.chronicConditions ?? [])],
      procedures: [...(profile.procedures ?? [])],
    });
    setDobError('');
    setNameError('');
    setDialogOpen(true);
  };

  const handleSave = async () => {
    if (!form.name.trim()) {
      setNameError(t('profiles.nameRequired'));
      return;
    }
    setNameError('');
    const hasFullDate = Boolean(form.dateOfBirth);
    const hasYear = typeof form.birthYear === 'number';
    if (!hasFullDate && !hasYear) {
      setDobError(t('profiles.dobRequired'));
      return;
    }
    setDobError('');
    if (editingId) {
      await updateProfile(editingId, form);
    } else {
      await createProfile(form);
    }
    setDialogOpen(false);
  };

  const formatAge = (profile: PetProfile) => {
    if (profile.dateOfBirth) {
      const d = new Date(profile.dateOfBirth);
      if (!Number.isNaN(d.getTime())) {
        const diff = Date.now() - d.getTime();
        const years = Math.floor(diff / (1000 * 60 * 60 * 24 * 365.25));
        return t('profiles.ageYears', { years });
      }
    }
    const parts: string[] = [];
    if (profile.ageYears) parts.push(t('profiles.ageYears', { years: profile.ageYears }));
    if (profile.ageMonths) parts.push(t('profiles.ageMonths', { months: profile.ageMonths }));
    return parts.join(' ') || undefined;
  };

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
            <PetsIcon />
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
              {t('profiles.pageTitle')}
            </Typography>
            <Typography variant="body2" sx={{ color: 'text.secondary', mt: 0.5, maxWidth: 640 }}>
              {t('profiles.pageSubtitle')}
            </Typography>
          </Box>
          <Button variant="contained" startIcon={<AddIcon />} onClick={openNew}>
            {t('profiles.addPet')}
          </Button>
        </Stack>
      </Box>

      {!petsLoading && dogProfiles.length === 0 && (
        <Card
          sx={{
            p: 4,
            textAlign: 'center',
            borderStyle: 'dashed',
            maxWidth: 520,
            mx: 'auto',
            mt: 4,
          }}
        >
          <Stack spacing={2} alignItems="center">
            <Box
              sx={{
                width: 64,
                height: 64,
                borderRadius: '50%',
                bgcolor: 'primary.main',
                color: 'primary.contrastText',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <PetsIcon sx={{ fontSize: 32 }} />
            </Box>
            <Typography variant="h3" sx={{ fontSize: '1.15rem', fontWeight: 700 }}>
              {t('profiles.emptyTitle')}
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ maxWidth: 360 }}>
              {t('profiles.emptyDescription')}
            </Typography>
            <Button variant="contained" startIcon={<AddIcon />} onClick={openNew}>
              {t('profiles.createProfile')}
            </Button>
          </Stack>
        </Card>
      )}

      <Stack spacing={2}>
        {dogProfiles.map((profile) => (
          <Card key={profile.id} sx={{ borderRadius: 3 }}>
            <CardContent sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              {profile.photoUrl ? (
                <Box
                  component="img"
                  src={profile.photoUrl}
                  alt={profile.name}
                  sx={{ width: 56, height: 56, borderRadius: '50%', objectFit: 'cover' }}
                />
              ) : (
                <PetsIcon color="primary" sx={{ fontSize: 42 }} />
              )}
              <Box sx={{ flex: 1 }}>
                <Typography variant="h6" sx={{ fontWeight: 600 }}>
                  {profile.name}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {[
                    profile.breed,
                    formatAge(profile),
                    profile.weightKg ? `${profile.weightKg} kg` : undefined,
                    profile.microchipNumber
                      ? t('profiles.chip', { chip: profile.microchipNumber })
                      : undefined,
                  ]
                    .filter(Boolean)
                    .join(' · ')}
                </Typography>
                <Stack direction="row" spacing={0.5} flexWrap="wrap" sx={{ mt: 1 }}>
                  {profile.allergies.map((a) => (
                    <Chip key={a} label={a} size="small" color="error" variant="outlined" />
                  ))}
                  {profile.healthConditions.map((h) => (
                    <Chip key={h} label={h} size="small" color="info" variant="outlined" />
                  ))}
                </Stack>
              </Box>
              <IconButton onClick={() => openEdit(profile)}>
                <EditIcon />
              </IconButton>
              <IconButton color="error" onClick={() => requestDelete(profile)}>
                <DeleteIcon />
              </IconButton>
            </CardContent>
          </Card>
        ))}
      </Stack>

      <Dialog open={dialogOpen} onClose={() => setDialogOpen(false)} maxWidth="md" fullWidth>
        <DialogTitle>
          {editingId ? t('profiles.dialogTitleEdit') : t('profiles.dialogTitleNew')}
        </DialogTitle>
        <DialogContent sx={{ pt: '12px !important' }}>
          <Stack spacing={2}>
            <TextField
              label={t('profiles.nameLabel')}
              value={form.name}
              onChange={(e) => {
                setForm({ ...form, name: e.target.value });
                if (e.target.value.trim()) setNameError('');
              }}
              error={Boolean(nameError)}
              helperText={nameError || t('profiles.nameHint')}
              required
              fullWidth
            />
            <Box
              sx={{ display: 'grid', gap: 2, gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' } }}
            >
              <FormControl fullWidth>
                <InputLabel>{t('profiles.animalType')}</InputLabel>
                <Select
                  value={form.animalType}
                  label={t('profiles.animalType')}
                  onChange={(e) => setForm({ ...form, animalType: e.target.value as AnimalType })}
                >
                  <MenuItem value="dog">{t('profiles.animalDog')}</MenuItem>
                  <MenuItem value="cat">{t('profiles.animalCat')}</MenuItem>
                  <MenuItem value="other">{t('profiles.animalOther')}</MenuItem>
                </Select>
              </FormControl>
              <TextField
                label={t('profiles.breed')}
                value={form.breed ?? ''}
                onChange={(e) => setForm({ ...form, breed: e.target.value })}
                fullWidth
              />
              <FormControl fullWidth>
                <InputLabel>{t('profiles.dobPrecision')}</InputLabel>
                <Select
                  value={form.dateOfBirthPrecision ?? 'full'}
                  label={t('profiles.dobPrecision')}
                  onChange={(e) =>
                    setForm({
                      ...form,
                      dateOfBirthPrecision: e.target.value as PetProfile['dateOfBirthPrecision'],
                    })
                  }
                >
                  <MenuItem value="full">{t('profiles.dobPrecisionFull')}</MenuItem>
                  <MenuItem value="year-month">{t('profiles.dobPrecisionYearMonth')}</MenuItem>
                  <MenuItem value="year">{t('profiles.dobPrecisionYear')}</MenuItem>
                </Select>
              </FormControl>
              {(form.dateOfBirthPrecision ?? 'full') === 'full' ? (
                <TextField
                  label={t('profiles.dobLabel')}
                  type="date"
                  InputLabelProps={{ shrink: true }}
                  value={form.dateOfBirth ?? ''}
                  onChange={(e) => {
                    setForm({
                      ...form,
                      dateOfBirth: e.target.value,
                      birthYear: undefined,
                      birthMonth: undefined,
                    });
                    if (e.target.value) setDobError('');
                  }}
                  error={Boolean(dobError)}
                  helperText={dobError || t('profiles.nameHint')}
                  required
                  fullWidth
                />
              ) : (
                <Stack direction="row" spacing={2}>
                  <TextField
                    label={t('profiles.birthYearLabel')}
                    type="number"
                    inputProps={{ min: 1900, max: 2100 }}
                    value={form.birthYear ?? ''}
                    onChange={(e) => {
                      setForm({
                        ...form,
                        birthYear: e.target.value ? Number(e.target.value) : undefined,
                        dateOfBirth: undefined,
                      });
                      if (e.target.value) setDobError('');
                    }}
                    error={Boolean(dobError)}
                    helperText={dobError || t('profiles.nameHint')}
                    required
                    fullWidth
                  />
                  {(form.dateOfBirthPrecision ?? 'full') === 'year-month' && (
                    <TextField
                      label={t('profiles.birthMonthLabel')}
                      type="number"
                      inputProps={{ min: 1, max: 12 }}
                      value={form.birthMonth ?? ''}
                      onChange={(e) =>
                        setForm({
                          ...form,
                          birthMonth: e.target.value ? Number(e.target.value) : undefined,
                        })
                      }
                      fullWidth
                    />
                  )}
                </Stack>
              )}
              <FormControl fullWidth>
                <InputLabel>{t('profiles.sex')}</InputLabel>
                <Select
                  value={form.sex ?? 'UNKNOWN'}
                  label={t('profiles.sex')}
                  onChange={(e) => setForm({ ...form, sex: e.target.value as PetProfile['sex'] })}
                >
                  <MenuItem value="MALE">{t('profiles.sexMale')}</MenuItem>
                  <MenuItem value="FEMALE">{t('profiles.sexFemale')}</MenuItem>
                  <MenuItem value="UNKNOWN">{t('profiles.sexUnknown')}</MenuItem>
                </Select>
              </FormControl>
              <TextField
                label={t('profiles.weight')}
                type="number"
                inputProps={{ min: 0, step: 0.1 }}
                value={form.weightKg ?? ''}
                onChange={(e) =>
                  setForm({
                    ...form,
                    weightKg: e.target.value ? Number(e.target.value) : undefined,
                  })
                }
                fullWidth
              />
              <TextField
                label={t('profiles.photoUrl')}
                value={form.photoUrl ?? ''}
                onChange={(e) => setForm({ ...form, photoUrl: e.target.value })}
                fullWidth
              />
              <TextField
                label={t('profiles.microchip')}
                value={form.microchipNumber ?? ''}
                onChange={(e) => setForm({ ...form, microchipNumber: e.target.value })}
                fullWidth
              />
              <TextField
                label={t('profiles.passportNumber')}
                value={form.passportNumber ?? ''}
                onChange={(e) => setForm({ ...form, passportNumber: e.target.value })}
                fullWidth
              />
            </Box>

            {form.animalType === 'dog' && (
              <FormControl fullWidth>
                <InputLabel>{t('profiles.size')}</InputLabel>
                <Select
                  value={form.size ?? ''}
                  label={t('profiles.size')}
                  onChange={(e) =>
                    setForm({
                      ...form,
                      size: (e.target.value || undefined) as AnimalSize | undefined,
                    })
                  }
                >
                  <MenuItem value="">–</MenuItem>
                  <MenuItem value="mini">{t('profiles.sizeMini')}</MenuItem>
                  <MenuItem value="small">{t('profiles.sizeSmall')}</MenuItem>
                  <MenuItem value="medium">{t('profiles.sizeMedium')}</MenuItem>
                  <MenuItem value="large">{t('profiles.sizeLarge')}</MenuItem>
                  <MenuItem value="giant">{t('profiles.sizeGiant')}</MenuItem>
                </Select>
              </FormControl>
            )}

            <FormControl fullWidth>
              <InputLabel>{t('profiles.lifeStage')}</InputLabel>
              <Select
                value={form.lifeStage ?? ''}
                label={t('profiles.lifeStage')}
                onChange={(e) =>
                  setForm({
                    ...form,
                    lifeStage: (e.target.value || undefined) as AnimalLifeStage | undefined,
                  })
                }
              >
                <MenuItem value="">–</MenuItem>
                <MenuItem value="puppy">{t('profiles.lifeStagePuppy')}</MenuItem>
                <MenuItem value="junior">{t('profiles.lifeStageJunior')}</MenuItem>
                <MenuItem value="adult">{t('profiles.lifeStageAdult')}</MenuItem>
                <MenuItem value="senior">{t('profiles.lifeStageSenior')}</MenuItem>
              </Select>
            </FormControl>

            <FormControl fullWidth>
              <InputLabel>{t('profiles.activityLevel')}</InputLabel>
              <Select
                value={form.activityLevel ?? ''}
                label={t('profiles.activityLevel')}
                onChange={(e) =>
                  setForm({
                    ...form,
                    activityLevel: (e.target.value || undefined) as ActivityLevel | undefined,
                  })
                }
              >
                <MenuItem value="">–</MenuItem>
                <MenuItem value="low">{t('profiles.activityLow')}</MenuItem>
                <MenuItem value="moderate">{t('profiles.activityModerate')}</MenuItem>
                <MenuItem value="high">{t('profiles.activityHigh')}</MenuItem>
                <MenuItem value="working">{t('profiles.activityWorking')}</MenuItem>
              </Select>
            </FormControl>

            <Autocomplete
              multiple
              freeSolo
              options={ALLERGY_SUGGESTIONS}
              value={form.allergies}
              onChange={(_e, newVal) => setForm({ ...form, allergies: newVal })}
              renderInput={(params) => <TextField {...params} label={t('profiles.allergies')} />}
            />
            <Autocomplete
              multiple
              freeSolo
              options={INTOLERANCE_SUGGESTIONS}
              value={form.intolerances}
              onChange={(_e, newVal) => setForm({ ...form, intolerances: newVal })}
              renderInput={(params) => <TextField {...params} label={t('profiles.intolerances')} />}
            />
            <Autocomplete
              multiple
              freeSolo
              options={HEALTH_SUGGESTIONS}
              value={form.healthConditions}
              onChange={(_e, newVal) => setForm({ ...form, healthConditions: newVal })}
              renderInput={(params) => (
                <TextField {...params} label={t('profiles.healthConditions')} />
              )}
            />

            <Divider />
            <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>
              {t('profiles.chronicTitle')}
            </Typography>
            <Stack direction="row" spacing={1}>
              <TextField
                label={t('profiles.conditionLabel')}
                value={conditionDraft}
                onChange={(e) => setConditionDraft(e.target.value)}
                fullWidth
              />
              <Button
                variant="outlined"
                onClick={() => {
                  if (!conditionDraft.trim()) return;
                  setForm({
                    ...form,
                    chronicConditions: [
                      ...(form.chronicConditions ?? []),
                      { id: uid(), title: conditionDraft.trim() },
                    ],
                  });
                  setConditionDraft('');
                }}
              >
                {t('actions.add', { ns: 'common' })}
              </Button>
            </Stack>
            <Stack direction="row" spacing={1} flexWrap="wrap">
              {(form.chronicConditions ?? []).map((c) => (
                <Chip
                  key={c.id}
                  label={c.title}
                  onDelete={() =>
                    setForm({
                      ...form,
                      chronicConditions: (form.chronicConditions ?? []).filter(
                        (x) => x.id !== c.id
                      ),
                    })
                  }
                />
              ))}
            </Stack>

            <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>
              {t('profiles.proceduresTitle')}
            </Typography>
            <Stack direction="row" spacing={1}>
              <TextField
                label={t('profiles.procedurePlaceholder')}
                value={procedureDraft}
                onChange={(e) => setProcedureDraft(e.target.value)}
                fullWidth
              />
              <Button
                variant="outlined"
                onClick={() => {
                  if (!procedureDraft.trim()) return;
                  setForm({
                    ...form,
                    procedures: [
                      ...(form.procedures ?? []),
                      {
                        id: uid(),
                        title: procedureDraft.trim(),
                        date: new Date().toISOString().slice(0, 10),
                      },
                    ],
                  });
                  setProcedureDraft('');
                }}
              >
                {t('actions.add', { ns: 'common' })}
              </Button>
            </Stack>
            <Stack direction="row" spacing={1} flexWrap="wrap">
              {(form.procedures ?? []).map((p) => (
                <Chip
                  key={p.id}
                  label={p.title}
                  onDelete={() =>
                    setForm({
                      ...form,
                      procedures: (form.procedures ?? []).filter((x) => x.id !== p.id),
                    })
                  }
                />
              ))}
            </Stack>

            <TextField
              label={t('profiles.notes')}
              multiline
              minRows={3}
              value={form.notes ?? ''}
              onChange={(e) => setForm({ ...form, notes: e.target.value })}
              fullWidth
            />
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button
            onClick={() => {
              setDialogOpen(false);
              setNameError('');
              setDobError('');
            }}
          >
            {t('actions.cancel', { ns: 'common' })}
          </Button>
          <Button variant="contained" onClick={handleSave}>
            {editingId ? t('profiles.saveUpdate') : t('profiles.saveCreate')}
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog
        open={pendingDelete !== null}
        onClose={() => setPendingDelete(null)}
        maxWidth="xs"
        fullWidth
      >
        <DialogTitle>{t('profiles.deleteDialogTitle')}</DialogTitle>
        <DialogContent>
          <Stack spacing={1.5}>
            <Typography variant="body2">
              {t('profiles.deleteConfirm', { name: pendingDelete?.name })}
            </Typography>
            {pendingDelete && pendingDelete.total > 0 && (
              <>
                <Typography variant="body2" color="text.secondary">
                  {t('profiles.deleteHasRecords', { count: pendingDelete.total })}
                </Typography>
                <Stack component="ul" sx={{ pl: 2, m: 0 }} spacing={0.25}>
                  {pendingDelete.counts.map((c) => (
                    <li key={c.label}>
                      <Typography variant="body2" color="text.secondary">
                        {c.label}: {c.count}
                      </Typography>
                    </li>
                  ))}
                </Stack>
              </>
            )}
            <Typography variant="caption" color="error">
              {t('profiles.deleteIrreversible')}
            </Typography>
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setPendingDelete(null)}>
            {t('actions.cancel', { ns: 'common' })}
          </Button>
          <Button color="error" variant="contained" onClick={confirmDelete}>
            {t('actions.delete', { ns: 'common' })}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
