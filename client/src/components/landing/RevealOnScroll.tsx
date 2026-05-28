import { Box, type SxProps, type Theme } from '@mui/material';
import { type ReactNode } from 'react';
import { useInView } from '../../hooks/useInView';

interface Props {
  children: ReactNode;
  delay?: number;
  distance?: number;
  duration?: number;
  sx?: SxProps<Theme>;
}

export default function RevealOnScroll({
  children,
  delay = 0,
  distance = 24,
  duration = 700,
  sx,
}: Props) {
  const [ref, inView] = useInView({ threshold: 0.15, once: true });

  return (
    <Box
      ref={ref}
      sx={{
        opacity: inView ? 1 : 0,
        transform: inView ? 'translateY(0)' : `translateY(${distance}px)`,
        transition: `opacity ${duration}ms ease, transform ${duration}ms ease`,
        transitionDelay: `${delay}ms`,
        ...sx,
      }}
    >
      {children}
    </Box>
  );
}
