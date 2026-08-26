'use client';

import Link from 'next/link';
import { HeartPulse, Plus, Trash2 } from 'lucide-react';
import { formatDisplayDate } from '@/lib/dateFormat';
import { useDeleteInjury, useInjuries } from '@/features/injuries/hooks/useInjuries';
import type { Injury } from '@/features/injuries/types';
import EmptyState from '@/components/EmptyState';
import Button from '@/components/ui/Button';

const SEVERITY_LABEL: Record<string, string> = { mild: 'Mild', moderate: 'Moderate', severe: 'Severe' };

function InjuryRow({ item, onDelete }: Readonly<{ item: Injury; onDelete: () => void }>) {
  return (
    <div className="flex items-center justify-between gap-3 rounded-2xl border border-border bg-surface p-4">
      <Link href={`/injuries/${item.id}`} className="flex-1">
        <p className="text-sm font-semibold text-text-primary">{item.body_part}</p>
        <p className="text-xs text-text-secondary">
          {formatDisplayDate(item.injury_date)} · {SEVERITY_LABEL[item.severity]}
        </p>
        <p className="mt-0.5 line-clamp-2 text-xs text-text-secondary">{item.description}</p>
      </Link>
      <div className="flex items-center gap-2">
        <span
          className={`rounded-lg px-2 py-1 text-xs font-semibold capitalize ${
            item.status === 'active' ? 'bg-accent-muted text-danger' : 'bg-surface-alt text-text-secondary'
          }`}
        >
          {item.status}
        </span>
        <button onClick={onDelete} className="rounded-lg border border-danger p-2 text-danger hover:bg-danger/10">
          <Trash2 size={16} />
        </button>
      </div>
    </div>
  );
}

export default function InjuriesPage() {
  const { data: injuries = [], isLoading } = useInjuries();
  const deleteInjury = useDeleteInjury();

  const active = injuries.filter(i => i.status !== 'resolved');
  const resolved = injuries.filter(i => i.status === 'resolved');

  return (
    <div className="flex w-full max-w-5xl flex-col gap-5">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-extrabold text-text-primary">Injuries</h1>
        <Link href="/injuries/new">
          <Button className="flex items-center gap-2">
            <Plus size={16} strokeWidth={2.5} />
            Log an Injury
          </Button>
        </Link>
      </div>

      {isLoading ? (
        <p className="text-sm text-text-secondary">Loading…</p>
      ) : injuries.length === 0 ? (
        <EmptyState
          icon={HeartPulse}
          title="No injuries logged"
          description="Log one if you're carrying something -- keeping a record helps you spot patterns and know when you're actually healed."
        />
      ) : (
        <div className="flex flex-col gap-6">
          {active.length > 0 ? (
            <div className="flex flex-col gap-2.5">
              <h2 className="text-xs font-semibold uppercase tracking-wide text-text-secondary">Active &amp; Recovering</h2>
              <div className="flex flex-col gap-2.5">
                {active.map(item => (
                  <InjuryRow key={item.id} item={item} onDelete={() => deleteInjury.mutate(item.id)} />
                ))}
              </div>
            </div>
          ) : null}

          {resolved.length > 0 ? (
            <div className="flex flex-col gap-2.5">
              <h2 className="text-xs font-semibold uppercase tracking-wide text-text-secondary">Resolved</h2>
              <div className="flex flex-col gap-2.5">
                {resolved.map(item => (
                  <InjuryRow key={item.id} item={item} onDelete={() => deleteInjury.mutate(item.id)} />
                ))}
              </div>
            </div>
          ) : null}
        </div>
      )}
    </div>
  );
}
