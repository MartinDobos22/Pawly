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
  const lastYRef = useRef(0);
  const accRef = useRef(0);
  const xRef = useRef(50);
  const phaseRef = useRef(0);
  const rafRef = useRef(0);

  const primary = theme.palette.primary.main;
  const secondary = theme.palette.secondary.main;
  const baseOpacity = isDark ? 0.22 : 0.3;

  useEffect(() => {
    if (reducedMotion) {
      const vh = window.innerHeight;
      const docH = document.documentElement.scrollHeight;
      const out: Print[] = [];
      let x = rand(30, 70);
      for (let y = vh * 0.24; y < docH - vh * 0.14; y += vh * 0.28) {
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
    const stepGap = vh * 0.28; // väčší rozostup, menej odtlačkov
    const lateral = 4.5;
    const pruneMargin = vh * 0.45;
    xRef.current = rand(35, 65);
    lastYRef.current = window.scrollY;

    const layPrint = (dir: 1 | -1) => {
      // walker mierne meandruje horizontálne
      xRef.current += rand(-7, 7);
      xRef.current = Math.max(12, Math.min(88, xRef.current));

      const phase = phaseRef.current % 4;
      phaseRef.current += 1;
      const isLeft = phase === 0 || phase === 3;
      const isFront = phase === 0 || phase === 2;
      const sideOffset = (isLeft ? -1 : 1) * lateral * (isFront ? 0.9 : 1.1);

      // odtlačok sa kladie na vedúcu hranu viewportu v smere scrollu
      const vTop = window.scrollY;
      const vBottom = vTop + window.innerHeight;
      const edge = dir === 1 ? vBottom : vTop;
      const yDoc = edge - dir * rand(vh * 0.05, vh * 0.25);

      return {
        id: idRef.current++,
        yDoc,
        xPct: Math.max(6, Math.min(92, xRef.current + sideOffset)),
        rotateDeg: (dir === 1 ? 180 : 0) + (isLeft ? -10 : 10) + rand(-6, 6),
        mirror: !isLeft,
        scale: (isFront ? 0.82 : 1) * rand(0.92, 1.08),
        accent: Math.random() < 0.22,
      } as Print;
    };

    const onScroll = () => {
      cancelAnimationFrame(rafRef.current);
      rafRef.current = requestAnimationFrame(() => {
        const y = window.scrollY;
        const delta = y - lastYRef.current;
        lastYRef.current = y;
        if (delta === 0) return;

        accRef.current += delta;
        const dir: 1 | -1 = delta > 0 ? 1 : -1;
        const fresh: Print[] = [];
        let guard = 0;
        while (Math.abs(accRef.current) >= stepGap && guard < 20) {
          fresh.push(layPrint(dir));
          accRef.current -= dir * stepGap;
          guard++;
        }

        const vTop = y;
        const vBottom = y + window.innerHeight;
        setPrints((prev) => {
          const merged = fresh.length ? [...prev, ...fresh] : prev;
          return merged.filter(
            (p) => p.yDoc > vTop - pruneMargin && p.yDoc < vBottom + pruneMargin
          );
        });
      });
    };

    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onScroll);
    return () => {
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('resize', onScroll);
      cancelAnimationFrame(rafRef.current);
    };
  }, [reducedMotion, isMobile]);

  // Na mobile pôsobí stopa labiek cez text neporiadne — necháme ju len na väčších displejoch.
  if (isMobile) return null;

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
                : 'pawStamp 400ms cubic-bezier(0.34, 1.56, 0.64, 1) both',
            }}
          >
            <PawShape color={p.accent ? secondary : primary} />
          </Box>
        </Box>
      ))}
    </Box>
  );
}
