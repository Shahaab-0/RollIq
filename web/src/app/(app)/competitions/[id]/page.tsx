import CompetitionDetailView from '@/features/competitions/components/CompetitionDetailView';

export default async function CompetitionDetailPage({ params }: PageProps<'/competitions/[id]'>) {
  const { id } = await params;
  return <CompetitionDetailView competitionId={id} />;
}
