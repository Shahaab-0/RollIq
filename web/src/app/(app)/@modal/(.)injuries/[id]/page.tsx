import SlideOver from '@/components/ui/SlideOver';
import InjuryForm from '@/features/injuries/components/InjuryForm';

export default async function EditInjuryModal({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return (
    <SlideOver>
      <InjuryForm injuryId={id} />
    </SlideOver>
  );
}
