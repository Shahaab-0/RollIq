'use client';

import Link from 'next/link';
import { ClipboardList, Plus, Trash2 } from 'lucide-react';
import { useDeleteSession, useSessions } from '@/features/trainingLog/hooks/useSessions';
import { SESSION_TYPE_OPTIONS } from '@/features/trainingLog/types';
import { formatDisplayDate } from '@/lib/dateFormat';
import EmptyState from '@/components/EmptyState';
import Button from '@/components/ui/Button';

const SESSION_TYPE_LABELS = Object.fromEntries(SESSION_TYPE_OPTIONS.map(o => [o.value, o.label]));

export default function TrainingLogPage() {
  const { data: sessions = [], isLoading } = useSessions();
  const deleteSession = useDeleteSession();

  return (
    <div className="flex w-full max-w-5xl flex-col gap-5">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-extrabold text-text-primary">Training Log</h1>
        <Link href="/log/new">
          <Button className="flex items-center gap-2">
            <Plus size={16} strokeWidth={2.5} />
            Log Session
          </Button>
        </Link>
      </div>

      {isLoading ? (
        <p className="text-sm text-text-secondary">Loading…</p>
      ) : sessions.length === 0 ? (
        <EmptyState
          icon={ClipboardList}
          title="No sessions yet"
          description="Log your first training session to start tracking your BJJ journey."
        />
      ) : (
        <div className="flex flex-col gap-2.5">
          {sessions.map(item => (
            <div
              key={item.id}
              className="flex items-center justify-between rounded-2xl border border-border bg-surface p-4"
            >
              <Link href={`/log/${item.id}`} className="flex-1">
                <p className="text-sm font-semibold text-text-primary">
                  {item.gi ? 'Gi' : 'No-Gi'} · {SESSION_TYPE_LABELS[item.session_type]}
                </p>
                <p className="text-xs text-text-secondary">
                  {formatDisplayDate(item.date)}
                  {item.duration_minutes ? ` · ${item.duration_minutes} min` : ''}
                  {item.rounds_count
                    ? ` · ${item.rounds_count} rounds${item.round_minutes ? ` × ${item.round_minutes} min` : ''}`
                    : ''}
                </p>
              </Link>
              <button
                onClick={() => deleteSession.mutate(item.id)}
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
