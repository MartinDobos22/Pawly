import { useMemo } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { CssBaseline, ThemeProvider } from '@mui/material';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { sk, enUS } from 'date-fns/locale';
import { useTranslation } from 'react-i18next';
import { lightTheme, darkTheme } from './theme';
import { useLocalStorage } from './hooks/useLocalStorage';
import { AuthProvider } from './contexts/AuthContext';
import { PetProfilesProvider } from './contexts/PetProfilesContext';
import { ActivePetProvider } from './contexts/ActivePetContext';
import { HealthDataProvider } from './contexts/HealthDataContext';
import ProtectedRoute from './components/ProtectedRoute';
import Layout from './components/Layout';
import LandingPage from './pages/LandingPage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import VerifyEmailPage from './pages/VerifyEmailPage';
import ResetPasswordPage from './pages/ResetPasswordPage';
import AnalyzePage from './pages/AnalyzePage';
import PetProfilePage from './pages/PetProfilePage';
import HistoryPage from './pages/HistoryPage';
import InfoPage from './pages/InfoPage';
import ContactPage from './pages/ContactPage';
import SupportProjectPage from './pages/SupportProjectPage';
import PrivacyPolicyRoute from './pages/PrivacyPolicyRoute';
import HealthPassportPage from './pages/HealthPassportPage';
import VetCardPage from './pages/VetCardPage';
import EpisodeDiaryPage from './pages/EpisodeDiaryPage';
import NotificationsPage from './pages/NotificationsPage';
import SettingsPage from './pages/SettingsPage';
import NotFoundPage from './pages/NotFoundPage';

export default function App() {
  const [darkMode, setDarkMode] = useLocalStorage('granule-check-dark-mode', false);
  const { i18n } = useTranslation();

  const theme = useMemo(() => (darkMode ? darkTheme : lightTheme), [darkMode]);
  const onToggleTheme = () => setDarkMode((prev) => !prev);
  const dateLocale = i18n.language === 'en' ? enUS : sk;

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <LocalizationProvider dateAdapter={AdapterDateFns} adapterLocale={dateLocale}>
        <AuthProvider>
          <BrowserRouter>
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
                    <PetProfilesProvider>
                      <ActivePetProvider>
                        <HealthDataProvider>
                          <Layout darkMode={darkMode} onToggleTheme={onToggleTheme}>
                            <Routes>
                              <Route path="/analyza" element={<AnalyzePage />} />
                              <Route path="/profily" element={<PetProfilePage />} />
                              <Route path="/historia" element={<HistoryPage />} />
                              <Route path="/zdravotny-pas" element={<HealthPassportPage />} />
                              <Route
                                path="/zdravotny-pas/prehlad"
                                element={<HealthPassportPage />}
                              />
                              <Route
                                path="/zdravotny-pas/zaznamy"
                                element={<HealthPassportPage />}
                              />
                              <Route
                                path="/zdravotny-pas/novy-zaznam"
                                element={<HealthPassportPage />}
                              />
                              <Route path="/karta-pre-veterinara" element={<VetCardPage />} />
                              <Route path="/dennik" element={<EpisodeDiaryPage />} />
                              <Route path="/notifikacie" element={<NotificationsPage />} />
                              <Route path="/info" element={<InfoPage />} />
                              <Route path="/kontakt" element={<ContactPage />} />
                              <Route path="/podpora" element={<SupportProjectPage />} />
                              <Route
                                path="/o-aplikacii"
                                element={<Navigate to="/info?tab=about" replace />}
                              />
                              <Route
                                path="/caste-otazky"
                                element={<Navigate to="/info?tab=faq" replace />}
                              />
                              <Route
                                path="/nastavenia"
                                element={
                                  <SettingsPage darkMode={darkMode} onToggleTheme={onToggleTheme} />
                                }
                              />
                              <Route path="*" element={<NotFoundPage />} />
                            </Routes>
                          </Layout>
                        </HealthDataProvider>
                      </ActivePetProvider>
                    </PetProfilesProvider>
                  </ProtectedRoute>
                }
              />
            </Routes>
          </BrowserRouter>
        </AuthProvider>
      </LocalizationProvider>
    </ThemeProvider>
  );
}
