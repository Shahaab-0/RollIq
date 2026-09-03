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

// Power theme: Oswald for anything weighted (titles, stat values, button
// labels, active nav) so it reads big/bold/condensed; JetBrainsMono for
// tabular numeric displays. Regular-weight body copy stays the system font
// -- RN has no CSS cascade to set one global default the way web's `body {
// font-family }` does, and custom TTFs need an exact weight-matched file
// per instance (synthetic bolding a single regular-weight file doesn't
// work reliably across iOS/Android), so this only reaches every place that
// already declares a FONT_WEIGHT via the existing convention.
export const FONT_FAMILY = {
  semibold: 'Oswald-Medium',
  bold: 'Oswald-SemiBold',
  extrabold: 'Oswald-Bold',
  mono: 'JetBrainsMono-Regular',
  monoMedium: 'JetBrainsMono-Medium',
  monoBold: 'JetBrainsMono-Bold',
};
