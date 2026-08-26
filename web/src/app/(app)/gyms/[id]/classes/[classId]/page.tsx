import GymClassDetailView from '@/features/gyms/components/GymClassDetailView';

export default async function GymClassDetailPage({ params }: PageProps<'/gyms/[id]/classes/[classId]'>) {
  const { id, classId } = await params;
  return <GymClassDetailView gymId={id} classId={classId} />;
}
