'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useCreateGymClass } from '../hooks/useGyms';
import { toLocalDateString } from '@/lib/dateFormat';
import Button from '@/components/ui/Button';
import Card from '@/components/ui/Card';
import Input from '@/components/ui/Input';
import Textarea from '@/components/ui/Textarea';

export default function GymClassForm({ gymId }: Readonly<{ gymId: string }>) {
  const router = useRouter();
  const createClass = useCreateGymClass(gymId);

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [classDate, setClassDate] = useState(toLocalDateString(new Date()));
  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    if (!title.trim()) return;
    setSaving(true);
    try {
      const entry = await createClass.mutateAsync({
        title: title.trim(),
        description: description.trim() || null,
        class_date: classDate,
      });
      router.push(`/gyms/${gymId}/classes/${entry.id}`);
    } catch {
      // toast already shown by the mutation itself
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="flex w-full max-w-2xl flex-col gap-5">
      <h1 className="text-2xl font-extrabold tracking-tight text-text-primary">Post a Class</h1>

      <Card className="flex flex-col gap-4">
        <div>
          <label className="mb-1 block text-xs font-semibold text-text-secondary">Title</label>
          <Input value={title} onChange={e => setTitle(e.target.value)} placeholder="e.g. No-Gi Fundamentals" />
        </div>

        <div>
          <label className="mb-1 block text-xs font-semibold text-text-secondary">Date</label>
          <Input type="date" max={toLocalDateString(new Date())} value={classDate} onChange={e => setClassDate(e.target.value)} />
        </div>

        <div>
          <label className="mb-1 block text-xs font-semibold text-text-secondary">Description</label>
          <Textarea rows={4} value={description} onChange={e => setDescription(e.target.value)} placeholder="What did the class cover?" />
        </div>
      </Card>

      <Button disabled={saving || !title.trim()} onClick={handleSave}>
        {saving ? 'Posting…' : 'Post Class'}
      </Button>
    </div>
  );
}
