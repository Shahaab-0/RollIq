import CompetitionMatchForm from '@/features/competitions/components/CompetitionMatchForm';

export default async function EditCompetitionMatchPage({
  params,
}: PageProps<'/competitions/[id]/matches/[matchId]'>) {
  const { id, matchId } = await params;
  return <CompetitionMatchForm competitionId={id} matchId={matchId} />;
}
