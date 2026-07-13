import { useCallback, useEffect, useState } from 'react';
import { supabase } from '../../../lib/supabase';
import { useAppDispatch, useAppSelector } from '../../../app/hooks';
import { fetchProfile } from '../../profile/profileSlice';

const SESSION_TYPE_LABELS: Record<string, string> = {
  fundamentals: 'Fundamentals',
  advanced: 'Advanced',
  open_mat: 'Open Mat',
  private: 'Private Lesson',
  competition_class: 'Competition Class',
};

interface SessionRow {
  date: string;
  duration_minutes: number | null;
  gi: boolean;
  session_type: string;
  rounds_count: number | null;
  productivity_rating: number | null;
  submissions_landed_count: number | null;
}

interface ProgressPoint {
  label: string;
  value: number;
}

interface RollRow {
  submissions_landed: string[];
  submissions_received: string[];
}

interface WeekDay {
  key: string;
  label: string;
  trained: boolean;
}

interface DashboardStats {
  loading: boolean;
  error: string | null;
  currentStreak: number;
  bestStreak: number;
  week: WeekDay[];
  matHours: number;
  classesThisYear: number;
  subSuccessPct: number | null;
  recentActivity: { text: string; when: string }[];
  progress: {
    rounds: ProgressPoint[];
    productivity: ProgressPoint[];
    submissions: ProgressPoint[];
  };
}

function toLocalDateString(date: Date): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

function isNextDay(prev: string, next: string): boolean {
  const a = new Date(`${prev}T00:00:00`);
  const b = new Date(`${next}T00:00:00`);
  return b.getTime() - a.getTime() === 24 * 60 * 60 * 1000;
}

function computeStreaks(dates: Set<string>): { current: number; best: number } {
  const sorted = Array.from(dates).sort();
  let best = 0;
  let run = 0;
  let prev: string | null = null;
  for (const d of sorted) {
    run = prev && isNextDay(prev, d) ? run + 1 : 1;
    best = Math.max(best, run);
    prev = d;
  }

  let current = 0;
  const cursor = new Date();
  if (!dates.has(toLocalDateString(cursor))) {
    cursor.setDate(cursor.getDate() - 1);
  }
  while (dates.has(toLocalDateString(cursor))) {
    current += 1;
    cursor.setDate(cursor.getDate() - 1);
  }

  return { current, best };
}

function computeWeek(dates: Set<string>): WeekDay[] {
  const labels = ['M', 'T', 'W', 'T', 'F', 'S', 'S'];
  const keys = ['mon', 'tue', 'wed', 'thu', 'fri', 'sat', 'sun'];
  const today = new Date();
  const dayIndex = (today.getDay() + 6) % 7; // Monday = 0
  const monday = new Date(today);
  monday.setDate(today.getDate() - dayIndex);

  return keys.map((key, i) => {
    const day = new Date(monday);
    day.setDate(monday.getDate() + i);
    return { key, label: labels[i], trained: dates.has(toLocalDateString(day)) };
  });
}

function shortDateLabel(dateStr: string): string {
  const [, month, day] = dateStr.split('-');
  return `${parseInt(month, 10)}/${parseInt(day, 10)}`;
}

function buildProgressPoints(
  sessions: SessionRow[],
  key: 'rounds_count' | 'productivity_rating' | 'submissions_landed_count',
): ProgressPoint[] {
  return sessions
    .filter(s => s[key] != null)
    .slice(0, 8)
    .reverse()
    .map(s => ({ label: shortDateLabel(s.date), value: s[key] as number }));
}

function formatRelativeDay(dateStr: string): string {
  const today = toLocalDateString(new Date());
  const yesterday = toLocalDateString(
    new Date(Date.now() - 24 * 60 * 60 * 1000),
  );
  if (dateStr === today) return 'Today';
  if (dateStr === yesterday) return 'Yesterday';
  return new Date(`${dateStr}T00:00:00`).toLocaleDateString(undefined, {
    month: 'short',
    day: 'numeric',
  });
}

export function useDashboardStats() {
  const dispatch = useAppDispatch();
  const profileStatus = useAppSelector(state => state.profile.status);

  const [stats, setStats] = useState<DashboardStats>({
    loading: true,
    error: null,
    currentStreak: 0,
    bestStreak: 0,
    week: computeWeek(new Set()),
    matHours: 0,
    classesThisYear: 0,
    subSuccessPct: null,
    recentActivity: [],
    progress: { rounds: [], productivity: [], submissions: [] },
  });

  const load = useCallback(async () => {
    setStats(prev => ({ ...prev, loading: true, error: null }));
    try {
      const [sessionsRes, rollsRes] = await Promise.all([
        supabase
          .from('sessions')
          .select(
            'date, duration_minutes, gi, session_type, rounds_count, productivity_rating, submissions_landed_count',
          )
          .order('date', { ascending: false }),
        supabase
          .from('rolls')
          .select('submissions_landed, submissions_received'),
      ]);
      if (sessionsRes.error) throw sessionsRes.error;
      if (rollsRes.error) throw rollsRes.error;

      const sessions = (sessionsRes.data ?? []) as SessionRow[];
      const rolls = (rollsRes.data ?? []) as RollRow[];

      const dateSet = new Set(sessions.map(s => s.date));
      const { current, best } = computeStreaks(dateSet);

      const matMinutes = sessions.reduce(
        (sum, s) => sum + (s.duration_minutes ?? 0),
        0,
      );
      const thisYear = new Date().getFullYear();
      const classesThisYear = sessions.filter(
        s => new Date(`${s.date}T00:00:00`).getFullYear() === thisYear,
      ).length;

      const landed = rolls.reduce(
        (sum, r) => sum + (r.submissions_landed?.length ?? 0),
        0,
      );
      const received = rolls.reduce(
        (sum, r) => sum + (r.submissions_received?.length ?? 0),
        0,
      );
      const total = landed + received;

      const recentActivity = sessions.slice(0, 2).map(s => ({
        text: `${s.gi ? 'Gi' : 'No-Gi'} · ${
          SESSION_TYPE_LABELS[s.session_type] ?? s.session_type
        }`,
        when: formatRelativeDay(s.date),
      }));

      setStats({
        loading: false,
        error: null,
        currentStreak: current,
        bestStreak: best,
        week: computeWeek(dateSet),
        matHours: Math.round(matMinutes / 60),
        classesThisYear,
        subSuccessPct: total > 0 ? Math.round((landed / total) * 100) : null,
        recentActivity,
        progress: {
          rounds: buildProgressPoints(sessions, 'rounds_count'),
          productivity: buildProgressPoints(sessions, 'productivity_rating'),
          submissions: buildProgressPoints(sessions, 'submissions_landed_count'),
        },
      });
    } catch (err) {
      const message =
        err instanceof Error
          ? err.message
          : typeof err === 'object' && err && 'message' in err
            ? String((err as { message: unknown }).message)
            : 'Failed to load dashboard';
      setStats(prev => ({ ...prev, loading: false, error: message }));
    }
  }, []);

  useEffect(() => {
    if (profileStatus === 'idle') {
      dispatch(fetchProfile());
    }
  }, [dispatch, profileStatus]);

  useEffect(() => {
    load();
  }, [load]);

  return { ...stats, refresh: load };
}
