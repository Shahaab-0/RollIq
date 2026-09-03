'use client';

import Link from 'next/link';
import { Check, Plus } from 'lucide-react';
import { formatDisplayDate } from '@/lib/dateFormat';
import {
  useDeleteGymClassVideo,
  useGym,
  useGymAttendance,
  useGymClassVideos,
  useGymClasses,
  useMarkAttendance,
  useUnmarkAttendance,
} from '../hooks/useGyms';
import GymClassVideoRow from './GymClassVideoRow';
import type { GymAttendee } from '../types';
import Button from '@/components/ui/Button';

function GymClassDetailSkeleton() {
  return (
    <div className="flex w-full animate-pulse flex-col gap-5">
      <div className="flex items-center justify-between">
        <div className="h-8 w-56 rounded-lg bg-surface-alt" />
        <div className="h-11 w-32 rounded-xl bg-surface-alt" />
      </div>
      <div className="flex flex-col gap-2.5">
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="h-16 rounded-2xl border border-border bg-surface-alt" />
        ))}
      </div>
    </div>
  );
}

export default function GymClassDetailView({ gymId, classId }: Readonly<{ gymId: string; classId: string }>) {
  const { data: gym } = useGym(gymId);
  const { data: classes = [] } = useGymClasses(gymId);
  const { data: videos = [], isLoading } = useGymClassVideos(gymId, classId);
  const deleteVideo = useDeleteGymClassVideo(gymId, classId);

  const entry = classes.find(c => c.id === classId);
  const canManage = gym?.my_role === 'owner' || gym?.my_role === 'trainer';

  const { data: attendance = [] } = useGymAttendance(gymId, canManage ? classId : undefined);
  const markAttendance = useMarkAttendance(gymId, classId);
  const unmarkAttendance = useUnmarkAttendance(gymId, classId);

  const toggleAttendee = (attendee: GymAttendee) => {
    if (attendee.present) {
      unmarkAttendance.mutate(attendee.user_id);
    } else {
      markAttendance.mutate(attendee.user_id);
    }
  };

  if (isLoading) {
    return <GymClassDetailSkeleton />;
  }

  return (
    <div className="flex w-full flex-col gap-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-extrabold tracking-tight text-text-primary">{entry?.title ?? 'Class'}</h1>
          {entry ? <p className="text-sm text-text-secondary">{formatDisplayDate(entry.class_date)}</p> : null}
        </div>
        {canManage ? (
          <Link href={`/gyms/${gymId}/classes/${classId}/videos/new`}>
            <Button className="flex items-center gap-2">
              <Plus size={16} strokeWidth={2.5} />
              Add Video
            </Button>
          </Link>
        ) : null}
      </div>
      {entry?.description ? <p className="-mt-3 text-sm text-text-primary">{entry.description}</p> : null}

      {videos.length === 0 ? (
        <p className="text-sm text-text-secondary">
          {canManage ? 'No videos yet — add one.' : "This class doesn't have any videos yet."}
        </p>
      ) : (
        <div className="flex flex-col gap-2.5">
          {videos.map(video => (
            <GymClassVideoRow key={video.id} video={video} canManage={canManage} onDelete={() => deleteVideo.mutate(video.id)} />
          ))}
        </div>
      )}

      {canManage ? (
        <div className="mt-2 flex flex-col gap-2.5">
          <h2 className="text-base font-bold text-text-primary">Attendance</h2>
          {attendance.length === 0 ? (
            <p className="text-sm text-text-secondary">No members to mark yet.</p>
          ) : (
            attendance.map(attendee => (
              <button
                key={attendee.user_id}
                onClick={() => toggleAttendee(attendee)}
                className="flex items-center justify-between rounded-xl border border-border bg-surface px-3.5 py-3 shadow-sm transition hover:border-accent"
              >
                <span className="text-sm font-semibold text-text-primary">{attendee.display_name}</span>
                <span
                  className={`flex h-6 w-6 items-center justify-center rounded-full border-2 ${
                    attendee.present ? 'border-accent bg-accent' : 'border-accent bg-accent-muted'
                  }`}
                >
                  {attendee.present ? <Check size={16} className="text-accent-text" /> : null}
                </span>
              </button>
            ))
          )}
        </div>
      ) : null}
    </div>
  );
}
