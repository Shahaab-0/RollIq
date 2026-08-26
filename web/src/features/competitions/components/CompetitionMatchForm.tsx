'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  useCompetitionMatches,
  useCreateMatch,
  useDeleteMatch,
  useUpdateMatch,
} from '../hooks/useCompetitions';
import { RESULT_OPTIONS, type MatchResult } from '../types';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import Textarea from '@/components/ui/Textarea';
import Chip from '@/components/ui/Chip';

const RESULT_COLOR_VAR: Record<MatchResult, string> = {
  win: 'var(--color-success)',
  loss: 'var(--color-danger)',
  draw: 'var(--color-text-secondary)',
};

export default function CompetitionMatchForm({
  competitionId,
  matchId,
}: Readonly<{ competitionId: string; matchId?: string }>) {
  const router = useRouter();
  const { data: matches = [] } = useCompetitionMatches(competitionId);
  const existing = matchId ? matches.find(m => m.id === matchId) : undefined;
  const createMatch = useCreateMatch(competitionId);
  const updateMatch = useUpdateMatch(competitionId);
  const deleteMatch = useDeleteMatch(competitionId);

  const [opponentName, setOpponentName] = useState(existing?.opponent_name ?? '');
  const [result, setResult] = useState<MatchResult>(existing?.result ?? 'win');
  const [method, setMethod] = useState(existing?.method ?? '');
  const [notes, setNotes] = useState(existing?.notes ?? '');
  const [saving, setSaving] = useState(false);

  const backHref = `/competitions/${competitionId}`;

  const handleSave = async () => {
    if (!opponentName.trim()) return;
    setSaving(true);
    const changes = {
      opponent_name: opponentName.trim(),
      result,
      method: method.trim() || null,
      match_order: existing?.match_order ?? matches.length + 1,
      notes: notes.trim() || null,
    };
    try {
      if (existing) {
        await updateMatch.mutateAsync({ matchId: existing.id, changes });
      } else {
        await createMatch.mutateAsync(changes);
      }
      router.push(backHref);
    } catch {
      // toast already shown by the mutation itself
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!existing) return;
    if (!confirm('Delete this match? This cannot be undone.')) return;
    try {
      await deleteMatch.mutateAsync(existing.id);
      router.push(backHref);
    } catch {
      // toast already shown by the mutation itself
    }
  };

  return (
    <div className="flex w-full max-w-2xl flex-col gap-4">
      <h1 className="text-2xl font-extrabold text-text-primary">{existing ? 'Edit Match' : 'Log Match'}</h1>

      <div>
        <label className="mb-1 block text-xs font-semibold text-text-secondary">Opponent</label>
        <Input value={opponentName} onChange={e => setOpponentName(e.target.value)} placeholder="Opponent's name" />
      </div>

      <div>
        <label className="mb-1 block text-xs font-semibold text-text-secondary">Result</label>
        <div className="flex flex-wrap gap-2">
          {RESULT_OPTIONS.map(option => (
            <Chip
              key={option.value}
              active={result === option.value}
              activeColor={RESULT_COLOR_VAR[option.value]}
              onClick={() => setResult(option.value)}
            >
              {option.label}
            </Chip>
          ))}
        </div>
      </div>

      <div>
        <label className="mb-1 block text-xs font-semibold text-text-secondary">Method</label>
        <Input value={method} onChange={e => setMethod(e.target.value)} placeholder="e.g. Submission - Armbar, Points, Decision" />
      </div>

      <div>
        <label className="mb-1 block text-xs font-semibold text-text-secondary">Notes</label>
        <Textarea rows={4} value={notes} onChange={e => setNotes(e.target.value)} placeholder="Optional" />
      </div>

      <Button disabled={saving || !opponentName.trim()} onClick={handleSave} className="mt-2">
        {saving ? 'Saving…' : existing ? 'Save Changes' : 'Log Match'}
      </Button>

      {existing ? (
        <Button variant="danger" onClick={handleDelete}>
          Delete Match
        </Button>
      ) : null}
    </div>
  );
}
