import { useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
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
import type { ValidityStatus, VetVisitRecord } from '../../types/dogHealth';
import HealthScoreRing, { type ScoreBreakdownItem } from './HealthScoreRing';
import QuickVisitButton from './QuickVisitButton';

interface Props {
  dog: PetProfile;
  dogProfiles: PetProfile[];
  selectedDogId: string;
  onSelectDog: (id: string) => void;
  vaccinationStatus: ValidityStatus;
  dewormingStatus: ValidityStatus;
  ectoStatus: ValidityStatus;
  dietStatus: ValidityStatus;
  onAddRecord: () => void;
  onQuickVisitCreate: (visit: VetVisitRecord) => void;
  onQuickVisitUndo: (id: string) => void;
}

const initials = (name: string) =>
  name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((p) => p[0]?.toUpperCase() ?? '')
    .join('');

const computeAgeLabel = (dog: PetProfile): string | null => {
  if (dog.dateOfBirth) {
    const dob = new Date(dog.dateOfBirth);
    if (!Number.isNaN(dob.getTime())) {
      const now = new Date();
      let years = now.getFullYear() - dob.getFullYear();
      let months = now.getMonth() - dob.getMonth();
      if (now.getDate() < dob.getDate()) months -= 1;
      if (months < 0) {
        years -= 1;
        months += 12;
      }
      if (years <= 0 && months <= 0) return '< 1 mes.';
      if (years <= 0) return `${months} mes.`;
      if (months === 0) return `${years} r.`;
      return `${years} r. ${months} mes.`;
    }
  }
  if (typeof dog.ageYears === 'number' && dog.ageYears > 0) {
    return `${dog.ageYears} r.`;
  }
  return null;
};

const sexLabel = (sex?: PetProfile['sex']) => {
  if (sex === 'MALE') return 'Samec';
  if (sex === 'FEMALE') return 'Samica';
  return null;
};

const statusToScore = (s: ValidityStatus): number => {
  if (s === 'VALID') return 100;
  if (s === 'EXPIRING_SOON') return 60;
  if (s === 'EXPIRED') return 10;
  return 40;
};

const statusToBreakdown = (s: ValidityStatus): ScoreBreakdownItem['status'] => {
  if (s === 'VALID') return 'good';
  if (s === 'EXPIRING_SOON') return 'soon';
  if (s === 'EXPIRED') return 'bad';
  return 'unknown';
};

const statusDetail = (s: ValidityStatus): string => {
  if (s === 'VALID') return 'platné';
  if (s === 'EXPIRING_SOON') return 'končí čoskoro';
  if (s === 'EXPIRED') return 'po termíne';
  return 'nezadané';
};

export default function PassportHero({
  dog,
  dogProfiles,
  selectedDogId,
  onSelectDog,
  vaccinationStatus,
  dewormingStatus,
  ectoStatus,
  dietStatus,
  onAddRecord,
  onQuickVisitCreate,
  onQuickVisitUndo,
}: Props) {
  const theme = useTheme();
  const navigate = useNavigate();

  const statuses = [vaccinationStatus, dewormingStatus, ectoStatus, dietStatus];
  const unknownCount = statuses.filter((s) => s === 'UNKNOWN').length;
  const allUnknown = unknownCount === statuses.length;

  const score = useMemo(() => {
    if (allUnknown) return null;
    const values = statuses.map(statusToScore);
    return values.reduce((a, b) => a + b, 0) / values.length;
  }, [vaccinationStatus, dewormingStatus, ectoStatus, dietStatus, allUnknown]);

  const incomplete = unknownCount > 0 && !allUnknown;

  const scoreBreakdown: ScoreBreakdownItem[] = [
    {
      label: 'Očkovanie',
      shortLabel: 'Očk.',
      status: statusToBreakdown(vaccinationStatus),
      detail: statusDetail(vaccinationStatus),
    },
    {
      label: 'Odčervenie',
      shortLabel: 'Odč.',
      status: statusToBreakdown(dewormingStatus),
      detail: statusDetail(dewormingStatus),
    },
    {
      label: 'Kliešte / blchy',
      shortLabel: 'Kliešte',
      status: statusToBreakdown(ectoStatus),
      detail: statusDetail(ectoStatus),
    },
    {
      label: 'Diéta',
      shortLabel: 'Diéta',
      status: statusToBreakdown(dietStatus),
      detail: statusDetail(dietStatus),
    },
  ];

  const ageLabel = computeAgeLabel(dog);
  const sex = sexLabel(dog.sex);

  const chips: { label: string; icon?: React.ReactElement }[] = [];
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
        mb: 2.5,
        position: 'relative',
        overflow: 'hidden',
        borderRadius: 4,
        bgcolor: alpha(theme.palette.primary.main, theme.palette.mode === 'light' ? 0.06 : 0.12),
        border: `1px solid ${alpha(theme.palette.primary.main, 0.15)}`,
      }}
    >
      <Box
        sx={{
          position: 'absolute',
          inset: 0,
          background: `radial-gradient(circle at 90% 10%, ${alpha(
            theme.palette.primary.light,
            0.18
          )}, transparent 60%)`,
          pointerEvents: 'none',
        }}
      />
      <Box sx={{ position: 'relative', p: { xs: 2, md: 2.5 } }}>
        <Stack
          direction={{ xs: 'column', md: 'row' }}
          alignItems={{ xs: 'flex-start', md: 'center' }}
          gap={{ xs: 2, md: 2.5 }}
        >
          <Avatar
            src={dog.photoUrl || undefined}
            alt={dog.name}
            sx={{
              width: { xs: 72, md: 96 },
              height: { xs: 72, md: 96 },
              bgcolor: alpha(
                theme.palette.primary.main,
                theme.palette.mode === 'light' ? 0.16 : 0.25
              ),
              color: theme.palette.mode === 'light' ? 'primary.dark' : 'primary.light',
              fontWeight: 700,
              fontSize: { xs: '1.5rem', md: '1.9rem' },
              border: `3px solid ${theme.palette.background.paper}`,
              boxShadow: '0 2px 8px rgba(15,76,92,0.10)',
            }}
          >
            {initials(dog.name) || <PetsIcon />}
          </Avatar>

          <Stack sx={{ flex: 1, minWidth: 0 }} spacing={1.25}>
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
                        Prepnúť na {p.name}
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

            <Stack direction="row" flexWrap="wrap" gap={1} sx={{ mt: 1 }}>
              <Button
                variant="contained"
                color="primary"
                startIcon={<AddIcon />}
                onClick={onAddRecord}
                size="large"
                sx={{ boxShadow: '0 4px 14px rgba(15,76,92,0.25)' }}
              >
                Pridať záznam
              </Button>
              <QuickVisitButton
                dogId={selectedDogId}
                disabled={!selectedDogId}
                onCreate={onQuickVisitCreate}
                onUndo={onQuickVisitUndo}
              />
              <Button
                variant="text"
                startIcon={<CardIcon />}
                onClick={() => navigate('/karta-pre-veterinara')}
              >
                Karta pre veterinára
              </Button>
            </Stack>
          </Stack>

          <Box
            sx={{
              display: 'flex',
              alignSelf: { xs: 'center', md: 'center' },
              flexShrink: 0,
              pl: { md: 2 },
            }}
          >
            <HealthScoreRing
              score={score}
              size={96}
              breakdown={scoreBreakdown}
              incomplete={incomplete}
            />
          </Box>
        </Stack>
      </Box>
    </Box>
  );
}
