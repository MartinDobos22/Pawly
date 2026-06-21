import { Suspense, useMemo } from 'react';
import { lazyWithRetry as lazy } from './utils/lazyWithRetry';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Box, CircularProgress, CssBaseline, ThemeProvider } from '@mui/material';
import { useTranslation } from 'react-i18next';
import { lightTheme, darkTheme } from './theme';
import { useLocalStorage } from './hooks/useLocalStorage';
import { AuthProvider } from './contexts/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import LandingPage from './pages/LandingPage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';

const VerifyEmailPage = lazy(() => import('./pages/VerifyEmailPage'));
const ResetPasswordPage = lazy(() => import('./pages/ResetPasswordPage'));
const PrivacyPolicyRoute = lazy(() => import('./pages/PrivacyPolicyRoute'));
const FoodAnalysisLandingPage = lazy(() => import('./pages/public/FoodAnalysisLandingPage'));
const HealthPassportLandingPage = lazy(() => import('./pages/public/HealthPassportLandingPage'));
const VaccinationLandingPage = lazy(() => import('./pages/public/VaccinationLandingPage'));
const DewormingLandingPage = lazy(() => import('./pages/public/DewormingLandingPage'));
const FoodAllergyLandingPage = lazy(() => import('./pages/public/FoodAllergyLandingPage'));
const ForbiddenFoodsLandingPage = lazy(() => import('./pages/public/ForbiddenFoodsLandingPage'));
const InfoPublicPage = lazy(() => import('./pages/public/InfoPublicPage'));
const ContactPublicPage = lazy(() => import('./pages/public/ContactPublicPage'));
const PoradnaIndexPage = lazy(() => import('./pages/public/PoradnaIndexPage'));
const PoradnaArticlePage = lazy(() => import('./pages/public/PoradnaArticlePage'));
const ProtectedApp = lazy(() => import('./ProtectedApp'));

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
                element={<FoodAnalysisLandingPage darkMode={darkMode} onToggleTheme={onToggleTheme} />}
              />
              <Route
                path="/digitalny-zdravotny-pas-pre-psa"
                element={
                  <HealthPassportLandingPage darkMode={darkMode} onToggleTheme={onToggleTheme} />
                }
              />
              <Route
                path="/ockovanie-psa"
                element={<VaccinationLandingPage darkMode={darkMode} onToggleTheme={onToggleTheme} />}
              />
              <Route
                path="/odcervenie-psa"
                element={<DewormingLandingPage darkMode={darkMode} onToggleTheme={onToggleTheme} />}
              />
              <Route
                path="/alergia-na-krmivo-u-psa"
                element={<FoodAllergyLandingPage darkMode={darkMode} onToggleTheme={onToggleTheme} />}
              />
              <Route
                path="/co-nesmie-pes-jest"
                element={
                  <ForbiddenFoodsLandingPage darkMode={darkMode} onToggleTheme={onToggleTheme} />
                }
              />
              <Route
                path="/info"
                element={<InfoPublicPage darkMode={darkMode} onToggleTheme={onToggleTheme} />}
              />
              <Route
                path="/kontakt"
                element={<ContactPublicPage darkMode={darkMode} onToggleTheme={onToggleTheme} />}
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
              <Route
                path="/*"
                element={
                  <ProtectedRoute>
                    <ProtectedApp
                      darkMode={darkMode}
                      onToggleTheme={onToggleTheme}
                      language={language}
                    />
                  </ProtectedRoute>
                }
              />
            </Routes>
          </Suspense>
        </BrowserRouter>
      </AuthProvider>
    </ThemeProvider>
  );
}
