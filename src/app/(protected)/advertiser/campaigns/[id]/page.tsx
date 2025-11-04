'use client';

import { useState } from 'react';
import { useParams } from 'next/navigation';
import { useCampaignDetail } from '@/features/advertiser/hooks/useCampaignDetail';
import { useApplicants } from '@/features/advertiser/hooks/useApplicants';
import { CampaignDetailView } from '@/features/advertiser/components/CampaignDetailView';
import { ApplicantList } from '@/features/advertiser/components/ApplicantList';
import { CloseCampaignDialog } from '@/features/advertiser/components/CloseCampaignDialog';
import { UpdateCampaignDialog } from '@/features/advertiser/components/UpdateCampaignDialog';
import { Button } from '@/components/ui/button';

export default function CampaignDetailPage() {
  const params = useParams();
  const campaignId = params.id as string;

  const { data: campaign, isLoading: campaignLoading } = useCampaignDetail(campaignId);
  const { data: applicantsData, isLoading: applicantsLoading } = useApplicants(campaignId);
  const [closeCampaignDialogOpen, setCloseCampaignDialogOpen] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);

  if (campaignLoading) {
    return (
      <div className="container mx-auto py-8 max-w-6xl">
        <div className="animate-pulse space-y-6">
          <div className="bg-slate-200 h-12 rounded"></div>
          <div className="bg-slate-200 h-64 rounded"></div>
        </div>
      </div>
    );
  }

  if (!campaign) {
    return (
      <div className="container mx-auto py-8 max-w-6xl">
        <p className="text-center text-slate-500">캠페인을 찾을 수 없습니다</p>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8 max-w-6xl">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-slate-900">체험단 상세 관리</h1>
        <div className="flex gap-2">
          <Button
            variant="outline"
            onClick={() => setEditDialogOpen(true)}
          >
            수정
          </Button>
          {campaign.status === 'recruiting' && (
            <Button
              onClick={() => setCloseCampaignDialogOpen(true)}
              className="bg-orange-600 hover:bg-orange-700 text-white"
            >
              모집 종료
            </Button>
          )}
        </div>
      </div>

      <div className="space-y-6">
        <CampaignDetailView campaign={campaign} />

        {applicantsLoading ? (
          <div className="bg-white p-8 rounded-lg border border-slate-200">
            <div className="animate-pulse space-y-4">
              <div className="bg-slate-200 h-10 rounded"></div>
              <div className="bg-slate-200 h-32 rounded"></div>
            </div>
          </div>
        ) : applicantsData ? (
          <ApplicantList
            campaignId={campaignId}
            applicants={applicantsData.applicants}
            totalSlots={campaign.totalSlots}
            campaignStatus={campaign.status}
          />
        ) : null}
      </div>

      <CloseCampaignDialog
        campaignId={campaignId}
        applicantCount={campaign.applicantCount}
        open={closeCampaignDialogOpen}
        onClose={() => setCloseCampaignDialogOpen(false)}
        onSuccess={() => {
          setCloseCampaignDialogOpen(false);
        }}
      />

      <UpdateCampaignDialog
        open={editDialogOpen}
        onClose={() => setEditDialogOpen(false)}
        campaign={campaign}
        onSuccess={() => {
          setEditDialogOpen(false);
        }}
      />
    </div>
  );
}
