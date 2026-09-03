import SlideOver from '@/components/ui/SlideOver';
import SessionForm from '@/features/trainingLog/components/SessionForm';

export default async function EditSessionModal({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return (
    <SlideOver>
      <SessionForm sessionId={id} />
    </SlideOver>
  );
}
