import TechniqueForm from '@/features/techniques/components/TechniqueForm';

export default async function EditTechniquePage({ params }: PageProps<'/techniques/[id]'>) {
  const { id } = await params;
  return <TechniqueForm techniqueId={id} />;
}
