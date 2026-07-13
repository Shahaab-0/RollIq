export type SessionType =
  | 'fundamentals'
  | 'advanced'
  | 'open_mat'
  | 'private'
  | 'competition_class';

export interface Session {
  id: string;
  date: string;
  gi: boolean;
  duration_minutes: number | null;
  session_type: SessionType;
  instructor: string | null;
  notes: string | null;
  rounds_count: number | null;
  round_minutes: number | null;
  productivity_rating: number | null;
  submissions_landed_count: number | null;
}

export type NewSession = Omit<Session, 'id'>;

export const SESSION_TYPE_OPTIONS: { value: SessionType; label: string }[] = [
  { value: 'fundamentals', label: 'Fundamentals' },
  { value: 'advanced', label: 'Advanced' },
  { value: 'open_mat', label: 'Open Mat' },
  { value: 'private', label: 'Private Lesson' },
  { value: 'competition_class', label: 'Competition Class' },
];
