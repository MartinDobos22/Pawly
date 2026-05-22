import { Box, Chip, LinearProgress, Stack, Typography, alpha, useTheme } from '@mui/material';
import {
  Biotech as DewormIcon,
  CheckCircle as CheckIcon,
  ErrorOutline as ErrorIcon,
  Vaccines as VaccinesIcon,
} from '@mui/icons-material';
import HealthScoreRing from '../healthPassport/HealthScoreRing';

export default function AppPreview() {
  const theme = useTheme();

  return (
    <Box
      sx={{
        py: { xs: 6, md: 10 },
        bgcolor: 'background.paper',
        borderTop: `1px solid ${theme.palette.divider}`,
        borderBottom: `1px solid ${theme.palette.divider}`,
      }}
    >
      <Box sx={{ maxWidth: 1200, mx: 'auto', px: { xs: 2.5, md: 4 } }}>
        <Stack alignItems="center" spacing={1.5} sx={{ mb: { xs: 4, md: 6 }, textAlign: 'center' }}>
          <Typography
            variant="caption"
            sx={{ color: 'primary.main', fontWeight: 700, letterSpacing: '0.12em' }}
          >
            Náhľad aplikácie
          </Typography>
          <Typography
            variant="h2"
            sx={{
              fontSize: { xs: '1.75rem', md: '2.5rem' },
              fontWeight: 700,
              letterSpacing: '-0.02em',
              maxWidth: 640,
            }}
          >
            Takto vyzerá tvoj zdravotný pas
          </Typography>
        </Stack>

        <Box
          sx={{
            display: 'grid',
            gridTemplateColumns: { xs: '1fr', md: 'repeat(3, 1fr)' },
            gap: 2.5,
            alignItems: 'stretch',
          }}
        >
          {/* Card 1: Health score */}
          <Box
            sx={{
              p: 3,
              borderRadius: 4,
              border: `1px solid ${theme.palette.divider}`,
              bgcolor: 'background.default',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              textAlign: 'center',
              gap: 1.5,
            }}
          >
            <Typography
              variant="caption"
              sx={{ color: 'text.secondary', fontSize: '0.7rem', letterSpacing: '0.08em' }}
            >
              Celkový zdravotný stav
            </Typography>
            <HealthScoreRing
              score={82}
              size={120}
              breakdown={[
                { label: 'Očkovanie', shortLabel: 'Očk.', status: 'good' },
                { label: 'Odčervenie', shortLabel: 'Odč.', status: 'good' },
                { label: 'Kliešte', shortLabel: 'Kliešte', status: 'soon' },
                { label: 'Diéta', shortLabel: 'Diéta', status: 'good' },
              ]}
            />
            <Typography variant="body2" sx={{ color: 'text.secondary', mt: 1 }}>
              Skóre vychádza zo 4 oblastí preventívnej starostlivosti.
            </Typography>
          </Box>

          {/* Card 2: Metric card preview */}
          <Box
            sx={{
              p: 3,
              borderRadius: 4,
              border: `1px solid ${theme.palette.divider}`,
              bgcolor: 'background.default',
              display: 'flex',
              flexDirection: 'column',
              gap: 1.5,
            }}
          >
            <Stack direction="row" alignItems="center" justifyContent="space-between">
              <Stack direction="row" alignItems="center" gap={1}>
                <Box
                  sx={{
                    width: 32,
                    height: 32,
                    borderRadius: 1.5,
                    bgcolor: alpha(theme.palette.success.main, 0.16),
                    color: 'success.main',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <DewormIcon sx={{ fontSize: 18 }} />
                </Box>
                <Typography
                  variant="caption"
                  sx={{ color: 'text.secondary', fontSize: '0.7rem', letterSpacing: '0.08em' }}
                >
                  Odčervenie
                </Typography>
              </Stack>
              <CheckIcon sx={{ fontSize: 18, color: 'success.main' }} />
            </Stack>
            <Typography variant="h3" sx={{ fontSize: '1.4rem', fontWeight: 700 }}>
              O 5 týždňov
            </Typography>
            <Typography variant="body2" sx={{ color: 'text.secondary' }}>
              Posledné 26. 3. · simparica
            </Typography>
            <Box sx={{ mt: 'auto' }}>
              <LinearProgress
                variant="determinate"
                value={70}
                sx={{
                  height: 6,
                  borderRadius: 3,
                  bgcolor: alpha(theme.palette.success.main, 0.12),
                  '& .MuiLinearProgress-bar': {
                    bgcolor: 'success.main',
                    borderRadius: 3,
                  },
                }}
              />
            </Box>
          </Box>

          {/* Card 3: Upcoming task overdue */}
          <Box
            sx={{
              p: 3,
              borderRadius: 4,
              border: `1px solid ${theme.palette.divider}`,
              bgcolor: 'background.default',
              display: 'flex',
              flexDirection: 'column',
              gap: 1.25,
            }}
          >
            <Stack direction="row" alignItems="center" gap={1}>
              <Box
                sx={{
                  width: 32,
                  height: 32,
                  borderRadius: 1.5,
                  bgcolor: alpha(theme.palette.error.main, 0.16),
                  color: 'error.main',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <VaccinesIcon sx={{ fontSize: 18 }} />
              </Box>
              <Typography
                variant="caption"
                sx={{ color: 'error.main', fontSize: '0.7rem', letterSpacing: '0.08em', fontWeight: 700 }}
              >
                Po termíne · 1
              </Typography>
            </Stack>
            <Stack direction="row" alignItems="center" gap={1}>
              <ErrorIcon sx={{ fontSize: 18, color: 'error.main' }} />
              <Typography variant="h3" sx={{ fontSize: '1.15rem', fontWeight: 700, color: 'error.main' }}>
                Po termíne 26 dní
              </Typography>
            </Stack>
            <Typography variant="body2" sx={{ color: 'text.secondary' }}>
              Antiparazitikum simparica · plánovaný 25. 4.
            </Typography>
            <Chip
              label="Obnoviť teraz"
              size="small"
              sx={{
                alignSelf: 'flex-start',
                mt: 0.5,
                bgcolor: alpha(theme.palette.error.main, 0.1),
                color: 'error.main',
                border: `1px solid ${alpha(theme.palette.error.main, 0.3)}`,
                fontWeight: 600,
              }}
            />
          </Box>
        </Box>
      </Box>
    </Box>
  );
}
