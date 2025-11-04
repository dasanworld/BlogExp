import { ApplicationPage } from '@/features/campaign/components/ApplicationPage';

export const metadata = {
  title: '체험단 지원',
};

export default async function CampaignApplicationPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  return <ApplicationPage campaignId={id} />;
}
