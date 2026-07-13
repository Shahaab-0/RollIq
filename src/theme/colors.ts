import type { ColorSchemeName } from 'react-native';

export const BELT_COLORS = {
  white: '#E5E7EB',
  blue: '#3B82F6',
  purple: '#8B5CF6',
  brown: '#92400E',
  black: '#18181B',
};

// Generic UI accent (buttons, active tab, chips) — kept distinct from every
// belt color above so it never gets mistaken for a purple-belt reference.
export const UI_ACCENT = '#14B8A6';

// Text/icon color for content rendered on top of UI_ACCENT (or a belt
// color) — stays dark regardless of light/dark theme, since it's read
// against a bright fill rather than the screen background.
export const UI_ACCENT_TEXT = '#0F0F12';

export const darkTheme = {
  scheme: 'dark' as const,
  background: '#0F0F12',
  surface: '#1B1B20',
  surfaceAlt: '#232329',
  border: '#2A2A31',
  textPrimary: '#F5F5F7',
  textSecondary: '#9A9AA2',
  success: '#22C55E',
  danger: '#EF4444',
};

export const lightTheme = {
  scheme: 'light' as const,
  background: '#F5F5F7',
  surface: '#FFFFFF',
  surfaceAlt: '#F0F0F2',
  border: '#E4E4E7',
  textPrimary: '#111114',
  textSecondary: '#6B6B76',
  success: '#16A34A',
  danger: '#DC2626',
};

export type Theme = Omit<typeof darkTheme, 'scheme'> & {
  scheme: 'light' | 'dark';
};

export function getTheme(scheme: ColorSchemeName): Theme {
  return scheme === 'light' ? lightTheme : darkTheme;
}
