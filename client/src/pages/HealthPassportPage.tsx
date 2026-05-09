import { useCallback, useEffect, useMemo, useState } from 'react';
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

import { useAnalyze } from '../hooks/useAnalyze';
import { useLocalStorage } from '../hooks/useLocalStorage';
import { VetVisitHelper } from '../utils/vetVisitHelper';

// Sub-components
import HealthStatusOverview from "../components/healthPassport/HealthStatusOverview.tsx";
import UpcomingTasksCard from "../components/healthPassport/UpcomingTasksCard.tsx";
import ExpenseSummaryCard from "../components/healthPassport/ExpenseSummaryCard";
import HealthTimeline from '../components/healthPassport/HealthTimeline';
import AddRecordWizard from '../components/healthPassport/AddRecordWizard';
import VisitDetailDialog from '../components/healthPassport/VisitDetailDialog';
import TimelineRecordDetailDialog from '../components/healthPassport/TimelineRecordDetailDialog';
import type { RecordDetailState } from '../components/healthPassport/TimelineRecordDetailDialog';

// Utilities and types
import { uid, today, plusDays, statusByDate, normalizeDateInput, inferAiTargetType, computeIntervalDaysFromDates, escapeHtml } from '../components/healthPassport/utils';
import { VISIT_CATEGORY_OPTIONS, EXAM_SUBCATEGORY_TO_ALIAS, MAX_FILE_SIZE_BYTES, SUPPORTED_FILE_TYPES, TIMELINE_TYPE_META, EXPORTABLE_TIMELINE_TYPES } from '../components/healthPassport/constants';
import type { AiDetectedDraftRecord, AiDetectedRecordType, WizardState } from '../components/healthPassport/hpTypes';

const WIZARD_DEFAULTS: WizardState = {
  date: today(), clinicName: '', reason: '', findings: '', diagnosis: '', recommendations: '', nextCheckDate: '',
  addVaccination: false, vaccineName: '', vaccineType: 'RABIES', vaccineValidUntil: plusDays(today(), 365),
  addDeworming: false, dewormProduct: '', dewormValidUntil: plusDays(today(), 90), dewormInterval: 90,
  addEcto: false, ectoProduct: '', ectoForm: 'TABLET', ectoValidUntil: plusDays(today(), 30), ectoInterval: 30,
  addMedication: false, medName: '', medReason: '', medDose: '', medFrequency: '2x denne', medEndDate: '',
  addDiet: false, foodName: '', reactionNotes: '', suitabilityStatus: 'SUITABLE',
  attachmentLabel: '', attachmentUrl: '', totalExpense: '', extraMedicationExpense: '', extraFoodExpense: '',
};

export default function HealthPassportPage() {
  // ── Dog selection ──────────────────────────────────────────────────────────
  const [profiles] = useLocalStorage<PetProfile[]>('granule-check-pet-profiles', []);
  const dogProfiles = useMemo(() => profiles.filter((p) => p.animalType === 'dog'), [profiles]);
  const [selectedDogId, setSelectedDogId] = useState(dogProfiles[0]?.id ?? '');

  // ── Health records ────────────────────────────────────────────────────────
  const [vaccinations, setVaccinations] = useLocalStorage<VaccinationRecord[]>('dog-health-vaccinations', []);
  const [dewormings, setDewormings] = useLocalStorage<DewormingRecord[]>('dog-health-dewormings', []);
  const [ectos, setEctos] = useLocalStorage<EctoparasiteRecord[]>('dog-health-ectos', []);
  const [visits, setVisits] = useLocalStorage<VetVisitRecord[]>('dog-health-visits', []);
  const [medications, setMedications] = useLocalStorage<MedicationRecord[]>('dog-health-medications', []);
  const [doseLogs, setDoseLogs] = useLocalStorage<MedicationDoseLog[]>('dog-health-med-dose-logs', []);
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

  // ── Status semaphores ──────────────────────────────────────────────────────
  const vaccinationStatus = dogVaccinations.length
    ? statusByDate([...dogVaccinations].sort((a, b) => b.validUntil.localeCompare(a.validUntil))[0].validUntil, 30)
    : 'EXPIRED';
  const dewormingStatus = dogDewormings.length
    ? statusByDate([...dogDewormings].sort((a, b) => b.nextDueDate.localeCompare(a.nextDueDate))[0].nextDueDate, 7)
    : 'EXPIRED';
  const ectoStatus = dogEctos.length
    ? statusByDate([...dogEctos].sort((a, b) => b.nextDueDate.localeCompare(a.nextDueDate))[0].nextDueDate, 7)
    : 'EXPIRED';

  const currentDiet = [...dogDiet].sort((a, b) => b.startedAt.localeCompare(a.startedAt))[0];

  // ── Timeline ───────────────────────────────────────────────────────────────
  const timeline: TimelineEvent[] = useMemo(() => {
    const t: TimelineEvent[] = [];
    dogVaccinations.forEach((v) => t.push({ id: `vac-${v.id}`, dogId: v.dogId, type: 'VACCINATION', title: `Očkovanie: ${v.name}`, subtitle: `Platnosť do ${v.validUntil}`, date: v.dateApplied }));
    dogDewormings.forEach((v) => t.push({ id: `dew-${v.id}`, dogId: v.dogId, type: 'DEWORMING', title: `Odčervenie: ${v.productName}`, subtitle: `Ďalší termín ${v.nextDueDate}`, date: v.dateGiven }));
    dogEctos.forEach((v) => t.push({ id: `ect-${v.id}`, dogId: v.dogId, type: 'ECTOPARASITE', title: `Antiparazitikum: ${v.productName}`, subtitle: `Ďalší termín ${v.nextDueDate}`, date: v.dateGiven }));
    dogVisits.forEach((v) => t.push({ id: `visit-${v.id}`, dogId: v.dogId, type: 'VET_VISIT', title: `Veterinár: ${v.clinicName}`, subtitle: v.reason, date: v.date }));
    dogMeds.forEach((v) => t.push({ id: `med-${v.id}`, dogId: v.dogId, type: 'MEDICATION', title: `Liek: ${v.name}`, subtitle: `${v.dose}, ${v.frequency}`, date: v.startDate }));
    dogDiet.forEach((v) => t.push({ id: `diet-${v.id}`, dogId: v.dogId, type: 'DIET', title: `Diéta: ${v.foodName}`, subtitle: v.suitabilityStatus, date: v.startedAt }));
    dogExpenses.forEach((v) => t.push({ id: `exp-${v.id}`, dogId: v.dogId, type: 'EXPENSE', title: `Výdavok ${v.amount.toFixed(2)} €`, subtitle: v.category, date: v.date }));
    return t.sort((a, b) => b.date.localeCompare(a.date));
  }, [dogVaccinations, dogDewormings, dogEctos, dogVisits, dogMeds, dogDiet, dogExpenses]);

  // ── Wizard state ────────────────────────────────────────────────────────────
  const [wizardOpen, setWizardOpen] = useState(false);
  const [wizardStep, setWizardStep] = useState(0);
  const [wizard, setWizard] = useState<WizardState>(WIZARD_DEFAULTS);
  const [selectedMainCategory, setSelectedMainCategory] = useState('');
  const [selectedSubcategory, setSelectedSubcategory] = useState('');

  // ── Attachment state ────────────────────────────────────────────────────────
  const [attachmentFile, setAttachmentFile] = useState<File | null>(null);
  const [attachmentPreviewUrl, setAttachmentPreviewUrl] = useState('');
  const [attachmentError, setAttachmentError] = useState('');
  const [pendingAttachment, setPendingAttachment] = useState<{ fileName: string; mimeType: string; base64Data: string } | null>(null);

  // ── AI state ─────────────────────────────────────────────────────────────────
  const [aiDetectedRecords, setAiDetectedRecords] = useState<AiDetectedDraftRecord[]>([]);
  const [aiRecordUseVisitDetails, setAiRecordUseVisitDetails] = useState(true);
  const [aiRecordDraft, setAiRecordDraft] = useState({ date: today(), clinicName: '', diagnosis: '', recommendations: '' });
  const [aiRecordFeedback, setAiRecordFeedback] = useState<string | null>(null);

  const { analyzeFile, fileResult, loadingFile, error: fileAnalyzeError } = useAnalyze();

  // ── Dialog state ────────────────────────────────────────────────────────────
  const [selectedVisitId, setSelectedVisitId] = useState<string | null>(null);
  const [selectedRecord, setSelectedRecord] = useState<RecordDetailState | null>(null);

  // ── AI detected records effect ──────────────────────────────────────────────
  useEffect(() => {
    if (!fileResult?.healthPassportInterpretation?.vaccinations) {
      setAiDetectedRecords([]);
      return;
    }
    const records = fileResult.healthPassportInterpretation.vaccinations.map((item, index) => {
      const targetType = inferAiTargetType(item.disease, item.vaccineName);
      const date = normalizeDateInput(item.dateAdministered);
      const fallback = targetType === 'VACCINATION' ? plusDays(date, 365) : plusDays(date, 90);
      return {
        id: `${Date.now()}-${index}`,
        sourceConfidence: item.confidence,
        sourceDisease: item.disease,
        targetType,
        productName: item.vaccineName || item.disease || 'Neznámy záznam',
        date,
        validUntil: normalizeDateInput(item.validUntil ?? fallback),
        batchNumber: item.batchNumber ?? '',
        intervalDays: targetType === 'ECTOPARASITE' ? 30 : 90,
      };
    });
    setAiDetectedRecords(records);
  }, [fileResult]);

  // ── Attachment file handler ─────────────────────────────────────────────────
  const handleAttachmentFileChange = useCallback((file: File | null) => {
    if (!file) { setAttachmentFile(null); setAttachmentPreviewUrl(''); setAttachmentError(''); setPendingAttachment(null); return; }
    if (!SUPPORTED_FILE_TYPES.includes(file.type)) { setAttachmentError('Nepodporovaný typ súboru.'); return; }
    if (file.size > MAX_FILE_SIZE_BYTES) { setAttachmentError('Súbor je príliš veľký (max 5 MB).'); return; }
    const reader = new FileReader();
    reader.onload = () => {
      const raw = typeof reader.result === 'string' ? reader.result : '';
      const base64Data = raw.split(',')[1] ?? '';
      if (!base64Data) { setAttachmentError('Nepodarilo sa načítať súbor.'); return; }
      setAttachmentPreviewUrl(raw);
      setAttachmentFile(file);
      setAttachmentError('');
      setPendingAttachment({ fileName: file.name, mimeType: file.type, base64Data });
    };
    reader.onerror = () => setAttachmentError('Nepodarilo sa načítať súbor.');
    reader.readAsDataURL(file);
  }, []);

  const handleAnalyzeAttachment = useCallback(async () => {
    const selectedExamAlias = selectedSubcategory ? EXAM_SUBCATEGORY_TO_ALIAS[selectedSubcategory] : '';
    if (!selectedExamAlias || !pendingAttachment) return;
    await analyzeFile(pendingAttachment, selectedExamAlias);
  }, [selectedSubcategory, pendingAttachment, analyzeFile]);

  // ── Wizard save ─────────────────────────────────────────────────────────────
  const handleSaveWizard = useCallback(() => {
    if (!selectedDogId || !wizard.clinicName.trim()) return;
    const bundle = VetVisitHelper.createWizardVisitBundle({
      dogId: selectedDogId, draft: wizard,
      mainCategory: selectedMainCategory, subcategory: selectedSubcategory,
      attachmentDraft: { attachmentLabel: wizard.attachmentLabel, attachmentUrl: wizard.attachmentUrl, attachmentPreviewUrl, attachmentFileName: attachmentFile?.name },
      currentDietEntryId: dogDiet[0]?.id,
      plusDays, uid,
    });
    setVisits((p) => [...p, bundle.visit]);
    if (bundle.vaccinations.length) setVaccinations((p) => [...p, ...bundle.vaccinations]);
    if (bundle.dewormings.length) setDewormings((p) => [...p, ...bundle.dewormings]);
    if (bundle.ectos.length) setEctos((p) => [...p, ...bundle.ectos]);
    if (bundle.medications.length) setMedications((p) => [...p, ...bundle.medications]);
    if (bundle.doseLogs.length) setDoseLogs((p) => [...p, ...bundle.doseLogs]);
    if (bundle.dietEntries.length) setDietEntries((p) => [...p, ...bundle.dietEntries]);
    if (bundle.expenses.length) setExpenses((p) => [...p, ...bundle.expenses]);
    // Reset
    setWizardOpen(false); setWizardStep(0); setWizard({ ...WIZARD_DEFAULTS, date: today(), vaccineValidUntil: plusDays(today(), 365), dewormValidUntil: plusDays(today(), 90), ectoValidUntil: plusDays(today(), 30) });
    setAttachmentFile(null); setAttachmentPreviewUrl(''); setAttachmentError(''); setPendingAttachment(null);
    setSelectedMainCategory(''); setSelectedSubcategory('');
  }, [selectedDogId, wizard, selectedMainCategory, selectedSubcategory, attachmentPreviewUrl, attachmentFile, dogDiet, setVisits, setVaccinations, setDewormings, setEctos, setMedications, setDoseLogs, setDietEntries, setExpenses]);

  // ── AI record save ──────────────────────────────────────────────────────────
  const selectedExamAlias = selectedSubcategory ? EXAM_SUBCATEGORY_TO_ALIAS[selectedSubcategory] : '';
  const hasSelectedAiRecords = aiDetectedRecords.some((r) => r.targetType !== 'SKIP');
  const aiRecordValues = aiRecordUseVisitDetails
    ? { date: wizard.date, clinicName: wizard.clinicName, diagnosis: wizard.diagnosis, recommendations: wizard.recommendations }
    : aiRecordDraft;
  const canCreateAiRecord = Boolean(
    selectedDogId && aiRecordValues.clinicName.trim() &&
    ((selectedSubcategory || fileResult?.examAnalysis?.examType) || hasSelectedAiRecords)
  );

  const handleSaveAiRecord = useCallback(() => {
    if (!canCreateAiRecord || !selectedDogId) return;
    const aiSummary = [
      fileResult?.contextAnalysis?.summary ? `Kontext: ${fileResult.contextAnalysis.summary}` : '',
      fileResult?.examAnalysis?.analysis ? `AI analýza: ${fileResult.examAnalysis.analysis}` : '',
    ].filter(Boolean).join('\n\n');
    const selectedRecords = aiDetectedRecords.filter((r) => r.targetType !== 'SKIP').map((r) => ({ ...r, intervalDays: r.intervalDays || (r.targetType === 'ECTOPARASITE' ? 30 : 90) }));
    const bundle = VetVisitHelper.createAiVisitBundle({
      dogId: selectedDogId, draft: aiRecordValues,
      selectedVisitMainCategory: selectedMainCategory, selectedVisitSubcategory: selectedSubcategory,
      examType: fileResult?.examAnalysis?.examType, aiSummary, selectedRecords,
      attachmentDraft: { attachmentLabel: wizard.attachmentLabel, attachmentUrl: wizard.attachmentUrl, attachmentPreviewUrl, attachmentFileName: attachmentFile?.name },
      plusDays, uid,
    });
    setVisits((p) => [...p, bundle.visit]);
    if (bundle.vaccinations.length) setVaccinations((p) => [...p, ...bundle.vaccinations]);
    if (bundle.dewormings.length) setDewormings((p) => [...p, ...bundle.dewormings]);
    if (bundle.ectos.length) setEctos((p) => [...p, ...bundle.ectos]);
    if (bundle.medications.length) setMedications((p) => [...p, ...bundle.medications]);
    setAiRecordFeedback('AI výsledok bol uložený ako zdravotný záznam.');
    setAiDetectedRecords((p) => p.map((r) => ({ ...r, targetType: 'SKIP' })));
  }, [canCreateAiRecord, selectedDogId, fileResult, aiDetectedRecords, aiRecordValues, selectedMainCategory, selectedSubcategory, wizard, attachmentPreviewUrl, attachmentFile, setVisits, setVaccinations, setDewormings, setEctos, setMedications]);

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
  const handleSaveVisit = useCallback((draft: Parameters<React.ComponentProps<typeof VisitDetailDialog>['onSave']>[0]) => {
    if (!selectedVisitId) return;
    setVisits((p) => p.map((v) => v.id !== selectedVisitId ? v : {
      ...v, date: draft.date, clinicName: draft.clinicName,
      vetName: draft.vetName.trim() || undefined, reason: draft.reason,
      findings: draft.findings.trim() || undefined, diagnosis: draft.diagnosis.trim() || undefined,
      recommendations: draft.recommendations.trim() || undefined, nextCheckDate: draft.nextCheckDate || undefined,
    }));
  }, [selectedVisitId, setVisits]);

  const handleDeleteVisit = useCallback(() => {
    if (!selectedVisitId) return;
    setVisits((p) => p.filter((v) => v.id !== selectedVisitId));
    setSelectedVisitId(null);
  }, [selectedVisitId, setVisits]);

  // ── Record save handlers ────────────────────────────────────────────────────
  const handleSaveVaccination = useCallback((id: string, draft: { name: string; type: VaccinationRecord['type']; dateApplied: string; validUntil: string; batchNumber: string }) => {
    setVaccinations((p) => p.map((item) => item.id !== id ? item : { ...item, ...draft, batchNumber: draft.batchNumber || undefined }));
  }, [setVaccinations]);

  const handleSaveDeworming = useCallback((id: string, draft: { productName: string; dateGiven: string; nextDueDate: string }) => {
    setDewormings((p) => p.map((item) => item.id !== id ? item : {
      ...item, ...draft, intervalDays: computeIntervalDaysFromDates(draft.dateGiven, draft.nextDueDate, 90),
    }));
  }, [setDewormings]);

  const handleSaveEcto = useCallback((id: string, draft: { productName: string; form: EctoparasiteRecord['form']; dateGiven: string; nextDueDate: string }) => {
    setEctos((p) => p.map((item) => item.id !== id ? item : {
      ...item, ...draft, intervalDays: computeIntervalDaysFromDates(draft.dateGiven, draft.nextDueDate, 30),
    }));
  }, [setEctos]);

  const handleSaveMedication = useCallback((id: string, draft: { name: string; reason: string; dose: string; frequency: string; startDate: string; endDate: string }) => {
    setMedications((p) => p.map((item) => item.id !== id ? item : { ...item, ...draft, endDate: draft.endDate || undefined }));
  }, [setMedications]);

  const handleSaveDiet = useCallback((id: string, draft: { foodName: string; startedAt: string; endedAt: string; reactionNotes: string; suitabilityStatus: DietEntry['suitabilityStatus'] }) => {
    setDietEntries((p) => p.map((item) => item.id !== id ? item : { ...item, ...draft, endedAt: draft.endedAt || undefined, reactionNotes: draft.reactionNotes || undefined }));
  }, [setDietEntries]);

  const handleSaveExpense = useCallback((id: string, draft: { date: string; amount: string; currency: string; category: ExpenseCategory; note: string }) => {
    setExpenses((p) => p.map((item) => item.id !== id ? item : { ...item, ...draft, amount: Number(draft.amount || 0), note: draft.note || undefined }));
  }, [setExpenses]);

  const handleDeleteRecord = useCallback(() => {
    if (!selectedRecord) return;
    if (selectedRecord.type === 'VACCINATION') setVaccinations((p) => p.filter((x) => x.id !== selectedRecord.id));
    else if (selectedRecord.type === 'DEWORMING') setDewormings((p) => p.filter((x) => x.id !== selectedRecord.id));
    else if (selectedRecord.type === 'ECTOPARASITE') setEctos((p) => p.filter((x) => x.id !== selectedRecord.id));
    else if (selectedRecord.type === 'MEDICATION') {
      setMedications((p) => p.filter((x) => x.id !== selectedRecord.id));
      setDoseLogs((p) => p.filter((x) => x.medicationId !== selectedRecord.id));
      setVisits((p) => p.map((v) => ({ ...v, medicationIds: v.medicationIds.filter((mid) => mid !== selectedRecord.id) })));
    }
    else if (selectedRecord.type === 'DIET') setDietEntries((p) => p.filter((x) => x.id !== selectedRecord.id));
    else if (selectedRecord.type === 'EXPENSE') setExpenses((p) => p.filter((x) => x.id !== selectedRecord.id));
    setSelectedRecord(null);
  }, [selectedRecord, setVaccinations, setDewormings, setEctos, setMedications, setDoseLogs, setVisits, setDietEntries, setExpenses]);

  // ── PDF export ──────────────────────────────────────────────────────────────
  const handleExportPdf = useCallback(() => {
    const dog = dogProfiles.find((d) => d.id === selectedDogId);
    if (!dog) return;
    const rows = timeline.map((event) => {
      const meta = TIMELINE_TYPE_META[event.type];
      return `<tr><td>${escapeHtml(event.date)}</td><td>${escapeHtml(meta.label)}</td><td>${escapeHtml(event.title)}${event.subtitle ? `<br><small>${escapeHtml(event.subtitle)}</small>` : ''}</td></tr>`;
    }).join('');
    const html = `<!doctype html><html lang="sk"><head><meta charset="utf-8"><title>Timeline – ${escapeHtml(dog.name)}</title><style>body{font-family:system-ui,sans-serif;padding:24px;color:#111}h1{font-size:22px;margin-bottom:16px}table{width:100%;border-collapse:collapse;font-size:13px}th,td{border:1px solid #e2e8f0;padding:8px 10px;text-align:left;vertical-align:top}th{background:#f1f5f9;font-weight:700}small{color:#64748b}@media print{body{padding:0}}</style></head><body><h1>Zdravotná timeline – ${escapeHtml(dog.name)}</h1><table><thead><tr><th>Dátum</th><th>Typ</th><th>Detail</th></tr></thead><tbody>${rows}</tbody></table></body></html>`;
    const iframe = document.createElement('iframe');
    iframe.style.cssText = 'position:fixed;top:0;left:0;width:0;height:0;border:0;visibility:hidden;';
    document.body.appendChild(iframe);
    const doc = iframe.contentDocument ?? iframe.contentWindow?.document;
    if (!doc) { document.body.removeChild(iframe); return; }
    doc.open(); doc.write(html); doc.close();
    const win = iframe.contentWindow!;
    win.addEventListener('load', () => {
      setTimeout(() => { win.focus(); win.print(); setTimeout(() => { if (document.body.contains(iframe)) document.body.removeChild(iframe); }, 2000); }, 500);
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
  const selectedVisit = selectedVisitId ? dogVisits.find((v) => v.id === selectedVisitId) ?? null : null;

  // ── Render ─────────────────────────────────────────────────────────────────
  return (
    <Box>
      {/* ── Page header — flat outlined ───────────────────────────────────── */}
      <Card sx={{ mb: 2, p: { xs: 2, md: 2.5 } }}>
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
                <Select value={selectedDogId} label="Pes" onChange={(e) => setSelectedDogId(e.target.value)}>
                  {dogProfiles.map((p) => <MenuItem key={p.id} value={p.id}>{p.name}</MenuItem>)}
                </Select>
              </FormControl>
            )}
            <Button
              variant="contained"
              startIcon={<AddIcon />}
              onClick={() => setWizardOpen(true)}
            >
              Pridať záznam
            </Button>
            <Button
              variant="outlined"
              startIcon={<CardIcon />}
              href="/karta-pre-veterinara"
            >
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

      {/* ── Quick stats row ────────────────────────────────────────────────── */}
      <Box
        sx={{
          display: 'grid',
          gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' },
          gap: 1.5,
          mb: 2.5,
        }}
      >
        <UpcomingTasksCard
          vetVisits={dogVisits}
          dewormings={dogDewormings}
          ectos={dogEctos}
          medications={dogMeds}
          doseLogs={dogDoseLogs}
          onToggleDose={(logId) => setDoseLogs((p) => p.map((x) => x.id === logId ? { ...x, taken: !x.taken } : x))}
        />
        <ExpenseSummaryCard expenses={dogExpenses} />
      </Box>

      {/* ── Timeline ──────────────────────────────────────────────────────── */}
      <Card sx={{ p: { xs: 2, md: 2.5 } }}>
        <HealthTimeline
          timeline={timeline}
          onOpenDetail={handleOpenDetail}
          onExportPdf={handleExportPdf}
        />
      </Card>

      {/* ── Wizard dialog ────────────────────────────────────────────────── */}
      <AddRecordWizard
        open={wizardOpen}
        step={wizardStep}
        wizard={wizard}
        selectedMainCategory={selectedMainCategory}
        selectedSubcategory={selectedSubcategory}
        attachmentFile={attachmentFile}
        attachmentPreviewUrl={attachmentPreviewUrl}
        attachmentError={attachmentError}
        pendingAttachment={pendingAttachment}
        loadingFile={loadingFile}
        fileResult={fileResult}
        fileAnalyzeError={fileAnalyzeError}
        aiDetectedRecords={aiDetectedRecords}
        aiRecordUseVisitDetails={aiRecordUseVisitDetails}
        aiRecordDraft={aiRecordDraft}
        aiRecordFeedback={aiRecordFeedback}
        canCreateAiRecord={canCreateAiRecord}
        onClose={() => setWizardOpen(false)}
        onNext={() => setWizardStep((s) => s + 1)}
        onBack={() => setWizardStep((s) => s - 1)}
        onSave={handleSaveWizard}
        onWizardChange={(patch) => setWizard((p) => ({ ...p, ...patch }))}
        onMainCategoryChange={(val) => { setSelectedMainCategory(val); setSelectedSubcategory(''); }}
        onSubcategoryChange={(val) => { setSelectedSubcategory(val); }}
        onAttachmentFileChange={handleAttachmentFileChange}
        onAnalyzeAttachment={handleAnalyzeAttachment}
        onAiDetectedRecordChange={(id, patch) => setAiDetectedRecords((p) => p.map((r) => r.id === id ? { ...r, ...patch } : r))}
        onAiRecordUseVisitDetailsChange={setAiRecordUseVisitDetails}
        onAiRecordDraftChange={(patch) => setAiRecordDraft((p) => ({ ...p, ...patch }))}
        onSaveAiRecord={handleSaveAiRecord}
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
        vaccination={selectedRecord?.type === 'VACCINATION' ? dogVaccinations.find((x) => x.id === selectedRecord.id) ?? null : null}
        deworming={selectedRecord?.type === 'DEWORMING' ? dogDewormings.find((x) => x.id === selectedRecord.id) ?? null : null}
        ectoparasite={selectedRecord?.type === 'ECTOPARASITE' ? dogEctos.find((x) => x.id === selectedRecord.id) ?? null : null}
        medication={selectedRecord?.type === 'MEDICATION' ? dogMeds.find((x) => x.id === selectedRecord.id) ?? null : null}
        diet={selectedRecord?.type === 'DIET' ? dogDiet.find((x) => x.id === selectedRecord.id) ?? null : null}
        expense={selectedRecord?.type === 'EXPENSE' ? dogExpenses.find((x) => x.id === selectedRecord.id) ?? null : null}
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
