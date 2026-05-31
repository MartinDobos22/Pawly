import { Box, Link, Stack, Typography, useTheme } from '@mui/material';
import { Pets as PetsIcon } from '@mui/icons-material';
import { useTranslation } from 'react-i18next';

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
          <Stack direction="row" alignItems="center" gap={1}>
            <Box
              sx={{
                width: 28,
                height: 28,
                borderRadius: 1.5,
                bgcolor: 'primary.main',
                color: 'primary.contrastText',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <PetsIcon sx={{ fontSize: 18 }} />
            </Box>
            <Typography sx={{ fontWeight: 800, fontSize: '0.95rem' }}>Pawly</Typography>
            <Typography
              variant="caption"
              sx={{ color: 'text.disabled', textTransform: 'none', letterSpacing: 0 }}
            >
              · {new Date().getFullYear()}
            </Typography>
          </Stack>
          <Stack direction="row" gap={3}>
            <Link
              href="/o-aplikacii"
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
          </Stack>
        </Stack>
      </Box>
    </Box>
  );
}
