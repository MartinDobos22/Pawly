import { Box, Stack, Typography, alpha, useTheme } from '@mui/material';

const PET_TYPES = [
  { emoji: '🐕', label: 'Psy' },
  { emoji: '🐈', label: 'Mačky' },
  { emoji: '🐇', label: 'Králiky' },
  { emoji: '🐹', label: 'Hlodavce' },
  { emoji: '🦜', label: 'Vtáci' },
  { emoji: '🐢', label: 'Plazy' },
  { emoji: '🐠', label: 'Ryby' },
  { emoji: '🐎', label: 'Kone' },
];

export default function PetTypesStrip() {
  const theme = useTheme();
  const isDark = theme.palette.mode === 'dark';

  return (
    <Box
      sx={{
        py: { xs: 4, md: 5 },
        bgcolor: isDark
          ? alpha(theme.palette.primary.main, 0.06)
          : alpha(theme.palette.secondary.main, 0.06),
        borderTop: `1px solid ${theme.palette.divider}`,
        borderBottom: `1px solid ${theme.palette.divider}`,
      }}
    >
      <Box sx={{ maxWidth: 1200, mx: 'auto', px: { xs: 2.5, md: 4 } }}>
        <Stack alignItems="center" spacing={1.5}>
          <Typography
            variant="caption"
            sx={{
              color: 'text.secondary',
              fontWeight: 700,
              letterSpacing: '0.12em',
              textAlign: 'center',
            }}
          >
            Pawport podporuje všetky druhy domácich zvierat
          </Typography>
          <Stack
            direction="row"
            gap={{ xs: 2, sm: 3, md: 4 }}
            flexWrap="wrap"
            justifyContent="center"
            sx={{ pt: 1 }}
          >
            {PET_TYPES.map((pet) => (
              <Stack
                key={pet.label}
                alignItems="center"
                spacing={0.5}
                sx={{
                  transition: 'transform 220ms ease',
                  cursor: 'default',
                  '&:hover': { transform: 'translateY(-4px) scale(1.08)' },
                }}
              >
                <Box
                  sx={{
                    fontSize: { xs: '2rem', md: '2.5rem' },
                    lineHeight: 1,
                    filter: isDark ? 'none' : 'drop-shadow(0 2px 4px rgba(0,0,0,0.1))',
                  }}
                >
                  {pet.emoji}
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
        </Stack>
      </Box>
    </Box>
  );
}
