import { useTranslation } from 'react-i18next';
import {
  Avatar,
  Box,
  FormControl,
  MenuItem,
  Select,
  Stack,
  Typography,
  alpha,
  useTheme,
} from '@mui/material';
import {
  CalendarMonth as CalendarIcon,
  Memory as ChipIcon,
  Pets as PetsIcon,
  QrCode2 as PassportIcon,
  WatchLater as WeightIcon,
} from '@mui/icons-material';
import type { PetProfile } from '../../types';

const initialsOf = (name: string) =>
  name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((p) => p[0]?.toUpperCase() ?? '')
    .join('');

const ageInYears = (dog: PetProfile): number | null => {
  if (dog.dateOfBirth) {
    const y = Math.floor(
      (Date.now() - new Date(dog.dateOfBirth).getTime()) / (1000 * 60 * 60 * 24 * 365.25)
    );
    if (!Number.isNaN(y)) return y;
  }
  return dog.ageYears ?? null;
};

const formatDob = (iso?: string): string | null => {
  if (!iso) return null;
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return null;
  return d.toLocaleDateString('sk-SK', { day: 'numeric', month: 'numeric', year: 'numeric' });
};

interface Props {
  dog: PetProfile;
  dogProfiles: PetProfile[];
  selectedDogId: string;
  onSelectDog: (id: string) => void;
}

interface IdentifierItem {
  icon: React.ReactElement;
  label: string;
  value: string;
}

export default function DocumentIdentityBlock({
  dog,
  dogProfiles,
  selectedDogId,
  onSelectDog,
}: Props) {
  const { t } = useTranslation('vetCard');
  const theme = useTheme();
  const age = ageInYears(dog);

  const sexLabel =
    dog.sex === 'MALE'
      ? t('identity.sexMale')
      : dog.sex === 'FEMALE'
        ? t('identity.sexFemale')
        : null;

  const subtitleParts = [
    dog.breed,
    age != null ? t('identity.ageYears', { age }) : null,
    dog.weightKg ? `${dog.weightKg} kg` : null,
    sexLabel,
  ].filter(Boolean);

  const identifiers: IdentifierItem[] = [];
  if (dog.microchipNumber)
    identifiers.push({
      icon: <ChipIcon />,
      label: t('fields.microchip'),
      value: dog.microchipNumber,
    });
  if (dog.passportNumber)
    identifiers.push({
      icon: <PassportIcon />,
      label: t('fields.passport'),
      value: dog.passportNumber,
    });
  const dob = formatDob(dog.dateOfBirth);
  if (dob)
    identifiers.push({ icon: <CalendarIcon />, label: t('identity.dateOfBirth'), value: dob });
  if (dog.weightKg)
    identifiers.push({
      icon: <WeightIcon />,
      label: t('fields.weight'),
      value: `${dog.weightKg} kg`,
    });

  return (
    <Box
      sx={{
        position: 'relative',
        overflow: 'hidden',
        borderRadius: 4,
        bgcolor: alpha(theme.palette.primary.main, theme.palette.mode === 'light' ? 0.05 : 0.1),
        border: `1px solid ${alpha(theme.palette.primary.main, 0.15)}`,
        p: { xs: 2, md: 2.5 },
      }}
    >
      <Stack
        direction={{ xs: 'column', md: 'row' }}
        alignItems={{ xs: 'flex-start', md: 'center' }}
        gap={{ xs: 2, md: 2.5 }}
      >
        <Avatar
          src={dog.photoUrl || undefined}
          alt={dog.name}
          sx={{
            width: { xs: 72, md: 88 },
            height: { xs: 72, md: 88 },
            bgcolor: alpha(
              theme.palette.primary.main,
              theme.palette.mode === 'light' ? 0.16 : 0.25
            ),
            color: theme.palette.mode === 'light' ? 'primary.dark' : 'primary.light',
            fontWeight: 700,
            fontSize: { xs: '1.4rem', md: '1.7rem' },
            border: `3px solid ${theme.palette.background.paper}`,
            boxShadow: '0 2px 8px rgba(15,76,92,0.10)',
            flexShrink: 0,
          }}
        >
          {initialsOf(dog.name) || <PetsIcon />}
        </Avatar>

        <Stack sx={{ flex: 1, minWidth: 0 }} spacing={0.5}>
          <Typography
            variant="caption"
            sx={{ color: 'text.secondary', fontSize: '0.7rem', letterSpacing: '0.1em' }}
          >
            {t('identity.cardCaption')}
          </Typography>
          <Stack direction="row" alignItems="center" gap={1.5} flexWrap="wrap">
            <Typography
              variant="h1"
              sx={{
                fontSize: { xs: '1.5rem', md: '2rem' },
                fontWeight: 700,
                lineHeight: 1.1,
                letterSpacing: '-0.02em',
              }}
            >
              {dog.name}
            </Typography>
            {dogProfiles.length > 1 && (
              <FormControl size="small">
                <Select
                  value={selectedDogId}
                  onChange={(e) => onSelectDog(e.target.value)}
                  variant="standard"
                  disableUnderline
                  sx={{
                    fontSize: '0.85rem',
                    color: 'text.secondary',
                    '& .MuiSelect-select': { py: 0.5, pr: 3 },
                  }}
                >
                  {dogProfiles.map((p) => (
                    <MenuItem key={p.id} value={p.id}>
                      {t('identity.switchTo', { name: p.name })}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            )}
          </Stack>
          {subtitleParts.length > 0 && (
            <Typography variant="body2" sx={{ color: 'text.secondary' }}>
              {subtitleParts.join(' · ')}
            </Typography>
          )}
        </Stack>
      </Stack>

      {identifiers.length > 0 && (
        <Box
          sx={{
            mt: 2,
            display: 'grid',
            gridTemplateColumns: {
              xs: '1fr',
              sm: 'repeat(2, 1fr)',
              md: `repeat(${Math.min(identifiers.length, 4)}, 1fr)`,
            },
            gap: 1,
            pt: 1.5,
            borderTop: `1px solid ${alpha(theme.palette.primary.main, 0.15)}`,
          }}
        >
          {identifiers.map((id) => (
            <Stack key={id.label} direction="row" alignItems="center" gap={1}>
              <Box
                sx={{
                  width: 28,
                  height: 28,
                  borderRadius: 1.5,
                  bgcolor: alpha(theme.palette.primary.main, 0.1),
                  color: 'primary.main',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0,
                  '& svg': { fontSize: 16 },
                }}
              >
                {id.icon}
              </Box>
              <Stack sx={{ minWidth: 0 }} spacing={0}>
                <Typography
                  variant="caption"
                  sx={{ color: 'text.secondary', fontSize: '0.65rem', lineHeight: 1.2 }}
                >
                  {id.label}
                </Typography>
                <Typography
                  variant="body2"
                  sx={{ fontWeight: 600, fontSize: '0.85rem', lineHeight: 1.25 }}
                  noWrap
                >
                  {id.value}
                </Typography>
              </Stack>
            </Stack>
          ))}
        </Box>
      )}
    </Box>
  );
}
