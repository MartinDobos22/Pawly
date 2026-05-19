import {
  Box,
  Card,
  Chip,
  FormControl,
  InputLabel,
  MenuItem,
  Select,
  Stack,
  Typography,
} from '@mui/material';
import {
  Pets as PetsIcon,
  Tag as TagIcon,
  CalendarMonth as CalendarIcon,
  Scale as ScaleIcon,
  Wc as SexIcon,
} from '@mui/icons-material';
import type { PetProfile } from '../../types';

interface Props {
  dog: PetProfile;
  dogProfiles: PetProfile[];
  selectedDogId: string;
  onSelectDog: (id: string) => void;
}

function ageInYears(dog: PetProfile): number | undefined {
  if (dog.dateOfBirth) {
    return Math.floor(
      (Date.now() - new Date(dog.dateOfBirth).getTime()) / (1000 * 60 * 60 * 24 * 365.25)
    );
  }
  return dog.ageYears;
}

function sexLabel(sex: PetProfile['sex']): string | null {
  if (sex === 'MALE') return 'samec';
  if (sex === 'FEMALE') return 'samica';
  return null;
}

export default function VetCardHeader({ dog, dogProfiles, selectedDogId, onSelectDog }: Props) {
  const age = ageInYears(dog);
  const subtitle = [
    dog.breed,
    age != null ? `${age} r.` : null,
    dog.weightKg ? `${dog.weightKg} kg` : null,
  ]
    .filter(Boolean)
    .join(' · ');

  const chips: Array<{ icon: React.ReactElement; label: string }> = [];
  if (dog.microchipNumber) chips.push({ icon: <TagIcon />, label: `Čip: ${dog.microchipNumber}` });
  if (dog.passportNumber) chips.push({ icon: <TagIcon />, label: `Pas: ${dog.passportNumber}` });
  if (dog.dateOfBirth)
    chips.push({
      icon: <CalendarIcon />,
      label: `Nar.: ${new Date(dog.dateOfBirth).toLocaleDateString('sk-SK')}`,
    });
  const sx = sexLabel(dog.sex);
  if (sx) chips.push({ icon: <SexIcon />, label: sx });
  if (dog.weightKg) chips.push({ icon: <ScaleIcon />, label: `${dog.weightKg} kg` });

  return (
    <Card variant="outlined" sx={{ p: { xs: 1.5, md: 2 } }}>
      <Stack
        direction={{ xs: 'column', md: 'row' }}
        alignItems={{ xs: 'flex-start', md: 'center' }}
        gap={1.5}
      >
        <Box
          sx={{
            width: 40,
            height: 40,
            borderRadius: 1,
            bgcolor: 'action.hover',
            color: 'primary.main',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexShrink: 0,
            '& svg': { fontSize: 22 },
          }}
        >
          <PetsIcon />
        </Box>

        <Box sx={{ flex: 1, minWidth: 0 }}>
          <Typography
            variant="overline"
            sx={{ display: 'block', color: 'text.secondary', lineHeight: 1.2 }}
          >
            Karta pre veterinára
          </Typography>
          <Typography variant="h5" sx={{ fontWeight: 600, lineHeight: 1.2 }}>
            {dog.name}
          </Typography>
          {subtitle && (
            <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
              {subtitle}
            </Typography>
          )}
        </Box>

        {dogProfiles.length > 1 && (
          <FormControl size="small" sx={{ minWidth: 180 }}>
            <InputLabel>Pes</InputLabel>
            <Select value={selectedDogId} label="Pes" onChange={(e) => onSelectDog(e.target.value)}>
              {dogProfiles.map((p) => (
                <MenuItem key={p.id} value={p.id}>
                  {p.name}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        )}
      </Stack>

      {chips.length > 0 && (
        <Stack direction="row" flexWrap="wrap" gap={0.75} sx={{ mt: 1.5 }}>
          {chips.map((c) => (
            <Chip
              key={c.label}
              icon={c.icon}
              label={c.label}
              size="small"
              variant="outlined"
              sx={{ '& .MuiChip-icon': { fontSize: 16 } }}
            />
          ))}
        </Stack>
      )}
    </Card>
  );
}
