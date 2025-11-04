'use client';

import { CampaignDetailForAdvertiser } from '../types/advertiser-types';

interface CampaignDetailViewProps {
  campaign: CampaignDetailForAdvertiser;
}

export const CampaignDetailView = ({ campaign }: CampaignDetailViewProps) => {
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('ko-KR', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
    });
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'recruiting':
        return '모집 중';
      case 'closed':
        return '모집 종료';
      case 'selection_completed':
        return '선정 완료';
      default:
        return status;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'recruiting':
        return 'bg-blue-100 text-blue-800';
      case 'closed':
        return 'bg-yellow-100 text-yellow-800';
      case 'selection_completed':
        return 'bg-green-100 text-green-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="space-y-6 bg-white p-6 rounded-lg border border-slate-200">
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">{campaign.title}</h1>
          <p className="text-sm text-slate-500 mt-1">ID: {campaign.id}</p>
        </div>
        <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(campaign.status)}`}>
          {getStatusLabel(campaign.status)}
        </span>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <h3 className="text-sm font-medium text-slate-600 mb-2">모집 현황</h3>
          <p className="text-2xl font-bold text-slate-900">
            {campaign.selectedCount} / {campaign.totalSlots}명
          </p>
          <p className="text-sm text-slate-500 mt-1">지원자: {campaign.applicantCount}명</p>
        </div>
        <div>
          <h3 className="text-sm font-medium text-slate-600 mb-2">체험 기간</h3>
          <p className="text-slate-900">
            {formatDate(campaign.experienceStartDate)} ~ {formatDate(campaign.experienceEndDate)}
          </p>
        </div>
      </div>

      <div>
        <h3 className="text-sm font-medium text-slate-600 mb-2">모집 기간</h3>
        <p className="text-slate-900">
          {formatDate(campaign.recruitmentStartDate)} ~ {formatDate(campaign.recruitmentEndDate)}
        </p>
      </div>

      <div>
        <h3 className="text-sm font-medium text-slate-600 mb-2">위치</h3>
        <p className="text-slate-900">{campaign.location}</p>
      </div>

      <div>
        <h3 className="text-sm font-medium text-slate-600 mb-2">상세 설명</h3>
        <p className="text-slate-700 whitespace-pre-wrap">{campaign.description}</p>
      </div>

      <div>
        <h3 className="text-sm font-medium text-slate-600 mb-2">제공 혜택</h3>
        <p className="text-slate-700 whitespace-pre-wrap">{campaign.benefits}</p>
      </div>

      <div>
        <h3 className="text-sm font-medium text-slate-600 mb-2">미션</h3>
        <p className="text-slate-700 whitespace-pre-wrap">{campaign.mission}</p>
      </div>
    </div>
  );
};
