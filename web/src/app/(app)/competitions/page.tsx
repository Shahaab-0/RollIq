'use client';

import Link from 'next/link';
import { Plus, Trash2, Trophy } from 'lucide-react';
import { formatDisplayDate } from '@/lib/dateFormat';
import { useCompetitions, useDeleteCompetition } from '@/features/competitions/hooks/useCompetitions';
import type { Competition } from '@/features/competitions/types';
import EmptyState from '@/components/EmptyState';
import Button from '@/components/ui/Button';

function recordLabel(item: Competition): string {
  const parts = [`${item.wins}W`, `${item.losses}L`];
  if (item.draws > 0) parts.push(`${item.draws}D`);
  return parts.join(' · ');
}

export default function CompetitionsPage() {
  const { data: items = [], isLoading } = useCompetitions();
  const deleteCompetition = useDeleteCompetition();

  const confirmDelete = (item: Competition) => {
    if (confirm(`Delete "${item.name}" and every match logged under it? This cannot be undone.`)) {
      deleteCompetition.mutate(item.id);
    }
  };

  return (
    <div className="flex w-full max-w-5xl flex-col gap-5">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-extrabold text-text-primary">Competitions</h1>
        <Link href="/competitions/new">
          <Button className="flex items-center gap-2">
            <Plus size={16} strokeWidth={2.5} />
            Log a Competition
          </Button>
        </Link>
      </div>

      {isLoading ? (
        <p className="text-sm text-text-secondary">Loading…</p>
      ) : items.length === 0 ? (
        <EmptyState
          icon={Trophy}
          title="No competitions logged"
          description="Log a competition to track matches, opponents, and results across every tournament you enter."
        />
      ) : (
        <div className="flex flex-col gap-2.5">
          {items.map(item => (
            <div
              key={item.id}
              className="flex items-center justify-between rounded-2xl border border-border bg-surface p-4"
            >
              <Link href={`/competitions/${item.id}`} className="flex-1">
                <p className="text-sm font-semibold text-text-primary">{item.name}</p>
                <p className="text-xs text-text-secondary">
                  {formatDisplayDate(item.competition_date)} · {item.weight_category}
                </p>
                {item.belt_division ? <p className="text-xs text-text-secondary">{item.belt_division}</p> : null}
              </Link>
              <div className="flex items-center gap-2">
                <span className="rounded-lg border border-border bg-surface-alt px-2.5 py-1.5 text-xs font-bold text-text-primary">
                  {item.match_count === 0 ? 'No matches' : recordLabel(item)}
                </span>
                <button
                  onClick={() => confirmDelete(item)}
                  className="rounded-lg border border-danger p-2 text-danger hover:bg-danger/10"
                >
                  <Trash2 size={16} />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
