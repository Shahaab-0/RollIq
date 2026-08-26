import { redirect } from 'next/navigation';
import { hasSession } from '@/lib/session';
import Nav from '@/components/Nav';

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  if (!(await hasSession())) {
    redirect('/signin');
  }

  return (
    <div className="flex min-h-screen bg-background">
      <Nav />
      <main className="flex-1 overflow-y-auto p-8">{children}</main>
    </div>
  );
}
