import CompetitionForm from '@/features/competitions/components/CompetitionForm';

export default async function EditCompetitionPage({ params }: PageProps<'/competitions/[id]/edit'>) {
  const { id } = await params;
  return <CompetitionForm competitionId={id} />;
}
