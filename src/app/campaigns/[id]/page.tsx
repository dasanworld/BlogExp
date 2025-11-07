import { CampaignDetail } from "@/features/campaign/components/CampaignDetail";
import { ProtectedGlobalNav } from "@/components/navigation/ProtectedGlobalNav";

export const metadata = {
  title: "체험단 상세",
};

export default async function CampaignDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  return (
    <div className="min-h-screen bg-slate-50">
      <ProtectedGlobalNav />
      <main>
        <CampaignDetail campaignId={id} />
      </main>
    </div>
  );
}
