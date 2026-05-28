import {
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  FormControl,
  IconButton,
  InputLabel,
  MenuItem,
  Select,
  Stack,
  TextField,
  Typography,
  alpha,
} from '@mui/material';
import { Close as CloseIcon, Edit as EditIcon, Delete as DeleteIcon } from '@mui/icons-material';
import { useEffect, useState } from 'react';
import type {
  VaccinationRecord,
  DewormingRecord,
  EctoparasiteRecord,
  MedicationRecord,
  DietEntry,
  ExpenseRecord,
  ExpenseCategory,
} from '../../types/dogHealth';
import { TIMELINE_ICON_MAP, TIMELINE_TYPE_META } from './constants.ts';
import { today } from './utils.ts';

export type RecordDetailType = 'VACCINATION' | 'DEWORMING' | 'ECTOPARASITE' | 'MEDICATION' | 'DIET' | 'EXPENSE';

export interface RecordDetailState {
  id: string;
  type: RecordDetailType;
}

// Draft state per type
interface VacDraft { name: string; type: VaccinationRecord['type']; dateApplied: string; validUntil: string; batchNumber: string }
interface DewDraft { productName: string; dateGiven: string; nextDueDate: string }
interface EctoDraft { productName: string; form: EctoparasiteRecord['form']; dateGiven: string; nextDueDate: string }
interface MedDraft { name: string; reason: string; dose: string; frequency: string; startDate: string; endDate: string }
interface DietDraft { foodName: string; startedAt: string; endedAt: string; reactionNotes: string; suitabilityStatus: NonNullable<DietEntry['suitabilityStatus']> }
interface ExpDraft { date: string; amount: string; currency: string; category: ExpenseCategory; note: string }

interface TimelineRecordDetailDialogProps {
  state: RecordDetailState | null;
  open: boolean;
  vaccination?: VaccinationRecord | null;
  deworming?: DewormingRecord | null;
  ectoparasite?: EctoparasiteRecord | null;
  medication?: MedicationRecord | null;
  diet?: DietEntry | null;
  expense?: ExpenseRecord | null;
  onClose: () => void;
  onSaveVaccination: (id: string, draft: VacDraft) => void;
  onSaveDeworming: (id: string, draft: DewDraft) => void;
  onSaveEcto: (id: string, draft: EctoDraft) => void;
  onSaveMedication: (id: string, draft: MedDraft) => void;
  onSaveDiet: (id: string, draft: DietDraft) => void;
  onSaveExpense: (id: string, draft: ExpDraft) => void;
  onDelete: () => void;
}

export default function TimelineRecordDetailDialog({
  state, open, vaccination, deworming, ectoparasite, medication, diet, expense,
  onClose, onSaveVaccination, onSaveDeworming, onSaveEcto, onSaveMedication, onSaveDiet, onSaveExpense, onDelete,
}: TimelineRecordDetailDialogProps) {
  const [editing, setEditing] = useState(false);

  const [vacDraft, setVacDraft] = useState<VacDraft>({ name: '', type: 'OTHER', dateApplied: today(), validUntil: '', batchNumber: '' });
  const [dewDraft, setDewDraft] = useState<DewDraft>({ productName: '', dateGiven: today(), nextDueDate: '' });
  const [ectoDraft, setEctoDraft] = useState<EctoDraft>({ productName: '', form: 'TABLET', dateGiven: today(), nextDueDate: '' });
  const [medDraft, setMedDraft] = useState<MedDraft>({ name: '', reason: '', dose: '', frequency: '', startDate: today(), endDate: '' });
  const [dietDraft, setDietDraft] = useState<DietDraft>({ foodName: '', startedAt: today(), endedAt: '', reactionNotes: '', suitabilityStatus: 'SUITABLE' });
  const [expDraft, setExpDraft] = useState<ExpDraft>({ date: today(), amount: '', currency: 'EUR', category: 'OTHER', note: '' });

  useEffect(() => {
    setEditing(false);
    if (vaccination) setVacDraft({ name: vaccination.name, type: vaccination.type, dateApplied: vaccination.dateApplied, validUntil: vaccination.validUntil, batchNumber: vaccination.batchNumber ?? '' });
    if (deworming) setDewDraft({ productName: deworming.productName, dateGiven: deworming.dateGiven, nextDueDate: deworming.nextDueDate });
    if (ectoparasite) setEctoDraft({ productName: ectoparasite.productName, form: ectoparasite.form, dateGiven: ectoparasite.dateGiven, nextDueDate: ectoparasite.nextDueDate });
    if (medication) setMedDraft({ name: medication.name, reason: medication.reason, dose: medication.dose, frequency: medication.frequency, startDate: medication.startDate, endDate: medication.endDate ?? '' });
    if (diet) setDietDraft({ foodName: diet.foodName, startedAt: diet.startedAt, endedAt: diet.endedAt ?? '', reactionNotes: diet.reactionNotes ?? '', suitabilityStatus: diet.suitabilityStatus ?? 'SUITABLE' });
    if (expense) setExpDraft({ date: expense.date, amount: String(expense.amount), currency: expense.currency, category: expense.category, note: expense.note ?? '' });
  }, [vaccination, deworming, ectoparasite, medication, diet, expense]);

  if (!state) return null;

  const meta = state.type !== 'VACCINATION' && state.type !== 'DEWORMING' && state.type !== 'ECTOPARASITE' && state.type !== 'MEDICATION' && state.type !== 'DIET' && state.type !== 'EXPENSE'
    ? null
    : TIMELINE_TYPE_META[state.type];

  const handleSave = () => {
    if (!state) return;
    if (state.type === 'VACCINATION') onSaveVaccination(state.id, vacDraft);
    else if (state.type === 'DEWORMING') onSaveDeworming(state.id, dewDraft);
    else if (state.type === 'ECTOPARASITE') onSaveEcto(state.id, ectoDraft);
    else if (state.type === 'MEDICATION') onSaveMedication(state.id, medDraft);
    else if (state.type === 'DIET') onSaveDiet(state.id, dietDraft);
    else if (state.type === 'EXPENSE') onSaveExpense(state.id, expDraft);
    setEditing(false);
  };

  const FieldRow = ({ label, children }: { label: string; children: React.ReactNode }) => (
    <Box>
      <Typography variant="caption" sx={{ display: 'block', fontWeight: 700, fontSize: '0.68rem', letterSpacing: '0.08em', textTransform: 'uppercase', color: 'text.secondary', mb: 0.5 }}>
        {label}
      </Typography>
      {children}
    </Box>
  );

  const renderContent = () => {
    if (state.type === 'VACCINATION') {
      return editing ? (
        <Stack spacing={1.5}>
          <TextField label="Názov vakcíny" value={vacDraft.name} onChange={(e) => setVacDraft((p) => ({ ...p, name: e.target.value }))} size="small" />
          <FormControl size="small" fullWidth>
            <InputLabel>Typ vakcíny</InputLabel>
            <Select label="Typ vakcíny" value={vacDraft.type} onChange={(e) => setVacDraft((p) => ({ ...p, type: e.target.value as VaccinationRecord['type'] }))}>
              <MenuItem value="RABIES">Besnota (Rabies)</MenuItem>
              <MenuItem value="COMBINED">Kombinovaná</MenuItem>
              <MenuItem value="OTHER">Iná</MenuItem>
            </Select>
          </FormControl>
          <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 1.5 }}>
            <TextField label="Dátum podania" type="date" InputLabelProps={{ shrink: true }} value={vacDraft.dateApplied} onChange={(e) => setVacDraft((p) => ({ ...p, dateApplied: e.target.value }))} size="small" />
            <TextField label="Platnosť do" type="date" InputLabelProps={{ shrink: true }} value={vacDraft.validUntil} onChange={(e) => setVacDraft((p) => ({ ...p, validUntil: e.target.value }))} size="small" />
          </Box>
          <TextField label="Šarža" value={vacDraft.batchNumber} onChange={(e) => setVacDraft((p) => ({ ...p, batchNumber: e.target.value }))} size="small" />
        </Stack>
      ) : (
        <Stack spacing={1.5}>
          <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 1.5 }}>
            <FieldRow label="Názov"><Typography variant="body2" sx={{ fontWeight: 500 }}>{vacDraft.name || '–'}</Typography></FieldRow>
            <FieldRow label="Typ"><Typography variant="body2" sx={{ fontWeight: 500 }}>{vacDraft.type}</Typography></FieldRow>
            <FieldRow label="Podaná"><Typography variant="body2" sx={{ fontWeight: 500 }}>{vacDraft.dateApplied}</Typography></FieldRow>
            <FieldRow label="Platnosť do"><Typography variant="body2" sx={{ fontWeight: 500 }}>{vacDraft.validUntil || '–'}</Typography></FieldRow>
          </Box>
          {vacDraft.batchNumber && <FieldRow label="Šarža"><Typography variant="body2" sx={{ fontWeight: 500 }}>{vacDraft.batchNumber}</Typography></FieldRow>}
        </Stack>
      );
    }

    if (state.type === 'DEWORMING') {
      return editing ? (
        <Stack spacing={1.5}>
          <TextField label="Produkt" value={dewDraft.productName} onChange={(e) => setDewDraft((p) => ({ ...p, productName: e.target.value }))} size="small" />
          <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 1.5 }}>
            <TextField label="Dátum podania" type="date" InputLabelProps={{ shrink: true }} value={dewDraft.dateGiven} onChange={(e) => setDewDraft((p) => ({ ...p, dateGiven: e.target.value }))} size="small" />
            <TextField label="Ďalší termín" type="date" InputLabelProps={{ shrink: true }} value={dewDraft.nextDueDate} onChange={(e) => setDewDraft((p) => ({ ...p, nextDueDate: e.target.value }))} size="small" />
          </Box>
        </Stack>
      ) : (
        <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 1.5 }}>
          <FieldRow label="Produkt"><Typography variant="body2" sx={{ fontWeight: 500 }}>{dewDraft.productName || '–'}</Typography></FieldRow>
          <FieldRow label="Dátum"><Typography variant="body2" sx={{ fontWeight: 500 }}>{dewDraft.dateGiven}</Typography></FieldRow>
          <FieldRow label="Ďalší termín"><Typography variant="body2" sx={{ fontWeight: 500 }}>{dewDraft.nextDueDate || '–'}</Typography></FieldRow>
        </Box>
      );
    }

    if (state.type === 'ECTOPARASITE') {
      return editing ? (
        <Stack spacing={1.5}>
          <TextField label="Produkt" value={ectoDraft.productName} onChange={(e) => setEctoDraft((p) => ({ ...p, productName: e.target.value }))} size="small" />
          <FormControl size="small" fullWidth>
            <InputLabel>Forma</InputLabel>
            <Select label="Forma" value={ectoDraft.form} onChange={(e) => setEctoDraft((p) => ({ ...p, form: e.target.value as EctoparasiteRecord['form'] }))}>
              <MenuItem value="TABLET">Tableta</MenuItem>
              <MenuItem value="SPOT_ON">Spot-on</MenuItem>
              <MenuItem value="COLLAR">Obojok</MenuItem>
            </Select>
          </FormControl>
          <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 1.5 }}>
            <TextField label="Dátum podania" type="date" InputLabelProps={{ shrink: true }} value={ectoDraft.dateGiven} onChange={(e) => setEctoDraft((p) => ({ ...p, dateGiven: e.target.value }))} size="small" />
            <TextField label="Ďalší termín" type="date" InputLabelProps={{ shrink: true }} value={ectoDraft.nextDueDate} onChange={(e) => setEctoDraft((p) => ({ ...p, nextDueDate: e.target.value }))} size="small" />
          </Box>
        </Stack>
      ) : (
        <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 1.5 }}>
          <FieldRow label="Produkt"><Typography variant="body2" sx={{ fontWeight: 500 }}>{ectoDraft.productName || '–'}</Typography></FieldRow>
          <FieldRow label="Forma"><Typography variant="body2" sx={{ fontWeight: 500 }}>{ectoDraft.form}</Typography></FieldRow>
          <FieldRow label="Dátum"><Typography variant="body2" sx={{ fontWeight: 500 }}>{ectoDraft.dateGiven}</Typography></FieldRow>
          <FieldRow label="Ďalší termín"><Typography variant="body2" sx={{ fontWeight: 500 }}>{ectoDraft.nextDueDate || '–'}</Typography></FieldRow>
        </Box>
      );
    }

    if (state.type === 'MEDICATION') {
      return editing ? (
        <Stack spacing={1.5}>
          <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 1.5 }}>
            <TextField label="Názov lieku" value={medDraft.name} onChange={(e) => setMedDraft((p) => ({ ...p, name: e.target.value }))} size="small" />
            <TextField label="Dôvod" value={medDraft.reason} onChange={(e) => setMedDraft((p) => ({ ...p, reason: e.target.value }))} size="small" />
            <TextField label="Dávkovanie" value={medDraft.dose} onChange={(e) => setMedDraft((p) => ({ ...p, dose: e.target.value }))} size="small" />
            <TextField label="Frekvencia" value={medDraft.frequency} onChange={(e) => setMedDraft((p) => ({ ...p, frequency: e.target.value }))} size="small" />
            <TextField label="Začiatok" type="date" InputLabelProps={{ shrink: true }} value={medDraft.startDate} onChange={(e) => setMedDraft((p) => ({ ...p, startDate: e.target.value }))} size="small" />
            <TextField label="Koniec" type="date" InputLabelProps={{ shrink: true }} value={medDraft.endDate} onChange={(e) => setMedDraft((p) => ({ ...p, endDate: e.target.value }))} size="small" />
          </Box>
        </Stack>
      ) : (
        <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 1.5 }}>
          <FieldRow label="Liek"><Typography variant="body2" sx={{ fontWeight: 500 }}>{medDraft.name || '–'}</Typography></FieldRow>
          <FieldRow label="Dôvod"><Typography variant="body2" sx={{ fontWeight: 500 }}>{medDraft.reason || '–'}</Typography></FieldRow>
          <FieldRow label="Dávkovanie"><Typography variant="body2" sx={{ fontWeight: 500 }}>{medDraft.dose || '–'}</Typography></FieldRow>
          <FieldRow label="Frekvencia"><Typography variant="body2" sx={{ fontWeight: 500 }}>{medDraft.frequency || '–'}</Typography></FieldRow>
          <FieldRow label="Začiatok"><Typography variant="body2" sx={{ fontWeight: 500 }}>{medDraft.startDate}</Typography></FieldRow>
          <FieldRow label="Koniec"><Typography variant="body2" sx={{ fontWeight: 500 }}>{medDraft.endDate || '–'}</Typography></FieldRow>
        </Box>
      );
    }

    if (state.type === 'DIET') {
      return editing ? (
        <Stack spacing={1.5}>
          <TextField label="Krmivo" value={dietDraft.foodName} onChange={(e) => setDietDraft((p) => ({ ...p, foodName: e.target.value }))} size="small" />
          <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 1.5 }}>
            <TextField label="Začiatok" type="date" InputLabelProps={{ shrink: true }} value={dietDraft.startedAt} onChange={(e) => setDietDraft((p) => ({ ...p, startedAt: e.target.value }))} size="small" />
            <TextField label="Koniec" type="date" InputLabelProps={{ shrink: true }} value={dietDraft.endedAt} onChange={(e) => setDietDraft((p) => ({ ...p, endedAt: e.target.value }))} size="small" />
          </Box>
          <FormControl size="small" fullWidth>
            <InputLabel>Hodnotenie</InputLabel>
            <Select label="Hodnotenie" value={dietDraft.suitabilityStatus} onChange={(e) => setDietDraft((p) => ({ ...p, suitabilityStatus: e.target.value as DietDraft['suitabilityStatus'] }))}>
              <MenuItem value="SUITABLE">Vhodné</MenuItem>
              <MenuItem value="RISKY">Rizikové</MenuItem>
              <MenuItem value="UNSUITABLE">Nevhodné</MenuItem>
            </Select>
          </FormControl>
          <TextField label="Reakcia" value={dietDraft.reactionNotes} onChange={(e) => setDietDraft((p) => ({ ...p, reactionNotes: e.target.value }))} size="small" />
        </Stack>
      ) : (
        <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 1.5 }}>
          <FieldRow label="Krmivo"><Typography variant="body2" sx={{ fontWeight: 500 }}>{dietDraft.foodName || '–'}</Typography></FieldRow>
          <FieldRow label="Hodnotenie"><Typography variant="body2" sx={{ fontWeight: 500 }}>{dietDraft.suitabilityStatus}</Typography></FieldRow>
          <FieldRow label="Začiatok"><Typography variant="body2" sx={{ fontWeight: 500 }}>{dietDraft.startedAt}</Typography></FieldRow>
          {dietDraft.endedAt && <FieldRow label="Koniec"><Typography variant="body2" sx={{ fontWeight: 500 }}>{dietDraft.endedAt}</Typography></FieldRow>}
          {dietDraft.reactionNotes && <Box sx={{ gridColumn: '1 / -1' }}><FieldRow label="Reakcia"><Typography variant="body2" sx={{ fontWeight: 500 }}>{dietDraft.reactionNotes}</Typography></FieldRow></Box>}
        </Box>
      );
    }

    if (state.type === 'EXPENSE') {
      return editing ? (
        <Stack spacing={1.5}>
          <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 1.5 }}>
            <TextField label="Dátum" type="date" InputLabelProps={{ shrink: true }} value={expDraft.date} onChange={(e) => setExpDraft((p) => ({ ...p, date: e.target.value }))} size="small" />
            <TextField label="Suma (€)" type="number" value={expDraft.amount} onChange={(e) => setExpDraft((p) => ({ ...p, amount: e.target.value }))} size="small" />
          </Box>
          <FormControl size="small" fullWidth>
            <InputLabel>Kategória</InputLabel>
            <Select label="Kategória" value={expDraft.category} onChange={(e) => setExpDraft((p) => ({ ...p, category: e.target.value as ExpenseCategory }))}>
              <MenuItem value="VET_VISIT">Veterinár</MenuItem>
              <MenuItem value="MEDICATION">Lieky</MenuItem>
              <MenuItem value="FOOD">Krmivo</MenuItem>
              <MenuItem value="OTHER">Ostatné</MenuItem>
            </Select>
          </FormControl>
          <TextField label="Poznámka" value={expDraft.note} onChange={(e) => setExpDraft((p) => ({ ...p, note: e.target.value }))} size="small" />
        </Stack>
      ) : (
        <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 1.5 }}>
          <FieldRow label="Dátum"><Typography variant="body2" sx={{ fontWeight: 500 }}>{expDraft.date}</Typography></FieldRow>
          <FieldRow label="Suma"><Typography variant="body2" sx={{ fontWeight: 500 }}>{expDraft.amount} {expDraft.currency}</Typography></FieldRow>
          <FieldRow label="Kategória"><Typography variant="body2" sx={{ fontWeight: 500 }}>{expDraft.category}</Typography></FieldRow>
          {expDraft.note && <Box sx={{ gridColumn: '1 / -1' }}><FieldRow label="Poznámka"><Typography variant="body2" sx={{ fontWeight: 500 }}>{expDraft.note}</Typography></FieldRow></Box>}
        </Box>
      );
    }

    return null;
  };

  const meta2 = meta ? TIMELINE_TYPE_META[state.type as keyof typeof TIMELINE_TYPE_META] : null;

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="sm"
      fullWidth
      PaperProps={{ sx: { borderRadius: 4, backgroundImage: 'none' } }}
    >
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, px: 3, py: 2, borderBottom: '1px solid', borderColor: 'divider' }}>
        {meta2 && (
          <Box sx={{ width: 36, height: 36, borderRadius: 1.5, bgcolor: alpha(meta2.hex, 0.12), color: meta2.hex, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            {TIMELINE_ICON_MAP[state.type as keyof typeof TIMELINE_ICON_MAP]}
          </Box>
        )}
        <Box sx={{ flex: 1 }}>
          <Typography variant="h6" sx={{ fontWeight: 700, fontSize: '1rem' }}>
            Detail záznamu
          </Typography>
          {meta2 && (
            <Typography variant="caption" sx={{ color: meta2.hex, fontWeight: 600 }}>
              {meta2.label}
            </Typography>
          )}
        </Box>
        <IconButton size="small" onClick={onClose} sx={{ borderRadius: 2 }}>
          <CloseIcon sx={{ fontSize: 18 }} />
        </IconButton>
      </Box>

      <DialogContent sx={{ pt: 2.5 }}>
        {renderContent()}
      </DialogContent>

      <DialogActions sx={{ px: 3, pb: 2.5, gap: 1 }}>
        <Button startIcon={<DeleteIcon />} color="error" onClick={onDelete} size="small" sx={{ borderRadius: 2, mr: 'auto' }}>
          Zmazať
        </Button>
        <Button onClick={onClose} size="small" sx={{ borderRadius: 2 }}>Zavrieť</Button>
        {!editing ? (
          <Button variant="outlined" startIcon={<EditIcon />} size="small" onClick={() => setEditing(true)} sx={{ borderRadius: 2 }}>
            Editovať
          </Button>
        ) : (
          <Button variant="contained" size="small" onClick={handleSave} sx={{ borderRadius: 2 }}>
            Uložiť zmeny
          </Button>
        )}
      </DialogActions>
    </Dialog>
  );
}
