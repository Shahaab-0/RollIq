'use client';

import { formatDisplayDate } from '@/lib/dateFormat';
import { useGym, useGymMembers, usePromoteMember } from '../hooks/useGyms';

export default function GymMembersView({ gymId }: Readonly<{ gymId: string }>) {
  const { data: gym } = useGym(gymId);
  const { data: members = [], isLoading } = useGymMembers(gymId);
  const promoteMember = usePromoteMember(gymId);

  const isOwner = gym?.my_role === 'owner';

  return (
    <div className="flex w-full max-w-3xl flex-col gap-5">
      <h1 className="text-2xl font-extrabold tracking-tight text-text-primary">Members</h1>

      {isLoading ? (
        <p className="text-sm text-text-secondary">Loading…</p>
      ) : (
        <div className="flex flex-col gap-2.5">
          {members.map(member => (
            <div
              key={member.user_id}
              className="flex items-center gap-3 rounded-2xl border border-border bg-surface p-3.5"
            >
              <div className="flex-1">
                <p className="text-sm font-semibold text-text-primary">{member.display_name}</p>
                <p className="text-xs text-text-secondary">Joined {formatDisplayDate(member.joined_at.slice(0, 10))}</p>
              </div>
              <span className="rounded-lg bg-accent-muted px-2 py-1 text-xs font-semibold capitalize text-accent">
                {member.role}
              </span>
              {isOwner && member.role !== 'owner' ? (
                <button
                  onClick={() =>
                    promoteMember.mutate({
                      userId: member.user_id,
                      role: member.role === 'trainer' ? 'member' : 'trainer',
                    })
                  }
                  className="rounded-lg border border-accent px-2.5 py-1.5 text-xs font-semibold text-accent hover:bg-accent-muted"
                >
                  {member.role === 'trainer' ? 'Demote' : 'Promote'}
                </button>
              ) : null}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
