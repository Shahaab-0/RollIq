import SlideOver from '@/components/ui/SlideOver';
import RollForm from '@/features/rolls/components/RollForm';

export default function NewRollModal() {
  return (
    <SlideOver>
      <RollForm />
    </SlideOver>
  );
}
