import { Box, Card, CardContent, Stack, Typography, alpha, useTheme } from '@mui/material';
import {
  Pets as PetsIcon,
  Science as ScienceIcon,
  HealthAndSafety as HealthAndSafetyIcon,
  MenuBook as MenuBookIcon,
  Description as DescriptionIcon,
  Lock as LockIcon,
  Favorite as FavoriteIcon,
} from '@mui/icons-material';

interface Feature {
  icon: typeof ScienceIcon;
  title: string;
  description: string;
}

const FEATURES: Feature[] = [
  {
    icon: ScienceIcon,
    title: 'AI analýza krmiva',
    description: 'Odpíš alebo odfoť zloženie a o pár sekúnd vieš, čo tvoje zviera dostáva.',
  },
  {
    icon: HealthAndSafetyIcon,
    title: 'Digitálny zdravotný pas',
    description: 'Vakcinácie, odčervenie, lieky aj návštevy veterinára prehľadne na jednom mieste.',
  },
  {
    icon: MenuBookIcon,
    title: 'Denník epizód',
    description: 'Zapisuj zdravotné príhody a sleduj, čo zaberá a čo nie.',
  },
  {
    icon: DescriptionIcon,
    title: 'Karta pre veterinára',
    description: 'Úhľadný súhrn, ktorý vieš ukázať alebo vytlačiť pri návšteve.',
  },
  {
    icon: PetsIcon,
    title: 'Profily zvierat',
    description: 'Psy, mačky aj ďalšie domáce zvieratá — každé so svojím profilom a alergiami.',
  },
];

export default function AboutPage() {
  const theme = useTheme();
  const isDark = theme.palette.mode === 'dark';

  return (
    <Box sx={{ maxWidth: 760, mx: 'auto' }}>
      <Typography variant="h4" sx={{ fontWeight: 700, mb: 0.5 }}>
        O aplikácii
      </Typography>
      <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
        Malý pomocník pre veľkú lásku k tvojim zvieratkám.
      </Typography>

      <Card sx={{ mb: 2.5 }}>
        <CardContent sx={{ p: { xs: 2.5, md: 3 } }}>
          <Stack direction="row" alignItems="center" gap={1.5} sx={{ mb: 2 }}>
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
                boxShadow: isDark
                  ? `0 0 14px ${alpha(theme.palette.primary.main, 0.4)}`
                  : `0 4px 10px ${alpha(theme.palette.primary.main, 0.2)}`,
              }}
            >
              <PetsIcon />
            </Box>
            <Box>
              <Typography variant="h5" sx={{ fontWeight: 800, letterSpacing: '-0.015em' }}>
                Pawport
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Všetko o zdraví tvojho zvieraťa na jednom mieste.
              </Typography>
            </Box>
          </Stack>
          <Typography variant="body1" sx={{ lineHeight: 1.7, color: 'text.secondary' }}>
            Pawport spája digitálny zdravotný pas a inteligentnú analýzu krmiva pre psy, mačky a
            ďalšie domáce zvieratá. Pomáha ti mať poriadok v očkovaniach, liekoch aj návštevách
            veterinára — a rozhodovať sa o krmive s istotou. Aby si sa mohol naplno venovať tomu
            najdôležitejšiemu: svojmu zvieratku.
          </Typography>
        </CardContent>
      </Card>

      <Card sx={{ mb: 2.5 }}>
        <CardContent sx={{ p: { xs: 2.5, md: 3 } }}>
          <Typography variant="h6" sx={{ fontWeight: 700, mb: 2 }}>
            Čo Pawport vie
          </Typography>
          <Stack spacing={2.25}>
            {FEATURES.map(({ icon: Icon, title, description }) => (
              <Stack key={title} direction="row" gap={1.75} alignItems="flex-start">
                <Box
                  sx={{
                    width: 40,
                    height: 40,
                    borderRadius: 2,
                    flexShrink: 0,
                    bgcolor: alpha(theme.palette.primary.main, isDark ? 0.18 : 0.1),
                    color: 'primary.main',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <Icon fontSize="small" />
                </Box>
                <Box>
                  <Typography variant="subtitle1" sx={{ fontWeight: 600, lineHeight: 1.3 }}>
                    {title}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {description}
                  </Typography>
                </Box>
              </Stack>
            ))}
          </Stack>
        </CardContent>
      </Card>

      <Card sx={{ mb: 3 }}>
        <CardContent sx={{ p: { xs: 2.5, md: 3 } }}>
          <Stack direction="row" gap={1.75} alignItems="flex-start">
            <Box
              sx={{
                width: 40,
                height: 40,
                borderRadius: 2,
                flexShrink: 0,
                bgcolor: alpha(theme.palette.success.main, isDark ? 0.18 : 0.12),
                color: 'success.main',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <LockIcon fontSize="small" />
            </Box>
            <Box>
              <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 0.25 }}>
                Tvoje dáta sú v bezpečí
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Prístup je chránený prihlásením a všetky záznamy o tvojich zvieratách sú súkromné —
                vidíš ich len ty.
              </Typography>
            </Box>
          </Stack>
        </CardContent>
      </Card>

      <Stack direction="row" alignItems="center" justifyContent="center" gap={0.75} sx={{ mb: 2 }}>
        <Typography variant="body2" color="text.secondary">
          Vytvorené s láskou pre zvieratá
        </Typography>
        <FavoriteIcon sx={{ fontSize: 16, color: 'error.main' }} />
      </Stack>
    </Box>
  );
}
