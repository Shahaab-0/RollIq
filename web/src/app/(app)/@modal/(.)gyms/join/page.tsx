import SlideOver from '@/components/ui/SlideOver';
import GymJoinForm from '@/features/gyms/components/GymJoinForm';

export default function JoinGymModal() {
  return (
    <SlideOver>
      <GymJoinForm />
    </SlideOver>
  );
}
