'use client';

import { useEffect, useState } from 'react';
import { useMe, useDeleteAccount } from '@/features/auth/hooks/useAuth';
import { useProfile, useUpdateProfile } from '@/features/profile/hooks/useProfile';
import { useLogMilestone } from '@/features/profile/hooks/useBeltPromotions';
import { useGyms } from '@/features/gyms/hooks/useGyms';
import { BELT_COLOR_VAR, BELT_OPTIONS, type Belt } from '@/features/profile/types';
import { toLocalDateString } from '@/lib/dateFormat';
import BeltHistorySection from '@/features/profile/components/BeltHistorySection';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import Chip from '@/components/ui/Chip';

const STRIPE_OPTIONS = [0, 1, 2, 3, 4];
const BACKEND_ORIGIN = process.env.NEXT_PUBLIC_BACKEND_ORIGIN ?? 'http://localhost:8080';

export default function ProfilePage() {
  const { data: me } = useMe();
  const { data: profile, isLoading } = useProfile();
  const { data: gyms = [] } = useGyms();
  const updateProfile = useUpdateProfile();
  const logMilestone = useLogMilestone();
  const deleteAccount = useDeleteAccount();

  const [displayName, setDisplayName] = useState('');
  const [belt, setBelt] = useState<Belt>('white');
  const [stripes, setStripes] = useState(0);
  const [homeGym, setHomeGym] = useState('');
  const [saving, setSaving] = useState(false);

  // Hydrates form state once, when the profile query first resolves --
  // unlike the log/techniques/rolls forms, there's no cached list query to
  // read synchronously from on mount, so this genuinely needs the fetch to
  // land first.
  /* eslint-disable react-hooks/set-state-in-effect */
  useEffect(() => {
    if (profile) {
      setDisplayName(profile.display_name ?? '');
      setBelt(profile.current_belt);
      setStripes(profile.current_stripes);
      setHomeGym(profile.home_gym ?? '');
    }
  }, [profile]);
  /* eslint-enable react-hooks/set-state-in-effect */

  const handleSave = async () => {
    const previousBelt = profile?.current_belt;
    const previousStripes = profile?.current_stripes ?? 0;

    setSaving(true);
    try {
      await updateProfile.mutateAsync({
        display_name: displayName || null,
        current_belt: belt,
        current_stripes: stripes,
        home_gym: homeGym || null,
      });
    } catch {
      // toast already shown by the mutation itself
      setSaving(false);
      return;
    }
    setSaving(false);

    const beltChanged = previousBelt !== undefined && previousBelt !== belt;
    const stripesGained = previousBelt === belt && stripes > previousStripes;

    if (beltChanged) {
      try {
        await logMilestone.mutateAsync({ belt, stripes: 0, promoted_on: toLocalDateString(new Date()) });
        const beltLabel = BELT_OPTIONS.find(o => o.value === belt)?.label ?? belt;
        alert(`Congratulations! You've been promoted to ${beltLabel} Belt! Huge milestone on your journey.`);
      } catch {
        alert("Saved, but logging this promotion to the timeline failed. You can add it from Belt History.");
      }
    } else if (stripesGained) {
      const beltLabel = BELT_OPTIONS.find(o => o.value === belt)?.label ?? belt;
      try {
        await logMilestone.mutateAsync({ belt, stripes });
        alert(`Nice progress! Stripe ${stripes} earned on your ${beltLabel} Belt.`);
      } catch {
        alert('Your stripe was saved, but logging it to the timeline failed. You can try again next time you save.');
      }
    }
  };

  const handleDeleteAccount = () => {
    if (
      confirm(
        'Delete your account? This permanently deletes your account and everything in it -- sessions, techniques, rolls, injuries, competitions, and gym memberships. This cannot be undone.',
      )
    ) {
      deleteAccount.mutate();
    }
  };

  if (isLoading && !profile) {
    return <p className="text-sm text-text-secondary">Loading…</p>;
  }

  return (
    <div className="flex w-full max-w-2xl flex-col gap-4">
      <h1 className="text-2xl font-extrabold tracking-tight text-text-primary">Profile</h1>
      {me?.email ? <p className="-mt-2 text-sm text-text-secondary">{me.email}</p> : null}

      <div>
        <label className="mb-1 block text-xs font-semibold text-text-secondary">Name</label>
        <Input value={displayName} onChange={e => setDisplayName(e.target.value)} placeholder="Your name" />
      </div>

      <div>
        <label className="mb-1 block text-xs font-semibold text-text-secondary">Belt</label>
        <div className="flex flex-wrap gap-2">
          {BELT_OPTIONS.map(option => (
            <Chip
              key={option.value}
              active={belt === option.value}
              activeColor={BELT_COLOR_VAR[option.value]}
              onClick={() => setBelt(option.value)}
            >
              {option.label}
            </Chip>
          ))}
        </div>
      </div>

      <div>
        <label className="mb-1 block text-xs font-semibold text-text-secondary">Stripes</label>
        <div className="flex flex-wrap gap-2">
          {STRIPE_OPTIONS.map(count => (
            <Chip key={count} active={stripes === count} onClick={() => setStripes(count)}>
              {count}
            </Chip>
          ))}
        </div>
      </div>

      <div>
        <label className="mb-1 block text-xs font-semibold text-text-secondary">Home gym</label>
        {gyms.length === 0 ? (
          <p className="text-xs text-text-secondary">Add a gym to pick it here as your home gym.</p>
        ) : (
          <div className="flex flex-wrap gap-2">
            <Chip active={homeGym === ''} onClick={() => setHomeGym('')}>
              None
            </Chip>
            {gyms.map(gym => (
              <Chip key={gym.id} active={homeGym === gym.name} onClick={() => setHomeGym(gym.name)}>
                {gym.name}
              </Chip>
            ))}
          </div>
        )}
      </div>

      <BeltHistorySection
        onPromotionAdded={addedBelt => {
          setBelt(addedBelt);
          setStripes(0);
        }}
      />

      <Button disabled={saving} onClick={handleSave} className="mt-2">
        {saving ? 'Saving…' : 'Save Changes'}
      </Button>

      <div className="mt-4 flex items-center justify-center gap-2 text-xs text-text-secondary">
        <a href={`${BACKEND_ORIGIN}/legal/privacy.html`} target="_blank" rel="noopener noreferrer" className="underline">
          Privacy Policy
        </a>
        <span>·</span>
        <a href={`${BACKEND_ORIGIN}/legal/terms.html`} target="_blank" rel="noopener noreferrer" className="underline">
          Terms of Service
        </a>
      </div>

      <button
        onClick={handleDeleteAccount}
        disabled={deleteAccount.isPending}
        className="mt-2 self-center p-2 text-xs font-semibold text-danger disabled:opacity-60"
      >
        {deleteAccount.isPending ? 'Deleting…' : 'Delete Account'}
      </button>
    </div>
  );
}
