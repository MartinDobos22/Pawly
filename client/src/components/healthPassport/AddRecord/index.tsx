import { useState } from 'react';
import {
  Box,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  IconButton,
  Stack,
  Typography,
  alpha,
  useTheme,
} from '@mui/material';
import {
  AutoAwesome as AiIcon,
  Bolt as BoltIcon,
  Close as CloseIcon,
  Edit as EditIcon,
} from '@mui/icons-material';

import type { VisitBundle } from '../../../utils/vetVisitHelper';
import ManualEntryProvider from './ManualEntry';
import ManualEntryBody from './ManualEntryBody';
import ManualEntryFooter from './ManualEntryFooter';
import AiImportProvider from './AiImport';
import AiImportBody from './AiImportBody';
import AiImportFooter from './AiImportFooter';
import QuickEntryProvider, { QuickEntryBody, QuickEntryFooter } from './QuickEntry';

type Mode = 'QUICK' | 'MANUAL' | 'AI';

interface AddRecordProps {
  open: boolean;
  dogId: string;
  currentDietEntryId?: string;
  onClose: () => void;
  onSave: (bundle: VisitBundle) => void;
}

type ModeIcon = typeof EditIcon;

function ModeToggle({ mode, onChange }: { mode: Mode; onChange: (next: Mode) => void }) {
  const theme = useTheme();
  const tabs: { value: Mode; label: string; icon: ModeIcon }[] = [
    { value: 'QUICK', label: 'Rýchly', icon: BoltIcon },
    { value: 'MANUAL', label: 'Manuálna návšteva', icon: EditIcon },
    { value: 'AI', label: 'Z dokumentu (AI)', icon: AiIcon },
  ];

  return (
    <Box sx={{ mb: 2.5, display: 'flex', justifyContent: 'center' }}>
      <Box
        role="tablist"
        sx={{
          display: 'inline-flex',
          p: 0.5,
          gap: 0.5,
          borderRadius: 999,
          bgcolor: alpha(theme.palette.text.primary, 0.04),
          border: `1px solid ${theme.palette.divider}`,
          flexWrap: 'wrap',
        }}
      >
        {tabs.map(({ value, label, icon: Icon }) => {
          const active = mode === value;
          return (
            <Box
              key={value}
              role="tab"
              aria-selected={active}
              component="button"
              type="button"
              onClick={() => onChange(value)}
              sx={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 0.75,
                px: 2,
                py: 0.75,
                borderRadius: 999,
                border: 'none',
                cursor: 'pointer',
                font: 'inherit',
                fontSize: '0.85rem',
                fontWeight: 600,
                color: active ? 'primary.contrastText' : 'text.secondary',
                bgcolor: active ? 'primary.main' : 'transparent',
                boxShadow: active ? '0 2px 6px rgba(15,76,92,0.18)' : 'none',
                transition: 'background-color 150ms ease, color 150ms ease',
                '&:hover': active ? {} : { color: 'text.primary' },
                '&:focus-visible': {
                  outline: `2px solid ${theme.palette.primary.main}`,
                  outlineOffset: 2,
                },
              }}
            >
              <Icon sx={{ fontSize: 16 }} />
              {label}
            </Box>
          );
        })}
      </Box>
    </Box>
  );
}

const subtitleFor = (mode: Mode): string => {
  if (mode === 'QUICK') return 'Rýchle zalogovanie jedného typu záznamu (bez detailov o návšteve).';
  if (mode === 'MANUAL') return 'Vyplň formulár návštevy veterinára manuálne.';
  return 'AI extrahuje vakcinácie a záznamy z nahraných dokumentov.';
};

export default function AddRecord({
  open,
  dogId,
  currentDietEntryId,
  onClose,
  onSave,
}: AddRecordProps) {
  const [mode, setMode] = useState<Mode>('QUICK');

  const handleClose = () => {
    setMode('QUICK');
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
            {subtitleFor(mode)}
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
      {mode === 'QUICK' && (
        <QuickEntryProvider
          dogId={dogId}
          currentDietEntryId={currentDietEntryId}
          onSave={handleSave}
          onCancel={handleClose}
        >
          {dialogTitle}
          <DialogContent dividers>
            <ModeToggle mode={mode} onChange={setMode} />
            <QuickEntryBody />
          </DialogContent>
          <DialogActions sx={{ px: 3, py: 2 }}>
            <QuickEntryFooter />
          </DialogActions>
        </QuickEntryProvider>
      )}
      {mode === 'MANUAL' && (
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
      )}
      {mode === 'AI' && (
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
