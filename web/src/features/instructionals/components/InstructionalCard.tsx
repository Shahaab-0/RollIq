'use client';

import { useState } from 'react';
import Link from 'next/link';
import { ChevronDown, Play } from 'lucide-react';
import {
  useInstructionalProgress,
  useInstructionalVideos,
  useRemoveProgress,
  useSetProgress,
} from '../hooks/useInstructionals';
import { PROGRESS_STATUS_OPTIONS, type Difficulty, type Instructional, type ProgressStatus } from '../types';
import Chip from '@/components/ui/Chip';

const DIFFICULTY_LABEL: Record<Difficulty, string> = {
  beginner: 'Beginner',
  intermediate: 'Intermediate',
  advanced: 'Advanced',
};

// Self-contained: owns its own expand state, its own video fetch (only once
// expanded), and its own progress reads/writes -- the library page just
// renders one of these per row.
export default function InstructionalCard({ instructional }: Readonly<{ instructional: Instructional }>) {
  const [expanded, setExpanded] = useState(false);
  const { data: videos = [], isLoading } = useInstructionalVideos(expanded ? instructional.id : undefined);
  const { data: progress = [] } = useInstructionalProgress();
  const setProgress = useSetProgress();
  const removeProgress = useRemoveProgress();

  const badgeLabel =
    instructional.video_count === 0
      ? 'No videos yet'
      : `${instructional.completed_video_count}/${instructional.video_count} completed`;

  return (
    <div className="rounded-2xl border border-border bg-surface px-4 shadow-sm transition hover:border-accent/50">
      <button
        type="button"
        onClick={() => setExpanded(v => !v)}
        className="flex w-full items-center justify-between gap-3 py-4"
      >
        <div className="flex-1 text-left">
          <p className="text-sm font-semibold text-text-primary">{instructional.title}</p>
          <p className="text-xs text-text-secondary">
            {instructional.instructor} · {instructional.category}
          </p>
          <span className="mt-1 inline-block rounded-lg border border-border px-2 py-0.5 text-[11px] font-semibold text-text-secondary">
            {DIFFICULTY_LABEL[instructional.difficulty]}
          </span>
        </div>
        <div className="flex flex-col items-end gap-1.5">
          <span className="rounded-lg bg-accent-muted px-2 py-1 font-mono text-xs font-semibold tabular-nums text-accent">
            {badgeLabel}
          </span>
          <ChevronDown
            size={18}
            className={`text-text-secondary transition-transform ${expanded ? 'rotate-180' : ''}`}
          />
        </div>
      </button>

      {expanded ? (
        <div className="pb-4">
          {isLoading ? (
            <p className="py-3 text-sm text-text-secondary">Loading…</p>
          ) : videos.length === 0 ? (
            <p className="pt-3 text-sm text-text-secondary">No videos yet.</p>
          ) : (
            videos.map(video => {
              const videoStatus: ProgressStatus | null = progress.find(p => p.video_id === video.id)?.status ?? null;
              return (
                <div key={video.id} className="flex items-center justify-between gap-3 border-t border-border py-3">
                  <div className="flex-1">
                    <p className="text-sm font-semibold text-text-primary">{video.title}</p>
                    <div className="mt-1.5 flex flex-wrap gap-1.5">
                      {PROGRESS_STATUS_OPTIONS.map(option => {
                        const active = videoStatus === option.value;
                        return (
                          <Chip
                            key={option.value}
                            active={active}
                            onClick={() =>
                              active ? removeProgress.mutate(video.id) : setProgress.mutate({ videoId: video.id, status: option.value })
                            }
                          >
                            {option.label}
                          </Chip>
                        );
                      })}
                    </div>
                  </div>
                  {video.url ? (
                    <a
                      href={video.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-1.5 rounded-lg border border-accent px-3 py-2 text-xs font-semibold text-accent hover:bg-accent-muted"
                    >
                      <Play size={14} />
                      Watch
                    </a>
                  ) : (
                    <span className="text-xs text-text-secondary">No link yet</span>
                  )}
                </div>
              );
            })
          )}
          <Link
            href={`/instructionals/${instructional.id}/videos/new`}
            className="mt-3 block rounded-lg border border-accent py-2.5 text-center text-sm font-semibold text-accent hover:bg-accent-muted"
          >
            + Add Video
          </Link>
        </div>
      ) : null}
    </div>
  );
}
