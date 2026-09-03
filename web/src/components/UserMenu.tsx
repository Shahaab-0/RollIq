'use client';

import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { LogOut, User } from 'lucide-react';
import { useMe, useSignOut } from '@/features/auth/hooks/useAuth';

export default function UserMenu() {
  const { data: me } = useMe();
  const signOut = useSignOut();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const onClickOutside = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener('mousedown', onClickOutside);
    return () => document.removeEventListener('mousedown', onClickOutside);
  }, []);

  const initial = me?.email?.[0]?.toUpperCase() ?? '?';

  return (
    <div className="relative" ref={ref}>
      <button
        type="button"
        onClick={() => setOpen(v => !v)}
        aria-label="Account menu"
        className="flex h-9 w-9 items-center justify-center rounded-full bg-accent-muted text-sm font-bold text-accent transition hover:opacity-80"
      >
        {initial}
      </button>

      {open ? (
        <div className="absolute right-0 top-11 z-30 w-56 overflow-hidden rounded-xl border border-border bg-surface shadow-lg">
          {me?.email ? (
            <div className="truncate border-b border-border px-4 py-3 text-xs text-text-secondary">{me.email}</div>
          ) : null}
          <Link
            href="/profile"
            onClick={() => setOpen(false)}
            className="flex items-center gap-2 px-4 py-2.5 text-sm font-semibold text-text-primary hover:bg-surface-alt"
          >
            <User size={16} />
            Profile
          </Link>
          <button
            type="button"
            onClick={() => signOut.mutate()}
            disabled={signOut.isPending}
            className="flex w-full items-center gap-2 px-4 py-2.5 text-sm font-semibold text-danger hover:bg-danger/10 disabled:opacity-60"
          >
            <LogOut size={16} />
            {signOut.isPending ? 'Signing out…' : 'Sign Out'}
          </button>
        </div>
      ) : null}
    </div>
  );
}
