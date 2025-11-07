import { CampaignList } from "@/features/campaign/components/CampaignList";
import { ProtectedGlobalNav } from "@/components/navigation/ProtectedGlobalNav";

export const metadata = {
  title: "체험단 둘러보기",
};

export default function CampaignBrowsePage() {
  return (
    <div className="min-h-screen bg-white">
      <ProtectedGlobalNav />
      <main className="mx-auto w-full max-w-6xl px-6 py-8">
        <header className="mb-8">
          <p className="text-sm font-semibold text-slate-500">Campaigns</p>
          <h1 className="text-3xl font-bold text-slate-900 mt-2">
            모집 중인 체험단 목록
          </h1>
          <p className="mt-2 text-slate-600">
            체험단 상세 정보를 확인하고 원하는 캠페인에 지원해 보세요.
          </p>
        </header>
        <CampaignList />
      </main>
    </div>
  );
}
