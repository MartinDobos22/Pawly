import { type ReactElement, type ReactNode } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import {
  Avatar,
  Box,
  Button,
  Chip,
  FormControl,
  MenuItem,
  Select,
  Stack,
  Typography,
  alpha,
  useTheme,
} from '@mui/material';
import {
  Add as AddIcon,
  Description as CardIcon,
  Cake as CakeIcon,
  Monitor as ChipIcon,
  Pets as PetsIcon,
  Scale as ScaleIcon,
} from '@mui/icons-material';
import type { PetProfile } from '../../types';
import type { VetVisitRecord } from '../../types/petHealth';
import QuickVisitButton from './QuickVisitButton';
import { md3 } from './md3';

interface Props {
  dog: PetProfile;
  dogProfiles: PetProfile[];
  selectedDogId: string;
  onSelectDog: (id: string) => void;
  onAddRecord: () => void;
  onQuickVisitCreate: (visit: VetVisitRecord) => Promise<VetVisitRecord>;
  onQuickVisitUndo: (id: string) => void;
  scoreSlot?: ReactNode;
}

const initials = (name: string) =>
  name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((p) => p[0]?.toUpperCase() ?? '')
    .join('');

export default function PassportHero({
  dog,
  dogProfiles,
  selectedDogId,
  onSelectDog,
  onAddRecord,
  onQuickVisitCreate,
  onQuickVisitUndo,
  scoreSlot,
}: Props) {
  const { t } = useTranslation('healthPassport');
  const theme = useTheme();
  const navigate = useNavigate();
  const m = md3(theme);

  const computeAgeLabel = (p: PetProfile): string | null => {
    if (p.dateOfBirth) {
      const dob = new Date(p.dateOfBirth);
      if (!Number.isNaN(dob.getTime())) {
        const now = new Date();
        let years = now.getFullYear() - dob.getFullYear();
        let months = now.getMonth() - dob.getMonth();
        if (now.getDate() < dob.getDate()) months -= 1;
        if (months < 0) {
          years -= 1;
          months += 12;
        }
        if (years <= 0 && months <= 0) return t('hero.ageUnderMonth');
        if (years <= 0) return t('hero.ageMonths', { count: months });
        if (months === 0) return t('hero.ageYears', { count: years });
        return t('hero.ageYearsMonths', { years, months });
      }
    }
    if (typeof p.ageYears === 'number' && p.ageYears > 0) {
      return t('hero.ageYears', { count: p.ageYears });
    }
    return null;
  };

  const ageLabel = computeAgeLabel(dog);
  const sex =
    dog.sex === 'MALE' ? t('hero.sexMale') : dog.sex === 'FEMALE' ? t('hero.sexFemale') : null;

  const chips: { label: string; icon?: ReactElement }[] = [];
  if (dog.breed) chips.push({ label: dog.breed, icon: <PetsIcon sx={{ fontSize: 14 }} /> });
  if (ageLabel) chips.push({ label: ageLabel, icon: <CakeIcon sx={{ fontSize: 14 }} /> });
  if (dog.weightKg)
    chips.push({ label: `${dog.weightKg} kg`, icon: <ScaleIcon sx={{ fontSize: 14 }} /> });
  if (sex) chips.push({ label: sex });
  if (dog.microchipNumber)
    chips.push({ label: dog.microchipNumber, icon: <ChipIcon sx={{ fontSize: 14 }} /> });

  return (
    <Box
      sx={{
        mb: 2,
        position: 'relative',
        overflow: 'hidden',
        borderRadius: theme.spacing(3),
        bgcolor: m.primaryContainer,
        boxShadow: m.elevation1,
      }}
    >
      <Box sx={{ p: { xs: 2, md: 3 } }}>
        <Stack
          direction={{ xs: 'column', md: 'row' }}
          alignItems={{ xs: 'stretch', md: 'center' }}
          gap={{ xs: 2, md: 3 }}
        >
          <Stack
            direction={{ xs: 'column', sm: 'row' }}
            alignItems={{ xs: 'flex-start', sm: 'center' }}
            gap={{ xs: 1.5, sm: 2.5 }}
            sx={{ flex: 1, minWidth: 0 }}
          >
            <Avatar
              src={dog.photoUrl || undefined}
              alt={dog.name}
              sx={{
                width: { xs: 56, md: 72 },
                height: { xs: 56, md: 72 },
                bgcolor: alpha(
                  theme.palette.primary.main,
                  theme.palette.mode === 'light' ? 0.16 : 0.25
                ),
                color: theme.palette.mode === 'light' ? 'primary.dark' : 'primary.light',
                fontWeight: 700,
                fontSize: { xs: '1.25rem', md: '1.5rem' },
                border: `3px solid ${theme.palette.background.paper}`,
                boxShadow: `0 2px 8px ${alpha(
                  theme.palette.common.black,
                  theme.palette.mode === 'dark' ? 0.4 : 0.1
                )}`,
              }}
            >
              {initials(dog.name) || <PetsIcon />}
            </Avatar>

            <Stack sx={{ flex: 1, minWidth: 0 }} spacing={1}>
              <Stack direction="row" alignItems="center" gap={1.5} flexWrap="wrap">
                <Typography
                  variant="h1"
                  sx={{
                    fontSize: { xs: '1.4rem', md: '1.75rem' },
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
                      renderValue={() => t('hero.switchPet')}
                      sx={{
                        fontSize: '0.85rem',
                        color: 'text.secondary',
                        '& .MuiSelect-select': { py: 0.5, pr: 3 },
                      }}
                    >
                      {dogProfiles.map((p) => (
                        <MenuItem key={p.id} value={p.id}>
                          {p.name}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                )}
              </Stack>

              <Stack direction="row" flexWrap="wrap" gap={0.75}>
                {chips.map((c, idx) => (
                  <Chip
                    key={`${c.label}-${idx}`}
                    label={c.label}
                    icon={c.icon}
                    size="small"
                    variant="outlined"
                    sx={{
                      bgcolor: 'background.paper',
                      borderColor: alpha(theme.palette.primary.main, 0.2),
                      color: 'text.primary',
                      fontWeight: 500,
                      fontSize: '0.78rem',
                      '& .MuiChip-icon': { color: 'primary.main', ml: 0.75 },
                    }}
                  />
                ))}
              </Stack>

              <Stack direction="row" flexWrap="wrap" gap={1} sx={{ mt: 0.5 }}>
                <Button
                  variant="contained"
                  color="primary"
                  startIcon={<AddIcon />}
                  onClick={onAddRecord}
                >
                  {t('hero.addRecord')}
                </Button>
                <QuickVisitButton
                  petId={selectedDogId}
                  disabled={!selectedDogId}
                  onCreate={onQuickVisitCreate}
                  onUndo={onQuickVisitUndo}
                />
                <Button
                  variant="text"
                  startIcon={<CardIcon />}
                  onClick={() => navigate('/karta-pre-veterinara')}
                >
                  {t('hero.vetCard')}
                </Button>
              </Stack>
            </Stack>
          </Stack>

          {scoreSlot && (
            <Box
              sx={{
                flexShrink: 0,
                display: 'flex',
                justifyContent: 'center',
                width: { xs: '100%', md: 'auto' },
                pt: { xs: 2, md: 0 },
                pl: { md: 3 },
                borderTop: {
                  xs: `1px solid ${alpha(theme.palette.primary.main, 0.15)}`,
                  md: 'none',
                },
                borderLeft: { md: `1px solid ${alpha(theme.palette.primary.main, 0.15)}` },
              }}
            >
              {scoreSlot}
            </Box>
          )}
        </Stack>
      </Box>
    </Box>
  );
}
