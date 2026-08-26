import GymMembersView from '@/features/gyms/components/GymMembersView';

export default async function GymMembersPage({ params }: PageProps<'/gyms/[id]/members'>) {
  const { id } = await params;
  return <GymMembersView gymId={id} />;
}
