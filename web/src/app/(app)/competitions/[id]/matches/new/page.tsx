import CompetitionMatchForm from '@/features/competitions/components/CompetitionMatchForm';

export default async function NewCompetitionMatchPage({ params }: PageProps<'/competitions/[id]/matches/new'>) {
  const { id } = await params;
  return <CompetitionMatchForm competitionId={id} />;
}
