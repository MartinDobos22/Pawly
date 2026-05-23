import { useEffect, useRef, useState } from 'react';
import { Box, useMediaQuery, useTheme } from '@mui/material';

interface Paw {
  topPct: number;
  leftPct: number;
  rotate: number;
  mirror: boolean;
  scale: number;
  accent: boolean;
}

// Zig-zag walking trail: alternating left/right foot down the page.
function generatePaws(count: number): Paw[] {
  const paws: Paw[] = [];
  for (let i = 0; i < count; i++) {
    const t = i / (count - 1);
    const topPct = 3 + t * 93;
    // walking line drifts gently left-right across the page
    const drift = Math.sin(t * Math.PI * 3) * 26; // -26..26 wave
    const side = i % 2 === 0 ? -5 : 5; // left/right foot offset
    const leftPct = 50 + drift + side;
    paws.push({
      topPct,
      leftPct: Math.max(4, Math.min(92, leftPct)),
      rotate: drift * 0.5 + (i % 2 === 0 ? -6 : 6),
      mirror: i % 2 === 1,
      scale: 0.85 + (i % 3) * 0.12,
      accent: i % 4 === 0,
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

  const pawCount = isMobile ? 12 : 20;
  const pawsRef = useRef<Paw[]>(generatePaws(pawCount));
  const [progress, setProgress] = useState(0);
  const rafRef = useRef(0);

  useEffect(() => {
    pawsRef.current = generatePaws(pawCount);
  }, [pawCount]);

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
  const baseOpacity = isDark ? 0.1 : 0.08;

  // "walking head" position in page percentage (a bit ahead of scroll)
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
        // Reveal: paw becomes visible once the walker has passed its position.
        const pawProgressPos = (i / (pawCount - 1)) * 100;
        const dist = walkPct - pawProgressPos;
        let opacity: number;
        let settle: number;
        if (reducedMotion) {
          opacity = baseOpacity;
          settle = 0;
        } else if (dist < -4) {
          // walker not here yet
          opacity = 0;
          settle = 10;
        } else if (dist < 6) {
          // just stepped — fade in
          const k = (dist + 4) / 10;
          opacity = baseOpacity * k;
          settle = 10 * (1 - k);
        } else {
          // already walked — gently fade older prints
          const fade = Math.max(0.35, 1 - (dist - 6) / 140);
          opacity = baseOpacity * fade;
          settle = 0;
        }

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
              transform: `translate(-50%, ${settle}px) rotate(${paw.rotate}deg) scaleX(${paw.mirror ? -1 : 1}) scale(${paw.scale})`,
              transition: 'opacity 500ms ease, transform 500ms ease',
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
