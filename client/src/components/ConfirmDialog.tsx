import { useEffect, useState } from 'react';
import {
  Alert,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  Stack,
  TextField,
  Typography,
} from '@mui/material';
import { useTranslation } from 'react-i18next';

export interface ConfirmDialogProps {
  open: boolean;
  title: string;
  message: string;
  confirmLabel?: string;
  cancelLabel?: string;
  danger?: boolean;
  requireText?: string;
  requireTextHelper?: string;
  loading?: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}

export default function ConfirmDialog({
  open,
  title,
  message,
  confirmLabel,
  cancelLabel,
  danger = false,
  requireText,
  requireTextHelper,
  loading = false,
  onConfirm,
  onCancel,
}: ConfirmDialogProps) {
  const { t } = useTranslation();
  const [typed, setTyped] = useState('');

  useEffect(() => {
    if (!open) setTyped('');
  }, [open]);

  const typedMatches = !requireText || typed.trim() === requireText.trim();
  const confirmDisabled = loading || !typedMatches;

  return (
    <Dialog open={open} onClose={loading ? undefined : onCancel} maxWidth="xs" fullWidth>
      <DialogTitle sx={{ fontWeight: 600 }}>{title}</DialogTitle>
      <DialogContent>
        <Stack spacing={2}>
          <DialogContentText>{message}</DialogContentText>
          {danger && (
            <Alert severity="warning" variant="outlined">
              {t('actions.irreversible', 'Túto akciu nie je možné vrátiť späť.')}
            </Alert>
          )}
          {requireText && (
            <Stack spacing={1}>
              <Typography variant="body2" color="text.secondary">
                {requireTextHelper ??
                  t('actions.typeToConfirm', 'Pre potvrdenie napíš: {{value}}', {
                    value: requireText,
                  })}
              </Typography>
              <TextField
                autoFocus
                size="small"
                fullWidth
                value={typed}
                onChange={(e) => setTyped(e.target.value)}
                placeholder={requireText}
                disabled={loading}
              />
            </Stack>
          )}
        </Stack>
      </DialogContent>
      <DialogActions>
        <Button onClick={onCancel} disabled={loading}>
          {cancelLabel ?? t('actions.cancel')}
        </Button>
        <Button
          onClick={onConfirm}
          disabled={confirmDisabled}
          color={danger ? 'error' : 'primary'}
          variant="contained"
        >
          {confirmLabel ?? t('actions.confirm')}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
