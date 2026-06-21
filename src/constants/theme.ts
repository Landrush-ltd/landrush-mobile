export const Colors = {
  primary: '#7B8A2E',
  primaryLight: '#95A83A',
  primaryDark: '#5C6822',
  secondary: '#4A5D23',
  accent: '#D4A017',
  accentLight: '#E6B422',

  // Listing type colors (from Figma map legend)
  lease: '#E88A2E',
  sale: '#7B8A2E',
  distress: '#C62828',

  // Neutrals
  white: '#FFFFFF',
  background: '#F8F8F5',
  surface: '#FFFFFF',
  card: '#FFFFFF',
  border: '#E0DDD5',
  borderLight: '#F0EDE5',
  divider: '#E8E5DD',

  // Text
  textPrimary: '#1A1A1A',
  textSecondary: '#5C5C5C',
  textTertiary: '#8A8A8A',
  textInverse: '#FFFFFF',
  textLink: '#7B8A2E',

  // Category chip backgrounds
  chipActive: '#E8EAC8',
  chipInactive: '#F5F5F0',

  // Status
  success: '#4CAF50',
  warning: '#F9A825',
  error: '#C62828',
  info: '#1565C0',

  // Overlay
  overlay: 'rgba(0, 0, 0, 0.5)',
  overlayLight: 'rgba(0, 0, 0, 0.3)',

  // Onboarding
  onboardingBg: '#1A2E1A',
} as const;

export const Spacing = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  xxl: 24,
  xxxl: 32,
  huge: 48,
} as const;

export const FontSize = {
  xs: 10,
  sm: 12,
  md: 14,
  lg: 16,
  xl: 18,
  xxl: 22,
  xxxl: 28,
  display: 34,
} as const;

export const FontFamily = {
  regular: 'System',
  medium: 'System',
  semiBold: 'System',
  bold: 'System',
} as const;

export const BorderRadius = {
  sm: 6,
  md: 10,
  lg: 14,
  xl: 20,
  xxl: 24,
  full: 999,
} as const;

export const Shadow = {
  sm: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 2,
  },
  md: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.12,
    shadowRadius: 8,
    elevation: 4,
  },
  lg: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.16,
    shadowRadius: 16,
    elevation: 8,
  },
} as const;
