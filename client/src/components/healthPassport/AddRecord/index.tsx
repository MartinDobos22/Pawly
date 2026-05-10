import { useState } from 'react';
import {
  Box,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  IconButton,
  Stack,
  ToggleButton,
  ToggleButtonGroup,
  Typography,
} from '@mui/material';
import { AutoAwesome as AiIcon, Close as CloseIcon, Edit as EditIcon } from '@mui/icons-material';

import type { VisitBundle } from '../../../utils/vetVisitHelper';
import ManualEntryProvider from './ManualEntry';
import ManualEntryBody from './ManualEntryBody';
import ManualEntryFooter from './ManualEntryFooter';
import AiImportProvider from './AiImport';
import AiImportBody from './AiImportBody';
import AiImportFooter from './AiImportFooter';

type Mode = 'MANUAL' | 'AI';

interface AddRecordProps {
  open: boolean;
  dogId: string;
  currentDietEntryId?: string;
  onClose: () => void;
  onSave: (bundle: VisitBundle) => void;
}

function ModeToggle({ mode, onChange }: { mode: Mode; onChange: (next: Mode) => void }) {
  return (
    <Box sx={{ mb: 2, display: 'flex', justifyContent: 'center' }}>
      <ToggleButtonGroup
        value={mode}
        exclusive
        color="primary"
        size="small"
        onChange={(_, next: Mode | null) => {
          if (next) onChange(next);
        }}
      >
        <ToggleButton value="MANUAL">
          <EditIcon sx={{ fontSize: 16, mr: 0.75 }} />
          Manuálne
        </ToggleButton>
        <ToggleButton value="AI">
          <AiIcon sx={{ fontSize: 16, mr: 0.75 }} />Z dokumentu
        </ToggleButton>
      </ToggleButtonGroup>
    </Box>
  );
}

export default function AddRecord({
  open,
  dogId,
  currentDietEntryId,
  onClose,
  onSave,
}: AddRecordProps) {
  const [mode, setMode] = useState<Mode>('MANUAL');

  const handleClose = () => {
    setMode('MANUAL');
    onClose();
  };

  const handleSave = (bundle: VisitBundle) => {
    onSave(bundle);
    handleClose();
  };

  const dialogTitle = (
    <DialogTitle sx={{ pb: 1 }}>
      <Stack direction="row" alignItems="center" gap={1}>
        <Box sx={{ flex: 1 }}>
          <Typography variant="h6" sx={{ fontWeight: 600 }}>
            Pridať záznam
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Manuálne vyplň formulár alebo nahraj dokument na AI extrakciu.
          </Typography>
        </Box>
        <IconButton onClick={handleClose} size="small" aria-label="Zavrieť">
          <CloseIcon />
        </IconButton>
      </Stack>
    </DialogTitle>
  );

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="md" fullWidth>
      {mode === 'MANUAL' ? (
        <ManualEntryProvider
          dogId={dogId}
          currentDietEntryId={currentDietEntryId}
          onSave={handleSave}
          onCancel={handleClose}
        >
          {dialogTitle}
          <DialogContent dividers>
            <ModeToggle mode={mode} onChange={setMode} />
            <ManualEntryBody />
          </DialogContent>
          <DialogActions sx={{ px: 3, py: 2 }}>
            <ManualEntryFooter />
          </DialogActions>
        </ManualEntryProvider>
      ) : (
        <AiImportProvider dogId={dogId} onSave={handleSave} onCancel={handleClose}>
          {dialogTitle}
          <DialogContent dividers>
            <ModeToggle mode={mode} onChange={setMode} />
            <AiImportBody />
          </DialogContent>
          <DialogActions sx={{ px: 3, py: 2 }}>
            <AiImportFooter />
          </DialogActions>
        </AiImportProvider>
      )}
    </Dialog>
  );
}
