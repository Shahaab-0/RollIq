import SlideOver from '@/components/ui/SlideOver';
import InstructionalVideoForm from '@/features/instructionals/components/InstructionalVideoForm';

export default async function NewInstructionalVideoModal({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return (
    <SlideOver>
      <InstructionalVideoForm instructionalId={id} />
    </SlideOver>
  );
}
