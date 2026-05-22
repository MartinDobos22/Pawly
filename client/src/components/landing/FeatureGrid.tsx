import { Box, Stack, Typography, alpha, useTheme } from '@mui/material';
import {
  HealthAndSafety as ShieldIcon,
  Science as ScienceIcon,
  NotificationsActive as NotificationIcon,
  Description as VetCardIcon,
  HelpOutline as QAIcon,
  MenuBook as DiaryIcon,
} from '@mui/icons-material';

const FEATURES: Array<{
  icon: React.ElementType;
  title: string;
  text: string;
  tone: 'primary' | 'success' | 'warning' | 'info' | 'secondary' | 'error';
}> = [
  {
    icon: ShieldIcon,
    title: 'Zdravotný pas',
    text: 'Vakcinácie, odčervenia, ektoparazity a chronické diagnózy v jednom prehľadnom timeline.',
    tone: 'primary',
  },
  {
    icon: ScienceIcon,
    title: 'AI analýza krmiva',
    text: 'Vlož zloženie alebo vyfoť obal — AI vyhodnotí kvalitu a alergény pre tvoje konkrétne zviera.',
    tone: 'info',
  },
  {
    icon: NotificationIcon,
    title: 'Pripomienky',
    text: 'Karta vždy ukazuje čo treba: odčervenie po termíne, blížiace sa očkovanie, kontrola.',
    tone: 'warning',
  },
  {
    icon: VetCardIcon,
    title: 'Karta pre veterinára',
    text: 'Profesionálny PDF dokument so všetkým — identitou, diagnózami, vakcináciami, históriou.',
    tone: 'secondary',
  },
  {
    icon: QAIcon,
    title: 'Môže môj miláčik jesť…?',
    text: 'Rýchla AI otázka pre jednu potravinu. Čokoláda? Jablko? Dostaneš zrozumiteľnú odpoveď.',
    tone: 'success',
  },
  {
    icon: DiaryIcon,
    title: 'Denník epizód',
    text: 'Zaznamenaj zdravotné epizódy a podľa minulosti vidíš čo zabralo a čo nie.',
    tone: 'error',
  },
];

export default function FeatureGrid() {
  const theme = useTheme();

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
            Všetko pre zdravie tvojho miláčika{' '}
            <Box
              component="span"
              sx={{
                background: `linear-gradient(135deg, ${theme.palette.primary.main}, ${theme.palette.primary.light})`,
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                backgroundClip: 'text',
              }}
            >
              na jednom mieste
            </Box>
          </Typography>
          <Typography
            variant="body1"
            sx={{ color: 'text.secondary', maxWidth: 520, fontSize: { xs: '1rem', md: '1.1rem' } }}
          >
            Šesť funkcií, ktoré spolu pokrývajú celý zdravotný život tvojho zvieratka.
          </Typography>
        </Stack>

        <Box
          sx={{
            display: 'grid',
            gridTemplateColumns: {
              xs: '1fr',
              sm: 'repeat(2, 1fr)',
              md: 'repeat(3, 1fr)',
            },
            gap: { xs: 2, md: 2.5 },
          }}
        >
          {FEATURES.map((feature) => {
            const Icon = feature.icon;
            const color =
              theme.palette[
                feature.tone as 'primary' | 'success' | 'warning' | 'info' | 'secondary' | 'error'
              ].main;
            return (
              <Box
                key={feature.title}
                sx={{
                  p: { xs: 2.5, md: 3 },
                  borderRadius: 4,
                  border: `1px solid ${theme.palette.divider}`,
                  borderLeft: `3px solid ${alpha(color, 0.5)}`,
                  bgcolor: alpha(theme.palette.background.paper, 0.6),
                  backdropFilter: 'blur(8px)',
                  WebkitBackdropFilter: 'blur(8px)',
                  transition:
                    'transform 220ms ease, border-color 220ms ease, box-shadow 220ms ease',
                  '&:hover': {
                    transform: 'translateY(-6px)',
                    borderColor: alpha(color, 0.5),
                    borderLeftColor: color,
                    boxShadow: `0 14px 30px ${alpha(color, 0.18)}`,
                  },
                }}
              >
                <Box
                  sx={{
                    width: 48,
                    height: 48,
                    borderRadius: 2,
                    bgcolor: alpha(color, 0.12),
                    color,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    mb: 1.5,
                  }}
                >
                  <Icon sx={{ fontSize: 24 }} />
                </Box>
                <Typography variant="h3" sx={{ fontSize: '1.1rem', fontWeight: 700, mb: 0.5 }}>
                  {feature.title}
                </Typography>
                <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                  {feature.text}
                </Typography>
              </Box>
            );
          })}
        </Box>
      </Box>
    </Box>
  );
}
