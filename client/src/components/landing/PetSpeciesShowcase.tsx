import { Box, Stack, Typography, alpha, useTheme } from '@mui/material';
import { useTranslation } from 'react-i18next';
import { PET_ICONS } from './PetIcons';

type FeatureTone = 'primary' | 'success' | 'warning' | 'info' | 'secondary' | 'error';

const TONES: FeatureTone[] = [
  'primary',
  'info',
  'warning',
  'secondary',
  'success',
  'error',
  'primary',
  'secondary',
];

export default function PetSpeciesShowcase() {
  const theme = useTheme();
  const { t } = useTranslation('landing');
  const items = t('allPets.items', { returnObjects: true }) as Array<{ label: string }>;

  return (
    <Box sx={{ py: { xs: 8, md: 14 } }}>
      <Box sx={{ maxWidth: 1200, mx: 'auto', px: { xs: 2.5, md: 4 } }}>
        <Stack alignItems="center" spacing={2} sx={{ mb: { xs: 6, md: 8 }, textAlign: 'center' }}>
          <Typography
            variant="h2"
            sx={{
              fontSize: { xs: '2rem', md: '3rem' },
              fontWeight: 700,
              letterSpacing: '-0.025em',
              lineHeight: 1.1,
              maxWidth: 800,
            }}
          >
            {t('allPets.title1')}{' '}
            <Box
              component="span"
              sx={{
                background: `linear-gradient(135deg, ${theme.palette.primary.main}, ${theme.palette.primary.light})`,
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                backgroundClip: 'text',
              }}
            >
              {t('allPets.title2')}
            </Box>
          </Typography>
          <Typography
            variant="body1"
            sx={{ color: 'text.secondary', maxWidth: 540, fontSize: { xs: '1rem', md: '1.1rem' } }}
          >
            {t('allPets.subtitle')}
          </Typography>
        </Stack>

        <Box
          sx={{
            display: 'grid',
            gridTemplateColumns: {
              xs: 'repeat(2, 1fr)',
              sm: 'repeat(3, 1fr)',
              md: 'repeat(4, 1fr)',
            },
            gap: { xs: 2, md: 2.5 },
          }}
        >
          {items.map((pet, idx) => {
            const Icon = PET_ICONS[idx % PET_ICONS.length];
            const tone = TONES[idx % TONES.length];
            const color = theme.palette[tone].main;
            return (
              <Stack
                key={idx}
                alignItems="center"
                spacing={1.5}
                sx={{
                  p: { xs: 2.5, md: 3 },
                  borderRadius: 4,
                  border: `1px solid ${theme.palette.divider}`,
                  bgcolor: alpha(theme.palette.background.paper, 0.6),
                  backdropFilter: 'blur(8px)',
                  WebkitBackdropFilter: 'blur(8px)',
                  transition:
                    'transform 220ms ease, border-color 220ms ease, box-shadow 220ms ease',
                  '&:hover': {
                    transform: 'translateY(-6px)',
                    borderColor: alpha(color, 0.5),
                    boxShadow: `0 14px 30px ${alpha(color, 0.18)}`,
                  },
                }}
              >
                <Box
                  sx={{
                    width: 56,
                    height: 56,
                    borderRadius: 3,
                    bgcolor: alpha(color, 0.12),
                    color,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <Icon style={{ fontSize: 30, width: '1em', height: '1em' }} />
                </Box>
                <Typography variant="subtitle1" sx={{ fontWeight: 700, color: 'text.primary' }}>
                  {pet.label}
                </Typography>
              </Stack>
            );
          })}
        </Box>
      </Box>
    </Box>
  );
}
