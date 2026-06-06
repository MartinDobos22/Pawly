import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  Box,
  Button,
  Dialog,
  DialogContent,
  DialogTitle,
  IconButton,
  Stack,
  Tab,
  Tabs,
  Typography,
  useMediaQuery,
  useTheme,
} from '@mui/material';
import { Close as CloseIcon, PlayArrow as PlayArrowIcon } from '@mui/icons-material';
import { InstallSection, UsageSection } from './InstallGuideContent';

interface HelpDialogProps {
  open: boolean;
  onClose: () => void;
  onStartTour: () => void;
}

type TabKey = 'usage' | 'install' | 'tour';

export default function HelpDialog({ open, onClose, onStartTour }: HelpDialogProps) {
  const { t } = useTranslation();
  const theme = useTheme();
  const fullScreen = useMediaQuery(theme.breakpoints.down('sm'));
  const [tab, setTab] = useState<TabKey>('usage');

  return (
    <Dialog
      open={open}
      onClose={onClose}
      fullScreen={fullScreen}
      maxWidth="md"
      fullWidth
      slotProps={{ paper: { sx: { borderRadius: fullScreen ? 0 : 3, minHeight: { sm: 480 } } } }}
    >
      <DialogTitle sx={{ pr: 6 }}>
        <Typography variant="h6" sx={{ fontWeight: 700 }}>
          {t('help.dialogTitle')}
        </Typography>
        <IconButton
          aria-label={t('help.close')}
          onClick={onClose}
          sx={{
            position: 'absolute',
            right: theme.spacing(1),
            top: theme.spacing(1),
            color: 'text.secondary',
          }}
        >
          <CloseIcon />
        </IconButton>
      </DialogTitle>

      <Tabs
        value={tab}
        onChange={(_e, v: TabKey) => setTab(v)}
        variant="fullWidth"
        sx={{ borderBottom: `1px solid ${theme.palette.divider}` }}
      >
        <Tab value="usage" label={t('help.tabUsage')} />
        <Tab value="install" label={t('help.tabInstall')} />
        <Tab value="tour" label={t('help.tabTour')} />
      </Tabs>

      <DialogContent sx={{ pt: 2 }}>
        {tab === 'usage' && <UsageSection />}
        {tab === 'install' && <InstallSection />}
        {tab === 'tour' && (
          <Stack alignItems="flex-start" spacing={2}>
            <Box>
              <Typography variant="subtitle1" sx={{ fontWeight: 700, mb: 0.5 }}>
                {t('help.restartTourTitle')}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {t('help.restartTourDescription')}
              </Typography>
            </Box>
            <Button
              variant="contained"
              startIcon={<PlayArrowIcon />}
              onClick={() => {
                onClose();
                onStartTour();
              }}
              sx={{ fontWeight: 600 }}
            >
              {t('help.restartTourCta')}
            </Button>
          </Stack>
        )}
      </DialogContent>
    </Dialog>
  );
}
