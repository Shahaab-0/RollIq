'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useCreateGymClassVideo, useGymClassVideos } from '../hooks/useGyms';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import TagInput from '@/components/ui/TagInput';

export default function GymClassVideoForm({ gymId, classId }: Readonly<{ gymId: string; classId: string }>) {
  const router = useRouter();
  const { data: existingVideos = [] } = useGymClassVideos(gymId, classId);
  const createVideo = useCreateGymClassVideo(gymId, classId);

  const [url, setUrl] = useState('');
  const [techniques, setTechniques] = useState<string[]>([]);
  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    setSaving(true);
    try {
      await createVideo.mutateAsync({
        url: url.trim() || null,
        techniques,
        sequence_number: existingVideos.length + 1,
      });
      router.push(`/gyms/${gymId}/classes/${classId}`);
    } catch {
      // toast already shown by the mutation itself
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="flex w-full max-w-2xl flex-col gap-4">
      <h1 className="text-2xl font-extrabold tracking-tight text-text-primary">Add Video</h1>

      <div>
        <label className="mb-1 block text-xs font-semibold text-text-secondary">Link</label>
        <Input value={url} onChange={e => setUrl(e.target.value)} placeholder="Optional" />
      </div>

      <div>
        <label className="mb-1 block text-xs font-semibold text-text-secondary">Techniques shown in this video</label>
        <TagInput values={techniques} onChange={setTechniques} placeholder="e.g. Ashi Garami, then hit enter" />
      </div>

      <Button disabled={saving} onClick={handleSave} className="mt-2">
        {saving ? 'Saving…' : 'Add Video'}
      </Button>
    </div>
  );
}
