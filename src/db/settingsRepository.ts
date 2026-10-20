import { ensureDatabaseInitialized } from './database';
import { UserPreferences, ThemeMode } from '../types/theme';

const DEFAULT_PREFERENCES: UserPreferences = {
  themeMode: 'light',
  hapticsEnabled: true,
  animationsEnabled: true,
  remindersEnabled: true,
  celebrationsEnabled: true,
};

export const settingsRepository = {
  async getPreferences(): Promise<UserPreferences> {
    try {
      const db = await ensureDatabaseInitialized();
      const rows = await db.getAllAsync<{ key: string; value: string }>('SELECT key, value FROM preferences');
      const prefs: Record<string, string> = {};
      for (const row of rows) {
        prefs[row.key] = row.value;
      }

      return {
        themeMode: (prefs.themeMode as ThemeMode) || DEFAULT_PREFERENCES.themeMode,
        hapticsEnabled: prefs.hapticsEnabled !== undefined ? prefs.hapticsEnabled === 'true' : DEFAULT_PREFERENCES.hapticsEnabled,
        animationsEnabled: prefs.animationsEnabled !== undefined ? prefs.animationsEnabled === 'true' : DEFAULT_PREFERENCES.animationsEnabled,
        remindersEnabled: prefs.remindersEnabled !== undefined ? prefs.remindersEnabled === 'true' : DEFAULT_PREFERENCES.remindersEnabled,
        celebrationsEnabled: prefs.celebrationsEnabled !== undefined ? prefs.celebrationsEnabled === 'true' : DEFAULT_PREFERENCES.celebrationsEnabled,
      };
    } catch (err) {
      console.warn('Failed to load preferences from SQLite, using defaults:', err);
      return DEFAULT_PREFERENCES;
    }
  },

  async savePreference<K extends keyof UserPreferences>(key: K, value: UserPreferences[K]): Promise<void> {
    try {
      const db = await ensureDatabaseInitialized();
      await db.runAsync(
        'INSERT INTO preferences (key, value) VALUES (?, ?) ON CONFLICT(key) DO UPDATE SET value = excluded.value',
        [key, String(value)]
      );
    } catch (err) {
      console.warn('Failed to save preference to SQLite:', key, err);
    }
  },
};
