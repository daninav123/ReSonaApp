import { createTheme, responsiveFontSizes } from '@mui/material/styles';
import { red, blue, green, orange, grey } from '@mui/material/colors';

declare module '@mui/material/styles' {
  interface Theme {
    customShadows: {
      card: string;
      dialog: string;
      dropdown: string;
    };
  }
  interface ThemeOptions {
    customShadows?: {
      card?: string;
      dialog?: string;
      dropdown?: string;
    };
  }
}

// Paleta de colores principal
const primary = {
  main: '#1976d2',
  light: '#42a5f5',
  dark: '#1565c0',
  contrastText: '#fff',
};

const secondary = {
  main: '#9c27b0',
  light: '#ba68c8',
  dark: '#7b1fa2',
  contrastText: '#fff',
};

// Paleta de colores de estado
const success = {
  main: green[600],
  light: green[400],
  dark: green[800],
  contrastText: '#fff',
};

const error = {
  main: red[600],
  light: red[400],
  dark: red[800],
  contrastText: '#fff',
};

const warning = {
  main: orange[600],
  light: orange[400],
  dark: orange[800],
  contrastText: '#fff',
};

const info = {
  main: blue[600],
  light: blue[400],
  dark: blue[800],
  contrastText: '#fff',
};

// Configuración de tipografía
const typography = {
  fontFamily: [
    '-apple-system',
    'BlinkMacSystemFont',
    '"Segoe UI"',
    'Roboto',
    '"Helvetica Neue"',
    'Arial',
    'sans-serif',
    '"Apple Color Emoji"',
    '"Segoe UI Emoji"',
    '"Segoe UI Symbol"',
  ].join(','),
  h1: {
    fontSize: '2.5rem',
    fontWeight: 600,
    lineHeight: 1.2,
  },
  h2: {
    fontSize: '2rem',
    fontWeight: 600,
    lineHeight: 1.3,
  },
  h3: {
    fontSize: '1.75rem',
    fontWeight: 600,
    lineHeight: 1.3,
  },
  h4: {
    fontSize: '1.5rem',
    fontWeight: 600,
    lineHeight: 1.4,
  },
  h5: {
    fontSize: '1.25rem',
    fontWeight: 600,
    lineHeight: 1.4,
  },
  h6: {
    fontSize: '1.125rem',
    fontWeight: 600,
    lineHeight: 1.4,
  },
  subtitle1: {
    fontSize: '1rem',
    fontWeight: 500,
    lineHeight: 1.5,
  },
  subtitle2: {
    fontSize: '0.875rem',
    fontWeight: 500,
    lineHeight: 1.5,
  },
  body1: {
    fontSize: '1rem',
    lineHeight: 1.5,
  },
  body2: {
    fontSize: '0.875rem',
    lineHeight: 1.5,
  },
  button: {
    textTransform: 'none',
    fontWeight: 500,
  },
  caption: {
    fontSize: '0.75rem',
    lineHeight: 1.5,
    color: grey[600],
  },
  overline: {
    fontSize: '0.75rem',
    lineHeight: 2.66,
    textTransform: 'uppercase',
    fontWeight: 500,
  },
};

// Espaciado base (8px)
const spacing = 8;

// Sombras personalizadas
const customShadows = {
  card: '0 1px 3px rgba(0, 0, 0, 0.12), 0 1px 2px rgba(0, 0, 0, 0.24)',
  dialog: '0 8px 10px -5px rgba(0, 0, 0, 0.2), 0 16px 24px 2px rgba(0, 0, 0, 0.14), 0 6px 30px 5px rgba(0, 0, 0, 0.12)',
  dropdown: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
};

// Crear tema base
const baseTheme = createTheme({
  spacing,
  palette: {
    primary,
    secondary,
    success,
    error,
    warning,
    info,
    background: {
      default: '#f5f5f5',
      paper: '#ffffff',
    },
    text: {
      primary: 'rgba(0, 0, 0, 0.87)',
      secondary: 'rgba(0, 0, 0, 0.6)',
      disabled: 'rgba(0, 0, 0, 0.38)',
    },
    divider: 'rgba(0, 0, 0, 0.12)',
  },
  typography,
  shape: {
    borderRadius: 8,
  },
  customShadows,
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: 8,
          padding: '8px 16px',
        },
        sizeSmall: {
          padding: '4px 12px',
          fontSize: '0.8125rem',
        },
        sizeLarge: {
          padding: '12px 24px',
          fontSize: '1rem',
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          borderRadius: 12,
          boxShadow: customShadows.card,
        },
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
    MuiAppBar: {
      styleOverrides: {
        root: {
          boxShadow: 'none',
        },
      },
    },
    MuiToolbar: {
      styleOverrides: {
        root: {
          padding: '0 24px',
        },
      },
    },
  },
});

// Aplicar tipografías responsivas
const theme = responsiveFontSizes(baseTheme);

export default theme;
