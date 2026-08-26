'use client';

import Link from 'next/link';
import { BookOpen, PlayCircle, Plus, Repeat, Trash2 } from 'lucide-react';
import { useDeleteTechnique, useIncrementDrillCount, useTechniques } from '@/features/techniques/hooks/useTechniques';
import { POSITION_PRESETS } from '@/features/techniques/types';
import type { Technique } from '@/features/techniques/types';
import EmptyState from '@/components/EmptyState';
import Button from '@/components/ui/Button';

function groupByPosition(items: Technique[]) {
  const map = new Map<string, Technique[]>();
  for (const t of items) {
    const key = t.position || 'Uncategorized';
    const group = map.get(key) ?? [];
    group.push(t);
    map.set(key, group);
  }
  const keys = Array.from(map.keys()).sort((a, b) => {
    const ai = POSITION_PRESETS.indexOf(a);
    const bi = POSITION_PRESETS.indexOf(b);
    if (ai !== -1 && bi !== -1) return ai - bi;
    if (ai !== -1) return -1;
    if (bi !== -1) return 1;
    return a.localeCompare(b);
  });
  return keys.map(position => ({ position, techniques: map.get(position)! }));
}

export default function TechniquesPage() {
  const { data: items = [], isLoading } = useTechniques();
  const deleteTechnique = useDeleteTechnique();
  const incrementDrillCount = useIncrementDrillCount();

  const groups = groupByPosition(items);

  return (
    <div className="flex w-full max-w-5xl flex-col gap-5">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-extrabold text-text-primary">Technique Journal</h1>
        <Link href="/techniques/new">
          <Button className="flex items-center gap-2">
            <Plus size={16} strokeWidth={2.5} />
            Add Technique
          </Button>
        </Link>
      </div>

      {isLoading ? (
        <p className="text-sm text-text-secondary">Loading…</p>
      ) : items.length === 0 ? (
        <EmptyState
          icon={BookOpen}
          title="No techniques logged yet"
          description="Add a technique to start building your journal."
        />
      ) : (
        <div className="flex flex-col gap-4">
          {groups.map(group => (
            <div key={group.position}>
              <p className="mb-2 text-xs font-bold uppercase tracking-wide text-text-secondary">
                {group.position} ({group.techniques.length})
              </p>
              <div className="flex flex-col gap-2.5">
                {group.techniques.map(item => (
                  <div
                    key={item.id}
                    className="flex items-center justify-between rounded-2xl border border-border bg-surface p-4"
                  >
                    <Link href={`/techniques/${item.id}`} className="flex-1">
                      <p className="text-sm font-semibold text-text-primary">{item.name}</p>
                      <p className="text-xs text-text-secondary">{item.drill_count} drills logged</p>
                    </Link>
                    <div className="flex gap-2">
                      {item.resource_url ? (
                        <a
                          href={item.resource_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="rounded-lg border border-accent p-2 text-accent hover:bg-accent-muted"
                        >
                          <PlayCircle size={16} />
                        </a>
                      ) : null}
                      <button
                        onClick={() => incrementDrillCount.mutate(item.id)}
                        className="rounded-lg border border-accent p-2 text-accent hover:bg-accent-muted"
                      >
                        <Repeat size={16} />
                      </button>
                      <button
                        onClick={() => deleteTechnique.mutate(item.id)}
                        className="rounded-lg border border-danger p-2 text-danger hover:bg-danger/10"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
