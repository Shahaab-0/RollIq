export type Position =
  | 'guard'
  | 'mount'
  | 'side_control'
  | 'back_control'
  | 'standing'
  | 'submissions'
  | 'escapes'
  | 'transitions';

export interface Technique {
  id: string;
  name: string;
  position: Position;
  notes: string | null;
  resource_url: string | null;
  drill_count: number;
}

export type NewTechnique = Omit<Technique, 'id' | 'drill_count'>;

export const POSITION_OPTIONS: { value: Position; label: string }[] = [
  { value: 'guard', label: 'Guard' },
  { value: 'mount', label: 'Mount' },
  { value: 'side_control', label: 'Side Control' },
  { value: 'back_control', label: 'Back Control' },
  { value: 'standing', label: 'Standing' },
  { value: 'submissions', label: 'Submissions' },
  { value: 'escapes', label: 'Escapes' },
  { value: 'transitions', label: 'Transitions' },
];
