// ── Color palettes ────────────────────────────────────────────────

export const LightColors = {
  // Brand
  primary:       '#2D6A4F',
  primaryLight:  '#40916C',
  primaryDark:   '#1B4332',
  lime:          '#9FBB44',
  limeLight:     '#B5CC5C',

  // Category
  lease:    '#E88A2E',
  sale:     '#2D6A4F',
  distress: '#C62828',

  // Surface hierarchy
  white:       '#FFFFFF',
  background:  '#FFFFFF',
  surface:     '#F7F7F7',
  card:        '#FFFFFF',
  border:      '#DDDDDD',
  borderLight: '#EBEBEB',
  divider:     '#F0F0F0',

  // Text
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

  // Auth legacy
  authBg:       '#FFFFFF',
  onboardingBg: '#FFFFFF',
  splashBg:     '#1B4332',
} as const;

export const DarkColors = {
  // Brand (unchanged — lime & primary work on dark bg)
  primary:       '#3D8B64',
  primaryLight:  '#55A87E',
  primaryDark:   '#1B4332',
  lime:          '#A8C44A',
  limeLight:     '#BDD162',

  // Category
  lease:    '#E88A2E',
  sale:     '#3D8B64',
  distress: '#D93025',

  // Surface hierarchy
  white:       '#FFFFFF',
  background:  '#111714',
  surface:     '#181D1A',
  card:        '#1E2421',
  border:      '#2C3330',
  borderLight: '#232A27',
  divider:     '#1E2421',

  // Text
  textPrimary:   '#EDEFEC',
  textSecondary: '#8C9A93',
  textTertiary:  '#556159',
  textInverse:   '#111714',
  textLink:      '#55A87E',

  // Chips
  chipActive:   '#2C3A2A',
  chipInactive: '#1E2421',

  // Status
  success: '#3D8B64',
  warning: '#E47C18',
  error:   '#E05C3A',
  info:    '#5BA4E0',

  // Overlays
  overlay:      'rgba(0,0,0,0.6)',
  overlayLight: 'rgba(0,0,0,0.35)',

  // Auth legacy
  authBg:       '#111714',
  onboardingBg: '#111714',
  splashBg:     '#0D1210',
} as const;

export type ColorScheme = 'light' | 'dark';
export type ThemeColors = typeof LightColors;

// Default export stays as LightColors so components that can't use hooks
// (like LandrushLogo used in static contexts) still have a valid fallback.
export const Colors = LightColors;

// ── Spacing ───────────────────────────────────────────────────────
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

// ── Typography ────────────────────────────────────────────────────
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

// ── Borders ───────────────────────────────────────────────────────
export const BorderRadius = {
  sm:   6,
  md:   10,
  lg:   14,
  xl:   20,
  xxl:  28,
  full: 999,
} as const;

// ── Shadows ───────────────────────────────────────────────────────
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
