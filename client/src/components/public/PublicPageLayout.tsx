import { type ReactNode } from 'react';
import { AppBar, Box, Button, IconButton, Stack, Toolbar, useTheme } from '@mui/material';
import {
  DarkMode as DarkModeIcon,
  LightMode as LightModeIcon,
  ArrowForward as ArrowIcon,
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../../hooks/useAuth';
import LanguageSwitcher from '../LanguageSwitcher';
import PawlyLogo from '../PawlyLogo';
import LandingFooter from '../landing/LandingFooter';

interface Props {
  children: ReactNode;
  darkMode: boolean;
  onToggleTheme: () => void;
}

export default function PublicPageLayout({ children, darkMode, onToggleTheme }: Props) {
  const theme = useTheme();
  const navigate = useNavigate();
  const { t } = useTranslation('common');
  const { t: tLanding } = useTranslation('landing');
  const { user, loading } = useAuth();

  return (
    <Box
      sx={{
        minHeight: '100vh',
        bgcolor: 'background.default',
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      <AppBar
        position="sticky"
        elevation={0}
        sx={{
          bgcolor: theme.palette.mode === 'light' ? 'rgba(250,247,242,0.8)' : 'rgba(26,31,34,0.8)',
          backdropFilter: 'saturate(180%) blur(14px)',
          color: 'text.primary',
          borderBottom: `1px solid ${theme.palette.divider}`,
        }}
      >
        <Toolbar sx={{ maxWidth: 1100, width: '100%', mx: 'auto', px: { xs: 2, md: 4 }, gap: 1 }}>
          <Stack direction="row" alignItems="center" sx={{ flex: 1 }}>
            <PawlyLogo size="sm" onClick={() => navigate('/')} />
          </Stack>
          <LanguageSwitcher variant="compact" />
          <IconButton
            onClick={onToggleTheme}
            color="inherit"
            aria-label={darkMode ? t('theme.toggleLight') : t('theme.toggleDark')}
          >
            {darkMode ? <LightModeIcon /> : <DarkModeIcon />}
          </IconButton>
          {!loading &&
            (user ? (
              <Button
                variant="contained"
                size="small"
                endIcon={<ArrowIcon />}
                onClick={() => navigate('/prehlad')}
                sx={{ whiteSpace: 'nowrap', flexShrink: 0 }}
              >
                {tLanding('hero.navEnter')}
              </Button>
            ) : (
              <Stack direction="row" gap={{ xs: 0.5, sm: 1 }} sx={{ flexShrink: 0 }}>
                <Button
                  variant="text"
                  size="small"
                  onClick={() => navigate('/login')}
                  sx={{ whiteSpace: 'nowrap', px: { xs: 1, sm: 1.5 } }}
                >
                  {tLanding('hero.navLogin')}
                </Button>
                <Button
                  variant="contained"
                  size="small"
                  onClick={() => navigate('/register')}
                  sx={{ whiteSpace: 'nowrap' }}
                >
                  {tLanding('hero.navRegister')}
                </Button>
              </Stack>
            ))}
        </Toolbar>
      </AppBar>

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
