import InjuryForm from '@/features/injuries/components/InjuryForm';

export default async function EditInjuryPage({ params }: PageProps<'/injuries/[id]'>) {
  const { id } = await params;
  return <InjuryForm injuryId={id} />;
}
