'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  ClipboardList,
  Dumbbell,
  HeartPulse,
  LayoutDashboard,
  PlayCircle,
  Swords,
  Trophy,
  Video,
} from 'lucide-react';

interface NavItem {
  href: string;
  label: string;
  icon: typeof LayoutDashboard;
}

const DASHBOARD: NavItem = { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard };

// Grouped instead of one flat list of 9 equal items -- gives the sidebar
// real hierarchy as it's grown, and reads as an actual product nav rather
// than a rotated mobile tab bar. Profile/Sign Out live in UserMenu (the
// top bar) instead of here, matching where account actions live in most
// desktop web apps.
const GROUPS: { label: string; items: NavItem[] }[] = [
  {
    label: 'Training',
    items: [
      { href: '/log', label: 'Training Log', icon: ClipboardList },
      { href: '/techniques', label: 'Techniques', icon: Video },
      { href: '/rolls', label: 'Rolls', icon: Swords },
    ],
  },
  {
    label: 'Community',
    items: [
      { href: '/gyms', label: 'Gyms', icon: Dumbbell },
      { href: '/competitions', label: 'Competitions', icon: Trophy },
    ],
  },
  {
    label: 'You',
    items: [
      { href: '/injuries', label: 'Injuries', icon: HeartPulse },
      { href: '/instructionals', label: 'Instructionals', icon: PlayCircle },
    ],
  },
];

function NavLink({ item, active }: Readonly<{ item: NavItem; active: boolean }>) {
  const Icon = item.icon;
  return (
    <Link
      href={item.href}
      className={`flex items-center gap-3 rounded-xl px-3 py-2 text-sm font-semibold transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent ${
        active ? 'bg-accent-muted text-accent' : 'text-text-secondary hover:bg-surface-alt hover:text-text-primary'
      }`}
    >
      <Icon size={17} />
      {item.label}
    </Link>
  );
}

export default function Nav() {
  const pathname = usePathname();

  return (
    <nav className="flex h-full w-56 shrink-0 flex-col gap-5 border-r border-border bg-surface p-4">
      <NavLink item={DASHBOARD} active={pathname.startsWith(DASHBOARD.href)} />

      {GROUPS.map(group => (
        <div key={group.label} className="flex flex-col gap-1">
          <p className="px-3 pb-1 text-[11px] font-bold uppercase tracking-wide text-text-secondary">{group.label}</p>
          {group.items.map(item => (
            <NavLink key={item.href} item={item} active={pathname.startsWith(item.href)} />
          ))}
        </div>
      ))}
    </nav>
  );
}
