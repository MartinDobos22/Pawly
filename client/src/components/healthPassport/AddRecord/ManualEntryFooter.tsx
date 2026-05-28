import { useTranslation } from 'react-i18next';
import { Box, Button, Tooltip, Typography } from '@mui/material';
import { useManualEntry } from './ManualEntry';

const isMac = typeof navigator !== 'undefined' && /Mac|iPhone|iPad/i.test(navigator.platform);
const modKey = isMac ? '⌘' : 'Ctrl';

export default function ManualEntryFooter() {
  const { t } = useTranslation('healthPassport');
  const { submit, cancel } = useManualEntry();
  return (
    <>
      <Box sx={{ flex: 1, pl: 1, display: { xs: 'none', sm: 'block' } }}>
        <Typography
          variant="caption"
          sx={{ color: 'text.disabled', textTransform: 'none', letterSpacing: 0 }}
        >
          {t('addRecord.tipSave', { modKey })}
        </Typography>
      </Box>
      <Button onClick={cancel}>{t('actions.cancel', { ns: 'common' })}</Button>
      <Tooltip title={`${modKey} + Enter`} placement="top">
        <Button variant="contained" onClick={submit}>
          {t('addRecord.saveRecord')}
        </Button>
      </Tooltip>
    </>
  );
}
