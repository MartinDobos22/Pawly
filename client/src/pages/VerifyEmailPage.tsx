import { useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Link as RouterLink, Navigate, useNavigate, useSearchParams } from 'react-router-dom';
import { Alert, Box, Button, CircularProgress, Link, Stack, Typography } from '@mui/material';
import { applyActionCode } from 'firebase/auth';
import { auth } from '../config/firebase';
import { useAuth } from '../hooks/useAuth';
import { isGoogleUser } from '../utils/isGoogleUser';
import AuthLayout from '../components/auth/AuthLayout';
import { logger } from '../utils/logger';

interface Props {
  darkMode: boolean;
  onToggleTheme: () => void;
}

const RESEND_COOLDOWN_SECONDS = 60;
const SUCCESS_REDIRECT_DELAY_MS = 1200;

function mapApplyActionCodeError(code: string | undefined): string {
  switch (code) {
    case 'auth/expired-action-code':
      return 'verify.linkExpired';
    case 'auth/invalid-action-code':
      return 'verify.linkInvalid';
    case 'auth/user-disabled':
      return 'verify.userDisabled';
    default:
      return 'verify.verifyFailed';
  }
}

export default function VerifyEmailPage({ darkMode, onToggleTheme }: Props) {
  const { user, sendVerificationEmail, refreshUser, logout } = useAuth();
  const { t } = useTranslation('auth');
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const oobCode = searchParams.get('oobCode');
  const mode = searchParams.get('mode');
  const hasActionCode = mode === 'verifyEmail' && Boolean(oobCode);

  const [cooldown, setCooldown] = useState(0);
  const [info, setInfo] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [verifying, setVerifying] = useState(hasActionCode);
  const [verifiedSuccess, setVerifiedSuccess] = useState(false);

  useEffect(() => {
    if (cooldown <= 0) return;
    const id = window.setTimeout(() => setCooldown((c) => c - 1), 1000);
    return () => window.clearTimeout(id);
  }, [cooldown]);

  // Auto-apply oobCode z URL pri prvom mounte. Beží len ak link obsahuje
  // mode=verifyEmail&oobCode=... — t.j. user prišiel z emailu.
  useEffect(() => {
    if (!hasActionCode || !oobCode) return;
    let cancelled = false;

    (async () => {
      try {
        await applyActionCode(auth, oobCode);
        if (cancelled) return;
        if (auth.currentUser) {
          await refreshUser();
        }
        setVerifiedSuccess(true);
        setError(null);
      } catch (err) {
        if (cancelled) return;
        const code = (err as { code?: string }).code;
        logger.warn('applyActionCode zlyhal', { code });
        setError(t(mapApplyActionCodeError(code) as never));
      } finally {
        if (!cancelled) setVerifying(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [hasActionCode, oobCode, refreshUser, t]);

  // Po úspechu + signed-in user → krátka success message a navigate na dashboard.
  useEffect(() => {
    if (!verifiedSuccess) return;
    if (!user?.emailVerified) return;
    const id = window.setTimeout(
      () => navigate('/zdravotny-pas', { replace: true }),
      SUCCESS_REDIRECT_DELAY_MS
    );
    return () => window.clearTimeout(id);
  }, [verifiedSuccess, user?.emailVerified, navigate]);

  const verifiedButNoSession = verifiedSuccess && !auth.currentUser;
  const subtitle = useMemo(() => {
    if (verifying) return t('verify.verifyingSubtitle');
    if (verifiedSuccess) return t('verify.verifiedSubtitle');
    return t('verify.subtitle', { email: user?.email ?? '' });
  }, [verifying, verifiedSuccess, t, user?.email]);

  // Ak je user už verified (alebo Google) → vždy ďalej do appky.
  // Toto rieši aj prípad keď user klikne starý/už-použitý link po overení.
  if (user && (user.emailVerified || isGoogleUser(user))) {
    return <Navigate to="/zdravotny-pas" replace />;
  }
  // Bez session a bez oobCode → na login.
  if (!hasActionCode && !user) {
    return <Navigate to="/login" replace />;
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
      title={
        verifying
          ? t('verify.verifyingTitle')
          : verifiedSuccess
            ? t('verify.verifiedTitle')
            : t('verify.title')
      }
      subtitle={subtitle}
      darkMode={darkMode}
      onToggleTheme={onToggleTheme}
    >
      <Box>
        <Stack gap={2}>
          {verifying && (
            <Stack direction="row" alignItems="center" gap={2}>
              <CircularProgress size={24} />
              <Typography variant="body2">{t('verify.verifying')}</Typography>
            </Stack>
          )}

          {verifiedSuccess && !verifiedButNoSession && (
            <Alert severity="success">{t('verify.verifiedSuccess')}</Alert>
          )}

          {verifiedButNoSession && (
            <>
              <Alert severity="success">{t('verify.verifiedSignIn')}</Alert>
              <Button component={RouterLink} to="/login" variant="contained" size="large" fullWidth>
                {t('login.submit')}
              </Button>
            </>
          )}

          {info && !verifiedSuccess && <Alert severity="success">{info}</Alert>}
          {error && <Alert severity="error">{error}</Alert>}

          {!verifying && !verifiedSuccess && user && (
            <>
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
                {cooldown > 0
                  ? t('verify.resendCooldown', { seconds: cooldown })
                  : t('verify.resend')}
              </Button>

              <Typography variant="body2" color="text.secondary" sx={{ textAlign: 'center' }}>
                <Link component="button" type="button" onClick={handleLogout}>
                  {t('verify.logout')}
                </Link>
              </Typography>
            </>
          )}
        </Stack>
      </Box>
    </AuthLayout>
  );
}
