export const Colors = {
  primary: '#0A4F5E',
  primaryDark: '#083D4A',
  primaryLight: '#0E6678',
  secondary: '#12919F',
  secondaryLight: '#1AAEBF',
  accent: '#E8931E',
  accentLight: '#F0A843',
  background: '#F3F6FA',
  surface: '#FFFFFF',
  border: '#D0DCE8',
  borderLight: '#E8EEF5',
  text: '#1A2B35',
  textSecondary: '#4A6070',
  textLight: '#8A9BAA',
  error: '#E84040',
  errorLight: '#FFF0F0',
  success: '#27AE60',
  successLight: '#F0FFF5',
  warning: '#E8931E',
  warningLight: '#FFF8F0',
  white: '#FFFFFF',
  transparent: 'transparent',
} as const;

export const Typography = {
  fontSizeXs: 11,
  fontSizeSm: 13,
  fontSizeMd: 15,
  fontSizeLg: 17,
  fontSizeXl: 20,
  fontSize2xl: 24,
  fontSize3xl: 30,
  fontSize4xl: 36,

  fontWeightRegular: '400' as const,
  fontWeightMedium: '500' as const,
  fontWeightSemiBold: '600' as const,
  fontWeightBold: '700' as const,
  fontWeightExtraBold: '800' as const,
};

export const Spacing = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  xxl: 24,
  xxxl: 32,
  xxxxl: 48,
};

export const Radius = {
  sm: 6,
  md: 10,
  lg: 14,
  xl: 20,
  full: 999,
};

export const Shadows = {
  sm: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 2,
  },
  md: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 4,
  },
  lg: {
    shadowColor: '#0A4F5E',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.18,
    shadowRadius: 16,
    elevation: 8,
  },
};
