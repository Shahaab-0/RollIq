'use client';

import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { useCreateRoll, useDeleteRoll, useRolls, useUpdateRoll } from '../hooks/useRolls';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import Textarea from '@/components/ui/Textarea';
import Chip from '@/components/ui/Chip';
import TagInput from '@/components/ui/TagInput';

export default function RollForm({ rollId }: Readonly<{ rollId?: string }>) {
  const router = useRouter();
  const { data: rolls = [], isLoading, isError } = useRolls();
  const existing = rollId ? rolls.find(r => r.id === rollId) : undefined;
  const createRoll = useCreateRoll();
  const updateRoll = useUpdateRoll();
  const deleteRoll = useDeleteRoll();

  const [partnerName, setPartnerName] = useState(existing?.partner_name ?? '');
  const [submissionsLanded, setSubmissionsLanded] = useState<string[]>(existing?.submissions_landed ?? []);
  const [submissionsReceived, setSubmissionsReceived] = useState<string[]>(
    existing?.submissions_received ?? [],
  );
  const [escapes, setEscapes] = useState(existing?.escapes?.toString() ?? '0');
  const [effortRating, setEffortRating] = useState(existing?.effort_rating ?? null as number | null);
  const [notes, setNotes] = useState(existing?.notes ?? '');
  const [saving, setSaving] = useState(false);

  // See SessionForm.tsx -- hydrates once real data arrives so a direct URL
  // load can't silently seed blanks and overwrite the record on save.
  const [hydrated, setHydrated] = useState(false);
  /* eslint-disable react-hooks/set-state-in-effect */
  useEffect(() => {
    if (existing && !hydrated) {
      setHydrated(true);
      setPartnerName(existing.partner_name ?? '');
      setSubmissionsLanded(existing.submissions_landed);
      setSubmissionsReceived(existing.submissions_received);
      setEscapes(existing.escapes?.toString() ?? '0');
      setEffortRating(existing.effort_rating ?? null);
      setNotes(existing.notes ?? '');
    }
  }, [existing, hydrated]);
  /* eslint-enable react-hooks/set-state-in-effect */

  const awaitingHydration = !!rollId && !hydrated && isLoading;
  const notFound = !!rollId && !hydrated && !isLoading && !isError && !existing;

  const handleSave = async () => {
    setSaving(true);
    const changes = {
      partner_name: partnerName.trim() || null,
      submissions_landed: submissionsLanded,
      submissions_received: submissionsReceived,
      escapes: parseInt(escapes, 10) || 0,
      effort_rating: effortRating,
      notes: notes.trim() || null,
      session_id: existing?.session_id ?? null,
    };
    try {
      if (existing) {
        await updateRoll.mutateAsync({ id: existing.id, changes });
      } else {
        await createRoll.mutateAsync(changes);
      }
      router.push('/rolls');
    } catch {
      // toast already shown by the mutation itself
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!existing) return;
    if (!confirm('Delete this roll? This cannot be undone.')) return;
    try {
      await deleteRoll.mutateAsync(existing.id);
      router.push('/rolls');
    } catch {
      // toast already shown by the mutation itself
    }
  };

  if (awaitingHydration) {
    return <p className="text-sm text-text-secondary">Loading…</p>;
  }

  if (!!rollId && !hydrated && isError) {
    return <p className="text-sm text-danger">Couldn&apos;t load this roll. Try refreshing.</p>;
  }

  if (notFound) {
    return <p className="text-sm text-text-secondary">Roll not found.</p>;
  }

  return (
    <div className="flex w-full max-w-2xl flex-col gap-4">
      <h1 className="text-2xl font-extrabold text-text-primary">{existing ? 'Edit Roll' : 'Log Roll'}</h1>

      <div>
        <label className="mb-1 block text-xs font-semibold text-text-secondary">Partner</label>
        <Input value={partnerName} onChange={e => setPartnerName(e.target.value)} placeholder="Optional" />
      </div>

      <div>
        <label className="mb-1 block text-xs font-semibold text-text-secondary">Submissions landed</label>
        <TagInput values={submissionsLanded} onChange={setSubmissionsLanded} placeholder="Type and press Enter" />
      </div>

      <div>
        <label className="mb-1 block text-xs font-semibold text-text-secondary">Submissions received</label>
        <TagInput values={submissionsReceived} onChange={setSubmissionsReceived} placeholder="Type and press Enter" />
      </div>

      <div>
        <label className="mb-1 block text-xs font-semibold text-text-secondary">Escapes</label>
        <Input type="number" min={0} value={escapes} onChange={e => setEscapes(e.target.value)} />
      </div>

      <div>
        <label className="mb-1 block text-xs font-semibold text-text-secondary">Effort (1-5)</label>
        <div className="flex gap-2">
          {[1, 2, 3, 4, 5].map(n => (
            <Chip key={n} active={effortRating === n} onClick={() => setEffortRating(effortRating === n ? null : n)}>
              {n}
            </Chip>
          ))}
        </div>
      </div>

      <div>
        <label className="mb-1 block text-xs font-semibold text-text-secondary">Notes</label>
        <Textarea rows={4} value={notes} onChange={e => setNotes(e.target.value)} placeholder="Optional" />
      </div>

      <Button disabled={saving} onClick={handleSave} className="mt-2">
        {saving ? 'Saving…' : existing ? 'Save Changes' : 'Log Roll'}
      </Button>

      {existing ? (
        <Button variant="danger" onClick={handleDelete}>
          Delete Roll
        </Button>
      ) : null}
    </div>
  );
}
