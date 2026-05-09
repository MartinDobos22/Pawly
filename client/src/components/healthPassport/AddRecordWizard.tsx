import {
  Alert,
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  FormControl,
  FormControlLabel,
  InputLabel,
  MenuItem,
  Select,
  Stack,
  Step,
  StepLabel,
  Stepper,
  Switch,
  TextField,
  Typography,
  alpha,
  useTheme,
} from '@mui/material';
import {
  UploadFile as UploadFileIcon,
  AddCircle as AddIcon,
} from '@mui/icons-material';
import type { FileExtractionResult } from '../../types';
import type { VaccinationRecord, EctoparasiteRecord } from '../../types/dogHealth';
import { VISIT_CATEGORY_OPTIONS, EXAM_SUBCATEGORY_TO_ALIAS } from './constants.ts';
import type { AiDetectedDraftRecord, AiDetectedRecordType, WizardAdditionalRecordType, WizardState } from './hpTypes.ts';
import AiFormattedText from '../AiFormattedText';

interface AddRecordWizardProps {
  open: boolean;
  step: number;
  wizard: WizardState;
  selectedMainCategory: string;
  selectedSubcategory: string;
  attachmentFile: File | null;
  attachmentPreviewUrl: string;
  attachmentError: string;
  pendingAttachment: { fileName: string; mimeType: string; base64Data: string } | null;
  loadingFile: boolean;
  fileResult: FileExtractionResult | null;
  fileAnalyzeError: string | null;
  aiDetectedRecords: AiDetectedDraftRecord[];
  aiRecordUseVisitDetails: boolean;
  aiRecordDraft: { date: string; clinicName: string; diagnosis: string; recommendations: string };
  aiRecordFeedback: string | null;
  canCreateAiRecord: boolean;
  onClose: () => void;
  onNext: () => void;
  onBack: () => void;
  onSave: () => void;
  onWizardChange: (patch: Partial<WizardState>) => void;
  onMainCategoryChange: (val: string) => void;
  onSubcategoryChange: (val: string) => void;
  onAttachmentFileChange: (file: File | null) => void;
  onAnalyzeAttachment: () => void;
  onAiDetectedRecordChange: (id: string, patch: Partial<AiDetectedDraftRecord>) => void;
  onAiRecordUseVisitDetailsChange: (val: boolean) => void;
  onAiRecordDraftChange: (patch: Partial<{ date: string; clinicName: string; diagnosis: string; recommendations: string }>) => void;
  onSaveAiRecord: () => void;
}

export default function AddRecordWizard({
  open, step, wizard, selectedMainCategory, selectedSubcategory,
  attachmentFile, attachmentPreviewUrl, attachmentError, pendingAttachment,
  loadingFile, fileResult, fileAnalyzeError,
  aiDetectedRecords, aiRecordUseVisitDetails, aiRecordDraft, aiRecordFeedback, canCreateAiRecord,
  onClose, onNext, onBack, onSave, onWizardChange,
  onMainCategoryChange, onSubcategoryChange, onAttachmentFileChange, onAnalyzeAttachment,
  onAiDetectedRecordChange, onAiRecordUseVisitDetailsChange, onAiRecordDraftChange, onSaveAiRecord,
}: AddRecordWizardProps) {
  const theme = useTheme();

  const selectedExamAlias = selectedSubcategory ? EXAM_SUBCATEGORY_TO_ALIAS[selectedSubcategory] : '';
  const subcategoryOptions = VISIT_CATEGORY_OPTIONS.find((o) => o.main === selectedMainCategory)?.sub ?? [];

  const selectedAdditional: WizardAdditionalRecordType = wizard.addVaccination
    ? 'VACCINATION' : wizard.addDeworming ? 'DEWORMING'
    : wizard.addEcto ? 'ECTOPARASITE'
    : wizard.addMedication ? 'MEDICATION' : '';

  const handleAdditionalChange = (val: WizardAdditionalRecordType) => {
    onWizardChange({
      addVaccination: val === 'VACCINATION',
      addDeworming: val === 'DEWORMING',
      addEcto: val === 'ECTOPARASITE',
      addMedication: val === 'MEDICATION',
      addDiet: false,
    });
  };

  const canProceed = Boolean(wizard.clinicName.trim());

  const steps = ['Detaily návštevy', 'Výdavky a ďalší termín'];

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="md"
      fullWidth
      PaperProps={{ sx: { borderRadius: 4, backgroundImage: 'none' } }}
    >
      {/* Header */}
      <Box
        sx={{
          px: 3,
          pt: 2.5,
          pb: 2,
          borderBottom: '1px solid',
          borderColor: 'divider',
          background: `linear-gradient(135deg, ${alpha(theme.palette.primary.main, 0.06)} 0%, transparent 100%)`,
        }}
      >
        <Stack direction="row" alignItems="center" gap={1.5} sx={{ mb: 2 }}>
          <Box sx={{ width: 38, height: 38, borderRadius: 2.5, bgcolor: alpha(theme.palette.primary.main, 0.12), color: 'primary.main', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <AddIcon />
          </Box>
          <Box>
            <Typography variant="h6" sx={{ fontWeight: 700, lineHeight: 1.2 }}>Nový zdravotný záznam</Typography>
            <Typography variant="caption" sx={{ color: 'text.secondary' }}>Po návšteve veterinára</Typography>
          </Box>
        </Stack>
        <Stepper activeStep={step} sx={{ '& .MuiStepLabel-label': { fontSize: '0.8rem' } }}>
          {steps.map((label) => (
            <Step key={label}>
              <StepLabel>{label}</StepLabel>
            </Step>
          ))}
        </Stepper>
      </Box>

      <DialogContent sx={{ py: 3 }}>
        {step === 0 && (
          <Stack spacing={2.5}>
            {/* Category selection */}
            <Box>
              <Typography variant="subtitle2" sx={{ fontWeight: 700, mb: 1.5, fontSize: '0.8rem', textTransform: 'uppercase', letterSpacing: '0.06em', color: 'text.secondary' }}>
                Typ vyšetrenia
              </Typography>
              <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 1.5 }}>
                <FormControl fullWidth size="small">
                  <InputLabel>Hlavná kategória</InputLabel>
                  <Select value={selectedMainCategory} label="Hlavná kategória"
                    onChange={(e) => onMainCategoryChange(e.target.value)}>
                    <MenuItem value="">Bez kategórie</MenuItem>
                    {VISIT_CATEGORY_OPTIONS.map((o) => <MenuItem key={o.main} value={o.main}>{o.main}</MenuItem>)}
                  </Select>
                </FormControl>
                <FormControl fullWidth size="small" disabled={!selectedMainCategory}>
                  <InputLabel>Podkategória</InputLabel>
                  <Select value={selectedSubcategory} label="Podkategória"
                    onChange={(e) => onSubcategoryChange(e.target.value)}>
                    <MenuItem value="">Bez podkategórie</MenuItem>
                    {subcategoryOptions.map((sub) => <MenuItem key={sub} value={sub}>{sub}</MenuItem>)}
                  </Select>
                </FormControl>
              </Box>
            </Box>

            {/* Visit basics */}
            <Box>
              <Typography variant="subtitle2" sx={{ fontWeight: 700, mb: 1.5, fontSize: '0.8rem', textTransform: 'uppercase', letterSpacing: '0.06em', color: 'text.secondary' }}>
                Základné informácie
              </Typography>
              <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr' }, gap: 1.5 }}>
                <TextField label="Dátum" type="date" InputLabelProps={{ shrink: true }} size="small"
                  value={wizard.date} onChange={(e) => onWizardChange({ date: e.target.value })} />
                <TextField label="Klinika / veterinár *" size="small"
                  value={wizard.clinicName} onChange={(e) => onWizardChange({ clinicName: e.target.value })} />
              </Box>
              {(selectedSubcategory || selectedAdditional) && (
                <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr' }, gap: 1.5, mt: 1.5 }}>
                  <TextField label="Nález / diagnóza" size="small"
                    value={wizard.diagnosis} onChange={(e) => onWizardChange({ diagnosis: e.target.value })} />
                  <TextField label="Odporúčania" size="small"
                    value={wizard.recommendations} onChange={(e) => onWizardChange({ recommendations: e.target.value })} />
                </Box>
              )}
            </Box>

            {/* Additional record */}
            <Box>
              <Typography variant="subtitle2" sx={{ fontWeight: 700, mb: 1.5, fontSize: '0.8rem', textTransform: 'uppercase', letterSpacing: '0.06em', color: 'text.secondary' }}>
                Doplňujúci záznam
              </Typography>
              <FormControl fullWidth size="small" sx={{ mb: 1.5 }}>
                <InputLabel>Typ záznamu</InputLabel>
                <Select value={selectedAdditional} label="Typ záznamu"
                  onChange={(e) => handleAdditionalChange(e.target.value as WizardAdditionalRecordType)}>
                  <MenuItem value="">Bez záznamu</MenuItem>
                  <MenuItem value="VACCINATION">Očkovanie</MenuItem>
                  <MenuItem value="DEWORMING">Odčervenie</MenuItem>
                  <MenuItem value="ECTOPARASITE">Antiparazitikum</MenuItem>
                  <MenuItem value="MEDICATION">Liek</MenuItem>
                </Select>
              </FormControl>

              {wizard.addVaccination && (
                <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr 1fr' }, gap: 1.5, p: 2, borderRadius: 2, bgcolor: alpha('#22c55e', 0.06), border: '1px solid', borderColor: alpha('#22c55e', 0.2) }}>
                  <TextField label="Názov vakcíny" size="small" value={wizard.vaccineName} onChange={(e) => onWizardChange({ vaccineName: e.target.value })} />
                  <FormControl size="small">
                    <InputLabel>Typ</InputLabel>
                    <Select label="Typ" value={wizard.vaccineType} onChange={(e) => onWizardChange({ vaccineType: e.target.value as VaccinationRecord['type'] })}>
                      <MenuItem value="RABIES">Besnota</MenuItem><MenuItem value="COMBINED">Kombinovaná</MenuItem><MenuItem value="OTHER">Iná</MenuItem>
                    </Select>
                  </FormControl>
                  <TextField label="Platné do" type="date" InputLabelProps={{ shrink: true }} size="small" value={wizard.vaccineValidUntil} onChange={(e) => onWizardChange({ vaccineValidUntil: e.target.value })} />
                </Box>
              )}

              {wizard.addDeworming && (
                <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 1.5, p: 2, borderRadius: 2, bgcolor: alpha('#a855f7', 0.06), border: '1px solid', borderColor: alpha('#a855f7', 0.2) }}>
                  <TextField label="Produkt" size="small" value={wizard.dewormProduct} onChange={(e) => onWizardChange({ dewormProduct: e.target.value })} />
                  <TextField label="Platné do" type="date" InputLabelProps={{ shrink: true }} size="small" value={wizard.dewormValidUntil} onChange={(e) => onWizardChange({ dewormValidUntil: e.target.value })} />
                </Box>
              )}

              {wizard.addEcto && (
                <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr 1fr' }, gap: 1.5, p: 2, borderRadius: 2, bgcolor: alpha('#f59e0b', 0.06), border: '1px solid', borderColor: alpha('#f59e0b', 0.2) }}>
                  <TextField label="Produkt" size="small" value={wizard.ectoProduct} onChange={(e) => onWizardChange({ ectoProduct: e.target.value })} />
                  <FormControl size="small">
                    <InputLabel>Forma</InputLabel>
                    <Select label="Forma" value={wizard.ectoForm} onChange={(e) => onWizardChange({ ectoForm: e.target.value as EctoparasiteRecord['form'] })}>
                      <MenuItem value="TABLET">Tableta</MenuItem><MenuItem value="SPOT_ON">Spot-on</MenuItem><MenuItem value="COLLAR">Obojok</MenuItem>
                    </Select>
                  </FormControl>
                  <TextField label="Platné do" type="date" InputLabelProps={{ shrink: true }} size="small" value={wizard.ectoValidUntil} onChange={(e) => onWizardChange({ ectoValidUntil: e.target.value })} />
                </Box>
              )}

              {wizard.addMedication && (
                <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr' }, gap: 1.5, p: 2, borderRadius: 2, bgcolor: alpha('#06b6d4', 0.06), border: '1px solid', borderColor: alpha('#06b6d4', 0.2) }}>
                  <TextField label="Názov" size="small" value={wizard.medName} onChange={(e) => onWizardChange({ medName: e.target.value })} />
                  <TextField label="Dôvod" size="small" value={wizard.medReason} onChange={(e) => onWizardChange({ medReason: e.target.value })} />
                  <TextField label="Dávkovanie" size="small" value={wizard.medDose} onChange={(e) => onWizardChange({ medDose: e.target.value })} />
                  <TextField label="Frekvencia" size="small" value={wizard.medFrequency} onChange={(e) => onWizardChange({ medFrequency: e.target.value })} />
                  <TextField label="Koniec liečby" type="date" InputLabelProps={{ shrink: true }} size="small" value={wizard.medEndDate} onChange={(e) => onWizardChange({ medEndDate: e.target.value })} />
                </Box>
              )}
            </Box>

            {/* File attachment / AI analysis */}
            {selectedExamAlias && (
              <Box>
                <Typography variant="subtitle2" sx={{ fontWeight: 700, mb: 1.5, fontSize: '0.8rem', textTransform: 'uppercase', letterSpacing: '0.06em', color: 'text.secondary' }}>
                  AI analýza dokumentu
                </Typography>
                <Stack spacing={1.5}>
                  <TextField label="Popis prílohy" size="small" value={wizard.attachmentLabel}
                    onChange={(e) => onWizardChange({ attachmentLabel: e.target.value })} />
                  <Stack direction="row" gap={1.5}>
                    <Button variant="outlined" component="label" startIcon={<UploadFileIcon />} size="small" sx={{ borderRadius: 2 }}>
                      Vybrať súbor
                      <input type="file" hidden accept="application/pdf,image/jpeg,image/png,image/webp"
                        onChange={(e) => onAttachmentFileChange(e.target.files?.[0] ?? null)} />
                    </Button>
                    <Button variant="contained" size="small" sx={{ borderRadius: 2 }}
                      onClick={onAnalyzeAttachment}
                      disabled={loadingFile || !pendingAttachment || Boolean(attachmentError)}
                      startIcon={loadingFile ? <CircularProgress size={14} color="inherit" /> : undefined}
                    >
                      {loadingFile ? 'Analyzujem…' : 'Analyzovať'}
                    </Button>
                  </Stack>
                  {attachmentFile && (
                    <Chip label={`${attachmentFile.name} (${Math.round(attachmentFile.size / 1024)} kB)`} size="small" sx={{ alignSelf: 'flex-start', borderRadius: 2 }} />
                  )}
                  {attachmentError && <Alert severity="warning" sx={{ borderRadius: 2 }}>{attachmentError}</Alert>}
                  {fileAnalyzeError && <Alert severity="error" sx={{ borderRadius: 2 }}>{fileAnalyzeError}</Alert>}
                  {fileResult?.contextAnalysis && (
                    <Alert severity="info" sx={{ borderRadius: 2 }}>
                      <strong>{fileResult.contextAnalysis.documentType}</strong> ({fileResult.contextAnalysis.confidence})<br />
                      {fileResult.contextAnalysis.summary}
                    </Alert>
                  )}
                  {fileResult?.examAnalysis && (
                    <Box sx={{ p: 2, borderRadius: 2, bgcolor: alpha(theme.palette.info.main, 0.05), border: '1px solid', borderColor: alpha(theme.palette.info.main, 0.2) }}>
                      <Typography variant="caption" sx={{ fontWeight: 700, display: 'block', mb: 1, color: 'info.main' }}>
                        AI analýza: {fileResult.examAnalysis.examType}
                      </Typography>
                      <AiFormattedText text={fileResult.examAnalysis.analysis} />
                    </Box>
                  )}
                  {fileResult?.examAnalysis && (
                    <Card variant="outlined" sx={{ borderRadius: 2.5 }}>
                      <CardContent sx={{ p: 2 }}>
                        <Typography variant="subtitle2" sx={{ fontWeight: 700, mb: 1.5 }}>Uložiť AI výsledok</Typography>
                        <Stack spacing={1.5}>
                          <FormControlLabel
                            control={<Switch checked={aiRecordUseVisitDetails} onChange={(e) => onAiRecordUseVisitDetailsChange(e.target.checked)} size="small" />}
                            label={<Typography variant="body2">Použiť údaje z návštevy</Typography>}
                          />
                          {!aiRecordUseVisitDetails && (
                            <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 1.5 }}>
                              <TextField size="small" label="Dátum záznamu" type="date" InputLabelProps={{ shrink: true }}
                                value={aiRecordDraft.date} onChange={(e) => onAiRecordDraftChange({ date: e.target.value })} />
                              <TextField size="small" label="Klinika *" value={aiRecordDraft.clinicName}
                                onChange={(e) => onAiRecordDraftChange({ clinicName: e.target.value })} />
                            </Box>
                          )}
                          {aiDetectedRecords.length > 0 && (
                            <Stack spacing={1}>
                              <Typography variant="caption" sx={{ fontWeight: 700, color: 'text.secondary' }}>AI rozpoznané záznamy</Typography>
                              {aiDetectedRecords.map((item) => (
                                <Box key={item.id} sx={{ p: 1.5, borderRadius: 2, border: '1px solid', borderColor: 'divider', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 1 }}>
                                  <FormControl size="small" sx={{ gridColumn: '1 / -1' }}>
                                    <InputLabel>Typ záznamu</InputLabel>
                                    <Select label="Typ záznamu" value={item.targetType}
                                      onChange={(e) => onAiDetectedRecordChange(item.id, { targetType: e.target.value as AiDetectedRecordType })}>
                                      <MenuItem value="VACCINATION">Očkovanie</MenuItem>
                                      <MenuItem value="DEWORMING">Odčervenie</MenuItem>
                                      <MenuItem value="ECTOPARASITE">Antiparazitikum</MenuItem>
                                      <MenuItem value="MEDICATION">Liek</MenuItem>
                                      <MenuItem value="NOTE">Len poznámka</MenuItem>
                                      <MenuItem value="SKIP">Neukladať</MenuItem>
                                    </Select>
                                  </FormControl>
                                  <TextField size="small" label="Prípravok" value={item.productName}
                                    onChange={(e) => onAiDetectedRecordChange(item.id, { productName: e.target.value })} />
                                  <TextField size="small" label="Dátum" type="date" InputLabelProps={{ shrink: true }}
                                    value={item.date} onChange={(e) => onAiDetectedRecordChange(item.id, { date: e.target.value })} />
                                  <TextField size="small" label="Platnosť do" type="date" InputLabelProps={{ shrink: true }}
                                    value={item.validUntil} onChange={(e) => onAiDetectedRecordChange(item.id, { validUntil: e.target.value })} />
                                  <Chip size="small" label={`AI: ${item.sourceConfidence}`}
                                    color={item.sourceConfidence === 'high' ? 'success' : item.sourceConfidence === 'medium' ? 'warning' : 'default'}
                                    sx={{ alignSelf: 'center', height: 20, borderRadius: 1.5 }} />
                                </Box>
                              ))}
                            </Stack>
                          )}
                          <Button variant="contained" size="small" onClick={onSaveAiRecord} disabled={!canCreateAiRecord} sx={{ borderRadius: 2, alignSelf: 'flex-start' }}>
                            Pridať AI záznam do timeline
                          </Button>
                          {aiRecordFeedback && <Alert severity="success" sx={{ borderRadius: 2 }}>{aiRecordFeedback}</Alert>}
                        </Stack>
                      </CardContent>
                    </Card>
                  )}
                </Stack>
              </Box>
            )}
          </Stack>
        )}

        {step === 1 && (
          <Stack spacing={2}>
            <Typography variant="subtitle2" sx={{ fontWeight: 700, mb: 0.5, fontSize: '0.8rem', textTransform: 'uppercase', letterSpacing: '0.06em', color: 'text.secondary' }}>
              Výdavky a plánovaná kontrola
            </Typography>
            <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr' }, gap: 1.5 }}>
              <TextField label="Ďalšia kontrola" type="date" InputLabelProps={{ shrink: true }} size="small"
                value={wizard.nextCheckDate} onChange={(e) => onWizardChange({ nextCheckDate: e.target.value })} />
              <TextField label="Výdavok za návštevu (€)" type="number" size="small"
                value={wizard.totalExpense} onChange={(e) => onWizardChange({ totalExpense: e.target.value })} />
              <TextField label="Výdavok lieky (€)" type="number" size="small"
                value={wizard.extraMedicationExpense} onChange={(e) => onWizardChange({ extraMedicationExpense: e.target.value })} />
              <TextField label="Výdavok krmivo (€)" type="number" size="small"
                value={wizard.extraFoodExpense} onChange={(e) => onWizardChange({ extraFoodExpense: e.target.value })} />
            </Box>
          </Stack>
        )}
      </DialogContent>

      <DialogActions sx={{ px: 3, pb: 2.5, gap: 1 }}>
        <Button onClick={onClose} size="small" sx={{ borderRadius: 2, mr: 'auto' }}>Zrušiť</Button>
        {step > 0 && <Button onClick={onBack} size="small" sx={{ borderRadius: 2 }}>Späť</Button>}
        {step < 1 ? (
          <Button variant="contained" onClick={onNext} disabled={!canProceed} sx={{ borderRadius: 2 }}>
            Pokračovať
          </Button>
        ) : (
          <Button variant="contained" onClick={onSave} disabled={!canProceed} sx={{ borderRadius: 2 }}>
            Uložiť všetko
          </Button>
        )}
      </DialogActions>
    </Dialog>
  );
}
