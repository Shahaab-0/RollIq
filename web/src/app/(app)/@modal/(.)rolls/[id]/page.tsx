import SlideOver from '@/components/ui/SlideOver';
import RollForm from '@/features/rolls/components/RollForm';

export default async function EditRollModal({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return (
    <SlideOver>
      <RollForm rollId={id} />
    </SlideOver>
  );
}
