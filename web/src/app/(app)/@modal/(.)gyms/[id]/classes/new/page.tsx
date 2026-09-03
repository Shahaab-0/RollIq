import SlideOver from '@/components/ui/SlideOver';
import GymClassForm from '@/features/gyms/components/GymClassForm';

export default async function NewGymClassModal({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return (
    <SlideOver>
      <GymClassForm gymId={id} />
    </SlideOver>
  );
}
