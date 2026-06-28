import { Box, Stack, Typography, alpha, useTheme, type SxProps, type Theme } from '@mui/material';
import { Lock as LockIcon } from '@mui/icons-material';
import type { ReactNode } from 'react';

interface Props {
  url?: string;
  children: ReactNode;
  sx?: SxProps<Theme>;
}

export default function BrowserFrame({ url = 'pawly.app/zdravotny-pas', children, sx }: Props) {
  const theme = useTheme();
  const isDark = theme.palette.mode === 'dark';

  return (
    <Box
      sx={{
        borderRadius: 4,
        overflow: 'hidden',
        bgcolor: 'background.paper',
        border: `1px solid ${theme.palette.divider}`,
        boxShadow: isDark
          ? `0 24px 50px ${alpha(theme.palette.common.black, 0.5)}`
          : `0 24px 50px ${alpha(theme.palette.primary.main, 0.18)}`,
        ...sx,
      }}
    >
      {/* Chrome bar */}
      <Stack
        direction="row"
        alignItems="center"
        gap={1.25}
        sx={{
          px: 1.5,
          py: 1,
          borderBottom: `1px solid ${theme.palette.divider}`,
          bgcolor: alpha(theme.palette.text.primary, 0.02),
        }}
      >
        <Stack direction="row" gap={0.5}>
          <Box sx={{ width: 12, height: 12, borderRadius: '50%', bgcolor: '#FF5F57' }} />
          <Box sx={{ width: 12, height: 12, borderRadius: '50%', bgcolor: '#FEBC2E' }} />
          <Box sx={{ width: 12, height: 12, borderRadius: '50%', bgcolor: '#28C840' }} />
        </Stack>
        <Box
          sx={{
            flex: 1,
            mx: 1,
            px: 1.5,
            py: 0.5,
            borderRadius: 999,
            bgcolor: alpha(theme.palette.text.primary, 0.05),
            display: 'flex',
            alignItems: 'center',
            gap: 0.75,
            minHeight: 24,
          }}
        >
          <LockIcon sx={{ fontSize: 12, color: 'text.disabled' }} />
          <Typography
            sx={{
              fontSize: '0.72rem',
              color: 'text.secondary',
              textTransform: 'none',
              letterSpacing: 0,
              fontFamily: 'system-ui, sans-serif',
            }}
          >
            {url}
          </Typography>
        </Box>
      </Stack>

      {/* Content */}
      <Box sx={{ p: { xs: 1.5, md: 2.5 } }}>{children}</Box>
    </Box>
  );
}
