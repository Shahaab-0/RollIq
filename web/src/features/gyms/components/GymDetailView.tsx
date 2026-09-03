'use client';

import Link from 'next/link';
import { ChevronRight, Plus, Users } from 'lucide-react';
import { formatDisplayDate } from '@/lib/dateFormat';
import { useGym, useGymClasses } from '../hooks/useGyms';
import GymScheduleCard from './GymScheduleCard';
import Button from '@/components/ui/Button';

export default function GymDetailView({ gymId }: Readonly<{ gymId: string }>) {
  const { data: gym, isLoading } = useGym(gymId);
  const { data: classes = [], isLoading: classesLoading } = useGymClasses(gymId);

  const canPost = gym?.my_role === 'owner' || gym?.my_role === 'trainer';

  if (isLoading && !gym) {
    return <p className="text-sm text-text-secondary">Loading…</p>;
  }

  return (
    <div className="flex w-full max-w-5xl flex-col gap-5">
      <h1 className="text-2xl font-extrabold tracking-tight text-text-primary">{gym?.name ?? 'Gym'}</h1>
      {gym?.description ? <p className="-mt-3 text-sm text-text-secondary">{gym.description}</p> : null}

      <Link
        href={`/gyms/${gymId}/members`}
        className="flex items-center gap-2 rounded-xl border border-border bg-surface px-3.5 py-2.5"
      >
        <Users size={16} className="text-text-secondary" />
        <span className="flex-1 text-sm font-semibold text-text-primary">
          {gym?.member_count ?? 0} member{gym?.member_count === 1 ? '' : 's'}
        </span>
        <ChevronRight size={16} className="text-text-secondary" />
      </Link>

      {gym ? (
        <div className="rounded-xl bg-accent-muted p-3.5">
          <p className="text-[11px] font-semibold uppercase tracking-wide text-text-secondary">Invite code</p>
          <p className="text-xl font-extrabold tracking-widest text-accent">{gym.invite_code}</p>
          <p className="mt-1 text-xs text-text-secondary">Share this code so teammates can join.</p>
        </div>
      ) : null}

      <GymScheduleCard gymId={gymId} canManage={canPost} />

      <div className="flex items-center justify-between">
        <h2 className="text-base font-bold text-text-primary">Class recaps</h2>
        {canPost ? (
          <Link href={`/gyms/${gymId}/classes/new`}>
            <Button className="flex items-center gap-2">
              <Plus size={16} strokeWidth={2.5} />
              Post a Class
            </Button>
          </Link>
        ) : null}
      </div>

      {classesLoading ? (
        <p className="text-sm text-text-secondary">Loading…</p>
      ) : classes.length === 0 ? (
        <p className="text-sm text-text-secondary">
          {canPost ? 'No classes posted yet — post your first recap.' : 'No classes posted yet.'}
        </p>
      ) : (
        <div className="flex flex-col gap-2.5">
          {classes.map(entry => (
            <Link
              key={entry.id}
              href={`/gyms/${gymId}/classes/${entry.id}`}
              className="flex items-center justify-between rounded-2xl border border-border bg-surface p-4"
            >
              <div>
                <p className="text-sm font-semibold text-text-primary">{entry.title}</p>
                <p className="text-xs text-text-secondary">
                  {formatDisplayDate(entry.class_date)} · {entry.video_count} video{entry.video_count === 1 ? '' : 's'}
                </p>
              </div>
              <ChevronRight size={18} className="text-text-secondary" />
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
