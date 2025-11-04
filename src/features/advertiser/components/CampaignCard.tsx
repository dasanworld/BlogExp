import Link from 'next/link';
import { Campaign } from '../types/advertiser-types';
import { CampaignStatusBadge } from './CampaignStatusBadge';

interface CampaignCardProps {
  campaign: Campaign;
  onEdit?: (campaign: Campaign) => void;
  onDelete?: (campaignId: string) => void;
  onCloseRecruitment?: (campaignId: string) => void;
}

export const CampaignCard = ({ campaign, onEdit, onDelete, onCloseRecruitment }: CampaignCardProps) => {
  const recruitmentStart = new Date(campaign.recruitmentStartDate);
  const recruitmentEnd = new Date(campaign.recruitmentEndDate);
  const today = new Date();

  const daysUntilEnd = Math.ceil(
    (recruitmentEnd.getTime() - today.getTime()) / (1000 * 60 * 60 * 24)
  );

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('ko-KR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  const getDDayText = () => {
    if (daysUntilEnd < 0) return '마감됨';
    if (daysUntilEnd === 0) return 'D-Day';
    return `D-${daysUntilEnd}`;
  };

  return (
    <div className="border border-slate-200 rounded-lg p-6 hover:shadow-lg transition-shadow">
      <div className="flex items-start justify-between mb-4">
        <div className="flex-1">
          <h3 className="text-lg font-bold text-slate-900 mb-2">{campaign.title}</h3>
          <p className="text-sm text-slate-500 mb-2">등록일: {formatDate(new Date(campaign.createdAt))}</p>
        </div>
        <CampaignStatusBadge status={campaign.status} />
      </div>

      <div className="mb-4 p-3 bg-slate-50 rounded">
        <p className="text-sm font-semibold text-slate-700 mb-1">모집 기간</p>
        <p className="text-sm text-slate-600">
          {formatDate(recruitmentStart)} ~ {formatDate(recruitmentEnd)}
        </p>
        <p className="text-sm font-bold text-blue-600 mt-1">{getDDayText()}</p>
      </div>

      <div className="mb-4 flex items-center gap-4">
        <div>
          <p className="text-sm text-slate-500">지원자</p>
          <p className="text-lg font-bold text-slate-900">{campaign.applicantCount}</p>
        </div>
        <div className="text-slate-300">/</div>
        <div>
          <p className="text-sm text-slate-500">모집 인원</p>
          <p className="text-lg font-bold text-slate-900">{campaign.totalSlots}</p>
        </div>
      </div>

      <div className="flex gap-2">
        <Link
          href={`/advertiser/campaigns/${campaign.id}`}
          className="flex-1 px-3 py-2 bg-blue-600 text-white rounded text-sm font-medium hover:bg-blue-700 text-center"
        >
          상세/관리
        </Link>
        {campaign.status === 'recruiting' && (
          <button
            onClick={() => onCloseRecruitment?.(campaign.id)}
            className="flex-1 px-3 py-2 border border-orange-300 text-orange-700 rounded text-sm font-medium hover:bg-orange-50"
          >
            모집 종료
          </button>
        )}
        <button
          onClick={() => onEdit?.(campaign)}
          className="flex-1 px-3 py-2 border border-slate-300 text-slate-700 rounded text-sm font-medium hover:bg-slate-50"
        >
          수정
        </button>
        <button
          onClick={() => onDelete?.(campaign.id)}
          className="flex-1 px-3 py-2 border border-red-300 text-red-700 rounded text-sm font-medium hover:bg-red-50"
        >
          삭제
        </button>
      </div>
    </div>
  );
};
