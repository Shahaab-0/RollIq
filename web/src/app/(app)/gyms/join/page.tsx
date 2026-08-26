'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useJoinGym } from '@/features/gyms/hooks/useGyms';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';

export default function JoinGymPage() {
  const router = useRouter();
  const joinGym = useJoinGym();

  const [inviteCode, setInviteCode] = useState('');
  const [joining, setJoining] = useState(false);

  const handleJoin = async () => {
    if (!inviteCode.trim()) return;
    setJoining(true);
    try {
      const gym = await joinGym.mutateAsync(inviteCode.trim());
      router.push(`/gyms/${gym.id}`);
    } catch {
      // toast already shown by the mutation itself
    } finally {
      setJoining(false);
    }
  };

  return (
    <div className="flex w-full max-w-2xl flex-col gap-4">
      <h1 className="text-2xl font-extrabold text-text-primary">Join a Gym</h1>

      <div>
        <label className="mb-1 block text-xs font-semibold text-text-secondary">Invite code</label>
        <Input
          value={inviteCode}
          onChange={e => setInviteCode(e.target.value.toUpperCase())}
          placeholder="e.g. 7K3PQXM9"
        />
      </div>

      <Button disabled={joining || !inviteCode.trim()} onClick={handleJoin} className="mt-2">
        {joining ? 'Joining…' : 'Join Gym'}
      </Button>
    </div>
  );
}
