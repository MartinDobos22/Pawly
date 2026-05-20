import { useMemo } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { CssBaseline, ThemeProvider } from '@mui/material';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { sk } from 'date-fns/locale';
import { lightTheme, darkTheme } from './theme';
import { useLocalStorage } from './hooks/useLocalStorage';
import Layout from './components/Layout';
import AnalyzePage from './pages/AnalyzePage';
import PetProfilePage from './pages/PetProfilePage';
import HistoryPage from './pages/HistoryPage';
import AboutPage from './pages/AboutPage';
import HealthPassportPage from './pages/HealthPassportPage';
import VetCardPage from './pages/VetCardPage';
import EpisodeDiaryPage from './pages/EpisodeDiaryPage';

export default function App() {
  const [darkMode, setDarkMode] = useLocalStorage('granule-check-dark-mode', false);

  const theme = useMemo(() => (darkMode ? darkTheme : lightTheme), [darkMode]);

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <LocalizationProvider dateAdapter={AdapterDateFns} adapterLocale={sk}>
        <BrowserRouter>
          <Layout darkMode={darkMode} onToggleTheme={() => setDarkMode((prev) => !prev)}>
            <Routes>
            <Route path="/" element={<AnalyzePage />} />
            <Route path="/profily" element={<PetProfilePage />} />
            <Route path="/historia" element={<HistoryPage />} />
            <Route path="/zdravotny-pas" element={<HealthPassportPage />} />
            <Route path="/zdravotny-pas/prehlad" element={<HealthPassportPage />} />
            <Route path="/zdravotny-pas/zaznamy" element={<HealthPassportPage />} />
            <Route path="/zdravotny-pas/novy-zaznam" element={<HealthPassportPage />} />
            <Route path="/karta-pre-veterinara" element={<VetCardPage />} />
            <Route path="/dennik" element={<EpisodeDiaryPage />} />
            <Route path="/o-aplikacii" element={<AboutPage />} />
            </Routes>
          </Layout>
        </BrowserRouter>
      </LocalizationProvider>
    </ThemeProvider>
  );
}
