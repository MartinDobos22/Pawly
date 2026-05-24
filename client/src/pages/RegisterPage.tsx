import { useState } from 'react';
import { Link as RouterLink, useNavigate } from 'react-router-dom';
import { Alert, Box, Button, Divider, Link, Stack, TextField, Typography } from '@mui/material';
import { useAuth } from '../hooks/useAuth';
import { isInAppBrowser } from '../utils/isInAppBrowser';
import AuthLayout from '../components/auth/AuthLayout';
import GoogleIcon from '../components/auth/GoogleIcon';

interface Props {
  darkMode: boolean;
  onToggleTheme: () => void;
}

export default function RegisterPage({ darkMode, onToggleTheme }: Props) {
  const { register, loginWithGoogle } = useAuth();
  const navigate = useNavigate();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const handleRegister = async (event: React.FormEvent) => {
    event.preventDefault();
    setError(null);

    if (password.length < 6) {
      setError('Heslo musí mať aspoň 6 znakov.');
      return;
    }
    if (password !== confirmPassword) {
      setError('Heslá sa nezhodujú.');
      return;
    }

    setSubmitting(true);
    try {
      await register(email, password);
      navigate('/analyza', { replace: true });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Registrácia zlyhala.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleGoogleRegister = async () => {
    setError(null);
    setSubmitting(true);
    try {
      await loginWithGoogle();
      navigate('/analyza', { replace: true });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Registrácia zlyhala.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <AuthLayout
      title="Registrácia"
      subtitle="Vytvor si Pawport účet a začni sledovať zdravie svojho zvieraťa."
      darkMode={darkMode}
      onToggleTheme={onToggleTheme}
    >
      <Box component="form" onSubmit={handleRegister}>
        <Stack gap={2}>
          {error && <Alert severity="error">{error}</Alert>}

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
            autoComplete="new-password"
            required
            fullWidth
            helperText="Aspoň 6 znakov"
          />
          <TextField
            label="Potvrď heslo"
            type="password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            autoComplete="new-password"
            required
            fullWidth
          />

          <Button type="submit" variant="contained" size="large" disabled={submitting} fullWidth>
            Zaregistrovať sa
          </Button>

          <Divider sx={{ my: 0.5 }}>alebo</Divider>

          {isInAppBrowser() && (
            <Alert severity="info">
              Registrácia cez Google nefunguje v prehliadači Messengera/Instagramu. Otvor stránku v
              Chrome/Safari, alebo použi e-mail a heslo.
            </Alert>
          )}

          <Button
            variant="outlined"
            size="large"
            startIcon={<GoogleIcon />}
            onClick={handleGoogleRegister}
            disabled={submitting}
            fullWidth
          >
            Pokračovať cez Google
          </Button>

          <Typography variant="body2" color="text.secondary" sx={{ textAlign: 'center' }}>
            Už máš účet?{' '}
            <Link component={RouterLink} to="/login">
              Prihlás sa
            </Link>
          </Typography>
        </Stack>
      </Box>
    </AuthLayout>
  );
}
