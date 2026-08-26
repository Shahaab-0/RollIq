'use client';

import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { useCreateSession, useDeleteSession, useSessions, useUpdateSession } from '../hooks/useSessions';
import { SESSION_TYPE_OPTIONS, type SessionType } from '../types';
import { toLocalDateString } from '@/lib/dateFormat';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import Textarea from '@/components/ui/Textarea';
import Chip from '@/components/ui/Chip';

export default function SessionForm({ sessionId }: Readonly<{ sessionId?: string }>) {
  const router = useRouter();
  const { data: sessions = [], isLoading, isError } = useSessions();
  const existing = sessionId ? sessions.find(s => s.id === sessionId) : undefined;
  const createSession = useCreateSession();
  const updateSession = useUpdateSession();
  const deleteSession = useDeleteSession();

  const [date, setDate] = useState(existing?.date ?? toLocalDateString(new Date()));
  const [gi, setGi] = useState(existing?.gi ?? true);
  const [sessionType, setSessionType] = useState<SessionType>(existing?.session_type ?? 'fundamentals');
  const [durationMinutes, setDurationMinutes] = useState(existing?.duration_minutes?.toString() ?? '');
  const [instructor, setInstructor] = useState(existing?.instructor ?? '');
  const [roundsCount, setRoundsCount] = useState(existing?.rounds_count?.toString() ?? '');
  const [roundMinutes, setRoundMinutes] = useState(existing?.round_minutes?.toString() ?? '');
  const [productivityRating, setProductivityRating] = useState(existing?.productivity_rating ?? null as number | null);
  const [submissionsLandedCount, setSubmissionsLandedCount] = useState(
    existing?.submissions_landed_count?.toString() ?? '',
  );
  const [notes, setNotes] = useState(existing?.notes ?? '');
  const [saving, setSaving] = useState(false);

  // On a direct URL load (hard refresh, bookmark, shared link) the sessions
  // list query hasn't resolved yet on first render, so `existing` starts
  // undefined and every field above seeds to its blank default -- the
  // useState initializer only runs once and never re-syncs on its own.
  // Hydrate once, the moment real data shows up, so Save can't silently
  // overwrite the record with defaults.
  const [hydrated, setHydrated] = useState(false);
  /* eslint-disable react-hooks/set-state-in-effect */
  useEffect(() => {
    if (existing && !hydrated) {
      setHydrated(true);
      setDate(existing.date);
      setGi(existing.gi);
      setSessionType(existing.session_type);
      setDurationMinutes(existing.duration_minutes?.toString() ?? '');
      setInstructor(existing.instructor ?? '');
      setRoundsCount(existing.rounds_count?.toString() ?? '');
      setRoundMinutes(existing.round_minutes?.toString() ?? '');
      setProductivityRating(existing.productivity_rating ?? null);
      setSubmissionsLandedCount(existing.submissions_landed_count?.toString() ?? '');
      setNotes(existing.notes ?? '');
    }
  }, [existing, hydrated]);
  /* eslint-enable react-hooks/set-state-in-effect */

  const awaitingHydration = !!sessionId && !hydrated && isLoading;
  const notFound = !!sessionId && !hydrated && !isLoading && !isError && !existing;

  const toIntOrNull = (v: string) => (v.trim() ? parseInt(v, 10) : null);

  const handleSave = async () => {
    setSaving(true);
    const changes = {
      date,
      gi,
      session_type: sessionType,
      duration_minutes: toIntOrNull(durationMinutes),
      instructor: instructor.trim() || null,
      rounds_count: toIntOrNull(roundsCount),
      round_minutes: toIntOrNull(roundMinutes),
      productivity_rating: productivityRating,
      submissions_landed_count: toIntOrNull(submissionsLandedCount),
      notes: notes.trim() || null,
    };
    try {
      if (existing) {
        await updateSession.mutateAsync({ id: existing.id, changes });
      } else {
        await createSession.mutateAsync(changes);
      }
      router.push('/log');
    } catch {
      // toast already shown by the mutation itself
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!existing) return;
    if (!confirm('Delete this session? This cannot be undone.')) return;
    try {
      await deleteSession.mutateAsync(existing.id);
      router.push('/log');
    } catch {
      // toast already shown by the mutation itself
    }
  };

  if (awaitingHydration) {
    return <p className="text-sm text-text-secondary">Loading…</p>;
  }

  if (!!sessionId && !hydrated && isError) {
    return <p className="text-sm text-danger">Couldn&apos;t load this session. Try refreshing.</p>;
  }

  if (notFound) {
    return <p className="text-sm text-text-secondary">Session not found.</p>;
  }

  return (
    <div className="flex w-full max-w-2xl flex-col gap-4">
      <h1 className="text-2xl font-extrabold text-text-primary">
        {existing ? 'Edit Session' : 'Log Session'}
      </h1>

      <div>
        <label className="mb-1 block text-xs font-semibold text-text-secondary">Date</label>
        <Input type="date" max={toLocalDateString(new Date())} value={date} onChange={e => setDate(e.target.value)} />
      </div>

      <div>
        <label className="mb-1 block text-xs font-semibold text-text-secondary">Gi / No-Gi</label>
        <div className="flex gap-2">
          <Chip active={gi} onClick={() => setGi(true)}>
            Gi
          </Chip>
          <Chip active={!gi} onClick={() => setGi(false)}>
            No-Gi
          </Chip>
        </div>
      </div>

      <div>
        <label className="mb-1 block text-xs font-semibold text-text-secondary">Session type</label>
        <div className="flex flex-wrap gap-2">
          {SESSION_TYPE_OPTIONS.map(opt => (
            <Chip key={opt.value} active={sessionType === opt.value} onClick={() => setSessionType(opt.value)}>
              {opt.label}
            </Chip>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="mb-1 block text-xs font-semibold text-text-secondary">Duration (min)</label>
          <Input
            type="number"
            min={0}
            value={durationMinutes}
            onChange={e => setDurationMinutes(e.target.value)}
          />
        </div>
        <div>
          <label className="mb-1 block text-xs font-semibold text-text-secondary">Instructor</label>
          <Input value={instructor} onChange={e => setInstructor(e.target.value)} placeholder="Optional" />
        </div>
        <div>
          <label className="mb-1 block text-xs font-semibold text-text-secondary">Rounds</label>
          <Input type="number" min={0} value={roundsCount} onChange={e => setRoundsCount(e.target.value)} />
        </div>
        <div>
          <label className="mb-1 block text-xs font-semibold text-text-secondary">Round length (min)</label>
          <Input type="number" min={0} value={roundMinutes} onChange={e => setRoundMinutes(e.target.value)} />
        </div>
        <div>
          <label className="mb-1 block text-xs font-semibold text-text-secondary">Submissions landed</label>
          <Input
            type="number"
            min={0}
            value={submissionsLandedCount}
            onChange={e => setSubmissionsLandedCount(e.target.value)}
          />
        </div>
      </div>

      <div>
        <label className="mb-1 block text-xs font-semibold text-text-secondary">Productivity (1-5)</label>
        <div className="flex gap-2">
          {[1, 2, 3, 4, 5].map(n => (
            <Chip
              key={n}
              active={productivityRating === n}
              onClick={() => setProductivityRating(productivityRating === n ? null : n)}
            >
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
        {saving ? 'Saving…' : existing ? 'Save Changes' : 'Log Session'}
      </Button>

      {existing ? (
        <Button variant="danger" onClick={handleDelete}>
          Delete Session
        </Button>
      ) : null}
    </div>
  );
}
