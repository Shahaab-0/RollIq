export type GymRole = 'owner' | 'trainer' | 'member';

export interface Gym {
  id: string;
  name: string;
  description: string | null;
  invite_code: string;
  my_role: GymRole;
  member_count: number;
  class_count: number;
}

export type NewGym = Pick<Gym, 'name' | 'description'>;

export interface GymMember {
  user_id: string;
  display_name: string;
  role: GymRole;
  joined_at: string;
}

export interface GymClassEntry {
  id: string;
  gym_id: string;
  title: string;
  description: string | null;
  class_date: string;
  video_count: number;
}

export type NewGymClassEntry = Pick<GymClassEntry, 'title' | 'description' | 'class_date'>;

export interface GymClassVideo {
  id: string;
  gym_class_entry_id: string;
  url: string | null;
  techniques: string[];
  sequence_number: number;
}

export type NewGymClassVideo = Pick<GymClassVideo, 'url' | 'techniques' | 'sequence_number'>;

// ISO-8601 day-of-week numbering: 1=Monday..7=Sunday, matching the backend.
export const WEEKDAY_LABELS: Record<number, string> = {
  1: 'Monday',
  2: 'Tuesday',
  3: 'Wednesday',
  4: 'Thursday',
  5: 'Friday',
  6: 'Saturday',
  7: 'Sunday',
};

export interface GymScheduleEntry {
  id: string;
  gym_id: string;
  day_of_week: number;
  start_time: string;
  end_time: string;
  topic: string | null;
}

export type NewGymScheduleEntry = Pick<
  GymScheduleEntry,
  'day_of_week' | 'start_time' | 'end_time' | 'topic'
>;
