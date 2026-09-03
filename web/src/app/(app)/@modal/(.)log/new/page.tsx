import SlideOver from '@/components/ui/SlideOver';
import SessionForm from '@/features/trainingLog/components/SessionForm';

export default function NewSessionModal() {
  return (
    <SlideOver>
      <SessionForm />
    </SlideOver>
  );
}
