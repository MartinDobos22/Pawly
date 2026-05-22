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
    text: 'Vlož zloženie alebo vyfoť obal — AI vyhodnotí kvalitu a alergény pre konkrétneho psa.',
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
    title: 'Môže pes jesť…?',
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
    <Box sx={{ py: { xs: 6, md: 10 } }}>
      <Box sx={{ maxWidth: 1200, mx: 'auto', px: { xs: 2.5, md: 4 } }}>
        <Stack alignItems="center" spacing={1.5} sx={{ mb: { xs: 4, md: 6 }, textAlign: 'center' }}>
          <Typography
            variant="caption"
            sx={{ color: 'primary.main', fontWeight: 700, letterSpacing: '0.12em' }}
          >
            Funkcie
          </Typography>
          <Typography
            variant="h2"
            sx={{
              fontSize: { xs: '1.75rem', md: '2.5rem' },
              fontWeight: 700,
              letterSpacing: '-0.02em',
              maxWidth: 720,
            }}
          >
            Všetko pre zdravie psa na jednom mieste
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
              theme.palette[feature.tone as 'primary' | 'success' | 'warning' | 'info' | 'secondary' | 'error']
                .main;
            return (
              <Box
                key={feature.title}
                sx={{
                  p: { xs: 2.5, md: 3 },
                  borderRadius: 4,
                  border: `1px solid ${theme.palette.divider}`,
                  bgcolor: 'background.paper',
                  transition: 'transform 220ms ease, border-color 220ms ease',
                  '&:hover': {
                    transform: 'translateY(-4px)',
                    borderColor: alpha(color, 0.4),
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
