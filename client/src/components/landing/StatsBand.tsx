import { Box, Stack, Typography, useTheme } from '@mui/material';
import AnimatedCounter from './AnimatedCounter';

const STATS = [
  { target: 3200, suffix: '+', label: 'záznamov v zdrav. pasoch' },
  { target: 850, suffix: '+', label: 'aplikovaných vakcinácií' },
  { target: 120, suffix: '+', label: 'druhov zvierat' },
  { target: 100, suffix: ' %', label: 'zadarmo, bez registrácie' },
];

export default function StatsBand() {
  const theme = useTheme();

  return (
    <Box sx={{ py: { xs: 5, md: 7 } }}>
      <Box sx={{ maxWidth: 1100, mx: 'auto', px: { xs: 2.5, md: 4 } }}>
        <Box
          sx={{
            display: 'grid',
            gridTemplateColumns: { xs: 'repeat(2, 1fr)', md: 'repeat(4, 1fr)' },
            gap: { xs: 2, md: 4 },
            textAlign: 'center',
          }}
        >
          {STATS.map((s) => (
            <Stack key={s.label} alignItems="center" spacing={0.5}>
              <AnimatedCounter
                target={s.target}
                suffix={s.suffix}
                sx={{
                  fontSize: { xs: '2.25rem', md: '3rem' },
                  fontWeight: 800,
                  lineHeight: 1,
                  letterSpacing: '-0.02em',
                  background: `linear-gradient(135deg, ${theme.palette.primary.main}, ${theme.palette.primary.light})`,
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  backgroundClip: 'text',
                }}
              />
              <Typography
                variant="caption"
                sx={{
                  color: 'text.secondary',
                  textTransform: 'none',
                  letterSpacing: 0,
                  fontSize: { xs: '0.78rem', md: '0.85rem' },
                  fontWeight: 500,
                  maxWidth: 180,
                }}
              >
                {s.label}
              </Typography>
            </Stack>
          ))}
        </Box>
      </Box>
    </Box>
  );
}
