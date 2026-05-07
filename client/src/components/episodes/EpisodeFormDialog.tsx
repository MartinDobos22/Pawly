import { useEffect, useMemo, useState } from 'react';
import {
  Alert,
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Divider,
  FormControl,
  InputLabel,
  MenuItem,
  Select,
  Stack,
  TextField,
  Typography,
  useMediaQuery,
  useTheme,
} from '@mui/material';
import StringListEditor from './StringListEditor';
import AttachmentGallery from './AttachmentGallery';
import {
  EPISODE_CATEGORIES,
  EPISODE_CATEGORY_LABEL,
  EPISODE_OUTCOMES,
  EPISODE_OUTCOME_LABEL,
  EPISODE_SEVERITIES,
  EPISODE_SEVERITY_LABEL,
  type EpisodeAttachment,
  type EpisodeCategory,
  type EpisodeOutcome,
  type EpisodeSeverity,
  type HealthEpisodeRecord,
} from '../../types/healthEpisode';
import type { MedicationRecord, VetVisitRecord } from '../../types/dogHealth';

interface EpisodeFormDialogProps {
  open: boolean;
  initial?: HealthEpisodeRecord;
  dogId: string;
  medications: MedicationRecord[];
  vetVisits: VetVisitRecord[];
  storageWarning?: string;
  onClose: () => void;
  onSave: (
    payload: Omit<HealthEpisodeRecord, 'id' | 'createdAt' | 'updatedAt'>,
    id?: string
  ) => void;
}

interface FormState {
  symptomTitle: string;
  symptomDescription: string;
  category: EpisodeCategory;
  startedAt: string;
  endedAt: string;
  location: string;
  triggers: string[];
  diagnosis: string;
  vetVisitId: string;
  medicationIds: string[];
  treatmentNotes: string;
  whatWorked: string[];
  whatDidntWork: string[];
  outcome: EpisodeOutcome;
  severity: EpisodeSeverity;
  lessonsLearned: string;
  attachments: EpisodeAttachment[];
}

function todayIso() {
  return new Date().toISOString().slice(0, 10);
}

function emptyState(): FormState {
  return {
    symptomTitle: '',
    symptomDescription: '',
    category: 'digestive',
    startedAt: todayIso(),
    endedAt: '',
    location: '',
    triggers: [],
    diagnosis: '',
    vetVisitId: '',
    medicationIds: [],
    treatmentNotes: '',
    whatWorked: [],
    whatDidntWork: [],
    outcome: 'resolved',
    severity: 'moderate',
    lessonsLearned: '',
    attachments: [],
  };
}

function fromRecord(record: HealthEpisodeRecord): FormState {
  return {
    symptomTitle: record.symptomTitle,
    symptomDescription: record.symptomDescription,
    category: record.category,
    startedAt: record.startedAt || todayIso(),
    endedAt: record.endedAt ?? '',
    location: record.location ?? '',
    triggers: record.triggers ?? [],
    diagnosis: record.diagnosis ?? '',
    vetVisitId: record.vetVisitId ?? '',
    medicationIds: record.medicationIds,
    treatmentNotes: record.treatmentNotes ?? '',
    whatWorked: record.whatWorked,
    whatDidntWork: record.whatDidntWork,
    outcome: record.outcome,
    severity: record.severity,
    lessonsLearned: record.lessonsLearned ?? '',
    attachments: record.attachments ?? [],
  };
}

export default function EpisodeFormDialog({
  open,
  initial,
  dogId,
  medications,
  vetVisits,
  storageWarning,
  onClose,
  onSave,
}: EpisodeFormDialogProps) {
  const theme = useTheme();
  const fullScreen = useMediaQuery(theme.breakpoints.down('sm'));
  const [state, setState] = useState<FormState>(emptyState());

  useEffect(() => {
    if (open) {
      setState(initial ? fromRecord(initial) : emptyState());
    }
  }, [open, initial]);

  const dogMedications = useMemo(
    () => medications.filter((m) => m.dogId === dogId),
    [medications, dogId]
  );
  const dogVetVisits = useMemo(
    () => vetVisits.filter((v) => v.dogId === dogId),
    [vetVisits, dogId]
  );

  const canSave = state.symptomTitle.trim().length > 0;

  const update = <K extends keyof FormState>(key: K, value: FormState[K]) =>
    setState((prev) => ({ ...prev, [key]: value }));

  const handleSave = () => {
    if (!canSave) return;
    onSave(
      {
        dogId,
        symptomTitle: state.symptomTitle.trim(),
        symptomDescription: state.symptomDescription.trim(),
        category: state.category,
        startedAt: state.startedAt || todayIso(),
        endedAt: state.endedAt || undefined,
        location: state.location.trim() || undefined,
        triggers: state.triggers.length > 0 ? state.triggers : undefined,
        diagnosis: state.diagnosis.trim() || undefined,
        vetVisitId: state.vetVisitId || undefined,
        medicationIds: state.medicationIds,
        treatmentNotes: state.treatmentNotes.trim() || undefined,
        whatWorked: state.whatWorked,
        whatDidntWork: state.whatDidntWork,
        outcome: state.outcome,
        severity: state.severity,
        lessonsLearned: state.lessonsLearned.trim() || undefined,
        attachments: state.attachments.length > 0 ? state.attachments : undefined,
      },
      initial?.id
    );
  };

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="md" fullScreen={fullScreen}>
      <DialogTitle>{initial ? 'Upraviť epizódu' : 'Nová epizóda'}</DialogTitle>
      <DialogContent dividers>
        <Stack spacing={3}>
          {storageWarning && <Alert severity="warning">{storageWarning}</Alert>}

          <Box>
            <Typography variant="subtitle1" sx={{ fontWeight: 700, mb: 1 }}>
              Symptóm a kontext
            </Typography>
            <Stack spacing={2}>
              <TextField
                label="Názov symptómu"
                placeholder="napr. Reflux, Hnačka, Krívanie"
                value={state.symptomTitle}
                onChange={(e) => update('symptomTitle', e.target.value)}
                required
                fullWidth
              />
              <TextField
                label="Popis"
                value={state.symptomDescription}
                onChange={(e) => update('symptomDescription', e.target.value)}
                multiline
                minRows={2}
                fullWidth
              />
              <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
                <FormControl fullWidth>
                  <InputLabel id="episode-form-category">Kategória</InputLabel>
                  <Select
                    labelId="episode-form-category"
                    label="Kategória"
                    value={state.category}
                    onChange={(e) => update('category', e.target.value as EpisodeCategory)}
                  >
                    {EPISODE_CATEGORIES.map((c) => (
                      <MenuItem key={c} value={c}>
                        {EPISODE_CATEGORY_LABEL[c]}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
                <FormControl fullWidth>
                  <InputLabel id="episode-form-severity">Závažnosť</InputLabel>
                  <Select
                    labelId="episode-form-severity"
                    label="Závažnosť"
                    value={state.severity}
                    onChange={(e) => update('severity', e.target.value as EpisodeSeverity)}
                  >
                    {EPISODE_SEVERITIES.map((s) => (
                      <MenuItem key={s} value={s}>
                        {EPISODE_SEVERITY_LABEL[s]}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
                <FormControl fullWidth>
                  <InputLabel id="episode-form-outcome">Stav</InputLabel>
                  <Select
                    labelId="episode-form-outcome"
                    label="Stav"
                    value={state.outcome}
                    onChange={(e) => update('outcome', e.target.value as EpisodeOutcome)}
                  >
                    {EPISODE_OUTCOMES.map((o) => (
                      <MenuItem key={o} value={o}>
                        {EPISODE_OUTCOME_LABEL[o]}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Stack>
              <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
                <TextField
                  label="Začiatok"
                  type="date"
                  value={state.startedAt}
                  onChange={(e) => update('startedAt', e.target.value)}
                  InputLabelProps={{ shrink: true }}
                  fullWidth
                />
                <TextField
                  label="Koniec (voliteľné)"
                  type="date"
                  value={state.endedAt}
                  onChange={(e) => update('endedAt', e.target.value)}
                  InputLabelProps={{ shrink: true }}
                  fullWidth
                />
                <TextField
                  label="Miesto"
                  placeholder="napr. na výlete v Tatrách"
                  value={state.location}
                  onChange={(e) => update('location', e.target.value)}
                  fullWidth
                />
              </Stack>
              <StringListEditor
                label="Spúšťače (voliteľné)"
                placeholder="Stres, nové krmivo, kliešť..."
                values={state.triggers}
                onChange={(v) => update('triggers', v)}
              />
            </Stack>
          </Box>

          <Divider />

          <Box>
            <Typography variant="subtitle1" sx={{ fontWeight: 700, mb: 1 }}>
              Diagnóza a liečba
            </Typography>
            <Stack spacing={2}>
              <TextField
                label="Diagnóza (od veterinára alebo predpoklad)"
                value={state.diagnosis}
                onChange={(e) => update('diagnosis', e.target.value)}
                multiline
                minRows={2}
                fullWidth
              />
              <FormControl fullWidth>
                <InputLabel id="episode-form-visit">Súvisiaca návšteva veterinára</InputLabel>
                <Select
                  labelId="episode-form-visit"
                  label="Súvisiaca návšteva veterinára"
                  value={state.vetVisitId}
                  onChange={(e) => update('vetVisitId', e.target.value)}
                >
                  <MenuItem value="">
                    <em>Žiadna</em>
                  </MenuItem>
                  {dogVetVisits.map((v) => (
                    <MenuItem key={v.id} value={v.id}>
                      {v.clinicName}
                      {v.date ? ` – ${new Date(v.date).toLocaleDateString('sk-SK')}` : ''}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
              <FormControl fullWidth>
                <InputLabel id="episode-form-meds">Použité lieky</InputLabel>
                <Select
                  labelId="episode-form-meds"
                  label="Použité lieky"
                  multiple
                  value={state.medicationIds}
                  onChange={(e) =>
                    update(
                      'medicationIds',
                      typeof e.target.value === 'string'
                        ? e.target.value.split(',')
                        : e.target.value
                    )
                  }
                  renderValue={(selected) =>
                    selected
                      .map((id) => dogMedications.find((m) => m.id === id)?.name ?? id)
                      .join(', ')
                  }
                >
                  {dogMedications.length === 0 && (
                    <MenuItem disabled value="">
                      Žiadne lieky v zdravotnom pase
                    </MenuItem>
                  )}
                  {dogMedications.map((m) => (
                    <MenuItem key={m.id} value={m.id}>
                      {m.name}
                      {m.dose ? ` (${m.dose})` : ''}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
              <TextField
                label="Poznámky k liečbe"
                value={state.treatmentNotes}
                onChange={(e) => update('treatmentNotes', e.target.value)}
                multiline
                minRows={2}
                fullWidth
              />
            </Stack>
          </Box>

          <Divider />

          <Box>
            <Typography variant="subtitle1" sx={{ fontWeight: 700, mb: 1 }}>
              Výsledok
            </Typography>
            <Stack spacing={2}>
              <StringListEditor
                label="Čo zabralo"
                placeholder="napr. lieky XY, diéta, pokoj"
                values={state.whatWorked}
                onChange={(v) => update('whatWorked', v)}
                chipColor="success"
              />
              <StringListEditor
                label="Čo nezabralo"
                placeholder="napr. liek YZ, neúčinné opatrenie"
                values={state.whatDidntWork}
                onChange={(v) => update('whatDidntWork', v)}
                chipColor="error"
              />
            </Stack>
          </Box>

          <Divider />

          <Box>
            <Typography variant="subtitle1" sx={{ fontWeight: 700, mb: 1 }}>
              Poučenie pre budúcnosť
            </Typography>
            <TextField
              label="Čo si nabudúce zapamätať"
              placeholder="napr. pri reflukse hneď podať Y, vyhnúť sa Z"
              value={state.lessonsLearned}
              onChange={(e) => update('lessonsLearned', e.target.value)}
              multiline
              minRows={3}
              fullWidth
            />
          </Box>

          <Divider />

          <AttachmentGallery
            attachments={state.attachments}
            onChange={(v) => update('attachments', v)}
          />
        </Stack>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Zrušiť</Button>
        <Button variant="contained" onClick={handleSave} disabled={!canSave}>
          Uložiť
        </Button>
      </DialogActions>
    </Dialog>
  );
}
