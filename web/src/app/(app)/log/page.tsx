'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ClipboardList, Plus, Trash2 } from 'lucide-react';
import { useDeleteSession, useSessions } from '@/features/trainingLog/hooks/useSessions';
import { SESSION_TYPE_OPTIONS } from '@/features/trainingLog/types';
import { formatDisplayDate } from '@/lib/dateFormat';
import EmptyState from '@/components/EmptyState';
import Button from '@/components/ui/Button';
import { Table, Thead, Tbody, Tr, Th, Td, TableRowActions } from '@/components/ui/Table';

const SESSION_TYPE_LABELS = Object.fromEntries(SESSION_TYPE_OPTIONS.map(o => [o.value, o.label]));

function TrainingLogSkeleton() {
  return (
    <div className="flex w-full animate-pulse flex-col gap-5">
      <div className="flex items-center justify-between">
        <div className="h-8 w-48 rounded-lg bg-surface-alt" />
        <div className="h-11 w-36 rounded-xl bg-surface-alt" />
      </div>
      <div className="overflow-hidden rounded-2xl border border-border">
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className="h-12 border-b border-border bg-surface-alt last:border-0" />
        ))}
      </div>
    </div>
  );
}

export default function TrainingLogPage() {
  const router = useRouter();
  const { data: sessions = [], isLoading } = useSessions();
  const deleteSession = useDeleteSession();

  if (isLoading) {
    return <TrainingLogSkeleton />;
  }

  return (
    <div className="flex w-full flex-col gap-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-2xl font-extrabold tracking-tight text-text-primary">Training Log</h1>
        <Link href="/log/new">
          <Button className="flex items-center gap-2">
            <Plus size={16} strokeWidth={2.5} />
            Log Session
          </Button>
        </Link>
      </div>

      {sessions.length === 0 ? (
        <EmptyState
          icon={ClipboardList}
          title="No sessions yet"
          description="Log your first training session to start tracking your BJJ journey."
        />
      ) : (
        <Table>
          <Thead>
            <Tr>
              <Th>Date</Th>
              <Th>Type</Th>
              <Th>Gi</Th>
              <Th>Duration</Th>
              <Th>Instructor</Th>
              <Th aria-hidden />
            </Tr>
          </Thead>
          <Tbody>
            {sessions.map(item => (
              <Tr key={item.id} onClick={() => router.push(`/log/${item.id}`)}>
                <Td className="font-semibold">{formatDisplayDate(item.date)}</Td>
                <Td>{SESSION_TYPE_LABELS[item.session_type]}</Td>
                <Td>{item.gi ? 'Gi' : 'No-Gi'}</Td>
                <Td className="font-mono tabular-nums">
                  {item.duration_minutes ? `${item.duration_minutes} min` : '—'}
                  {item.rounds_count ? ` · ${item.rounds_count} rounds` : ''}
                </Td>
                <Td className="text-text-secondary">{item.instructor || '—'}</Td>
                <Td>
                  <TableRowActions>
                    <button
                      onClick={e => {
                        e.stopPropagation();
                        deleteSession.mutate(item.id);
                      }}
                      aria-label={`Delete session on ${formatDisplayDate(item.date)}`}
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
