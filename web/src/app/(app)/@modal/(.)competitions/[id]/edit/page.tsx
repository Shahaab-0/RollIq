import SlideOver from '@/components/ui/SlideOver';
import CompetitionForm from '@/features/competitions/components/CompetitionForm';

export default async function EditCompetitionModal({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return (
    <SlideOver>
      <CompetitionForm competitionId={id} />
    </SlideOver>
  );
}
