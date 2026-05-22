import { AppBar, Box, Button, IconButton, Stack, Toolbar, Typography, useTheme } from '@mui/material';
import {
  DarkMode as DarkModeIcon,
  LightMode as LightModeIcon,
  Pets as PetsIcon,
  ArrowForward as ArrowIcon,
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import LandingHero from '../components/landing/LandingHero';
import HowItWorks from '../components/landing/HowItWorks';
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
    <Box sx={{ minHeight: '100vh', bgcolor: 'background.default' }}>
      <AppBar
        position="sticky"
        elevation={0}
        sx={{
          bgcolor: theme.palette.mode === 'light' ? 'rgba(250,247,242,0.85)' : 'rgba(26,31,34,0.85)',
          backdropFilter: 'saturate(180%) blur(10px)',
          WebkitBackdropFilter: 'saturate(180%) blur(10px)',
          color: 'text.primary',
          borderBottom: `1px solid ${theme.palette.divider}`,
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
      <FeatureGrid />
      <AppPreview />
      <FinalCta />
      <LandingFooter />
    </Box>
  );
}
