import type { ReactNode } from 'react';
import { Box } from '@mui/material';
import { alpha, useTheme } from '@mui/material/styles';

interface Props {
  icon: ReactNode;
  /** Akcentová farba (theme token). Default: primary.main. */
  accent?: string;
  /** Veľkosť štvorca v px. Default 40. */
  size?: number;
}

/**
 * Jednotná ikonová dlaždica naprieč appkou: zaoblený štvorec s jemným tintom
 * akcentovej farby a farebnou ikonou. Jediný zdroj tohto vzoru — nekopíruj ho
 * inline po komponentoch.
 */
export default function IconTile({ icon, accent, size = 40 }: Props) {
  const theme = useTheme();
  const color = accent ?? theme.palette.primary.main;
  return (
    <Box
      sx={{
        width: size,
        height: size,
        borderRadius: 2,
        flexShrink: 0,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        bgcolor: alpha(color, 0.12),
        color,
        '& svg': { fontSize: Math.round(size * 0.52) },
      }}
    >
      {icon}
    </Box>
  );
}
