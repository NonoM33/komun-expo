export const colors = {
  background: '#0A0A0F',
  surface: '#14141A',
  surfaceLight: '#1E1E26',
  primary: '#6C63FF',
  primaryDark: '#5A52E0',
  primaryLight: '#8B84FF',
  text: '#FFFFFF',
  textSecondary: '#9CA3AF',
  textMuted: '#6B7280',
  border: '#2D2D3A',
  error: '#EF4444',
  success: '#22C55E',
  warning: '#F59E0B',
  like: '#EF4444',
};

export const spacing = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 48,
};

export const borderRadius = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 24,
  full: 9999,
};

export const typography = {
  h1: {
    fontSize: 28,
    fontWeight: '700' as const,
    color: colors.text,
  },
  h2: {
    fontSize: 24,
    fontWeight: '600' as const,
    color: colors.text,
  },
  h3: {
    fontSize: 20,
    fontWeight: '600' as const,
    color: colors.text,
  },
  body: {
    fontSize: 16,
    fontWeight: '400' as const,
    color: colors.text,
  },
  bodySmall: {
    fontSize: 14,
    fontWeight: '400' as const,
    color: colors.textSecondary,
  },
  caption: {
    fontSize: 12,
    fontWeight: '400' as const,
    color: colors.textMuted,
  },
};
