import { Navigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Box, Button, Card, CardContent, Stack, Typography, alpha, useTheme } from '@mui/material';
import {
  VolunteerActivism as VolunteerActivismIcon,
  Favorite as FavoriteIcon,
} from '@mui/icons-material';

const DONATE_URL = import.meta.env.VITE_STRIPE_PAYMENT_LINK ?? '';

export default function SupportProjectPage() {
  const theme = useTheme();
  const { t } = useTranslation('landing');
  const { t: tCommon } = useTranslation();
  const isDark = theme.palette.mode === 'dark';

  if (!DONATE_URL) {
    return <Navigate to="/info?tab=about" replace />;
  }

  const intro = tCommon('support.intro');

  return (
    <Box sx={{ maxWidth: 760, mx: 'auto' }}>
      <Stack direction="row" alignItems="center" gap={1.5} sx={{ mb: 1 }}>
        <Box
          sx={{
            width: 44,
            height: 44,
            borderRadius: 2,
            bgcolor: alpha(theme.palette.primary.main, isDark ? 0.18 : 0.12),
            color: 'primary.main',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <VolunteerActivismIcon />
        </Box>
        <Box>
          <Typography variant="h4" sx={{ fontWeight: 700, lineHeight: 1.2 }}>
            {tCommon('nav.donate')}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            {intro}
          </Typography>
        </Box>
      </Stack>

      <Card sx={{ mt: 3 }}>
        <CardContent sx={{ p: { xs: 2.5, md: 3 } }}>
          <Typography variant="h6" sx={{ fontWeight: 700, mb: 1 }}>
            {t('about.support.title')}
          </Typography>
          <Typography variant="body1" color="text.secondary" sx={{ mb: 2.5, lineHeight: 1.7 }}>
            {t('about.support.body')}
          </Typography>
          <Button
            variant="contained"
            color="primary"
            component="a"
            href={DONATE_URL}
            target="_blank"
            rel="noopener noreferrer"
            startIcon={<VolunteerActivismIcon />}
            size="large"
            sx={{ fontWeight: 600 }}
          >
            {t('about.support.cta')}
          </Button>
          <Stack direction="row" alignItems="center" gap={0.75} sx={{ mt: 3 }}>
            <FavoriteIcon sx={{ fontSize: 16, color: 'error.main' }} />
            <Typography variant="caption" color="text.secondary">
              {t('about.madeWithLove')}
            </Typography>
          </Stack>
        </CardContent>
      </Card>
    </Box>
  );
}
