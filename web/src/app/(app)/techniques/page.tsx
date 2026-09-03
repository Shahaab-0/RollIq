'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { BookOpen, PlayCircle, Plus, Repeat, Trash2 } from 'lucide-react';
import { useDeleteTechnique, useIncrementDrillCount, useTechniques } from '@/features/techniques/hooks/useTechniques';
import { POSITION_PRESETS } from '@/features/techniques/types';
import type { Technique } from '@/features/techniques/types';
import EmptyState from '@/components/EmptyState';
import Button from '@/components/ui/Button';
import { Table, Thead, Tbody, Tr, Th, Td, TableRowActions } from '@/components/ui/Table';

function sortByPosition(items: Technique[]): Technique[] {
  return [...items].sort((a, b) => {
    const ai = POSITION_PRESETS.indexOf(a.position);
    const bi = POSITION_PRESETS.indexOf(b.position);
    if (ai !== -1 && bi !== -1) return ai - bi || a.name.localeCompare(b.name);
    if (ai !== -1) return -1;
    if (bi !== -1) return 1;
    return a.position.localeCompare(b.position) || a.name.localeCompare(b.name);
  });
}

function TechniquesSkeleton() {
  return (
    <div className="flex w-full animate-pulse flex-col gap-5">
      <div className="flex items-center justify-between">
        <div className="h-8 w-56 rounded-lg bg-surface-alt" />
        <div className="h-11 w-40 rounded-xl bg-surface-alt" />
      </div>
      <div className="overflow-hidden rounded-2xl border border-border">
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className="h-12 border-b border-border bg-surface-alt last:border-0" />
        ))}
      </div>
    </div>
  );
}

export default function TechniquesPage() {
  const router = useRouter();
  const { data: items = [], isLoading } = useTechniques();
  const deleteTechnique = useDeleteTechnique();
  const incrementDrillCount = useIncrementDrillCount();

  const sorted = sortByPosition(items);

  if (isLoading) {
    return <TechniquesSkeleton />;
  }

  return (
    <div className="flex w-full flex-col gap-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-2xl font-extrabold tracking-tight text-text-primary">Technique Journal</h1>
        <Link href="/techniques/new">
          <Button className="flex items-center gap-2">
            <Plus size={16} strokeWidth={2.5} />
            Add Technique
          </Button>
        </Link>
      </div>

      {items.length === 0 ? (
        <EmptyState
          icon={BookOpen}
          title="No techniques logged yet"
          description="Add a technique to start building your journal."
        />
      ) : (
        <Table>
          <Thead>
            <Tr>
              <Th>Name</Th>
              <Th>Position</Th>
              <Th>Drills</Th>
              <Th aria-hidden />
            </Tr>
          </Thead>
          <Tbody>
            {sorted.map(item => (
              <Tr key={item.id} onClick={() => router.push(`/techniques/${item.id}`)}>
                <Td className="font-semibold">{item.name}</Td>
                <Td className="text-text-secondary">{item.position}</Td>
                <Td className="font-mono text-text-secondary tabular-nums">{item.drill_count}</Td>
                <Td>
                  <TableRowActions>
                    {item.resource_url ? (
                      <a
                        href={item.resource_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        onClick={e => e.stopPropagation()}
                        aria-label={`Open resource for ${item.name}`}
                        className="rounded-lg border border-accent p-1.5 text-accent hover:bg-accent-muted"
                      >
                        <PlayCircle size={15} />
                      </a>
                    ) : null}
                    <button
                      onClick={e => {
                        e.stopPropagation();
                        incrementDrillCount.mutate(item.id);
                      }}
                      aria-label={`Log a drill for ${item.name}`}
                      className="rounded-lg border border-accent p-1.5 text-accent hover:bg-accent-muted"
                    >
                      <Repeat size={15} />
                    </button>
                    <button
                      onClick={e => {
                        e.stopPropagation();
                        deleteTechnique.mutate(item.id);
                      }}
                      aria-label={`Delete ${item.name}`}
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
