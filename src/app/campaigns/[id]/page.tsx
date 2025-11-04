import { CampaignDetail } from '@/features/campaign/components/CampaignDetail';

export const metadata = {
  title: '체험단 상세',
};

export default async function CampaignDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  return <CampaignDetail campaignId={id} />;
}
