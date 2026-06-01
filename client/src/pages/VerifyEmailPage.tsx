import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Navigate, useNavigate } from 'react-router-dom';
import { Alert, Box, Button, Link, Stack, Typography } from '@mui/material';
import { auth } from '../config/firebase';
import { useAuth } from '../hooks/useAuth';
import { isGoogleUser } from '../utils/isGoogleUser';
import AuthLayout from '../components/auth/AuthLayout';

interface Props {
  darkMode: boolean;
  onToggleTheme: () => void;
}

const RESEND_COOLDOWN_SECONDS = 60;

export default function VerifyEmailPage({ darkMode, onToggleTheme }: Props) {
  const { user, sendVerificationEmail, refreshUser, logout } = useAuth();
  const { t } = useTranslation('auth');
  const navigate = useNavigate();

  const [cooldown, setCooldown] = useState(0);
  const [info, setInfo] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (cooldown <= 0) return;
    const id = window.setTimeout(() => setCooldown((c) => c - 1), 1000);
    return () => window.clearTimeout(id);
  }, [cooldown]);

  if (!user) {
    return <Navigate to="/login" replace />;
  }
  if (user.emailVerified || isGoogleUser(user)) {
    return <Navigate to="/zdravotny-pas" replace />;
  }

  const handleResend = async () => {
    setError(null);
    setInfo(null);
    setSubmitting(true);
    try {
      await sendVerificationEmail();
      setInfo(t('verify.resentOk'));
      setCooldown(RESEND_COOLDOWN_SECONDS);
    } catch (err) {
      setError(err instanceof Error ? err.message : t('verify.resendFailed'));
    } finally {
      setSubmitting(false);
    }
  };

  const handleICheck = async () => {
    setError(null);
    setInfo(null);
    setSubmitting(true);
    try {
      // refreshUser() reload-uje Firebase backend state, refreshne ID token
      // a synchronizuje React user state. Bez page reloadu — predtým
      // window.location.assign vyrábal race condition s Firebase SDK hydratáciou.
      await refreshUser();
      if (!auth.currentUser?.emailVerified) {
        setError(t('verify.stillNotVerified'));
        return;
      }
      navigate('/zdravotny-pas', { replace: true });
    } catch (err) {
      setError(err instanceof Error ? err.message : t('verify.stillNotVerified'));
    } finally {
      setSubmitting(false);
    }
  };

  const handleLogout = async () => {
    try {
      await logout();
    } catch {
      /* ignore */
    }
  };

  return (
    <AuthLayout
      title={t('verify.title')}
      subtitle={t('verify.subtitle', { email: user.email ?? '' })}
      darkMode={darkMode}
      onToggleTheme={onToggleTheme}
    >
      <Box>
        <Stack gap={2}>
          {info && <Alert severity="success">{info}</Alert>}
          {error && <Alert severity="error">{error}</Alert>}

          <Typography variant="body2" color="text.secondary">
            {t('verify.instructions')}
          </Typography>

          <Button
            variant="contained"
            size="large"
            onClick={handleICheck}
            disabled={submitting}
            fullWidth
          >
            {submitting ? t('verify.checking') : t('verify.iVerified')}
          </Button>

          <Button
            variant="outlined"
            size="large"
            onClick={handleResend}
            disabled={submitting || cooldown > 0}
            fullWidth
          >
            {cooldown > 0 ? t('verify.resendCooldown', { seconds: cooldown }) : t('verify.resend')}
          </Button>

          <Typography variant="body2" color="text.secondary" sx={{ textAlign: 'center' }}>
            <Link component="button" type="button" onClick={handleLogout}>
              {t('verify.logout')}
            </Link>
          </Typography>
        </Stack>
      </Box>
    </AuthLayout>
  );
}
