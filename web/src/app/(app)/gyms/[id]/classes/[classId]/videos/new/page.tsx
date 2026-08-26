import GymClassVideoForm from '@/features/gyms/components/GymClassVideoForm';

export default async function NewGymClassVideoPage({ params }: PageProps<'/gyms/[id]/classes/[classId]/videos/new'>) {
  const { id, classId } = await params;
  return <GymClassVideoForm gymId={id} classId={classId} />;
}
