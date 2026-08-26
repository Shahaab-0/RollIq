'use client';

import Link from 'next/link';
import { Dumbbell, Plus } from 'lucide-react';
import { useGyms } from '@/features/gyms/hooks/useGyms';
import EmptyState from '@/components/EmptyState';
import Button from '@/components/ui/Button';

export default function GymsPage() {
  const { data: gyms = [], isLoading } = useGyms();

  return (
    <div className="flex w-full max-w-5xl flex-col gap-5">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-extrabold text-text-primary">Gyms</h1>
        <div className="flex gap-2">
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

      {isLoading ? (
        <p className="text-sm text-text-secondary">Loading…</p>
      ) : gyms.length === 0 ? (
        <EmptyState
          icon={Dumbbell}
          title="No gyms yet"
          description="Create a gym for your team, or join one with an invite code from your coach or a teammate."
        />
      ) : (
        <div className="flex flex-col gap-2.5">
          {gyms.map(gym => (
            <Link
              key={gym.id}
              href={`/gyms/${gym.id}`}
              className="flex items-center justify-between rounded-2xl border border-border bg-surface p-4"
            >
              <div>
                <p className="text-sm font-semibold text-text-primary">{gym.name}</p>
                {gym.description ? (
                  <p className="mt-0.5 line-clamp-2 text-xs text-text-secondary">{gym.description}</p>
                ) : null}
                <p className="mt-0.5 text-xs text-text-secondary">
                  {gym.member_count} member{gym.member_count === 1 ? '' : 's'} · {gym.class_count} class
                  {gym.class_count === 1 ? '' : 'es'}
                </p>
              </div>
              <span className="rounded-lg bg-accent-muted px-2 py-1 text-xs font-semibold capitalize text-accent">
                {gym.my_role}
              </span>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
