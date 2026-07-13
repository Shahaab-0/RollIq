export type Belt = 'white' | 'blue' | 'purple' | 'brown' | 'black';

export interface Profile {
  id: string;
  display_name: string | null;
  current_belt: Belt;
  current_stripes: number;
  home_gym: string | null;
}
