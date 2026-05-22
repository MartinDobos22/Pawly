import { Box, Stack, Typography, alpha, useTheme } from '@mui/material';
import {
  Vaccines as VaccinesIcon,
  Science as ScienceIcon,
  Description as VetCardIcon,
  Biotech as DewormIcon,
  HelpOutline as QAIcon,
  MenuBook as DiaryIcon,
  HealthAndSafety as ShieldIcon,
  PestControl as EctoIcon,
} from '@mui/icons-material';

const ACTIVITIES: Array<{
  icon: React.ElementType;
  text: string;
  pet: string;
  ago: string;
  tone: 'primary' | 'success' | 'warning' | 'info' | 'secondary' | 'error';
}> = [
  {
    icon: VaccinesIcon,
    text: 'Pridaná vakcinácia',
    pet: 'Bela · pes',
    ago: 'pred 5 min',
    tone: 'primary',
  },
  {
    icon: ScienceIcon,
    text: 'AI analýza krmiva',
    pet: 'Mio · mačka',
    ago: 'pred 12 min',
    tone: 'info',
  },
  {
    icon: VetCardIcon,
    text: 'Karta veterinára exportovaná',
    pet: 'Coco · králik',
    ago: 'pred 18 min',
    tone: 'secondary',
  },
  {
    icon: DewormIcon,
    text: 'Odčervenie naplánované',
    pet: 'Rex · pes',
    ago: 'pred 24 min',
    tone: 'success',
  },
  {
    icon: QAIcon,
    text: 'Otázka: môže ryba jesť…',
    pet: 'Bubbles · ryba',
    ago: 'pred 31 min',
    tone: 'warning',
  },
  {
    icon: DiaryIcon,
    text: 'Nová epizóda v denníku',
    pet: 'Felix · mačka',
    ago: 'pred 42 min',
    tone: 'error',
  },
  {
    icon: ShieldIcon,
    text: 'Zdravotný pas aktualizovaný',
    pet: 'Lucky · pes',
    ago: 'pred 55 min',
    tone: 'primary',
  },
  {
    icon: EctoIcon,
    text: 'Antiparazitiká aplikované',
    pet: 'Daisy · pes',
    ago: 'pred 1 h',
    tone: 'warning',
  },
  {
    icon: VaccinesIcon,
    text: 'Pridaná vakcinácia',
    pet: 'Tiki · papagáj',
    ago: 'pred 1 h',
    tone: 'primary',
  },
  {
    icon: ScienceIcon,
    text: 'AI analýza krmiva',
    pet: 'Charlie · pes',
    ago: 'pred 2 h',
    tone: 'info',
  },
];

export default function ActivityMarquee() {
  const theme = useTheme();
  const items = [...ACTIVITIES, ...ACTIVITIES];

  return (
    <Box
      sx={{
        py: { xs: 4, md: 5 },
        overflow: 'hidden',
        position: 'relative',
        maskImage:
          'linear-gradient(to right, transparent 0, black 80px, black calc(100% - 80px), transparent 100%)',
        WebkitMaskImage:
          'linear-gradient(to right, transparent 0, black 80px, black calc(100% - 80px), transparent 100%)',
      }}
    >
      <Typography
        variant="caption"
        sx={{
          display: 'block',
          color: 'text.disabled',
          fontWeight: 700,
          letterSpacing: '0.16em',
          fontSize: '0.72rem',
          textAlign: 'center',
          mb: 2,
        }}
      >
        ŽIVÁ ČINNOSŤ V APLIKÁCII
      </Typography>
      <Box
        sx={{
          display: 'flex',
          gap: 1.25,
          width: 'max-content',
          animation: 'pawport-marquee 38s linear infinite',
          '@keyframes pawport-marquee': {
            from: { transform: 'translateX(0)' },
            to: { transform: 'translateX(-50%)' },
          },
        }}
      >
        {items.map((it, idx) => {
          const Icon = it.icon;
          const color = theme.palette[it.tone].main;
          return (
            <Stack
              key={idx}
              direction="row"
              alignItems="center"
              gap={1}
              sx={{
                px: 2,
                py: 1.25,
                borderRadius: 999,
                bgcolor: alpha(theme.palette.background.paper, 0.7),
                backdropFilter: 'blur(8px)',
                WebkitBackdropFilter: 'blur(8px)',
                border: `1px solid ${theme.palette.divider}`,
                whiteSpace: 'nowrap',
                flexShrink: 0,
              }}
            >
              <Box
                sx={{
                  width: 24,
                  height: 24,
                  borderRadius: '50%',
                  bgcolor: alpha(color, 0.16),
                  color,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0,
                }}
              >
                <Icon sx={{ fontSize: 14 }} />
              </Box>
              <Typography variant="body2" sx={{ fontWeight: 600, fontSize: '0.85rem' }}>
                {it.text}
              </Typography>
              <Typography
                variant="caption"
                sx={{
                  color: 'text.secondary',
                  textTransform: 'none',
                  letterSpacing: 0,
                  fontSize: '0.78rem',
                }}
              >
                · {it.pet}
              </Typography>
              <Typography
                variant="caption"
                sx={{
                  color: 'text.disabled',
                  textTransform: 'none',
                  letterSpacing: 0,
                  fontSize: '0.75rem',
                }}
              >
                · {it.ago}
              </Typography>
            </Stack>
          );
        })}
      </Box>
    </Box>
  );
}
