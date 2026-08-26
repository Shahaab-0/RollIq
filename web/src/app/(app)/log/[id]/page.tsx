import SessionForm from '@/features/trainingLog/components/SessionForm';

export default async function EditSessionPage({ params }: PageProps<'/log/[id]'>) {
  const { id } = await params;
  return <SessionForm sessionId={id} />;
}
