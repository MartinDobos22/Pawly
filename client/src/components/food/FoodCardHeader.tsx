import type { ReactNode } from 'react';
import { Box, Stack, Typography } from '@mui/material';
import { alpha } from '@mui/material/styles';

interface Props {
  icon: ReactNode;
  accent: string;
  title: string;
  action?: ReactNode;
}

export default function FoodCardHeader({ icon, accent, title, action }: Props) {
  return (
    <Stack direction="row" alignItems="center" spacing={1.5} sx={{ mb: 1.5 }}>
      <Box
        sx={{
          width: 40,
          height: 40,
          borderRadius: 2,
          flexShrink: 0,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          bgcolor: alpha(accent, 0.12),
          color: accent,
          '& svg': { fontSize: 21 },
        }}
      >
        {icon}
      </Box>
      <Typography variant="h6" sx={{ flex: 1, minWidth: 0 }}>
        {title}
      </Typography>
      {action}
    </Stack>
  );
}
