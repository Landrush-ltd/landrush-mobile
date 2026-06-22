import React, { createContext, useContext, useState, useEffect, useMemo } from 'react';
import { useColorScheme } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { LightColors, DarkColors, type ColorScheme, type ThemeColors } from '../constants/theme';

const STORAGE_KEY = '@landrush_theme';

interface ThemeContextValue {
  scheme: ColorScheme;
  colors: ThemeColors;
  isDark: boolean;
  toggleTheme: () => void;
  setScheme: (s: ColorScheme) => void;
}

const ThemeContext = createContext<ThemeContextValue>({
  scheme:      'light',
  colors:      LightColors,
  isDark:      false,
  toggleTheme: () => {},
  setScheme:   () => {},
});

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const systemScheme = useColorScheme();
  // null = follow system, 'light'/'dark' = user override
  const [userScheme, setUserScheme] = useState<ColorScheme | null>(null);
  const [loaded, setLoaded] = useState(false);

  // Load persisted preference on mount
  useEffect(() => {
    AsyncStorage.getItem(STORAGE_KEY).then((val) => {
      if (val === 'light' || val === 'dark') setUserScheme(val);
      setLoaded(true);
    });
  }, []);

  const scheme: ColorScheme = userScheme ?? (systemScheme === 'dark' ? 'dark' : 'light');
  const isDark = scheme === 'dark';
  const colors: ThemeColors = isDark ? DarkColors : LightColors;

  const setScheme = (s: ColorScheme) => {
    setUserScheme(s);
    AsyncStorage.setItem(STORAGE_KEY, s);
  };

  const toggleTheme = () => setScheme(isDark ? 'light' : 'dark');

  const value = useMemo<ThemeContextValue>(
    () => ({ scheme, colors, isDark, toggleTheme, setScheme }),
    [scheme, colors, isDark],
  );

  // Don't render until preference is loaded to avoid flash
  if (!loaded) return null;

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

export function useTheme(): ThemeContextValue {
  return useContext(ThemeContext);
}

/** Convenience — just returns the current color palette. */
export function useColors(): ThemeColors {
  return useContext(ThemeContext).colors;
}
