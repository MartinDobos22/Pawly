import { useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
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
  TextField,
  Typography,
  useTheme,
} from '@mui/material';
import { Add as AddIcon } from '@mui/icons-material';
import Seo from '../components/Seo';
import QuickCheckInStep from '../components/checkIn/QuickCheckInStep';
import DetailedCheckInForm, {
  type DetailedState,
  type SymptomField,
} from '../components/checkIn/DetailedCheckInForm';
import CheckInResult from '../components/checkIn/CheckInResult';
import { useActivePet } from '../hooks/useActivePet';
import { useHealthData } from '../hooks/useHealthData';
import { computeSeverity } from '../utils/checkInSeverity';
import type {
  CheckIn,
  CheckInAppetite,
  CheckInBehavior,
  CheckInEnergy,
  CheckInOverallStatus,
  CheckInSeverity,
  CheckInSkinCoat,
  CheckInStool,
} from '../types/petHealth';

type Step = 'quick' | 'detail' | 'result';

const EMPTY_DETAIL: DetailedState = { weight: '', note: '' };

export default function CheckInPage() {
  const { t } = useTranslation();
  const theme = useTheme();
  const navigate = useNavigate();

  const { petProfiles, activePetId } = useActivePet();
  const { addCheckIn, addWeightLog } = useHealthData();

  const [selectedPetId, setSelectedPetId] = useState<string>(activePetId || petProfiles[0]?.id || '');
  const [step, setStep] = useState<Step>('quick');
  const [overallStatus, setOverallStatus] = useState<CheckInOverallStatus>('ok');
  const [detail, setDetail] = useState<DetailedState>(EMPTY_DETAIL);
  const [resultSeverity, setResultSeverity] = useState<CheckInSeverity>('none');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const selectedPet = useMemo(
    () => petProfiles.find((p) => p.id === selectedPetId) ?? null,
    [petProfiles, selectedPetId]
  );
  const petName = selectedPet?.name ?? '';

  const handleQuickSelect = (status: CheckInOverallStatus) => {
    setOverallStatus(status);
    setStep('detail');
  };

  const handleSymptom = (field: SymptomField, value?: string) => {
    setDetail((prev) => ({ ...prev, [field]: value }));
  };

  const handleSave = async () => {
    if (!selectedPetId) return;
    setSaving(true);
    setError(null);
    const date = new Date().toISOString().slice(0, 10);
    const fields = {
      overallStatus,
      appetite: detail.appetite as CheckInAppetite | undefined,
      energy: detail.energy as CheckInEnergy | undefined,
      stool: detail.stool as CheckInStool | undefined,
      skinCoat: detail.skinCoat as CheckInSkinCoat | undefined,
      behavior: detail.behavior as CheckInBehavior | undefined,
    };
    const severity = computeSeverity(fields);
    const weightKg = detail.weight.trim() ? Number(detail.weight) : undefined;
    const payload: Partial<CheckIn> = {
      petId: selectedPetId,
      date,
      ...fields,
      weightKg: Number.isFinite(weightKg) ? weightKg : undefined,
      note: detail.note.trim() || undefined,
      severity,
    };
    try {
      await addCheckIn(payload);
      if (payload.weightKg != null) {
        await addWeightLog({ petId: selectedPetId, date, kg: payload.weightKg });
      }
      setResultSeverity(severity);
      setStep('result');
    } catch (err) {
      setError(err instanceof Error ? err.message : t('checkIn.save'));
    } finally {
      setSaving(false);
    }
  };

  if (petProfiles.length === 0) {
    return (
      <Box sx={{ maxWidth: 560, mx: 'auto' }}>
        <Seo title={`${t('checkIn.title')} — Pawly`} noindex />
        <Card sx={{ p: theme.spacing(4), textAlign: 'center' }}>
          <Typography variant="h6" sx={{ mb: theme.spacing(2) }}>
            {t('overview.emptyTitle')}
          </Typography>
          <Button variant="contained" startIcon={<AddIcon />} onClick={() => navigate('/profily')}>
            {t('overview.emptyAction')}
          </Button>
        </Card>
      </Box>
    );
  }

  return (
    <Box sx={{ maxWidth: 560, mx: 'auto' }}>
      <Seo title={`${t('checkIn.title')} — Pawly`} noindex />

      <Typography variant="h4" sx={{ mb: theme.spacing(0.5) }}>
        {t('checkIn.title')}
      </Typography>
      <Typography variant="body1" color="text.secondary" sx={{ mb: theme.spacing(3) }}>
        {t('checkIn.subtitle')}
      </Typography>

      {error && (
        <Alert severity="error" sx={{ mb: theme.spacing(2) }}>
          {error}
        </Alert>
      )}

      {step === 'result' ? (
        <CheckInResult
          severity={resultSeverity}
          petName={petName}
          onDone={() => navigate('/prehlad')}
        />
      ) : (
        <Card sx={{ p: theme.spacing(3) }}>
          {petProfiles.length > 1 && (
            <FormControl fullWidth sx={{ mb: theme.spacing(3) }}>
              <InputLabel id="checkin-pet-label">{t('checkIn.selectPet')}</InputLabel>
              <Select
                labelId="checkin-pet-label"
                label={t('checkIn.selectPet')}
                value={selectedPetId}
                onChange={(e) => setSelectedPetId(e.target.value)}
              >
                {petProfiles.map((p) => (
                  <MenuItem key={p.id} value={p.id}>
                    {p.name}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          )}

          {step === 'quick' && (
            <QuickCheckInStep petName={petName} onSelect={handleQuickSelect} />
          )}

          {step === 'detail' && (
            <Stack spacing={theme.spacing(3)}>
              {overallStatus === 'ok' ? (
                <>
                  <Typography variant="body1">{t('checkIn.addOptional')}</Typography>
                  <TextField
                    label={t('checkIn.weight')}
                    type="number"
                    value={detail.weight}
                    onChange={(e) => setDetail((p) => ({ ...p, weight: e.target.value }))}
                    inputProps={{ min: 0, step: 0.1 }}
                    sx={{ maxWidth: 200 }}
                  />
                  <TextField
                    label={t('checkIn.note')}
                    placeholder={t('checkIn.notePlaceholder')}
                    value={detail.note}
                    onChange={(e) => setDetail((p) => ({ ...p, note: e.target.value }))}
                    multiline
                    minRows={2}
                  />
                </>
              ) : (
                <DetailedCheckInForm
                  state={detail}
                  onSymptom={handleSymptom}
                  onWeight={(v) => setDetail((p) => ({ ...p, weight: v }))}
                  onNote={(v) => setDetail((p) => ({ ...p, note: v }))}
                />
              )}

              <Stack direction="row" spacing={theme.spacing(1.5)}>
                <Button variant="text" onClick={() => setStep('quick')} disabled={saving}>
                  {t('checkIn.back')}
                </Button>
                <Button variant="contained" onClick={handleSave} disabled={saving}>
                  {saving ? t('checkIn.saving') : t('checkIn.save')}
                </Button>
              </Stack>
            </Stack>
          )}
        </Card>
      )}
    </Box>
  );
}
