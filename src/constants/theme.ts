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
  // Brand (improved brightness for dark mode)
  primary:       '#52C77A',
  primaryLight:  '#6DD68D',
  primaryDark:   '#2D7A4D',
  lime:          '#B8D65E',
  limeLight:     '#CAE47A',

  // Category (brightened for visibility)
  lease:    '#FFA041',
  sale:     '#52C77A',
  distress: '#FF6B6B',

  // Surface hierarchy (better contrast)
  white:       '#FFFFFF',
  background:  '#0F1110',
  surface:     '#1A1F1D',
  card:        '#242B28',
  border:      '#404A46',
  borderLight: '#313A36',
  divider:     '#1E2421',

  // Text (higher contrast)
  textPrimary:   '#F5F5F5',
  textSecondary: '#A8B5B0',
  textTertiary:  '#6D7A75',
  textInverse:   '#0F1110',
  textLink:      '#6DD68D',

  // Chips (more visible)
  chipActive:   '#1F4D35',
  chipInactive: '#242B28',

  // Status (brightened)
  success: '#52C77A',
  warning: '#FFA041',
  error:   '#FF6B6B',
  info:    '#6BB8FF',

  // Overlays (stronger)
  overlay:      'rgba(0,0,0,0.7)',
  overlayLight: 'rgba(0,0,0,0.4)',

  // Auth legacy
  authBg:       '#0F1110',
  onboardingBg: '#0F1110',
  splashBg:     '#0A0D0C',
} as const;

export type ColorScheme = 'light' | 'dark';
// Widen value types to string so LightColors and DarkColors (same keys,
// different hex values) are mutually assignable.
export type ThemeColors = { [K in keyof typeof LightColors]: string };

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
  regular:   'Sora_400Regular',
  medium:    'Sora_500Medium',
  semiBold:  'Sora_600SemiBold',
  bold:      'Sora_700Bold',
  extraBold: 'Sora_800ExtraBold',
} as const;

// Negative tracking on large/bold text is what reads as "premium".
// Apply to headings, prices, and display text.
export const LetterSpacing = {
  tight:   -0.5,
  snug:    -0.3,
  normal:   0,
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
// Soft, diffuse shadows — low opacity + large radius reads as premium depth
// rather than a hard drop shadow.
export const Shadow = {
  sm: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  md: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.08,
    shadowRadius: 18,
    elevation: 5,
  },
  lg: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.12,
    shadowRadius: 28,
    elevation: 10,
  },
} as const;
