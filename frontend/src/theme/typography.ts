// Every fontSize/fontWeight in the app must come from here — never an
// inline number/string literal in a component's StyleSheet. Keeps type
// scale consistent and makes a global adjustment a one-line change.
export const FONT_SIZE = {
  tiny: 10,
  xs: 11,
  sm: 12,
  label: 13,
  body: 14,
  base: 15,
  md: 16,
  lg: 17,
  xl: 18,
  xxl: 20,
  title: 24,
  display: 28,
  streak: 32,
} as const;

export const FONT_WEIGHT = {
  semibold: '600' as const,
  bold: '700' as const,
  extrabold: '800' as const,
};
