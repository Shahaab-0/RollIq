'use client';

import { useState } from 'react';
import { Plus, Trash2 } from 'lucide-react';
import { formatDisplayTime } from '@/lib/dateFormat';
import { useCreateScheduleEntry, useDeleteScheduleEntry, useGymSchedule } from '../hooks/useGyms';
import { WEEKDAY_LABELS } from '../types';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import Chip from '@/components/ui/Chip';

interface Props {
  gymId: string;
  canManage: boolean;
}

const WEEKDAYS = [1, 2, 3, 4, 5, 6, 7];

// Self-contained: owns its own useGymSchedule()/useCreateScheduleEntry()/
// useDeleteScheduleEntry() fetches. Always shows all 7 weekdays (this is a
// recurring weekly template, not date-specific instances) so a member can
// see the whole week's plan at a glance.
export default function GymScheduleCard({ gymId, canManage }: Readonly<Props>) {
  const { data: entries = [] } = useGymSchedule(gymId);
  const createEntry = useCreateScheduleEntry(gymId);
  const deleteEntry = useDeleteScheduleEntry(gymId);

  const [showAdd, setShowAdd] = useState(false);
  const [dayOfWeek, setDayOfWeek] = useState(1);
  const [startTime, setStartTime] = useState('18:00');
  const [endTime, setEndTime] = useState('19:00');
  const [topic, setTopic] = useState('');
  const [saving, setSaving] = useState(false);

  const handleAdd = async () => {
    if (endTime <= startTime) {
      alert('End time must be after the start time.');
      return;
    }
    setSaving(true);
    try {
      await createEntry.mutateAsync({
        day_of_week: dayOfWeek,
        start_time: `${startTime}:00`,
        end_time: `${endTime}:00`,
        topic: topic.trim() || null,
      });
      setShowAdd(false);
      setTopic('');
    } catch {
      // toast already shown by the mutation itself
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="flex flex-col gap-2.5 rounded-2xl border border-border bg-surface p-4">
      <div className="flex items-center justify-between">
        <h2 className="text-sm font-bold text-text-primary">Weekly Schedule</h2>
        {canManage ? (
          <button
            type="button"
            onClick={() => setShowAdd(v => !v)}
            className="flex items-center gap-1 rounded-lg bg-accent px-3 py-1.5 text-xs font-semibold text-accent-text"
          >
            <Plus size={14} strokeWidth={2.5} />
            Add Slot
          </button>
        ) : null}
      </div>

      {WEEKDAYS.map(day => {
        const dayEntries = entries.filter(entry => entry.day_of_week === day);
        return (
          <div key={day} className="flex gap-3 border-t border-border py-2 first:border-t-0">
            <p className="w-24 shrink-0 text-xs font-semibold text-text-secondary">{WEEKDAY_LABELS[day]}</p>
            <div className="flex flex-1 flex-col gap-1.5">
              {dayEntries.length === 0 ? (
                <p className="text-xs text-text-secondary">No class</p>
              ) : (
                dayEntries.map(entry => (
                  <div key={entry.id} className="flex items-center justify-between gap-2">
                    <div>
                      <p className="text-xs font-semibold text-text-primary">
                        {formatDisplayTime(entry.start_time)} – {formatDisplayTime(entry.end_time)}
                      </p>
                      {entry.topic ? <p className="text-[11px] text-text-secondary">{entry.topic}</p> : null}
                    </div>
                    {canManage ? (
                      <button onClick={() => deleteEntry.mutate(entry.id)} className="text-danger">
                        <Trash2 size={14} />
                      </button>
                    ) : null}
                  </div>
                ))
              )}
            </div>
          </div>
        );
      })}

      {showAdd ? (
        <div className="mt-1 flex flex-col gap-3 rounded-xl border border-border bg-surface-alt p-3">
          <div className="flex flex-wrap gap-2">
            {WEEKDAYS.map(day => (
              <Chip key={day} active={dayOfWeek === day} onClick={() => setDayOfWeek(day)}>
                {WEEKDAY_LABELS[day].slice(0, 3)}
              </Chip>
            ))}
          </div>
          <div className="flex gap-3">
            <div className="flex-1">
              <label className="mb-1 block text-xs font-semibold text-text-secondary">From</label>
              <Input type="time" value={startTime} onChange={e => setStartTime(e.target.value)} />
            </div>
            <div className="flex-1">
              <label className="mb-1 block text-xs font-semibold text-text-secondary">To</label>
              <Input type="time" value={endTime} onChange={e => setEndTime(e.target.value)} />
            </div>
          </div>
          <Input value={topic} onChange={e => setTopic(e.target.value)} placeholder="Topic (optional)" />
          <Button disabled={saving} onClick={handleAdd}>
            {saving ? 'Saving…' : 'Add Slot'}
          </Button>
        </div>
      ) : null}
    </div>
  );
}
