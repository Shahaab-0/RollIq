import { useCallback, useMemo } from 'react';
import { useFocusEffect } from '@react-navigation/native';
import { useSessions } from '../../trainingLog/hooks/useSessions';
import { useRolls } from '../../rolls/hooks/useRolls';
import { formatDisplayDate } from '../../../lib/dateFormat';
import type { Session } from '../../trainingLog/types';
import type { Roll } from '../../rolls/types';

const SESSION_TYPE_LABELS: Record<string, string> = {
  fundamentals: 'Fundamentals',
  advanced: 'Advanced',
  open_mat: 'Open Mat',
  private: 'Private Lesson',
  competition_class: 'Competition Class',
};

interface ProgressPoint {
  label: string;
  value: number;
}

interface WeekDay {
  key: string;
  label: string;
  trained: boolean;
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
    return {
      key,
      label: labels[i],
      trained: dates.has(toLocalDateString(day)),
    };
  });
}

function shortDateLabel(dateStr: string): string {
  const [, month, day] = dateStr.split('-');
  return `${parseInt(month, 10)}/${parseInt(day, 10)}`;
}

function buildProgressPoints(
  sessions: Session[],
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

  const daysAgo = Math.round(
    (new Date(`${today}T00:00:00`).getTime() -
      new Date(`${dateStr}T00:00:00`).getTime()) /
      (1000 * 60 * 60 * 24),
  );
  if (daysAgo < 7) {
    return new Date(`${dateStr}T00:00:00`).toLocaleDateString(undefined, {
      weekday: 'long',
    });
  }
  return formatDisplayDate(dateStr);
}

function computeStats(sessions: Session[], rolls: Roll[]) {
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
    id: s.id,
    text: `${s.gi ? 'Gi' : 'No-Gi'} · ${
      SESSION_TYPE_LABELS[s.session_type] ?? s.session_type
    }`,
    when: formatRelativeDay(s.date),
  }));

  return {
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
  };
}

export function useDashboardStats() {
  // Same query keys as useSessions()/useRolls() (Training Log, Roll Tracker)
  // -- saving a session or roll elsewhere invalidates the cache these read
  // from too, so the Dashboard stays in sync without its own fetch logic.
  const sessionsQuery = useSessions();
  const rollsQuery = useRolls();

  // Bottom-tab screens stay mounted when you switch tabs, so a plain
  // mount-only fetch never reruns when you come back to Home after
  // logging a session/roll elsewhere — refetch on every focus instead.
  useFocusEffect(
    useCallback(() => {
      sessionsQuery.refetch();
      rollsQuery.refetch();
    }, [sessionsQuery, rollsQuery]),
  );

  const stats = useMemo(
    () => computeStats(sessionsQuery.data ?? [], rollsQuery.data ?? []),
    [sessionsQuery.data, rollsQuery.data],
  );

  const refresh = useCallback(() => {
    sessionsQuery.refetch();
    rollsQuery.refetch();
  }, [sessionsQuery, rollsQuery]);

  return {
    ...stats,
    loading: sessionsQuery.isLoading || rollsQuery.isLoading,
    error:
      sessionsQuery.error || rollsQuery.error
        ? 'Failed to load dashboard'
        : null,
    refresh,
  };
}
