'use client';

import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { useCampaignDetail } from '../hooks/useCampaignDetail';
import { useCurrentUser } from '@/features/auth/hooks/useCurrentUser';
import { ApplicationForm } from './ApplicationForm';

interface ApplicationPageProps {
  campaignId: string;
}

export const ApplicationPage = ({
  campaignId,
}: ApplicationPageProps) => {
  const router = useRouter();
  const { user: currentUser } = useCurrentUser();
  const { data: campaign, isLoading, error } = useCampaignDetail(campaignId);

  if (!currentUser) {
    return (
      <div className="container mx-auto py-8">
        <div className="rounded-lg border border-blue-200 bg-blue-50 p-8 text-center">
          <p className="text-blue-800 mb-4">로그인 후 지원할 수 있습니다.</p>
          <Button onClick={() => router.push('/login')}>
            로그인하기
          </Button>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto py-8">
        <div className="rounded-lg border border-red-200 bg-red-50 p-8 text-center">
          <p className="text-red-600 mb-4">체험단을 찾을 수 없습니다.</p>
          <Button onClick={() => router.back()}>
            돌아가기
          </Button>
        </div>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="container mx-auto py-8">
        <div className="space-y-6">
          <div className="h-12 w-3/4 bg-slate-200 rounded animate-pulse" />
          <div className="h-64 w-full bg-slate-200 rounded animate-pulse" />
        </div>
      </div>
    );
  }

  if (!campaign) {
    return (
      <div className="container mx-auto py-8">
        <div className="rounded-lg border border-slate-200 bg-slate-50 p-8 text-center">
          <p className="text-slate-600 mb-4">체험단을 찾을 수 없습니다.</p>
          <Button onClick={() => router.back()}>
            돌아가기
          </Button>
        </div>
      </div>
    );
  }

  if (campaign.status !== 'recruiting') {
    return (
      <div className="container mx-auto py-8">
        <div className="rounded-lg border border-yellow-200 bg-yellow-50 p-8 text-center">
          <p className="text-yellow-800 mb-4">
            모집이 진행 중이 아닙니다.
          </p>
          <Button onClick={() => router.push(`/campaigns/${campaign.id}`)}>
            상세보기
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8 space-y-6 max-w-2xl">
      <div className="flex items-center gap-2">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => router.back()}
        >
          ← 돌아가기
        </Button>
      </div>

      <ApplicationForm
        campaign={campaign}
        onSuccess={() => {
          router.push('/my-applications');
        }}
        onCancel={() => {
          router.back();
        }}
      />
    </div>
  );
};
