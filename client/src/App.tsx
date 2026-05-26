import { useMemo } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { CssBaseline, ThemeProvider } from '@mui/material';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { sk } from 'date-fns/locale';
import { lightTheme, darkTheme } from './theme';
import { useLocalStorage } from './hooks/useLocalStorage';
import { AuthProvider } from './contexts/AuthContext';
import { PetProfilesProvider } from './contexts/PetProfilesContext';
import { HealthDataProvider } from './contexts/HealthDataContext';
import ProtectedRoute from './components/ProtectedRoute';
import Layout from './components/Layout';
import LandingPage from './pages/LandingPage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import AnalyzePage from './pages/AnalyzePage';
import PetProfilePage from './pages/PetProfilePage';
import HistoryPage from './pages/HistoryPage';
import AboutPage from './pages/AboutPage';
import FaqPage from './pages/FaqPage';
import HealthPassportPage from './pages/HealthPassportPage';
import VetCardPage from './pages/VetCardPage';
import EpisodeDiaryPage from './pages/EpisodeDiaryPage';

export default function App() {
  const [darkMode, setDarkMode] = useLocalStorage('granule-check-dark-mode', false);

  const theme = useMemo(() => (darkMode ? darkTheme : lightTheme), [darkMode]);
  const onToggleTheme = () => setDarkMode((prev) => !prev);

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <LocalizationProvider dateAdapter={AdapterDateFns} adapterLocale={sk}>
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
              path="/*"
              element={
                <ProtectedRoute>
                  <PetProfilesProvider>
                  <HealthDataProvider>
                  <Layout darkMode={darkMode} onToggleTheme={onToggleTheme}>
                  <Routes>
                    <Route path="/analyza" element={<AnalyzePage />} />
                    <Route path="/profily" element={<PetProfilePage />} />
                    <Route path="/historia" element={<HistoryPage />} />
                    <Route path="/zdravotny-pas" element={<HealthPassportPage />} />
                    <Route path="/zdravotny-pas/prehlad" element={<HealthPassportPage />} />
                    <Route path="/zdravotny-pas/zaznamy" element={<HealthPassportPage />} />
                    <Route path="/zdravotny-pas/novy-zaznam" element={<HealthPassportPage />} />
                    <Route path="/karta-pre-veterinara" element={<VetCardPage />} />
                    <Route path="/dennik" element={<EpisodeDiaryPage />} />
                    <Route path="/o-aplikacii" element={<AboutPage />} />
                    <Route path="/caste-otazky" element={<FaqPage />} />
                  </Routes>
                  </Layout>
                  </HealthDataProvider>
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
