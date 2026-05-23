import { useEffect, useRef, useState } from 'react';
import { Box, useMediaQuery, useTheme } from '@mui/material';

type Step = 'LF' | 'RH' | 'RF' | 'LH';
const STEP_ORDER: Step[] = ['LF', 'RH', 'RF', 'LH'];

interface Paw {
  topPct: number;
  leftPct: number;
  rotate: number;
  mirror: boolean;
  scale: number;
  accent: boolean;
  order: number; // sequence index for gait reveal
}

// Build a quadruped walking trail: repeating LF → RH → RF → LH gait down the page.
function generatePaws(strides: number): Paw[] {
  const paws: Paw[] = [];
  const totalSteps = strides * 4;
  // horizontal center wanders very gently so the walk feels alive but stays a line
  for (let s = 0; s < strides; s++) {
    const strideT = strides > 1 ? s / (strides - 1) : 0;
    const centerDrift = Math.sin(strideT * Math.PI * 1.5) * 10; // -10..10
    STEP_ORDER.forEach((step, k) => {
      const order = s * 4 + k;
      const t = order / (totalSteps - 1);
      // vertical position spread across the page
      const topPct = 4 + t * 92;
      const isLeft = step === 'LF' || step === 'LH';
      const isFront = step === 'LF' || step === 'RF';
      // left/right foot offset from the walking line
      const sideOffset = isLeft ? -6 : 6;
      // front feet land slightly narrower than hind
      const widthFactor = isFront ? 0.85 : 1.05;
      const leftPct = 50 + centerDrift + sideOffset * widthFactor;
      paws.push({
        topPct,
        leftPct: Math.max(6, Math.min(90, leftPct)),
        rotate: (isLeft ? -10 : 10) + centerDrift * 0.4,
        mirror: !isLeft,
        scale: (isFront ? 0.82 : 1) * (0.95 + (s % 2) * 0.08),
        accent: s % 3 === 0 && isFront,
        order,
      });
    });
  }
  return paws;
}

const PawShape = ({ color }: { color: string }) => (
  <svg viewBox="0 0 100 100" width="100%" height="100%" aria-hidden>
    <ellipse cx="50" cy="64" rx="26" ry="22" fill={color} />
    <circle cx="26" cy="36" r="9" fill={color} />
    <circle cx="44" cy="24" r="10" fill={color} />
    <circle cx="62" cy="24" r="10" fill={color} />
    <circle cx="78" cy="38" r="9" fill={color} />
  </svg>
);

export default function PawTrail() {
  const theme = useTheme();
  const isDark = theme.palette.mode === 'dark';
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const reducedMotion = useMediaQuery('(prefers-reduced-motion: reduce)');

  const strides = isMobile ? 7 : 11;
  const pawCount = strides * 4;
  const pawsRef = useRef<Paw[]>(generatePaws(strides));
  const [progress, setProgress] = useState(0);
  const rafRef = useRef(0);

  useEffect(() => {
    pawsRef.current = generatePaws(strides);
  }, [strides]);

  useEffect(() => {
    if (reducedMotion) {
      setProgress(1);
      return;
    }
    const onScroll = () => {
      cancelAnimationFrame(rafRef.current);
      rafRef.current = requestAnimationFrame(() => {
        const max = document.documentElement.scrollHeight - window.innerHeight;
        const p = max > 0 ? window.scrollY / max : 0;
        setProgress(Math.max(0, Math.min(1, p)));
      });
    };
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onScroll);
    return () => {
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('resize', onScroll);
      cancelAnimationFrame(rafRef.current);
    };
  }, [reducedMotion]);

  const primary = theme.palette.primary.main;
  const secondary = theme.palette.secondary.main;
  const baseOpacity = isDark ? 0.22 : 0.3;

  const walkPct = progress * 100;

  return (
    <Box
      aria-hidden
      data-paw-trail
      sx={{
        position: 'absolute',
        inset: 0,
        zIndex: 0,
        overflow: 'hidden',
        pointerEvents: 'none',
      }}
    >
      {pawsRef.current.map((paw, i) => {
        const pawProgressPos = (paw.order / (pawCount - 1)) * 100;
        // Proximity spotlight: paws near the current scroll position are visible and
        // fade out the further they are — in BOTH directions. Scroll up or down and
        // a moving cluster of footsteps follows you, appearing & fading dynamically.
        const d = Math.abs(pawProgressPos - walkPct);
        const band = 16; // fully visible within ±16% of scroll progress
        const falloff = 24; // fade over the next 24%
        let vis: number;
        if (reducedMotion) {
          vis = 1;
        } else if (d <= band) {
          vis = 1;
        } else {
          vis = Math.max(0, 1 - (d - band) / falloff);
        }
        const opacity = baseOpacity * vis;
        const pop = 0.7 + 0.3 * vis;
        const settle = (1 - vis) * 6;

        return (
          <Box
            key={i}
            sx={{
              position: 'absolute',
              top: `${paw.topPct}%`,
              left: `${paw.leftPct}%`,
              width: { xs: 26, md: 38 },
              height: { xs: 26, md: 38 },
              opacity,
              transform: `translate(-50%, ${settle}px) rotate(${paw.rotate}deg) scaleX(${paw.mirror ? -1 : 1}) scale(${paw.scale * pop})`,
              transition:
                'opacity 220ms ease-out, transform 220ms cubic-bezier(0.34, 1.56, 0.64, 1)',
              willChange: 'opacity, transform',
            }}
          >
            <PawShape color={paw.accent ? secondary : primary} />
          </Box>
        );
      })}
    </Box>
  );
}
