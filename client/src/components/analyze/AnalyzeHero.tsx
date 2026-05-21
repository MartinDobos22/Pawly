import { Avatar, Box, Chip, Stack, Typography, alpha, useTheme } from '@mui/material';
import { Pets as PetsIcon, Science as ScienceIcon } from '@mui/icons-material';
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
          <ScienceIcon />
        </Box>
        <Box sx={{ flex: 1, minWidth: 0 }}>
          <Typography
            variant="h1"
            sx={{
              fontSize: { xs: '1.6rem', md: '1.85rem' },
              fontWeight: 700,
              lineHeight: 1.15,
              letterSpacing: '-0.02em',
            }}
          >
            Analýza krmiva
          </Typography>
          <Typography variant="body2" sx={{ color: 'text.secondary', mt: 0.5, maxWidth: 600 }}>
            Vlož zloženie krmiva alebo vyfoť obal — AI vyhodnotí kvalitu, riziká alergénov a
            odporúčanie pre psa. Alebo sa rýchlo opýtaj „Môže pes jesť…?"
          </Typography>
        </Box>
        {activePet && (
          <Chip
            avatar={
              <Avatar src={activePet.photoUrl || undefined} sx={{ bgcolor: 'primary.light' }}>
                {initialsOf(activePet.name) || <PetsIcon fontSize="small" />}
              </Avatar>
            }
            label={`Pre ${activePet.name}`}
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
