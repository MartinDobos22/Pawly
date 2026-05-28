import { Box, useTheme, type SxProps, type Theme } from '@mui/material';
import type { ReactNode } from 'react';

interface Props {
  children: ReactNode;
  sx?: SxProps<Theme>;
}

export default function PhoneFrame({ children, sx }: Props) {
  const theme = useTheme();
  const isDark = theme.palette.mode === 'dark';

  return (
    <Box
      sx={{
        width: 280,
        height: 560,
        borderRadius: 7,
        bgcolor: isDark ? '#0a0a0a' : '#1a1a1a',
        p: 1,
        boxShadow: isDark ? '0 30px 60px rgba(0,0,0,0.6)' : '0 30px 60px rgba(15,76,92,0.25)',
        position: 'relative',
        ...sx,
      }}
    >
      {/* Notch */}
      <Box
        sx={{
          position: 'absolute',
          top: 12,
          left: '50%',
          transform: 'translateX(-50%)',
          width: 80,
          height: 18,
          bgcolor: isDark ? '#0a0a0a' : '#1a1a1a',
          borderRadius: 999,
          zIndex: 2,
        }}
      />
      {/* Screen */}
      <Box
        sx={{
          width: '100%',
          height: '100%',
          borderRadius: 6,
          overflow: 'hidden',
          bgcolor: 'background.default',
          position: 'relative',
        }}
      >
        {/* Status bar */}
        <Box
          sx={{
            height: 32,
            bgcolor: 'transparent',
            display: 'flex',
            alignItems: 'flex-end',
            justifyContent: 'flex-end',
            px: 2,
            pb: 0.5,
          }}
        >
          <Box
            sx={{
              fontSize: '0.65rem',
              color: 'text.secondary',
              fontWeight: 600,
              fontVariantNumeric: 'tabular-nums',
            }}
          >
            9:41
          </Box>
        </Box>
        <Box sx={{ px: 1.5, pb: 1.5, height: 'calc(100% - 32px)', overflow: 'hidden' }}>
          {children}
        </Box>
      </Box>
    </Box>
  );
}
