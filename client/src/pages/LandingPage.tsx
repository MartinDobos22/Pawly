import {
  alpha,
  AppBar,
  Box,
  Button,
  IconButton,
  Stack,
  Toolbar,
  useTheme,
} from '@mui/material';
import {
  DarkMode as DarkModeIcon,
  LightMode as LightModeIcon,
  ArrowForward as ArrowIcon,
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../hooks/useAuth';
import LanguageSwitcher from '../components/LanguageSwitcher';
import PawTrail from '../components/landing/PawTrail';
import LandingHero from '../components/landing/LandingHero';
import HowItWorks from '../components/landing/HowItWorks';
import PetTypesStrip from '../components/landing/PetTypesStrip';
import InteractiveAiDemo from '../components/landing/InteractiveAiDemo';
import StatsBand from '../components/landing/StatsBand';
import FeatureGrid from '../components/landing/FeatureGrid';
import ComparisonSection from '../components/landing/ComparisonSection';
import PetPhotoWall from '../components/landing/PetPhotoWall';
import RevealOnScroll from '../components/landing/RevealOnScroll';
import AppPreview from '../components/landing/AppPreview';
import FinalCta from '../components/landing/FinalCta';
import LandingFooter from '../components/landing/LandingFooter';

interface Props {
  darkMode: boolean;
  onToggleTheme: () => void;
}

export default function LandingPage({ darkMode, onToggleTheme }: Props) {
  const theme = useTheme();
  const navigate = useNavigate();
  const { user, loading } = useAuth();
  const { t } = useTranslation('common');
  const { t: tLanding } = useTranslation('landing');

  return (
    <Box
      sx={{
        position: 'relative',
        minHeight: '100vh',
        bgcolor: 'background.default',
        overflow: 'hidden',
        '&::before': {
          content: '""',
          position: 'absolute',
          inset: 0,
          background: `
            radial-gradient(900px circle at 85% 5%, ${alpha(theme.palette.primary.main, theme.palette.mode === 'light' ? 0.1 : 0.18)}, transparent 55%),
            radial-gradient(700px circle at 8% 28%, ${alpha(theme.palette.secondary.main, theme.palette.mode === 'light' ? 0.08 : 0.14)}, transparent 50%),
            radial-gradient(800px circle at 95% 55%, ${alpha(theme.palette.primary.main, theme.palette.mode === 'light' ? 0.07 : 0.12)}, transparent 50%),
            radial-gradient(600px circle at 5% 75%, ${alpha(theme.palette.secondary.main, theme.palette.mode === 'light' ? 0.06 : 0.1)}, transparent 50%),
            radial-gradient(700px circle at 80% 92%, ${alpha(theme.palette.primary.light, theme.palette.mode === 'light' ? 0.05 : 0.1)}, transparent 50%)
          `,
          pointerEvents: 'none',
          zIndex: 0,
        },
        '& > *:not([data-paw-trail])': { position: 'relative', zIndex: 1 },
      }}
    >
      <PawTrail />
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
            <Box
              component="img"
              src={
                theme.palette.mode === 'dark'
                  ? '/branding/pawly-logo-dark.png'
                  : '/branding/pawly-logo-light.png'
              }
              alt="Pawly"
              onClick={() => navigate('/')}
              sx={{
                height: 36,
                width: 'auto',
                display: 'block',
                cursor: 'pointer',
                filter:
                  theme.palette.mode === 'dark'
                    ? `drop-shadow(0 0 10px ${alpha(theme.palette.primary.main, 0.4)})`
                    : 'none',
              }}
            />
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

      <LandingHero />
      <RevealOnScroll>
        <HowItWorks />
      </RevealOnScroll>
      <RevealOnScroll>
        <PetTypesStrip />
      </RevealOnScroll>
      <RevealOnScroll>
        <InteractiveAiDemo />
      </RevealOnScroll>
      <RevealOnScroll>
        <StatsBand />
      </RevealOnScroll>
      <RevealOnScroll>
        <FeatureGrid />
      </RevealOnScroll>
      <RevealOnScroll>
        <ComparisonSection />
      </RevealOnScroll>
      <RevealOnScroll>
        <AppPreview />
      </RevealOnScroll>
      <RevealOnScroll>
        <PetPhotoWall />
      </RevealOnScroll>
      <RevealOnScroll>
        <FinalCta />
      </RevealOnScroll>
      <LandingFooter />
    </Box>
  );
}
