import { useRef, useState } from 'react';
import {
  Box,
  Dialog,
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
import ManualEntry, { type ManualEntryHandle } from './ManualEntry';
import AiImport, { type AiImportHandle } from './AiImport';

type Mode = 'MANUAL' | 'AI';

interface AddRecordProps {
  open: boolean;
  dogId: string;
  currentDietEntryId?: string;
  onClose: () => void;
  onSave: (bundle: VisitBundle) => void;
}

export default function AddRecord({
  open,
  dogId,
  currentDietEntryId,
  onClose,
  onSave,
}: AddRecordProps) {
  const [mode, setMode] = useState<Mode>('MANUAL');
  const manualRef = useRef<ManualEntryHandle | null>(null);
  const aiRef = useRef<AiImportHandle | null>(null);

  const handleClose = () => {
    manualRef.current?.reset();
    aiRef.current?.reset();
    setMode('MANUAL');
    onClose();
  };

  const handleSave = (bundle: VisitBundle) => {
    onSave(bundle);
    handleClose();
  };

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="md" fullWidth>
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

      <DialogContent dividers>
        <Box sx={{ mb: 2, display: 'flex', justifyContent: 'center' }}>
          <ToggleButtonGroup
            value={mode}
            exclusive
            color="primary"
            size="small"
            onChange={(_, next: Mode | null) => {
              if (next) setMode(next);
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

        {mode === 'MANUAL' ? (
          <ManualEntry
            ref={manualRef}
            dogId={dogId}
            currentDietEntryId={currentDietEntryId}
            onSave={handleSave}
            onCancel={handleClose}
          />
        ) : (
          <AiImport ref={aiRef} dogId={dogId} onSave={handleSave} onCancel={handleClose} />
        )}
      </DialogContent>
    </Dialog>
  );
}
