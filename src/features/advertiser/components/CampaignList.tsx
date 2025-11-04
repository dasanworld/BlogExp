'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useMyCampaigns } from '../hooks/useMyCampaigns';
import { useDeleteCampaign } from '../hooks/useDeleteCampaign';
import { Campaign } from '../types/advertiser-types';
import { CampaignCard } from './CampaignCard';
import { CreateCampaignDialog } from './CreateCampaignDialog';
import { UpdateCampaignDialog } from './UpdateCampaignDialog';
import { useCloseCampaign } from '../hooks/useCloseCampaign';
import { AdvertiserProfileCard } from './AdvertiserProfileCard';

export const CampaignList = () => {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editTarget, setEditTarget] = useState<Campaign | null>(null);
  const [selectedStatus, setSelectedStatus] = useState<
    'recruiting' | 'closed' | 'selection_completed' | undefined
  >(undefined);
  const deleteCampaign = useDeleteCampaign();
  const closeCampaign = useCloseCampaign();

  const { data, isLoading, hasNextPage, fetchNextPage, isFetchingNextPage } = useMyCampaigns({
    status: selectedStatus,
  });

  const campaigns = data?.pages.flatMap((page) => page.campaigns) || [];
  const statusCounts = data?.pages[0]?.statusCounts || {
    recruiting: 0,
    closed: 0,
    selection_completed: 0,
  };

  const handleDelete = async (campaignId: string) => {
    const campaign = campaigns.find((c) => c.id === campaignId);
    if (!campaign) return;

    let message = '정말 삭제하시겠습니까?';
    if (campaign.applicantCount > 0) {
      message = `지원자가 ${campaign.applicantCount}명 있습니다.\n정말 삭제하시겠습니까?`;
    }

    if (confirm(message)) {
      try {
        await deleteCampaign.mutateAsync(campaignId);
      } catch {
      }
    }
  };

  const handleCloseRecruitment = async (campaignId: string) => {
    const ok = confirm('모집을 종료하시겠습니까? 종료 후에는 선정만 가능합니다.');
    if (!ok) return;
    try {
      await closeCampaign.mutateAsync(campaignId);
    } catch {}
  };

  if (isLoading) {
    return (
      <div className="space-y-4">
        {[...Array(3)].map((_, i) => (
          <div key={i} className="border border-slate-200 rounded-lg p-6 animate-pulse">
            <div className="h-6 bg-slate-200 rounded w-1/3 mb-4"></div>
            <div className="h-4 bg-slate-200 rounded w-1/2 mb-2"></div>
            <div className="h-4 bg-slate-200 rounded w-1/4"></div>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div>
      <AdvertiserProfileCard />
      <div className="mb-8 flex items-center justify-between">
        <h2 className="text-2xl font-bold text-slate-900">내가 등록한 체험단</h2>
        <div className="flex items-center gap-2">
          <Link
            href="/"
            className="px-4 py-2 border border-slate-300 text-slate-700 rounded-lg font-medium hover:bg-slate-50"
          >
            홈으로 가기
          </Link>
          <button
            onClick={() => setIsDialogOpen(true)}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700"
          >
            + 신규 체험단 등록
          </button>
        </div>
      </div>

      <div className="mb-6 flex gap-2 border-b border-slate-200">
        {['전체', 'recruiting', 'closed', 'selection_completed'].map((status) => {
          const isActive = selectedStatus === (status === '전체' ? undefined : status);
          const count =
            status === '전체'
              ? Object.values(statusCounts).reduce((a, b) => a + b, 0)
              : statusCounts[status as keyof typeof statusCounts] || 0;

          return (
            <button
              key={status}
              onClick={() =>
                setSelectedStatus(status === '전체' ? undefined : (status as any))
              }
              className={`px-4 py-3 font-medium text-sm ${
                isActive
                  ? 'border-b-2 border-blue-600 text-blue-600'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              {status === '전체' && `전체 (${count})`}
              {status === 'recruiting' && `모집 중 (${count})`}
              {status === 'closed' && `모집 종료 (${count})`}
              {status === 'selection_completed' && `선정 완료 (${count})`}
            </button>
          );
        })}
      </div>

      {campaigns.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-slate-600 mb-4">등록된 체험단이 없습니다</p>
          <button
            onClick={() => setIsDialogOpen(true)}
            className="text-blue-600 hover:text-blue-700 font-medium"
          >
            신규 체험단 등록하기
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          {campaigns.map((campaign) => (
            <CampaignCard
              key={campaign.id}
              campaign={campaign}
              onDelete={handleDelete}
              onEdit={(c) => setEditTarget(c)}
              onCloseRecruitment={handleCloseRecruitment}
            />
          ))}

          {hasNextPage && (
            <button
              onClick={() => fetchNextPage()}
              disabled={isFetchingNextPage}
              className="w-full px-4 py-2 border border-slate-300 text-slate-700 rounded-lg font-medium hover:bg-slate-50 disabled:opacity-50"
            >
              {isFetchingNextPage ? '로딩 중...' : '더보기'}
            </button>
          )}
        </div>
      )}

      <CreateCampaignDialog isOpen={isDialogOpen} onClose={() => setIsDialogOpen(false)} />
      {editTarget && (
        <UpdateCampaignDialog
          open={!!editTarget}
          onClose={() => setEditTarget(null)}
          campaign={editTarget}
          onSuccess={() => setEditTarget(null)}
        />
      )}
    </div>
  );
};
