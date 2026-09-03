import SlideOver from '@/components/ui/SlideOver';
import TechniqueForm from '@/features/techniques/components/TechniqueForm';

export default async function EditTechniqueModal({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return (
    <SlideOver>
      <TechniqueForm techniqueId={id} />
    </SlideOver>
  );
}
