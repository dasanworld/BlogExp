import { CampaignList } from '@/features/advertiser/components/CampaignList';

export const metadata = {
  title: '체험단 관리',
};

export default function CampaignsPage() {
  return (
    <div className="container mx-auto py-8 max-w-6xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-slate-900 mb-2">체험단 관리</h1>
        <p className="text-slate-600">내가 등록한 체험단을 관리하고 지원자를 선정하세요.</p>
      </div>

      <CampaignList />
    </div>
  );
}
