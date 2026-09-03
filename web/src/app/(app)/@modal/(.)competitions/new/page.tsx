import SlideOver from '@/components/ui/SlideOver';
import CompetitionForm from '@/features/competitions/components/CompetitionForm';

export default function NewCompetitionModal() {
  return (
    <SlideOver>
      <CompetitionForm />
    </SlideOver>
  );
}
