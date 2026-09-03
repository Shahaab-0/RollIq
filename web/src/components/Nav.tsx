'use client';

import { useEffect } from 'react';
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
  X,
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

function NavLink({
  item,
  active,
  onNavigate,
}: Readonly<{ item: NavItem; active: boolean; onNavigate: () => void }>) {
  const Icon = item.icon;
  return (
    <Link
      href={item.href}
      onClick={onNavigate}
      className={`relative flex items-center gap-3 rounded-xl px-3 py-2 text-sm font-semibold transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent ${
        active ? 'bg-accent-muted text-accent' : 'text-text-secondary hover:bg-surface-alt hover:text-text-primary'
      }`}
    >
      {active ? (
        <span className="absolute -left-4 top-1/2 h-5 w-1 -translate-y-1/2 rounded-r-full bg-accent" />
      ) : null}
      <Icon size={17} />
      {item.label}
    </Link>
  );
}

interface NavProps {
  open: boolean;
  onClose: () => void;
}

// Static sidebar at lg+ (matches every screenshot the app was designed
// around); below that it becomes a hamburger-triggered overlay drawer,
// reusing the same backdrop + slide-in-from-left pattern as SlideOver.tsx.
export default function Nav({ open, onClose }: Readonly<NavProps>) {
  const pathname = usePathname();

  // Closes the mobile drawer automatically once a nav link's route change
  // actually lands, not just on click -- avoids a flash of the old page
  // behind a closing drawer.
  useEffect(() => {
    onClose();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pathname]);

  const links = (
    <>
      <NavLink item={DASHBOARD} active={pathname.startsWith(DASHBOARD.href)} onNavigate={onClose} />

      {GROUPS.map(group => (
        <div key={group.label} className="flex flex-col gap-1">
          <p className="px-3 pb-1 text-[11px] font-bold uppercase tracking-wide text-text-secondary">{group.label}</p>
          {group.items.map(item => (
            <NavLink key={item.href} item={item} active={pathname.startsWith(item.href)} onNavigate={onClose} />
          ))}
        </div>
      ))}
    </>
  );

  return (
    <>
      <nav className="hidden h-full w-56 shrink-0 flex-col gap-5 border-r border-border bg-surface p-4 lg:flex">
        {links}
      </nav>

      <div className={`fixed inset-0 z-40 lg:hidden ${open ? '' : 'pointer-events-none'}`}>
        <button
          type="button"
          aria-label="Close menu"
          onClick={onClose}
          className={`absolute inset-0 bg-black/40 transition-opacity duration-200 ${
            open ? 'opacity-100' : 'opacity-0'
          }`}
        />
        <nav
          style={{ overscrollBehavior: 'contain' }}
          className={`relative flex h-full w-64 max-w-[80vw] flex-col gap-5 overflow-y-auto bg-surface p-4 shadow-xl transition-transform duration-200 ${
            open ? 'translate-x-0' : '-translate-x-full'
          }`}
        >
          <button
            type="button"
            aria-label="Close menu"
            onClick={onClose}
            className="self-end rounded-lg p-1.5 text-text-secondary transition hover:bg-surface-alt hover:text-text-primary"
          >
            <X size={20} />
          </button>
          {links}
        </nav>
      </div>
    </>
  );
}
