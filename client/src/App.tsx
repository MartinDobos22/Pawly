import { Suspense, useMemo, type ReactNode } from 'react';
import { lazyWithRetry as lazy } from './utils/lazyWithRetry';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Box, CircularProgress, CssBaseline, ThemeProvider } from '@mui/material';
import { useTranslation } from 'react-i18next';
import { lightTheme, darkTheme } from './theme';
import { useLocalStorage } from './hooks/useLocalStorage';
import { AuthProvider } from './contexts/AuthContext';
import { useAuth } from './hooks/useAuth';
import ProtectedRoute from './components/ProtectedRoute';
import LandingPage from './pages/LandingPage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';

const VerifyEmailPage = lazy(() => import('./pages/VerifyEmailPage'));
const ResetPasswordPage = lazy(() => import('./pages/ResetPasswordPage'));
const PrivacyPolicyRoute = lazy(() => import('./pages/PrivacyPolicyRoute'));
const InfoPublicPage = lazy(() => import('./pages/public/InfoPublicPage'));
const ContactPublicPage = lazy(() => import('./pages/public/ContactPublicPage'));
const PoradnaIndexPage = lazy(() => import('./pages/public/PoradnaIndexPage'));
const PoradnaArticlePage = lazy(() => import('./pages/public/PoradnaArticlePage'));
const ProtectedApp = lazy(() => import('./ProtectedApp'));

// Stránky `/info` a `/kontakt` sú verejné (marketing), ale prihlásený používateľ
// k nim chodí cez bočné menu — vtedy ich chceme vykresliť v app shelle (so sidebarom),
// nie ako samostatnú verejnú stránku bez navigácie.
function AuthAwareRoute({
  publicElement,
  protectedElement,
  fallback,
}: {
  publicElement: ReactNode;
  protectedElement: ReactNode;
  fallback: ReactNode;
}) {
  const { user, loading } = useAuth();
  if (loading) return <>{fallback}</>;
  return <>{user ? protectedElement : publicElement}</>;
}

export default function App() {
  const [darkMode, setDarkMode] = useLocalStorage('granule-check-dark-mode', false);
  const { i18n } = useTranslation();

  const theme = useMemo(() => (darkMode ? darkTheme : lightTheme), [darkMode]);
  const onToggleTheme = () => setDarkMode((prev) => !prev);
  const language = i18n.language;

  const suspenseFallback = (
    <Box
      sx={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        bgcolor: 'background.default',
      }}
    >
      <CircularProgress />
    </Box>
  );

  const protectedApp = (
    <ProtectedRoute>
      <ProtectedApp darkMode={darkMode} onToggleTheme={onToggleTheme} language={language} />
    </ProtectedRoute>
  );

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <AuthProvider>
        <BrowserRouter>
          <Suspense fallback={suspenseFallback}>
            <Routes>
              <Route
                path="/"
                element={<LandingPage darkMode={darkMode} onToggleTheme={onToggleTheme} />}
              />
              <Route
                path="/login"
                element={<LoginPage darkMode={darkMode} onToggleTheme={onToggleTheme} />}
              />
              <Route
                path="/register"
                element={<RegisterPage darkMode={darkMode} onToggleTheme={onToggleTheme} />}
              />
              <Route
                path="/overenie-emailu"
                element={<VerifyEmailPage darkMode={darkMode} onToggleTheme={onToggleTheme} />}
              />
              <Route
                path="/reset-hesla"
                element={<ResetPasswordPage darkMode={darkMode} onToggleTheme={onToggleTheme} />}
              />
              <Route
                path="/ochrana-sukromia"
                element={<PrivacyPolicyRoute darkMode={darkMode} onToggleTheme={onToggleTheme} />}
              />
              <Route
                path="/analyza-krmiva-pre-psa"
                element={<Navigate to="/poradna/analyza-krmiva-pre-psa" replace />}
              />
              <Route
                path="/digitalny-zdravotny-pas-pre-psa"
                element={<Navigate to="/poradna/digitalny-zdravotny-pas-pre-psa" replace />}
              />
              <Route
                path="/ockovanie-psa"
                element={<Navigate to="/poradna/ockovanie-psa" replace />}
              />
              <Route
                path="/odcervenie-psa"
                element={<Navigate to="/poradna/odcervenie-psa" replace />}
              />
              <Route
                path="/alergia-na-krmivo-u-psa"
                element={<Navigate to="/poradna/alergia-na-krmivo-u-psa" replace />}
              />
              <Route
                path="/co-nesmie-pes-jest"
                element={<Navigate to="/poradna/co-nesmie-pes-jest" replace />}
              />
              <Route
                path="/info"
                element={
                  <AuthAwareRoute
                    fallback={suspenseFallback}
                    protectedElement={protectedApp}
                    publicElement={
                      <InfoPublicPage darkMode={darkMode} onToggleTheme={onToggleTheme} />
                    }
                  />
                }
              />
              <Route
                path="/kontakt"
                element={
                  <AuthAwareRoute
                    fallback={suspenseFallback}
                    protectedElement={protectedApp}
                    publicElement={
                      <ContactPublicPage darkMode={darkMode} onToggleTheme={onToggleTheme} />
                    }
                  />
                }
              />
              <Route
                path="/poradna"
                element={<PoradnaIndexPage darkMode={darkMode} onToggleTheme={onToggleTheme} />}
              />
              <Route
                path="/poradna/:slug"
                element={<PoradnaArticlePage darkMode={darkMode} onToggleTheme={onToggleTheme} />}
              />
              <Route path="/o-aplikacii" element={<Navigate to="/info?tab=about" replace />} />
              <Route path="/caste-otazky" element={<Navigate to="/info?tab=faq" replace />} />
              <Route path="/*" element={protectedApp} />
            </Routes>
          </Suspense>
        </BrowserRouter>
      </AuthProvider>
    </ThemeProvider>
  );
}
