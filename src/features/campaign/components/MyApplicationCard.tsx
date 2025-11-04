'use client';

import Link from 'next/link';
import { Card, CardContent } from '@/components/ui/card';
import { MyApplicationItem } from '../types/campaign-types';
import { ApplicationStatusBadge } from './ApplicationStatusBadge';

interface MyApplicationCardProps {
  application: MyApplicationItem;
}

const formatDate = (dateString: string): string => {
  try {
    const date = new Date(dateString);
    return date.toLocaleDateString('ko-KR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  } catch {
    return dateString;
  }
};

const formatDateTime = (dateString: string): string => {
  try {
    const date = new Date(dateString);
    return date.toLocaleDateString('ko-KR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  } catch {
    return dateString;
  }
};

export const MyApplicationCard = ({
  application,
}: MyApplicationCardProps) => {
  return (
    <Card className="hover:shadow-lg transition-shadow">
      <CardContent className="p-6">
        <div className="flex justify-between items-start gap-4">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-2 flex-wrap">
              <Link href={`/campaigns/${application.campaign.id}`}>
                <h3 className="text-lg font-semibold hover:underline text-slate-900 break-words">
                  {application.campaign.title}
                </h3>
              </Link>
              <ApplicationStatusBadge status={application.status} />
            </div>

            <p className="text-sm text-slate-600 mb-3">
              {application.campaign.businessName}
            </p>

            <div className="space-y-2 text-sm text-slate-600 mb-4">
              <div className="flex items-center gap-2">
                <span className="font-medium">📍</span>
                <span>{application.campaign.location}</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="font-medium">🗓️</span>
                <span>방문 예정: {formatDate(application.visitDate)}</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="font-medium">📋</span>
                <span>카테고리: {application.campaign.category}</span>
              </div>
            </div>

            <div className="rounded-lg bg-blue-50 p-3 border border-blue-200 mb-4">
              <p className="text-xs font-semibold text-blue-900 mb-2">
                각오 한마디
              </p>
              <p className="text-sm text-blue-800 line-clamp-2">
                {application.applicationMessage}
              </p>
            </div>
          </div>

          <div className="flex-shrink-0 text-right">
            <p className="text-xs text-slate-500">
              지원일
            </p>
            <p className="text-xs font-medium text-slate-700">
              {formatDateTime(application.appliedAt)}
            </p>
          </div>
        </div>

        <div className="border-t border-slate-200 pt-3 mt-4">
          <div className="grid grid-cols-2 gap-2 text-xs text-slate-600">
            <div>
              <p className="font-medium">모집 기간</p>
              <p>
                {formatDate(application.campaign.recruitmentStartDate)} ~{' '}
                {formatDate(application.campaign.recruitmentEndDate)}
              </p>
            </div>
            <div>
              <p className="font-medium">체험 기간</p>
              <p>
                {formatDate(application.campaign.experienceStartDate)} ~{' '}
                {formatDate(application.campaign.experienceEndDate)}
              </p>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
