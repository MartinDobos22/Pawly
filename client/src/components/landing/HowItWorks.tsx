import { Box, Stack, Typography, alpha, useTheme } from '@mui/material';
import {
  AddCircleOutline as ProfileIcon,
  AutoAwesome as AiScanIcon,
  Description as VetCardIcon,
} from '@mui/icons-material';

const STEPS = [
  {
    icon: ProfileIcon,
    title: 'Vytvor profil zvieraťa',
    text: 'Pridaj meno, plemeno, vek, váhu, alergie a zdravotné stavy. Trvá to 60 sekúnd.',
  },
  {
    icon: AiScanIcon,
    title: 'Naskenuj zdravotný pas',
    text: 'AI extrahuje očkovania, odčervenia a ďalšie záznamy z fotky pasu alebo PDF.',
  },
  {
    icon: VetCardIcon,
    title: 'Karta pre veterinára',
    text: 'Pri každej návšteve veterinára exportuj prehľadnú PDF kartu so všetkým podstatným.',
  },
];

export default function HowItWorks() {
  const theme = useTheme();

  return (
    <Box id="how-it-works" sx={{ py: { xs: 8, md: 14 } }}>
      <Box sx={{ maxWidth: 1200, mx: 'auto', px: { xs: 2.5, md: 4 } }}>
        <Stack alignItems="center" spacing={2} sx={{ mb: { xs: 6, md: 8 }, textAlign: 'center' }}>
          <Typography
            variant="h2"
            sx={{
              fontSize: { xs: '2rem', md: '3rem' },
              fontWeight: 700,
              letterSpacing: '-0.025em',
              lineHeight: 1.1,
              maxWidth: 720,
            }}
          >
            3 kroky a máš zdravotný pas v mobile
          </Typography>
          <Typography
            variant="body1"
            sx={{ color: 'text.secondary', maxWidth: 520, fontSize: { xs: '1rem', md: '1.1rem' } }}
          >
            Žiadne komplikované formuláre, žiadne mesačné poplatky. Začni za pár minút.
          </Typography>
        </Stack>

        <Box
          sx={{
            display: 'grid',
            gridTemplateColumns: { xs: '1fr', md: 'repeat(3, 1fr)' },
            gap: { xs: 2, md: 3 },
          }}
        >
          {STEPS.map((step, idx) => {
            const Icon = step.icon;
            return (
              <Box
                key={step.title}
                sx={{
                  position: 'relative',
                  p: { xs: 2.5, md: 3 },
                  borderRadius: 4,
                  border: `1px solid ${theme.palette.divider}`,
                  bgcolor: alpha(theme.palette.background.paper, 0.5),
                  backdropFilter: 'blur(8px)',
                  WebkitBackdropFilter: 'blur(8px)',
                  transition: 'transform 220ms ease, box-shadow 220ms ease',
                  '&:hover': {
                    transform: 'translateY(-4px)',
                    boxShadow: '0 12px 32px rgba(15,76,92,0.10)',
                  },
                }}
              >
                <Stack
                  sx={{
                    position: 'absolute',
                    top: -16,
                    left: 24,
                    width: 32,
                    height: 32,
                    borderRadius: '50%',
                    bgcolor: 'primary.main',
                    color: 'primary.contrastText',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontWeight: 700,
                    fontSize: '0.85rem',
                    boxShadow: `0 4px 12px ${alpha(theme.palette.primary.main, 0.4)}`,
                  }}
                >
                  {idx + 1}
                </Stack>
                <Box
                  sx={{
                    width: 56,
                    height: 56,
                    borderRadius: 3,
                    bgcolor: alpha(theme.palette.primary.main, 0.1),
                    color: 'primary.main',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    mb: 2,
                  }}
                >
                  <Icon sx={{ fontSize: 28 }} />
                </Box>
                <Typography variant="h3" sx={{ fontSize: '1.25rem', fontWeight: 700, mb: 1 }}>
                  {step.title}
                </Typography>
                <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                  {step.text}
                </Typography>
              </Box>
            );
          })}
        </Box>
      </Box>
    </Box>
  );
}
