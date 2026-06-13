import type { ReactNode } from 'react';
import { useTranslation } from 'react-i18next';
import { Box, IconButton, Stack, Typography } from '@mui/material';
import {
  Close as CloseIcon,
  LightbulbOutlined as LightbulbOutlinedIcon,
} from '@mui/icons-material';
import { useLocalStorage } from '../hooks/useLocalStorage';

type FeatureKey = 'diary' | 'passport' | 'vetCard' | 'analyze';

interface FeatureIntroProps {
  featureKey: FeatureKey;
  icon: ReactNode;
  hideOnPrint?: boolean;
}

export default function FeatureIntro({ featureKey, icon, hideOnPrint = false }: FeatureIntroProps) {
  const { t } = useTranslation('common');
  const [dismissed, setDismissed] = useLocalStorage<boolean>(
    `granule-check-intro-seen-${featureKey}`,
    false
  );

  if (dismissed) return null;

  return (
    <Box
      sx={{
        mb: 2.5,
        position: 'relative',
        overflow: 'hidden',
        borderRadius: 4,
        bgcolor: (theme) =>
          theme.palette.mode === 'light' ? 'rgba(15, 76, 92, 0.05)' : 'rgba(111, 190, 209, 0.10)',
        border: (theme) =>
          `1px solid ${theme.palette.mode === 'light' ? 'rgba(15, 76, 92, 0.12)' : 'rgba(111, 190, 209, 0.18)'}`,
        p: { xs: 2, md: 2.5 },
        ...(hideOnPrint && { '@media print': { display: 'none' } }),
      }}
    >
      <IconButton
        aria-label={t('featureIntro.dismiss')}
        onClick={() => setDismissed(true)}
        size="small"
        sx={{
          position: 'absolute',
          top: (theme) => theme.spacing(1),
          right: (theme) => theme.spacing(1),
          color: 'text.secondary',
        }}
      >
        <CloseIcon fontSize="small" />
      </IconButton>
      <Stack direction="row" alignItems="flex-start" gap={2} sx={{ pr: 4 }}>
        <Box
          sx={{
            width: 48,
            height: 48,
            borderRadius: 2,
            bgcolor: 'primary.main',
            color: 'primary.contrastText',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: '0 4px 10px rgba(15,76,92,0.18)',
            flexShrink: 0,
          }}
        >
          {icon}
        </Box>
        <Box sx={{ flex: 1, minWidth: 0 }}>
          <Typography variant="subtitle1" sx={{ fontWeight: 700, lineHeight: 1.2 }}>
            {t(`featureIntro.${featureKey}.title`)}
          </Typography>
          <Typography variant="body2" sx={{ color: 'text.secondary', mt: 0.5 }}>
            {t(`featureIntro.${featureKey}.body`)}
          </Typography>
          <Stack
            direction="row"
            alignItems="center"
            gap={0.75}
            sx={{ mt: 1, color: 'text.secondary' }}
          >
            <LightbulbOutlinedIcon sx={{ fontSize: 16, flexShrink: 0 }} />
            <Typography variant="caption" sx={{ fontStyle: 'italic' }}>
              {t(`featureIntro.${featureKey}.example`)}
            </Typography>
          </Stack>
        </Box>
      </Stack>
    </Box>
  );
}
