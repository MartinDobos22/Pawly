import { type ReactNode } from 'react';
import { Box, Typography, useTheme } from '@mui/material';

interface Props {
  title: string;
  children: ReactNode;
}

export default function LandingSection({ title, children }: Props) {
  const theme = useTheme();
  return (
    <Box component="section" sx={{ mb: theme.spacing(4) }}>
      <Typography variant="h5" component="h2" sx={{ mb: theme.spacing(1.5) }}>
        {title}
      </Typography>
      {children}
    </Box>
  );
}
