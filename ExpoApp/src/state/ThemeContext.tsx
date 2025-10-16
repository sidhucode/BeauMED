import React, {createContext, useCallback, useContext, useEffect, useMemo, useState} from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

export type ThemeName = 'light' | 'dark';

export type ThemeColors = {
  background: string;
  card: string;
  contrastCard: string;
  text: string;
  muted: string;
  primary: string;
  primaryText: string;
  headerBackground: string;
  headerText: string;
  accent: string;
  border: string;
  inputBackground: string;
  inputText: string;
  navBackground: string;
  navBorder: string;
  fabBackground: string;
  fabText: string;
  badgeBackground: string;
  badgeText: string;
  overlay: string;
};

type ThemeContextValue = {
  theme: ThemeName;
  colors: ThemeColors;
  setTheme: (value: ThemeName) => void;
  toggleTheme: () => void;
  ready: boolean;
};

const STORAGE_KEY = '@beauMed/theme';

const lightColors: ThemeColors = {
  background: '#f7f7fb',
  card: '#ffffff',
  contrastCard: '#4f46e5',
  text: '#111827',
  muted: '#6b7280',
  primary: '#4f46e5',
  primaryText: '#ffffff',
  headerBackground: '#4f46e5',
  headerText: '#ffffff',
  accent: '#eef2ff',
  border: '#e5e7eb',
  inputBackground: '#f9fafb',
  inputText: '#111827',
  navBackground: '#ffffff',
  navBorder: '#e5e5e5',
  fabBackground: '#4f46e5',
  fabText: '#ffffff',
  badgeBackground: '#ef4444',
  badgeText: '#ffffff',
  overlay: 'rgba(0,0,0,0.35)',
};

const darkColors: ThemeColors = {
  background: '#0b1020',
  card: '#161a2a',
  contrastCard: '#1f2937',
  text: '#f8fafc',
  muted: '#94a3b8',
  primary: '#6366f1',
  primaryText: '#ffffff',
  headerBackground: '#1f2937',
  headerText: '#f8fafc',
  accent: '#1e293b',
  border: '#1f2937',
  inputBackground: '#1f2937',
  inputText: '#f8fafc',
  navBackground: '#111827',
  navBorder: '#1f2937',
  fabBackground: '#6366f1',
  fabText: '#ffffff',
  badgeBackground: '#f87171',
  badgeText: '#ffffff',
  overlay: 'rgba(0,0,0,0.6)',
};

const ThemeContext = createContext<ThemeContextValue | undefined>(undefined);

export function ThemeProvider({children}: {children: React.ReactNode}) {
  const [theme, setThemeState] = useState<ThemeName>('light');
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const loadTheme = async () => {
      try {
        const saved = await AsyncStorage.getItem(STORAGE_KEY);
        if (saved === 'dark' || saved === 'light') {
          setThemeState(saved);
        }
      } finally {
        setReady(true);
      }
    };
    loadTheme();
  }, []);

  const persistTheme = useCallback(async (value: ThemeName) => {
    try {
      await AsyncStorage.setItem(STORAGE_KEY, value);
    } catch (error) {
      // eslint-disable-next-line no-console
      console.warn('Failed to persist theme', error);
    }
  }, []);

  const setTheme = useCallback(
    (value: ThemeName) => {
      setThemeState(value);
      persistTheme(value);
    },
    [persistTheme],
  );

  const toggleTheme = useCallback(() => {
    setThemeState(prev => {
      const next = prev === 'light' ? 'dark' : 'light';
      persistTheme(next);
      return next;
    });
  }, [persistTheme]);

  const colors = theme === 'light' ? lightColors : darkColors;

  const value = useMemo(
    () => ({theme, colors, setTheme, toggleTheme, ready}),
    [theme, colors, setTheme, toggleTheme, ready],
  );

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

export function useTheme() {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error('useTheme must be used within ThemeProvider');
  return ctx;
}
