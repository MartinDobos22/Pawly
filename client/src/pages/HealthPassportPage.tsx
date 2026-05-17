import { useCallback, useMemo, useState } from 'react';
import {
  Alert,
  Box,
  Button,
  Card,
  FormControl,
  InputLabel,
  MenuItem,
  Select,
  Stack,
  Typography,
} from '@mui/material';
import {
  HealthAndSafety as HealthIcon,
  Add as AddIcon,
  Description as CardIcon,
} from '@mui/icons-material';

import type { PetProfile } from '../types';
import type {
  DewormingRecord,
  DietEntry,
  EctoparasiteRecord,
  ExpenseCategory,
  ExpenseRecord,
  MedicationDoseLog,
  MedicationRecord,
  TimelineEvent,
  VaccinationRecord,
  VetVisitRecord,
} from '../types/dogHealth';

import { useLocalStorage } from '../hooks/useLocalStorage';
import type { VisitBundle } from '../utils/vetVisitHelper';

// Sub-components
import HealthStatusOverview from '../components/healthPassport/HealthStatusOverview.tsx';
import UpcomingTasksCard from '../components/healthPassport/UpcomingTasksCard.tsx';
import ExpenseSummaryCard from '../components/healthPassport/ExpenseSummaryCard';
import HealthTimeline from '../components/healthPassport/HealthTimeline';
import AddRecord from '../components/healthPassport/AddRecord';
import QuickVisitButton from '../components/healthPassport/QuickVisitButton';
import VisitDetailDialog from '../components/healthPassport/VisitDetailDialog';
import TimelineRecordDetailDialog from '../components/healthPassport/TimelineRecordDetailDialog';
import type { RecordDetailState } from '../components/healthPassport/TimelineRecordDetailDialog';

// Utilities and types
import {
  statusByDate,
  computeIntervalDaysFromDates,
  escapeHtml,
} from '../components/healthPassport/utils';
import { TIMELINE_TYPE_META } from '../components/healthPassport/constants';

export default function HealthPassportPage() {
  // ── Dog selection ──────────────────────────────────────────────────────────
  const [profiles] = useLocalStorage<PetProfile[]>('granule-check-pet-profiles', []);
  const dogProfiles = useMemo(() => profiles.filter((p) => p.animalType === 'dog'), [profiles]);
  const [selectedDogId, setSelectedDogId] = useState(dogProfiles[0]?.id ?? '');

  // ── Health records ────────────────────────────────────────────────────────
  const [vaccinations, setVaccinations] = useLocalStorage<VaccinationRecord[]>(
    'dog-health-vaccinations',
    []
  );
  const [dewormings, setDewormings] = useLocalStorage<DewormingRecord[]>(
    'dog-health-dewormings',
    []
  );
  const [ectos, setEctos] = useLocalStorage<EctoparasiteRecord[]>('dog-health-ectos', []);
  const [visits, setVisits] = useLocalStorage<VetVisitRecord[]>('dog-health-visits', []);
  const [medications, setMedications] = useLocalStorage<MedicationRecord[]>(
    'dog-health-medications',
    []
  );
  const [doseLogs, setDoseLogs] = useLocalStorage<MedicationDoseLog[]>(
    'dog-health-med-dose-logs',
    []
  );
  const [dietEntries, setDietEntries] = useLocalStorage<DietEntry[]>('dog-health-diet-entries', []);
  const [expenses, setExpenses] = useLocalStorage<ExpenseRecord[]>('dog-health-expenses', []);

  // ── Filtered by dog ────────────────────────────────────────────────────────
  const dogVaccinations = vaccinations.filter((v) => v.dogId === selectedDogId);
  const dogDewormings = dewormings.filter((v) => v.dogId === selectedDogId);
  const dogEctos = ectos.filter((v) => v.dogId === selectedDogId);
  const dogVisits = visits.filter((v) => v.dogId === selectedDogId);
  const dogMeds = medications.filter((v) => v.dogId === selectedDogId);
  const dogDoseLogs = doseLogs.filter((v) => v.dogId === selectedDogId);
  const dogDiet = dietEntries.filter((v) => v.dogId === selectedDogId);
  const dogExpenses = expenses.filter((v) => v.dogId === selectedDogId);

  const latestDietId = [...dogDiet].sort((a, b) => b.startedAt.localeCompare(a.startedAt))[0]?.id;

  // ── Status semaphores ──────────────────────────────────────────────────────
  const vaccinationStatus = dogVaccinations.length
    ? statusByDate(
        [...dogVaccinations].sort((a, b) => b.validUntil.localeCompare(a.validUntil))[0].validUntil,
        30
      )
    : 'UNKNOWN';
  const dewormingStatus = dogDewormings.length
    ? statusByDate(
        [...dogDewormings].sort((a, b) => b.nextDueDate.localeCompare(a.nextDueDate))[0]
          .nextDueDate,
        7
      )
    : 'UNKNOWN';
  const ectoStatus = dogEctos.length
    ? statusByDate(
        [...dogEctos].sort((a, b) => b.nextDueDate.localeCompare(a.nextDueDate))[0].nextDueDate,
        7
      )
    : 'UNKNOWN';

  const currentDiet = [...dogDiet].sort((a, b) => b.startedAt.localeCompare(a.startedAt))[0];

  // ── Timeline ───────────────────────────────────────────────────────────────
  const timeline: TimelineEvent[] = useMemo(() => {
    const t: TimelineEvent[] = [];
    dogVaccinations.forEach((v) =>
      t.push({
        id: `vac-${v.id}`,
        dogId: v.dogId,
        type: 'VACCINATION',
        title: `Očkovanie: ${v.name}`,
        subtitle: `Platnosť do ${v.validUntil}`,
        date: v.dateApplied,
      })
    );
    dogDewormings.forEach((v) =>
      t.push({
        id: `dew-${v.id}`,
        dogId: v.dogId,
        type: 'DEWORMING',
        title: `Odčervenie: ${v.productName}`,
        subtitle: `Ďalší termín ${v.nextDueDate}`,
        date: v.dateGiven,
      })
    );
    dogEctos.forEach((v) =>
      t.push({
        id: `ect-${v.id}`,
        dogId: v.dogId,
        type: 'ECTOPARASITE',
        title: `Antiparazitikum: ${v.productName}`,
        subtitle: `Ďalší termín ${v.nextDueDate}`,
        date: v.dateGiven,
      })
    );
    dogVisits.forEach((v) =>
      t.push({
        id: `visit-${v.id}`,
        dogId: v.dogId,
        type: 'VET_VISIT',
        title: `Veterinár: ${v.clinicName}`,
        subtitle: v.reason,
        date: v.date,
      })
    );
    dogMeds.forEach((v) =>
      t.push({
        id: `med-${v.id}`,
        dogId: v.dogId,
        type: 'MEDICATION',
        title: `Liek: ${v.name}`,
        subtitle: `${v.dose}, ${v.frequency}`,
        date: v.startDate,
      })
    );
    dogDiet.forEach((v) =>
      t.push({
        id: `diet-${v.id}`,
        dogId: v.dogId,
        type: 'DIET',
        title: `Diéta: ${v.foodName}`,
        subtitle: v.suitabilityStatus,
        date: v.startedAt,
      })
    );
    dogExpenses.forEach((v) =>
      t.push({
        id: `exp-${v.id}`,
        dogId: v.dogId,
        type: 'EXPENSE',
        title: `Výdavok ${v.amount.toFixed(2)} €`,
        subtitle: v.category,
        date: v.date,
      })
    );
    return t.sort((a, b) => b.date.localeCompare(a.date));
  }, [dogVaccinations, dogDewormings, dogEctos, dogVisits, dogMeds, dogDiet, dogExpenses]);

  // ── Wizard / dialog state ──────────────────────────────────────────────────
  const [wizardOpen, setWizardOpen] = useState(false);
  const [selectedVisitId, setSelectedVisitId] = useState<string | null>(null);
  const [selectedRecord, setSelectedRecord] = useState<RecordDetailState | null>(null);

  const dispatchBundle = useCallback(
    (bundle: VisitBundle) => {
      setVisits((p) => [...p, bundle.visit]);
      if (bundle.vaccinations.length) setVaccinations((p) => [...p, ...bundle.vaccinations]);
      if (bundle.dewormings.length) setDewormings((p) => [...p, ...bundle.dewormings]);
      if (bundle.ectos.length) setEctos((p) => [...p, ...bundle.ectos]);
      if (bundle.medications.length) setMedications((p) => [...p, ...bundle.medications]);
      if (bundle.doseLogs.length) setDoseLogs((p) => [...p, ...bundle.doseLogs]);
      if (bundle.dietEntries.length) setDietEntries((p) => [...p, ...bundle.dietEntries]);
      if (bundle.expenses.length) setExpenses((p) => [...p, ...bundle.expenses]);
    },
    [
      setVisits,
      setVaccinations,
      setDewormings,
      setEctos,
      setMedications,
      setDoseLogs,
      setDietEntries,
      setExpenses,
    ]
  );

  const handleQuickVisitCreate = useCallback(
    (visit: VetVisitRecord) => setVisits((p) => [...p, visit]),
    [setVisits]
  );
  const handleQuickVisitUndo = useCallback(
    (id: string) => setVisits((p) => p.filter((v) => v.id !== id)),
    [setVisits]
  );

  // ── Timeline open detail ────────────────────────────────────────────────────
  const handleOpenDetail = useCallback((event: TimelineEvent) => {
    if (event.type === 'VET_VISIT') {
      setSelectedVisitId(event.id.replace('visit-', ''));
    } else {
      const recordId = event.id.replace(/^[^-]+-/, '');
      setSelectedRecord({ id: recordId, type: event.type as RecordDetailState['type'] });
    }
  }, []);

  // ── Visit save/delete ───────────────────────────────────────────────────────
  const handleSaveVisit = useCallback(
    (draft: Parameters<React.ComponentProps<typeof VisitDetailDialog>['onSave']>[0]) => {
      if (!selectedVisitId) return;
      setVisits((p) =>
        p.map((v) =>
          v.id !== selectedVisitId
            ? v
            : {
                ...v,
                date: draft.date,
                clinicName: draft.clinicName,
                vetName: draft.vetName.trim() || undefined,
                reason: draft.reason,
                findings: draft.findings.trim() || undefined,
                diagnosis: draft.diagnosis.trim() || undefined,
                recommendations: draft.recommendations.trim() || undefined,
                nextCheckDate: draft.nextCheckDate || undefined,
              }
        )
      );
    },
    [selectedVisitId, setVisits]
  );

  const handleDeleteVisit = useCallback(() => {
    if (!selectedVisitId) return;
    setVisits((p) => p.filter((v) => v.id !== selectedVisitId));
    setSelectedVisitId(null);
  }, [selectedVisitId, setVisits]);

  // ── Record save handlers ────────────────────────────────────────────────────
  const handleSaveVaccination = useCallback(
    (
      id: string,
      draft: {
        name: string;
        type: VaccinationRecord['type'];
        dateApplied: string;
        validUntil: string;
        batchNumber: string;
      }
    ) => {
      setVaccinations((p) =>
        p.map((item) =>
          item.id !== id ? item : { ...item, ...draft, batchNumber: draft.batchNumber || undefined }
        )
      );
    },
    [setVaccinations]
  );

  const handleSaveDeworming = useCallback(
    (id: string, draft: { productName: string; dateGiven: string; nextDueDate: string }) => {
      setDewormings((p) =>
        p.map((item) =>
          item.id !== id
            ? item
            : {
                ...item,
                ...draft,
                intervalDays: computeIntervalDaysFromDates(draft.dateGiven, draft.nextDueDate, 90),
              }
        )
      );
    },
    [setDewormings]
  );

  const handleSaveEcto = useCallback(
    (
      id: string,
      draft: {
        productName: string;
        form: EctoparasiteRecord['form'];
        dateGiven: string;
        nextDueDate: string;
      }
    ) => {
      setEctos((p) =>
        p.map((item) =>
          item.id !== id
            ? item
            : {
                ...item,
                ...draft,
                intervalDays: computeIntervalDaysFromDates(draft.dateGiven, draft.nextDueDate, 30),
              }
        )
      );
    },
    [setEctos]
  );

  const handleSaveMedication = useCallback(
    (
      id: string,
      draft: {
        name: string;
        reason: string;
        dose: string;
        frequency: string;
        startDate: string;
        endDate: string;
      }
    ) => {
      setMedications((p) =>
        p.map((item) =>
          item.id !== id ? item : { ...item, ...draft, endDate: draft.endDate || undefined }
        )
      );
    },
    [setMedications]
  );

  const handleSaveDiet = useCallback(
    (
      id: string,
      draft: {
        foodName: string;
        startedAt: string;
        endedAt: string;
        reactionNotes: string;
        suitabilityStatus: DietEntry['suitabilityStatus'];
      }
    ) => {
      setDietEntries((p) =>
        p.map((item) =>
          item.id !== id
            ? item
            : {
                ...item,
                ...draft,
                endedAt: draft.endedAt || undefined,
                reactionNotes: draft.reactionNotes || undefined,
              }
        )
      );
    },
    [setDietEntries]
  );

  const handleSaveExpense = useCallback(
    (
      id: string,
      draft: {
        date: string;
        amount: string;
        currency: string;
        category: ExpenseCategory;
        note: string;
      }
    ) => {
      setExpenses((p) =>
        p.map((item) =>
          item.id !== id
            ? item
            : {
                ...item,
                ...draft,
                amount: Number(draft.amount || 0),
                note: draft.note || undefined,
              }
        )
      );
    },
    [setExpenses]
  );

  const handleDeleteRecord = useCallback(() => {
    if (!selectedRecord) return;
    if (selectedRecord.type === 'VACCINATION')
      setVaccinations((p) => p.filter((x) => x.id !== selectedRecord.id));
    else if (selectedRecord.type === 'DEWORMING')
      setDewormings((p) => p.filter((x) => x.id !== selectedRecord.id));
    else if (selectedRecord.type === 'ECTOPARASITE')
      setEctos((p) => p.filter((x) => x.id !== selectedRecord.id));
    else if (selectedRecord.type === 'MEDICATION') {
      setMedications((p) => p.filter((x) => x.id !== selectedRecord.id));
      setDoseLogs((p) => p.filter((x) => x.medicationId !== selectedRecord.id));
      setVisits((p) =>
        p.map((v) => ({
          ...v,
          medicationIds: v.medicationIds.filter((mid) => mid !== selectedRecord.id),
        }))
      );
    } else if (selectedRecord.type === 'DIET')
      setDietEntries((p) => p.filter((x) => x.id !== selectedRecord.id));
    else if (selectedRecord.type === 'EXPENSE')
      setExpenses((p) => p.filter((x) => x.id !== selectedRecord.id));
    setSelectedRecord(null);
  }, [
    selectedRecord,
    setVaccinations,
    setDewormings,
    setEctos,
    setMedications,
    setDoseLogs,
    setVisits,
    setDietEntries,
    setExpenses,
  ]);

  // ── PDF export ──────────────────────────────────────────────────────────────
  const handleExportPdf = useCallback(() => {
    const dog = dogProfiles.find((d) => d.id === selectedDogId);
    if (!dog) return;
    const rows = timeline
      .map((event) => {
        const meta = TIMELINE_TYPE_META[event.type];
        return `<tr><td>${escapeHtml(event.date)}</td><td>${escapeHtml(meta.label)}</td><td>${escapeHtml(event.title)}${event.subtitle ? `<br><small>${escapeHtml(event.subtitle)}</small>` : ''}</td></tr>`;
      })
      .join('');
    const html = `<!doctype html><html lang="sk"><head><meta charset="utf-8"><title>Timeline – ${escapeHtml(dog.name)}</title><style>body{font-family:system-ui,sans-serif;padding:24px;color:#111}h1{font-size:22px;margin-bottom:16px}table{width:100%;border-collapse:collapse;font-size:13px}th,td{border:1px solid #e2e8f0;padding:8px 10px;text-align:left;vertical-align:top}th{background:#f1f5f9;font-weight:700}small{color:#64748b}@media print{body{padding:0}}</style></head><body><h1>Zdravotná timeline – ${escapeHtml(dog.name)}</h1><table><thead><tr><th>Dátum</th><th>Typ</th><th>Detail</th></tr></thead><tbody>${rows}</tbody></table></body></html>`;
    const iframe = document.createElement('iframe');
    iframe.style.cssText =
      'position:fixed;top:0;left:0;width:0;height:0;border:0;visibility:hidden;';
    document.body.appendChild(iframe);
    const doc = iframe.contentDocument ?? iframe.contentWindow?.document;
    if (!doc) {
      document.body.removeChild(iframe);
      return;
    }
    doc.open();
    doc.write(html);
    doc.close();
    const win = iframe.contentWindow!;
    win.addEventListener('load', () => {
      setTimeout(() => {
        win.focus();
        win.print();
        setTimeout(() => {
          if (document.body.contains(iframe)) document.body.removeChild(iframe);
        }, 2000);
      }, 500);
    });
  }, [timeline, dogProfiles, selectedDogId]);

  // ── Early return if no dogs ─────────────────────────────────────────────────
  if (!dogProfiles.length) {
    return (
      <Alert severity="info" sx={{ borderRadius: 3 }}>
        Najprv si vytvorte profil psa v sekcii <strong>Profily</strong>.
      </Alert>
    );
  }

  const selectedDog = dogProfiles.find((d) => d.id === selectedDogId);
  const selectedVisit = selectedVisitId
    ? (dogVisits.find((v) => v.id === selectedVisitId) ?? null)
    : null;

  // ── Render ─────────────────────────────────────────────────────────────────
  return (
    <Box>
      {/* ── Page header — flat outlined ───────────────────────────────────── */}
      <Card sx={{ mb: 1.5, p: { xs: 1.5, md: 2 } }}>
        <Stack
          direction={{ xs: 'column', md: 'row' }}
          alignItems={{ xs: 'flex-start', md: 'center' }}
          justifyContent="space-between"
          gap={2}
        >
          <Stack direction="row" alignItems="center" gap={1.5}>
            <Box
              sx={{
                width: 40,
                height: 40,
                borderRadius: 1,
                bgcolor: 'action.hover',
                color: 'primary.main',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <HealthIcon sx={{ fontSize: 22 }} />
            </Box>
            <Box>
              <Typography variant="h5" sx={{ fontWeight: 600, lineHeight: 1.2 }}>
                Zdravotný pas
              </Typography>
              {selectedDog && (
                <Typography variant="body2" sx={{ color: 'text.secondary', mt: 0.25 }}>
                  {selectedDog.name}
                  {selectedDog.breed ? ` · ${selectedDog.breed}` : ''}
                  {selectedDog.weightKg ? ` · ${selectedDog.weightKg} kg` : ''}
                </Typography>
              )}
            </Box>
          </Stack>

          <Stack direction="row" flexWrap="wrap" gap={1}>
            {dogProfiles.length > 1 && (
              <FormControl size="small" sx={{ minWidth: 180 }}>
                <InputLabel>Pes</InputLabel>
                <Select
                  value={selectedDogId}
                  label="Pes"
                  onChange={(e) => setSelectedDogId(e.target.value)}
                >
                  {dogProfiles.map((p) => (
                    <MenuItem key={p.id} value={p.id}>
                      {p.name}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            )}
            <Button variant="contained" startIcon={<AddIcon />} onClick={() => setWizardOpen(true)}>
              Pridať záznam
            </Button>
            <QuickVisitButton
              dogId={selectedDogId}
              disabled={!selectedDogId}
              onCreate={handleQuickVisitCreate}
              onUndo={handleQuickVisitUndo}
            />
            <Button variant="outlined" startIcon={<CardIcon />} href="/karta-pre-veterinara">
              Karta
            </Button>
          </Stack>
        </Stack>
      </Card>

      {/* ── Status overview ────────────────────────────────────────────────── */}
      <HealthStatusOverview
        vaccinationStatus={vaccinationStatus}
        dewormingStatus={dewormingStatus}
        ectoStatus={ectoStatus}
        currentDiet={currentDiet}
      />

      {/* ── Dashboard: timeline (left) + tasks/expenses stack (right) ─────── */}
      <Box
        sx={{
          display: 'grid',
          gridTemplateColumns: { xs: '1fr', md: 'minmax(0, 2fr) minmax(0, 1fr)' },
          gap: 1.5,
        }}
      >
        <Card sx={{ p: { xs: 1.5, md: 2 } }}>
          <HealthTimeline
            timeline={timeline}
            onOpenDetail={handleOpenDetail}
            onExportPdf={handleExportPdf}
          />
        </Card>
        <Stack spacing={1.5}>
          <UpcomingTasksCard
            vetVisits={dogVisits}
            dewormings={dogDewormings}
            ectos={dogEctos}
            medications={dogMeds}
            doseLogs={dogDoseLogs}
            onToggleDose={(logId) =>
              setDoseLogs((p) => p.map((x) => (x.id === logId ? { ...x, taken: !x.taken } : x)))
            }
          />
          <ExpenseSummaryCard expenses={dogExpenses} />
        </Stack>
      </Box>

      {/* ── Add record dialog ────────────────────────────────────────────── */}
      <AddRecord
        open={wizardOpen}
        dogId={selectedDogId}
        currentDietEntryId={latestDietId}
        onClose={() => setWizardOpen(false)}
        onSave={dispatchBundle}
      />

      {/* ── Visit detail dialog ──────────────────────────────────────────── */}
      <VisitDetailDialog
        visit={selectedVisit}
        open={Boolean(selectedVisitId && selectedVisit)}
        onClose={() => setSelectedVisitId(null)}
        onSave={handleSaveVisit}
        onDelete={handleDeleteVisit}
      />

      {/* ── Record detail dialog ─────────────────────────────────────────── */}
      <TimelineRecordDetailDialog
        state={selectedRecord}
        open={Boolean(selectedRecord)}
        vaccination={
          selectedRecord?.type === 'VACCINATION'
            ? (dogVaccinations.find((x) => x.id === selectedRecord.id) ?? null)
            : null
        }
        deworming={
          selectedRecord?.type === 'DEWORMING'
            ? (dogDewormings.find((x) => x.id === selectedRecord.id) ?? null)
            : null
        }
        ectoparasite={
          selectedRecord?.type === 'ECTOPARASITE'
            ? (dogEctos.find((x) => x.id === selectedRecord.id) ?? null)
            : null
        }
        medication={
          selectedRecord?.type === 'MEDICATION'
            ? (dogMeds.find((x) => x.id === selectedRecord.id) ?? null)
            : null
        }
        diet={
          selectedRecord?.type === 'DIET'
            ? (dogDiet.find((x) => x.id === selectedRecord.id) ?? null)
            : null
        }
        expense={
          selectedRecord?.type === 'EXPENSE'
            ? (dogExpenses.find((x) => x.id === selectedRecord.id) ?? null)
            : null
        }
        onClose={() => setSelectedRecord(null)}
        onSaveVaccination={handleSaveVaccination}
        onSaveDeworming={handleSaveDeworming}
        onSaveEcto={handleSaveEcto}
        onSaveMedication={handleSaveMedication}
        onSaveDiet={handleSaveDiet}
        onSaveExpense={handleSaveExpense}
        onDelete={handleDeleteRecord}
      />
    </Box>
  );
}
