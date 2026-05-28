import { Box, Chip, Stack, Typography, alpha, useTheme } from '@mui/material';
import {
  CheckCircle as CheckIcon,
  Close as CrossIcon,
  DescriptionOutlined as PaperIcon,
  Pets as PawIcon,
} from '@mui/icons-material';

const PAPER_POINTS = [
  'Ľahko sa stratí alebo zničí',
  'Žiadne pripomienky termínov',
  'Musíš ho stále nosiť so sebou',
  'Nečitateľný rukopis veterinára',
  'Žiadna analýza krmiva',
];

const PAWPORT_POINTS = [
  'Vždy v mobile, nikdy sa nestratí',
  'Automatické pripomienky očkovania a odčervenia',
  'AI skenovanie pasu aj analýza krmiva',
  'Prehľadná karta pre veterinára na 1 klik',
  'Funguje offline a úplne zadarmo',
];

export default function ComparisonSection() {
  const theme = useTheme();
  const isDark = theme.palette.mode === 'dark';

  return (
    <Box sx={{ py: { xs: 8, md: 14 } }}>
      <Box sx={{ maxWidth: 1100, mx: 'auto', px: { xs: 2.5, md: 4 } }}>
        <Stack alignItems="center" spacing={2} sx={{ mb: { xs: 5, md: 7 }, textAlign: 'center' }}>
          <Typography
            variant="h2"
            sx={{
              fontSize: { xs: '2rem', md: '3rem' },
              fontWeight: 700,
              letterSpacing: '-0.025em',
              lineHeight: 1.1,
            }}
          >
            Papierový pas verzus Pawport
          </Typography>
          <Typography
            variant="body1"
            sx={{ color: 'text.secondary', maxWidth: 520, fontSize: { xs: '1rem', md: '1.1rem' } }}
          >
            Prečo prejsť z otrhaného papiera na digitálny zdravotný pas.
          </Typography>
        </Stack>

        <Box
          sx={{
            display: 'grid',
            gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' },
            gap: { xs: 2, md: 3 },
            alignItems: 'stretch',
          }}
        >
          {/* Paper card */}
          <Box
            sx={{
              p: { xs: 2.5, md: 3.5 },
              borderRadius: 5,
              border: `1px solid ${theme.palette.divider}`,
              bgcolor: alpha(theme.palette.text.primary, isDark ? 0.03 : 0.02),
              opacity: 0.9,
            }}
          >
            <Stack direction="row" alignItems="center" gap={1.5} sx={{ mb: 2.5 }}>
              <Box
                sx={{
                  width: 44,
                  height: 44,
                  borderRadius: 2.5,
                  bgcolor: alpha(theme.palette.text.secondary, 0.12),
                  color: 'text.secondary',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <PaperIcon />
              </Box>
              <Typography
                variant="h3"
                sx={{ fontSize: '1.3rem', fontWeight: 700, color: 'text.secondary' }}
              >
                Papierový pas
              </Typography>
            </Stack>
            <Stack spacing={1.5}>
              {PAPER_POINTS.map((p) => (
                <Stack key={p} direction="row" alignItems="flex-start" gap={1.25}>
                  <CrossIcon sx={{ fontSize: 20, color: 'error.main', flexShrink: 0, mt: '1px' }} />
                  <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                    {p}
                  </Typography>
                </Stack>
              ))}
            </Stack>
          </Box>

          {/* Pawport card */}
          <Box
            sx={{
              position: 'relative',
              p: { xs: 2.5, md: 3.5 },
              borderRadius: 5,
              border: `1.5px solid ${alpha(theme.palette.primary.main, 0.4)}`,
              bgcolor: alpha(theme.palette.primary.main, isDark ? 0.12 : 0.06),
              boxShadow: `0 16px 40px ${alpha(theme.palette.primary.main, 0.18)}`,
            }}
          >
            <Chip
              label="Odporúčané"
              size="small"
              sx={{
                position: 'absolute',
                top: -12,
                right: 20,
                bgcolor: 'primary.main',
                color: 'primary.contrastText',
                fontWeight: 700,
                fontSize: '0.7rem',
                boxShadow: `0 4px 12px ${alpha(theme.palette.primary.main, 0.4)}`,
              }}
            />
            <Stack direction="row" alignItems="center" gap={1.5} sx={{ mb: 2.5 }}>
              <Box
                sx={{
                  width: 44,
                  height: 44,
                  borderRadius: 2.5,
                  bgcolor: 'primary.main',
                  color: 'primary.contrastText',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  boxShadow: `0 4px 12px ${alpha(theme.palette.primary.main, 0.35)}`,
                }}
              >
                <PawIcon />
              </Box>
              <Typography variant="h3" sx={{ fontSize: '1.3rem', fontWeight: 700 }}>
                Pawport
              </Typography>
            </Stack>
            <Stack spacing={1.5}>
              {PAWPORT_POINTS.map((p) => (
                <Stack key={p} direction="row" alignItems="flex-start" gap={1.25}>
                  <CheckIcon
                    sx={{ fontSize: 20, color: 'success.main', flexShrink: 0, mt: '1px' }}
                  />
                  <Typography variant="body2" sx={{ fontWeight: 500 }}>
                    {p}
                  </Typography>
                </Stack>
              ))}
            </Stack>
          </Box>
        </Box>
      </Box>
    </Box>
  );
}
