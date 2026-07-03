import { Avatar, Box, Chip, Stack, Typography, alpha, useTheme } from '@mui/material';
import {
  Biotech as DewormIcon,
  CheckCircle as CheckIcon,
  ErrorOutline as ErrorIcon,
  PestControl as EctoIcon,
  Restaurant as DietIcon,
  Vaccines as VaccinesIcon,
} from '@mui/icons-material';
import { useTranslation } from 'react-i18next';
import HealthScoreRing from '../healthPassport/HealthScoreRing';
import BrowserFrame from './BrowserFrame';
import PhoneFrame from './PhoneFrame';

function DesktopPreview() {
  const theme = useTheme();
  const { t } = useTranslation('landing');

  const cells = [
    {
      icon: VaccinesIcon,
      label: t('appPreview.mockCard.vaccination'),
      tone: 'success' as const,
      value: t('appPreview.mockCard.valid'),
    },
    {
      icon: DewormIcon,
      label: t('appPreview.mockCard.deworming'),
      tone: 'success' as const,
      value: t('appPreview.mockCard.inWeeks'),
    },
    {
      icon: EctoIcon,
      label: t('appPreview.mockCard.ticks'),
      tone: 'warning' as const,
      value: t('appPreview.mockCard.expiresSoon'),
    },
    {
      icon: DietIcon,
      label: t('appPreview.mockCard.diet'),
      tone: 'success' as const,
      value: t('appPreview.mockCard.suitable'),
    },
  ];

  return (
    <Stack spacing={1.5}>
      {/* Hero block */}
      <Box
        sx={{
          borderRadius: 3,
          bgcolor: alpha(theme.palette.primary.main, theme.palette.mode === 'light' ? 0.06 : 0.12),
          border: `1px solid ${alpha(theme.palette.primary.main, 0.15)}`,
          p: 2,
        }}
      >
        <Stack direction="row" alignItems="center" gap={2}>
          <Avatar
            sx={{
              width: 56,
              height: 56,
              bgcolor: alpha(theme.palette.primary.main, 0.16),
              color: 'primary.dark',
              fontWeight: 700,
            }}
          >
            N
          </Avatar>
          <Stack sx={{ flex: 1, minWidth: 0 }}>
            <Typography
              variant="caption"
              sx={{ color: 'text.secondary', fontSize: '0.62rem', letterSpacing: '0.1em' }}
            >
              {t('appPreview.vetCardLabel')}
            </Typography>
            <Typography sx={{ fontWeight: 700, fontSize: '1.3rem', lineHeight: 1.1 }}>
              Nalina
            </Typography>
            <Typography
              variant="caption"
              sx={{ color: 'text.secondary', textTransform: 'none', letterSpacing: 0 }}
            >
              mix · 4 r. · 9.2 kg
            </Typography>
          </Stack>
          <HealthScoreRing
            score={82}
            size={72}
            breakdown={[
              {
                label: t('appPreview.mockCard.vaccination'),
                shortLabel: t('appPreview.mockCard.vaccShort'),
                status: 'good',
              },
              {
                label: t('appPreview.mockCard.deworming'),
                shortLabel: t('appPreview.mockCard.dewormShort'),
                status: 'good',
              },
              {
                label: t('appPreview.mockCard.ticks'),
                shortLabel: t('appPreview.mockCard.ticksShort'),
                status: 'soon',
              },
              {
                label: t('appPreview.mockCard.diet'),
                shortLabel: t('appPreview.mockCard.dietShort'),
                status: 'good',
              },
            ]}
          />
        </Stack>
      </Box>

      {/* Status grid */}
      <Box
        sx={{
          display: 'grid',
          gridTemplateColumns: 'repeat(4, 1fr)',
          gap: 1,
        }}
      >
        {cells.map((cell, i) => {
          const Icon = cell.icon;
          const color = theme.palette[cell.tone].main;
          return (
            <Box
              key={i}
              sx={{
                p: 1.25,
                borderRadius: 2,
                border: `1px solid ${alpha(color, 0.3)}`,
                bgcolor: alpha(color, theme.palette.mode === 'light' ? 0.05 : 0.12),
              }}
            >
              <Stack direction="row" alignItems="center" gap={0.75} sx={{ mb: 0.5 }}>
                <Box
                  sx={{
                    width: 22,
                    height: 22,
                    borderRadius: 1,
                    bgcolor: alpha(color, 0.18),
                    color,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <Icon sx={{ fontSize: 14 }} />
                </Box>
                <Typography
                  variant="caption"
                  sx={{ color: 'text.secondary', fontSize: '0.55rem', letterSpacing: '0.06em' }}
                  noWrap
                >
                  {cell.label}
                </Typography>
              </Stack>
              <Typography sx={{ fontWeight: 700, fontSize: '0.78rem', color }} noWrap>
                {cell.value}
              </Typography>
            </Box>
          );
        })}
      </Box>
    </Stack>
  );
}

function MobilePreview() {
  const theme = useTheme();
  const { t } = useTranslation('landing');

  const items = t('appPreview.historyItems', { returnObjects: true }) as Array<{
    date: string;
    label: string;
    tone: 'warning' | 'primary' | 'success';
  }>;

  return (
    <Stack spacing={1.5} sx={{ pt: 1 }}>
      <Typography
        variant="caption"
        sx={{ color: 'text.secondary', fontSize: '0.62rem', letterSpacing: '0.1em' }}
      >
        {t('appPreview.clinicalHistory')}
      </Typography>
      <Stack spacing={1}>
        {items.map((it, i) => {
          const color = theme.palette[it.tone].main;
          return (
            <Box
              key={i}
              sx={{
                p: 1,
                borderRadius: 2,
                border: `1px solid ${theme.palette.divider}`,
                bgcolor: 'background.paper',
              }}
            >
              <Stack direction="row" alignItems="center" gap={0.75}>
                <Chip
                  label={it.label.split(' · ')[0]}
                  size="small"
                  variant="outlined"
                  sx={{
                    height: 18,
                    fontSize: '0.6rem',
                    borderColor: alpha(color, 0.4),
                    color,
                  }}
                />
                <Typography
                  variant="caption"
                  sx={{
                    color: 'text.disabled',
                    fontSize: '0.62rem',
                    textTransform: 'none',
                    letterSpacing: 0,
                    ml: 'auto',
                  }}
                >
                  {it.date}
                </Typography>
              </Stack>
              <Typography sx={{ fontSize: '0.72rem', fontWeight: 600, mt: 0.5 }} noWrap>
                {it.label.includes(' · ') ? it.label.split(' · ')[1] : it.label}
              </Typography>
            </Box>
          );
        })}
      </Stack>
    </Stack>
  );
}

export default function AppPreview() {
  const theme = useTheme();
  const isDark = theme.palette.mode === 'dark';
  const { t } = useTranslation('landing');

  return (
    <Box
      sx={{
        position: 'relative',
        pt: { xs: 5, md: 6 },
        pb: { xs: 8, md: 10 },
        overflow: 'hidden',
      }}
    >
      {/* Decorative gradient backplate */}
      <Box
        sx={{
          position: 'absolute',
          top: '20%',
          left: '50%',
          transform: 'translateX(-50%)',
          width: { xs: '80%', md: 720 },
          height: 320,
          background: `radial-gradient(circle, ${alpha(theme.palette.primary.main, isDark ? 0.18 : 0.1)}, transparent 70%)`,
          filter: 'blur(60px)',
          pointerEvents: 'none',
        }}
      />

      <Box sx={{ position: 'relative', maxWidth: 1200, mx: 'auto', px: { xs: 2.5, md: 4 } }}>
        <Stack alignItems="center" spacing={2} sx={{ mb: { xs: 4, md: 6 }, textAlign: 'center' }}>
          <Typography
            variant="h2"
            sx={{
              fontSize: { xs: '1.75rem', md: '2.5rem' },
              fontWeight: 700,
              letterSpacing: '-0.02em',
              lineHeight: 1.1,
              maxWidth: 720,
            }}
          >
            {t('appPreview.title')}
          </Typography>
          <Typography variant="body1" sx={{ color: 'text.secondary', maxWidth: 520 }}>
            {t('appPreview.subtitle')}
          </Typography>
        </Stack>

        <Box
          sx={{
            display: 'grid',
            gridTemplateColumns: { xs: '1fr', md: '1.4fr 0.6fr' },
            gap: { xs: 4, md: 5 },
            alignItems: 'center',
          }}
        >
          {/* Browser frame */}
          <Box sx={{ position: 'relative', display: { xs: 'none', md: 'block' } }}>
            <BrowserFrame url="pawly.app/karta-pre-veterinara">
              <DesktopPreview />
            </BrowserFrame>
            {/* Floating "Po termíne" badge */}
            <Box
              sx={{
                position: 'absolute',
                bottom: { xs: -16, md: -24 },
                left: { xs: 12, md: -24 },
                bgcolor: 'background.paper',
                borderRadius: 3,
                p: 1.25,
                pr: 2,
                display: 'flex',
                alignItems: 'center',
                gap: 1.25,
                boxShadow: `0 10px 28px ${alpha(theme.palette.primary.main, 0.18)}`,
                border: `1px solid ${theme.palette.divider}`,
              }}
            >
              <Box
                sx={{
                  width: 32,
                  height: 32,
                  borderRadius: '50%',
                  bgcolor: alpha(theme.palette.error.main, 0.16),
                  color: 'error.main',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <ErrorIcon sx={{ fontSize: 18 }} />
              </Box>
              <Stack>
                <Typography
                  variant="caption"
                  sx={{ color: 'text.secondary', fontSize: '0.62rem', letterSpacing: '0.08em' }}
                >
                  {t('appPreview.overdueBadge')}
                </Typography>
                <Typography sx={{ fontWeight: 700, color: 'error.main', fontSize: '0.8rem' }}>
                  {t('appPreview.overdueDetail')}
                </Typography>
              </Stack>
            </Box>
          </Box>

          {/* Phone frame */}
          <Box sx={{ display: 'flex', justifyContent: 'center', position: 'relative' }}>
            <PhoneFrame>
              <MobilePreview />
            </PhoneFrame>
            {/* Floating check */}
            <Box
              sx={{
                position: 'absolute',
                top: { xs: -16, md: 32 },
                right: { xs: 8, md: -16 },
                bgcolor: 'background.paper',
                borderRadius: 3,
                p: 1,
                pr: 1.5,
                display: 'flex',
                alignItems: 'center',
                gap: 1,
                boxShadow: `0 8px 20px ${alpha(theme.palette.primary.main, 0.15)}`,
                border: `1px solid ${theme.palette.divider}`,
              }}
            >
              <CheckIcon sx={{ fontSize: 18, color: 'success.main' }} />
              <Typography sx={{ fontSize: '0.72rem', fontWeight: 700 }}>
                {t('appPreview.syncBadge')}
              </Typography>
            </Box>
          </Box>
        </Box>
      </Box>
    </Box>
  );
}
