import { Box, Link, Stack, Typography, useTheme } from '@mui/material';
import { useTranslation } from 'react-i18next';
import PawlyLogo from '../PawlyLogo';
import SocialLinks from '../SocialLinks';

export default function LandingFooter() {
  const theme = useTheme();
  const { t } = useTranslation('landing');

  return (
    <Box
      component="footer"
      sx={{
        py: 4,
        borderTop: `1px solid ${theme.palette.divider}`,
      }}
    >
      <Box sx={{ maxWidth: 1200, mx: 'auto', px: { xs: 2.5, md: 4 } }}>
        <Stack
          direction={{ xs: 'column', md: 'row' }}
          justifyContent="space-between"
          alignItems={{ xs: 'flex-start', md: 'center' }}
          gap={2}
        >
          <Stack direction="row" alignItems="center" gap={1.25}>
            <PawlyLogo size="sm" />
            <Typography
              variant="caption"
              sx={{ color: 'text.disabled', textTransform: 'none', letterSpacing: 0 }}
            >
              · {new Date().getFullYear()}
            </Typography>
          </Stack>
          <Stack direction="row" alignItems="center" gap={3} flexWrap="wrap">
            <Link
              href="/analyza-krmiva-pre-psa"
              underline="hover"
              sx={{ color: 'text.secondary', fontSize: '0.85rem' }}
            >
              Analýza krmiva
            </Link>
            <Link
              href="/digitalny-zdravotny-pas-pre-psa"
              underline="hover"
              sx={{ color: 'text.secondary', fontSize: '0.85rem' }}
            >
              Zdravotný pas
            </Link>
            <Link
              href="/ockovanie-psa"
              underline="hover"
              sx={{ color: 'text.secondary', fontSize: '0.85rem' }}
            >
              Očkovanie
            </Link>
            <Link
              href="/odcervenie-psa"
              underline="hover"
              sx={{ color: 'text.secondary', fontSize: '0.85rem' }}
            >
              Odčervenie
            </Link>
            <Link
              href="/alergia-na-krmivo-u-psa"
              underline="hover"
              sx={{ color: 'text.secondary', fontSize: '0.85rem' }}
            >
              Alergie na krmivo
            </Link>
            <Link
              href="/co-nesmie-pes-jest"
              underline="hover"
              sx={{ color: 'text.secondary', fontSize: '0.85rem' }}
            >
              Čo nesmie pes jesť
            </Link>
            <Link
              href="/info?tab=about"
              underline="hover"
              sx={{ color: 'text.secondary', fontSize: '0.85rem' }}
            >
              {t('footer.about')}
            </Link>
            <Link
              href="/profily"
              underline="hover"
              sx={{ color: 'text.secondary', fontSize: '0.85rem' }}
            >
              {t('footer.profiles')}
            </Link>
            <Link
              href="/analyza"
              underline="hover"
              sx={{ color: 'text.secondary', fontSize: '0.85rem' }}
            >
              {t('footer.start')}
            </Link>
            <SocialLinks size="sm" />
          </Stack>
        </Stack>
      </Box>
    </Box>
  );
}
