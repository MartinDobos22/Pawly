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

const rand = (min: number, max: number) => min + Math.random() * (max - min);

// Build a quadruped walking trail that randomly meanders across the whole screen.
// Each stride the "walker" turns by a random heading, so the path wanders left/right
// organically (different on every load) instead of a straight central line.
function generatePaws(strides: number): Paw[] {
  const paws: Paw[] = [];
  const totalSteps = strides * 4;

  // Random-walk centre across the page width + a heading that controls foot offset dir.
  let center = rand(20, 80);
  let heading = rand(-1, 1); // -1 = walking left, +1 = walking right
  let topCursor = rand(2, 6);

  for (let s = 0; s < strides; s++) {
    // turn a bit each stride (random meander), keep inside margins
    heading += rand(-0.6, 0.6);
    heading = Math.max(-1.2, Math.min(1.2, heading));
    center += heading * rand(6, 14);
    if (center < 14) {
      center = 14;
      heading = Math.abs(heading);
    }
    if (center > 86) {
      center = 86;
      heading = -Math.abs(heading);
    }

    // perpendicular axis for left/right foot offset (so feet straddle the heading line)
    const perpSign = heading >= 0 ? 1 : -1;

    STEP_ORDER.forEach((step, k) => {
      const order = s * 4 + k;
      // advance vertical cursor per step (irregular spacing → organic)
      topCursor += rand(1.4, 2.8);
      const topPct = Math.min(97, topCursor);
      const isLeft = step === 'LF' || step === 'LH';
      const isFront = step === 'LF' || step === 'RF';
      const sideOffset = (isLeft ? -1 : 1) * perpSign * (isFront ? 5 : 6.5);
      const leftPct = center + sideOffset + rand(-2, 2);
      paws.push({
        topPct,
        leftPct: Math.max(5, Math.min(92, leftPct)),
        rotate: heading * 22 + (isLeft ? -8 : 8) + rand(-6, 6),
        mirror: !isLeft,
        scale: (isFront ? 0.82 : 1) * rand(0.9, 1.1),
        accent: Math.random() < 0.25 && isFront,
        order,
      });
    });
  }
  // normalise topPct span so the trail still covers most of the page height
  const maxTop = paws[paws.length - 1].topPct;
  const scaleTop = maxTop > 0 ? 95 / maxTop : 1;
  paws.forEach((p) => {
    p.topPct = 3 + p.topPct * scaleTop * 0.95;
  });
  void totalSteps;
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
