'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Pencil, Plus, Trash2 } from 'lucide-react';
import { formatDisplayDate } from '@/lib/dateFormat';
import { useCompetitionMatches, useCompetitions, useDeleteMatch } from '../hooks/useCompetitions';
import type { MatchResult } from '../types';
import Button from '@/components/ui/Button';
import { Table, Thead, Tbody, Tr, Th, Td, TableRowActions } from '@/components/ui/Table';

function resultClass(result: MatchResult): string {
  if (result === 'win') return 'bg-success';
  if (result === 'loss') return 'bg-danger';
  return 'bg-text-secondary';
}

function resultLabel(result: MatchResult): string {
  return result.charAt(0).toUpperCase() + result.slice(1);
}

function CompetitionDetailSkeleton() {
  return (
    <div className="flex w-full animate-pulse flex-col gap-5">
      <div className="h-8 w-64 rounded-lg bg-surface-alt" />
      <div className="h-24 rounded-2xl bg-surface-alt" />
      <div className="overflow-hidden rounded-2xl border border-border">
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="h-12 border-b border-border bg-surface-alt last:border-0" />
        ))}
      </div>
    </div>
  );
}

export default function CompetitionDetailView({ competitionId }: Readonly<{ competitionId: string }>) {
  const router = useRouter();
  const { data: competitions = [] } = useCompetitions();
  const { data: matches = [], isLoading } = useCompetitionMatches(competitionId);
  const deleteMatch = useDeleteMatch(competitionId);

  const competition = competitions.find(c => c.id === competitionId);

  if (isLoading && !competition) {
    return <CompetitionDetailSkeleton />;
  }

  return (
    <div className="flex w-full flex-col gap-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-2xl font-extrabold tracking-tight text-text-primary">{competition?.name ?? 'Competition'}</h1>
        <Link href={`/competitions/${competitionId}/edit`} aria-label="Edit competition" className="text-accent">
          <Pencil size={20} />
        </Link>
      </div>

      {competition ? (
        <div className="-mt-3 flex flex-col gap-1">
          <p className="text-sm text-text-secondary">
            {formatDisplayDate(competition.competition_date)} · {competition.weight_category}
          </p>
          {competition.belt_division ? <p className="text-sm text-text-secondary">{competition.belt_division}</p> : null}
          {competition.location ? <p className="text-sm text-text-secondary">{competition.location}</p> : null}
          {competition.notes ? <p className="mt-1 text-sm text-text-primary">{competition.notes}</p> : null}
          <span className="mt-2 w-fit rounded-lg bg-accent-muted px-3 py-1 font-mono text-base font-extrabold tabular-nums text-text-primary">
            {competition.wins}W · {competition.losses}L{competition.draws > 0 ? ` · ${competition.draws}D` : ''}
          </span>
        </div>
      ) : null}

      <div className="flex flex-wrap items-center justify-between gap-3">
        <h2 className="text-base font-bold text-text-primary">Matches</h2>
        <Link href={`/competitions/${competitionId}/matches/new`}>
          <Button className="flex items-center gap-2">
            <Plus size={16} strokeWidth={2.5} />
            Log Match
          </Button>
        </Link>
      </div>

      {matches.length === 0 ? (
        <p className="text-sm text-text-secondary">No matches yet — log one.</p>
      ) : (
        <Table>
          <Thead>
            <Tr>
              <Th aria-hidden />
              <Th>Opponent</Th>
              <Th>Result</Th>
              <Th>Method</Th>
              <Th aria-hidden />
            </Tr>
          </Thead>
          <Tbody>
            {matches.map(match => (
              <Tr
                key={match.id}
                onClick={() => router.push(`/competitions/${competitionId}/matches/${match.id}`)}
              >
                <Td className="w-4">
                  <span className={`block h-2.5 w-2.5 rounded-full ${resultClass(match.result)}`} />
                </Td>
                <Td className="font-semibold">{match.opponent_name}</Td>
                <Td className="text-text-secondary">{resultLabel(match.result)}</Td>
                <Td className="text-text-secondary">{match.method || '—'}</Td>
                <Td>
                  <TableRowActions>
                    <button
                      onClick={e => {
                        e.stopPropagation();
                        deleteMatch.mutate(match.id);
                      }}
                      aria-label={`Delete match against ${match.opponent_name}`}
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
