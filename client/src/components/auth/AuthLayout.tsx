import { type ReactNode } from 'react';
import {
  alpha,
  Box,
  Card,
  CardContent,
  IconButton,
  Stack,
  Typography,
  useTheme,
} from '@mui/material';
import { useTranslation } from 'react-i18next';
import {
  DarkMode as DarkModeIcon,
  LightMode as LightModeIcon,
  Pets as PetsIcon,
} from '@mui/icons-material';

interface AuthLayoutProps {
  title: string;
  subtitle: string;
  children: ReactNode;
  darkMode: boolean;
  onToggleTheme: () => void;
}

export default function AuthLayout({
  title,
  subtitle,
  children,
  darkMode,
  onToggleTheme,
}: AuthLayoutProps) {
  const theme = useTheme();
  const isDark = theme.palette.mode === 'dark';
  const { t } = useTranslation('common');

  return (
    <Box
      sx={{
        position: 'relative',
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        bgcolor: 'background.default',
        p: 2,
        '&::before': {
          content: '""',
          position: 'absolute',
          inset: 0,
          background: `
            radial-gradient(800px circle at 85% 5%, ${alpha(theme.palette.primary.main, isDark ? 0.18 : 0.1)}, transparent 55%),
            radial-gradient(600px circle at 8% 90%, ${alpha(theme.palette.secondary.main, isDark ? 0.14 : 0.08)}, transparent 50%)
          `,
          pointerEvents: 'none',
        },
      }}
    >
      <IconButton
        onClick={onToggleTheme}
        aria-label={darkMode ? t('theme.toggleLight') : t('theme.toggleDark')}
        sx={{ position: 'absolute', top: theme.spacing(2), right: theme.spacing(2) }}
      >
        {darkMode ? <LightModeIcon /> : <DarkModeIcon />}
      </IconButton>

      <Card sx={{ position: 'relative', width: '100%', maxWidth: 420 }}>
        <CardContent sx={{ p: { xs: 3, sm: 4 } }}>
          <Stack direction="row" alignItems="center" gap={1.25} sx={{ mb: 3 }}>
            <Box
              sx={{
                width: 44,
                height: 44,
                borderRadius: 1.5,
                bgcolor: 'primary.main',
                color: 'primary.contrastText',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: isDark
                  ? `0 0 12px ${alpha(theme.palette.primary.main, 0.35)}`
                  : `0 2px 6px ${alpha(theme.palette.primary.main, 0.18)}`,
              }}
            >
              <PetsIcon sx={{ fontSize: 28 }} />
            </Box>
            <Typography sx={{ fontWeight: 800, fontSize: '1.4rem', letterSpacing: '-0.015em' }}>
              Pawly
            </Typography>
          </Stack>

          <Typography variant="h4" sx={{ fontWeight: 700, mb: 0.5 }}>
            {title}
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
            {subtitle}
          </Typography>

          {children}
        </CardContent>
      </Card>
    </Box>
  );
}
