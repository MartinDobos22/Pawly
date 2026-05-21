import { Box, Card, Chip, Stack, Typography, alpha, useTheme } from '@mui/material';
import {
  HealthAndSafety as HealthIcon,
  Coronavirus as AllergyIcon,
  NoFood as IntoleranceIcon,
  WarningAmber as ChronicIcon,
} from '@mui/icons-material';
import type { PetProfile } from '../../types';

interface Props {
  dog: PetProfile;
}

interface SubsectionProps {
  label: string;
  icon: React.ReactElement;
  items: string[];
  tone: 'primary' | 'error' | 'warning';
}

function Subsection({ label, icon, items, tone }: SubsectionProps) {
  const theme = useTheme();
  if (items.length === 0) return null;

  const toneColor =
    tone === 'primary'
      ? theme.palette.primary.main
      : tone === 'error'
        ? theme.palette.error.main
        : theme.palette.warning.main;

  return (
    <Box sx={{ flex: 1, minWidth: 200 }}>
      <Stack direction="row" alignItems="center" gap={0.75} sx={{ mb: 0.75 }}>
        <Box
          sx={{
            width: 22,
            height: 22,
            borderRadius: 1,
            bgcolor: alpha(toneColor, 0.14),
            color: toneColor,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            '& svg': { fontSize: 14 },
          }}
        >
          {icon}
        </Box>
        <Typography
          variant="caption"
          sx={{ color: 'text.secondary', fontSize: '0.7rem', letterSpacing: '0.08em' }}
        >
          {label}
        </Typography>
      </Stack>
      <Stack direction="row" flexWrap="wrap" gap={0.5}>
        {items.map((item) => (
          <Chip
            key={item}
            label={item}
            size="small"
            variant="outlined"
            sx={{
              borderColor: alpha(toneColor, 0.35),
              color: toneColor,
              fontWeight: 600,
              fontSize: '0.75rem',
            }}
          />
        ))}
      </Stack>
    </Box>
  );
}

export default function HealthProfileChips({ dog }: Props) {
  const theme = useTheme();
  const chronic = dog.chronicConditions?.map((c) => c.title) ?? dog.healthConditions;
  const hasContent =
    chronic.length > 0 ||
    dog.allergies.length > 0 ||
    dog.intolerances.length > 0 ||
    Boolean(dog.notes);

  if (!hasContent) {
    return (
      <Card variant="outlined" sx={{ p: 1.5 }}>
        <Stack direction="row" alignItems="center" gap={1}>
          <HealthIcon sx={{ fontSize: 18, color: 'text.secondary' }} />
          <Typography variant="caption" sx={{ color: 'text.secondary' }}>
            Zdravotný profil
          </Typography>
          <Box sx={{ flex: 1 }} />
          <Typography
            variant="body2"
            sx={{
              color: 'text.secondary',
              fontStyle: 'italic',
              textTransform: 'none',
              letterSpacing: 0,
            }}
          >
            Žiadne špeciálne zdravotné záznamy
          </Typography>
        </Stack>
      </Card>
    );
  }

  return (
    <Card variant="outlined" sx={{ p: { xs: 1.75, md: 2 } }}>
      <Stack direction="row" alignItems="center" gap={1} sx={{ mb: 1.5 }}>
        <HealthIcon sx={{ fontSize: 18, color: 'text.secondary' }} />
        <Typography variant="caption" sx={{ color: 'text.secondary' }}>
          Zdravotný profil
        </Typography>
      </Stack>
      <Stack direction={{ xs: 'column', md: 'row' }} gap={2} flexWrap="wrap">
        <Subsection
          label="Chronické diagnózy"
          icon={<ChronicIcon />}
          items={chronic}
          tone="primary"
        />
        <Subsection label="Alergie" icon={<AllergyIcon />} items={dog.allergies} tone="error" />
        <Subsection
          label="Intolerancie"
          icon={<IntoleranceIcon />}
          items={dog.intolerances}
          tone="warning"
        />
      </Stack>
      {dog.notes && (
        <Box sx={{ mt: 1.5, pt: 1.25, borderTop: `1px solid ${theme.palette.divider}` }}>
          <Typography variant="caption" sx={{ color: 'text.secondary', display: 'block', mb: 0.5 }}>
            Poznámky
          </Typography>
          <Typography
            variant="body2"
            sx={{ color: 'text.secondary', textTransform: 'none', letterSpacing: 0 }}
          >
            {dog.notes}
          </Typography>
        </Box>
      )}
    </Card>
  );
}
