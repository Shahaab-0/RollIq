import GymDetailView from '@/features/gyms/components/GymDetailView';

export default async function GymDetailPage({ params }: PageProps<'/gyms/[id]'>) {
  const { id } = await params;
  return <GymDetailView gymId={id} />;
}
