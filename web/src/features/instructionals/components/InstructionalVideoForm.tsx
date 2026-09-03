'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useCreateVideo, useInstructionalVideos } from '../hooks/useInstructionals';
import Button from '@/components/ui/Button';
import Card from '@/components/ui/Card';
import Input from '@/components/ui/Input';

export default function InstructionalVideoForm({ instructionalId }: Readonly<{ instructionalId: string }>) {
  const router = useRouter();
  const { data: existingVideos = [] } = useInstructionalVideos(instructionalId);
  const createVideo = useCreateVideo(instructionalId);

  const [title, setTitle] = useState('');
  const [url, setUrl] = useState('');
  const [durationMinutes, setDurationMinutes] = useState('');
  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    if (!title.trim()) return;
    setSaving(true);
    try {
      await createVideo.mutateAsync({
        title: title.trim(),
        sequence_number: existingVideos.length + 1,
        url: url.trim() || null,
        duration_minutes: durationMinutes ? parseInt(durationMinutes, 10) : null,
      });
      router.push('/instructionals');
    } catch {
      // toast already shown by the mutation itself
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="flex w-full max-w-2xl flex-col gap-5">
      <h1 className="text-2xl font-extrabold tracking-tight text-text-primary">Add Video</h1>

      <Card className="flex flex-col gap-4">
        <div>
          <label className="mb-1 block text-xs font-semibold text-text-secondary">Title</label>
          <Input value={title} onChange={e => setTitle(e.target.value)} placeholder={`e.g. Volume ${existingVideos.length + 1}`} />
        </div>

        <div>
          <label className="mb-1 block text-xs font-semibold text-text-secondary">Link</label>
          <Input value={url} onChange={e => setUrl(e.target.value)} placeholder="Optional" />
        </div>

        <div>
          <label className="mb-1 block text-xs font-semibold text-text-secondary">Duration (minutes)</label>
          <Input type="number" value={durationMinutes} onChange={e => setDurationMinutes(e.target.value)} placeholder="Optional" />
        </div>
      </Card>

      <Button disabled={saving || !title.trim()} onClick={handleSave}>
        {saving ? 'Saving…' : 'Add Video'}
      </Button>
    </div>
  );
}
