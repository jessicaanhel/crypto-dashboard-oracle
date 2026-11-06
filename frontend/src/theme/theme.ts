import { createTheme } from '@mui/material/styles';
import { COLORS } from './tokens';

export const theme = createTheme({
  palette: {
    mode: 'dark',
    common: {
      black: COLORS.background,
      white: '#ffffff',
    },
    background: {
      default: COLORS.background,
      paper: COLORS.surface,
    },
    primary: {
      main: COLORS.accent,
      light: '#8fa8ff',
      dark: '#3d5fd9',
      contrastText: COLORS.background,
    },
    secondary: {
      main: '#8f6bff',
      light: COLORS.large,
      dark: '#6b4fd9',
      contrastText: COLORS.background,
    },
    success: {
      main: COLORS.positive,
      contrastText: COLORS.background,
    },
    error: {
      main: COLORS.negative,
      contrastText: COLORS.background,
    },
    text: {
      primary: COLORS.textPrimary,
      secondary: COLORS.textSecondary,
    },
  },
  typography: {
    fontFamily: "'Manrope', system-ui, sans-serif",
  },
  spacing: 8,
});
