'use client';

import Link from 'next/link';
import { Pencil, Plus, Trash2 } from 'lucide-react';
import { formatDisplayDate } from '@/lib/dateFormat';
import { useCompetitionMatches, useCompetitions, useDeleteMatch } from '../hooks/useCompetitions';
import type { MatchResult } from '../types';
import Button from '@/components/ui/Button';

function resultClass(result: MatchResult): string {
  if (result === 'win') return 'bg-success';
  if (result === 'loss') return 'bg-danger';
  return 'bg-text-secondary';
}

function resultLabel(result: MatchResult): string {
  return result.charAt(0).toUpperCase() + result.slice(1);
}

export default function CompetitionDetailView({ competitionId }: Readonly<{ competitionId: string }>) {
  const { data: competitions = [] } = useCompetitions();
  const { data: matches = [], isLoading } = useCompetitionMatches(competitionId);
  const deleteMatch = useDeleteMatch(competitionId);

  const competition = competitions.find(c => c.id === competitionId);

  return (
    <div className="flex w-full max-w-3xl flex-col gap-5">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-extrabold text-text-primary">{competition?.name ?? 'Competition'}</h1>
        <Link href={`/competitions/${competitionId}/edit`} className="text-accent">
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
          <span className="mt-2 w-fit rounded-lg bg-accent-muted px-3 py-1 text-base font-extrabold text-text-primary">
            {competition.wins}W · {competition.losses}L{competition.draws > 0 ? ` · ${competition.draws}D` : ''}
          </span>
        </div>
      ) : null}

      <div className="flex items-center justify-between">
        <h2 className="text-base font-bold text-text-primary">Matches</h2>
        <Link href={`/competitions/${competitionId}/matches/new`}>
          <Button className="flex items-center gap-2">
            <Plus size={16} strokeWidth={2.5} />
            Log Match
          </Button>
        </Link>
      </div>

      {isLoading ? (
        <p className="text-sm text-text-secondary">Loading…</p>
      ) : matches.length === 0 ? (
        <p className="text-sm text-text-secondary">No matches yet — log one.</p>
      ) : (
        <div className="flex flex-col gap-2.5">
          {matches.map(match => (
            <div key={match.id} className="flex items-center gap-3 rounded-2xl border border-border bg-surface p-4">
              <span className={`h-2.5 w-2.5 shrink-0 rounded-full ${resultClass(match.result)}`} />
              <Link href={`/competitions/${competitionId}/matches/${match.id}`} className="flex-1">
                <p className="text-sm font-semibold text-text-primary">{match.opponent_name}</p>
                <p className="text-xs text-text-secondary">
                  {resultLabel(match.result)}
                  {match.method ? ` · ${match.method}` : ''}
                </p>
              </Link>
              <button
                onClick={() => deleteMatch.mutate(match.id)}
                className="rounded-lg border border-danger p-2 text-danger hover:bg-danger/10"
              >
                <Trash2 size={16} />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
