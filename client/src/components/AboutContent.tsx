import { useTranslation } from 'react-i18next';
import { Box, Button, Card, CardContent, Stack, Typography, alpha, useTheme } from '@mui/material';
import {
  Pets as PetsIcon,
  Science as ScienceIcon,
  HealthAndSafety as HealthAndSafetyIcon,
  MenuBook as MenuBookIcon,
  Description as DescriptionIcon,
  Lock as LockIcon,
  Favorite as FavoriteIcon,
  VolunteerActivism as VolunteerActivismIcon,
} from '@mui/icons-material';
import PawlyLogo from './PawlyLogo';
import SocialLinks from './SocialLinks';

const DONATE_URL = import.meta.env.VITE_STRIPE_PAYMENT_LINK ?? '';

interface AboutContentProps {
  showLogo?: boolean;
  showDonate?: boolean;
}

export default function AboutContent({ showLogo = true, showDonate = true }: AboutContentProps) {
  const theme = useTheme();
  const { t } = useTranslation('landing');
  const isDark = theme.palette.mode === 'dark';

  const FEATURES = [
    {
      icon: ScienceIcon,
      title: t('about.features.aiAnalysis.title'),
      description: t('about.features.aiAnalysis.description'),
    },
    {
      icon: HealthAndSafetyIcon,
      title: t('about.features.healthPassport.title'),
      description: t('about.features.healthPassport.description'),
    },
    {
      icon: MenuBookIcon,
      title: t('about.features.diary.title'),
      description: t('about.features.diary.description'),
    },
    {
      icon: DescriptionIcon,
      title: t('about.features.vetCard.title'),
      description: t('about.features.vetCard.description'),
    },
    {
      icon: PetsIcon,
      title: t('about.features.profiles.title'),
      description: t('about.features.profiles.description'),
    },
  ];

  return (
    <Box>
      {showLogo && <PawlyLogo size="lg" sx={{ mx: 'auto', mb: 2 }} />}
      <Typography variant="h4" sx={{ fontWeight: 700, mb: 0.5 }}>
        {t('about.title')}
      </Typography>
      <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
        {t('about.subtitle')}
      </Typography>

      <Card sx={{ mb: 2.5 }}>
        <CardContent sx={{ p: { xs: 2.5, md: 3 } }}>
          <Stack direction="row" alignItems="center" gap={1.5} sx={{ mb: 2 }}>
            <Box
              sx={{
                width: 60,
                height: 60,
                borderRadius: 2,
                bgcolor: 'primary.main',
                color: 'primary.contrastText',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: isDark
                  ? `0 0 14px ${alpha(theme.palette.primary.main, 0.4)}`
                  : `0 4px 10px ${alpha(theme.palette.primary.main, 0.2)}`,
              }}
            >
              <PetsIcon fontSize="large" />
            </Box>
            <Box>
              <Typography variant="h5" sx={{ fontWeight: 800, letterSpacing: '-0.015em' }}>
                {t('about.appName')}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {t('about.appTagline')}
              </Typography>
            </Box>
          </Stack>
          <Typography variant="body1" sx={{ lineHeight: 1.7, color: 'text.secondary' }}>
            {t('about.appDescription')}
          </Typography>
        </CardContent>
      </Card>

      <Card sx={{ mb: 2.5 }}>
        <CardContent sx={{ p: { xs: 2.5, md: 3 } }}>
          <Typography variant="h6" sx={{ fontWeight: 700, mb: 2 }}>
            {t('about.featuresTitle')}
          </Typography>
          <Stack spacing={2.25}>
            {FEATURES.map(({ icon: Icon, title, description }) => (
              <Stack key={title} direction="row" gap={1.75} alignItems="flex-start">
                <Box
                  sx={{
                    width: 50,
                    height: 50,
                    borderRadius: 2,
                    flexShrink: 0,
                    bgcolor: alpha(theme.palette.primary.main, isDark ? 0.18 : 0.1),
                    color: 'primary.main',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <Icon fontSize="medium" />
                </Box>
                <Box>
                  <Typography variant="subtitle1" sx={{ fontWeight: 600, lineHeight: 1.3 }}>
                    {title}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {description}
                  </Typography>
                </Box>
              </Stack>
            ))}
          </Stack>
        </CardContent>
      </Card>

      <Card sx={{ mb: 3 }}>
        <CardContent sx={{ p: { xs: 2.5, md: 3 } }}>
          <Stack direction="row" gap={1.75} alignItems="flex-start">
            <Box
              sx={{
                width: 40,
                height: 40,
                borderRadius: 2,
                flexShrink: 0,
                bgcolor: alpha(theme.palette.success.main, isDark ? 0.18 : 0.12),
                color: 'success.main',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <LockIcon fontSize="small" />
            </Box>
            <Box>
              <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 0.25 }}>
                {t('about.privacyTitle')}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {t('about.privacyDescription')}
              </Typography>
            </Box>
          </Stack>
        </CardContent>
      </Card>

      {showDonate && DONATE_URL && (
        <Card sx={{ mb: 3 }}>
          <CardContent sx={{ p: { xs: 2.5, md: 3 } }}>
            <Stack direction="row" gap={1.75} alignItems="flex-start" sx={{ mb: 2 }}>
              <Box
                sx={{
                  width: 40,
                  height: 40,
                  borderRadius: 2,
                  flexShrink: 0,
                  bgcolor: alpha(theme.palette.primary.main, isDark ? 0.18 : 0.12),
                  color: 'primary.main',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <VolunteerActivismIcon fontSize="small" />
              </Box>
              <Box>
                <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 0.25 }}>
                  {t('about.support.title')}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {t('about.support.body')}
                </Typography>
              </Box>
            </Stack>
            <Button
              variant="contained"
              color="primary"
              component="a"
              href={DONATE_URL}
              target="_blank"
              rel="noopener noreferrer"
              startIcon={<VolunteerActivismIcon />}
              sx={{ fontWeight: 600 }}
            >
              {t('about.support.cta')}
            </Button>
          </CardContent>
        </Card>
      )}

      <Stack direction="row" alignItems="center" justifyContent="center" gap={0.75} sx={{ mb: 1 }}>
        <Typography variant="body2" color="text.secondary">
          {t('about.madeWithLove')}
        </Typography>
        <FavoriteIcon sx={{ fontSize: 20, color: 'error.main' }} />
      </Stack>
      <Stack alignItems="center" sx={{ mb: 2 }}>
        <SocialLinks />
      </Stack>
    </Box>
  );
}
