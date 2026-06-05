import { useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Box, Button, IconButton, Stack, Typography, alpha, useTheme } from '@mui/material';
import {
  Close as CloseIcon,
  InstallMobile as InstallMobileIcon,
  IosShare as IosShareIcon,
} from '@mui/icons-material';
import { useInstallPrompt } from '../hooks/useInstallPrompt';
import { useLocalStorage } from '../hooks/useLocalStorage';

export default function InstallAppBanner() {
  const { t } = useTranslation('install');
  const theme = useTheme();
  const navigate = useNavigate();
  const { canInstall, isInstalled, platform, promptInstall } = useInstallPrompt();
  const [dismissed, setDismissed] = useLocalStorage('granule-check-install-banner-dismissed', false);

  const handleInstall = useCallback(() => {
    void promptInstall();
  }, [promptInstall]);

  const isIos = platform === 'ios';

  if (isInstalled || dismissed) return null;
  if (!canInstall && !isIos) return null;

  const isDark = theme.palette.mode === 'dark';

  return (
    <Box
      role="region"
      aria-label={t('banner.title')}
      sx={{
        mb: { xs: 2, md: 3 },
        p: { xs: 1.75, md: 2 },
        borderRadius: 2,
        border: `1px solid ${alpha(theme.palette.primary.main, isDark ? 0.4 : 0.25)}`,
        bgcolor: alpha(theme.palette.primary.main, isDark ? 0.16 : 0.08),
        '@media print': { display: 'none' },
      }}
    >
      <Stack direction="row" gap={1.75} alignItems="flex-start">
        <Box
          sx={{
            width: 40,
            height: 40,
            borderRadius: 2,
            flexShrink: 0,
            bgcolor: 'primary.main',
            color: 'primary.contrastText',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <InstallMobileIcon fontSize="small" />
        </Box>

        <Box sx={{ flex: 1, minWidth: 0 }}>
          <Typography variant="subtitle1" sx={{ fontWeight: 700, lineHeight: 1.3 }}>
            {t('banner.title')}
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mt: 0.25 }}>
            {t('banner.description')}
          </Typography>

          <Stack
            direction="row"
            gap={1}
            alignItems="center"
            flexWrap="wrap"
            sx={{ mt: 1.5 }}
          >
            {canInstall ? (
              <Button
                variant="contained"
                color="primary"
                size="small"
                startIcon={<InstallMobileIcon />}
                onClick={handleInstall}
                sx={{ fontWeight: 600 }}
              >
                {t('banner.installCta')}
              </Button>
            ) : (
              <Stack direction="row" gap={0.75} alignItems="center" color="text.secondary">
                <IosShareIcon fontSize="small" />
                <Typography variant="body2">{t('banner.iosHint')}</Typography>
              </Stack>
            )}
            <Button
              variant="text"
              size="small"
              onClick={() => navigate('/info?tab=install')}
              sx={{ fontWeight: 600 }}
            >
              {t('banner.guideLink')}
            </Button>
          </Stack>
        </Box>

        <IconButton
          size="small"
          aria-label={t('banner.dismiss')}
          onClick={() => setDismissed(true)}
          sx={{ flexShrink: 0, color: 'text.secondary' }}
        >
          <CloseIcon fontSize="small" />
        </IconButton>
      </Stack>
    </Box>
  );
}
