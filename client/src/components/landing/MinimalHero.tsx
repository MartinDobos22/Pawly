import { useEffect, useRef, useState, type MouseEvent as ReactMouseEvent } from 'react';
import {
  Box,
  Button,
  Chip,
  IconButton,
  Stack,
  Typography,
  alpha,
  useMediaQuery,
  useTheme,
} from '@mui/material';
import {
  ArrowForward as ArrowIcon,
  AutoAwesome as SparkleIcon,
  CheckCircleOutline as CheckIcon,
  EventAvailable as EventIcon,
  KeyboardArrowDown as ScrollIcon,
  Pets as PetsIcon,
  RestaurantMenu as FoodIcon,
  Vaccines as VaccineIcon,
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

const WORD_INTERVAL_MS = 2800;
const TILT_MAX_DEG = 9;

interface Props {
  scrollTargetId: string;
}

function RotatingWord({ words }: { words: string[] }) {
  const theme = useTheme();
  const [index, setIndex] = useState(0);
  const reducedMotion = useMediaQuery('(prefers-reduced-motion: reduce)');

  useEffect(() => {
    if (words.length < 2) return;
    const timer = window.setInterval(
      () => setIndex((prev) => (prev + 1) % words.length),
      WORD_INTERVAL_MS
    );
    return () => window.clearInterval(timer);
  }, [words.length]);

  return (
    <Box
      component="span"
      sx={{
        display: 'inline-grid',
        verticalAlign: 'top',
        '@keyframes pawly-word-in': {
          from: { opacity: 0, transform: reducedMotion ? 'none' : 'translateY(0.45em)' },
          to: { opacity: 1, transform: 'translateY(0)' },
        },
      }}
    >
      {words.map((word, i) => (
        <Box
          key={word}
          component="span"
          aria-hidden={i !== index}
          sx={{
            gridArea: '1 / 1',
            whiteSpace: 'nowrap',
            visibility: i === index ? 'visible' : 'hidden',
            animation: i === index ? 'pawly-word-in 480ms cubic-bezier(0.2, 0.8, 0.2, 1)' : 'none',
            background: `linear-gradient(120deg, ${theme.palette.primary.main}, ${theme.palette.primary.light} 60%, ${theme.palette.secondary.main} 140%)`,
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            backgroundClip: 'text',
          }}
        >
          {word}
        </Box>
      ))}
    </Box>
  );
}

function TiltPassportCard() {
  const theme = useTheme();
  const { t } = useTranslation('landing');
  const cardRef = useRef<HTMLDivElement | null>(null);
  const rafRef = useRef(0);
  const supportsHover = useMediaQuery('(hover: hover) and (pointer: fine)');
  const reducedMotion = useMediaQuery('(prefers-reduced-motion: reduce)');
  const interactive = supportsHover && !reducedMotion;

  useEffect(() => () => cancelAnimationFrame(rafRef.current), []);

  const handleMove = (e: ReactMouseEvent<HTMLDivElement>) => {
    if (!interactive) return;
    const el = cardRef.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    const px = (e.clientX - rect.left) / rect.width;
    const py = (e.clientY - rect.top) / rect.height;
    cancelAnimationFrame(rafRef.current);
    rafRef.current = requestAnimationFrame(() => {
      el.style.setProperty('--ry', `${(px - 0.5) * 2 * TILT_MAX_DEG}deg`);
      el.style.setProperty('--rx', `${(0.5 - py) * 2 * TILT_MAX_DEG}deg`);
      el.style.setProperty('--gx', `${px * 100}%`);
      el.style.setProperty('--gy', `${py * 100}%`);
    });
  };

  const handleLeave = () => {
    const el = cardRef.current;
    if (!el) return;
    cancelAnimationFrame(rafRef.current);
    el.style.setProperty('--rx', '0deg');
    el.style.setProperty('--ry', '0deg');
  };

  const rows = [
    {
      icon: VaccineIcon,
      tone: 'success' as const,
      label: t('hero.card.vaccination'),
      value: t('hero.card.vaccinationValue'),
    },
    {
      icon: EventIcon,
      tone: 'warning' as const,
      label: t('hero.card.deworming'),
      value: t('hero.card.dewormingValue'),
    },
    {
      icon: FoodIcon,
      tone: 'primary' as const,
      label: t('hero.card.food'),
      value: t('hero.card.foodValue'),
    },
  ];

  return (
    <Box
      sx={{
        position: 'relative',
        width: '100%',
        maxWidth: 400,
        mx: 'auto',
        perspective: '1000px',
      }}
    >
      <Box
        sx={{
          position: 'absolute',
          inset: theme.spacing(-3),
          background: `radial-gradient(circle, ${alpha(theme.palette.primary.main, 0.22)} 0%, transparent 70%)`,
          filter: 'blur(36px)',
          pointerEvents: 'none',
        }}
      />
      <Box
        ref={cardRef}
        onMouseMove={handleMove}
        onMouseLeave={handleLeave}
        sx={{
          position: 'relative',
          borderRadius: 5,
          p: { xs: 2.5, md: 3 },
          bgcolor: alpha(
            theme.palette.background.paper,
            theme.palette.mode === 'dark' ? 0.8 : 0.85
          ),
          backdropFilter: 'blur(12px)',
          border: `1px solid ${alpha(theme.palette.primary.main, 0.18)}`,
          boxShadow: `0 24px 60px ${alpha(
            theme.palette.mode === 'dark' ? theme.palette.common.black : theme.palette.primary.main,
            theme.palette.mode === 'dark' ? 0.45 : 0.16
          )}`,
          transformStyle: 'preserve-3d',
          transform: 'rotateX(var(--rx, 0deg)) rotateY(var(--ry, 0deg))',
          transition: 'transform 240ms cubic-bezier(0.2, 0.8, 0.2, 1)',
          animation: reducedMotion ? 'none' : 'pawly-card-float 7s ease-in-out infinite',
          '@keyframes pawly-card-float': {
            '0%, 100%': { translate: '0 0' },
            '50%': { translate: '0 -10px' },
          },
          '&::after': interactive
            ? {
                content: '""',
                position: 'absolute',
                inset: 0,
                borderRadius: 'inherit',
                background: `radial-gradient(320px circle at var(--gx, 50%) var(--gy, 30%), ${alpha(
                  theme.palette.common.white,
                  theme.palette.mode === 'dark' ? 0.08 : 0.35
                )}, transparent 65%)`,
                pointerEvents: 'none',
              }
            : undefined,
        }}
      >
        <Stack direction="row" alignItems="center" gap={1.5} sx={{ mb: 2.5 }}>
          <Box
            sx={{
              width: 44,
              height: 44,
              borderRadius: '50%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              bgcolor: alpha(theme.palette.primary.main, 0.14),
              color: 'primary.main',
            }}
          >
            <PetsIcon fontSize="small" />
          </Box>
          <Stack sx={{ flex: 1, minWidth: 0 }}>
            <Typography variant="subtitle1" sx={{ lineHeight: 1.2 }}>
              {t('hero.card.petName')}
            </Typography>
            <Typography variant="body2" sx={{ color: 'text.secondary' }}>
              {t('hero.card.petMeta')}
            </Typography>
          </Stack>
          <Chip
            label={t('hero.card.badge')}
            size="small"
            sx={{
              bgcolor: alpha(theme.palette.success.main, 0.14),
              color: 'success.main',
              fontWeight: 600,
            }}
          />
        </Stack>

        <Stack spacing={1.25}>
          {rows.map((row) => {
            const RowIcon = row.icon;
            const tone = theme.palette[row.tone];
            return (
              <Stack
                key={row.label}
                direction="row"
                alignItems="center"
                gap={1.5}
                sx={{
                  p: 1.25,
                  borderRadius: 3,
                  bgcolor: alpha(tone.main, theme.palette.mode === 'dark' ? 0.1 : 0.06),
                }}
              >
                <RowIcon sx={{ fontSize: 20, color: tone.main }} />
                <Typography variant="body2" sx={{ flex: 1, minWidth: 0, fontWeight: 500 }} noWrap>
                  {row.label}
                </Typography>
                <Typography variant="body2" sx={{ fontWeight: 700, color: tone.main }}>
                  {row.value}
                </Typography>
              </Stack>
            );
          })}
        </Stack>

        <Stack direction="row" alignItems="center" gap={1} sx={{ mt: 2.5 }}>
          <Box
            sx={{
              flex: 1,
              height: theme.spacing(0.75),
              borderRadius: 999,
              bgcolor: alpha(theme.palette.primary.main, 0.12),
              overflow: 'hidden',
            }}
          >
            <Box
              sx={{
                width: '87%',
                height: '100%',
                borderRadius: 999,
                background: `linear-gradient(90deg, ${theme.palette.primary.main}, ${theme.palette.primary.light})`,
              }}
            />
          </Box>
          <Typography variant="body2" sx={{ fontWeight: 700, color: 'primary.main' }}>
            87/100
          </Typography>
        </Stack>
      </Box>
    </Box>
  );
}

export default function MinimalHero({ scrollTargetId }: Props) {
  const theme = useTheme();
  const navigate = useNavigate();
  const { t } = useTranslation('landing');
  const sectionRef = useRef<HTMLDivElement | null>(null);
  const ctaRef = useRef<HTMLButtonElement | null>(null);
  const rafRef = useRef(0);
  const supportsHover = useMediaQuery('(hover: hover) and (pointer: fine)');
  const reducedMotion = useMediaQuery('(prefers-reduced-motion: reduce)');
  const interactive = supportsHover && !reducedMotion;

  const rotatingWords = t('hero.rotating', { returnObjects: true }) as string[];

  useEffect(() => () => cancelAnimationFrame(rafRef.current), []);

  const handleSectionMove = (e: ReactMouseEvent<HTMLDivElement>) => {
    if (!interactive) return;
    const el = sectionRef.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    cancelAnimationFrame(rafRef.current);
    rafRef.current = requestAnimationFrame(() => {
      el.style.setProperty('--spot-x', `${x}px`);
      el.style.setProperty('--spot-y', `${y}px`);
    });
  };

  const handleCtaMove = (e: ReactMouseEvent<HTMLButtonElement>) => {
    if (!interactive) return;
    const el = ctaRef.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    const dx = e.clientX - (rect.left + rect.width / 2);
    const dy = e.clientY - (rect.top + rect.height / 2);
    const clamp = (v: number) => Math.max(-6, Math.min(6, v * 0.12));
    el.style.transform = `translate(${clamp(dx)}px, ${clamp(dy)}px)`;
  };

  const handleCtaLeave = () => {
    if (ctaRef.current) ctaRef.current.style.transform = 'translate(0, 0)';
  };

  const scrollToShowcase = () => {
    document.getElementById(scrollTargetId)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  const trustItems = [t('hero.statFree'), t('hero.statAiScan'), t('hero.statOffline')];

  return (
    <Box
      ref={sectionRef}
      onMouseMove={handleSectionMove}
      sx={{
        position: 'relative',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: { md: 'calc(100vh - 64px)' },
        pt: { xs: 8, md: 6 },
        pb: { xs: 8, md: 10 },
        px: { xs: 2.5, md: 4 },
        textAlign: 'center',
        overflow: 'hidden',
      }}
    >
      {interactive && (
        <Box
          aria-hidden
          sx={{
            position: 'absolute',
            inset: 0,
            pointerEvents: 'none',
            background: `radial-gradient(560px circle at var(--spot-x, 50%) var(--spot-y, 30%), ${alpha(
              theme.palette.primary.main,
              theme.palette.mode === 'dark' ? 0.14 : 0.09
            )}, transparent 65%)`,
          }}
        />
      )}

      <Stack spacing={3} alignItems="center" sx={{ position: 'relative', maxWidth: 760 }}>
        <Chip
          icon={<SparkleIcon sx={{ fontSize: 16 }} />}
          label={t('hero.chip')}
          size="small"
          sx={{
            bgcolor: alpha(theme.palette.primary.main, 0.1),
            color: 'primary.main',
            fontWeight: 600,
            border: `1px solid ${alpha(theme.palette.primary.main, 0.25)}`,
            '& .MuiChip-icon': { color: 'inherit' },
          }}
        />
        <Typography
          variant="h1"
          sx={{
            fontSize: { xs: '2.5rem', sm: '3.25rem', md: '4rem' },
            fontWeight: 700,
            lineHeight: 1.08,
            letterSpacing: '-0.03em',
          }}
        >
          {t('hero.title1')}
          <br />
          <RotatingWord words={rotatingWords} />
        </Typography>
        <Typography
          variant="body1"
          sx={{
            color: 'text.secondary',
            fontSize: { xs: '1rem', md: '1.15rem' },
            maxWidth: 560,
          }}
        >
          {t('hero.description')}
        </Typography>
        <Stack direction={{ xs: 'column', sm: 'row' }} gap={1.5} alignItems="center">
          <Button
            ref={ctaRef}
            variant="contained"
            size="large"
            endIcon={<ArrowIcon />}
            onClick={() => navigate('/register')}
            onMouseMove={handleCtaMove}
            onMouseLeave={handleCtaLeave}
            sx={{
              px: 3.5,
              py: 1.25,
              fontSize: '1rem',
              boxShadow: `0 8px 24px ${alpha(theme.palette.primary.main, 0.35)}`,
              transition: 'transform 160ms ease, box-shadow 160ms ease',
              '&:hover': {
                boxShadow: `0 12px 32px ${alpha(theme.palette.primary.main, 0.45)}`,
              },
            }}
          >
            {t('hero.ctaStart')}
          </Button>
          <Button variant="text" size="large" onClick={scrollToShowcase} sx={{ px: 2 }}>
            {t('hero.ctaHowItWorks')}
          </Button>
        </Stack>
        <Stack
          direction="row"
          gap={{ xs: 1.5, sm: 2.5 }}
          sx={{ pt: 0.5, flexWrap: 'wrap', justifyContent: 'center' }}
        >
          {trustItems.map((item) => (
            <Stack key={item} direction="row" alignItems="center" gap={0.75}>
              <CheckIcon sx={{ fontSize: 16, color: 'success.main' }} />
              <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                {item}
              </Typography>
            </Stack>
          ))}
        </Stack>
      </Stack>

      <Box sx={{ position: 'relative', width: '100%', mt: { xs: 6, md: 7 } }}>
        <TiltPassportCard />
      </Box>

      <IconButton
        onClick={scrollToShowcase}
        aria-label={t('hero.scrollCue')}
        sx={{
          mt: { xs: 5, md: 6 },
          color: 'text.secondary',
          animation: reducedMotion ? 'none' : 'pawly-scroll-cue 2.2s ease-in-out infinite',
          '@keyframes pawly-scroll-cue': {
            '0%, 100%': { translate: '0 0', opacity: 0.6 },
            '50%': { translate: '0 6px', opacity: 1 },
          },
        }}
      >
        <ScrollIcon />
      </IconButton>
    </Box>
  );
}
