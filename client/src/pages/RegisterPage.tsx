import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Link as RouterLink, useNavigate } from 'react-router-dom';
import { Alert, Box, Button, Divider, Link, Stack, TextField, Typography } from '@mui/material';
import { useAuth } from '../hooks/useAuth';
import { isGoogleUser } from '../utils/isGoogleUser';
import { isInAppBrowser } from '../utils/isInAppBrowser';
import AuthLayout from '../components/auth/AuthLayout';
import GoogleIcon from '../components/auth/GoogleIcon';

interface Props {
  darkMode: boolean;
  onToggleTheme: () => void;
}

export default function RegisterPage({ darkMode, onToggleTheme }: Props) {
  const { user, register, loginWithGoogle } = useAuth();
  const navigate = useNavigate();
  const { t } = useTranslation('auth');

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const inAppBrowser = isInAppBrowser();

  useEffect(() => {
    if (!user) return;
    if (!user.emailVerified && !isGoogleUser(user)) {
      navigate('/overenie-emailu', { replace: true });
    } else {
      navigate('/zdravotny-pas', { replace: true });
    }
  }, [user, navigate]);

  const handleRegister = async (event: React.FormEvent) => {
    event.preventDefault();
    setError(null);

    if (password.length < 6) {
      setError(t('register.passwordTooShort'));
      return;
    }
    if (password !== confirmPassword) {
      setError(t('register.passwordMismatch'));
      return;
    }

    setSubmitting(true);
    try {
      await register(email, password);
      navigate('/overenie-emailu', { replace: true });
    } catch (err) {
      setError(err instanceof Error ? err.message : t('register.registrationFailed'));
    } finally {
      setSubmitting(false);
    }
  };

  const handleGoogleRegister = async () => {
    setError(null);
    setSubmitting(true);
    try {
      await loginWithGoogle();
      navigate('/zdravotny-pas', { replace: true });
    } catch (err) {
      setError(err instanceof Error ? err.message : t('register.registrationFailed'));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <AuthLayout
      title={t('register.title')}
      subtitle={t('register.subtitle')}
      darkMode={darkMode}
      onToggleTheme={onToggleTheme}
    >
      <Box component="form" onSubmit={handleRegister}>
        <Stack gap={2}>
          {error && <Alert severity="error">{error}</Alert>}

          <TextField
            label={t('register.email')}
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            autoComplete="email"
            required
            fullWidth
          />
          <TextField
            label={t('register.password')}
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            autoComplete="new-password"
            required
            fullWidth
            helperText={t('register.passwordHint')}
          />
          <TextField
            label={t('register.confirmPassword')}
            type="password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            autoComplete="new-password"
            required
            fullWidth
          />

          <Button type="submit" variant="contained" size="large" disabled={submitting} fullWidth>
            {t('register.submit')}
          </Button>

          <Divider sx={{ my: 0.5 }}>{t('register.or')}</Divider>

          {inAppBrowser && <Alert severity="info">{t('register.inAppBrowserWarning')}</Alert>}

          <Button
            variant="outlined"
            size="large"
            startIcon={<GoogleIcon />}
            onClick={handleGoogleRegister}
            disabled={submitting || inAppBrowser}
            fullWidth
          >
            {t('register.googleRegister')}
          </Button>

          <Typography variant="body2" color="text.secondary" sx={{ textAlign: 'center' }}>
            {t('register.hasAccount')}{' '}
            <Link component={RouterLink} to="/login">
              {t('register.login')}
            </Link>
          </Typography>
        </Stack>
      </Box>
    </AuthLayout>
  );
}
