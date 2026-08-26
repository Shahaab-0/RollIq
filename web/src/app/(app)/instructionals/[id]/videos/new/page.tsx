import InstructionalVideoForm from '@/features/instructionals/components/InstructionalVideoForm';

export default async function NewInstructionalVideoPage({ params }: PageProps<'/instructionals/[id]/videos/new'>) {
  const { id } = await params;
  return <InstructionalVideoForm instructionalId={id} />;
}
