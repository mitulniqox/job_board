'use client';

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react';

type Mode = 'light' | 'dark';

type ThemeModeContextValue = {
  mode: Mode;
  toggleMode: () => void;
};

const ThemeModeContext = createContext<ThemeModeContextValue | undefined>(undefined);

export function ThemeModeProvider({ children }: { children: ReactNode }) {
  const [mode, setMode] = useState<Mode>('light');

  useEffect(() => {
    const stored = window.localStorage.getItem('ibl-theme');
    if (stored === 'dark' || stored === 'light') setMode(stored);
  }, []);

  const toggleMode = useCallback(() => {
    setMode((prev) => {
      const next: Mode = prev === 'light' ? 'dark' : 'light';
      window.localStorage.setItem('ibl-theme', next);
      return next;
    });
  }, []);

  const value = useMemo(() => ({ mode, toggleMode }), [mode, toggleMode]);

  return <ThemeModeContext.Provider value={value}>{children}</ThemeModeContext.Provider>;
}

export function useThemeMode() {
  const ctx = useContext(ThemeModeContext);
  if (!ctx) {
    throw new Error('useThemeMode must be used within ThemeModeProvider');
  }
  return ctx;
}
