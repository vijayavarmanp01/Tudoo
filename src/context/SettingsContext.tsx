import React, { createContext, useContext, useEffect, useState, useMemo } from 'react';
import { useColorScheme } from 'react-native';
import { ThemeColors, UserPreferences, ThemeMode } from '../types/theme';
import { lightColors, darkColors } from '../theme/colors';
import { settingsRepository } from '../db/settingsRepository';
import { hapticsService } from '../services/haptics';

interface SettingsContextValue {
  preferences: UserPreferences;
  colors: ThemeColors;
  isDark: boolean;
  updatePreference: <K extends keyof UserPreferences>(key: K, value: UserPreferences[K]) => Promise<void>;
  setThemeMode: (mode: ThemeMode) => Promise<void>;
}

const defaultContext: SettingsContextValue = {
  preferences: {
    themeMode: 'light',
    hapticsEnabled: true,
    animationsEnabled: true,
    remindersEnabled: true,
    celebrationsEnabled: true,
  },
  colors: lightColors,
  isDark: false,
  updatePreference: async () => {},
  setThemeMode: async () => {},
};

const SettingsContext = createContext<SettingsContextValue>(defaultContext);

export const SettingsProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const systemScheme = useColorScheme();
  const [preferences, setPreferences] = useState<UserPreferences>(defaultContext.preferences);

  useEffect(() => {
    let mounted = true;
    settingsRepository.getPreferences().then((loaded) => {
      if (mounted) {
        setPreferences(loaded);
        hapticsService.setEnabled(loaded.hapticsEnabled);
      }
    });
    return () => {
      mounted = false;
    };
  }, []);

  const updatePreference = async <K extends keyof UserPreferences>(key: K, value: UserPreferences[K]) => {
    setPreferences((prev) => {
      const next = { ...prev, [key]: value };
      if (key === 'hapticsEnabled') {
        hapticsService.setEnabled(Boolean(value));
      }
      return next;
    });
    await settingsRepository.savePreference(key, value);
  };

  const setThemeMode = async (mode: ThemeMode) => {
    await updatePreference('themeMode', mode);
  };

  const isDark = useMemo(() => {
    if (preferences.themeMode === 'system') {
      return systemScheme === 'dark';
    }
    return preferences.themeMode === 'dark';
  }, [preferences.themeMode, systemScheme]);

  const colors = isDark ? darkColors : lightColors;

  return (
    <SettingsContext.Provider
      value={{
        preferences,
        colors,
        isDark,
        updatePreference,
        setThemeMode,
      }}
    >
      {children}
    </SettingsContext.Provider>
  );
};

export function useSettings(): SettingsContextValue {
  return useContext(SettingsContext);
}
