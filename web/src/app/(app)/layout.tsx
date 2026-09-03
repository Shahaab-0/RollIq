import { redirect } from 'next/navigation';
import { hasSession } from '@/lib/session';
import AppShell from '@/components/AppShell';

export default async function AppLayout({ children, modal }: { children: React.ReactNode; modal: React.ReactNode }) {
  if (!(await hasSession())) {
    redirect('/signin');
  }

  return <AppShell modal={modal}>{children}</AppShell>;
}
