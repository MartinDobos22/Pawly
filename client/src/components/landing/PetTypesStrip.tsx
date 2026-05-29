import { Box, Stack, Typography, useTheme } from '@mui/material';
import { useTranslation } from 'react-i18next';

const PET_EMOJIS = ['🐕', '🐈', '🐇', '🐹', '🦜', '🐢', '🐠', '🐎'];

export default function PetTypesStrip() {
  const theme = useTheme();
  const isDark = theme.palette.mode === 'dark';
  const { t } = useTranslation('landing');
  const petItems = t('petTypes.items', { returnObjects: true }) as Array<{ label: string }>;

  return (
    <Box sx={{ py: { xs: 6, md: 8 }, textAlign: 'center' }}>
      <Box sx={{ maxWidth: 900, mx: 'auto', px: { xs: 2.5, md: 4 } }}>
        <Typography
          variant="caption"
          sx={{
            display: 'block',
            color: 'text.disabled',
            fontWeight: 700,
            letterSpacing: '0.16em',
            fontSize: '0.72rem',
            mb: 3,
          }}
        >
          {t('petTypes.heading')}
        </Typography>
        <Stack
          direction="row"
          gap={{ xs: 3, sm: 4, md: 5 }}
          flexWrap="wrap"
          justifyContent="center"
          alignItems="center"
        >
          {petItems.map((pet, idx) => (
            <Stack
              key={idx}
              alignItems="center"
              spacing={0.5}
              sx={{
                transition: 'transform 280ms ease',
                cursor: 'default',
                '&:hover': { transform: 'translateY(-6px) scale(1.1)' },
              }}
            >
              <Box
                sx={{
                  fontSize: { xs: '2.2rem', md: '2.75rem' },
                  lineHeight: 1,
                  filter: isDark ? 'none' : 'drop-shadow(0 2px 6px rgba(0,0,0,0.12))',
                }}
              >
                {PET_EMOJIS[idx]}
              </Box>
              <Typography
                variant="caption"
                sx={{
                  color: 'text.secondary',
                  textTransform: 'none',
                  letterSpacing: 0,
                  fontSize: '0.78rem',
                  fontWeight: 600,
                }}
              >
                {pet.label}
              </Typography>
            </Stack>
          ))}
        </Stack>
        <Box
          sx={{
            mt: 4,
            mx: 'auto',
            maxWidth: 180,
            height: 1,
            background: `linear-gradient(to right, transparent, ${theme.palette.divider}, transparent)`,
          }}
        />
      </Box>
    </Box>
  );
}
