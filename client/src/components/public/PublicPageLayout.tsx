import { type ReactNode } from 'react';
import { Box } from '@mui/material';
import PublicHeader from './PublicHeader';
import LandingFooter from '../landing/LandingFooter';

interface Props {
  children: ReactNode;
  darkMode: boolean;
  onToggleTheme: () => void;
}

export default function PublicPageLayout({ children, darkMode, onToggleTheme }: Props) {
  return (
    <Box
      sx={{
        minHeight: '100vh',
        bgcolor: 'background.default',
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      <PublicHeader darkMode={darkMode} onToggleTheme={onToggleTheme} />

      <Box
        component="main"
        sx={{
          flex: 1,
          maxWidth: 880,
          width: '100%',
          mx: 'auto',
          px: { xs: 2.5, md: 4 },
          py: { xs: 4, md: 6 },
        }}
      >
        {children}
      </Box>

      <LandingFooter />
    </Box>
  );
}
