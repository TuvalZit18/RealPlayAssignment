import { alpha, createTheme, type PaletteMode } from '@mui/material/styles';
import { BRAND_VIOLET } from '../../shared/ui/brand';

// Design decisions live in docs/architecture/ui.md.

const palettes = {
  dark: {
    primary: { main: '#8B73F0', contrastText: '#120E1F' },
    background: { default: '#110F1A', paper: '#1A1726' },
    text: { primary: '#ECEAF4', secondary: '#A9A5BC' },
    divider: 'rgba(236, 234, 244, 0.12)',
  },
  light: {
    primary: { main: BRAND_VIOLET, contrastText: '#FFFFFF' },
    background: { default: '#F6F6F8', paper: '#FFFFFF' },
    text: { primary: '#281A39', secondary: '#5B5670' },
    divider: 'rgba(40, 26, 57, 0.12)',
  },
} as const;

export function createAppTheme(mode: PaletteMode) {
  const palette = palettes[mode];

  return createTheme({
    palette: { mode, ...palette },
    shape: { borderRadius: 12 },
    spacing: 8,
    typography: {
      fontFamily: '"Inter Variable", Inter, system-ui, -apple-system, "Segoe UI", Roboto, sans-serif',
      h1: { fontSize: '2.75rem', fontWeight: 700, letterSpacing: '-0.02em', lineHeight: 1.15 },
      h2: { fontSize: '2rem', fontWeight: 700, letterSpacing: '-0.01em', lineHeight: 1.2 },
      h3: { fontSize: '1.5rem', fontWeight: 650, lineHeight: 1.25 },
      h4: { fontSize: '1.25rem', fontWeight: 650 },
      button: { textTransform: 'none', fontWeight: 600 },
      overline: { letterSpacing: '0.12em', fontWeight: 600 },
    },
    components: {
      MuiCssBaseline: {
        styleOverrides: {
          body: { WebkitFontSmoothing: 'antialiased' },
          ':focus-visible': { outline: `2px solid ${palette.primary.main}`, outlineOffset: 2 },
        },
      },
      MuiButton: {
        defaultProps: { disableElevation: true },
        styleOverrides: { root: { borderRadius: 10, paddingInline: 18 } },
      },
      MuiPaper: {
        styleOverrides: { root: { backgroundImage: 'none' } },
      },
      MuiCard: {
        defaultProps: { variant: 'outlined' },
      },
      MuiDialog: {
        styleOverrides: { paper: { borderRadius: 12 } },
      },
      MuiTextField: {
        defaultProps: { fullWidth: true },
      },
      MuiAppBar: {
        defaultProps: { elevation: 0, color: 'inherit' },
        styleOverrides: {
          root: {
            backgroundColor: alpha(palette.background.default, 0.85),
            backdropFilter: 'blur(8px)',
            borderBottom: `1px solid ${palette.divider}`,
          },
        },
      },
    },
  });
}
