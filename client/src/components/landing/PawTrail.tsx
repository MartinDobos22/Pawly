import { useEffect, useRef, useState } from 'react';
import { Box, useMediaQuery, useTheme } from '@mui/material';

interface Print {
  id: number;
  yDoc: number; // px od vrchu dokumentu
  xPct: number;
  rotateDeg: number;
  mirror: boolean;
  scale: number;
  accent: boolean;
}

interface Walker {
  y: number; // document px frontier
  x: number; // percent
  heading: number; // radians (smer chôdze)
  phase: number; // gait phase
}

const rand = (min: number, max: number) => min + Math.random() * (max - min);

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

  const [prints, setPrints] = useState<Print[]>([]);
  const idRef = useRef(0);
  const downRef = useRef<Walker | null>(null);
  const upRef = useRef<Walker | null>(null);
  const rafRef = useRef(0);

  const primary = theme.palette.primary.main;
  const secondary = theme.palette.secondary.main;
  const baseOpacity = isDark ? 0.22 : 0.3;

  useEffect(() => {
    if (reducedMotion) {
      // jednorazová riedka statická stopa
      const vh = window.innerHeight;
      const docH = document.documentElement.scrollHeight;
      const out: Print[] = [];
      let x = rand(30, 70);
      for (let y = vh * 0.2; y < docH - vh * 0.1; y += vh * 0.18) {
        x = Math.max(12, Math.min(88, x + rand(-8, 8)));
        out.push({
          id: idRef.current++,
          yDoc: y,
          xPct: x,
          rotateDeg: rand(-20, 20),
          mirror: Math.random() < 0.5,
          scale: rand(0.85, 1.05),
          accent: Math.random() < 0.22,
        });
      }
      setPrints(out);
      return;
    }

    const vh = window.innerHeight;
    const stepGap = vh * 0.085;
    const genMargin = vh * 0.35;
    const pruneMargin = vh * 1.1;
    const lateral = 4.5;

    const start = window.scrollY + vh * 0.4;
    downRef.current = { y: start, x: rand(30, 70), heading: Math.PI / 2, phase: 0 };
    upRef.current = { y: start, x: downRef.current.x, heading: -Math.PI / 2, phase: 0 };

    const advance = (w: Walker, dir: 1 | -1): Print => {
      // jemné natáčanie + držanie v rozsahu
      w.heading += rand(-0.28, 0.28);
      if (w.x < 14) w.heading = dir * (Math.PI / 2) - 0.5 * dir;
      if (w.x > 86) w.heading = dir * (Math.PI / 2) + 0.5 * dir;
      // horizontálny posun podľa headingu, vertikálny pevne podľa smeru
      w.x += Math.cos(w.heading) * (lateral * 1.4) * (Math.random() < 0.5 ? 1 : 0.6);
      w.x = Math.max(10, Math.min(90, w.x));
      w.y += dir * stepGap;

      const phase = w.phase % 4;
      w.phase += 1;
      const isLeft = phase === 0 || phase === 3;
      const isFront = phase === 0 || phase === 2;
      const sideOffset = (isLeft ? -1 : 1) * lateral * (isFront ? 0.9 : 1.1);

      return {
        id: idRef.current++,
        yDoc: w.y,
        xPct: Math.max(6, Math.min(92, w.x + sideOffset)),
        rotateDeg: (dir === 1 ? 0 : 180) + (isLeft ? -10 : 10) + rand(-6, 6),
        mirror: !isLeft,
        scale: (isFront ? 0.82 : 1) * rand(0.92, 1.08),
        accent: Math.random() < 0.22,
      };
    };

    const onScroll = () => {
      cancelAnimationFrame(rafRef.current);
      rafRef.current = requestAnimationFrame(() => {
        const vTop = window.scrollY;
        const vBottom = vTop + window.innerHeight;
        const down = downRef.current!;
        const up = upRef.current!;
        const fresh: Print[] = [];

        let guard = 0;
        while (down.y < vBottom + genMargin && guard < 60) {
          fresh.push(advance(down, 1));
          guard++;
        }
        guard = 0;
        while (up.y > vTop - genMargin && guard < 60) {
          fresh.push(advance(up, -1));
          guard++;
        }

        if (fresh.length === 0) return;

        setPrints((prev) => {
          const merged = [...prev, ...fresh];
          // prune odtlačky ďaleko mimo viewport
          return merged.filter(
            (p) => p.yDoc > vTop - pruneMargin && p.yDoc < vBottom + pruneMargin
          );
        });
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
  }, [reducedMotion, isMobile]);

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
        '@keyframes pawStamp': {
          '0%': { opacity: 0, transform: 'scale(0.5)' },
          '45%': { opacity: 1, transform: 'scale(1.05)' },
          '70%': { transform: 'scale(1)' },
          '100%': { opacity: 1, transform: 'scale(1)' },
        },
      }}
    >
      {prints.map((p) => (
        <Box
          key={p.id}
          sx={{
            position: 'absolute',
            top: `${p.yDoc}px`,
            left: `${p.xPct}%`,
            width: { xs: 26, md: 38 },
            height: { xs: 26, md: 38 },
            transform: `translate(-50%, -50%) rotate(${p.rotateDeg}deg) scaleX(${p.mirror ? -1 : 1})`,
            opacity: baseOpacity,
          }}
        >
          <Box
            sx={{
              width: '100%',
              height: '100%',
              transform: `scale(${p.scale})`,
              animation: reducedMotion
                ? undefined
                : 'pawStamp 420ms cubic-bezier(0.34, 1.56, 0.64, 1) both',
            }}
          >
            <PawShape color={p.accent ? secondary : primary} />
          </Box>
        </Box>
      ))}
    </Box>
  );
}
