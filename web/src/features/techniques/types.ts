export type Position = string;

export interface Technique {
  id: string;
  name: string;
  position: Position;
  notes: string | null;
  resource_url: string | null;
  drill_count: number;
}

export type NewTechnique = Omit<Technique, 'id' | 'drill_count'>;

export const POSITION_PRESETS: string[] = [
  'Guard',
  'Mount',
  'Side Control',
  'Back Control',
  'Standing',
  'Submissions',
  'Escapes',
  'Transitions',
];
