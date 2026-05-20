import { createTheme, ThemeOptions } from '@mui/material/styles';

const fontStack =
  '"Inter", "Roboto", "Roboto Flex", system-ui, -apple-system, "Segoe UI", "Helvetica Neue", Arial, sans-serif';

const lightSurface = {
  default: '#FAF7F2',
  paper: '#FFFFFF',
  variant: '#F3EEE7',
  variantStrong: '#EBE3D6',
  divider: '#E6DFD4',
};

const darkSurface = {
  default: '#1A1F22',
  paper: '#222A2D',
  variant: '#2C353A',
  variantStrong: '#374249',
  divider: 'rgba(255,255,255,0.08)',
};

const lightShadows = {
  s1: '0 1px 2px rgba(15,76,92,0.06)',
  s2: '0 4px 12px rgba(15,76,92,0.08)',
  s3: '0 12px 32px rgba(15,76,92,0.12)',
};

const darkShadows = {
  s1: '0 1px 2px rgba(0,0,0,0.4)',
  s2: '0 6px 16px rgba(0,0,0,0.4)',
  s3: '0 16px 40px rgba(0,0,0,0.5)',
};

const commonOptions: ThemeOptions = {
  typography: {
    fontFamily: fontStack,
    h1: { fontSize: '2.5rem', fontWeight: 600, lineHeight: 1.15, letterSpacing: '-0.02em' },
    h2: { fontSize: '2rem', fontWeight: 600, lineHeight: 1.2, letterSpacing: '-0.015em' },
    h3: { fontSize: '1.5rem', fontWeight: 600, lineHeight: 1.25, letterSpacing: '-0.01em' },
    h4: { fontSize: '1.25rem', fontWeight: 600, lineHeight: 1.3 },
    h5: { fontSize: '1.0625rem', fontWeight: 600, lineHeight: 1.35 },
    h6: { fontSize: '0.9375rem', fontWeight: 600, lineHeight: 1.4 },
    subtitle1: { fontSize: '1rem', fontWeight: 600 },
    subtitle2: { fontSize: '0.875rem', fontWeight: 600 },
    body1: { fontSize: '1rem', lineHeight: 1.6, fontWeight: 400 },
    body2: { fontSize: '0.875rem', lineHeight: 1.55, fontWeight: 400 },
    button: { textTransform: 'none', fontWeight: 600, letterSpacing: '0.01em' },
    caption: {
      fontSize: '0.75rem',
      fontWeight: 600,
      lineHeight: 1.4,
      letterSpacing: '0.08em',
      textTransform: 'uppercase',
    },
    overline: {
      fontSize: '0.6875rem',
      fontWeight: 700,
      letterSpacing: '0.12em',
      textTransform: 'uppercase',
    },
  },
  shape: {
    borderRadius: 12,
  },
  components: {
    MuiCssBaseline: {
      styleOverrides: {
        body: {
          fontFeatureSettings: '"ss01", "cv11"',
        },
        '@page': {
          size: 'A4',
          margin: '10mm',
        },
        '@media print': {
          html: { width: '100%' },
          body: {
            width: '100%',
            margin: 0,
            backgroundColor: '#FFFFFF',
            color: '#000000',
            WebkitPrintColorAdjust: 'exact',
            printColorAdjust: 'exact',
          },
          '#root': { width: '100%' },
          '.MuiCard-root, .MuiPaper-root': {
            boxShadow: 'none !important',
            border: '1px solid #DDDDDD !important',
            backgroundColor: '#FFFFFF !important',
          },
          '.MuiButton-root, .MuiIconButton-root': {
            display: 'none !important',
          },
          'a[href^="#"]': {
            display: 'none !important',
          },
        },
      },
    },
    MuiButton: {
      defaultProps: {
        disableElevation: true,
      },
      styleOverrides: {
        root: {
          borderRadius: 999,
          padding: '10px 20px',
          fontSize: '0.9rem',
          fontWeight: 600,
          minHeight: 40,
        },
        sizeSmall: {
          padding: '6px 14px',
          minHeight: 32,
        },
        sizeLarge: {
          padding: '12px 26px',
          minHeight: 48,
          fontSize: '0.95rem',
        },
        outlined: {
          borderWidth: 1,
        },
      },
    },
    MuiIconButton: {
      styleOverrides: {
        root: {
          borderRadius: 12,
        },
      },
    },
    MuiButtonBase: {
      styleOverrides: {
        root: {
          '&:focus-visible': {
            outline: '2px solid currentColor',
            outlineOffset: 2,
          },
        },
      },
    },
    MuiCard: {
      defaultProps: {
        variant: 'outlined',
      },
      styleOverrides: {
        root: {
          borderRadius: 16,
          boxShadow: 'none',
        },
      },
    },
    MuiPaper: {
      defaultProps: {
        elevation: 0,
      },
      styleOverrides: {
        rounded: {
          borderRadius: 16,
        },
      },
    },
    MuiTextField: {
      defaultProps: {
        size: 'small',
      },
      styleOverrides: {
        root: {
          '& .MuiOutlinedInput-root': {
            borderRadius: 12,
          },
        },
      },
    },
    MuiChip: {
      styleOverrides: {
        root: {
          borderRadius: 999,
          fontWeight: 600,
          fontSize: '0.78rem',
          letterSpacing: '0.01em',
        },
        outlined: {
          borderWidth: 1,
        },
      },
    },
    MuiAlert: {
      styleOverrides: {
        root: {
          borderRadius: 12,
        },
      },
    },
    MuiDialog: {
      styleOverrides: {
        paper: {
          borderRadius: 20,
        },
      },
    },
    MuiTableCell: {
      styleOverrides: {
        head: {
          fontWeight: 700,
          textTransform: 'uppercase',
          fontSize: '0.7rem',
          letterSpacing: '0.08em',
          color: 'inherit',
        },
      },
    },
    MuiTooltip: {
      styleOverrides: {
        tooltip: {
          borderRadius: 8,
          fontSize: '0.75rem',
          paddingInline: 10,
          paddingBlock: 6,
        },
      },
    },
    MuiDivider: {
      styleOverrides: {
        root: {
          borderColor: 'inherit',
          opacity: 0.7,
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
      main: '#0F4C5C',
      light: '#3A7C8C',
      dark: '#06303A',
      contrastText: '#FFFFFF',
    },
    secondary: {
      main: '#D97706',
      light: '#F2A341',
      dark: '#9C5305',
      contrastText: '#FFFFFF',
    },
    background: {
      default: lightSurface.default,
      paper: lightSurface.paper,
    },
    text: {
      primary: '#1A2A2F',
      secondary: '#5C6B70',
      disabled: 'rgba(26,42,47,0.38)',
    },
    divider: lightSurface.divider,
    error: {
      main: '#B4452C',
      light: '#D77963',
      dark: '#7E2C18',
      contrastText: '#FFFFFF',
    },
    success: {
      main: '#2F7D5B',
      light: '#5DA585',
      dark: '#1F5640',
      contrastText: '#FFFFFF',
    },
    warning: {
      main: '#B8860B',
      light: '#D5A638',
      dark: '#825F08',
      contrastText: '#FFFFFF',
    },
    info: {
      main: '#3A7C8C',
      light: '#6FA4B2',
      dark: '#1F5662',
      contrastText: '#FFFFFF',
    },
  },
});

export const darkTheme = createTheme({
  ...commonOptions,
  palette: {
    mode: 'dark',
    primary: {
      main: '#6FBED1',
      light: '#9AD2DF',
      dark: '#3F8FA1',
      contrastText: '#06212A',
    },
    secondary: {
      main: '#F2A341',
      light: '#F7C281',
      dark: '#B97A1F',
      contrastText: '#1A1306',
    },
    background: {
      default: darkSurface.default,
      paper: darkSurface.paper,
    },
    text: {
      primary: '#ECEDEE',
      secondary: '#A6B0B5',
      disabled: 'rgba(236,237,238,0.38)',
    },
    divider: darkSurface.divider,
    error: {
      main: '#F0997E',
      light: '#F5BAA5',
      dark: '#C8694E',
      contrastText: '#1E0A04',
    },
    success: {
      main: '#8BD3AF',
      light: '#B0E0C8',
      dark: '#4F9B76',
      contrastText: '#0C2418',
    },
    warning: {
      main: '#E0B85F',
      light: '#EFD191',
      dark: '#A6822F',
      contrastText: '#1E1606',
    },
    info: {
      main: '#8AC6D4',
      light: '#B5DCE5',
      dark: '#4D8A98',
      contrastText: '#06212A',
    },
  },
});

export const surfaceTokens = {
  light: lightSurface,
  dark: darkSurface,
};

export const shadowTokens = {
  light: lightShadows,
  dark: darkShadows,
};
