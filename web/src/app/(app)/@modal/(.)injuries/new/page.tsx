import SlideOver from '@/components/ui/SlideOver';
import InjuryForm from '@/features/injuries/components/InjuryForm';

export default function NewInjuryModal() {
  return (
    <SlideOver>
      <InjuryForm />
    </SlideOver>
  );
}
