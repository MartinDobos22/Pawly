import { useCallback, useMemo, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Alert, Box, Button, Card, Snackbar, Stack, Typography } from '@mui/material';
import { Pets as PetsIcon } from '@mui/icons-material';

import type {
  DietEntry,
  EctoparasiteRecord,
  ExpenseCategory,
  TimelineEvent,
  VaccinationRecord,
  VetVisitRecord,
} from '../types/petHealth';

import { useActivePet } from '../hooks/useActivePet';
import { useHealthData } from '../hooks/useHealthData';
import { useConfirm } from '../hooks/useConfirm';
import type { VisitBundle } from '../utils/vetVisitHelper';

// Sub-components
import FeatureIntro from '../components/FeatureIntro';
import PassportHero from '../components/healthPassport/PassportHero';
import HealthOverviewRings from '../components/healthPassport/HealthOverviewRings';
import PawlyInsightCard from '../components/healthPassport/PawlyInsightCard';
import MemoryGalleryCard from '../components/healthPassport/MemoryGalleryCard';
import QuickLinksRow from '../components/healthPassport/QuickLinksRow';
import UpcomingTasksCard from '../components/healthPassport/UpcomingTasksCard.tsx';
import ExpenseSummaryCard from '../components/healthPassport/ExpenseSummaryCard';
import HealthTimeline from '../components/healthPassport/HealthTimeline';
import AddRecord from '../components/healthPassport/AddRecord';
import VisitDetailDialog from '../components/healthPassport/VisitDetailDialog';
import WeightTrendCard from '../components/healthPassport/WeightTrendCard';
import TimelineRecordDetailDialog from '../components/healthPassport/TimelineRecordDetailDialog';
import type { RecordDetailState } from '../components/healthPassport/TimelineRecordDetailDialog';
import type { InsightInput, UpcomingDue } from '../components/healthPassport/insight';

// Utilities and types
import {
  statusByDate,
  computeIntervalDaysFromDates,
  escapeHtml,
} from '../components/healthPassport/utils';

export default function HealthPassportPage() {
  const { t, i18n } = useTranslation('healthPassport');
  const { t: tCommon } = useTranslation('common');
  const lang = i18n.language === 'en' ? 'en-US' : 'sk-SK';
  // ── Dog selection (shared via useActivePet) ────────────────────────────────
  const {
    dogProfiles,
    activePetId: selectedDogId,
    selectPet: setSelectedDogId,
    loading: petsLoading,
  } = useActivePet();

  // ── Health records (Supabase cez useHealthData) ─────────────────────────────
  const {
    vaccinations,
    dewormings,
    ectos,
    visits,
    medications,
    doseLogs,
    dietEntries,
    expenses,
    weightLogs,
    addVisitBundle,
    addVisit,
    updateVisit,
    removeVisit,
    updateVaccination,
    updateDeworming,
    updateEcto,
    updateMedication,
    updateDietEntry,
    updateExpense,
    removeVaccination,
    removeDeworming,
    removeEcto,
    removeDietEntry,
    removeExpense,
    removeMedication,
    toggleDose,
  } = useHealthData();
  const { confirm, dialog: confirmDialog } = useConfirm();

  // ── Filtered by dog ────────────────────────────────────────────────────────
  const dogVaccinations = vaccinations.filter((v) => v.petId === selectedDogId);
  const dogDewormings = dewormings.filter((v) => v.petId === selectedDogId);
  const dogEctos = ectos.filter((v) => v.petId === selectedDogId);
  const dogVisits = visits.filter((v) => v.petId === selectedDogId);
  const dogMeds = medications.filter((v) => v.petId === selectedDogId);
  const dogDoseLogs = doseLogs.filter((v) => v.petId === selectedDogId);
  const dogDiet = dietEntries.filter((v) => v.petId === selectedDogId);
  const dogExpenses = expenses.filter((v) => v.petId === selectedDogId);

  const latestDietId = [...dogDiet].sort((a, b) => b.startedAt.localeCompare(a.startedAt))[0]?.id;

  const currentDiet = [...dogDiet].sort((a, b) => b.startedAt.localeCompare(a.startedAt))[0];

  // ── Latest records per domain (for metric cards) ───────────────────────────
  // Sort by date administered (dateApplied / dateGiven), nie validUntil — historický
  // import s pomýleným validUntil by inak prebil reálne novší záznam.
  const latestVaccination = useMemo(
    () => [...dogVaccinations].sort((a, b) => b.dateApplied.localeCompare(a.dateApplied))[0],
    [dogVaccinations]
  );
  const latestDeworming = useMemo(
    () => [...dogDewormings].sort((a, b) => b.dateGiven.localeCompare(a.dateGiven))[0],
    [dogDewormings]
  );
  const latestEcto = useMemo(
    () => [...dogEctos].sort((a, b) => b.dateGiven.localeCompare(a.dateGiven))[0],
    [dogEctos]
  );

  // ── Status semaphores ──────────────────────────────────────────────────────
  const vaccinationStatus = latestVaccination
    ? statusByDate(latestVaccination.validUntil, 30)
    : 'UNKNOWN';
  const dewormingStatus = latestDeworming
    ? statusByDate(latestDeworming.nextDueDate, 7)
    : 'UNKNOWN';
  const ectoStatus = latestEcto ? statusByDate(latestEcto.nextDueDate, 7) : 'UNKNOWN';

  // ── Timeline ───────────────────────────────────────────────────────────────
  const timeline: TimelineEvent[] = useMemo(() => {
    const items: TimelineEvent[] = [];
    dogVaccinations.forEach((v) =>
      items.push({
        id: `vac-${v.id}`,
        petId: v.petId,
        type: 'VACCINATION',
        title: t('timeline.titleVaccination', { name: v.name }),
        subtitle: v.validUntil
          ? t('timeline.subtitleValidUntil', { date: v.validUntil })
          : undefined,
        date: v.dateApplied,
      })
    );
    dogDewormings.forEach((v) =>
      items.push({
        id: `dew-${v.id}`,
        petId: v.petId,
        type: 'DEWORMING',
        title: t('timeline.titleDeworming', { product: v.productName }),
        subtitle: v.nextDueDate
          ? t('timeline.subtitleNextDue', { date: v.nextDueDate })
          : undefined,
        date: v.dateGiven,
      })
    );
    dogEctos.forEach((v) =>
      items.push({
        id: `ect-${v.id}`,
        petId: v.petId,
        type: 'ECTOPARASITE',
        title: t('timeline.titleEcto', { product: v.productName }),
        subtitle: v.nextDueDate
          ? t('timeline.subtitleNextDue', { date: v.nextDueDate })
          : undefined,
        date: v.dateGiven,
      })
    );
    dogVisits.forEach((v) =>
      items.push({
        id: `visit-${v.id}`,
        petId: v.petId,
        type: 'VET_VISIT',
        title: t('timeline.titleVisit', { clinic: v.clinicName }),
        subtitle: v.reason,
        date: v.date,
      })
    );
    dogMeds.forEach((v) =>
      items.push({
        id: `med-${v.id}`,
        petId: v.petId,
        type: 'MEDICATION',
        title: t('timeline.titleMedication', { name: v.name }),
        subtitle: `${v.dose}, ${v.frequency}`,
        date: v.startDate,
      })
    );
    dogDiet.forEach((v) =>
      items.push({
        id: `diet-${v.id}`,
        petId: v.petId,
        type: 'DIET',
        title: t('timeline.titleDiet', { food: v.foodName }),
        subtitle: v.suitabilityStatus,
        date: v.startedAt,
      })
    );
    dogExpenses.forEach((v) =>
      items.push({
        id: `exp-${v.id}`,
        petId: v.petId,
        type: 'EXPENSE',
        title: t('timeline.titleExpense', { amount: v.amount.toFixed(2) }),
        subtitle: v.category,
        date: v.date,
      })
    );
    return items.sort((a, b) => b.date.localeCompare(a.date));
  }, [dogVaccinations, dogDewormings, dogEctos, dogVisits, dogMeds, dogDiet, dogExpenses, t]);

  // ── Wizard / dialog state ──────────────────────────────────────────────────
  const [wizardOpen, setWizardOpen] = useState(false);
  const timelineRef = useRef<HTMLDivElement>(null);
  const expensesRef = useRef<HTMLDivElement>(null);
  const [selectedVisitId, setSelectedVisitId] = useState<string | null>(null);
  const [selectedRecord, setSelectedRecord] = useState<RecordDetailState | null>(null);
  const [snack, setSnack] = useState<{ open: boolean; msg: string; severity: 'success' | 'error' }>(
    {
      open: false,
      msg: '',
      severity: 'success',
    }
  );

  const dispatchBundle = useCallback(
    (bundle: VisitBundle) => {
      void addVisitBundle(bundle);
    },
    [addVisitBundle]
  );

  const handleQuickVisitCreate = useCallback(
    (visit: VetVisitRecord) => addVisit(visit),
    [addVisit]
  );
  const handleQuickVisitUndo = useCallback((id: string) => removeVisit(id), [removeVisit]);

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
    async (draft: Parameters<React.ComponentProps<typeof VisitDetailDialog>['onSave']>[0]) => {
      if (!selectedVisitId) return;
      try {
        await updateVisit(selectedVisitId, {
          date: draft.date,
          clinicName: draft.clinicName,
          vetName: draft.vetName.trim() || undefined,
          reason: draft.reason,
          findings: draft.findings.trim() || undefined,
          diagnosis: draft.diagnosis.trim() || undefined,
          recommendations: draft.recommendations.trim() || undefined,
          nextCheckDate: draft.nextCheckDate || undefined,
        });
        setSnack({ open: true, msg: tCommon('saved'), severity: 'success' });
      } catch {
        setSnack({ open: true, msg: tCommon('saveFailed'), severity: 'error' });
      }
    },
    [selectedVisitId, updateVisit, tCommon]
  );

  const handleDeleteVisit = useCallback(async () => {
    if (!selectedVisitId) return;
    const ok = await confirm({
      title: tCommon('actions.confirmDeleteRecordTitle'),
      message: tCommon('actions.confirmDeleteRecordMessage'),
      confirmLabel: tCommon('actions.delete'),
      danger: true,
    });
    if (!ok) return;
    void removeVisit(selectedVisitId);
    setSelectedVisitId(null);
  }, [selectedVisitId, removeVisit, confirm, tCommon]);

  // ── Record save handlers ────────────────────────────────────────────────────
  const handleSaveVaccination = useCallback(
    async (
      id: string,
      draft: {
        name: string;
        type: VaccinationRecord['type'];
        dateApplied: string;
        validUntil: string;
        batchNumber: string;
      }
    ) => {
      try {
        await updateVaccination(id, { ...draft, batchNumber: draft.batchNumber || undefined });
        setSnack({ open: true, msg: tCommon('saved'), severity: 'success' });
      } catch {
        setSnack({ open: true, msg: tCommon('saveFailed'), severity: 'error' });
      }
    },
    [updateVaccination, tCommon]
  );

  const handleSaveDeworming = useCallback(
    async (id: string, draft: { productName: string; dateGiven: string; nextDueDate: string }) => {
      try {
        await updateDeworming(id, {
          ...draft,
          intervalDays: computeIntervalDaysFromDates(draft.dateGiven, draft.nextDueDate, 90),
        });
        setSnack({ open: true, msg: tCommon('saved'), severity: 'success' });
      } catch {
        setSnack({ open: true, msg: tCommon('saveFailed'), severity: 'error' });
      }
    },
    [updateDeworming, tCommon]
  );

  const handleSaveEcto = useCallback(
    async (
      id: string,
      draft: {
        productName: string;
        form: EctoparasiteRecord['form'];
        dateGiven: string;
        nextDueDate: string;
      }
    ) => {
      try {
        await updateEcto(id, {
          ...draft,
          intervalDays: computeIntervalDaysFromDates(draft.dateGiven, draft.nextDueDate, 30),
        });
        setSnack({ open: true, msg: tCommon('saved'), severity: 'success' });
      } catch {
        setSnack({ open: true, msg: tCommon('saveFailed'), severity: 'error' });
      }
    },
    [updateEcto, tCommon]
  );

  const handleSaveMedication = useCallback(
    async (
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
      try {
        await updateMedication(id, { ...draft, endDate: draft.endDate || undefined });
        setSnack({ open: true, msg: tCommon('saved'), severity: 'success' });
      } catch {
        setSnack({ open: true, msg: tCommon('saveFailed'), severity: 'error' });
      }
    },
    [updateMedication, tCommon]
  );

  const handleSaveDiet = useCallback(
    async (
      id: string,
      draft: {
        foodName: string;
        startedAt: string;
        endedAt: string;
        reactionNotes: string;
        suitabilityStatus: DietEntry['suitabilityStatus'];
      }
    ) => {
      try {
        await updateDietEntry(id, {
          ...draft,
          endedAt: draft.endedAt || undefined,
          reactionNotes: draft.reactionNotes || undefined,
        });
        setSnack({ open: true, msg: tCommon('saved'), severity: 'success' });
      } catch {
        setSnack({ open: true, msg: tCommon('saveFailed'), severity: 'error' });
      }
    },
    [updateDietEntry, tCommon]
  );

  const handleSaveExpense = useCallback(
    async (
      id: string,
      draft: {
        date: string;
        amount: string;
        currency: string;
        category: ExpenseCategory;
        note: string;
      }
    ) => {
      try {
        await updateExpense(id, {
          ...draft,
          amount: Number(draft.amount || 0),
          note: draft.note || undefined,
        });
        setSnack({ open: true, msg: tCommon('saved'), severity: 'success' });
      } catch {
        setSnack({ open: true, msg: tCommon('saveFailed'), severity: 'error' });
      }
    },
    [updateExpense, tCommon]
  );

  const handleDeleteRecord = useCallback(async () => {
    if (!selectedRecord) return;
    const ok = await confirm({
      title: tCommon('actions.confirmDeleteRecordTitle'),
      message: tCommon('actions.confirmDeleteRecordMessage'),
      confirmLabel: tCommon('actions.delete'),
      danger: true,
    });
    if (!ok) return;
    if (selectedRecord.type === 'VACCINATION') void removeVaccination(selectedRecord.id);
    else if (selectedRecord.type === 'DEWORMING') void removeDeworming(selectedRecord.id);
    else if (selectedRecord.type === 'ECTOPARASITE') void removeEcto(selectedRecord.id);
    else if (selectedRecord.type === 'MEDICATION') void removeMedication(selectedRecord.id);
    else if (selectedRecord.type === 'DIET') void removeDietEntry(selectedRecord.id);
    else if (selectedRecord.type === 'EXPENSE') void removeExpense(selectedRecord.id);
    setSelectedRecord(null);
  }, [
    selectedRecord,
    removeVaccination,
    removeDeworming,
    removeEcto,
    removeMedication,
    removeDietEntry,
    removeExpense,
    confirm,
    tCommon,
  ]);

  // ── PDF export ──────────────────────────────────────────────────────────────
  const handleExportPdf = useCallback(() => {
    const dog = dogProfiles.find((d) => d.id === selectedDogId);
    if (!dog) return;
    const rows = timeline
      .map((event) => {
        return `<tr><td>${escapeHtml(event.date)}</td><td>${escapeHtml(t(`timeline.${event.type}` as never))}</td><td>${escapeHtml(event.title)}${event.subtitle ? `<br><small>${escapeHtml(event.subtitle)}</small>` : ''}</td></tr>`;
      })
      .join('');
    const html = `<!doctype html><html lang="${lang.split('-')[0]}"><head><meta charset="utf-8"><title>${escapeHtml(t('page.exportTitle', { name: dog.name }))}</title><style>body{font-family:system-ui,sans-serif;padding:24px;color:#111}h1{font-size:22px;margin-bottom:16px}table{width:100%;border-collapse:collapse;font-size:13px}th,td{border:1px solid #e2e8f0;padding:8px 10px;text-align:left;vertical-align:top}th{background:#f1f5f9;font-weight:700}small{color:#64748b}@media print{body{padding:0}}</style></head><body><h1>${escapeHtml(t('page.exportTitle', { name: dog.name }))}</h1><table><thead><tr><th>${escapeHtml(t('page.exportColDate'))}</th><th>${escapeHtml(t('page.exportColType'))}</th><th>${escapeHtml(t('page.exportColDetail'))}</th></tr></thead><tbody>${rows}</tbody></table></body></html>`;
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
  }, [timeline, dogProfiles, selectedDogId, t, lang]);

  // ── Early return if no dogs ─────────────────────────────────────────────────
  if (petsLoading) return null;
  if (!dogProfiles.length) {
    return (
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
          <Typography variant="h3" sx={{ fontSize: '1.25rem' }}>
            {t('page.welcomeTitle')}
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ maxWidth: 360 }}>
            {t('page.welcomeDescription')}
          </Typography>
          <Button variant="contained" href="/profily" size="large">
            {t('page.createProfile')}
          </Button>
        </Stack>
      </Card>
    );
  }

  const selectedDog = dogProfiles.find((d) => d.id === selectedDogId);
  const selectedVisit = selectedVisitId
    ? (dogVisits.find((v) => v.id === selectedVisitId) ?? null)
    : null;
  const dietStatus: 'VALID' | 'UNKNOWN' = currentDiet ? 'VALID' : 'UNKNOWN';

  // ── Insight (lokálny, pravidlový — žiadne AI volanie) ────────────────────────
  const weightSeries = [...weightLogs]
    .filter((l) => l.petId === selectedDogId)
    .sort((a, b) => a.date.localeCompare(b.date));
  let weightTrend: InsightInput['weightTrend'] = null;
  let weightDeltaKg: number | null = null;
  if (weightSeries.length >= 2) {
    const delta = weightSeries[weightSeries.length - 1].kg - weightSeries[0].kg;
    weightDeltaKg = delta;
    weightTrend = Math.abs(delta) < 0.05 ? 'flat' : delta > 0 ? 'up' : 'down';
  }
  const latestVisit = [...dogVisits].sort((a, b) => b.date.localeCompare(a.date))[0];
  const hasAnyRecord = Boolean(
    latestVaccination ||
    latestDeworming ||
    latestEcto ||
    dogVisits.length ||
    dogMeds.length ||
    currentDiet ||
    dogExpenses.length
  );
  const upcoming: UpcomingDue[] = [
    { type: 'vaccination', date: latestVaccination?.validUntil },
    { type: 'deworming', date: latestDeworming?.nextDueDate },
    { type: 'ecto', date: latestEcto?.nextDueDate },
    { type: 'visit', date: latestVisit?.nextCheckDate },
  ];
  const insightInput: InsightInput = {
    petName: selectedDog?.name ?? '',
    hasAnyRecord,
    vaccinationStatus,
    dewormingStatus,
    ectoStatus,
    upcoming,
    weightTrend,
    weightDeltaKg,
    allergyCount: selectedDog?.allergies?.length ?? 0,
  };

  const scrollTo = (ref: React.RefObject<HTMLDivElement>) =>
    ref.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });

  // ── Render ─────────────────────────────────────────────────────────────────
  return (
    <Box>
      <FeatureIntro featureKey="passport" icon={<PetsIcon />} />
      {selectedDog && (
        <PassportHero
          dog={selectedDog}
          dogProfiles={dogProfiles}
          selectedDogId={selectedDogId}
          onSelectDog={setSelectedDogId}
          vaccinationStatus={vaccinationStatus}
          dewormingStatus={dewormingStatus}
          ectoStatus={ectoStatus}
          dietStatus={dietStatus}
          vaccinationDueDate={latestVaccination?.validUntil}
          dewormingDueDate={latestDeworming?.nextDueDate}
          dietName={currentDiet?.foodName}
          onAddRecord={() => setWizardOpen(true)}
          onQuickVisitCreate={handleQuickVisitCreate}
          onQuickVisitUndo={handleQuickVisitUndo}
        />
      )}

      {/* ── Health Overview (rings) + Pawly Insight ─────────────────────────── */}
      <Box
        sx={{
          display: 'grid',
          gridTemplateColumns: { xs: '1fr', md: 'minmax(0, 2fr) minmax(0, 1fr)' },
          gap: 1.5,
          mb: 2.5,
        }}
      >
        <HealthOverviewRings
          vaccinationStatus={vaccinationStatus}
          dewormingStatus={dewormingStatus}
          currentDiet={currentDiet}
          onOpenVaccination={
            latestVaccination
              ? () => setSelectedRecord({ id: latestVaccination.id, type: 'VACCINATION' })
              : () => setWizardOpen(true)
          }
          onOpenDeworming={
            latestDeworming
              ? () => setSelectedRecord({ id: latestDeworming.id, type: 'DEWORMING' })
              : () => setWizardOpen(true)
          }
          onOpenDiet={
            currentDiet
              ? () => setSelectedRecord({ id: currentDiet.id, type: 'DIET' })
              : () => setWizardOpen(true)
          }
        />
        <PawlyInsightCard input={insightInput} />
      </Box>

      {/* ── Health Journey (timeline) + tasks/weight/expenses stack ─────────── */}
      <Box
        sx={{
          display: 'grid',
          gridTemplateColumns: { xs: '1fr', md: 'minmax(0, 2fr) minmax(0, 1fr)' },
          gap: 1.5,
          mb: 2.5,
        }}
      >
        <Card ref={timelineRef} sx={{ p: { xs: 1.5, md: 2 } }}>
          <HealthTimeline
            timeline={timeline}
            onOpenDetail={handleOpenDetail}
            onExportPdf={handleExportPdf}
            heading={t('journey.title')}
            subheading={t('journey.subtitle')}
          />
        </Card>
        <Stack spacing={1.5}>
          <UpcomingTasksCard
            vetVisits={dogVisits}
            dewormings={dogDewormings}
            ectos={dogEctos}
            medications={dogMeds}
            doseLogs={dogDoseLogs}
            onToggleDose={(logId) => {
              void toggleDose(logId);
            }}
          />
          <WeightTrendCard petId={selectedDogId} fallbackWeightKg={selectedDog?.weightKg} />
          <Box ref={expensesRef}>
            <ExpenseSummaryCard expenses={dogExpenses} />
          </Box>
        </Stack>
      </Box>

      {/* ── Memory gallery ──────────────────────────────────────────────────── */}
      <Box sx={{ mb: 2.5 }}>
        <MemoryGalleryCard petName={selectedDog?.name ?? ''} photoUrl={selectedDog?.photoUrl} />
      </Box>

      {/* ── Quick links ─────────────────────────────────────────────────────── */}
      <QuickLinksRow
        onOpenRecords={() => scrollTo(timelineRef)}
        onOpenExpenses={() => scrollTo(expensesRef)}
      />

      {/* ── Add record dialog ────────────────────────────────────────────── */}
      <AddRecord
        open={wizardOpen}
        petId={selectedDogId}
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

      <Snackbar
        open={snack.open}
        autoHideDuration={4000}
        onClose={() => setSnack((s) => ({ ...s, open: false }))}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert
          severity={snack.severity}
          onClose={() => setSnack((s) => ({ ...s, open: false }))}
          sx={{ width: '100%' }}
        >
          {snack.msg}
        </Alert>
      </Snackbar>
      {confirmDialog}
    </Box>
  );
}
