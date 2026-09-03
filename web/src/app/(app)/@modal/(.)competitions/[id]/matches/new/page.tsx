import SlideOver from '@/components/ui/SlideOver';
import CompetitionMatchForm from '@/features/competitions/components/CompetitionMatchForm';

export default async function NewCompetitionMatchModal({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return (
    <SlideOver>
      <CompetitionMatchForm competitionId={id} />
    </SlideOver>
  );
}
