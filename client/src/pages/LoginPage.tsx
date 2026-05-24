import { useState } from 'react';
import { Link as RouterLink, useLocation, useNavigate } from 'react-router-dom';
import { Alert, Box, Button, Divider, Link, Stack, TextField, Typography } from '@mui/material';
import { useAuth } from '../hooks/useAuth';
import AuthLayout from '../components/auth/AuthLayout';
import GoogleIcon from '../components/auth/GoogleIcon';
import { isInAppBrowser } from '../utils/isInAppBrowser';

interface Props {
  darkMode: boolean;
  onToggleTheme: () => void;
}

interface LocationState {
  from?: string;
}

export default function LoginPage({ darkMode, onToggleTheme }: Props) {
  const { login, loginWithGoogle, resetPassword } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const redirectTo = (location.state as LocationState | null)?.from ?? '/analyza';

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [info, setInfo] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const handleEmailLogin = async (event: React.FormEvent) => {
    event.preventDefault();
    setError(null);
    setInfo(null);
    setSubmitting(true);
    try {
      await login(email, password);
      navigate(redirectTo, { replace: true });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Prihlásenie zlyhalo.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleGoogleLogin = async () => {
    setError(null);
    setInfo(null);
    setSubmitting(true);
    try {
      await loginWithGoogle();
      navigate(redirectTo, { replace: true });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Prihlásenie zlyhalo.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleResetPassword = async () => {
    setError(null);
    setInfo(null);
    if (!email) {
      setError('Zadaj e-mail pre obnovu hesla.');
      return;
    }
    try {
      await resetPassword(email);
      setInfo('Poslali sme ti e-mail na obnovu hesla.');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Obnova hesla zlyhala.');
    }
  };

  return (
    <AuthLayout
      title="Prihlásenie"
      subtitle="Vitaj späť. Prihlás sa do svojho Pawport účtu."
      darkMode={darkMode}
      onToggleTheme={onToggleTheme}
    >
      <Box component="form" onSubmit={handleEmailLogin}>
        <Stack gap={2}>
          {error && <Alert severity="error">{error}</Alert>}
          {info && <Alert severity="success">{info}</Alert>}

          <TextField
            label="E-mail"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            autoComplete="email"
            required
            fullWidth
          />
          <TextField
            label="Heslo"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            autoComplete="current-password"
            required
            fullWidth
          />

          <Box sx={{ textAlign: 'right' }}>
            <Link component="button" type="button" variant="body2" onClick={handleResetPassword}>
              Zabudnuté heslo?
            </Link>
          </Box>

          <Button type="submit" variant="contained" size="large" disabled={submitting} fullWidth>
            Prihlásiť sa
          </Button>

          <Divider sx={{ my: 0.5 }}>alebo</Divider>

          {isInAppBrowser() && (
            <Alert severity="info">
              Prihlásenie cez Google nefunguje v prehliadači Messengera/Instagramu. Otvor stránku v
              Chrome/Safari, alebo sa prihlás e-mailom a heslom.
            </Alert>
          )}

          <Button
            variant="outlined"
            size="large"
            startIcon={<GoogleIcon />}
            onClick={handleGoogleLogin}
            disabled={submitting}
            fullWidth
          >
            Prihlásiť cez Google
          </Button>

          <Typography variant="body2" color="text.secondary" sx={{ textAlign: 'center' }}>
            Nemáš účet?{' '}
            <Link component={RouterLink} to="/register">
              Zaregistruj sa
            </Link>
          </Typography>
        </Stack>
      </Box>
    </AuthLayout>
  );
}
