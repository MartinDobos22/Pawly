import { useEffect, useRef } from 'react';
import { Box, alpha, useMediaQuery, useTheme } from '@mui/material';

export default function CursorGlow() {
  const theme = useTheme();
  const ref = useRef<HTMLDivElement | null>(null);
  const rafRef = useRef(0);
  const supportsHover = useMediaQuery('(hover: hover) and (pointer: fine)');
  const reducedMotion = useMediaQuery('(prefers-reduced-motion: reduce)');
  const active = supportsHover && !reducedMotion;

  useEffect(() => {
    if (!active) return;
    const onMove = (e: MouseEvent) => {
      cancelAnimationFrame(rafRef.current);
      rafRef.current = requestAnimationFrame(() => {
        const el = ref.current;
        if (!el) return;
        el.style.setProperty('--glow-x', `${e.clientX}px`);
        el.style.setProperty('--glow-y', `${e.clientY}px`);
        el.style.opacity = '1';
      });
    };
    window.addEventListener('mousemove', onMove);
    return () => {
      window.removeEventListener('mousemove', onMove);
      cancelAnimationFrame(rafRef.current);
    };
  }, [active]);

  if (!active) return null;

  return (
    <Box
      ref={ref}
      aria-hidden
      data-cursor-glow
      sx={{
        position: 'fixed',
        inset: 0,
        zIndex: 0,
        pointerEvents: 'none',
        opacity: 0,
        transition: 'opacity 600ms ease',
        background: `radial-gradient(560px circle at var(--glow-x, 50%) var(--glow-y, 30%), ${alpha(
          theme.palette.primary.main,
          theme.palette.mode === 'dark' ? 0.1 : 0.08
        )}, transparent 65%)`,
      }}
    />
  );
}
