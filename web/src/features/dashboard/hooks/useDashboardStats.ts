'use client';

import { useMemo } from 'react';
import { useSessions } from '@/features/trainingLog/hooks/useSessions';
import { useRolls } from '@/features/rolls/hooks/useRolls';
import { formatDisplayDate, toLocalDateString } from '@/lib/dateFormat';
import type { Session } from '@/features/trainingLog/types';
import type { Roll } from '@/features/rolls/types';

// Ported from the mobile app's useDashboardStats.ts -- same calculations,
// minus useFocusEffect (a React Navigation concept with no web
// equivalent): React Query's default refetchOnWindowFocus covers the
// "come back to this tab and see fresh data" case here instead.

const SESSION_TYPE_LABELS: Record<string, string> = {
  fundamentals: 'Fundamentals',
  advanced: 'Advanced',
  open_mat: 'Open Mat',
  private: 'Private Lesson',
  competition_class: 'Competition Class',
};

interface WeekDay {
  key: string;
  label: string;
  trained: boolean;
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

function formatRelativeDay(dateStr: string): string {
  const today = toLocalDateString(new Date());
  const yesterday = toLocalDateString(new Date(Date.now() - 24 * 60 * 60 * 1000));
  if (dateStr === today) return 'Today';
  if (dateStr === yesterday) return 'Yesterday';

  const daysAgo = Math.round(
    (new Date(`${today}T00:00:00`).getTime() - new Date(`${dateStr}T00:00:00`).getTime()) /
      (1000 * 60 * 60 * 24),
  );
  if (daysAgo < 7) {
    return new Date(`${dateStr}T00:00:00`).toLocaleDateString(undefined, { weekday: 'long' });
  }
  return formatDisplayDate(dateStr);
}

function computeStats(sessions: Session[], rolls: Roll[]) {
  const dateSet = new Set(sessions.map(s => s.date));
  const { current, best } = computeStreaks(dateSet);

  const matMinutes = sessions.reduce((sum, s) => sum + (s.duration_minutes ?? 0), 0);
  const thisYear = new Date().getFullYear();
  const classesThisYear = sessions.filter(
    s => new Date(`${s.date}T00:00:00`).getFullYear() === thisYear,
  ).length;

  const landed = rolls.reduce((sum, r) => sum + (r.submissions_landed?.length ?? 0), 0);
  const received = rolls.reduce((sum, r) => sum + (r.submissions_received?.length ?? 0), 0);
  const total = landed + received;

  const recentActivity = sessions.slice(0, 5).map(s => ({
    id: s.id,
    text: `${s.gi ? 'Gi' : 'No-Gi'} · ${SESSION_TYPE_LABELS[s.session_type] ?? s.session_type}`,
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
  };
}

export function useDashboardStats() {
  const sessionsQuery = useSessions();
  const rollsQuery = useRolls();

  const stats = useMemo(
    () => computeStats(sessionsQuery.data ?? [], rollsQuery.data ?? []),
    [sessionsQuery.data, rollsQuery.data],
  );

  return {
    ...stats,
    loading: sessionsQuery.isLoading || rollsQuery.isLoading,
    error: sessionsQuery.error || rollsQuery.error ? 'Failed to load dashboard' : null,
  };
}
