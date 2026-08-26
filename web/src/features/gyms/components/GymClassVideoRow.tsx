'use client';

import { Play, Trash2 } from 'lucide-react';
import type { GymClassVideo } from '../types';

interface Props {
  video: GymClassVideo;
  canManage: boolean;
  onDelete: () => void;
}

// Presentational -- the parent view owns the query/mutation and passes a
// callback down. Watch opens in a new tab (web has no in-app WebView
// indirection to reach for, unlike mobile).
export default function GymClassVideoRow({ video, canManage, onDelete }: Readonly<Props>) {
  return (
    <div className="flex flex-col gap-2.5 rounded-2xl border border-border bg-surface p-3.5">
      <div className="flex items-center justify-between">
        <p className="text-sm font-semibold text-text-primary">Video {video.sequence_number}</p>
        {canManage ? (
          <button onClick={onDelete} className="rounded-lg border border-danger p-2 text-danger hover:bg-danger/10">
            <Trash2 size={16} />
          </button>
        ) : null}
      </div>

      {video.techniques.length > 0 ? (
        <div className="flex flex-wrap gap-2">
          {video.techniques.map((technique, index) => (
            <span key={`${technique}-${index}`} className="rounded-full bg-accent-muted px-2.5 py-1 text-xs font-semibold text-accent">
              {technique}
            </span>
          ))}
        </div>
      ) : null}

      {video.url ? (
        <a
          href={video.url}
          target="_blank"
          rel="noopener noreferrer"
          className="flex w-fit items-center gap-1.5 rounded-lg bg-accent px-4 py-2 text-sm font-semibold text-accent-text"
        >
          <Play size={16} />
          Watch
        </a>
      ) : null}
    </div>
  );
}
