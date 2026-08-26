'use client';

import Link from 'next/link';
import { Plus } from 'lucide-react';
import { useDashboardStats } from '@/features/dashboard/hooks/useDashboardStats';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';

function StatCard({ label, value }: Readonly<{ label: string; value: string }>) {
  return (
    <Card className="flex flex-1 flex-col items-center gap-1 py-4">
      <span className="text-xl font-bold text-text-primary">{value}</span>
      <span className="text-center text-xs text-text-secondary">{label}</span>
    </Card>
  );
}

export default function DashboardPage() {
  const stats = useDashboardStats();

  if (stats.loading) {
    return <div className="text-sm text-text-secondary">Loading…</div>;
  }

  return (
    <div className="flex w-full max-w-5xl flex-col gap-5">
      <h1 className="text-2xl font-extrabold text-text-primary">Dashboard</h1>

      {stats.error ? <p className="text-sm text-danger">{stats.error}</p> : null}

      <Card>
        <div className="mb-3 flex items-center justify-between">
          <h2 className="text-base font-bold text-text-primary">This week</h2>
          <span className="text-lg font-extrabold text-text-primary">{stats.currentStreak} 🔥</span>
        </div>
        <div className="flex justify-between">
          {stats.week.map(day => (
            <div key={day.key} className="flex flex-col items-center gap-2">
              <div
                className={`h-7 w-7 rounded-full border ${
                  day.trained ? 'border-accent bg-accent' : 'border-border bg-surface-alt'
                }`}
              />
              <span className="text-xs text-text-secondary">{day.label}</span>
            </div>
          ))}
        </div>
      </Card>

      <div className="flex gap-3">
        <Link href="/log/new" className="flex-1">
          <Button className="flex w-full items-center justify-center gap-2">
            <Plus size={18} strokeWidth={2.5} />
            Log Session
          </Button>
        </Link>
      </div>

      <div className="flex gap-3">
        <StatCard label="mat hours" value={String(stats.matHours)} />
        <StatCard label="classes / yr" value={String(stats.classesThisYear)} />
        <StatCard
          label="sub success"
          value={stats.subSuccessPct === null ? '--' : `${stats.subSuccessPct}%`}
        />
      </div>

      <Card>
        <h2 className="mb-3 text-base font-bold text-text-primary">Recent activity</h2>
        {stats.recentActivity.length === 0 ? (
          <p className="text-sm text-text-secondary">
            No sessions logged yet — tap &quot;+ Log Session&quot; to start.
          </p>
        ) : (
          <div className="flex flex-col divide-y divide-border">
            {stats.recentActivity.map(item => (
              <Link
                key={item.id}
                href={`/log/${item.id}`}
                className="flex items-center justify-between py-2.5 first:pt-0 last:pb-0 hover:text-accent"
              >
                <span className="text-sm text-text-primary">{item.text}</span>
                <span className="text-xs text-text-secondary">{item.when}</span>
              </Link>
            ))}
          </div>
        )}
      </Card>
    </div>
  );
}
