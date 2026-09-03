'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useCompetitions, useCreateCompetition, useDeleteCompetition, useUpdateCompetition } from '../hooks/useCompetitions';
import { toLocalDateString } from '@/lib/dateFormat';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import Textarea from '@/components/ui/Textarea';

export default function CompetitionForm({ competitionId }: Readonly<{ competitionId?: string }>) {
  const router = useRouter();
  const { data: competitions = [], isLoading, isError } = useCompetitions();
  const existing = competitionId ? competitions.find(c => c.id === competitionId) : undefined;
  const createCompetition = useCreateCompetition();
  const updateCompetition = useUpdateCompetition();
  const deleteCompetition = useDeleteCompetition();

  const [name, setName] = useState(existing?.name ?? '');
  const [competitionDate, setCompetitionDate] = useState(existing?.competition_date ?? toLocalDateString(new Date()));
  const [weightCategory, setWeightCategory] = useState(existing?.weight_category ?? '');
  const [beltDivision, setBeltDivision] = useState(existing?.belt_division ?? '');
  const [location, setLocation] = useState(existing?.location ?? '');
  const [notes, setNotes] = useState(existing?.notes ?? '');
  const [saving, setSaving] = useState(false);

  // See SessionForm.tsx -- hydrates once real data arrives so a direct URL
  // load can't silently seed blanks and overwrite the record on save.
  const [hydrated, setHydrated] = useState(false);
  /* eslint-disable react-hooks/set-state-in-effect */
  useEffect(() => {
    if (existing && !hydrated) {
      setHydrated(true);
      setName(existing.name);
      setCompetitionDate(existing.competition_date);
      setWeightCategory(existing.weight_category);
      setBeltDivision(existing.belt_division ?? '');
      setLocation(existing.location ?? '');
      setNotes(existing.notes ?? '');
    }
  }, [existing, hydrated]);
  /* eslint-enable react-hooks/set-state-in-effect */

  const awaitingHydration = !!competitionId && !hydrated && isLoading;
  const notFound = !!competitionId && !hydrated && !isLoading && !isError && !existing;

  const handleSave = async () => {
    if (!name.trim() || !weightCategory.trim()) return;
    setSaving(true);
    const changes = {
      name: name.trim(),
      competition_date: competitionDate,
      weight_category: weightCategory.trim(),
      belt_division: beltDivision.trim() || null,
      location: location.trim() || null,
      notes: notes.trim() || null,
    };
    try {
      if (existing) {
        await updateCompetition.mutateAsync({ id: existing.id, changes });
        router.push(`/competitions/${existing.id}`);
      } else {
        const created = await createCompetition.mutateAsync(changes);
        router.push(`/competitions/${created.id}`);
      }
    } catch {
      // toast already shown by the mutation itself
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!existing) return;
    if (!confirm('Delete this competition and every match logged under it? This cannot be undone.')) return;
    try {
      await deleteCompetition.mutateAsync(existing.id);
      router.push('/competitions');
    } catch {
      // toast already shown by the mutation itself
    }
  };

  if (awaitingHydration) {
    return <p className="text-sm text-text-secondary">Loading…</p>;
  }

  if (!!competitionId && !hydrated && isError) {
    return <p className="text-sm text-danger">Couldn&apos;t load this competition. Try refreshing.</p>;
  }

  if (notFound) {
    return <p className="text-sm text-text-secondary">Competition not found.</p>;
  }

  return (
    <div className="flex w-full max-w-2xl flex-col gap-4">
      <h1 className="text-2xl font-extrabold tracking-tight text-text-primary">{existing ? 'Edit Competition' : 'Log Competition'}</h1>

      <div>
        <label className="mb-1 block text-xs font-semibold text-text-secondary">Competition name</label>
        <Input value={name} onChange={e => setName(e.target.value)} placeholder="e.g. IBJJF Pan Ams" />
      </div>

      <div>
        <label className="mb-1 block text-xs font-semibold text-text-secondary">Date</label>
        <Input type="date" max={toLocalDateString(new Date())} value={competitionDate} onChange={e => setCompetitionDate(e.target.value)} />
      </div>

      <div>
        <label className="mb-1 block text-xs font-semibold text-text-secondary">Weight category</label>
        <Input value={weightCategory} onChange={e => setWeightCategory(e.target.value)} placeholder="e.g. Featherweight" />
      </div>

      <div>
        <label className="mb-1 block text-xs font-semibold text-text-secondary">Belt division</label>
        <Input value={beltDivision} onChange={e => setBeltDivision(e.target.value)} placeholder="Optional -- e.g. Blue Belt Adult" />
      </div>

      <div>
        <label className="mb-1 block text-xs font-semibold text-text-secondary">Location</label>
        <Input value={location} onChange={e => setLocation(e.target.value)} placeholder="Optional" />
      </div>

      <div>
        <label className="mb-1 block text-xs font-semibold text-text-secondary">Notes</label>
        <Textarea rows={4} value={notes} onChange={e => setNotes(e.target.value)} placeholder="Optional" />
      </div>

      <Button disabled={saving || !name.trim() || !weightCategory.trim()} onClick={handleSave} className="mt-2">
        {saving ? 'Saving…' : existing ? 'Save Changes' : 'Log Competition'}
      </Button>

      {existing ? (
        <Button variant="danger" onClick={handleDelete}>
          Delete Competition
        </Button>
      ) : null}
    </div>
  );
}
