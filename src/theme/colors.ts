import { ThemeColors } from '../types/theme';

export const lightColors: ThemeColors = {
  primary: '#8B5CF6',
  primaryLight: '#EDE9FE',
  primaryDark: '#6D28D9',
  secondary: '#F472B6',
  secondaryLight: '#FCE7F3',
  background: '#FAF8FF',
  card: '#FFFFFF',
  cardElevated: '#FFFFFF',
  textPrimary: '#1E1B2E',
  textSecondary: '#6B7280',
  textMuted: '#9CA3AF',
  border: '#EDE9FE',
  borderLight: '#F5F3FF',
  successMint: '#ECFDF5',
  successText: '#059669',
  warningSoft: '#FFFBEB',
  warningText: '#D97706',
  dangerSoft: '#FEF2F2',
  dangerText: '#DC2626',
  accentLavender: '#A788FA',
  accentSoft: '#F3E8FF',
  chipBackground: '#F3EEFF',
  chipSelected: '#8B5CF6',
  shadow: '#7C3AED',
  gradientStart: '#A788FA',
  gradientEnd: '#F472B6',
  inputBackground: '#F8F6FF',
};

export const darkColors: ThemeColors = {
  primary: '#A788FA',
  primaryLight: '#2E284D',
  primaryDark: '#C4B5FD',
  secondary: '#F472B6',
  secondaryLight: '#3D253A',
  background: '#12101F',
  card: '#1D1930',
  cardElevated: '#25203D',
  textPrimary: '#FAF5FF',
  textSecondary: '#A7A1BF',
  textMuted: '#716A8C',
  border: '#2E274A',
  borderLight: '#241F3A',
  successMint: '#133526',
  successText: '#34D399',
  warningSoft: '#3D2F14',
  warningText: '#FBBF24',
  dangerSoft: '#3F1820',
  dangerText: '#F87171',
  accentLavender: '#C4B5FD',
  accentSoft: '#2B2544',
  chipBackground: '#26203D',
  chipSelected: '#A788FA',
  shadow: '#000000',
  gradientStart: '#A788FA',
  gradientEnd: '#F472B6',
  inputBackground: '#171426',
};

export const gradients = {
  primary: ['#A788FA', '#F472B6'] as const,
  primaryLight: ['#F3E8FF', '#FCE7F3'] as const,
  primarySubtle: ['rgba(167, 136, 250, 0.15)', 'rgba(244, 114, 182, 0.15)'] as const,
  cardLight: ['#FFFFFF', '#FAF8FF'] as const,
  cardDark: ['#231F3A', '#1D1930'] as const,
  accentMint: ['#34D399', '#10B981'] as const,
};

export const priorityColors = {
  high: {
    bgLight: '#FFE4E6',
    textLight: '#E11D48',
    borderLight: '#FECDD3',
    bgDark: '#4C1322',
    textDark: '#FB7185',
  },
  medium: {
    bgLight: '#FEF3C7',
    textLight: '#D97706',
    borderLight: '#FDE68A',
    bgDark: '#452D0F',
    textDark: '#FBBF24',
  },
  low: {
    bgLight: '#ECFDF5',
    textLight: '#059669',
    borderLight: '#A7F3D0',
    bgDark: '#133526',
    textDark: '#34D399',
  },
};

export const categoryMeta: Record<
  string,
  {
    icon: string;
    bgLight: string;
    textLight: string;
    borderLight: string;
    bgDark: string;
    textDark: string;
  }
> = {
  Personal: {
    icon: 'heart',
    bgLight: '#F3E8FF',
    textLight: '#7C3AED',
    borderLight: '#DDD6FE',
    bgDark: '#2E1E55',
    textDark: '#C4B5FD',
  },
  Work: {
    icon: 'briefcase',
    bgLight: '#E0F2FE',
    textLight: '#0284C7',
    borderLight: '#BAE6FD',
    bgDark: '#15324D',
    textDark: '#7DD3FC',
  },
  Study: {
    icon: 'book',
    bgLight: '#FFEDD5',
    textLight: '#EA580C',
    borderLight: '#FED7AA',
    bgDark: '#452613',
    textDark: '#FDBA74',
  },
  Health: {
    icon: 'fitness',
    bgLight: '#ECFDF5',
    textLight: '#059669',
    borderLight: '#A7F3D0',
    bgDark: '#143828',
    textDark: '#6EE7B7',
  },
  Errands: {
    icon: 'cart',
    bgLight: '#FCE7F3',
    textLight: '#DB2777',
    borderLight: '#FBCFE8',
    bgDark: '#441634',
    textDark: '#F472B6',
  },
  Creative: {
    icon: 'color-palette',
    bgLight: '#EDE9FE',
    textLight: '#9333EA',
    borderLight: '#DDD6FE',
    bgDark: '#36184E',
    textDark: '#D8B4FE',
  },
  Shopping: {
    icon: 'bag-handle',
    bgLight: '#FEF9C3',
    textLight: '#CA8A04',
    borderLight: '#FEF08A',
    bgDark: '#443A10',
    textDark: '#FDE047',
  },
  Finance: {
    icon: 'wallet',
    bgLight: '#CCFBF1',
    textLight: '#0D9488',
    borderLight: '#99F6E4',
    bgDark: '#123835',
    textDark: '#5EEAD4',
  },
  Other: {
    icon: 'apps',
    bgLight: '#F1F5F9',
    textLight: '#475569',
    borderLight: '#E2E8F0',
    bgDark: '#28303F',
    textDark: '#94A3B8',
  },
};

export const categoryColors: Record<
  string,
  { bgLight: string; textLight: string; bgDark: string; textDark: string }
> = {
  Personal: {
    bgLight: '#F3E8FF',
    textLight: '#7C3AED',
    bgDark: '#2E1E55',
    textDark: '#C4B5FD',
  },
  Work: {
    bgLight: '#E0F2FE',
    textLight: '#0284C7',
    bgDark: '#15324D',
    textDark: '#7DD3FC',
  },
  Study: {
    bgLight: '#FFEDD5',
    textLight: '#EA580C',
    bgDark: '#452613',
    textDark: '#FDBA74',
  },
  Health: {
    bgLight: '#ECFDF5',
    textLight: '#059669',
    bgDark: '#143828',
    textDark: '#6EE7B7',
  },
  Errands: {
    bgLight: '#FCE7F3',
    textLight: '#DB2777',
    bgDark: '#441634',
    textDark: '#F472B6',
  },
  Creative: {
    bgLight: '#EDE9FE',
    textLight: '#9333EA',
    bgDark: '#36184E',
    textDark: '#D8B4FE',
  },
  Shopping: {
    bgLight: '#FEF9C3',
    textLight: '#CA8A04',
    bgDark: '#443A10',
    textDark: '#FDE047',
  },
  Finance: {
    bgLight: '#CCFBF1',
    textLight: '#0D9488',
    bgDark: '#123835',
    textDark: '#5EEAD4',
  },
  Other: {
    bgLight: '#F1F5F9',
    textLight: '#475569',
    bgDark: '#28303F',
    textDark: '#94A3B8',
  },
};
