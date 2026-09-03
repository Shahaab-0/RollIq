import SlideOver from '@/components/ui/SlideOver';
import GymClassVideoForm from '@/features/gyms/components/GymClassVideoForm';

export default async function NewGymClassVideoModal({
  params,
}: {
  params: Promise<{ id: string; classId: string }>;
}) {
  const { id, classId } = await params;
  return (
    <SlideOver>
      <GymClassVideoForm gymId={id} classId={classId} />
    </SlideOver>
  );
}
