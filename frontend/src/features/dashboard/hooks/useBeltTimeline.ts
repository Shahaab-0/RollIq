import { useCallback } from 'react';
import { useFocusEffect } from '@react-navigation/native';
import { useBeltPromotions } from '../../profile/hooks/useBeltPromotions';
import type { Belt } from '../../profile/types';

export interface TimelineEntry {
  id: string;
  belt: Belt;
  promotedOn: string;
  durationLabel: string;
  isCurrent: boolean;
}

function toLocalDateString(date: Date): string {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(
    2,
    '0',
  )}-${String(date.getDate()).padStart(2, '0')}`;
}

function daysBetween(start: string, end: string): number {
  const a = new Date(`${start}T00:00:00`).getTime();
  const b = new Date(`${end}T00:00:00`).getTime();
  return Math.round((b - a) / (1000 * 60 * 60 * 24));
}

function formatDuration(days: number): string {
  if (days < 30) return `${days} day${days === 1 ? '' : 's'}`;
  const months = Math.round(days / 30);
  if (months < 12) return `${months} month${months === 1 ? '' : 's'}`;
  const years = Math.floor(months / 12);
  const remainder = months % 12;
  if (remainder === 0) return `${years} year${years === 1 ? '' : 's'}`;
  return `${years} year${years === 1 ? '' : 's'} ${remainder} month${
    remainder === 1 ? '' : 's'
  }`;
}

export function useBeltTimeline() {
  const { data: items = [], isLoading, refetch } = useBeltPromotions();

  // Bottom-tab screens stay mounted, so a plain mount-only fetch never
  // reruns when you come back to Home after logging a promotion elsewhere.
  useFocusEffect(
    useCallback(() => {
      refetch();
    }, [refetch]),
  );

  const today = toLocalDateString(new Date());

  // Multiple rows can share a belt now (stripe milestones logged via the
  // main Profile save), so collapse consecutive same-belt rows into one
  // timeline entry using the earliest date — "how long each belt took"
  // shouldn't fragment into a tiny sliver per stripe.
  const belts: { belt: Belt; startDate: string }[] = [];
  for (const promotion of items) {
    const lastGroup = belts[belts.length - 1];
    if (lastGroup && lastGroup.belt === promotion.belt) {
      continue;
    }
    belts.push({ belt: promotion.belt, startDate: promotion.promoted_on });
  }

  const timeline: TimelineEntry[] = belts.map((group, i) => {
    const next = belts[i + 1];
    const endDate = next ? next.startDate : today;
    return {
      id: `${group.belt}-${group.startDate}`,
      belt: group.belt,
      promotedOn: group.startDate,
      durationLabel: formatDuration(
        Math.max(daysBetween(group.startDate, endDate), 0),
      ),
      isCurrent: !next,
    };
  });

  return { timeline, isLoading };
}
