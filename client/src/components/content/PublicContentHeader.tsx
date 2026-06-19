import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { AppBar, Button, IconButton, Stack, Toolbar, useTheme } from '@mui/material';
import {
  ArrowForward as ArrowIcon,
  DarkMode as DarkModeIcon,
  LightMode as LightModeIcon,
} from '@mui/icons-material';
import { useAuth } from '../../hooks/useAuth';
import LanguageSwitcher from '../LanguageSwitcher';
import PawlyLogo from '../PawlyLogo';

interface Props {
  darkMode: boolean;
  onToggleTheme: () => void;
}

export default function PublicContentHeader({ darkMode, onToggleTheme }: Props) {
  const theme = useTheme();
  const navigate = useNavigate();
  const { user, loading } = useAuth();
  const { t } = useTranslation('common');
  const { t: tLanding } = useTranslation('landing');

  return (
    <AppBar
      position="sticky"
      elevation={0}
      sx={{
        bgcolor: theme.palette.mode === 'light' ? 'rgba(250,247,242,0.7)' : 'rgba(26,31,34,0.7)',
        backdropFilter: 'saturate(180%) blur(14px)',
        WebkitBackdropFilter: 'saturate(180%) blur(14px)',
        color: 'text.primary',
        borderBottom: 'none',
      }}
    >
      <Toolbar
        sx={{
          maxWidth: 1200,
          width: '100%',
          mx: 'auto',
          px: { xs: 2.5, md: 4 },
          gap: 1,
        }}
      >
        <Stack direction="row" alignItems="center" gap={1.25} sx={{ flex: 1 }}>
          <PawlyLogo size="md" glow onClick={() => navigate('/')} />
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
              onClick={() => navigate('/zdravotny-pas')}
              sx={{ minHeight: { sm: 40 }, whiteSpace: 'nowrap', flexShrink: 0 }}
            >
              {tLanding('hero.navEnter')}
            </Button>
          ) : (
            <Stack direction="row" gap={{ xs: 0.5, sm: 1 }} sx={{ flexShrink: 0 }}>
              <Button
                variant="text"
                size="small"
                onClick={() => navigate('/login')}
                sx={{ whiteSpace: 'nowrap', flexShrink: 0, px: { xs: 1, sm: 1.5 } }}
              >
                {tLanding('hero.navLogin')}
              </Button>
              <Button
                variant="contained"
                size="small"
                onClick={() => navigate('/register')}
                sx={{ whiteSpace: 'nowrap', flexShrink: 0 }}
              >
                {tLanding('hero.navRegister')}
              </Button>
            </Stack>
          ))}
      </Toolbar>
    </AppBar>
  );
}
