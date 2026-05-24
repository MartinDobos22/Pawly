import { useMemo, useState } from 'react';
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
import type {
  PetProfile,
  AnimalType,
  AnimalSize,
  AnimalLifeStage,
  ActivityLevel,
} from '../types';

const ALLERGY_SUGGESTIONS = ['Kura/kuriatko', 'Hovädzie', 'Jahňacie', 'Ryby', 'Vajcia', 'Pšenica', 'Kukurica', 'Sója'];
const INTOLERANCE_SUGGESTIONS = ['Lepok', 'Laktóza', 'Kukurica', 'Sója', 'Obilniny'];
const HEALTH_SUGGESTIONS = ['Diabetes', 'Problémy s obličkami', 'Obezita', 'Problémy s kĺbmi', 'Citlivé trávenie'];

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
  const { profiles, createProfile, updateProfile, deleteProfile } = usePetProfiles();
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
    {},
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
      { label: 'Očkovania', count: vaccinations.filter((x) => x.dogId === id).length },
      { label: 'Odčervenia', count: dewormings.filter((x) => x.dogId === id).length },
      { label: 'Ektoparazity', count: ectos.filter((x) => x.dogId === id).length },
      { label: 'Návštevy', count: visits.filter((x) => x.dogId === id).length },
      { label: 'Lieky', count: medications.filter((x) => x.dogId === id).length },
      { label: 'Dávky liekov', count: doseLogs.filter((x) => x.dogId === id).length },
      { label: 'Diéta', count: dietEntries.filter((x) => x.dogId === id).length },
      { label: 'Výdavky', count: expenses.filter((x) => x.dogId === id).length },
      { label: 'Epizódy', count: episodes.filter((x) => x.dogId === id).length },
      { label: 'Analýzy krmiva', count: savedAnalyses.filter((x) => x.petProfileId === id).length },
    ].filter((c) => c.count > 0);
    const total = counts.reduce((acc, c) => acc + c.count, 0);
    setPendingDelete({ id, name: profile.name, counts, total });
  };

  const confirmDelete = async () => {
    if (!pendingDelete) return;
    const id = pendingDelete.id;
    // DB má na pet_id ON DELETE CASCADE — zmazaním profilu sa odstránia aj
    // všetky súvisiace zdravotné záznamy a analýzy na serveri.
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
  const [conditionDraft, setConditionDraft] = useState('');
  const [procedureDraft, setProcedureDraft] = useState('');

  const dogProfiles = useMemo(() => profiles.filter((p) => p.animalType === 'dog'), [profiles]);

  const openNew = () => {
    setEditingId(null);
    setForm({ ...EMPTY_PROFILE });
    setConditionDraft('');
    setProcedureDraft('');
    setDialogOpen(true);
  };

  const openEdit = (profile: PetProfile) => {
    setEditingId(profile.id);
    setForm({ ...EMPTY_PROFILE, ...profile, allergies: [...profile.allergies], intolerances: [...profile.intolerances], healthConditions: [...profile.healthConditions], chronicConditions: [...(profile.chronicConditions ?? [])], procedures: [...(profile.procedures ?? [])] });
    setDialogOpen(true);
  };

  const handleSave = async () => {
    if (!form.name.trim()) return;
    const hasFullDate = Boolean(form.dateOfBirth);
    const hasYear = typeof form.birthYear === 'number';
    if (!hasFullDate && !hasYear) {
      setDobError('Dátum narodenia je povinný aspoň ako rok.');
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
        return `${years} r.`;
      }
    }
    const parts: string[] = [];
    if (profile.ageYears) parts.push(`${profile.ageYears} r.`);
    if (profile.ageMonths) parts.push(`${profile.ageMonths} mes.`);
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
            theme.palette.mode === 'light'
              ? 'rgba(15, 76, 92, 0.05)'
              : 'rgba(111, 190, 209, 0.10)',
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
              Profily zvierat
            </Typography>
            <Typography variant="body2" sx={{ color: 'text.secondary', mt: 0.5, maxWidth: 640 }}>
              Rozšírený profil pre zdravie, vakcinácie a návštevy veterinára. Pridaj informácie o
              alergiách, chronických stavoch a aktivite.
            </Typography>
          </Box>
          <Button variant="contained" startIcon={<AddIcon />} onClick={openNew}>
            Pridať psa
          </Button>
        </Stack>
      </Box>

      {dogProfiles.length === 0 && (
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
              Zatiaľ žiadny profil
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ maxWidth: 360 }}>
              Vytvor prvý profil psa a získaj prístup k Zdravotnému pasu, Denníku epizód a Karte
              pre veterinára.
            </Typography>
            <Button variant="contained" startIcon={<AddIcon />} onClick={openNew}>
              Vytvoriť profil
            </Button>
          </Stack>
        </Card>
      )}

      <Stack spacing={2}>
        {dogProfiles.map((profile) => (
          <Card key={profile.id} sx={{ borderRadius: 3 }}>
            <CardContent sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              {profile.photoUrl ? (
                <Box component="img" src={profile.photoUrl} alt={profile.name} sx={{ width: 56, height: 56, borderRadius: '50%', objectFit: 'cover' }} />
              ) : (
                <PetsIcon color="primary" sx={{ fontSize: 42 }} />
              )}
              <Box sx={{ flex: 1 }}>
                <Typography variant="h6" sx={{ fontWeight: 600 }}>{profile.name}</Typography>
                <Typography variant="body2" color="text.secondary">
                  {[profile.breed, formatAge(profile), profile.weightKg ? `${profile.weightKg} kg` : undefined, profile.microchipNumber ? `Čip: ${profile.microchipNumber}` : undefined]
                    .filter(Boolean)
                    .join(' · ')}
                </Typography>
                <Stack direction="row" spacing={0.5} flexWrap="wrap" sx={{ mt: 1 }}>
                  {profile.allergies.map((a) => <Chip key={a} label={a} size="small" color="error" variant="outlined" />)}
                  {profile.healthConditions.map((h) => <Chip key={h} label={h} size="small" color="info" variant="outlined" />)}
                </Stack>
              </Box>
              <IconButton onClick={() => openEdit(profile)}><EditIcon /></IconButton>
              <IconButton color="error" onClick={() => requestDelete(profile)}><DeleteIcon /></IconButton>
            </CardContent>
          </Card>
        ))}
      </Stack>

      <Dialog open={dialogOpen} onClose={() => setDialogOpen(false)} maxWidth="md" fullWidth>
        <DialogTitle>{editingId ? 'Upraviť profil psa' : 'Nový profil psa'}</DialogTitle>
        <DialogContent sx={{ pt: '12px !important' }}>
          <Stack spacing={2}>
            <TextField label="Meno" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} fullWidth />
            <Box sx={{ display: 'grid', gap: 2, gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' } }}>
              <FormControl fullWidth>
                <InputLabel>Druh</InputLabel>
                <Select value={form.animalType} label="Druh" onChange={(e) => setForm({ ...form, animalType: e.target.value as AnimalType })}>
                  <MenuItem value="dog">Pes</MenuItem>
                  <MenuItem value="cat">Mačka</MenuItem>
                  <MenuItem value="other">Iné</MenuItem>
                </Select>
              </FormControl>
              <TextField label="Plemeno" value={form.breed ?? ''} onChange={(e) => setForm({ ...form, breed: e.target.value })} fullWidth />
              <FormControl fullWidth>
                <InputLabel>Presnosť dátumu narodenia</InputLabel>
                <Select
                  value={form.dateOfBirthPrecision ?? 'full'}
                  label="Presnosť dátumu narodenia"
                  onChange={(e) => setForm({ ...form, dateOfBirthPrecision: e.target.value as PetProfile['dateOfBirthPrecision'] })}
                >
                  <MenuItem value="full">Presný dátum</MenuItem>
                  <MenuItem value="year-month">Len rok a mesiac</MenuItem>
                  <MenuItem value="year">Len rok</MenuItem>
                </Select>
              </FormControl>
              {(form.dateOfBirthPrecision ?? 'full') === 'full' ? (
                <TextField label="Dátum narodenia" type="date" InputLabelProps={{ shrink: true }} value={form.dateOfBirth ?? ''} onChange={(e) => setForm({ ...form, dateOfBirth: e.target.value, birthYear: undefined, birthMonth: undefined })} error={Boolean(dobError)} helperText={dobError || 'Povinné pole'} fullWidth />
              ) : (
                <Stack direction="row" spacing={2}>
                  <TextField label="Rok narodenia" type="number" inputProps={{ min: 1900, max: 2100 }} value={form.birthYear ?? ''} onChange={(e) => setForm({ ...form, birthYear: e.target.value ? Number(e.target.value) : undefined, dateOfBirth: undefined })} error={Boolean(dobError)} helperText={dobError || 'Povinné pole'} fullWidth />
                  {(form.dateOfBirthPrecision ?? 'full') === 'year-month' && (
                    <TextField label="Mesiac" type="number" inputProps={{ min: 1, max: 12 }} value={form.birthMonth ?? ''} onChange={(e) => setForm({ ...form, birthMonth: e.target.value ? Number(e.target.value) : undefined })} fullWidth />
                  )}
                </Stack>
              )}
              <FormControl fullWidth>
                <InputLabel>Pohlavie</InputLabel>
                <Select value={form.sex ?? 'UNKNOWN'} label="Pohlavie" onChange={(e) => setForm({ ...form, sex: e.target.value as PetProfile['sex'] })}>
                  <MenuItem value="MALE">Samec</MenuItem>
                  <MenuItem value="FEMALE">Samica</MenuItem>
                  <MenuItem value="UNKNOWN">Neznáme</MenuItem>
                </Select>
              </FormControl>
              <TextField label="Váha (kg)" type="number" inputProps={{ min: 0, step: 0.1 }} value={form.weightKg ?? ''} onChange={(e) => setForm({ ...form, weightKg: e.target.value ? Number(e.target.value) : undefined })} fullWidth />
              <TextField label="Foto URL" value={form.photoUrl ?? ''} onChange={(e) => setForm({ ...form, photoUrl: e.target.value })} fullWidth />
              <TextField label="Číslo čipu" value={form.microchipNumber ?? ''} onChange={(e) => setForm({ ...form, microchipNumber: e.target.value })} fullWidth />
              <TextField label="Číslo pasu" value={form.passportNumber ?? ''} onChange={(e) => setForm({ ...form, passportNumber: e.target.value })} fullWidth />
            </Box>

            {form.animalType === 'dog' && (
              <FormControl fullWidth>
                <InputLabel>Veľkosť</InputLabel>
                <Select value={form.size ?? ''} label="Veľkosť" onChange={(e) => setForm({ ...form, size: (e.target.value || undefined) as AnimalSize | undefined })}>
                  <MenuItem value="">–</MenuItem>
                  <MenuItem value="mini">Mini</MenuItem>
                  <MenuItem value="small">Malý</MenuItem>
                  <MenuItem value="medium">Stredný</MenuItem>
                  <MenuItem value="large">Veľký</MenuItem>
                  <MenuItem value="giant">Obrovský</MenuItem>
                </Select>
              </FormControl>
            )}

            <FormControl fullWidth>
              <InputLabel>Životné štádium</InputLabel>
              <Select value={form.lifeStage ?? ''} label="Životné štádium" onChange={(e) => setForm({ ...form, lifeStage: (e.target.value || undefined) as AnimalLifeStage | undefined })}>
                <MenuItem value="">–</MenuItem>
                <MenuItem value="puppy">Šteňa</MenuItem>
                <MenuItem value="junior">Junior</MenuItem>
                <MenuItem value="adult">Dospelý</MenuItem>
                <MenuItem value="senior">Senior</MenuItem>
              </Select>
            </FormControl>

            <FormControl fullWidth>
              <InputLabel>Úroveň aktivity</InputLabel>
              <Select value={form.activityLevel ?? ''} label="Úroveň aktivity" onChange={(e) => setForm({ ...form, activityLevel: (e.target.value || undefined) as ActivityLevel | undefined })}>
                <MenuItem value="">–</MenuItem>
                <MenuItem value="low">Nízka</MenuItem>
                <MenuItem value="moderate">Stredná</MenuItem>
                <MenuItem value="high">Vysoká</MenuItem>
                <MenuItem value="working">Pracovný pes</MenuItem>
              </Select>
            </FormControl>

            <Autocomplete multiple freeSolo options={ALLERGY_SUGGESTIONS} value={form.allergies} onChange={(_e, newVal) => setForm({ ...form, allergies: newVal })} renderInput={(params) => <TextField {...params} label="Alergie" />} />
            <Autocomplete multiple freeSolo options={INTOLERANCE_SUGGESTIONS} value={form.intolerances} onChange={(_e, newVal) => setForm({ ...form, intolerances: newVal })} renderInput={(params) => <TextField {...params} label="Intolerancie" />} />
            <Autocomplete multiple freeSolo options={HEALTH_SUGGESTIONS} value={form.healthConditions} onChange={(_e, newVal) => setForm({ ...form, healthConditions: newVal })} renderInput={(params) => <TextField {...params} label="Zdravotné ťažkosti" />} />

            <Divider />
            <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>Chronické diagnózy</Typography>
            <Stack direction="row" spacing={1}>
              <TextField label="Názov diagnózy" value={conditionDraft} onChange={(e) => setConditionDraft(e.target.value)} fullWidth />
              <Button variant="outlined" onClick={() => {
                if (!conditionDraft.trim()) return;
                setForm({ ...form, chronicConditions: [...(form.chronicConditions ?? []), { id: uid(), title: conditionDraft.trim() }] });
                setConditionDraft('');
              }}>Pridať</Button>
            </Stack>
            <Stack direction="row" spacing={1} flexWrap="wrap">
              {(form.chronicConditions ?? []).map((c) => <Chip key={c.id} label={c.title} onDelete={() => setForm({ ...form, chronicConditions: (form.chronicConditions ?? []).filter((x) => x.id !== c.id) })} />)}
            </Stack>

            <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>Procedúry / operácie</Typography>
            <Stack direction="row" spacing={1}>
              <TextField label="Názov + dátum (napr. kastrácia 2024-02-10)" value={procedureDraft} onChange={(e) => setProcedureDraft(e.target.value)} fullWidth />
              <Button variant="outlined" onClick={() => {
                if (!procedureDraft.trim()) return;
                setForm({ ...form, procedures: [...(form.procedures ?? []), { id: uid(), title: procedureDraft.trim(), date: new Date().toISOString().slice(0, 10) }] });
                setProcedureDraft('');
              }}>Pridať</Button>
            </Stack>
            <Stack direction="row" spacing={1} flexWrap="wrap">
              {(form.procedures ?? []).map((p) => <Chip key={p.id} label={p.title} onDelete={() => setForm({ ...form, procedures: (form.procedures ?? []).filter((x) => x.id !== p.id) })} />)}
            </Stack>

            <TextField label="Poznámky - na čo si dať pozor" multiline minRows={3} value={form.notes ?? ''} onChange={(e) => setForm({ ...form, notes: e.target.value })} fullWidth />
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDialogOpen(false)}>Zrušiť</Button>
          <Button variant="contained" onClick={handleSave} disabled={!form.name.trim()}>{editingId ? 'Uložiť' : 'Pridať'}</Button>
        </DialogActions>
      </Dialog>

      <Dialog open={pendingDelete !== null} onClose={() => setPendingDelete(null)} maxWidth="xs" fullWidth>
        <DialogTitle>Vymazať profil?</DialogTitle>
        <DialogContent>
          <Stack spacing={1.5}>
            <Typography variant="body2">
              Vymazať profil <strong>{pendingDelete?.name}</strong>?
            </Typography>
            {pendingDelete && pendingDelete.total > 0 && (
              <>
                <Typography variant="body2" color="text.secondary">
                  Týmto sa zmaže aj <strong>{pendingDelete.total}</strong>{' '}
                  {pendingDelete.total === 1 ? 'súvisiaci záznam' : 'súvisiacich záznamov'}:
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
              Túto akciu nie je možné vrátiť.
            </Typography>
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setPendingDelete(null)}>Zrušiť</Button>
          <Button color="error" variant="contained" onClick={confirmDelete}>
            Vymazať
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
