import { useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import {
  Box,
  Button,
  FormControl,
  IconButton,
  MenuItem,
  Select,
  Stack,
  Tooltip,
  Typography,
  alpha,
  useTheme,
} from '@mui/material';
import {
  Add as AddIcon,
  Description as CardIcon,
  Memory as ChipIcon,
  Restaurant as DietIcon,
  Biotech as DewormIcon,
  Scale as ScaleIcon,
  Settings as SettingsIcon,
  Vaccines as VaccinesIcon,
} from '@mui/icons-material';
import type { PetProfile } from '../../types';
import type { ValidityStatus, VetVisitRecord } from '../../types/petHealth';
import { relativeDate } from '../../utils/relativeDate';
import HealthScoreRing, { type ScoreBreakdownItem } from './HealthScoreRing';
import QuickVisitButton from './QuickVisitButton';

interface QuickInfo {
  key: string;
  icon: React.ReactElement;
  label: string;
  value: string;
  onClick?: () => void;
}

interface Props {
  dog: PetProfile;
  dogProfiles: PetProfile[];
  selectedDogId: string;
  onSelectDog: (id: string) => void;
  vaccinationStatus: ValidityStatus;
  dewormingStatus: ValidityStatus;
  ectoStatus: ValidityStatus;
  dietStatus: ValidityStatus;
  vaccinationDueDate?: string;
  dewormingDueDate?: string;
  dietName?: string;
  onAddRecord: () => void;
  onQuickVisitCreate: (visit: VetVisitRecord) => Promise<VetVisitRecord>;
  onQuickVisitUndo: (id: string) => void;
}

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

function InfoPill({ info, onPhoto }: { info: QuickInfo; onPhoto: boolean }) {
  const interactive = Boolean(info.onClick);
  return (
    <Stack
      direction="row"
      alignItems="center"
      gap={1.25}
      role={interactive ? 'button' : undefined}
      tabIndex={interactive ? 0 : undefined}
      onClick={info.onClick}
      onKeyDown={
        interactive
          ? (e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                info.onClick?.();
              }
            }
          : undefined
      }
      sx={(theme) => ({
        px: 1.5,
        py: 1,
        borderRadius: 3,
        bgcolor: 'background.paper',
        border: `1px solid ${theme.palette.divider}`,
        boxShadow: onPhoto ? `0 4px 16px ${alpha(theme.palette.common.black, 0.18)}` : 'none',
        cursor: interactive ? 'pointer' : 'default',
        transition: 'transform 120ms ease, border-color 120ms ease',
        minWidth: { xs: 0, md: 220 },
        '&:hover': interactive
          ? { borderColor: alpha(theme.palette.primary.main, 0.4), transform: 'translateY(-1px)' }
          : undefined,
        '&:focus-visible': interactive
          ? { outline: `2px solid ${theme.palette.primary.main}`, outlineOffset: 2 }
          : undefined,
      })}
    >
      <Box
        sx={(theme) => ({
          width: 34,
          height: 34,
          borderRadius: 2,
          flexShrink: 0,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          bgcolor: alpha(theme.palette.primary.main, 0.1),
          color: 'primary.main',
        })}
      >
        {info.icon}
      </Box>
      <Box sx={{ minWidth: 0 }}>
        <Typography
          variant="caption"
          sx={{ color: 'text.secondary', textTransform: 'none', letterSpacing: 0, lineHeight: 1.2 }}
        >
          {info.label}
        </Typography>
        <Typography variant="body2" sx={{ fontWeight: 700, lineHeight: 1.25 }} noWrap>
          {info.value}
        </Typography>
      </Box>
    </Stack>
  );
}

export default function PassportHero({
  dog,
  dogProfiles,
  selectedDogId,
  onSelectDog,
  vaccinationStatus,
  dewormingStatus,
  ectoStatus,
  dietStatus,
  vaccinationDueDate,
  dewormingDueDate,
  dietName,
  onAddRecord,
  onQuickVisitCreate,
  onQuickVisitUndo,
}: Props) {
  const { t } = useTranslation('healthPassport');
  const theme = useTheme();
  const navigate = useNavigate();

  const hasPhoto = Boolean(dog.photoUrl);
  const headingColor = hasPhoto ? theme.palette.common.white : theme.palette.text.primary;
  const subColor = hasPhoto
    ? alpha(theme.palette.common.white, 0.82)
    : theme.palette.text.secondary;

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

  const statusDetail = (s: ValidityStatus): string => {
    if (s === 'VALID') return t('hero.statusValid');
    if (s === 'EXPIRING_SOON') return t('hero.statusExpiringSoon');
    if (s === 'EXPIRED') return t('hero.statusExpired');
    return t('hero.statusUnknown');
  };

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
      label: t('hero.vaccLabel'),
      shortLabel: t('hero.vaccShort'),
      status: statusToBreakdown(vaccinationStatus),
      detail: statusDetail(vaccinationStatus),
    },
    {
      label: t('hero.dewLabel'),
      shortLabel: t('hero.dewShort'),
      status: statusToBreakdown(dewormingStatus),
      detail: statusDetail(dewormingStatus),
    },
    {
      label: t('hero.ectoLabel'),
      shortLabel: t('hero.ectoShort'),
      status: statusToBreakdown(ectoStatus),
      detail: statusDetail(ectoStatus),
    },
    {
      label: t('hero.dietLabel'),
      shortLabel: t('hero.dietShort'),
      status: statusToBreakdown(dietStatus),
      detail: statusDetail(dietStatus),
    },
  ];

  const ageLabel = computeAgeLabel(dog);
  const sex =
    dog.sex === 'MALE' ? t('hero.sexMale') : dog.sex === 'FEMALE' ? t('hero.sexFemale') : null;
  const metaParts = [dog.breed, ageLabel, sex].filter(Boolean) as string[];

  const quickInfos: QuickInfo[] = [];
  const vaccRel = vaccinationDueDate ? relativeDate(vaccinationDueDate) : null;
  if (vaccRel) {
    quickInfos.push({
      key: 'vaccination',
      icon: <VaccinesIcon sx={{ fontSize: 18 }} />,
      label: t('hero.quickVaccination'),
      value: vaccRel.text,
    });
  }
  const dewRel = dewormingDueDate ? relativeDate(dewormingDueDate) : null;
  if (dewRel) {
    quickInfos.push({
      key: 'deworming',
      icon: <DewormIcon sx={{ fontSize: 18 }} />,
      label: t('hero.quickDeworming'),
      value: dewRel.text,
    });
  }
  if (typeof dog.weightKg === 'number' && dog.weightKg > 0) {
    quickInfos.push({
      key: 'weight',
      icon: <ScaleIcon sx={{ fontSize: 18 }} />,
      label: t('hero.quickWeight'),
      value: `${dog.weightKg} kg`,
    });
  }
  if (dietName) {
    quickInfos.push({
      key: 'diet',
      icon: <DietIcon sx={{ fontSize: 18 }} />,
      label: t('hero.quickDiet'),
      value: dietName,
    });
  }
  if (dog.microchipNumber) {
    quickInfos.push({
      key: 'chip',
      icon: <ChipIcon sx={{ fontSize: 18 }} />,
      label: t('hero.quickChip'),
      value: dog.microchipNumber,
    });
  }

  return (
    <Box
      sx={{
        mb: 2.5,
        position: 'relative',
        overflow: 'hidden',
        borderRadius: 4,
        border: `1px solid ${alpha(theme.palette.primary.main, 0.15)}`,
        bgcolor: alpha(theme.palette.primary.main, theme.palette.mode === 'light' ? 0.06 : 0.12),
      }}
    >
      {hasPhoto && (
        <Box
          aria-hidden
          sx={{
            position: 'absolute',
            inset: 0,
            backgroundImage: `url(${dog.photoUrl})`,
            backgroundSize: 'cover',
            backgroundPosition: 'center',
          }}
        />
      )}
      <Box
        aria-hidden
        sx={{
          position: 'absolute',
          inset: 0,
          background: hasPhoto
            ? `linear-gradient(105deg, ${alpha(theme.palette.common.black, 0.78)} 0%, ${alpha(
                theme.palette.common.black,
                0.45
              )} 45%, ${alpha(theme.palette.common.black, 0.1)} 100%)`
            : `radial-gradient(circle at 90% 10%, ${alpha(theme.palette.primary.light, 0.18)}, transparent 60%)`,
          pointerEvents: 'none',
        }}
      />

      <Box sx={{ position: 'relative', p: { xs: 2, md: 3 } }}>
        <Box
          sx={{
            display: 'grid',
            gridTemplateColumns: { xs: '1fr', md: '1fr auto' },
            gap: { xs: 2, md: 3 },
            alignItems: 'start',
          }}
        >
          <Stack spacing={1.5} sx={{ minWidth: 0 }}>
            <Typography
              variant="caption"
              sx={{ color: subColor, textTransform: 'none', letterSpacing: 0 }}
            >
              {t('hero.greeting')}
            </Typography>

            <Stack direction="row" alignItems="center" gap={1.5} flexWrap="wrap">
              <Typography
                variant="h1"
                sx={{
                  fontSize: { xs: '1.75rem', md: '2.5rem' },
                  fontWeight: 700,
                  lineHeight: 1.05,
                  letterSpacing: '-0.02em',
                  color: headingColor,
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
                      color: subColor,
                      '& .MuiSelect-select': { py: 0.5, pr: 3 },
                      '& .MuiSelect-icon': { color: subColor },
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

            {metaParts.length > 0 && (
              <Typography variant="body2" sx={{ color: subColor, fontWeight: 500 }}>
                {metaParts.join('  •  ')}
              </Typography>
            )}

            <Box
              sx={(t2) => ({
                alignSelf: 'flex-start',
                mt: 0.5,
                p: 1.5,
                borderRadius: 4,
                bgcolor: hasPhoto ? alpha(t2.palette.background.paper, 0.92) : 'background.paper',
                boxShadow: hasPhoto ? `0 6px 20px ${alpha(t2.palette.common.black, 0.22)}` : 'none',
                border: `1px solid ${t2.palette.divider}`,
              })}
            >
              <HealthScoreRing
                score={score}
                size={108}
                label={t('hero.healthScore')}
                breakdown={scoreBreakdown}
                incomplete={incomplete}
              />
            </Box>

            <Stack direction="row" flexWrap="wrap" gap={1} sx={{ mt: 0.5 }}>
              <Button
                variant="contained"
                color="primary"
                startIcon={<AddIcon />}
                onClick={onAddRecord}
                size="large"
                sx={{ borderRadius: 999 }}
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
                variant={hasPhoto ? 'contained' : 'text'}
                color={hasPhoto ? 'inherit' : 'primary'}
                startIcon={<CardIcon />}
                onClick={() => navigate('/karta-pre-veterinara')}
                sx={
                  hasPhoto
                    ? {
                        borderRadius: 999,
                        bgcolor: alpha(theme.palette.background.paper, 0.9),
                        color: 'primary.main',
                        '&:hover': { bgcolor: theme.palette.background.paper },
                      }
                    : { borderRadius: 999 }
                }
              >
                {t('hero.vetCard')}
              </Button>
            </Stack>
          </Stack>

          <Stack spacing={1} sx={{ width: { xs: '100%', md: 'auto' } }}>
            {quickInfos.map((info) => (
              <InfoPill key={info.key} info={info} onPhoto={hasPhoto} />
            ))}
            <Tooltip title={t('hero.editProfile')}>
              <IconButton
                onClick={() => navigate('/profily')}
                aria-label={t('hero.editProfile')}
                sx={(t2) => ({
                  alignSelf: { xs: 'flex-start', md: 'flex-end' },
                  border: `1px solid ${t2.palette.divider}`,
                  borderRadius: 2,
                  bgcolor: 'background.paper',
                  boxShadow: hasPhoto
                    ? `0 4px 16px ${alpha(t2.palette.common.black, 0.18)}`
                    : 'none',
                })}
              >
                <SettingsIcon sx={{ fontSize: 18 }} />
              </IconButton>
            </Tooltip>
          </Stack>
        </Box>
      </Box>
    </Box>
  );
}
