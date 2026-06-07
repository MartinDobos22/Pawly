import { Avatar, Box, Chip, Stack, Typography, alpha, useTheme } from '@mui/material';
import { Pets as PetsIcon, Science as ScienceIcon } from '@mui/icons-material';
import { useTranslation } from 'react-i18next';
import { useActivePet } from '../../hooks/useActivePet';

const initialsOf = (name: string) =>
  name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((p) => p[0]?.toUpperCase() ?? '')
    .join('');

export default function AnalyzeHero() {
  const theme = useTheme();
  const { t } = useTranslation('analyze');
  const { activePet } = useActivePet();

  return (
    <Box
      sx={{
        mb: 2.5,
        position: 'relative',
        overflow: 'hidden',
        borderRadius: 4,
        bgcolor: alpha(theme.palette.primary.main, theme.palette.mode === 'light' ? 0.05 : 0.1),
        border: `1px solid ${alpha(theme.palette.primary.main, 0.12)}`,
        p: { xs: 2, md: 2.5 },
      }}
    >
      <Stack
        direction={{ xs: 'column', sm: 'row' }}
        alignItems={{ xs: 'flex-start', sm: 'center' }}
        gap={2}
      >
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
            boxShadow: '0 4px 10px rgba(15,76,92,0.18)',
            flexShrink: 0,
          }}
        >
          <ScienceIcon fontSize="large" />
        </Box>
        <Box sx={{ flex: 1, minWidth: 0 }}>
          <Typography
            variant="h1"
            sx={{
              fontSize: { xs: '1.5rem', md: '2rem' },
              fontWeight: 700,
              lineHeight: 1.15,
              letterSpacing: '-0.02em',
            }}
          >
            {t('hero.title')}
          </Typography>
          <Typography variant="body2" sx={{ color: 'text.secondary', mt: 0.5, maxWidth: 600 }}>
            {t('hero.description')}
          </Typography>
        </Box>
        {activePet && (
          <Chip
            avatar={
              <Avatar src={activePet.photoUrl || undefined} sx={{ bgcolor: 'primary.light' }}>
                {initialsOf(activePet.name) || <PetsIcon fontSize="small" />}
              </Avatar>
            }
            label={t('hero.forPet', { petName: activePet.name })}
            variant="outlined"
            sx={{
              fontWeight: 600,
              borderColor: alpha(theme.palette.primary.main, 0.25),
              bgcolor: 'background.paper',
            }}
          />
        )}
      </Stack>
    </Box>
  );
}
