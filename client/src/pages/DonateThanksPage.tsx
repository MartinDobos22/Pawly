import { Link as RouterLink } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Box, Button, Stack, Typography, alpha, useTheme } from '@mui/material';
import {
  Favorite as FavoriteIcon,
  PetsOutlined as PetsOutlinedIcon,
  VolunteerActivism as VolunteerActivismIcon,
} from '@mui/icons-material';

const DONATE_URL = import.meta.env.VITE_STRIPE_PAYMENT_LINK ?? '';

export default function DonateThanksPage() {
  const theme = useTheme();
  const { t } = useTranslation();
  const isDark = theme.palette.mode === 'dark';

  return (
    <Box
      sx={{
        maxWidth: 640,
        mx: 'auto',
        textAlign: 'center',
        py: { xs: 4, md: 8 },
      }}
    >
      <Box
        sx={{
          width: 96,
          height: 96,
          borderRadius: '50%',
          mx: 'auto',
          mb: 3,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          bgcolor: alpha(theme.palette.error.main, isDark ? 0.18 : 0.12),
          color: 'error.main',
        }}
      >
        <FavoriteIcon sx={{ fontSize: 56 }} />
      </Box>
      <Typography variant="h4" sx={{ fontWeight: 700, mb: 1.5 }}>
        {t('donateThanks.title')}
      </Typography>
      <Typography variant="body1" color="text.secondary" sx={{ mb: 4 }}>
        {t('donateThanks.subtitle')}
      </Typography>
      <Stack
        direction={{ xs: 'column', sm: 'row' }}
        gap={1.5}
        justifyContent="center"
        alignItems="center"
      >
        <Button
          component={RouterLink}
          to="/prehlad"
          variant="contained"
          startIcon={<PetsOutlinedIcon />}
        >
          {t('donateThanks.back')}
        </Button>
        {DONATE_URL && (
          <Button
            component="a"
            href={DONATE_URL}
            target="_blank"
            rel="noopener noreferrer"
            variant="outlined"
            startIcon={<VolunteerActivismIcon />}
          >
            {t('donateThanks.another')}
          </Button>
        )}
      </Stack>
    </Box>
  );
}
