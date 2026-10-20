export type ThemeMode = 'light' | 'dark' | 'system';

export interface ThemeColors {
  primary: string;
  primaryLight: string;
  primaryDark: string;
  secondary: string;
  secondaryLight: string;
  background: string;
  card: string;
  cardElevated: string;
  textPrimary: string;
  textSecondary: string;
  textMuted: string;
  border: string;
  borderLight: string;
  successMint: string;
  successText: string;
  warningSoft: string;
  warningText: string;
  dangerSoft: string;
  dangerText: string;
  accentLavender: string;
  accentSoft: string;
  chipBackground: string;
  chipSelected: string;
  shadow: string;
  gradientStart: string;
  gradientEnd: string;
  inputBackground: string;
}

export interface UserPreferences {
  themeMode: ThemeMode;
  hapticsEnabled: boolean;
  animationsEnabled: boolean;
  remindersEnabled: boolean;
  celebrationsEnabled: boolean;
}
