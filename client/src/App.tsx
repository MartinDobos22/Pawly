import { lazy, Suspense, useMemo } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
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
