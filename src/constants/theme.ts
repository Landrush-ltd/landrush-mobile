export const Colors = {
  // Brand greens
  primary:       '#2D6A4F',
  primaryLight:  '#40916C',
  primaryDark:   '#1B4332',
  lime:          '#9FBB44',   // CTA / active state
  limeLight:     '#B5CC5C',

  // Category colors
  lease:    '#E88A2E',
  sale:     '#2D6A4F',
  distress: '#C62828',

  // Airbnb-style neutrals — white dominant
  white:       '#FFFFFF',
  background:  '#FFFFFF',
  surface:     '#F7F7F7',
  card:        '#FFFFFF',
  border:      '#DDDDDD',
  borderLight: '#EBEBEB',
  divider:     '#F0F0F0',

  // Text — Airbnb palette
  textPrimary:   '#222222',
  textSecondary: '#717171',
  textTertiary:  '#AAAAAA',
  textInverse:   '#FFFFFF',
  textLink:      '#2D6A4F',

  // Chips
  chipActive:   '#E8EAC8',
  chipInactive: '#F7F7F7',

  // Status
  success: '#2D6A4F',
  warning: '#E47C18',
  error:   '#C13515',
  info:    '#1565C0',

  // Overlays
  overlay:      'rgba(0,0,0,0.45)',
  overlayLight: 'rgba(0,0,0,0.25)',

  // Legacy (kept for auth screens)
  authBg:      '#FFFFFF',
  onboardingBg:'#FFFFFF',
  splashBg:    '#1B4332',
} as const;

export const Spacing = {
  xs:   4,
  sm:   8,
  md:   12,
  lg:   16,
  xl:   20,
  xxl:  24,
  xxxl: 32,
  huge: 48,
} as const;

export const FontSize = {
  xs:      10,
  sm:      12,
  md:      14,
  lg:      16,
  xl:      18,
  xxl:     22,
  xxxl:    28,
  display: 34,
} as const;

export const FontFamily = {
  regular:  'System',
  medium:   'System',
  semiBold: 'System',
  bold:     'System',
} as const;

export const BorderRadius = {
  sm:  6,
  md:  10,
  lg:  14,
  xl:  20,
  xxl: 28,
  full: 999,
} as const;

export const Shadow = {
  sm: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06,
    shadowRadius: 4,
    elevation: 2,
  },
  md: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.10,
    shadowRadius: 8,
    elevation: 4,
  },
  lg: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.13,
    shadowRadius: 16,
    elevation: 8,
  },
} as const;
