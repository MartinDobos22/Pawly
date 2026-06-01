import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Link as RouterLink, Navigate, useNavigate, useSearchParams } from 'react-router-dom';
import {
  Alert,
  Box,
  Button,
  CircularProgress,
  Stack,
  TextField,
  Typography,
  Link,
} from '@mui/material';
import { confirmPasswordReset, verifyPasswordResetCode } from 'firebase/auth';
import { auth } from '../config/firebase';
import AuthLayout from '../components/auth/AuthLayout';
import { logger } from '../utils/logger';

interface Props {
  darkMode: boolean;
  onToggleTheme: () => void;
}

function mapResetError(code: string | undefined): string {
  switch (code) {
    case 'auth/expired-action-code':
      return 'resetPassword.linkExpired';
    case 'auth/invalid-action-code':
      return 'resetPassword.linkInvalid';
    case 'auth/user-disabled':
      return 'resetPassword.userDisabled';
    case 'auth/weak-password':
      return 'resetPassword.weakPassword';
    default:
      return 'resetPassword.failed';
  }
}

export default function ResetPasswordPage({ darkMode, onToggleTheme }: Props) {
  const { t } = useTranslation('auth');
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const oobCode = searchParams.get('oobCode');
  const mode = searchParams.get('mode');
  const hasActionCode = mode === 'resetPassword' && Boolean(oobCode);

  const [verifyingCode, setVerifyingCode] = useState(hasActionCode);
  const [resolvedEmail, setResolvedEmail] = useState<string | null>(null);
  const [codeError, setCodeError] = useState<string | null>(null);

  const [password, setPassword] = useState('');
  const [confirmPwd, setConfirmPwd] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [submitSuccess, setSubmitSuccess] = useState(false);

  // Pri mounte: ak je v URL platný oobCode, overíme ho a získame email.
  useEffect(() => {
    if (!hasActionCode || !oobCode) return;
    let cancelled = false;

    (async () => {
      try {
        const email = await verifyPasswordResetCode(auth, oobCode);
        if (cancelled) return;
        setResolvedEmail(email);
      } catch (err) {
        if (cancelled) return;
        const code = (err as { code?: string }).code;
        logger.warn('verifyPasswordResetCode zlyhal', { code });
        setCodeError(t(mapResetError(code) as never));
      } finally {
        if (!cancelled) setVerifyingCode(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [hasActionCode, oobCode, t]);

  // Po úspechu auto-redirect na /login.
  useEffect(() => {
    if (!submitSuccess) return;
    const id = window.setTimeout(() => navigate('/login', { replace: true }), 1500);
    return () => window.clearTimeout(id);
  }, [submitSuccess, navigate]);

  // Bez oobCode v URL — page nemá zmysel, redirect na login.
  if (!hasActionCode) {
    return <Navigate to="/login" replace />;
  }

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setSubmitError(null);

    if (password.length < 6) {
      setSubmitError(t('resetPassword.weakPassword'));
      return;
    }
    if (password !== confirmPwd) {
      setSubmitError(t('resetPassword.passwordMismatch'));
      return;
    }
    if (!oobCode) return;

    setSubmitting(true);
    try {
      await confirmPasswordReset(auth, oobCode, password);
      setSubmitSuccess(true);
    } catch (err) {
      const code = (err as { code?: string }).code;
      logger.warn('confirmPasswordReset zlyhal', { code });
      setSubmitError(t(mapResetError(code) as never));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <AuthLayout
      title={
        verifyingCode
          ? t('resetPassword.verifyingTitle')
          : submitSuccess
            ? t('resetPassword.successTitle')
            : t('resetPassword.title')
      }
      subtitle={
        verifyingCode
          ? t('resetPassword.verifyingSubtitle')
          : submitSuccess
            ? t('resetPassword.successSubtitle')
            : resolvedEmail
              ? t('resetPassword.subtitle', { email: resolvedEmail })
              : ''
      }
      darkMode={darkMode}
      onToggleTheme={onToggleTheme}
    >
      <Box>
        <Stack gap={2}>
          {verifyingCode && (
            <Stack direction="row" alignItems="center" gap={2}>
              <CircularProgress size={24} />
              <Typography variant="body2">{t('resetPassword.verifying')}</Typography>
            </Stack>
          )}

          {codeError && (
            <>
              <Alert severity="error">{codeError}</Alert>
              <Button component={RouterLink} to="/login" variant="outlined" size="large" fullWidth>
                {t('resetPassword.backToLogin')}
              </Button>
            </>
          )}

          {submitSuccess && (
            <>
              <Alert severity="success">{t('resetPassword.successMessage')}</Alert>
              <Typography variant="body2" color="text.secondary" sx={{ textAlign: 'center' }}>
                {t('resetPassword.redirecting')}
              </Typography>
            </>
          )}

          {!verifyingCode && !codeError && !submitSuccess && (
            <Box component="form" onSubmit={handleSubmit}>
              <Stack gap={2}>
                {submitError && <Alert severity="error">{submitError}</Alert>}

                <TextField
                  label={t('resetPassword.newPassword')}
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  autoComplete="new-password"
                  required
                  fullWidth
                  helperText={t('resetPassword.passwordHint')}
                />
                <TextField
                  label={t('resetPassword.confirmPassword')}
                  type="password"
                  value={confirmPwd}
                  onChange={(e) => setConfirmPwd(e.target.value)}
                  autoComplete="new-password"
                  required
                  fullWidth
                />

                <Button
                  type="submit"
                  variant="contained"
                  size="large"
                  disabled={submitting}
                  fullWidth
                >
                  {submitting ? t('resetPassword.submitting') : t('resetPassword.submit')}
                </Button>

                <Typography variant="body2" color="text.secondary" sx={{ textAlign: 'center' }}>
                  <Link component={RouterLink} to="/login">
                    {t('resetPassword.backToLogin')}
                  </Link>
                </Typography>
              </Stack>
            </Box>
          )}
        </Stack>
      </Box>
    </AuthLayout>
  );
}
