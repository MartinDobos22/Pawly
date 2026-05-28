import { useEffect, useRef, useState } from 'react';
import { Box, type SxProps, type Theme } from '@mui/material';

interface Props {
  target: number;
  duration?: number;
  suffix?: string;
  prefix?: string;
  sx?: SxProps<Theme>;
  formatter?: (n: number) => string;
}

const easeOutCubic = (t: number) => 1 - Math.pow(1 - t, 3);

export default function AnimatedCounter({
  target,
  duration = 1500,
  suffix = '',
  prefix = '',
  sx,
  formatter,
}: Props) {
  const ref = useRef<HTMLSpanElement | null>(null);
  const startedRef = useRef(false);
  const [value, setValue] = useState(0);

  useEffect(() => {
    const node = ref.current;
    if (!node) return;
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting && !startedRef.current) {
            startedRef.current = true;
            const start = performance.now();
            let raf = 0;
            const tick = (now: number) => {
              const t = Math.min(1, (now - start) / duration);
              const eased = easeOutCubic(t);
              setValue(Math.round(target * eased));
              if (t < 1) raf = requestAnimationFrame(tick);
            };
            raf = requestAnimationFrame(tick);
            observer.disconnect();
            return () => cancelAnimationFrame(raf);
          }
        });
      },
      { threshold: 0.4 }
    );
    observer.observe(node);
    return () => observer.disconnect();
  }, [target, duration]);

  const display = formatter ? formatter(value) : value.toLocaleString('sk-SK');

  return (
    <Box component="span" ref={ref} sx={sx}>
      {prefix}
      {display}
      {suffix}
    </Box>
  );
}
