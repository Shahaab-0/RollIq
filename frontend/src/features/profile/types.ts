export type Belt = 'white' | 'blue' | 'purple' | 'brown' | 'black';

export const BELT_OPTIONS: { value: Belt; label: string }[] = [
  { value: 'white', label: 'White' },
  { value: 'blue', label: 'Blue' },
  { value: 'purple', label: 'Purple' },
  { value: 'brown', label: 'Brown' },
  { value: 'black', label: 'Black' },
];

export const BELT_LABELS: Record<Belt, string> = {
  white: 'White Belt',
  blue: 'Blue Belt',
  purple: 'Purple Belt',
  brown: 'Brown Belt',
  black: 'Black Belt',
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

export type NewBeltPromotion = Omit<BeltPromotion, 'id'>;
