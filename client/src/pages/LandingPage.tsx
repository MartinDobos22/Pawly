import {
  alpha,
  AppBar,
  Box,
  Button,
  IconButton,
  Stack,
  Toolbar,
  Typography,
  useTheme,
} from '@mui/material';
import {
  DarkMode as DarkModeIcon,
  LightMode as LightModeIcon,
  Pets as PetsIcon,
  ArrowForward as ArrowIcon,
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import LandingHero from '../components/landing/LandingHero';
import HowItWorks from '../components/landing/HowItWorks';
import PetTypesStrip from '../components/landing/PetTypesStrip';
import FeatureGrid from '../components/landing/FeatureGrid';
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
        '& > *': { position: 'relative', zIndex: 1 },
      }}
    >
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
              sx={{
                width: 32,
                height: 32,
                borderRadius: 1.5,
                bgcolor: 'primary.main',
                color: 'primary.contrastText',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow:
                  theme.palette.mode === 'dark'
                    ? `0 0 12px ${theme.palette.primary.main}66`
                    : '0 2px 6px rgba(15,76,92,0.18)',
              }}
            >
              <PetsIcon sx={{ fontSize: 20 }} />
            </Box>
            <Typography sx={{ fontWeight: 800, fontSize: '1.05rem', letterSpacing: '-0.015em' }}>
              Pawport
            </Typography>
          </Stack>
          <IconButton
            onClick={onToggleTheme}
            color="inherit"
            aria-label={darkMode ? 'Prepnúť na svetlý režim' : 'Prepnúť na tmavý režim'}
          >
            {darkMode ? <LightModeIcon /> : <DarkModeIcon />}
          </IconButton>
          <Button
            variant="contained"
            endIcon={<ArrowIcon />}
            onClick={() => navigate('/analyza')}
            sx={{ display: { xs: 'none', sm: 'inline-flex' } }}
          >
            Vstúpiť
          </Button>
          <Button
            variant="contained"
            size="small"
            onClick={() => navigate('/analyza')}
            sx={{ display: { xs: 'inline-flex', sm: 'none' } }}
          >
            Vstúpiť
          </Button>
        </Toolbar>
      </AppBar>

      <LandingHero />
      <HowItWorks />
      <PetTypesStrip />
      <FeatureGrid />
      <AppPreview />
      <FinalCta />
      <LandingFooter />
    </Box>
  );
}
