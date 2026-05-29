import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  IconButton,
  Snackbar,
  Stack,
  TextField,
  Typography,
} from '@mui/material';
import { Bolt as BoltIcon, Close as CloseIcon, Undo as UndoIcon } from '@mui/icons-material';

import { useLocalStorage } from '../../hooks/useLocalStorage';
import type { VetVisitRecord } from '../../types/dogHealth';
import { today, uid } from './utils';

const SNACK_DURATION_MS = 6000;

interface QuickVisitButtonProps {
  dogId: string;
  disabled?: boolean;
  onCreate: (visit: VetVisitRecord) => Promise<VetVisitRecord>;
  onUndo: (id: string) => void;
}

interface LastCreatedRef {
  id: string;
  clinic: string;
}

export default function QuickVisitButton({
  dogId,
  disabled,
  onCreate,
  onUndo,
}: QuickVisitButtonProps) {
  const { t } = useTranslation('healthPassport');
  const [lastClinicByDog, setLastClinicByDog] = useLocalStorage<Record<string, string>>(
    'granule-check-last-clinic-by-dog',
    {}
  );
  const [lastCreated, setLastCreated] = useState<LastCreatedRef | null>(null);
  const [promptOpen, setPromptOpen] = useState(false);
  const [promptClinic, setPromptClinic] = useState('');

  const lastClinic = dogId ? (lastClinicByDog[dogId] ?? '') : '';

  const buildAndSave = async (clinic: string) => {
    if (!dogId || !clinic.trim()) return;
    const trimmed = clinic.trim();
    const visit: VetVisitRecord = {
      id: uid(),
      dogId,
      date: today(),
      clinicName: trimmed,
      reason: t('quickVisit.reason'),
      diagnosis: t('quickVisit.diagnosis'),
      medicationIds: [],
    };
    const created = await onCreate(visit);
    setLastCreated({ id: created.id, clinic: created.clinicName });
    if (trimmed !== lastClinic) {
      setLastClinicByDog((prev) => ({ ...prev, [dogId]: trimmed }));
    }
  };

  const handleClick = () => {
    if (!dogId) return;
    if (!lastClinic.trim()) {
      setPromptClinic('');
      setPromptOpen(true);
      return;
    }
    void buildAndSave(lastClinic);
  };

  const handlePromptSave = () => {
    if (!promptClinic.trim()) return;
    void buildAndSave(promptClinic);
    setPromptOpen(false);
  };

  const handleUndo = () => {
    if (!lastCreated) return;
    onUndo(lastCreated.id);
    setLastCreated(null);
  };

  const handleSnackClose = (_event?: unknown, reason?: string) => {
    if (reason === 'clickaway') return;
    setLastCreated(null);
  };

  return (
    <>
      <Button
        variant="outlined"
        color="primary"
        startIcon={<BoltIcon />}
        onClick={handleClick}
        disabled={disabled || !dogId}
      >
        {t('quickVisit.button')}
      </Button>

      <Dialog open={promptOpen} onClose={() => setPromptOpen(false)} maxWidth="xs" fullWidth>
        <DialogTitle>{t('quickVisit.dialogTitle')}</DialogTitle>
        <DialogContent>
          <Stack spacing={1.5}>
            <Typography variant="body2" color="text.secondary">
              {t('quickVisit.description')}
            </Typography>
            <TextField
              autoFocus
              size="small"
              label={t('quickVisit.clinicLabel')}
              value={promptClinic}
              onChange={(e) => setPromptClinic(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') handlePromptSave();
              }}
              fullWidth
            />
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setPromptOpen(false)}>{t('quickVisit.cancel')}</Button>
          <Button variant="contained" onClick={handlePromptSave} disabled={!promptClinic.trim()}>
            {t('quickVisit.save')}
          </Button>
        </DialogActions>
      </Dialog>

      <Snackbar
        open={lastCreated !== null}
        autoHideDuration={SNACK_DURATION_MS}
        onClose={handleSnackClose}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
        message={lastCreated ? t('quickVisit.snackbar', { clinic: lastCreated.clinic }) : ''}
        action={
          <>
            <Button color="inherit" size="small" startIcon={<UndoIcon />} onClick={handleUndo}>
              {t('actions.back', { ns: 'common' })}
            </Button>
            <IconButton
              size="small"
              color="inherit"
              onClick={() => setLastCreated(null)}
              aria-label={t('quickVisit.closeAria')}
            >
              <CloseIcon fontSize="small" />
            </IconButton>
          </>
        }
      />
    </>
  );
}
