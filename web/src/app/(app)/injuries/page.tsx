'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { HeartPulse, Plus, Trash2 } from 'lucide-react';
import { formatDisplayDate } from '@/lib/dateFormat';
import { useDeleteInjury, useInjuries } from '@/features/injuries/hooks/useInjuries';
import type { Injury } from '@/features/injuries/types';
import EmptyState from '@/components/EmptyState';
import Button from '@/components/ui/Button';
import { Table, Thead, Tbody, Tr, Th, Td, TableRowActions } from '@/components/ui/Table';

const SEVERITY_LABEL: Record<string, string> = { mild: 'Mild', moderate: 'Moderate', severe: 'Severe' };

function InjuryTable({
  items,
  onOpen,
  onDelete,
}: Readonly<{ items: Injury[]; onOpen: (id: string) => void; onDelete: (id: string) => void }>) {
  return (
    <Table>
      <Thead>
        <Tr>
          <Th>Body part</Th>
          <Th>Description</Th>
          <Th>Date</Th>
          <Th>Severity</Th>
          <Th>Status</Th>
          <Th aria-hidden />
        </Tr>
      </Thead>
      <Tbody>
        {items.map(item => (
          <Tr key={item.id} onClick={() => onOpen(item.id)}>
            <Td className="font-semibold">{item.body_part}</Td>
            <Td className="max-w-xs truncate text-text-secondary">{item.description}</Td>
            <Td className="text-text-secondary">{formatDisplayDate(item.injury_date)}</Td>
            <Td className="text-text-secondary">{SEVERITY_LABEL[item.severity]}</Td>
            <Td>
              <span
                className={`rounded-lg px-2 py-1 text-xs font-semibold capitalize ${
                  item.status === 'active' ? 'bg-accent-muted text-danger' : 'bg-surface-alt text-text-secondary'
                }`}
              >
                {item.status}
              </span>
            </Td>
            <Td>
              <TableRowActions>
                <button
                  onClick={e => {
                    e.stopPropagation();
                    onDelete(item.id);
                  }}
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
  );
}

export default function InjuriesPage() {
  const router = useRouter();
  const { data: injuries = [], isLoading } = useInjuries();
  const deleteInjury = useDeleteInjury();

  const active = injuries.filter(i => i.status !== 'resolved');
  const resolved = injuries.filter(i => i.status === 'resolved');

  const openItem = (id: string) => router.push(`/injuries/${id}`);
  const removeItem = (id: string) => deleteInjury.mutate(id);

  return (
    <div className="flex w-full max-w-5xl flex-col gap-5">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-extrabold tracking-tight text-text-primary">Injuries</h1>
        <Link href="/injuries/new">
          <Button className="flex items-center gap-2">
            <Plus size={16} strokeWidth={2.5} />
            Log an Injury
          </Button>
        </Link>
      </div>

      {isLoading ? (
        <p className="text-sm text-text-secondary">Loading…</p>
      ) : injuries.length === 0 ? (
        <EmptyState
          icon={HeartPulse}
          title="No injuries logged"
          description="Log one if you're carrying something -- keeping a record helps you spot patterns and know when you're actually healed."
        />
      ) : (
        <div className="flex flex-col gap-6">
          {active.length > 0 ? (
            <div className="flex flex-col gap-2.5">
              <h2 className="text-xs font-semibold uppercase tracking-wide text-text-secondary">Active &amp; Recovering</h2>
              <InjuryTable items={active} onOpen={openItem} onDelete={removeItem} />
            </div>
          ) : null}

          {resolved.length > 0 ? (
            <div className="flex flex-col gap-2.5">
              <h2 className="text-xs font-semibold uppercase tracking-wide text-text-secondary">Resolved</h2>
              <InjuryTable items={resolved} onOpen={openItem} onDelete={removeItem} />
            </div>
          ) : null}
        </div>
      )}
    </div>
  );
}
