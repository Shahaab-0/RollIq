'use client';

import { useMemo, useState } from 'react';
import Link from 'next/link';
import { Plus } from 'lucide-react';
import { useInstructionals } from '@/features/instructionals/hooks/useInstructionals';
import { DIFFICULTY_OPTIONS, type Difficulty, type Instructional } from '@/features/instructionals/types';
import InstructionalCard from '@/features/instructionals/components/InstructionalCard';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';

type OverallStatus = 'not_started' | 'in_progress' | 'completed';

const STATUS_LABELS: Record<OverallStatus, string> = {
  not_started: 'Not Started',
  in_progress: 'In Progress',
  completed: 'Completed',
};

function overallStatus(item: Instructional): OverallStatus {
  if (item.video_count > 0 && item.completed_video_count === item.video_count) return 'completed';
  if (item.completed_video_count > 0 || item.in_progress_video_count > 0) return 'in_progress';
  return 'not_started';
}

export default function InstructionalsPage() {
  const { data: items = [], isLoading } = useInstructionals();

  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('');
  const [instructor, setInstructor] = useState('');
  const [status, setStatus] = useState<OverallStatus | ''>('');
  const [difficulty, setDifficulty] = useState<Difficulty | ''>('');

  const categories = useMemo(() => Array.from(new Set(items.map(i => i.category))).sort(), [items]);
  const instructors = useMemo(() => Array.from(new Set(items.map(i => i.instructor))).sort(), [items]);

  const filtered = useMemo(() => {
    const query = search.trim().toLowerCase();
    return items.filter(item => {
      if (category && item.category !== category) return false;
      if (instructor && item.instructor !== instructor) return false;
      if (status && overallStatus(item) !== status) return false;
      if (difficulty && item.difficulty !== difficulty) return false;
      if (query && !item.title.toLowerCase().includes(query) && !item.instructor.toLowerCase().includes(query)) return false;
      return true;
    });
  }, [items, search, category, instructor, status, difficulty]);

  const selectClass =
    'rounded-xl border border-border bg-surface px-3 py-2 text-sm text-text-primary transition focus:border-accent focus:outline-none focus:ring-2 focus:ring-accent/20';

  if (isLoading) {
    return (
      <div className="flex w-full animate-pulse flex-col gap-5">
        <div className="flex items-center justify-between">
          <div className="h-8 w-44 rounded-lg bg-surface-alt" />
          <div className="h-11 w-44 rounded-xl bg-surface-alt" />
        </div>
        <div className="grid grid-cols-1 items-start gap-4 xl:grid-cols-2">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="h-20 rounded-2xl border border-border bg-surface-alt" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="flex w-full flex-col gap-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-2xl font-extrabold tracking-tight text-text-primary">Instructionals</h1>
        <Link href="/instructionals/new">
          <Button className="flex items-center gap-2">
            <Plus size={16} strokeWidth={2.5} />
            Add Instructional
          </Button>
        </Link>
      </div>

      <div className="flex flex-wrap items-center gap-2">
        <Input
          value={search}
          onChange={e => setSearch(e.target.value)}
          placeholder="Search by title or instructor"
          className="max-w-xs"
        />
        <select className={selectClass} value={category} onChange={e => setCategory(e.target.value)}>
          <option value="">All categories</option>
          {categories.map(c => (
            <option key={c} value={c}>
              {c}
            </option>
          ))}
        </select>
        <select className={selectClass} value={instructor} onChange={e => setInstructor(e.target.value)}>
          <option value="">All instructors</option>
          {instructors.map(i => (
            <option key={i} value={i}>
              {i}
            </option>
          ))}
        </select>
        <select className={selectClass} value={status} onChange={e => setStatus(e.target.value as OverallStatus | '')}>
          <option value="">All statuses</option>
          {(Object.keys(STATUS_LABELS) as OverallStatus[]).map(s => (
            <option key={s} value={s}>
              {STATUS_LABELS[s]}
            </option>
          ))}
        </select>
        <select className={selectClass} value={difficulty} onChange={e => setDifficulty(e.target.value as Difficulty | '')}>
          <option value="">All difficulties</option>
          {DIFFICULTY_OPTIONS.map(d => (
            <option key={d.value} value={d.value}>
              {d.label}
            </option>
          ))}
        </select>
        {category || instructor || status || difficulty || search ? (
          <button
            onClick={() => {
              setSearch('');
              setCategory('');
              setInstructor('');
              setStatus('');
              setDifficulty('');
            }}
            className="text-xs font-semibold text-accent"
          >
            Clear filters
          </button>
        ) : null}
      </div>

      {filtered.length === 0 ? (
        <p className="text-sm text-text-secondary">No instructionals match your filters.</p>
      ) : (
        <div className="grid grid-cols-1 items-start gap-4 xl:grid-cols-2">
          {filtered.map(item => (
            <InstructionalCard key={item.id} instructional={item} />
          ))}
        </div>
      )}
    </div>
  );
}
