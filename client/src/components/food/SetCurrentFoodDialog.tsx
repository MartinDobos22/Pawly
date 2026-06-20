import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  Alert,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Stack,
  TextField,
} from '@mui/material';
import { useSetCurrentFood } from '../../hooks/useSetCurrentFood';
import { today } from '../healthPassport/utils';
import type { DietEntry } from '../../types/petHealth';

interface Props {
  open: boolean;
  onClose: () => void;
  petId: string;
  defaultName?: string;
  suitabilityStatus?: DietEntry['suitabilityStatus'];
  suitabilityReasons?: string[];
  onSaved?: () => void;
}

export default function SetCurrentFoodDialog({
  open,
  onClose,
  petId,
  defaultName,
  suitabilityStatus,
  suitabilityReasons,
  onSaved,
}: Props) {
  const { t } = useTranslation();
  const setCurrentFood = useSetCurrentFood();

  const [foodName, setFoodName] = useState(defaultName ?? '');
  const [startedAt, setStartedAt] = useState(today());
  const [note, setNote] = useState('');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (open) {
      setFoodName(defaultName ?? '');
      setStartedAt(today());
      setNote('');
      setError(null);
    }
  }, [open, defaultName]);

  const handleSave = async () => {
    if (!foodName.trim() || !petId) return;
    setSaving(true);
    setError(null);
    try {
      await setCurrentFood({
        petId,
        foodName: foodName.trim(),
        startedAt,
        note: note.trim() || undefined,
        suitabilityStatus,
        suitabilityReasons,
      });
      onSaved?.();
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : t('food.save'));
    } finally {
      setSaving(false);
    }
  };

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="xs">
      <DialogTitle>{t('food.dialogTitle')}</DialogTitle>
      <DialogContent>
        <Stack spacing={2} sx={{ mt: 1 }}>
          {error && <Alert severity="error">{error}</Alert>}
          <TextField
            label={t('food.foodName')}
            value={foodName}
            onChange={(e) => setFoodName(e.target.value)}
            autoFocus
            fullWidth
            required
          />
          <TextField
            label={t('food.startedAt')}
            type="date"
            value={startedAt}
            onChange={(e) => setStartedAt(e.target.value)}
            InputLabelProps={{ shrink: true }}
            fullWidth
          />
          <TextField
            label={t('food.note')}
            value={note}
            onChange={(e) => setNote(e.target.value)}
            multiline
            minRows={2}
            fullWidth
          />
        </Stack>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} disabled={saving}>
          {t('food.cancel')}
        </Button>
        <Button variant="contained" onClick={handleSave} disabled={saving || !foodName.trim()}>
          {saving ? t('food.saving') : t('food.save')}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
