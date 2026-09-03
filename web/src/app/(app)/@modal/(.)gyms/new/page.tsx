import SlideOver from '@/components/ui/SlideOver';
import GymForm from '@/features/gyms/components/GymForm';

export default function NewGymModal() {
  return (
    <SlideOver>
      <GymForm />
    </SlideOver>
  );
}
