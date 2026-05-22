import { useEffect, useRef, useState } from 'react';
import {
  Box,
  Button,
  Chip,
  Stack,
  Typography,
  alpha,
  useMediaQuery,
  useTheme,
} from '@mui/material';
import {
  ArrowForward as ArrowIcon,
  AutoAwesome as SparkleIcon,
  PlayCircleOutline as PlayIcon,
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';

const HERO_PHOTO =
  'https://images.unsplash.com/photo-1543466835-00a7907e9de1?auto=format&fit=crop&w=900&q=80';

export default function LandingHero() {
  const theme = useTheme();
  const navigate = useNavigate();
  const isDark = theme.palette.mode === 'dark';
  const supportsHover = useMediaQuery('(hover: hover) and (pointer: fine)');
  const [mouse, setMouse] = useState({ x: 0, y: 0 });
  const rafRef = useRef(0);

  useEffect(() => {
    if (!supportsHover) return;
    const onMove = (e: MouseEvent) => {
      cancelAnimationFrame(rafRef.current);
      rafRef.current = requestAnimationFrame(() => {
        const cx = window.innerWidth / 2;
        const cy = window.innerHeight / 2;
        setMouse({ x: e.clientX - cx, y: e.clientY - cy });
      });
    };
    window.addEventListener('mousemove', onMove);
    return () => {
      window.removeEventListener('mousemove', onMove);
      cancelAnimationFrame(rafRef.current);
    };
  }, [supportsHover]);

  const scrollTo = (id: string) => {
    const el = document.getElementById(id);
    if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  return (
    <Box
      sx={{
        position: 'relative',
        overflow: 'hidden',
        pt: { xs: 8, md: 12 },
        pb: { xs: 8, md: 14 },
      }}
    >
      {/* decorative paw SVG */}
      <Box
        component="svg"
        viewBox="0 0 200 200"
        sx={{
          position: 'absolute',
          top: { xs: 20, md: 80 },
          right: { xs: -40, md: '8%' },
          width: { xs: 120, md: 200 },
          opacity: isDark ? 0.06 : 0.08,
          pointerEvents: 'none',
          transform: supportsHover
            ? `translate3d(${mouse.x / 28}px, ${mouse.y / 28}px, 0)`
            : undefined,
          transition: supportsHover ? 'transform 600ms cubic-bezier(0.2, 0.8, 0.2, 1)' : undefined,
          animation: supportsHover ? undefined : 'pawport-float 7s ease-in-out infinite',
          '@keyframes pawport-float': {
            '0%, 100%': { transform: 'translateY(0) rotate(0deg)' },
            '50%': { transform: 'translateY(-12px) rotate(-3deg)' },
          },
        }}
      >
        <circle cx="50" cy="60" r="18" fill={theme.palette.primary.main} />
        <circle cx="100" cy="40" r="22" fill={theme.palette.primary.main} />
        <circle cx="150" cy="60" r="18" fill={theme.palette.primary.main} />
        <circle cx="70" cy="100" r="14" fill={theme.palette.primary.main} />
        <ellipse cx="100" cy="140" rx="42" ry="32" fill={theme.palette.primary.main} />
        <circle cx="130" cy="100" r="14" fill={theme.palette.primary.main} />
      </Box>

      {/* second decorative paw bottom-left */}
      <Box
        component="svg"
        viewBox="0 0 200 200"
        sx={{
          position: 'absolute',
          bottom: { xs: -40, md: '8%' },
          left: { xs: -50, md: '4%' },
          width: { xs: 90, md: 140 },
          opacity: isDark ? 0.05 : 0.06,
          pointerEvents: 'none',
          transform: supportsHover
            ? `translate3d(${-mouse.x / 22}px, ${-mouse.y / 22}px, 0) rotate(-12deg)`
            : undefined,
          transition: supportsHover ? 'transform 700ms cubic-bezier(0.2, 0.8, 0.2, 1)' : undefined,
          animation: supportsHover ? undefined : 'pawport-float-alt 9s ease-in-out infinite',
          '@keyframes pawport-float-alt': {
            '0%, 100%': { transform: 'translateY(0) rotate(-12deg)' },
            '50%': { transform: 'translateY(10px) rotate(-18deg)' },
          },
        }}
      >
        <circle cx="50" cy="60" r="18" fill={theme.palette.secondary.main} />
        <circle cx="100" cy="40" r="22" fill={theme.palette.secondary.main} />
        <circle cx="150" cy="60" r="18" fill={theme.palette.secondary.main} />
        <circle cx="70" cy="100" r="14" fill={theme.palette.secondary.main} />
        <ellipse cx="100" cy="140" rx="42" ry="32" fill={theme.palette.secondary.main} />
        <circle cx="130" cy="100" r="14" fill={theme.palette.secondary.main} />
      </Box>

      <Box sx={{ maxWidth: 1200, mx: 'auto', px: { xs: 2.5, md: 4 } }}>
        <Box
          sx={{
            display: 'grid',
            gridTemplateColumns: { xs: '1fr', md: '1.1fr 0.9fr' },
            gap: { xs: 4, md: 6 },
            alignItems: 'center',
          }}
        >
          {/* Left: text + CTAs */}
          <Stack spacing={3}>
            <Chip
              icon={<SparkleIcon sx={{ fontSize: 16 }} />}
              label="Pre psy, mačky a ďalšie domáce zvieratá"
              size="small"
              sx={{
                alignSelf: 'flex-start',
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
                fontSize: { xs: '2.25rem', sm: '2.75rem', md: '3.5rem' },
                fontWeight: 700,
                lineHeight: 1.05,
                letterSpacing: '-0.025em',
              }}
            >
              Zdravie tvojho miláčika,{' '}
              <Box
                component="span"
                sx={{
                  background: `linear-gradient(135deg, ${theme.palette.primary.main}, ${theme.palette.primary.light})`,
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  backgroundClip: 'text',
                }}
              >
                vždy po ruke
              </Box>
            </Typography>
            <Typography
              variant="body1"
              sx={{
                color: 'text.secondary',
                fontSize: { xs: '1rem', md: '1.15rem' },
                maxWidth: 540,
              }}
            >
              Digitálny zdravotný pas pre psy, mačky a ďalšie domáce zvieratá. AI analýza krmiva a
              karta pre veterinára na jednom mieste. Nikdy nezabudni na očkovanie, odčervenie ani
              kontrolu.
            </Typography>
            <Stack direction={{ xs: 'column', sm: 'row' }} gap={1.5}>
              <Button
                variant="contained"
                size="large"
                endIcon={<ArrowIcon />}
                onClick={() => navigate('/analyza')}
                sx={{
                  px: 3,
                  py: 1.25,
                  fontSize: '1rem',
                  boxShadow: `0 8px 24px ${alpha(theme.palette.primary.main, 0.35)}`,
                }}
              >
                Začať zadarmo
              </Button>
              <Button
                variant="text"
                size="large"
                startIcon={<PlayIcon />}
                onClick={() => scrollTo('how-it-works')}
                sx={{ px: 2 }}
              >
                Ako to funguje
              </Button>
            </Stack>
            <Stack direction="row" gap={3} sx={{ pt: 1, flexWrap: 'wrap' }}>
              <Stack>
                <Typography sx={{ fontSize: '1.5rem', fontWeight: 700, color: 'primary.main' }}>
                  100%
                </Typography>
                <Typography
                  variant="caption"
                  sx={{ color: 'text.secondary', textTransform: 'none', letterSpacing: 0 }}
                >
                  Zadarmo
                </Typography>
              </Stack>
              <Stack>
                <Typography sx={{ fontSize: '1.5rem', fontWeight: 700, color: 'primary.main' }}>
                  AI
                </Typography>
                <Typography
                  variant="caption"
                  sx={{ color: 'text.secondary', textTransform: 'none', letterSpacing: 0 }}
                >
                  Skenovanie pasu
                </Typography>
              </Stack>
              <Stack>
                <Typography sx={{ fontSize: '1.5rem', fontWeight: 700, color: 'primary.main' }}>
                  PWA
                </Typography>
                <Typography
                  variant="caption"
                  sx={{ color: 'text.secondary', textTransform: 'none', letterSpacing: 0 }}
                >
                  Offline-ready
                </Typography>
              </Stack>
            </Stack>
          </Stack>

          {/* Right: photo */}
          <Box sx={{ position: 'relative' }}>
            <Box
              sx={{
                position: 'absolute',
                inset: -20,
                background: `radial-gradient(circle, ${alpha(theme.palette.primary.main, 0.2)} 0%, transparent 70%)`,
                filter: 'blur(40px)',
                pointerEvents: 'none',
              }}
            />
            <Box
              component="img"
              src={HERO_PHOTO}
              alt="Zlatý retriever sa pozerá do kamery"
              loading="eager"
              sx={{
                position: 'relative',
                width: '100%',
                aspectRatio: '4 / 5',
                objectFit: 'cover',
                borderRadius: 6,
                boxShadow: isDark
                  ? '0 30px 60px rgba(0,0,0,0.5)'
                  : '0 30px 60px rgba(15,76,92,0.18)',
                border: `4px solid ${theme.palette.background.paper}`,
              }}
            />
            {/* Floating mini-card */}
            <Box
              sx={{
                position: 'absolute',
                bottom: { xs: -20, md: 24 },
                left: { xs: 12, md: -32 },
                bgcolor: 'background.paper',
                borderRadius: 4,
                p: 1.5,
                pr: 2,
                display: 'flex',
                alignItems: 'center',
                gap: 1.5,
                boxShadow: '0 12px 32px rgba(15,76,92,0.18)',
                border: `1px solid ${theme.palette.divider}`,
              }}
            >
              <Box
                sx={{
                  width: 40,
                  height: 40,
                  borderRadius: '50%',
                  bgcolor: alpha(theme.palette.success.main, 0.16),
                  color: 'success.main',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontWeight: 700,
                }}
              >
                ✓
              </Box>
              <Stack>
                <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                  Očkovanie
                </Typography>
                <Typography variant="body2" sx={{ fontWeight: 700 }}>
                  Platné do 23. 6. 2026
                </Typography>
              </Stack>
            </Box>
          </Box>
        </Box>
      </Box>
    </Box>
  );
}
