'use client';

import { useMemo } from 'react';
import { Provider } from 'react-redux';
import { PersistGate } from 'redux-persist/integration/react';
import { CssBaseline, ThemeProvider, LinearProgress } from '@mui/material';
import { AppRouterCacheProvider } from '@mui/material-nextjs/v15-appRouter';
import { persistor, store } from '@/store';
import { createAppTheme } from '@/theme/muiTheme';
import { useAppSelector } from '@/store/hooks';
import { selectGlobalLoading } from '@/store/ui/uiSlice';
import { AuthBootstrap } from '@/components/common/AuthBootstrap';
import { NotificationBootstrap } from '@/components/common/NotificationBootstrap';
import { ThemeModeProvider, useThemeMode } from '@/components/layout/ThemeModeContext';

function TopLoader() {
  const loading = useAppSelector(selectGlobalLoading);
  if (!loading) return null;
  return (
    <LinearProgress
      color="primary"
      sx={{ position: 'fixed', top: 0, left: 0, right: 0, zIndex: (t) => t.zIndex.modal + 1 }}
    />
  );
}

function ThemedTree({ children }: { children: React.ReactNode }) {
  const { mode } = useThemeMode();
  const theme = useMemo(() => createAppTheme(mode), [mode]);

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <AuthBootstrap />
      <NotificationBootstrap />
      <TopLoader />
      {children}
    </ThemeProvider>
  );
}

export function AppProviders({ children }: { children: React.ReactNode }) {
  return (
    <AppRouterCacheProvider options={{ enableCssLayer: true }}>
      <Provider store={store}>
        <PersistGate loading={null} persistor={persistor}>
          <ThemeModeProvider>
            <ThemedTree>{children}</ThemedTree>
          </ThemeModeProvider>
        </PersistGate>
      </Provider>
    </AppRouterCacheProvider>
  );
}
