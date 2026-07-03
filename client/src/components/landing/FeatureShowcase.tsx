import { useEffect, useState } from 'react';
import {
  Box,
  ButtonBase,
  Chip,
  Stack,
  Typography,
  alpha,
  useMediaQuery,
  useTheme,
} from '@mui/material';
import {
  AutoAwesome as AiIcon,
  Description as DocIcon,
  HealthAndSafety as PassportIcon,
  NotificationsActive as ReminderIcon,
  PictureAsPdf as PdfIcon,
} from '@mui/icons-material';
import { useTranslation } from 'react-i18next';
import type { Theme } from '@mui/material/styles';
import { useInView } from '../../hooks/useInView';

const AUTOPLAY_MS = 4200;
const FEATURE_ICONS = [PassportIcon, AiIcon, ReminderIcon, PdfIcon];

type Tone = 'primary' | 'success' | 'warning' | 'error';

interface FeatureItem {
  title: string;
  text: string;
}

interface PreviewRow {
  label: string;
  value?: string;
  date?: string;
  tone: Tone;
}

interface Props {
  id: string;
}

function toneColor(tone: Tone, theme: Theme) {
  return theme.palette[tone].main;
}

function PassportPreview() {
  const theme = useTheme();
  const { t } = useTranslation('landing');
  const rows = t('showcase.preview.passport.rows', { returnObjects: true }) as PreviewRow[];

  return (
    <Stack spacing={1.5} sx={{ width: '100%' }}>
      <Typography variant="overline" sx={{ color: 'text.secondary' }}>
        {t('showcase.preview.passport.heading')}
      </Typography>
      {rows.map((row, i) => (
        <Stack key={row.label} direction="row" alignItems="center" gap={1.5}>
          <Stack alignItems="center" sx={{ width: 16 }}>
            <Box
              sx={{
                width: 10,
                height: 10,
                borderRadius: '50%',
                bgcolor: toneColor(row.tone, theme),
              }}
            />
            {i < rows.length - 1 && (
              <Box sx={{ width: '2px', height: 22, bgcolor: 'divider', mt: 0.5 }} />
            )}
          </Stack>
          <Box
            sx={{
              flex: 1,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              gap: 1,
              p: 1.25,
              borderRadius: 3,
              bgcolor: alpha(
                toneColor(row.tone, theme),
                theme.palette.mode === 'dark' ? 0.1 : 0.06
              ),
            }}
          >
            <Typography variant="body2" sx={{ fontWeight: 600 }} noWrap>
              {row.label}
            </Typography>
            <Typography variant="body2" sx={{ color: 'text.secondary', flexShrink: 0 }}>
              {row.date}
            </Typography>
          </Box>
        </Stack>
      ))}
    </Stack>
  );
}

function FoodPreview() {
  const theme = useTheme();
  const { t } = useTranslation('landing');
  const chips = t('showcase.preview.food.chips', { returnObjects: true }) as string[];

  return (
    <Stack spacing={2} alignItems="center" sx={{ width: '100%' }}>
      <Typography variant="overline" sx={{ color: 'text.secondary' }}>
        {t('showcase.preview.food.heading')}
      </Typography>
      <Box
        sx={{
          width: 116,
          height: 116,
          borderRadius: '50%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          background: `conic-gradient(${theme.palette.success.main} 0 87%, ${alpha(
            theme.palette.success.main,
            0.15
          )} 87% 100%)`,
        }}
      >
        <Box
          sx={{
            width: 92,
            height: 92,
            borderRadius: '50%',
            bgcolor: 'background.paper',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <Typography variant="h3" sx={{ color: 'success.main', lineHeight: 1 }}>
            87
          </Typography>
          <Typography variant="body2" sx={{ color: 'text.secondary' }}>
            /100
          </Typography>
        </Box>
      </Box>
      <Typography variant="body2" sx={{ fontWeight: 600 }}>
        {t('showcase.preview.food.verdict')}
      </Typography>
      <Stack direction="row" gap={1} sx={{ flexWrap: 'wrap', justifyContent: 'center' }}>
        {chips.map((chip) => (
          <Chip
            key={chip}
            label={chip}
            size="small"
            sx={{
              bgcolor: alpha(theme.palette.success.main, 0.12),
              color: 'success.main',
              fontWeight: 600,
            }}
          />
        ))}
      </Stack>
    </Stack>
  );
}

function RemindersPreview() {
  const theme = useTheme();
  const { t } = useTranslation('landing');
  const rows = t('showcase.preview.reminders.rows', { returnObjects: true }) as PreviewRow[];

  return (
    <Stack spacing={1.5} sx={{ width: '100%' }}>
      <Typography variant="overline" sx={{ color: 'text.secondary' }}>
        {t('showcase.preview.reminders.heading')}
      </Typography>
      {rows.map((row) => (
        <Stack
          key={row.label}
          direction="row"
          alignItems="center"
          justifyContent="space-between"
          gap={1}
          sx={{
            p: 1.5,
            borderRadius: 3,
            border: `1px solid ${theme.palette.divider}`,
            bgcolor: 'background.paper',
          }}
        >
          <Stack direction="row" alignItems="center" gap={1.25} sx={{ minWidth: 0 }}>
            <ReminderIcon sx={{ fontSize: 18, color: toneColor(row.tone, theme) }} />
            <Typography variant="body2" sx={{ fontWeight: 600 }} noWrap>
              {row.label}
            </Typography>
          </Stack>
          <Chip
            label={row.value}
            size="small"
            sx={{
              flexShrink: 0,
              bgcolor: alpha(toneColor(row.tone, theme), 0.12),
              color: toneColor(row.tone, theme),
              fontWeight: 600,
            }}
          />
        </Stack>
      ))}
    </Stack>
  );
}

function VetCardPreview() {
  const theme = useTheme();
  const { t } = useTranslation('landing');

  return (
    <Stack spacing={2} alignItems="center" sx={{ width: '100%' }}>
      <Typography variant="overline" sx={{ color: 'text.secondary' }}>
        {t('showcase.preview.vetcard.heading')}
      </Typography>
      <Box
        sx={{
          position: 'relative',
          width: 180,
          borderRadius: 2,
          border: `1px solid ${theme.palette.divider}`,
          bgcolor: 'background.paper',
          p: 2,
          boxShadow: `0 12px 32px ${alpha(theme.palette.primary.main, 0.12)}`,
        }}
      >
        <Stack direction="row" alignItems="center" gap={1} sx={{ mb: 1.5 }}>
          <DocIcon sx={{ fontSize: 18, color: 'primary.main' }} />
          <Box
            sx={{
              height: 8,
              flex: 1,
              borderRadius: 999,
              bgcolor: alpha(theme.palette.primary.main, 0.25),
            }}
          />
        </Stack>
        <Stack spacing={1}>
          {[85, 100, 70, 92, 60].map((w, i) => (
            <Box
              key={i}
              sx={{
                height: 6,
                width: `${w}%`,
                borderRadius: 999,
                bgcolor: alpha(theme.palette.text.primary, 0.12),
              }}
            />
          ))}
        </Stack>
        <Chip
          icon={<PdfIcon sx={{ fontSize: 14 }} />}
          label="PDF"
          size="small"
          sx={{
            position: 'absolute',
            bottom: theme.spacing(-1.5),
            right: theme.spacing(-1.5),
            bgcolor: 'secondary.main',
            color: 'secondary.contrastText',
            fontWeight: 700,
            '& .MuiChip-icon': { color: 'inherit' },
          }}
        />
      </Box>
      <Typography variant="body2" sx={{ color: 'text.secondary', textAlign: 'center' }}>
        {t('showcase.preview.vetcard.hint')}
      </Typography>
    </Stack>
  );
}

const PREVIEWS = [PassportPreview, FoodPreview, RemindersPreview, VetCardPreview];

export default function FeatureShowcase({ id }: Props) {
  const theme = useTheme();
  const { t } = useTranslation('landing');
  const reducedMotion = useMediaQuery('(prefers-reduced-motion: reduce)');
  const [sectionRef, inView] = useInView<HTMLDivElement>({ threshold: 0.3, once: false });
  const [active, setActive] = useState(0);
  const [autoplay, setAutoplay] = useState(true);
  const [hovered, setHovered] = useState(false);

  const items = t('showcase.items', { returnObjects: true }) as FeatureItem[];
  const autoplayRunning = autoplay && inView && !hovered && !reducedMotion;

  useEffect(() => {
    if (!autoplayRunning) return;
    const timer = window.setInterval(
      () => setActive((prev) => (prev + 1) % PREVIEWS.length),
      AUTOPLAY_MS
    );
    return () => window.clearInterval(timer);
  }, [autoplayRunning]);

  const selectItem = (index: number) => {
    setActive(index);
    setAutoplay(false);
  };

  return (
    <Box
      id={id}
      ref={sectionRef}
      sx={{ py: { xs: 8, md: 12 }, px: { xs: 2.5, md: 4 }, scrollMarginTop: theme.spacing(10) }}
    >
      <Box sx={{ maxWidth: 1080, mx: 'auto' }}>
        <Stack spacing={1.5} alignItems="center" sx={{ textAlign: 'center', mb: { xs: 4, md: 6 } }}>
          <Typography
            variant="h2"
            sx={{
              fontSize: { xs: '1.75rem', md: '2.5rem' },
              fontWeight: 700,
              letterSpacing: '-0.02em',
            }}
          >
            {t('showcase.title')}
          </Typography>
          <Typography variant="body1" sx={{ color: 'text.secondary', maxWidth: 520 }}>
            {t('showcase.subtitle')}
          </Typography>
        </Stack>

        <Box
          sx={{
            display: 'grid',
            gridTemplateColumns: { xs: '1fr', md: '5fr 7fr' },
            gap: { xs: 3, md: 5 },
            alignItems: 'stretch',
          }}
          onMouseEnter={() => setHovered(true)}
          onMouseLeave={() => setHovered(false)}
        >
          <Stack spacing={1.25}>
            {items.map((item, i) => {
              const ItemIcon = FEATURE_ICONS[i] ?? PassportIcon;
              const isActive = i === active;
              return (
                <ButtonBase
                  key={item.title}
                  onClick={() => selectItem(i)}
                  aria-pressed={isActive}
                  sx={{
                    display: 'flex',
                    alignItems: 'flex-start',
                    gap: 1.75,
                    textAlign: 'left',
                    p: 2,
                    borderRadius: 4,
                    border: `1px solid ${isActive ? alpha(theme.palette.primary.main, 0.35) : 'transparent'}`,
                    bgcolor: isActive ? alpha(theme.palette.primary.main, 0.06) : 'transparent',
                    transition: 'background-color 220ms ease, border-color 220ms ease',
                    '&:hover': {
                      bgcolor: alpha(theme.palette.primary.main, isActive ? 0.08 : 0.04),
                    },
                  }}
                >
                  <Box
                    sx={{
                      width: 40,
                      height: 40,
                      borderRadius: 3,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      flexShrink: 0,
                      color: isActive ? 'primary.contrastText' : 'primary.main',
                      bgcolor: isActive ? 'primary.main' : alpha(theme.palette.primary.main, 0.1),
                      transition: 'background-color 220ms ease, color 220ms ease',
                    }}
                  >
                    <ItemIcon sx={{ fontSize: 20 }} />
                  </Box>
                  <Stack spacing={0.5} sx={{ flex: 1, minWidth: 0 }}>
                    <Typography variant="subtitle1" sx={{ lineHeight: 1.3 }}>
                      {item.title}
                    </Typography>
                    <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                      {item.text}
                    </Typography>
                    {isActive && autoplayRunning && (
                      <Box
                        sx={{
                          mt: 0.75,
                          height: theme.spacing(0.375),
                          borderRadius: 999,
                          bgcolor: alpha(theme.palette.primary.main, 0.15),
                          overflow: 'hidden',
                        }}
                      >
                        <Box
                          key={active}
                          sx={{
                            height: '100%',
                            borderRadius: 999,
                            bgcolor: 'primary.main',
                            animation: `pawly-showcase-progress ${AUTOPLAY_MS}ms linear`,
                            '@keyframes pawly-showcase-progress': {
                              from: { width: '0%' },
                              to: { width: '100%' },
                            },
                          }}
                        />
                      </Box>
                    )}
                  </Stack>
                </ButtonBase>
              );
            })}
          </Stack>

          <Box
            sx={{
              position: 'relative',
              minHeight: { xs: 320, md: 380 },
              borderRadius: 5,
              border: `1px solid ${theme.palette.divider}`,
              bgcolor: alpha(
                theme.palette.background.paper,
                theme.palette.mode === 'dark' ? 0.6 : 0.7
              ),
              overflow: 'hidden',
            }}
          >
            <Box
              aria-hidden
              sx={{
                position: 'absolute',
                inset: 0,
                background: `radial-gradient(500px circle at 80% 0%, ${alpha(
                  theme.palette.primary.main,
                  theme.palette.mode === 'dark' ? 0.12 : 0.07
                )}, transparent 60%)`,
                pointerEvents: 'none',
              }}
            />
            {PREVIEWS.map((Preview, i) => (
              <Box
                key={i}
                aria-hidden={i !== active}
                sx={{
                  position: 'absolute',
                  inset: 0,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  p: { xs: 3, md: 5 },
                  opacity: i === active ? 1 : 0,
                  transform: i === active || reducedMotion ? 'translateY(0)' : 'translateY(12px)',
                  transition: 'opacity 360ms ease, transform 360ms ease',
                  pointerEvents: i === active ? 'auto' : 'none',
                }}
              >
                <Box sx={{ width: '100%', maxWidth: 380 }}>
                  <Preview />
                </Box>
              </Box>
            ))}
          </Box>
        </Box>
      </Box>
    </Box>
  );
}
