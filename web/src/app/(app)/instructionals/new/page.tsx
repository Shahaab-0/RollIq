'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useCreateInstructional } from '@/features/instructionals/hooks/useInstructionals';
import { CATEGORY_PRESETS, DIFFICULTY_OPTIONS, type Difficulty } from '@/features/instructionals/types';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import Textarea from '@/components/ui/Textarea';
import Chip from '@/components/ui/Chip';

export default function NewInstructionalPage() {
  const router = useRouter();
  const createInstructional = useCreateInstructional();

  const [title, setTitle] = useState('');
  const [instructor, setInstructor] = useState('');
  const [category, setCategory] = useState('');
  const [difficulty, setDifficulty] = useState<Difficulty | null>(null);
  const [platform, setPlatform] = useState('');
  const [url, setUrl] = useState('');
  const [description, setDescription] = useState('');
  const [releaseYear, setReleaseYear] = useState('');
  const [saving, setSaving] = useState(false);

  const canSave = title.trim() && instructor.trim() && category.trim() && difficulty;

  const handleSave = async () => {
    if (!canSave || !difficulty) return;
    setSaving(true);
    try {
      await createInstructional.mutateAsync({
        title: title.trim(),
        instructor: instructor.trim(),
        category: category.trim(),
        difficulty,
        platform: platform.trim() || null,
        url: url.trim() || null,
        description: description.trim() || null,
        release_year: releaseYear ? parseInt(releaseYear, 10) : null,
      });
      router.push('/instructionals');
    } catch {
      // toast already shown by the mutation itself
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="flex w-full max-w-2xl flex-col gap-4">
      <h1 className="text-2xl font-extrabold text-text-primary">New Instructional</h1>

      <div>
        <label className="mb-1 block text-xs font-semibold text-text-secondary">Title</label>
        <Input value={title} onChange={e => setTitle(e.target.value)} placeholder="e.g. Enter the System" />
      </div>

      <div>
        <label className="mb-1 block text-xs font-semibold text-text-secondary">Instructor</label>
        <Input value={instructor} onChange={e => setInstructor(e.target.value)} placeholder="e.g. John Danaher" />
      </div>

      <div>
        <label className="mb-1 block text-xs font-semibold text-text-secondary">Category</label>
        <div className="mb-2 flex flex-wrap gap-2">
          {CATEGORY_PRESETS.map(preset => (
            <Chip key={preset} active={category === preset} onClick={() => setCategory(preset)}>
              {preset}
            </Chip>
          ))}
        </div>
        <Input value={category} onChange={e => setCategory(e.target.value)} placeholder="Or type your own" />
      </div>

      <div>
        <label className="mb-1 block text-xs font-semibold text-text-secondary">Difficulty</label>
        <div className="flex flex-wrap gap-2">
          {DIFFICULTY_OPTIONS.map(option => (
            <Chip key={option.value} active={difficulty === option.value} onClick={() => setDifficulty(option.value)}>
              {option.label}
            </Chip>
          ))}
        </div>
      </div>

      <div>
        <label className="mb-1 block text-xs font-semibold text-text-secondary">Platform</label>
        <Input value={platform} onChange={e => setPlatform(e.target.value)} placeholder="e.g. BJJ Fanatics" />
      </div>

      <div>
        <label className="mb-1 block text-xs font-semibold text-text-secondary">Link</label>
        <Input value={url} onChange={e => setUrl(e.target.value)} placeholder="Optional" />
      </div>

      <div>
        <label className="mb-1 block text-xs font-semibold text-text-secondary">Release year</label>
        <Input type="number" value={releaseYear} onChange={e => setReleaseYear(e.target.value)} placeholder="Optional" />
      </div>

      <div>
        <label className="mb-1 block text-xs font-semibold text-text-secondary">Description</label>
        <Textarea rows={4} value={description} onChange={e => setDescription(e.target.value)} placeholder="Optional" />
      </div>

      <Button disabled={saving || !canSave} onClick={handleSave} className="mt-2">
        {saving ? 'Saving…' : 'Add Instructional'}
      </Button>
    </div>
  );
}
