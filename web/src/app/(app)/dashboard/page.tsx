'use client';

import Link from 'next/link';
import { Flame, Plus } from 'lucide-react';
import { useDashboardStats } from '@/features/dashboard/hooks/useDashboardStats';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';

function StatCard({ label, value }: Readonly<{ label: string; value: string }>) {
  return (
    <Card className="flex flex-col items-center gap-1 py-5">
      <span className="font-mono text-2xl font-bold tabular-nums text-text-primary">{value}</span>
      <span className="text-center text-xs font-semibold uppercase tracking-wide text-text-secondary">{label}</span>
    </Card>
  );
}

function DashboardSkeleton() {
  return (
    <div className="flex w-full animate-pulse flex-col gap-5">
      <div className="flex items-center justify-between">
        <div className="h-8 w-40 rounded-lg bg-surface-alt" />
        <div className="h-11 w-36 rounded-xl bg-surface-alt" />
      </div>
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="h-20 rounded-2xl border border-border bg-surface-alt" />
        ))}
      </div>
      <div className="grid grid-cols-12 gap-5">
        <div className="col-span-5 h-40 rounded-2xl border border-border bg-surface-alt" />
        <div className="col-span-7 h-40 rounded-2xl border border-border bg-surface-alt" />
      </div>
    </div>
  );
}

export default function DashboardPage() {
  const stats = useDashboardStats();

  if (stats.loading) {
    return <DashboardSkeleton />;
  }

  return (
    <div className="flex w-full flex-col gap-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-2xl font-extrabold tracking-tight text-text-primary">Dashboard</h1>
        <Link href="/log/new">
          <Button className="flex items-center gap-2">
            <Plus size={16} strokeWidth={2.5} />
            Log Session
          </Button>
        </Link>
      </div>

      {stats.error ? <p className="text-sm text-danger">{stats.error}</p> : null}

      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <div className="flex flex-col items-center justify-center gap-1 rounded-2xl bg-accent py-5 shadow-md">
          <span className="flex items-center gap-1 font-mono text-2xl font-bold tabular-nums text-accent-text">
            {stats.currentStreak}
            <Flame size={18} className="text-accent-text" />
          </span>
          <span className="text-center text-xs font-semibold uppercase tracking-wide text-accent-text/80">
            streak
          </span>
        </div>
        <StatCard label="mat hours" value={String(stats.matHours)} />
        <StatCard label="classes / yr" value={String(stats.classesThisYear)} />
        <StatCard
          label="sub success"
          value={stats.subSuccessPct === null ? '--' : `${stats.subSuccessPct}%`}
        />
      </div>

      <div className="grid grid-cols-1 gap-5 lg:grid-cols-12">
        <Card className="lg:col-span-5">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-base font-bold text-text-primary">This week</h2>
            <span className="flex items-center gap-1 font-mono text-sm font-extrabold tabular-nums text-text-primary">
              {stats.currentStreak}
              <Flame size={16} className="text-accent" />
            </span>
          </div>
          <div className="flex justify-between">
            {stats.week.map(day => (
              <div key={day.key} className="flex flex-col items-center gap-2">
                <div
                  className={`h-8 w-8 rounded-full border transition ${
                    day.trained
                      ? 'border-accent bg-accent shadow-[0_0_0_4px_var(--color-accent-muted)]'
                      : 'border-border bg-surface-alt'
                  }`}
                />
                <span className="text-xs text-text-secondary">{day.label}</span>
              </div>
            ))}
          </div>
        </Card>

        <Card className="lg:col-span-7">
          <h2 className="mb-3 text-base font-bold text-text-primary">Recent activity</h2>
          {stats.recentActivity.length === 0 ? (
            <p className="text-sm text-text-secondary">
              No sessions logged yet — click &quot;Log Session&quot; to start.
            </p>
          ) : (
            <div className="flex flex-col divide-y divide-border">
              {stats.recentActivity.map(item => (
                <Link
                  key={item.id}
                  href={`/log/${item.id}`}
                  className="flex items-center justify-between py-2.5 transition first:pt-0 last:pb-0 hover:text-accent"
                >
                  <span className="text-sm text-text-primary">{item.text}</span>
                  <span className="text-xs text-text-secondary">{item.when}</span>
                </Link>
              ))}
            </div>
          )}
        </Card>
      </div>
    </div>
  );
}
