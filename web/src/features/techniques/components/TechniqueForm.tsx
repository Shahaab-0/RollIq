'use client';

import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { useCreateTechnique, useDeleteTechnique, useTechniques, useUpdateTechnique } from '../hooks/useTechniques';
import { POSITION_PRESETS } from '../types';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import Textarea from '@/components/ui/Textarea';
import Chip from '@/components/ui/Chip';

export default function TechniqueForm({ techniqueId }: Readonly<{ techniqueId?: string }>) {
  const router = useRouter();
  const { data: techniques = [], isLoading } = useTechniques();
  const existing = techniqueId ? techniques.find(t => t.id === techniqueId) : undefined;
  const createTechnique = useCreateTechnique();
  const updateTechnique = useUpdateTechnique();
  const deleteTechnique = useDeleteTechnique();

  const [name, setName] = useState(existing?.name ?? '');
  const [position, setPosition] = useState(existing?.position ?? '');
  const [resourceUrl, setResourceUrl] = useState(existing?.resource_url ?? '');
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
      setPosition(existing.position);
      setResourceUrl(existing.resource_url ?? '');
      setNotes(existing.notes ?? '');
    }
  }, [existing, hydrated]);
  /* eslint-enable react-hooks/set-state-in-effect */

  const awaitingHydration = !!techniqueId && !hydrated && isLoading;
  const notFound = !!techniqueId && !hydrated && !isLoading && !existing;

  const handleSave = async () => {
    if (!name.trim() || !position.trim()) return;
    setSaving(true);
    const changes = {
      name: name.trim(),
      position: position.trim(),
      resource_url: resourceUrl.trim() || null,
      notes: notes.trim() || null,
    };
    try {
      if (existing) {
        await updateTechnique.mutateAsync({ id: existing.id, changes });
      } else {
        await createTechnique.mutateAsync(changes);
      }
      router.push('/techniques');
    } catch {
      // toast already shown by the mutation itself
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!existing) return;
    if (!confirm('Delete this technique? This cannot be undone.')) return;
    try {
      await deleteTechnique.mutateAsync(existing.id);
      router.push('/techniques');
    } catch {
      // toast already shown by the mutation itself
    }
  };

  if (awaitingHydration) {
    return <p className="text-sm text-text-secondary">Loading…</p>;
  }

  if (notFound) {
    return <p className="text-sm text-text-secondary">Technique not found.</p>;
  }

  return (
    <div className="flex w-full max-w-2xl flex-col gap-4">
      <h1 className="text-2xl font-extrabold text-text-primary">
        {existing ? 'Edit Technique' : 'New Technique'}
      </h1>

      {existing ? <p className="text-sm text-text-secondary">{existing.drill_count} drills logged</p> : null}

      <div>
        <label className="mb-1 block text-xs font-semibold text-text-secondary">Name</label>
        <Input value={name} onChange={e => setName(e.target.value)} placeholder="e.g. Scissor Sweep" />
      </div>

      <div>
        <label className="mb-1 block text-xs font-semibold text-text-secondary">Position</label>
        <div className="mb-2 flex flex-wrap gap-2">
          {POSITION_PRESETS.map(preset => (
            <Chip key={preset} active={position === preset} onClick={() => setPosition(preset)}>
              {preset}
            </Chip>
          ))}
        </div>
        <Input value={position} onChange={e => setPosition(e.target.value)} placeholder="Or type your own" />
      </div>

      <div>
        <label className="mb-1 block text-xs font-semibold text-text-secondary">Resource link</label>
        <Input
          value={resourceUrl}
          onChange={e => setResourceUrl(e.target.value)}
          placeholder="Optional (YouTube, BJJ Fanatics, etc.)"
        />
      </div>

      <div>
        <label className="mb-1 block text-xs font-semibold text-text-secondary">Notes</label>
        <Textarea
          rows={4}
          value={notes}
          onChange={e => setNotes(e.target.value)}
          placeholder="Key details, setups, common mistakes…"
        />
      </div>

      <Button disabled={saving || !name.trim() || !position.trim()} onClick={handleSave} className="mt-2">
        {saving ? 'Saving…' : existing ? 'Save Changes' : 'Add Technique'}
      </Button>

      {existing ? (
        <Button variant="danger" onClick={handleDelete}>
          Delete Technique
        </Button>
      ) : null}
    </div>
  );
}
