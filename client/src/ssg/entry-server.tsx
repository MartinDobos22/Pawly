import { type ReactElement } from 'react';
import { renderToString } from 'react-dom/server';
import { StaticRouter } from 'react-router';
import { ThemeProvider } from '@mui/material/styles';
import { I18nextProvider } from 'react-i18next';
import { lightTheme } from '../theme';
import { AuthContext } from '../contexts/AuthContext';
import ssgI18n from './i18nServer';

const noop = async () => {};

// Statická auth hodnota pre prerender: verejné stránky cez useAuth() vidia
// odhláseného používateľa. Firebase sa pri builde vôbec neinicializuje.
const ssgAuthValue = {
  user: null,
  loading: false,
  register: noop,
  login: noop,
  loginWithGoogle: noop,
  logout: noop,
  resetPassword: noop,
  sendVerificationEmail: noop,
  refreshUser: noop,
};

export function renderPage(path: string, element: ReactElement): string {
  return renderToString(
    <ThemeProvider theme={lightTheme}>
      <I18nextProvider i18n={ssgI18n}>
        <AuthContext.Provider value={ssgAuthValue}>
          <StaticRouter location={path}>{element}</StaticRouter>
        </AuthContext.Provider>
      </I18nextProvider>
    </ThemeProvider>
  );
}
