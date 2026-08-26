import RollForm from '@/features/rolls/components/RollForm';

export default async function EditRollPage({ params }: PageProps<'/rolls/[id]'>) {
  const { id } = await params;
  return <RollForm rollId={id} />;
}
