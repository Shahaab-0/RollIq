import type { ColorSchemeName } from 'react-native';

export const BELT_COLORS = {
  white: '#E5E7EB',
  blue: '#3B82F6',
  purple: '#8B5CF6',
  brown: '#92400E',
  black: '#18181B',
};

// Power theme: monochrome accent (near-white on dark, near-black on light)
// instead of a hue-based color -- unlike web's CSS custom properties, RN
// has no cascade, so this can't be a single flat constant: a genuinely
// high-contrast accent on BOTH a near-black dark surface AND a near-white
// light surface has to invert, which means it must live on the `theme`
// object (accent/accentMuted/accentText below) and be read via
// `theme.accent` everywhere, not imported as a bare constant.

// Text color for content rendered on top of theme.success/theme.danger
// fills (toasts) — white reads cleanly against both regardless of theme.
export const TOAST_TEXT = '#FFFFFF';

export const darkTheme = {
  scheme: 'dark' as const,
  background: '#060607',
  surface: '#0E0E10',
  surfaceAlt: '#19191C',
  border: '#29292E',
  textPrimary: '#FAFAFA',
  textSecondary: '#9C9CA3',
  success: '#22C55E',
  danger: '#EF4444',
  accent: '#FAFAFA',
  accentMuted: '#FAFAFA24',
  accentText: '#0A0A0A',
};

export const lightTheme = {
  scheme: 'light' as const,
  background: '#F4F4F5',
  surface: '#FFFFFF',
  surfaceAlt: '#ECECEE',
  border: '#D4D4D8',
  textPrimary: '#0A0A0A',
  textSecondary: '#52525B',
  success: '#16A34A',
  danger: '#DC2626',
  accent: '#0A0A0A',
  accentMuted: '#0A0A0A1F',
  accentText: '#FAFAFA',
};

export type Theme = Omit<typeof darkTheme, 'scheme'> & {
  scheme: 'light' | 'dark';
};

export function getTheme(scheme: ColorSchemeName): Theme {
  return scheme === 'light' ? lightTheme : darkTheme;
}
