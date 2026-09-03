'use client';

import Link from 'next/link';
import { Dumbbell, Plus, Users } from 'lucide-react';
import { useGyms } from '@/features/gyms/hooks/useGyms';
import EmptyState from '@/components/EmptyState';
import Button from '@/components/ui/Button';
import Card from '@/components/ui/Card';

function GymsSkeleton() {
  return (
    <div className="flex w-full animate-pulse flex-col gap-5">
      <div className="flex items-center justify-between">
        <div className="h-8 w-24 rounded-lg bg-surface-alt" />
        <div className="flex gap-2">
          <div className="h-11 w-32 rounded-xl bg-surface-alt" />
          <div className="h-11 w-36 rounded-xl bg-surface-alt" />
        </div>
      </div>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="h-28 rounded-2xl border border-border bg-surface-alt" />
        ))}
      </div>
    </div>
  );
}

export default function GymsPage() {
  const { data: gyms = [], isLoading } = useGyms();

  if (isLoading) {
    return <GymsSkeleton />;
  }

  return (
    <div className="flex w-full flex-col gap-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-2xl font-extrabold tracking-tight text-text-primary">Gyms</h1>
        <div className="flex flex-wrap gap-2">
          <Link href="/gyms/join">
            <Button variant="secondary">Join with Code</Button>
          </Link>
          <Link href="/gyms/new">
            <Button className="flex items-center gap-2">
              <Plus size={16} strokeWidth={2.5} />
              Create a Gym
            </Button>
          </Link>
        </div>
      </div>

      {gyms.length === 0 ? (
        <EmptyState
          icon={Dumbbell}
          title="No gyms yet"
          description="Create a gym for your team, or join one with an invite code from your coach or a teammate."
        />
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {gyms.map(gym => (
            <Link key={gym.id} href={`/gyms/${gym.id}`}>
              <Card className="flex h-full flex-col gap-2 transition hover:border-accent hover:shadow-md">
                <div className="flex items-start justify-between gap-2">
                  <p className="text-sm font-semibold text-text-primary">{gym.name}</p>
                  <span className="shrink-0 rounded-lg bg-accent-muted px-2 py-1 text-xs font-semibold capitalize text-accent">
                    {gym.my_role}
                  </span>
                </div>
                {gym.description ? <p className="line-clamp-2 text-xs text-text-secondary">{gym.description}</p> : null}
                <div className="mt-auto flex items-center gap-1.5 pt-2 text-xs text-text-secondary">
                  <Users size={13} />
                  {gym.member_count} member{gym.member_count === 1 ? '' : 's'} · {gym.class_count} class
                  {gym.class_count === 1 ? '' : 'es'}
                </div>
              </Card>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
