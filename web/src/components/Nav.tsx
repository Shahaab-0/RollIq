'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  ClipboardList,
  Dumbbell,
  HeartPulse,
  LayoutDashboard,
  LogOut,
  PlayCircle,
  Swords,
  Trophy,
  User,
  Video,
} from 'lucide-react';
import { useSignOut } from '@/features/auth/hooks/useAuth';

const NAV_ITEMS = [
  { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/log', label: 'Training Log', icon: ClipboardList },
  { href: '/techniques', label: 'Techniques', icon: Video },
  { href: '/rolls', label: 'Rolls', icon: Swords },
  { href: '/gyms', label: 'Gyms', icon: Dumbbell },
  { href: '/competitions', label: 'Competitions', icon: Trophy },
  { href: '/injuries', label: 'Injuries', icon: HeartPulse },
  { href: '/instructionals', label: 'Instructionals', icon: PlayCircle },
  { href: '/profile', label: 'Profile', icon: User },
];

export default function Nav() {
  const pathname = usePathname();
  const signOut = useSignOut();

  return (
    <nav className="flex h-full w-56 shrink-0 flex-col gap-1 border-r border-border bg-surface p-4">
      <div className="mb-6 px-2 text-xl font-extrabold text-text-primary">RollIQ</div>

      {NAV_ITEMS.map(item => {
        const active = pathname.startsWith(item.href);
        const Icon = item.icon;
        return (
          <Link
            key={item.href}
            href={item.href}
            className={`flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-semibold transition ${
              active ? 'bg-accent-muted text-accent' : 'text-text-secondary hover:bg-surface-alt hover:text-text-primary'
            }`}
          >
            <Icon size={18} />
            {item.label}
          </Link>
        );
      })}

      <button
        onClick={() => signOut.mutate()}
        disabled={signOut.isPending}
        className="mt-auto flex items-center gap-3 rounded-xl border border-danger px-3 py-2.5 text-sm font-semibold text-danger transition hover:bg-danger/10 disabled:opacity-60"
      >
        <LogOut size={18} />
        {signOut.isPending ? 'Signing out…' : 'Sign Out'}
      </button>
    </nav>
  );
}
