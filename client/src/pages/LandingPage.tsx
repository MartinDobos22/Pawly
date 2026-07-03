import { alpha, AppBar, Box, Button, IconButton, Stack, Toolbar, useTheme } from '@mui/material';
import {
  DarkMode as DarkModeIcon,
  LightMode as LightModeIcon,
  ArrowForward as ArrowIcon,
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../hooks/useAuth';
import LanguageSwitcher from '../components/LanguageSwitcher';
import PublicHeaderNav from '../components/public/PublicHeaderNav';
import PawTrail from '../components/landing/PawTrail';
import CursorGlow from '../components/landing/CursorGlow';
import MinimalHero from '../components/landing/MinimalHero';
import HowItWorks from '../components/landing/HowItWorks';
import FeatureShowcase from '../components/landing/FeatureShowcase';
import AppPreview from '../components/landing/AppPreview';
import InteractiveAiDemo from '../components/landing/InteractiveAiDemo';
import RevealOnScroll from '../components/landing/RevealOnScroll';
import FinalCta from '../components/landing/FinalCta';
import LandingFooter from '../components/landing/LandingFooter';
import PawlyLogo from '../components/PawlyLogo';
import Seo from '../components/Seo';

interface Props {
  darkMode: boolean;
  onToggleTheme: () => void;
}

export const seo = {
  title: 'Pawly — Zdravotný pas pre tvojho miláčika',
  description:
    'Pawly – digitálny zdravotný pas pre tvojho miláčika. AI analýza krmiva, vakcinačný preukaz, denník epizód a karta pre veterinára. Zadarmo.',
  path: '/',
};

export default function LandingPage({ darkMode, onToggleTheme }: Props) {
  const theme = useTheme();
  const navigate = useNavigate();
  const { user, loading } = useAuth();
  const { t } = useTranslation('common');
  const { t: tLanding } = useTranslation('landing');

  return (
    <>
      <Seo {...seo} />
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
            radial-gradient(900px circle at 85% 0%, ${alpha(theme.palette.primary.main, theme.palette.mode === 'light' ? 0.08 : 0.1)}, transparent 55%),
            radial-gradient(700px circle at 5% 45%, ${alpha(theme.palette.secondary.main, theme.palette.mode === 'light' ? 0.05 : 0.04)}, transparent 50%),
            radial-gradient(800px circle at 90% 90%, ${alpha(theme.palette.primary.light, theme.palette.mode === 'light' ? 0.05 : 0.06)}, transparent 50%)
          `,
            pointerEvents: 'none',
            zIndex: 0,
          },
          '& > *:not([data-paw-trail]):not([data-cursor-glow])': {
            position: 'relative',
            zIndex: 1,
          },
        }}
      >
        <PawTrail />
        <CursorGlow />
        <AppBar
          position="sticky"
          elevation={0}
          sx={{
            bgcolor: alpha(theme.palette.background.default, 0.7),
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
            <Stack direction="row" alignItems="center" gap={1.25} sx={{ flex: 1, minWidth: 0 }}>
              <PawlyLogo size="md" glow onClick={() => navigate('/')} />
              <Box sx={{ display: { xs: 'none', sm: 'block' } }}>
                <PublicHeaderNav />
              </Box>
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

        <MinimalHero scrollTargetId="ako-to-funguje" />
        <RevealOnScroll>
          <HowItWorks />
        </RevealOnScroll>
        <RevealOnScroll>
          <FeatureShowcase id="funkcie" />
        </RevealOnScroll>
        <RevealOnScroll>
          <AppPreview />
        </RevealOnScroll>
        <RevealOnScroll>
          <InteractiveAiDemo />
        </RevealOnScroll>
        <RevealOnScroll>
          <FinalCta />
        </RevealOnScroll>
        <LandingFooter />
      </Box>
    </>
  );
}
