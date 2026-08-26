import GymClassForm from '@/features/gyms/components/GymClassForm';

export default async function NewGymClassPage({ params }: PageProps<'/gyms/[id]/classes/new'>) {
  const { id } = await params;
  return <GymClassForm gymId={id} />;
}
