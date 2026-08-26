'use client';

import Link from 'next/link';
import { Plus, Swords, Trash2, Users } from 'lucide-react';
import { useDeleteRoll, useRolls } from '@/features/rolls/hooks/useRolls';
import type { Roll } from '@/features/rolls/types';
import EmptyState from '@/components/EmptyState';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';

function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
}

function topTaps(items: Roll[]) {
  const counts = new Map<string, number>();
  for (const roll of items) {
    for (const sub of roll.submissions_received) {
      counts.set(sub, (counts.get(sub) ?? 0) + 1);
    }
  }
  return Array.from(counts.entries())
    .map(([name, count]) => ({ name, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 5);
}

export default function RollsPage() {
  const { data: items = [], isLoading } = useRolls();
  const deleteRoll = useDeleteRoll();
  const taps = topTaps(items);

  return (
    <div className="flex w-full max-w-5xl flex-col gap-5">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-extrabold text-text-primary">Roll Tracker</h1>
        <div className="flex gap-2">
          <Link href="/rolls/partners">
            <Button variant="secondary" className="flex items-center gap-2">
              <Users size={16} />
              Partners
            </Button>
          </Link>
          <Link href="/rolls/new">
            <Button className="flex items-center gap-2">
              <Plus size={16} strokeWidth={2.5} />
              Log Roll
            </Button>
          </Link>
        </div>
      </div>

      {isLoading ? (
        <p className="text-sm text-text-secondary">Loading…</p>
      ) : items.length === 0 ? (
        <EmptyState
          icon={Swords}
          title="No rolls logged yet"
          description="Log a roll after sparring to track partners, submissions, and how the exchange went."
        />
      ) : (
        <>
          {taps.length > 0 ? (
            <Card>
              <h2 className="mb-2 text-sm font-bold text-text-primary">What&apos;s catching you</h2>
              <div className="flex flex-col gap-1.5">
                {taps.map(tap => (
                  <div key={tap.name} className="flex justify-between text-sm">
                    <span className="text-text-secondary">{tap.name}</span>
                    <span className="font-bold text-danger">{tap.count}×</span>
                  </div>
                ))}
              </div>
            </Card>
          ) : null}

          <div className="flex flex-col gap-2.5">
            {items.map(item => (
              <div
                key={item.id}
                className="flex items-center justify-between rounded-2xl border border-border bg-surface p-4"
              >
                <Link href={`/rolls/${item.id}`} className="flex-1">
                  <p className="text-sm font-semibold text-text-primary">{item.partner_name || 'Open roll'}</p>
                  <p className="text-xs text-text-secondary">
                    {item.submissions_landed.length} landed · {item.submissions_received.length} received ·{' '}
                    {formatDate(item.created_at)}
                  </p>
                </Link>
                <button
                  onClick={() => deleteRoll.mutate(item.id)}
                  className="rounded-lg border border-danger p-2 text-danger hover:bg-danger/10"
                >
                  <Trash2 size={16} />
                </button>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
