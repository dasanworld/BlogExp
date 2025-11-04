'use client';

import Link from 'next/link';
import Image from 'next/image';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { CampaignCard as CampaignCardType } from '../types/campaign-types';

interface CampaignCardProps {
  campaign: CampaignCardType;
}

export const CampaignCard = ({ campaign }: CampaignCardProps) => {
  const getDaysBadgeColor = (daysLeft: number) => {
    if (daysLeft <= 0) return 'bg-gray-500';
    if (daysLeft <= 3) return 'bg-red-500';
    if (daysLeft <= 7) return 'bg-yellow-500';
    return 'bg-green-500';
  };

  const getDaysBadgeText = (daysLeft: number) => {
    if (daysLeft <= 0) return '마감됨';
    if (daysLeft === 1) return 'D-1';
    return `D-${daysLeft}`;
  };

  const isRecruitmentFull = campaign.applicantCount >= campaign.totalSlots;

  return (
    <Link href={`/campaigns/${campaign.id}`}>
      <Card className="overflow-hidden transition hover:shadow-lg cursor-pointer h-full">
        <div className="aspect-video bg-gradient-to-br from-slate-200 to-slate-300 relative overflow-hidden">
          {campaign.thumbnailUrl ? (
            <Image
              src={campaign.thumbnailUrl}
              alt={campaign.title}
              fill
              className="object-cover"
            />
          ) : null}
          <div className="absolute top-3 right-3">
            <Badge className={`${getDaysBadgeColor(campaign.daysLeft)} text-white`}>
              {getDaysBadgeText(campaign.daysLeft)}
            </Badge>
          </div>
        </div>

        <div className="p-4 space-y-3">
          <div className="flex items-start justify-between gap-2">
            <div className="flex-1">
              <h3 className="font-semibold text-sm line-clamp-2 text-slate-900">
                {campaign.title}
              </h3>
              <p className="text-xs text-slate-500 mt-1">{campaign.businessName}</p>
            </div>
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between gap-2">
              <Badge variant="outline" className="text-xs">
                {campaign.category}
              </Badge>
              <span className="text-xs text-slate-500">{campaign.location}</span>
            </div>

            <div className="space-y-1">
              <div className="w-full bg-slate-200 rounded-full h-2">
                <div
                  className={`h-full rounded-full transition ${
                    isRecruitmentFull ? 'bg-red-500' : 'bg-blue-500'
                  }`}
                  style={{
                    width: `${Math.min((campaign.applicantCount / campaign.totalSlots) * 100, 100)}%`,
                  }}
                />
              </div>
              <p className="text-xs text-slate-600">
                {campaign.applicantCount} / {campaign.totalSlots}명
                {isRecruitmentFull && <span className="text-red-500 ml-1">(모집완료)</span>}
              </p>
            </div>
          </div>

          <div className="pt-2 border-t border-slate-200">
            <p className="text-xs text-slate-500">
              마감: {new Date(campaign.recruitmentEndDate).toLocaleDateString('ko-KR')}
            </p>
          </div>
        </div>
      </Card>
    </Link>
  );
};
