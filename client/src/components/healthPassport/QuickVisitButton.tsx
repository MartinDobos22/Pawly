import { useState } from 'react';
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

const QUICK_VISIT_REASON = 'Kontrola u veterinára';
const QUICK_VISIT_DIAGNOSIS = 'Zdravý, bez problémov';
const SNACK_DURATION_MS = 6000;

interface QuickVisitButtonProps {
  dogId: string;
  disabled?: boolean;
  onCreate: (visit: VetVisitRecord) => void;
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
  const [lastClinicByDog, setLastClinicByDog] = useLocalStorage<Record<string, string>>(
    'granule-check-last-clinic-by-dog',
    {}
  );
  const [lastCreated, setLastCreated] = useState<LastCreatedRef | null>(null);
  const [promptOpen, setPromptOpen] = useState(false);
  const [promptClinic, setPromptClinic] = useState('');

  const lastClinic = dogId ? (lastClinicByDog[dogId] ?? '') : '';

  const buildAndSave = (clinic: string) => {
    if (!dogId || !clinic.trim()) return;
    const trimmed = clinic.trim();
    const visit: VetVisitRecord = {
      id: uid(),
      dogId,
      date: today(),
      clinicName: trimmed,
      reason: QUICK_VISIT_REASON,
      diagnosis: QUICK_VISIT_DIAGNOSIS,
      medicationIds: [],
    };
    onCreate(visit);
    setLastCreated({ id: visit.id, clinic: visit.clinicName });
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
    buildAndSave(lastClinic);
  };

  const handlePromptSave = () => {
    if (!promptClinic.trim()) return;
    buildAndSave(promptClinic);
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
        Rýchla návšteva
      </Button>

      <Dialog open={promptOpen} onClose={() => setPromptOpen(false)} maxWidth="xs" fullWidth>
        <DialogTitle>Zadaj meno kliniky</DialogTitle>
        <DialogContent>
          <Stack spacing={1.5}>
            <Typography variant="body2" color="text.secondary">
              Klinika sa zapamätá pre ďalšie rýchle návštevy. Návšteva sa uloží s dnešným dátumom a
              poznámkou „Zdravý, bez problémov".
            </Typography>
            <TextField
              autoFocus
              size="small"
              label="Klinika / veterinár"
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
          <Button onClick={() => setPromptOpen(false)}>Zrušiť</Button>
          <Button variant="contained" onClick={handlePromptSave} disabled={!promptClinic.trim()}>
            Uložiť návštevu
          </Button>
        </DialogActions>
      </Dialog>

      <Snackbar
        open={lastCreated !== null}
        autoHideDuration={SNACK_DURATION_MS}
        onClose={handleSnackClose}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
        message={lastCreated ? `Návšteva zaznamenaná u ${lastCreated.clinic}` : ''}
        action={
          <>
            <Button color="inherit" size="small" startIcon={<UndoIcon />} onClick={handleUndo}>
              Späť
            </Button>
            <IconButton
              size="small"
              color="inherit"
              onClick={() => setLastCreated(null)}
              aria-label="Zavrieť"
            >
              <CloseIcon fontSize="small" />
            </IconButton>
          </>
        }
      />
    </>
  );
}
