import { useEffect, useRef, useState } from 'react';
import { Box, useMediaQuery, useTheme } from '@mui/material';

interface Print {
  id: number;
  xPct: number;
  yPct: number;
  rotateDeg: number;
  mirror: boolean;
  scale: number;
  accent: boolean;
}

const STEP_MS = 420; // čas medzi krokmi
const LIFE_MS = 5200; // ako dlho odtlačok žije (fade in → out)
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
  const walker = useRef({
    x: rand(25, 75),
    y: rand(20, 50),
    heading: rand(0, Math.PI * 2),
    phase: 0,
  });
  const idRef = useRef(0);
  const bornRef = useRef<Map<number, number>>(new Map());

  const primary = theme.palette.primary.main;
  const secondary = theme.palette.secondary.main;
  const baseOpacity = isDark ? 0.24 : 0.32;

  useEffect(() => {
    if (reducedMotion) return;

    const stepLenX = isMobile ? 6 : 4.5;
    const stepLenY = isMobile ? 8 : 6.5;
    const lateral = 4.5;

    const step = () => {
      const w = walker.current;

      // jemné náhodné natáčanie
      w.heading += rand(-0.3, 0.3);

      // ak sa blíži k okraju, natoč sa späť do stredu
      const margin = 12;
      if (w.x < margin || w.x > 100 - margin || w.y < margin || w.y > 100 - margin) {
        const toCenter = Math.atan2(50 - w.y, 50 - w.x);
        // plynulý blend k smeru do stredu
        let diff = toCenter - w.heading;
        while (diff > Math.PI) diff -= Math.PI * 2;
        while (diff < -Math.PI) diff += Math.PI * 2;
        w.heading += diff * 0.6;
      }

      // posun walkera
      w.x += Math.cos(w.heading) * stepLenX;
      w.y += Math.sin(w.heading) * stepLenY;
      w.x = Math.max(5, Math.min(95, w.x));
      w.y = Math.max(6, Math.min(94, w.y));

      // ktorá noha (gait)
      const phase = w.phase % 4;
      w.phase += 1;
      const isLeft = phase === 0 || phase === 3; // LF, LH
      const isFront = phase === 0 || phase === 2; // LF, RF

      // bočný offset kolmo na smer chôdze
      const perp = w.heading + Math.PI / 2;
      const sign = isLeft ? -1 : 1;
      const mag = lateral * (isFront ? 0.9 : 1.1);
      const xPct = w.x + Math.cos(perp) * mag * sign;
      const yPct = w.y + Math.sin(perp) * mag * sign;

      const id = idRef.current++;
      bornRef.current.set(id, performance.now());
      const print: Print = {
        id,
        xPct: Math.max(3, Math.min(97, xPct)),
        yPct: Math.max(4, Math.min(96, yPct)),
        rotateDeg: (w.heading * 180) / Math.PI + 90 + (isLeft ? -8 : 8),
        mirror: !isLeft,
        scale: (isFront ? 0.82 : 1) * rand(0.92, 1.08),
        accent: Math.random() < 0.22,
      };

      const now = performance.now();
      setPrints((prev) => {
        const alive = prev.filter((p) => {
          const born = bornRef.current.get(p.id) ?? now;
          if (now - born > LIFE_MS) {
            bornRef.current.delete(p.id);
            return false;
          }
          return true;
        });
        return [...alive, print];
      });
    };

    step();
    const interval = setInterval(step, STEP_MS);
    return () => clearInterval(interval);
  }, [reducedMotion, isMobile]);

  if (reducedMotion) return null;

  return (
    <Box
      aria-hidden
      data-paw-trail
      sx={{
        position: 'fixed',
        inset: 0,
        zIndex: 0,
        overflow: 'hidden',
        pointerEvents: 'none',
        '@keyframes pawFade': {
          '0%': { opacity: 0 },
          '8%': { opacity: baseOpacity },
          '65%': { opacity: baseOpacity },
          '100%': { opacity: 0 },
        },
        '@keyframes pawPop': {
          '0%': { transform: 'scale(0.5)' },
          '12%': { transform: 'scale(1.06)' },
          '20%': { transform: 'scale(1)' },
          '100%': { transform: 'scale(1.04)' },
        },
      }}
    >
      {prints.map((p) => (
        <Box
          key={p.id}
          sx={{
            position: 'absolute',
            top: `${p.yPct}%`,
            left: `${p.xPct}%`,
            width: { xs: 26, md: 38 },
            height: { xs: 26, md: 38 },
            transform: `translate(-50%, -50%) rotate(${p.rotateDeg}deg) scaleX(${p.mirror ? -1 : 1})`,
            animation: `pawFade ${LIFE_MS}ms ease-in-out forwards`,
            willChange: 'opacity',
          }}
        >
          <Box
            sx={{
              width: '100%',
              height: '100%',
              transform: `scale(${p.scale})`,
              animation: `pawPop ${LIFE_MS}ms cubic-bezier(0.34, 1.56, 0.64, 1) forwards`,
              willChange: 'transform',
            }}
          >
            <PawShape color={p.accent ? secondary : primary} />
          </Box>
        </Box>
      ))}
    </Box>
  );
}
