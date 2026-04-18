'use client';

import { createTheme } from '@mui/material/styles';

export const createAppTheme = (mode: 'light' | 'dark') =>
  createTheme({
    palette: {
      mode,
      primary: { main: mode === 'light' ? '#1e3a5f' : '#90caf9' },
      secondary: { main: mode === 'light' ? '#c62828' : '#ffb74d' },
      background: {
        default: mode === 'light' ? '#f5f7fb' : '#0b1220',
        paper: mode === 'light' ? '#ffffff' : '#121a2a',
      },
    },
    shape: { borderRadius: 10 },
    typography: {
      fontFamily: 'var(--font-geist-sans), system-ui, sans-serif',
    },
    components: {
      MuiButton: { defaultProps: { variant: 'contained' } },
    },
  });
