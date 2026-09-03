'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Plus, Trash2, Trophy } from 'lucide-react';
import { formatDisplayDate } from '@/lib/dateFormat';
import { useCompetitions, useDeleteCompetition } from '@/features/competitions/hooks/useCompetitions';
import type { Competition } from '@/features/competitions/types';
import EmptyState from '@/components/EmptyState';
import Button from '@/components/ui/Button';
import { Table, Thead, Tbody, Tr, Th, Td, TableRowActions } from '@/components/ui/Table';

function recordLabel(item: Competition): string {
  const parts = [`${item.wins}W`, `${item.losses}L`];
  if (item.draws > 0) parts.push(`${item.draws}D`);
  return parts.join(' · ');
}

function CompetitionsSkeleton() {
  return (
    <div className="flex w-full animate-pulse flex-col gap-5">
      <div className="flex items-center justify-between">
        <div className="h-8 w-48 rounded-lg bg-surface-alt" />
        <div className="h-11 w-40 rounded-xl bg-surface-alt" />
      </div>
      <div className="overflow-hidden rounded-2xl border border-border">
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className="h-12 border-b border-border bg-surface-alt last:border-0" />
        ))}
      </div>
    </div>
  );
}

export default function CompetitionsPage() {
  const router = useRouter();
  const { data: items = [], isLoading } = useCompetitions();
  const deleteCompetition = useDeleteCompetition();

  const confirmDelete = (item: Competition) => {
    if (confirm(`Delete "${item.name}" and every match logged under it? This cannot be undone.`)) {
      deleteCompetition.mutate(item.id);
    }
  };

  if (isLoading) {
    return <CompetitionsSkeleton />;
  }

  return (
    <div className="flex w-full flex-col gap-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-2xl font-extrabold tracking-tight text-text-primary">Competitions</h1>
        <Link href="/competitions/new">
          <Button className="flex items-center gap-2">
            <Plus size={16} strokeWidth={2.5} />
            Log a Competition
          </Button>
        </Link>
      </div>

      {items.length === 0 ? (
        <EmptyState
          icon={Trophy}
          title="No competitions logged"
          description="Log a competition to track matches, opponents, and results across every tournament you enter."
        />
      ) : (
        <Table>
          <Thead>
            <Tr>
              <Th>Name</Th>
              <Th>Date</Th>
              <Th>Weight</Th>
              <Th>Belt division</Th>
              <Th>Record</Th>
              <Th aria-hidden />
            </Tr>
          </Thead>
          <Tbody>
            {items.map(item => (
              <Tr key={item.id} onClick={() => router.push(`/competitions/${item.id}`)}>
                <Td className="font-semibold">{item.name}</Td>
                <Td className="text-text-secondary">{formatDisplayDate(item.competition_date)}</Td>
                <Td className="text-text-secondary">{item.weight_category}</Td>
                <Td className="text-text-secondary">{item.belt_division || '—'}</Td>
                <Td>
                  <span className="rounded-lg border border-border bg-surface-alt px-2.5 py-1 font-mono text-xs font-bold tabular-nums text-text-primary">
                    {item.match_count === 0 ? 'No matches' : recordLabel(item)}
                  </span>
                </Td>
                <Td>
                  <TableRowActions>
                    <button
                      onClick={e => {
                        e.stopPropagation();
                        confirmDelete(item);
                      }}
                      aria-label={`Delete ${item.name}`}
                      className="rounded-lg border border-danger p-1.5 text-danger hover:bg-danger/10"
                    >
                      <Trash2 size={15} />
                    </button>
                  </TableRowActions>
                </Td>
              </Tr>
            ))}
          </Tbody>
        </Table>
      )}
    </div>
  );
}
