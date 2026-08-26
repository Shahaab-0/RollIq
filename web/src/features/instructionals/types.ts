export type ProgressStatus = 'want_to_watch' | 'in_progress' | 'completed';

export const PROGRESS_STATUS_OPTIONS: { value: ProgressStatus; label: string }[] = [
  { value: 'want_to_watch', label: 'Want to Watch' },
  { value: 'in_progress', label: 'In Progress' },
  { value: 'completed', label: 'Completed' },
];

// Free text, not a fixed enum -- same reasoning as techniques' POSITION_PRESETS.
export const CATEGORY_PRESETS: string[] = [
  'Leg Locks',
  'Guard Passing',
  'Guard Retention',
  'Back Attacks',
  'Half Guard',
  'X-Guard',
  'Lapel Guard',
  'Submissions',
  'Takedowns',
  'No-Gi Fundamentals',
  'Turtle',
];

export type Difficulty = 'beginner' | 'intermediate' | 'advanced';

export const DIFFICULTY_OPTIONS: { value: Difficulty; label: string }[] = [
  { value: 'beginner', label: 'Beginner' },
  { value: 'intermediate', label: 'Intermediate' },
  { value: 'advanced', label: 'Advanced' },
];

export interface Instructional {
  id: string;
  title: string;
  instructor: string;
  category: string;
  difficulty: Difficulty;
  platform: string | null;
  url: string | null;
  description: string | null;
  release_year: number | null;
  video_count: number;
  completed_video_count: number;
  in_progress_video_count: number;
}

export type NewInstructional = Omit<
  Instructional,
  'id' | 'video_count' | 'completed_video_count' | 'in_progress_video_count'
>;

export interface InstructionalVideo {
  id: string;
  instructional_id: string;
  title: string;
  sequence_number: number;
  url: string | null;
  duration_minutes: number | null;
}

export type NewInstructionalVideo = Omit<InstructionalVideo, 'id' | 'instructional_id'>;

export interface InstructionalProgress {
  video_id: string;
  status: ProgressStatus;
  notes: string | null;
}
