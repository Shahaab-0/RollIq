import SlideOver from '@/components/ui/SlideOver';
import CompetitionMatchForm from '@/features/competitions/components/CompetitionMatchForm';

export default async function EditCompetitionMatchModal({
  params,
}: {
  params: Promise<{ id: string; matchId: string }>;
}) {
  const { id, matchId } = await params;
  return (
    <SlideOver>
      <CompetitionMatchForm competitionId={id} matchId={matchId} />
    </SlideOver>
  );
}
