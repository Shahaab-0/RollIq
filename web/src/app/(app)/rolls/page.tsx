'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Plus, Swords, Trash2, Users } from 'lucide-react';
import { useDeleteRoll, useRolls } from '@/features/rolls/hooks/useRolls';
import type { Roll } from '@/features/rolls/types';
import EmptyState from '@/components/EmptyState';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import { Table, Thead, Tbody, Tr, Th, Td, TableRowActions } from '@/components/ui/Table';

function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
}

function topTaps(items: Roll[]) {
  const counts = new Map<string, number>();
  for (const roll of items) {
    for (const sub of roll.submissions_received) {
      counts.set(sub, (counts.get(sub) ?? 0) + 1);
    }
  }
  return Array.from(counts.entries())
    .map(([name, count]) => ({ name, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 5);
}

function RollsSkeleton() {
  return (
    <div className="flex w-full animate-pulse flex-col gap-5">
      <div className="flex items-center justify-between">
        <div className="h-8 w-40 rounded-lg bg-surface-alt" />
        <div className="flex gap-2">
          <div className="h-11 w-28 rounded-xl bg-surface-alt" />
          <div className="h-11 w-32 rounded-xl bg-surface-alt" />
        </div>
      </div>
      <div className="overflow-hidden rounded-2xl border border-border">
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className="h-12 border-b border-border bg-surface-alt last:border-0" />
        ))}
      </div>
    </div>
  );
}

export default function RollsPage() {
  const router = useRouter();
  const { data: items = [], isLoading } = useRolls();
  const deleteRoll = useDeleteRoll();
  const taps = topTaps(items);

  if (isLoading) {
    return <RollsSkeleton />;
  }

  return (
    <div className="flex w-full flex-col gap-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-2xl font-extrabold tracking-tight text-text-primary">Roll Tracker</h1>
        <div className="flex flex-wrap gap-2">
          {/* Plain <a>, not next/link's <Link>: /rolls/partners is a real full
              page that also has a literal @modal/(.)rolls/partners guard
              (see that file for why the guard exists). Once a URL matches
              ANY intercepted route -- even one whose intercepting page
              renders null -- Next's client router leaves the `children`
              slot un-re-rendered, since interception is designed to keep
              the underlying page mounted behind a modal. A plain <a> forces
              a full browser navigation, sidestepping that suppression. */}
          {/* eslint-disable-next-line @next/next/no-html-link-for-pages */}
          <a href="/rolls/partners">
            <Button variant="secondary" className="flex items-center gap-2">
              <Users size={16} />
              Partners
            </Button>
          </a>
          <Link href="/rolls/new">
            <Button className="flex items-center gap-2">
              <Plus size={16} strokeWidth={2.5} />
              Log Roll
            </Button>
          </Link>
        </div>
      </div>

      {items.length === 0 ? (
        <EmptyState
          icon={Swords}
          title="No rolls logged yet"
          description="Log a roll after sparring to track partners, submissions, and how the exchange went."
        />
      ) : (
        <div className="grid grid-cols-1 gap-5 lg:grid-cols-12">
          <div className={taps.length > 0 ? 'lg:col-span-8' : 'lg:col-span-12'}>
            <Table>
              <Thead>
                <Tr>
                  <Th>Partner</Th>
                  <Th>Landed</Th>
                  <Th>Received</Th>
                  <Th>Date</Th>
                  <Th aria-hidden />
                </Tr>
              </Thead>
              <Tbody>
                {items.map(item => (
                  <Tr key={item.id} onClick={() => router.push(`/rolls/${item.id}`)}>
                    <Td className="font-semibold">{item.partner_name || 'Open roll'}</Td>
                    <Td className="font-mono tabular-nums">{item.submissions_landed.length}</Td>
                    <Td className="font-mono tabular-nums">{item.submissions_received.length}</Td>
                    <Td className="text-text-secondary">{formatDate(item.created_at)}</Td>
                    <Td>
                      <TableRowActions>
                        <button
                          onClick={e => {
                            e.stopPropagation();
                            deleteRoll.mutate(item.id);
                          }}
                          aria-label={`Delete roll with ${item.partner_name || 'open roll'}`}
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
          </div>

          {taps.length > 0 ? (
            <Card className="h-fit lg:col-span-4">
              <h2 className="mb-2 text-sm font-bold text-text-primary">What&apos;s catching you</h2>
              <div className="flex flex-col gap-1.5">
                {taps.map(tap => (
                  <div key={tap.name} className="flex justify-between text-sm">
                    <span className="text-text-secondary">{tap.name}</span>
                    <span className="font-mono font-bold tabular-nums text-danger">{tap.count}×</span>
                  </div>
                ))}
              </div>
            </Card>
          ) : null}
        </div>
      )}
    </div>
  );
}
