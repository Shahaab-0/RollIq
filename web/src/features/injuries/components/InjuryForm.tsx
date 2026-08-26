'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useCreateInjury, useDeleteInjury, useInjuries, useUpdateInjury } from '../hooks/useInjuries';
import { SEVERITY_OPTIONS, STATUS_OPTIONS, type InjuryStatus, type Severity } from '../types';
import { toLocalDateString } from '@/lib/dateFormat';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import Textarea from '@/components/ui/Textarea';
import Chip from '@/components/ui/Chip';

export default function InjuryForm({ injuryId }: Readonly<{ injuryId?: string }>) {
  const router = useRouter();
  const { data: injuries = [] } = useInjuries();
  const existing = injuryId ? injuries.find(i => i.id === injuryId) : undefined;
  const createInjury = useCreateInjury();
  const updateInjury = useUpdateInjury();
  const deleteInjury = useDeleteInjury();

  const [bodyPart, setBodyPart] = useState(existing?.body_part ?? '');
  const [description, setDescription] = useState(existing?.description ?? '');
  const [injuryDate, setInjuryDate] = useState(existing?.injury_date ?? toLocalDateString(new Date()));
  const [severity, setSeverity] = useState<Severity>(existing?.severity ?? 'mild');
  const [status, setStatus] = useState<InjuryStatus>(existing?.status ?? 'active');
  const [notes, setNotes] = useState(existing?.notes ?? '');
  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    if (!bodyPart.trim() || !description.trim()) return;
    setSaving(true);
    const changes = {
      body_part: bodyPart.trim(),
      description: description.trim(),
      injury_date: injuryDate,
      severity,
      status,
      notes: notes.trim() || null,
    };
    try {
      if (existing) {
        await updateInjury.mutateAsync({ id: existing.id, changes });
      } else {
        await createInjury.mutateAsync(changes);
      }
      router.push('/injuries');
    } catch {
      // toast already shown by the mutation itself
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!existing) return;
    if (!confirm('Delete this injury? This cannot be undone.')) return;
    try {
      await deleteInjury.mutateAsync(existing.id);
      router.push('/injuries');
    } catch {
      // toast already shown by the mutation itself
    }
  };

  return (
    <div className="flex w-full max-w-2xl flex-col gap-4">
      <h1 className="text-2xl font-extrabold text-text-primary">{existing ? 'Edit Injury' : 'Log Injury'}</h1>

      <div>
        <label className="mb-1 block text-xs font-semibold text-text-secondary">Body part</label>
        <Input value={bodyPart} onChange={e => setBodyPart(e.target.value)} placeholder="e.g. Left knee" />
      </div>

      <div>
        <label className="mb-1 block text-xs font-semibold text-text-secondary">Description</label>
        <Textarea rows={3} value={description} onChange={e => setDescription(e.target.value)} placeholder="What happened?" />
      </div>

      <div>
        <label className="mb-1 block text-xs font-semibold text-text-secondary">Date</label>
        <Input type="date" max={toLocalDateString(new Date())} value={injuryDate} onChange={e => setInjuryDate(e.target.value)} />
      </div>

      <div>
        <label className="mb-1 block text-xs font-semibold text-text-secondary">Severity</label>
        <div className="flex flex-wrap gap-2">
          {SEVERITY_OPTIONS.map(option => (
            <Chip key={option.value} active={severity === option.value} onClick={() => setSeverity(option.value)}>
              {option.label}
            </Chip>
          ))}
        </div>
      </div>

      <div>
        <label className="mb-1 block text-xs font-semibold text-text-secondary">Status</label>
        <div className="flex flex-wrap gap-2">
          {STATUS_OPTIONS.map(option => (
            <Chip key={option.value} active={status === option.value} onClick={() => setStatus(option.value)}>
              {option.label}
            </Chip>
          ))}
        </div>
      </div>

      <div>
        <label className="mb-1 block text-xs font-semibold text-text-secondary">Notes</label>
        <Textarea rows={3} value={notes} onChange={e => setNotes(e.target.value)} placeholder="Optional" />
      </div>

      <Button disabled={saving || !bodyPart.trim() || !description.trim()} onClick={handleSave} className="mt-2">
        {saving ? 'Saving…' : existing ? 'Save Changes' : 'Log Injury'}
      </Button>

      {existing ? (
        <Button variant="danger" onClick={handleDelete}>
          Delete Injury
        </Button>
      ) : null}
    </div>
  );
}
