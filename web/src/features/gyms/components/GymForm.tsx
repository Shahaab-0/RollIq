'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useCreateGym } from '../hooks/useGyms';
import Button from '@/components/ui/Button';
import Card from '@/components/ui/Card';
import Input from '@/components/ui/Input';
import Textarea from '@/components/ui/Textarea';

export default function GymForm() {
  const router = useRouter();
  const createGym = useCreateGym();

  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    if (!name.trim()) return;
    setSaving(true);
    try {
      const gym = await createGym.mutateAsync({ name: name.trim(), description: description.trim() || null });
      router.push(`/gyms/${gym.id}`);
    } catch {
      // toast already shown by the mutation itself
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="flex w-full max-w-2xl flex-col gap-5">
      <h1 className="text-2xl font-extrabold tracking-tight text-text-primary">New Gym</h1>

      <Card className="flex flex-col gap-4">
        <div>
          <label className="mb-1 block text-xs font-semibold text-text-secondary">Name</label>
          <Input value={name} onChange={e => setName(e.target.value)} placeholder="e.g. Downtown BJJ" />
        </div>

        <div>
          <label className="mb-1 block text-xs font-semibold text-text-secondary">Description</label>
          <Textarea rows={4} value={description} onChange={e => setDescription(e.target.value)} placeholder="Optional" />
        </div>
      </Card>

      <Button disabled={saving || !name.trim()} onClick={handleSave}>
        {saving ? 'Creating…' : 'Create Gym'}
      </Button>
    </div>
  );
}
