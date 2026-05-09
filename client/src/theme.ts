import { createTheme, ThemeOptions } from '@mui/material/styles';

const fontStack =
  '"Roboto", "Roboto Flex", system-ui, -apple-system, "Segoe UI", "Helvetica Neue", Arial, sans-serif';

const commonOptions: ThemeOptions = {
  typography: {
    fontFamily: fontStack,
    h1: { fontSize: '2.5rem', fontWeight: 700, letterSpacing: '-0.02em' },
    h2: { fontSize: '2rem', fontWeight: 700, letterSpacing: '-0.01em' },
    h3: { fontSize: '1.75rem', fontWeight: 700, letterSpacing: '-0.005em' },
    h4: { fontSize: '1.5rem', fontWeight: 600, letterSpacing: '0' },
    h5: { fontSize: '1.25rem', fontWeight: 600 },
    h6: { fontSize: '1.1rem', fontWeight: 600 },
    subtitle1: { fontSize: '1rem', fontWeight: 600 },
    subtitle2: { fontSize: '0.875rem', fontWeight: 600 },
    body1: { fontSize: '1rem', lineHeight: 1.6, fontWeight: 400 },
    body2: { fontSize: '0.875rem', lineHeight: 1.55, fontWeight: 400 },
    button: { textTransform: 'none', fontWeight: 600, letterSpacing: '0.01em' },
    caption: { fontSize: '0.75rem', fontWeight: 500 },
    overline: { fontSize: '0.7rem', fontWeight: 700, letterSpacing: '0.1em' },
  },
  shape: {
    borderRadius: 8,
  },
  components: {
    MuiCssBaseline: {
      styleOverrides: {
        '@page': {
          size: 'A4',
          margin: '10mm',
        },
        '@media print': {
          html: { width: '100%' },
          body: {
            width: '100%',
            margin: 0,
            WebkitPrintColorAdjust: 'exact',
            printColorAdjust: 'exact',
          },
          '#root': { width: '100%' },
        },
      },
    },
    MuiButton: {
      defaultProps: {
        disableElevation: true,
      },
      styleOverrides: {
        root: {
          borderRadius: 8,
          padding: '8px 20px',
          fontSize: '0.9rem',
          fontWeight: 600,
        },
      },
    },
    MuiCard: {
      defaultProps: {
        variant: 'outlined',
      },
      styleOverrides: {
        root: {
          borderRadius: 8,
          boxShadow: 'none',
        },
      },
    },
    MuiPaper: {
      defaultProps: {
        elevation: 0,
      },
    },
    MuiTextField: {
      styleOverrides: {
        root: {
          '& .MuiOutlinedInput-root': {
            borderRadius: 8,
          },
        },
      },
    },
    MuiChip: {
      styleOverrides: {
        root: {
          borderRadius: 8,
          fontWeight: 600,
          fontSize: '0.8rem',
        },
      },
    },
    MuiAlert: {
      styleOverrides: {
        root: {
          borderRadius: 8,
        },
      },
    },
    MuiDialog: {
      styleOverrides: {
        paper: {
          borderRadius: 12,
        },
      },
    },
    MuiTableCell: {
      styleOverrides: {
        head: {
          fontWeight: 700,
          textTransform: 'uppercase',
          fontSize: '0.72rem',
          letterSpacing: '0.06em',
          color: 'inherit',
        },
      },
    },
  },
};

export const lightTheme = createTheme({
  ...commonOptions,
  palette: {
    mode: 'light',
    primary: {
      main: '#1B5E20',
      light: '#4C8C4A',
      dark: '#003300',
      contrastText: '#ffffff',
    },
    secondary: {
      main: '#FF8F00',
      light: '#FFC046',
      dark: '#C56000',
      contrastText: '#000000',
    },
    background: {
      default: '#FAFAFA',
      paper: '#FFFFFF',
    },
    text: {
      primary: '#1C1B1F',
      secondary: '#49454F',
    },
    error: {
      main: '#BA1A1A',
    },
    success: {
      main: '#2E7D32',
    },
    warning: {
      main: '#F9A825',
    },
  },
});

export const darkTheme = createTheme({
  ...commonOptions,
  palette: {
    mode: 'dark',
    primary: {
      main: '#81C784',
      light: '#B2DFDB',
      dark: '#388E3C',
      contrastText: '#003300',
    },
    secondary: {
      main: '#FFB74D',
      light: '#FFE0B2',
      dark: '#F57C00',
      contrastText: '#000000',
    },
    background: {
      default: '#121212',
      paper: '#1E1E1E',
    },
    text: {
      primary: '#E6E1E5',
      secondary: '#CAC4D0',
    },
    error: {
      main: '#F2B8B5',
    },
    success: {
      main: '#81C784',
    },
    warning: {
      main: '#FFD54F',
    },
  },
});
