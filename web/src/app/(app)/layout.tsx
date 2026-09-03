import { redirect } from 'next/navigation';
import { hasSession } from '@/lib/session';
import Nav from '@/components/Nav';
import UserMenu from '@/components/UserMenu';

export default async function AppLayout({ children, modal }: { children: React.ReactNode; modal: React.ReactNode }) {
  if (!(await hasSession())) {
    redirect('/signin');
  }

  return (
    <div className="flex h-screen flex-col bg-background">
      <header className="flex h-14 shrink-0 items-center justify-between border-b border-border bg-surface px-6">
        <span className="text-lg font-extrabold tracking-tight text-text-primary">RollIQ</span>
        <UserMenu />
      </header>

      <div className="flex flex-1 overflow-hidden">
        <Nav />
        <main className="flex-1 overflow-y-auto p-8">{children}</main>
      </div>

      {modal}
    </div>
  );
}
