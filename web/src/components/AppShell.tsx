'use client';

import { useState } from 'react';
import { Menu } from 'lucide-react';
import Nav from './Nav';
import UserMenu from './UserMenu';

// Owns the mobile nav open/close state so the sidebar can collapse into a
// hamburger-triggered drawer below lg -- everything here (header, Nav,
// main) previously lived directly in the server-component (app)/layout.tsx,
// which can't hold client state itself.
interface Props {
  children: React.ReactNode;
  modal: React.ReactNode;
}

export default function AppShell({ children, modal }: Readonly<Props>) {
  const [navOpen, setNavOpen] = useState(false);

  return (
    <div className="flex h-screen flex-col bg-background">
      <header className="flex h-14 shrink-0 items-center justify-between border-b border-border bg-surface px-4 sm:px-6">
        <div className="flex items-center gap-2 sm:gap-3">
          <button
            type="button"
            onClick={() => setNavOpen(true)}
            aria-label="Open menu"
            className="-ml-1.5 rounded-lg p-1.5 text-text-secondary transition hover:bg-surface-alt hover:text-text-primary lg:hidden"
          >
            <Menu size={22} />
          </button>
          <span className="flex items-center gap-2.5">
            <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-accent text-sm font-extrabold text-accent-text">
              R
            </span>
            <span className="text-lg font-extrabold tracking-tight text-text-primary">RollIQ</span>
          </span>
        </div>
        <UserMenu />
      </header>

      <div className="flex flex-1 overflow-hidden">
        <Nav open={navOpen} onClose={() => setNavOpen(false)} />
        <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8">{children}</main>
      </div>

      {modal}
    </div>
  );
}
