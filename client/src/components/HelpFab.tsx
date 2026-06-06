import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Fab } from '@mui/material';
import { HelpOutline as HelpOutlineIcon } from '@mui/icons-material';
import { useLocalStorage } from '../hooks/useLocalStorage';
import HelpDialog from './HelpDialog';
import OnboardingTour from './OnboardingTour';

export default function HelpFab() {
  const { t } = useTranslation();
  const [seen, setSeen] = useLocalStorage('granule-check-onboarding-seen', false);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [tourOpen, setTourOpen] = useState(!seen);

  const handleCloseTour = () => {
    setTourOpen(false);
    if (!seen) setSeen(true);
  };

  return (
    <>
      <Fab
        size="medium"
        color="primary"
        aria-label={t('help.fabLabel')}
        onClick={() => setDialogOpen(true)}
        sx={{
          position: 'fixed',
          right: (theme) => theme.spacing(2),
          bottom: (theme) => ({ xs: theme.spacing(9), md: theme.spacing(3) }),
          zIndex: (theme) => theme.zIndex.speedDial,
          '@media print': { display: 'none' },
        }}
      >
        <HelpOutlineIcon />
      </Fab>
      <HelpDialog
        open={dialogOpen}
        onClose={() => setDialogOpen(false)}
        onStartTour={() => setTourOpen(true)}
      />
      <OnboardingTour open={tourOpen} onClose={handleCloseTour} />
    </>
  );
}
