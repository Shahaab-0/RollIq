export type Belt = 'white' | 'blue' | 'purple' | 'brown' | 'black';

export const BELT_OPTIONS: { value: Belt; label: string }[] = [
  { value: 'white', label: 'White' },
  { value: 'blue', label: 'Blue' },
  { value: 'purple', label: 'Purple' },
  { value: 'brown', label: 'Brown' },
  { value: 'black', label: 'Black' },
];

export const BELT_COLOR_VAR: Record<Belt, string> = {
  white: 'var(--color-belt-white)',
  blue: 'var(--color-belt-blue)',
  purple: 'var(--color-belt-purple)',
  brown: 'var(--color-belt-brown)',
  black: 'var(--color-belt-black)',
};

export interface Profile {
  id: string;
  display_name: string | null;
  current_belt: Belt;
  current_stripes: number;
  home_gym: string | null;
}

export interface BeltPromotion {
  id: string;
  belt: Belt;
  stripes: number;
  promoted_on: string;
  notes: string | null;
}
